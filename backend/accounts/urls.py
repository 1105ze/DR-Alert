from django.urls import path
from .views import signup, upload_retinal_image, login, profile, recent_retinal_images, mark_notification_read, get_notifications

urlpatterns = [
    path('signup/', signup),
    path('login/', login, name='login'),
    path("retinal-images/", upload_retinal_image),
    path("profile/", profile),
    path("retina/recent/", recent_retinal_images),
    path("notifications/<int:notification_id>/read/", mark_notification_read, name="mark-notification-read"),
    path("notifications/", get_notifications),
]
