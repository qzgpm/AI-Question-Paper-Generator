from django.http import JsonResponse
from .models import QuestionBank

def api_question_list(request):
    """API view to list all questions in the bank."""
    questions = QuestionBank.objects.all().select_related('course', 'module', 'topic')
    data = []
    for q in questions:
        data.append({
            "id": q.id,
            "text": q.text,
            "course": q.course.name if q.course else "Unknown",
            "module": q.module.title if q.module else "General",
            "topic": q.topic.name if q.topic else None,
            "marks": q.marks,
            "blooms_level": q.blooms_level,
            "difficulty": q.difficulty,
            "diagram_code": q.diagram_code,
        })
    return JsonResponse({"questions": data})

def api_delete_question(request, question_id):
    """API view to delete a question."""
    if request.method == "POST":
        try:
            QuestionBank.objects.filter(id=question_id).delete()
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
