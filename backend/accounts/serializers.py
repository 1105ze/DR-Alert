# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
import base64
from django.utils import timezone
from .models import Patient, Doctor, DoctorVerification

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(
        choices=[('patient', 'Patient'), ('doctor', 'Doctor')],
        write_only=True
    )
    specialization = serializers.CharField(required=False, allow_blank=True)
    license_image = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
            "gender",
            "date_of_birth",
            "specialization",
            "license_image",
        ]

    def create(self, validated_data):
        role = validated_data.pop("role")
        specialization = validated_data.pop("specialization", "")
        license_base64 = validated_data.pop("license_image", None)
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.role = role 
        user.set_password(password)
        user.save()

        if role == "patient":
            Patient.objects.create(user=user)

        elif role == 'doctor':
            doctor = Doctor.objects.create(
                user=user,
                specialization=specialization,
                applied_at=timezone.now()
            )

            verification = DoctorVerification.objects.create(
                doctor=doctor,
                applied_at=timezone.now()
            )

            if license_base64:
                if "," in license_base64:
                    license_base64 = license_base64.split(",")[1]

                try:
                    decoded = base64.b64decode(license_base64.strip())
                    size = len(decoded)

                    # ✅ SAVE INTO USER
                    user.license_image = decoded
                    user.license_image_size = size
                    user.save(update_fields=["license_image", "license_image_size"])

                    # ✅ SAVE INTO DOCTOR
                    doctor.license_image = decoded
                    doctor.license_image_size = size
                    doctor.save(update_fields=["license_image", "license_image_size"])

                    # ✅ SAVE INTO VERIFICATION
                    verification.license_image = decoded
                    verification.license_image_size = size
                    verification.save(update_fields=["license_image", "license_image_size"])

                except Exception as e:
                    raise serializers.ValidationError({
                        "license_image": f"Invalid base64 image: {str(e)}"
                    })


        return user
