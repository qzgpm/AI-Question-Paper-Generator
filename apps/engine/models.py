from django.db import models
from django.conf import settings


class ExamPaper(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("generating", "Generating"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    course = models.ForeignKey("curriculum.Course", on_delete=models.CASCADE)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True
    )
    title = models.CharField(max_length=255)
    max_marks = models.PositiveIntegerField(default=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")

    # Meta data for the AI generation session
    generation_log = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.course.code}"


class ExamPaperQuestion(models.Model):
    """The 'Through' model linking Paper to Library questions."""

    paper = models.ForeignKey(
        ExamPaper, on_delete=models.CASCADE, related_name="questions"
    )
    question = models.ForeignKey("library.QuestionBank", on_delete=models.CASCADE)
    part = models.CharField(max_length=1, choices=[("A", "Part A"), ("B", "Part B")])
    order = models.PositiveSmallIntegerField()
    slot = models.CharField(
        max_length=1, choices=[("a", "A"), ("b", "B")], null=True, blank=True
    )

    class Meta:
        ordering = ["part", "order"]
