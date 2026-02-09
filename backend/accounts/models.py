from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import base64
from django.utils.html import format_html
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    gender = models.CharField(
        max_length=10,
        choices=(("male", "Male"), ("female", "Female"), ("other", "Other")),
        blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    license_image = models.BinaryField(null=True, blank=True)
    license_image_size = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.username


class Patient(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Patient: {self.user.username}"


class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="doctor_profile")
    specialization = models.CharField(max_length=100)
    status = models.CharField(max_length=20, default="pending")
    applied_at = models.DateTimeField(auto_now_add=True)

    license_image = models.BinaryField(null=True, blank=True)
    license_image_size = models.IntegerField(null=True, blank=True)



    def __str__(self):
        return self.user.username


class DoctorVerification(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    doctor = models.OneToOneField(
        Doctor,
        on_delete=models.CASCADE,
        related_name='verification'
    )

    applied_at = models.DateTimeField(default=timezone.now)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    license_image = models.BinaryField(null=True, blank=True)

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_doctors'
    )

    verified_at = models.DateTimeField(null=True, blank=True)
    reason = models.TextField(blank=True)
    license_image_size = models.IntegerField(null=True, blank=True)


    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.doctor.user.username} - {self.status}"

    def approve(self, verifier):
        self.status = 'verified'
        self.verified_by = verifier
        self.verified_at = timezone.now()
        self.save()

    def reject(self, verifier, reason=""):
        self.status = 'rejected'
        self.verified_by = verifier
        self.verified_at = timezone.now()
        self.reason = reason
        self.save()

class RetinalImage(models.Model):
    UPLOADER_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
    )

    uploaded_by_type = models.CharField(
        max_length=10,
        choices=UPLOADER_CHOICES
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='retinal_images'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='retinal_images'
    )

    uploaded_at = models.DateTimeField(default=timezone.now)

    retinal_image = models.BinaryField(null=True, blank=True)
    retinal_image_size = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def uploader_name(self):
        if self.uploaded_by_type == 'patient' and self.patient:
            return self.patient.user.username
        if self.uploaded_by_type == 'doctor' and self.doctor:
            return self.doctor.user.username
        return "-"

    def __str__(self):
        return f"Retinal Image by {self.uploader_name()} on {self.uploaded_at.strftime('%Y-%m-%d')}"


class PredictionResult(models.Model):
    retinal_image = models.ForeignKey(
        RetinalImage,
        on_delete=models.CASCADE,
        related_name='predictions'
    )

    predicted_dr_stage = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    confidence_score = models.FloatField(
        null=True,
        blank=True
    )

    ai_report = models.TextField(
        null=True,
        blank=True
    )

    gradcam_data = models.BinaryField(
        null=True,
        blank=True
    )

    prediction_date = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prediction #{self.id}"
    
    def retinal_image_preview(self, obj):
        if not obj.retinal_image or not obj.retinal_image.retinal_image:
            return "No image"

        b64 = base64.b64encode(obj.retinal_image.retinal_image).decode()
        return format_html(
            '<img src="data:image/jpeg;base64,{}" style="max-height:300px; border-radius:6px;" />',
            b64
        )

    retinal_image_preview.short_description = "Retinal Image Preview"
    

class DoctorValidation(models.Model):
    prediction = models.ForeignKey(
        PredictionResult,
        on_delete=models.CASCADE,
        related_name='validations'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='validations'
    )

    final_dr_stage = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    doctor_comments = models.TextField(
        null=True,
        blank=True
    )

    validation_date = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Validation #{self.id}"

    

class Notification(models.Model):
    ROLE_CHOICES = (
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
    )

    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )

    receiver_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.receiver_role} | {self.message[:30]}"
