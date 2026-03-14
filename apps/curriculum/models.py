from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


from django.core.validators import RegexValidator

class Course(models.Model):
    department = models.ForeignKey(
        Department, on_delete=models.CASCADE, related_name="courses"
    )
    code = models.CharField(
        max_length=20, 
        unique=True,
        validators=[
            RegexValidator(
                regex='^[A-Z]{3}[0-9]{3}$',
                message='Invalid course code format. Example: CST203'
            )
        ]
    )
    name = models.CharField(max_length=200)
    semester = models.PositiveSmallIntegerField()

    def __str__(self):
        return f"{self.code} {self.name}"


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    number = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=200)

    class Meta:
        unique_together = ("course", "number")
        ordering = ["number"]

    def __str__(self):
        return f"M{self.number}: {self.title}"


class Topic(models.Model):
    BLOOM_LEVELS = [
        ("L1", "Knowledge"),
        ("L2", "Comprehension"),
        ("L3", "Application"),
        ("L4", "Analysis"),
        ("L5", "Synthesis"),
        ("L6", "Evaluation"),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="topics")
    name = models.CharField(max_length=200)
    keywords = models.TextField(
        help_text="Comma-separated keywords for AI context", blank=True
    )
    suggested_bloom_level = models.CharField(
        max_length=2, choices=BLOOM_LEVELS, default="L1"
    )
    weightage = models.PositiveSmallIntegerField(
        default=10, help_text="Weightage in marks (relative)"
    )

    def __str__(self):
        return self.name
