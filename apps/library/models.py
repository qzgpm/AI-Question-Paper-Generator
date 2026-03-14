from django.db import models
from django.conf import settings


class QuestionBank(models.Model):
    BLOOMS_LEVELS = [
        ("L1", "Remember"),
        ("L2", "Understand"),
        ("L3", "Apply"),
        ("L4", "Analyze"),
        ("L5", "Evaluate"),
        ("L6", "Create"),
    ]

    course = models.ForeignKey("curriculum.Course", on_delete=models.CASCADE)
    module = models.ForeignKey(
        "curriculum.Module", on_delete=models.SET_NULL, null=True, blank=True
    )
    topic = models.ForeignKey("curriculum.Topic", on_delete=models.SET_NULL, null=True)
    text = models.TextField()
    marks = models.PositiveSmallIntegerField(default=3)
    blooms_level = models.CharField(max_length=2, choices=BLOOMS_LEVELS, default="L2")
    difficulty = models.CharField(
        max_length=10,
        choices=[("easy", "Easy"), ("medium", "Medium"), ("hard", "Hard")],
        default="medium",
    )
    diagram_code = models.TextField(null=True, blank=True)
    diagram_type = models.CharField(max_length=50, default="mermaid")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.blooms_level}] {self.text[:50]}..."


class AnswerKey(models.Model):
    question = models.OneToOneField(
        QuestionBank, on_delete=models.CASCADE, related_name="answer"
    )
    content = models.TextField()
    key_points = models.JSONField(default=list)

    def __str__(self):
        return f"Answer for Q{self.question.id}"
