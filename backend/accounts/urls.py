from django.urls import path
<<<<<<< HEAD
from .views import signup, upload_retinal_image, login
=======
from .views import signup, upload_retinal_image, login, profile, recent_retinal_images, mark_notification_read, get_notifications
>>>>>>> 68f28fc0c08a7201d700079d57bbd9b1d18e011b

urlpatterns = [
    path('signup/', signup),
    path('login/', login, name='login'),
    path("retinal-images/", upload_retinal_image),
<<<<<<< HEAD

=======
    path("profile/", profile),
    path("retina/recent/", recent_retinal_images),
    path("notifications/<int:notification_id>/read/", mark_notification_read, name="mark-notification-read"),
    path("notifications/", get_notifications),
>>>>>>> 68f28fc0c08a7201d700079d57bbd9b1d18e011b
]
