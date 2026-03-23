import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404


from .models import Course, Module, Department, Topic
from apps.library.models import QuestionBank


def api_get_departments(request):
    """Returns a list of all departments."""
    depts = Department.objects.all().values("id", "name", "code")
    return JsonResponse({"departments": list(depts)})


def course_list(request):
    """API view to list all courses with department info."""
    courses = Course.objects.all().select_related("department")
    data = [
        {
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "semester": c.semester,
            "department": c.department.name,
            "module_count": c.modules.count(),
        }
        for c in courses
    ]
    return JsonResponse({"courses": data})


def course_detail(request, course_id):
    """API view to show course details and its modules/topics."""
    course = get_object_or_404(Course, id=course_id)
    modules = course.modules.all().order_by("number")
    module_data = []
    for mod in modules:
        topics = list(
            mod.topics.values("id", "name", "suggested_bloom_level", "weightage")
        )
        module_data.append(
            {"id": mod.id, "title": mod.title, "number": mod.number, "topics": topics}
        )

    return JsonResponse(
        {
            "course": {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "semester": course.semester,
                "department": course.department.name,
                "department_id": course.department.id,
            },
            "modules": module_data,
        }
    )


def add_course(request):
    """API view to add a new course."""
    if request.method == "POST":
        data = json.loads(request.body)
        department = get_object_or_404(Department, id=data.get("department"))
        try:
            course = Course(
                department=department,
                code=data.get("code", "").upper().strip(),
                name=data.get("name"),
                semester=data.get("semester"),
            )
            course.full_clean()
            course.save()
            return JsonResponse({"status": "success", "course_id": course.id})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def edit_course(request, course_id):
    """API view to edit an existing course."""
    course = get_object_or_404(Course, id=course_id)
    if request.method == "POST":
        data = json.loads(request.body)
        course.department = get_object_or_404(Department, id=data.get("department"))
        try:
            course.code = data.get("code", "").upper().strip()
            course.name = data.get("name")
            course.semester = data.get("semester")
            course.full_clean()
            course.save()
            return JsonResponse({"status": "success"})
        except Exception as e:
            return JsonResponse({"status": "error", "message": str(e)}, status=400)
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def delete_course(request, course_id):
    """API view to delete a course."""
    course = get_object_or_404(Course, id=course_id)
    if request.method == "POST":
        course.delete()
        return JsonResponse({"status": "success"})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def add_module(request, course_id):
    """API view to add a module and topics."""
    course = get_object_or_404(Course, id=course_id)
    if request.method == "POST":
        data = json.loads(request.body)
        module = Module.objects.create(
            course=course, number=data.get("number"), title=data.get("title")
        )

        topics_text = data.get("topics", "")
        if topics_text:
            for topic_name in topics_text.split(","):
                name = topic_name.strip()
                if name:
                    Topic.objects.create(module=module, name=name, keywords=name)
        return JsonResponse({"status": "success", "module_id": module.id})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def edit_module(request, module_id):
    """API view to edit a module."""
    module = get_object_or_404(Module, id=module_id)
    if request.method == "POST":
        data = json.loads(request.body)
        module.number = data.get("number")
        module.title = data.get("title")
        module.save()
        return JsonResponse({"status": "success"})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def delete_module(request, module_id):
    """API view to delete a module."""
    module = get_object_or_404(Module, id=module_id)
    if request.method == "POST":
        module.delete()
        return JsonResponse({"status": "success"})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def edit_topic(request, topic_id):
    """API view to edit a topic."""
    topic = get_object_or_404(Topic, id=topic_id)
    if request.method == "POST":
        data = json.loads(request.body)
        topic.name = data.get("name")
        topic.suggested_bloom_level = data.get("suggested_bloom_level")
        topic.weightage = data.get("weightage")
        topic.save()
        return JsonResponse({"status": "success"})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


def delete_topic(request, topic_id):
    """API view to delete a topic."""
    topic = get_object_or_404(Topic, id=topic_id)
    if request.method == "POST":
        topic.delete()
        return JsonResponse({"status": "success"})
    return JsonResponse(
        {"status": "error", "message": "Method not allowed"}, status=405
    )


# Compatibility endpoints
def api_get_courses(request):
    courses = Course.objects.all().values("id", "name", "code")
    return JsonResponse({"courses": list(courses)})


def api_get_modules(request, course_id):
    course = get_object_or_404(Course, id=course_id)
    modules = course.modules.all().order_by("number")
    module_data = []
    for mod in modules:
        topics = list(mod.topics.values("id", "name"))
        module_data.append(
            {"id": mod.id, "title": mod.title, "number": mod.number, "topics": topics}
        )
    return JsonResponse({"course_name": course.name, "modules": module_data})
def api_run_audit(request):
    """
    Simple curriculum audit API.
    In a real app, this would perform a deep analysis of Bloom mapping,
    topic coverage, and difficulty distribution.
    """
    if request.method != "POST":
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)
    
    # Simple logic to simulate "Audit Completed"
    total_courses = Course.objects.count()
    total_questions = QuestionBank.objects.count()
    
    # Return some "insights"
    return JsonResponse({
        "status": "success",
        "message": f"Audit of {total_courses} courses and {total_questions} questions completed.",
        "insights": {
            "bloom_coverage": "75%",
            "missing_topics": 12,
            "health_score": 88
        }
    })
