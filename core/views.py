from django.http import JsonResponse
from apps.curriculum.models import Course, Module, Topic
from apps.library.models import QuestionBank
from apps.engine.models import ExamPaper


def dashboard(request):
    """
    API view that summarizes system status in JSON.
    """
    stats = {
        "courses": Course.objects.count(),
        "modules": Module.objects.count(),
        "topics": Topic.objects.count(),
        "questions": QuestionBank.objects.count(),
        "papers": ExamPaper.objects.count(),
    }

    # Recent papers
    recent_papers = []
    for paper in ExamPaper.objects.all().order_by("-created_at")[:5]:
        recent_papers.append(
            {
                "id": paper.id,
                "title": paper.title,
                "course": paper.course.name if paper.course else "Unknown",
                "date": paper.created_at.strftime("%Y-%m-%d %H:%M"),
                "status": "Generated",
            }
        )

    # Bloom's Taxonomy Distribution (L1-L6)
    blooms_distribution = []
    total_q = stats["questions"]
    if total_q > 0:
        for level, name in QuestionBank.BLOOMS_LEVELS:
            count = QuestionBank.objects.filter(blooms_level=level).count()
            pct = (count / total_q) * 100
            blooms_distribution.append(
                {"level": level, "name": name, "pct": int(pct), "count": count}
            )

    return JsonResponse(
        {
            "stats": stats,
            "recent_papers": recent_papers,
            "blooms_distribution": blooms_distribution,
        }
    )
