from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


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
