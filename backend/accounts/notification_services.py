# from accounts.models import Notification

# def create_notification(
#     *,
#     user,
#     notification_type,
#     title,
#     message,
#     related_object_id=None
# ):
#     return Notification.objects.create(
#         user=user,
#         notification_type=notification_type,
#         title=title,
#         message=message,
#         related_object_id=related_object_id
#     )

from .models import Notification

def create_notification(receiver, receiver_role, message):
    """
    Centralized notification creator
    """
    if receiver is None:
        return

    Notification.objects.create(
        receiver=receiver,
        receiver_role=receiver_role,
        message=message
    )


# def create_notification(
#     *,
#     receiver,
#     receiver_role,
#     title,
#     message,
#     related_object=None
# ):
#     Notification.objects.create(
#         receiver=receiver,
#         receiver_role=receiver_role,
#         title=title,
#         message=message,
#         related_object_type=related_object.__class__.__name__ if related_object else None,
#         related_object_id=related_object.id if related_object else None,
#     )