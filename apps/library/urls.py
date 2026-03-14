from django.urls import path
from . import views

app_name = "library"

urlpatterns = [
    path("api/questions/", views.api_question_list, name="api_question_list"),
    path("api/questions/<int:question_id>/delete/", views.api_delete_question, name="api_delete_question"),
]
