from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, DoctorVerification

@receiver(post_save, sender=User)
def create_doctor_verification(sender, instance, created, **kwargs):
    if created and instance.role == 'doctor':
        DoctorVerification.objects.create(
            user=instance,
            applied_at=instance.date_joined
        )