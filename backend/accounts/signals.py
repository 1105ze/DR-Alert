# from django.db.models.signals import post_save
# from django.dispatch import receiver

# from .models import (
#     PredictionResult,
#     DoctorValidation,
#     DoctorVerification,
# )
# from .notification_services import create_notification

# @receiver(post_save, sender=PredictionResult)
# def notify_patient_prediction_ready(sender, instance, created, **kwargs):
#     if not created:
#         return

#     retinal_image = instance.retinal_image
#     patient = retinal_image.patient.user

#     create_notification(
#         receiver=patient,
#         receiver_role='patient',
#         title='Prediction Result Ready',
#         message='Your retinal image has been analyzed. A result is now available.',
#         related_object=instance,
#     )

# @receiver(post_save, sender=DoctorValidation)
# def notify_patient_doctor_reviewed(sender, instance, created, **kwargs):
#     if not created:
#         return

#     prediction = instance.prediction
#     patient = prediction.retinal_image.patient.user

#     create_notification(
#         receiver=patient,
#         receiver_role='patient',
#         title='Doctor Review Completed',
#         message='A doctor has reviewed your retinal image and provided a diagnosis.',
#         related_object=instance,
#     )

# @receiver(post_save, sender=DoctorVerification)
# def notify_doctor_verification_result(sender, instance, created, **kwargs):
#     if created:
#         return

#     doctor_user = instance.doctor.user

#     if instance.status == 'verified':
#         create_notification(
#             receiver=doctor_user,
#             receiver_role='doctor',
#             title='Account Approved',
#             message='Your doctor account has been approved. You may now access patient cases.',
#             related_object=instance,
#         )

#     elif instance.status == 'rejected':
#         create_notification(
#             receiver=doctor_user,
#             receiver_role='doctor',
#             title='Account Rejected',
#             message='Your doctor account has been rejected. Please contact the administrator.',
#             related_object=instance,
#         )

# @receiver(post_save, sender=PredictionResult)
# def notify_doctors_new_case(sender, instance, created, **kwargs):
#     if not created:
#         return

#     from .models import Doctor

#     verified_doctors = Doctor.objects.filter(
#         verification__status='verified'
#     ).select_related('user')

#     for doctor in verified_doctors:
#         create_notification(
#             receiver=doctor.user,
#             receiver_role='doctor',
#             title='New Case Available',
#             message='A new retinal image is available for medical review.',
#             related_object=instance,
#         )


from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import (
    PredictionResult,
    DoctorValidation,
    DoctorVerification
)

from .notification_services import create_notification


@receiver(post_save, sender=PredictionResult)
def notify_patient_prediction_ready(sender, instance, created, **kwargs):
    if not created:
        return

    retinal_image = instance.retinal_image
    if retinal_image and retinal_image.patient:
        create_notification(
            receiver=retinal_image.patient.user,
            receiver_role='patient',
            message="Your retinal image has been analyzed. A preliminary result is available."
        )

@receiver(post_save, sender=DoctorValidation)
def notify_patient_doctor_validation(sender, instance, created, **kwargs):
    if not created:
        return

    prediction = instance.prediction
    retinal_image = prediction.retinal_image

    if retinal_image and retinal_image.patient:
        create_notification(
            receiver=retinal_image.patient.user,
            receiver_role='patient',
            message="A doctor has reviewed your retinal image and provided a diagnosis."
        )

@receiver(pre_save, sender=DoctorValidation)
def cache_old_comment(sender, instance, **kwargs):
    if instance.pk:
        instance._old_comment = sender.objects.get(pk=instance.pk).doctor_comments
    else:
        instance._old_comment = None


@receiver(post_save, sender=DoctorValidation)
def notify_patient_doctor_comment(sender, instance, created, **kwargs):
    if created:
        return

    if instance._old_comment != instance.doctor_comments and instance.doctor_comments:
        retinal_image = instance.prediction.retinal_image
        if retinal_image and retinal_image.patient:
            create_notification(
                receiver=retinal_image.patient.user,
                receiver_role='patient',
                message="The doctor has added medical notes to your diagnosis."
            )


@receiver(pre_save, sender=DoctorVerification)
def cache_old_status(sender, instance, **kwargs):
    if instance.pk:
        instance._old_status = sender.objects.get(pk=instance.pk).status
    else:
        instance._old_status = None


@receiver(post_save, sender=DoctorVerification)
def notify_doctor_approved_or_rejected(sender, instance, **kwargs):
    if instance._old_status == instance.status:
        return

    doctor_user = instance.doctor.user

    if instance.status == 'verified':
        create_notification(
            receiver=doctor_user,
            receiver_role='doctor',
            message="Your doctor account has been approved. You can now access patient cases."
        )

    elif instance.status == 'rejected':
        create_notification(
            receiver=doctor_user,
            receiver_role='doctor',
            message="Your doctor account has been rejected. Please contact the administrator."
        )


from .models import Doctor

@receiver(post_save, sender=PredictionResult)
def notify_doctors_new_case(sender, instance, created, **kwargs):
    if not created:
        return

    approved_doctors = Doctor.objects.filter(
        verification__status='verified'
    )

    for doctor in approved_doctors:
        create_notification(
            receiver=doctor.user,
            receiver_role='doctor',
            message="A new retinal image is available for medical review."
        )
