from django.test import TestCase
from .models import User

class UserTests(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            email="test@example.com",
            name="Test User",
            password="password123"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertEqual(user.role, "faculty")
        self.assertTrue(user.is_active)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            name="Admin User",
            password="password123"
        )
        self.assertEqual(admin.role, "admin")
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_staff)
