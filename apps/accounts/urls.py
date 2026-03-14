from django.urls import path
from . import views

app_name = "accounts"

urlpatterns = [
    path("api/csrf/", views.api_get_csrf_token, name="api_csrf"),
    path("api/register/", views.api_register, name="api_register"),
    path("api/login/", views.api_login, name="api_login"),
    path("api/logout/", views.api_logout, name="api_logout"),
    path("api/me/", views.api_get_current_user, name="api_me"),
]
