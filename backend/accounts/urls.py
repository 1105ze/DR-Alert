from django.urls import path
from .views import signup, upload_retinal_image, login, profile, recent_retinal_images, mark_notification_read, get_notifications, verified_doctors, assign_doctor, get_retina_detail, doctor_review_cases

urlpatterns = [
    path('signup/', signup),
    path('login/', login, name='login'),
    path("retinal-images/", upload_retinal_image),
    path("profile/", profile),
    path("retina/recent/", recent_retinal_images),
    path("notifications/<int:notification_id>/read/", mark_notification_read, name="mark-notification-read"),
    path("notifications/", get_notifications),
    path("doctors/verified/", verified_doctors),
    path("assign-doctor/", assign_doctor),
    path('retina/<int:pk>/', get_retina_detail),
    path("doctor/review/", doctor_review_cases),
]