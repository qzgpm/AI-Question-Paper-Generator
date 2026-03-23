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
    for paper in ExamPaper.objects.select_related('course').order_by("-created_at")[:5]:
        recent_papers.append(
            {
                "id": paper.id,
                "title": paper.title,
                "course": paper.course.name if paper.course else "Unknown",
                "date": paper.created_at.strftime("%b %d, %Y"),
                "status": paper.status.capitalize() if paper.status else "Unknown",
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

    # Bloom coverage: percentage of the 6 levels that have at least 1 question
    covered_levels = sum(1 for b in blooms_distribution if b["count"] > 0)
    bloom_coverage_pct = int((covered_levels / 6) * 100) if blooms_distribution else 0

    return JsonResponse(
        {
            "stats": stats,
            "recent_papers": recent_papers,
            "blooms_distribution": blooms_distribution,
            "bloom_coverage_pct": bloom_coverage_pct,
        }
    )
