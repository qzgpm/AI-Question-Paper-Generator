from django.contrib import admin
from .models import Department, Course, Module, Topic


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("code", "name")


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "semester", "department")
    list_filter = ("department", "semester")


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("course", "number", "title")
    list_filter = ("course",)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "module")
    search_fields = ("name", "keywords")
