from .models import Notification

def create_notification(receiver, receiver_role, message, target_page=None, target_id=None):
    """
    Centralized notification creator
    """
    if receiver is None:
        return

    Notification.objects.create(
        receiver=receiver,
        receiver_role=receiver_role,
        message=message,
        target_page=target_page,
        target_id=target_id
    )
