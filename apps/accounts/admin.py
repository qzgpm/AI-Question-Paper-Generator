from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "role", "department", "is_staff")
    list_filter = ("role", "department", "is_staff")
    search_fields = ("email", "name")
    ordering = ("email",)

    # This ensures you can edit the custom fields in the admin panel
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "role", "department")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
