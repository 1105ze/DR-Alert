from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer
from django.contrib.auth import authenticate
import base64
from .models import Patient, RetinalImage, User, Doctor
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes


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
        return Response({"error": "Username and password required"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "NO_ACCOUNT"}, status=404)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({"error": "INVALID_PASSWORD"}, status=401)

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
        return Response({
            "username": user.username,
            "email": user.email,
            "gender": user.gender,
            "date_of_birth": user.date_of_birth,
        })

    if request.method == "PUT":
        user.gender = request.data.get("gender", user.gender)
        user.date_of_birth = request.data.get("date_of_birth", user.date_of_birth)
        user.email = request.data.get("email", user.email)
        user.save()

        return Response({"message": "Profile updated"})
