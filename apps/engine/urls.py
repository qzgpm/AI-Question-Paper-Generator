from django.urls import path
from . import views

app_name = "engine"

urlpatterns = [
    path("api/generate/", views.api_generate_paper, name="api_generate"),
    path("api/papers/<int:paper_id>/", views.paper_detail, name="paper_detail"),
    path("api/papers/<int:paper_id>/check-plagiarism/", views.api_check_plagiarism, name="api_check_plagiarism"),
    path("api/candidates/", views.api_get_candidates, name="api_get_candidates"),
    path("api/generate-candidates/", views.api_generate_candidates, name="api_generate_candidates"),
    path("api/manual-generate/", views.api_manual_generate, name="api_manual_generate"),
]
