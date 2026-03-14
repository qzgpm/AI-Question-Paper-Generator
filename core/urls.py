from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path("api/dashboard/", views.dashboard, name="dashboard"),
    path("admin/", admin.site.urls),
    path("accounts/", include("apps.accounts.urls")),
    path("engine/", include("apps.engine.urls")),
    path("curriculum/", include("apps.curriculum.urls")),
    path("library/", include("apps.library.urls")),
]
