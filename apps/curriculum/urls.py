from django.urls import path
from . import views

app_name = "curriculum"

urlpatterns = [
    path("", views.course_list, name="course_list"),
    path("add/", views.add_course, name="add_course"),
    path("<int:course_id>/", views.course_detail, name="course_detail"),
    path("<int:course_id>/edit/", views.edit_course, name="edit_course"),
    path("<int:course_id>/delete/", views.delete_course, name="delete_course"),
    path("<int:course_id>/add-module/", views.add_module, name="add_module"),
    path("module/<int:module_id>/edit/", views.edit_module, name="edit_module"),
    path("module/<int:module_id>/delete/", views.delete_module, name="delete_module"),
    path("topic/<int:topic_id>/edit/", views.edit_topic, name="edit_topic"),
    path("topic/<int:topic_id>/delete/", views.delete_topic, name="delete_topic"),
    path("api/departments/", views.api_get_departments, name="api_get_departments"),
    path("api/courses/", views.api_get_courses, name="api_get_courses"),
    path(
        "api/courses/<int:course_id>/modules/",
        views.api_get_modules,
        name="api_get_modules",
    ),
    path("api/audit/", views.api_run_audit, name="api_run_audit"),
]
