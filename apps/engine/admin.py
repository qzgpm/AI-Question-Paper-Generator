from django.contrib import admin
from .models import ExamPaper, ExamPaperQuestion


class ExamPaperQuestionInline(admin.TabularInline):
    model = ExamPaperQuestion
    extra = 0
    raw_id_fields = ("question",)


@admin.register(ExamPaper)
class ExamPaperAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "status", "created_by", "created_at")
    list_filter = ("status", "course")
    inlines = [ExamPaperQuestionInline]
