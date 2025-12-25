from rest_framework import serializers
from django.contrib.auth import get_user_model
import base64

User = get_user_model()

class SignupSerializer(serializers.ModelSerializer):
    license_image = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    password = serializers.CharField(write_only=True)

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

    def validate(self, data):
        role = data.get('role')
        license_image = data.get('license_image')
        if role == 'doctor' and not license_image:
            raise serializers.ValidationError({
                'license_image': 'Medical license is required for doctor accounts.'
            })
        return data

    def create(self, validated_data):
        image_base64 = validated_data.pop("license_image", None)
        password = validated_data.pop("password")

        # Create user first (always)
        user = User(**validated_data)
        user.set_password(password)

        print("DEBUG: role =", user.role)
        print("DEBUG: license_image present?", bool(image_base64))

        if image_base64:
            print("DEBUG: base64 length =", len(image_base64))
            try:
                # Strip prefix if present (common in base64 from ImagePicker)
                if image_base64.startswith('data:image/'):
                    print("DEBUG: stripping data URI prefix")
                    image_base64 = image_base64.split(',')[1]
                # Decode
                decoded = base64.b64decode(image_base64.strip() + '===')  # Add padding if needed
                print("DEBUG: decoded bytes length =", len(decoded))
                user.license_image = decoded
            except Exception as e:
                print("ERROR decoding image:", str(e))
                # Still save user, but without image + return error? Or raise to fail signup
                # For now, raise to frontend
                raise serializers.ValidationError({"license_image": f"Invalid image data: {str(e)}"})
        
        user.save()
        return user