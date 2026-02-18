from django.urls import path
from .views import topic_selector

urlpatterns = [
    path("", topic_selector, name="topic_selector"),
]
