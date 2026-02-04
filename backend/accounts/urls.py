from django.urls import path
from .views import signup, upload_retinal_image, login, profile

urlpatterns = [
    path('signup/', signup),
    path('login/', login, name='login'),
    path("retinal-images/", upload_retinal_image),
    path("profile/", profile),

]
