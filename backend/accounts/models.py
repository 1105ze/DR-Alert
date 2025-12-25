from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ("patient", "Patient"),
        ("doctor", "Doctor"),
    )

    GENDER_CHOICES = (
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)

    specialization = models.CharField(
        max_length=100, null=True, blank=True
    )

    license_image = models.BinaryField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.username

class DoctorVerification(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_verification',
        limit_choices_to={'role': 'doctor'},
        verbose_name="Doctor"
    )

    applied_at = models.DateTimeField(
        default=timezone.now,
        verbose_name="Application Date"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name="Verification Status"
    )

    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_doctors',
        verbose_name="Verified By",
        limit_choices_to={'is_staff': True}  # Only staff/admins can verify
    )

    verified_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Verified Date"
    )

    # NEW: Reason (for rejection or notes)
    reason = models.TextField(
        blank=True,
        verbose_name="Reason / Notes (e.g. rejection reason)"
    )

    class Meta:
        verbose_name = "Doctor Verification"
        verbose_name_plural = "Doctor Verifications"
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_status_display()}"

    def approve(self, verifier):
        """Mark as verified by this user"""
        self.status = 'verified'
        self.verified_by = verifier
        self.verified_at = timezone.now()
        self.reason = ""  # clear rejection reason if any
        self.save()

    def reject(self, verifier, reason=""):
        """Mark as rejected with a reason"""
        self.status = 'rejected'
        self.verified_by = verifier
        self.verified_at = timezone.now()
        self.reason = reason
        self.save()