from django.contrib import admin
from .models import QuestionBank, AnswerKey


class AnswerKeyInline(admin.StackedInline):
    model = AnswerKey
    extra = 0


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ("text_preview", "course", "blooms_level", "difficulty", "marks")
    list_filter = ("course", "blooms_level", "difficulty")
    search_fields = ("text",)
    inlines = [AnswerKeyInline]

    def text_preview(self, obj):
        return obj.text[:50] + "..."

    text_preview.short_description = "Question Text"
