from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from django.contrib.auth import authenticate
import base64
from .models import Patient, RetinalImage, User, Doctor, PredictionResult, DoctorVerification, DoctorValidation
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.utils import timezone
from django.utils.timezone import localtime
from .models import Notification
from .serializers import DoctorSerializer
from .notification_services import create_notification


@api_view(['POST'])
def signup(request):
    print("🔥 signup view hit")
    print("RAW request.data:", request.data)

    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User created successfully"},
            status=status.HTTP_201_CREATED
        )
    print("❌ serializer errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def upload_retinal_image(request):
    print("🧠 upload_retinal_image hit")
    print("RAW request data:", request.data)

    image_data = request.data.get("image_data")
    uploaded_by_type = request.data.get("uploaded_by_type")
    uploaded_by_id = request.data.get("uploaded_by_id")

    if not image_data:
        return Response({"error": "image_data is required"}, status=400)

    try:
        image_bytes = base64.b64decode(image_data)
    except Exception:
        return Response({"error": "Invalid base64 image data"}, status=400)

    # ✅ PATIENT upload
    if uploaded_by_type == "patient":
        try:
            patient = Patient.objects.get(user_id=uploaded_by_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found"}, status=404)

        retinal_image = RetinalImage.objects.create(
            uploaded_by_type="patient",
            patient=patient,
            retinal_image=image_bytes,
            retinal_image_size=len(image_bytes),
        )

    # ✅ DOCTOR upload
    elif uploaded_by_type == "doctor":
        try:
            doctor = Doctor.objects.get(user_id=uploaded_by_id)
        except Doctor.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        retinal_image = RetinalImage.objects.create(
            uploaded_by_type="doctor",
            doctor=doctor,
            retinal_image=image_bytes,
            retinal_image_size=len(image_bytes),
        )

    else:
        return Response({"error": "Invalid uploaded_by_type"}, status=400)
    
    # ===== CREATE EMPTY PREDICTION RESULT =====
    PredictionResult.objects.create(
        retinal_image=retinal_image,
        prediction_date=timezone.now()
    )

    return Response(
        {
            "message": "Retinal image uploaded successfully",
            "retinal_image_id": retinal_image.id,
        },
        status=201
    )


@api_view(['POST'])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Username and password required"},
            status=400
        )

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "NO_ACCOUNT"}, status=404)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "INVALID_PASSWORD"}, status=401)

    # 🔒 BLOCK doctors who are not verified
    if user.role == "doctor":
        try:
            doctor = Doctor.objects.get(user=user)
            verification = DoctorVerification.objects.filter(
                doctor=doctor
            ).first()

            if not verification or verification.status != "verified":
                return Response(
                    {
                        "error": "DOCTOR_NOT_VERIFIED",
                        "status": verification.status if verification else "pending"
                    },
                    status=403
                )
        except Doctor.DoesNotExist:
            return Response(
                {"error": "DOCTOR_PROFILE_MISSING"},
                status=403
            )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
        }
    })


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    if request.method == "GET":
        data = {
            "username": user.username,
            "email": user.email,
            "gender": user.gender,
            "date_of_birth": user.date_of_birth,
        }

        if user.profile_image:
            data["profile_image"] = (
                "data:image/jpeg;base64,"
                + base64.b64encode(user.profile_image).decode()
            )
        else:
            data["profile_image"] = None

        if user.role == "doctor":
            doctor = Doctor.objects.get(user=user)

            data["specialist"] = doctor.specialization

            verification = DoctorVerification.objects.filter(
                doctor=doctor
            ).first()
            data["verification_status"] = (
                verification.status if verification else "pending"
            )

            if verification and verification.license_image:
                data["license_base64"] = (
                    "data:image/jpeg;base64,"
                    + base64.b64encode(verification.license_image).decode()
                )
            else:
                data["license_base64"] = None

        return Response(data)

    if request.method == "PUT":
        user.gender = request.data.get("gender", user.gender)
        user.date_of_birth = request.data.get(
            "date_of_birth", user.date_of_birth
        )
        user.email = request.data.get("email", user.email)

        profile_image = request.data.get("profile_image")
        if profile_image:
            image_bytes = base64.b64decode(profile_image)
            user.profile_image = image_bytes
            user.profile_image_size = len(image_bytes)

        user.save()

        if user.role == "doctor":
            doctor = Doctor.objects.get(user=user)
            doctor.specialization = request.data.get(
                "specialist", doctor.specialization
            )
            doctor.save()

        return Response({"message": "Profile updated"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_retinal_images(request):
    user = request.user

    if user.role == "patient":
        images = RetinalImage.objects.filter(
            patient__user=user
        ).order_by("-created_at")[:5]

    elif user.role == "doctor":
        images = RetinalImage.objects.filter(
            doctor__user=user
        ).order_by("-created_at")[:5]

    else:
        return Response([])

    data = []
    for img in images:
        data.append({
            "id": img.id,
            "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
            "created_at": img.created_at,
        })

    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = Notification.objects.get(
            id=notification_id,
            receiver=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({"success": True})
    except Notification.DoesNotExist:
        return Response({"error": "Notification not found"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = Notification.objects.filter(
        receiver=request.user
    ).order_by('-sent_at')

    data = [
        {
            "id": n.id,
            "message": n.message,
            "is_read": n.is_read,
            "sent_at": n.sent_at,
            "receiver_role": n.receiver_role,
        }
        for n in notifications
    ]

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verified_doctors(request):
    doctors = Doctor.objects.filter(
        verification__status="verified"
    ).select_related("user")

    data = []
    for d in doctors:
        if d.user.profile_image:
            profile_image = (
                "data:image/jpeg;base64,"
                + base64.b64encode(d.user.profile_image).decode()
            )
        else:
            profile_image = None

        data.append({
            "id": d.id,
            "name": d.user.username,
            "email": d.user.email,
            "specialization": d.specialization,
            "profile_image": profile_image,  # ✅ ADD THIS
        })

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def assign_doctor(request):
    retinal_image_id = request.data.get("retinal_image_id")
    doctor_id = request.data.get("doctor_id")

    if not retinal_image_id or not doctor_id:
        return Response({"error": "Missing data"}, status=400)

    try:
        retinal_image = RetinalImage.objects.get(id=retinal_image_id)
        doctor = Doctor.objects.get(id=doctor_id)
    except (RetinalImage.DoesNotExist, Doctor.DoesNotExist):
        return Response({"error": "Not found"}, status=404)

    # 🚫 If same doctor already selected → do nothing
    if retinal_image.selected_doctor and retinal_image.selected_doctor.id == doctor.id:
        return Response({"message": "Doctor already assigned"})

    # Save selected doctor
    retinal_image.selected_doctor = doctor
    retinal_image.save()

    patient_name = (
    retinal_image.patient.user.username
    if retinal_image.patient else "Unknown"
    )
    
    uploaded_time = localtime(retinal_image.created_at).strftime("%d/%m/%Y %I:%M %p")

    message = (
        f"New Case Assigned\n"
        f"Patient: {patient_name}\n"
        f"Uploaded: {uploaded_time}\n"
        f"Action: Review retinal image"
    )

    # 🔔 Send notification ONLY once when new doctor assigned
    create_notification(
        receiver=doctor.user,
        receiver_role="doctor",
        message=message
    )

    return Response({"success": True})


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_retina_detail(request, pk):
#     user = request.user

#     try:
#         retina = RetinalImage.objects.get(id=pk)
#     except RetinalImage.DoesNotExist:
#         return Response({"error": "Not found"}, status=404)

#     if user.role == "patient":
#         if not retina.patient or retina.patient.user != user:
#             return Response({"error": "Unauthorized"}, status=403)

#     elif user.role == "doctor":
#         if not (
#             (retina.doctor and retina.doctor.user == user) or
#             (retina.selected_doctor and retina.selected_doctor.user == user)
#         ):
#             return Response({"error": "Unauthorized"}, status=403)

#     else:
#         return Response({"error": "Unauthorized"}, status=403)

#     data = {
#         "id": retina.id,
#         "image_base64": base64.b64encode(retina.retinal_image).decode("utf-8"),
#         "created_at": retina.created_at,
#         "assigned_doctor": (
#             DoctorSerializer(retina.selected_doctor).data
#             if retina.selected_doctor
#             else None
#         )
#     }

#     return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_retina_detail(request, pk):
    user = request.user

    try:
        retina = RetinalImage.objects.prefetch_related(
            "predictions",
            "predictions__validations"
        ).get(id=pk)
    except RetinalImage.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

    # access control (keep your existing logic)

    prediction = retina.predictions.order_by("-created_at").first()

    validation = None
    if prediction:
        validation = DoctorValidation.objects.filter(
            prediction=prediction
        ).first()

    data = {
        "id": retina.id,
        "image_base64": base64.b64encode(retina.retinal_image).decode("utf-8"),
        "created_at": retina.created_at,

        "prediction_id": prediction.id if prediction else None,
        "predicted_stage": prediction.predicted_dr_stage if prediction else None,
        "confidence": prediction.confidence_score if prediction else None,

        # NEW
        "validated": True if validation else False,
        "doctor_final_stage": validation.final_dr_stage if validation else None,
        "doctor_comments": validation.doctor_comments if validation else None,
        "digital_signature": validation.digital_signature if validation else None,
        "validation_date": validation.validation_date if validation else None,
    }

    return Response(data)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def doctor_review_cases(request):
#     user = request.user

#     if user.role != "doctor":
#         return Response([], status=403)

#     images = RetinalImage.objects.filter(
#         selected_doctor__user=user
#     ).select_related("patient__user").order_by("-created_at")

#     data = []
#     for img in images:
#         data.append({
#             "id": img.id,
#             "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
#             "created_at": img.created_at,
#             "patient_name": img.patient.user.username if img.patient else None,
#         })

#     return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_review_cases(request):
    user = request.user

    if user.role != "doctor":
        return Response([], status=403)

    doctor = Doctor.objects.get(user=user)

    images = RetinalImage.objects.filter(
        selected_doctor=doctor
    ).exclude(
        predictions__validations__doctor=doctor
    ).select_related(
        "patient__user"
    ).prefetch_related(
        "predictions"
    ).order_by("-created_at")

    data = []

    for img in images:
        prediction = img.predictions.first()

        data.append({
            "id": img.id,
            "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
            "created_at": img.created_at,
            "patient_name": img.patient.user.username if img.patient else None,
            "prediction_id": prediction.id if prediction else None,
            "predicted_stage": prediction.predicted_dr_stage if prediction else None,
            "confidence": prediction.confidence_score if prediction else None,
        })

    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_doctor_validation(request):

    user = request.user

    if user.role != "doctor":
        return Response({"error": "Unauthorized"}, status=403)

    prediction_id = request.data.get("prediction_id")
    comment = request.data.get("doctor_comments")
    final_stage = request.data.get("doctor_final_stage")
    signature_text = request.data.get("digital_signature")

    if not prediction_id:
        return Response({"error": "Prediction ID required"}, status=400)

    try:
        prediction = PredictionResult.objects.select_related(
            "retinal_image__selected_doctor"
        ).get(id=prediction_id)

        doctor = Doctor.objects.get(user=user)

    except (PredictionResult.DoesNotExist, Doctor.DoesNotExist):
        return Response({"error": "Not found"}, status=404)

    # Ensure doctor is assigned
    if prediction.retinal_image.selected_doctor != doctor:
        return Response({"error": "Unauthorized case"}, status=403)

    # Prevent duplicate validation
    if DoctorValidation.objects.filter(
        prediction=prediction,
        doctor=doctor
    ).exists():
        return Response({"error": "Already validated"}, status=400)

    # ✅ CREATE VALIDATION (NO BASE64)
    DoctorValidation.objects.create(
        prediction=prediction,
        doctor=doctor,
        final_dr_stage=final_stage,
        doctor_comments=comment,
        digital_signature=signature_text,   # store as text
        validation_date=timezone.now()
    )

    # Notify patient
    retinal = prediction.retinal_image
    if retinal.patient:
        create_notification(
            receiver=retinal.patient.user,
            receiver_role="patient",
            message="Your case has been reviewed by doctor."
        )

    return Response({"message": "Validation submitted"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_history_cases(request):
    user = request.user

    if user.role != "doctor":
        return Response([], status=403)

    doctor = Doctor.objects.get(user=user)

    images = RetinalImage.objects.filter(
        selected_doctor=doctor,
        predictions__validations__doctor=doctor
    ).select_related(
        "patient__user"
    ).prefetch_related(
        "predictions"
    ).distinct().order_by("-created_at")

    data = []

    for img in images:
        prediction = img.predictions.first()

        data.append({
            "id": img.id,
            "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
            "created_at": img.created_at,
            "patient_name": img.patient.user.username if img.patient else None,
            "prediction_id": prediction.id if prediction else None,
            "predicted_stage": prediction.predicted_dr_stage if prediction else None,
            "confidence": prediction.confidence_score if prediction else None,
        })

    return Response(data)