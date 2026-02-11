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
