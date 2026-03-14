from django.test import TestCase
from .ai_service import HuggingFaceService

class AIServiceTests(TestCase):
    def test_service_initialization(self):
        service = HuggingFaceService()
        self.assertIsNotNone(service.client)
        self.assertTrue(len(service.models) > 0)
