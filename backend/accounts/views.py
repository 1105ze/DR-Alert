import token
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from django.contrib.auth import authenticate
import base64
from .models import MedicalDetails, Patient, RetinalImage, User, Doctor, PredictionResult, DoctorVerification, DoctorValidation
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from django.utils import timezone
from django.utils.timezone import localtime
from .models import Notification
from .serializers import DoctorSerializer
from .notification_services import create_notification
from .reporttemplates import STAGE_TEMPLATES
from django.core.mail import send_mail
from django.conf import settings
from .email_token import generate_token, verify_token
from django.http import HttpResponse
import random
from datetime import timedelta



# @api_view(['POST'])
# def signup(request):
#     print("🔥 signup view hit")
#     print("RAW request.data:", request.data)

#     serializer = SignupSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(
#             {"message": "User created successfully"},
#             status=status.HTTP_201_CREATED
#         )
#     print("❌ serializer errors:", serializer.errors)
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def signup(request):

    email = request.data.get("email")

    if User.objects.filter(email=email).exists():
        return Response({"error": "EMAIL_ALREADY_EXISTS"}, status=400)

    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():

        user = serializer.save()

        # PATIENT → email verification required
        if user.role == "patient":
            user.is_verified = False
            user.save()

            token = generate_token(user.email)

            host = request.get_host()
            verify_url = f"http://{host}/api/accounts/verify-email/{token}/"

            send_mail(
                "Verify your account",
                f"Click this link to verify your account:\n{verify_url}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )

            return Response({
                "message": "Account created. Please verify your email."
            }, status=201)

        # DOCTOR → no email verification
        else:
            user.is_verified = True
            user.save()

            return Response({
                "message": "Doctor account created. Waiting for admin verification."
            }, status=201)

    return Response(serializer.errors, status=400)


@api_view(["GET"])
def verify_email(request, token):

    email = verify_token(token)

    if not email:
        return Response({"error": "Invalid or expired link"}, status=400)

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=404)

    user.is_verified = True
    user.save()

    return HttpResponse("Email verified successfully. You can now close this page and log in to the app.")
    

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
            selected_doctor=doctor,
            retinal_image=image_bytes,
            retinal_image_size=len(image_bytes),
        )

    else:
        return Response({"error": "Invalid uploaded_by_type"}, status=400)
    
    # ===== CREATE EMPTY PREDICTION RESULT =====
    PredictionResult.objects.create(
        retinal_image=retinal_image,
        predicted_dr_stage="Moderate",  # temporary mock
        confidence_score=0.80,
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
    
    if not user.is_verified:
        return Response(
            {"error": "EMAIL_NOT_VERIFIED"},
            status=403
        )

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
        ).prefetch_related(
            "predictions",
            "predictions__validations"
        ).order_by("-created_at")

    elif user.role == "doctor":
        images = RetinalImage.objects.filter(
            doctor__user=user
        ).prefetch_related(
            "predictions",
            "predictions__validations"
        ).order_by("-created_at")

    else:
        return Response([])

    data = []

    for img in images:
        prediction = img.predictions.order_by("-prediction_date").first()

        validated = False
        stage_to_show = None

        if prediction:
            validation = prediction.validations.order_by("-validation_date").first()

            if validation:
                validated = True
                stage_to_show = validation.final_dr_stage
            else:
                stage_to_show = prediction.predicted_dr_stage

        data.append({
            "id": img.id,
            "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
            "created_at": img.created_at,
            "predicted_stage": stage_to_show,
            "validated": validated
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
            "target_page": n.target_page,   # ADD
            "target_id": n.target_id,
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

    prediction = PredictionResult.objects.filter(
        retinal_image=retinal_image
    ).first()

    dr_stage = prediction.predicted_dr_stage if prediction else "Unknown"

    message = (
        f"New Case Assigned\n"
        f"Patient: {patient_name}\n"
        f"Uploaded: {uploaded_time}\n"
        f"DR Stage: {dr_stage}\n"
        f"Action: Review retinal image"
    )

    # 🔔 Send notification ONLY once when new doctor assigned
    create_notification(
        receiver=doctor.user,
        receiver_role="doctor",
        message=message,
        target_page="doctor_review_case",
        target_id=retinal_image.id
    )

    return Response({"success": True})


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

    # ===== FIX START =====
    if validation:
        validated = True
        final_stage = validation.final_dr_stage
        report_data = validation.report_data
    else:
        validated = False
        final_stage = None
        if prediction and prediction.predicted_dr_stage:
            report_data = STAGE_TEMPLATES.get(prediction.predicted_dr_stage)
        else:
            report_data = None
    # ===== FIX END =====

    # Determine uploader user
    if retina.uploaded_by_type == "patient" and retina.patient:
        uploader_user = retina.patient.user
    elif retina.uploaded_by_type == "doctor" and retina.doctor:
        uploader_user = retina.doctor.user
    else:
        uploader_user = None

    medical_details = MedicalDetails.objects.filter(
        patient=retina.patient
    ).first()

    data = {
        "id": retina.id,
        "image_base64": base64.b64encode(retina.retinal_image).decode("utf-8"),
        "created_at": retina.created_at,

        "prediction_id": prediction.id if prediction else None,
        "predicted_stage": prediction.predicted_dr_stage if prediction else None,
        "confidence": prediction.confidence_score if prediction else None,

        # NEW
        "validated": validated,
        "doctor_final_stage": final_stage,
        "doctor_comments": validation.doctor_comments if validation else None,
        "digital_signature": validation.digital_signature if validation else None,
        "validation_date": validation.validation_date if validation else None,
        "report_data": report_data,

        "medical_details": {
            "conditions": medical_details.medical_conditions if medical_details else None,
            "symptoms": medical_details.vision_symptoms if medical_details else None,
            "notes": medical_details.additional_notes if medical_details else None,
        } if medical_details else None,

        "assigned_doctor": (
            DoctorSerializer(retina.selected_doctor).data
            if retina.selected_doctor
            else None
        ),
        "uploader": {
            "username": uploader_user.username if uploader_user else None,
            "gender": uploader_user.gender if uploader_user else None,
            "date_of_birth": uploader_user.date_of_birth if uploader_user else None,
            "role": uploader_user.role if uploader_user else None,
            "email": uploader_user.email if uploader_user else None,
        } if uploader_user else None,
    }

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def doctor_review_cases(request):
    user = request.user

    if user.role != "doctor":
        return Response([], status=403)

    doctor = Doctor.objects.get(user=user)

    images = RetinalImage.objects.filter(
        selected_doctor=doctor,
        uploaded_by_type="patient"
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

    # # ✅ CREATE VALIDATION (NO BASE64)
    # DoctorValidation.objects.create(
    #     prediction=prediction,
    #     doctor=doctor,
    #     final_dr_stage=final_stage,
    #     doctor_comments=comment,
    #     digital_signature=signature_text,   # store as text
    #     validation_date=timezone.now()
    # )

    template = STAGE_TEMPLATES.get(final_stage)

    if not template:
        return Response({"error": "Invalid stage"}, status=400)

    validation = DoctorValidation.objects.create(
        prediction=prediction,
        doctor=doctor,
        final_dr_stage=final_stage,
        doctor_comments=comment,
        digital_signature=signature_text,
        validation_date=timezone.now(),
        report_data=template
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
        uploaded_by_type="patient",
        predictions__validations__doctor=doctor
    ).select_related(
        "patient__user"
    ).prefetch_related(
        "predictions"
    ).distinct().order_by("-created_at")

    data = []

    for img in images:
        prediction = img.predictions.first()

        validation = None
        if prediction:
            validation = DoctorValidation.objects.filter(
                prediction=prediction,
                doctor=doctor
            ).first()

        data.append({
            "id": img.id,
            "image_base64": base64.b64encode(img.retinal_image).decode("utf-8"),
            "created_at": img.created_at,
            "patient_name": img.patient.user.username if img.patient else None,
            "prediction_id": prediction.id if prediction else None,
            "predicted_stage": prediction.predicted_dr_stage if prediction else None,
            "confidence": prediction.confidence_score if prediction else None,
            "doctor_final_stage": validation.final_dr_stage if validation else None,
            "validated_at": validation.validation_date if validation else None,
        })

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notification_count(request):
    count = Notification.objects.filter(
        receiver=request.user,
        is_read=False
    ).count()

    return Response({"unread_count": count})


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_report(request, prediction_id):

    user = request.user

    if user.role != "doctor":
        return Response({"error": "Unauthorized"}, status=403)

    try:
        validation = DoctorValidation.objects.select_related(
            "prediction__retinal_image__selected_doctor"
        ).get(prediction_id=prediction_id)

        doctor = Doctor.objects.get(user=user)

    except DoctorValidation.DoesNotExist:
        return Response({"error": "Report not found"}, status=404)

    # ensure same doctor
    if validation.doctor != doctor:
        return Response({"error": "Unauthorized"}, status=403)

    new_report = request.data.get("report_data")

    if not new_report:
        return Response({"error": "report_data required"}, status=400)

    validation.report_data = new_report
    validation.save()

    return Response({"message": "Report updated successfully"})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_medical_details(request):

    user = request.user

    conditions = request.data.get("conditions")
    symptoms = request.data.get("symptoms")
    notes = request.data.get("notes")

    if user.role == "patient":
        patient = user.patient_profile

        obj, created = MedicalDetails.objects.update_or_create(
            patient=patient,
            defaults={
                "selected_role": "patient",
                "medical_conditions": conditions,
                "vision_symptoms": symptoms,
                "additional_notes": notes
            }
        )

    elif user.role == "doctor":
        doctor = user.doctor_profile

        obj, created = MedicalDetails.objects.update_or_create(
            doctor=doctor,
            defaults={
                "selected_role": "doctor",
                "medical_conditions": conditions,
                "vision_symptoms": symptoms,
                "additional_notes": notes
            }
        )

    return Response({"status": "saved"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_medical_details(request):

    user = request.user

    if user.role == "patient":
        patient = user.patient_profile
        obj = MedicalDetails.objects.filter(patient=patient).first()

    elif user.role == "doctor":
        doctor = user.doctor_profile
        obj = MedicalDetails.objects.filter(doctor=doctor).first()

    else:
        obj = None

    if not obj:
        return Response({})

    return Response({
        "conditions": obj.medical_conditions,
        "symptoms": obj.vision_symptoms,
        "notes": obj.additional_notes
    })


@api_view(["POST"])
def send_reset_code(request):

    email = request.data.get("email")

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "Email not found"}, status=404)

    code = str(random.randint(1000, 9999))

    user.reset_code = code
    user.reset_code_expire = timezone.now() + timedelta(minutes=10)
    user.save()

    send_mail(
        "Password Reset Code",
        f"Your verification code is: {code}",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return Response({"message": "Verification code sent"})


@api_view(["POST"])
def verify_reset_code(request):

    email = request.data.get("email")
    code = request.data.get("code")

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=404)

    if user.reset_code != code:
        return Response({"error": "Invalid code"}, status=400)

    if timezone.now() > user.reset_code_expire:
        return Response({"error": "Code expired"}, status=400)

    user.reset_code = None
    user.save()

    return Response({"message": "Code verified"})


@api_view(["POST"])
def reset_password(request):

    email = request.data.get("email")
    password = request.data.get("password")

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "User not found"}, status=404)

    if user.reset_code is not None:
        return Response({"error": "OTP not verified"}, status=400)

    user.set_password(password)
    user.reset_code = None
    user.reset_code_expire = None
    user.save()

    return Response({"message": "Password updated"})