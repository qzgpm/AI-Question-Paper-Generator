from django.shortcuts import get_object_or_404
from django.http import JsonResponse
import json
import logging

logger = logging.getLogger(__name__)

from apps.curriculum.models import Course, Module
from apps.library.models import QuestionBank
from apps.library.similarity import is_similar
from .models import ExamPaper, ExamPaperQuestion
from .ai_service import ai_service


def paper_detail(request, paper_id):
    """Returns final generated paper data as JSON."""
    paper = get_object_or_404(ExamPaper, id=paper_id)
    # Group questions by Part
    part_a = paper.questions.filter(part="A").select_related("question")
    part_b = paper.questions.filter(part="B").select_related("question")

    questions_a = [
        {
            "id": q.question.id,
            "text": q.question.text,
            "marks": q.question.marks,
            "blooms": q.question.blooms_level,
            "diagram_code": q.question.diagram_code,
            "diagram_type": q.question.diagram_type,
            "order": q.order,
        }
        for q in part_a
    ]

    questions_b = []
    # Part B is usually in slots (a/b)
    slots = {}
    for q in part_b:
        if q.order not in slots:
            slots[q.order] = {}
        slots[q.order][q.slot] = {
            "id": q.question.id,
            "text": q.question.text,
            "marks": q.question.marks,
            "blooms": q.question.blooms_level,
            "diagram_code": q.question.diagram_code,
            "diagram_type": q.question.diagram_type,
        }

    for order in sorted(slots.keys()):
        questions_b.append(
            {
                "order": order,
                "question_a": slots[order].get("a"),
                "question_b": slots[order].get("b"),
            }
        )

    return JsonResponse(
        {
            "paper": {
                "id": paper.id,
                "title": paper.title,
                "course": paper.course.name if paper.course else "Unknown",
                "max_marks": paper.max_marks,
                "date": paper.created_at.strftime("%Y-%m-%d %H:%M"),
            },
            "part_a": questions_a,
            "part_b": questions_b,
        }
    )


def api_generate_paper(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        data = json.loads(request.body)
        course_id = data.get("course_id")
        # In the new UI, module_ids will be passed from the checkboxes
        module_ids = data.get("module_ids", [])

        course = get_object_or_404(Course, id=course_id)
        selected_modules = Module.objects.filter(id__in=module_ids).order_by("number")

        # 1. Create the Paper Placeholder
        paper = ExamPaper.objects.create(
            course=course,
            title=data.get("title", f"Exam: {course.name}"),
            status="generating",
            created_by=request.user if request.user.is_authenticated else None,
            max_marks=50,
        )

        # 2. Build AI Context using your actual field names
        units_payload = []
        for mod in selected_modules:
            # We use mod.number here because your model uses 'number'
            # We also include your 'keywords' field for better AI quality
            topic_list = []
            for t in mod.topics.all():
                t_str = t.name
                if t.keywords:
                    t_str += f" ({t.keywords})"
                topic_list.append(t_str)

            topics_context = ", ".join(topic_list)

            units_payload.append(
                {
                    "unit_number": mod.number,
                    "title": mod.title,
                    "topics": topics_context,
                }
            )

        # 3. Call AI Service (HuggingFace)
        # We pass the rich context we just built
        part_a = ai_service.generate_part_a(
            course.name, units_payload, data.get("difficulty", "medium"), n=5
        )
        logger.debug("Generated Part A count: %d", len(part_a))
        part_b = ai_service.generate_part_b(
            course.name, units_payload, data.get("difficulty", "medium"), n=5
        )
        logger.debug("Generated Part B count: %d", len(part_b))

        # 4. Save to Database (Relational Mapping)
        _persist_to_library(paper, part_a, part_b, selected_modules)

        paper.status = "completed"
        paper.save()

        return JsonResponse({"status": "success", "paper_id": paper.id})

    except Exception as e:
        # If it fails, update the paper status so the UI knows
        if "paper" in locals():
            paper.status = "failed"
            paper.save()
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


def _persist_to_library(paper, part_a, part_b, modules_qs):
    """Maps AI JSON objects to Library.QuestionBank and Engine.ExamPaperQuestion"""
    # Create a mapping of Module Title -> Module Object for quick lookup
    mod_map = {m.title.lower(): m for m in modules_qs}

    existing_questions = list(QuestionBank.objects.filter(course=paper.course))

    # Process Part A
    logger.debug("Processing Part A with %d entries", len(part_a))
    for i, q in enumerate(part_a):
        try:
            unit_title = q.get("unit", "").lower()
            target_module = mod_map.get(unit_title)
            q_text = q.get("question") or q.get("text")
            if not q_text:
                logger.debug("Skipping Part A %d due to missing text: %s", i, q)
                continue

            # Check for similarity
            duplicate_qb = None
            for eq in existing_questions:
                similar, ratio = is_similar(q_text, eq.text)
                if similar:
                    duplicate_qb = eq
                    break
            
            if duplicate_qb:
                qb = duplicate_qb
                logger.debug("Reusing existing QB %d for Part A %d", qb.id, i)
            else:
                qb = QuestionBank.objects.create(
                    course=paper.course,
                    module=target_module,
                    text=q_text,
                    marks=3,
                    blooms_level=q.get("blooms_level", "L2"),
                    diagram_code=q.get("diagram_code"),
                )
                existing_questions.append(qb)

            ExamPaperQuestion.objects.create(
                paper=paper, question=qb, part="A", order=i + 1
            )
        except Exception as e:
            logger.warning("Skipping Part A question %d due to error: %s", i, e)
            continue

    # Process Part B
    logger.debug("Processing Part B with %d groups", len(part_b))
    for i, group in enumerate(part_b):
        try:
            unit_title = group.get("unit", "").lower()
            target_module = mod_map.get(unit_title)

            for choice in ["question_a", "question_b"]:
                q_data = group[choice]
                q_text = q_data.get("text")
                if not q_text:
                    continue

                # Check for similarity
                duplicate_qb = None
                for eq in existing_questions:
                    similar, ratio = is_similar(q_text, eq.text)
                    if similar:
                        duplicate_qb = eq
                        break

                if duplicate_qb:
                    qb = duplicate_qb
                else:
                    qb = QuestionBank.objects.create(
                        course=paper.course,
                        module=target_module,
                        text=q_text,
                        marks=7,
                        blooms_level=q_data.get("blooms_level", "L4"),
                        diagram_code=q_data.get("diagram_code"),
                    )
                    existing_questions.append(qb)

                ExamPaperQuestion.objects.create(
                    paper=paper,
                    question=qb,
                    part="B",
                    order=i + 1,
                    slot="a" if choice == "question_a" else "b",
                )
        except Exception as e:
            logger.warning("Skipping Part B group %d due to error: %s", i, e)
            continue


def api_check_plagiarism(request, paper_id):
    """API view to check plagiarism for all questions in a paper."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    paper = get_object_or_404(ExamPaper, id=paper_id)
    questions_qs = paper.questions.all().select_related("question")

    questions_data = []
    for q in questions_qs:
        questions_data.append({"id": q.question.id, "text": q.question.text})

    try:
        report = ai_service.check_plagiarism(questions_data)
        
        # Add internal similarity check
        course_questions = list(QuestionBank.objects.filter(course=paper.course))
        internal_results = []
        
        for i, q_data in enumerate(questions_data):
            q_text = q_data['text']
            q_id = q_data['id']
            
            # Find best match in QuestionBank (excluding the current question instance if already saved)
            best_match = None
            max_ratio = 0
            
            for eq in course_questions:
                if eq.id == q_id: continue # skip self
                similar, ratio = is_similar(q_text, eq.text)
                if ratio > max_ratio:
                    max_ratio = ratio
                    best_match = eq
            
            internal_results.append({
                "question_id": q_id,
                "question_number": i + 1,
                "internal_similarity_score": int(max_ratio * 100),
                "is_duplicate": max_ratio > 0.85
            })
            
        if isinstance(report, dict):
            report['internal_check'] = internal_results
        else:
            report = {"internal_check": internal_results, "status": "partial_success", "message": "AI check failed but internal check succeeded."}
        return JsonResponse(report)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


def api_generate_candidates(request):
    """Triggers AI to generate a pool of candidate questions."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        data = json.loads(request.body)
        course_id = data.get("course_id")
        module_ids = data.get("module_ids", [])
        
        course = get_object_or_404(Course, id=course_id)
        selected_modules = Module.objects.filter(id__in=module_ids).order_by("number")

        units_payload = []
        for mod in selected_modules:
            topic_list = [t.name + (f" ({t.keywords})" if t.keywords else "") for t in mod.topics.all()]
            units_payload.append({
                "unit_number": mod.number,
                "title": mod.title,
                "topics": ", ".join(topic_list),
            })

        # Generate candidates (2x the requirement)
        # 5 Part A questions (need 5) -> generate 10
        # 5 Part B groups (need 5) -> generate 10
        raw_part_a = ai_service.generate_part_a(course.name, units_payload, data.get("difficulty", "medium"), n=10)
        raw_part_b = ai_service.generate_part_b(course.name, units_payload, data.get("difficulty", "medium"), n=10)

        # Persist to library using similarity checks (linking to existing or creating new)
        mod_map = {m.title.lower(): m for m in selected_modules}
        existing_questions = list(QuestionBank.objects.filter(course=course))
        
        results_a = []
        for q in raw_part_a:
            unit_title = q.get("unit", "").lower()
            target_module = mod_map.get(unit_title)
            q_text = q["question"]
            
            duplicate_qb = next((eq for eq in existing_questions if is_similar(q_text, eq.text)[0]), None)
            
            if not duplicate_qb:
                duplicate_qb = QuestionBank.objects.create(
                    course=course,
                    module=target_module,
                    text=q_text,
                    marks=3,
                    blooms_level=q.get("blooms_level", "L2"),
                    diagram_code=q.get("diagram_code"),
                )
                existing_questions.append(duplicate_qb)
            
            results_a.append({
                "id": duplicate_qb.id,
                "text": duplicate_qb.text,
                "marks": duplicate_qb.marks,
                "blooms": duplicate_qb.blooms_level,
                "module": duplicate_qb.module.number if duplicate_qb.module else None,
                "diagram_code": duplicate_qb.diagram_code,
            })

        results_b = []
        for group in raw_part_b:
            unit_title = group.get("unit", "").lower()
            target_module = mod_map.get(unit_title)
            
            group_res = {"unit": unit_title}
            for choice in ["question_a", "question_b"]:
                q_data = group[choice]
                q_text = q_data["text"]
                
                duplicate_qb = next((eq for eq in existing_questions if is_similar(q_text, eq.text)[0]), None)
                
                if not duplicate_qb:
                    duplicate_qb = QuestionBank.objects.create(
                        course=course,
                        module=target_module,
                        text=q_text,
                        marks=7,
                        blooms_level=q_data.get("blooms_level", "L4"),
                        diagram_code=q_data.get("diagram_code"),
                    )
                    existing_questions.append(duplicate_qb)
                
                group_res[choice] = {
                    "id": duplicate_qb.id,
                    "text": duplicate_qb.text,
                    "marks": duplicate_qb.marks,
                    "blooms": duplicate_qb.blooms_level,
                    "module": duplicate_qb.module.number if duplicate_qb.module else None,
                    "diagram_code": duplicate_qb.diagram_code,
                }
            results_b.append(group_res)

        return JsonResponse({
            "status": "success",
            "part_a": results_a,
            "part_b": results_b
        })

    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


def api_get_candidates(request):
    """Returns candidate questions for a course/modules."""
    course_id = request.GET.get("course_id")
    module_ids = request.GET.get("module_ids", "").split(",")
    module_ids = [m for m in module_ids if m]

    if not course_id:
        return JsonResponse({"error": "course_id required"}, status=400)

    questions = QuestionBank.objects.filter(course_id=course_id)
    if module_ids:
        questions = questions.filter(module_id__in=module_ids)

    data = []
    for q in questions:
        data.append(
            {
                "id": q.id,
                "text": q.text,
                "marks": q.marks,
                "blooms": q.blooms_level,
                "module": q.module.number if q.module else None,
                "diagram_code": q.diagram_code,
            }
        )
    return JsonResponse({"questions": data})


def api_manual_generate(request):
    """Creates a paper from user-selected question IDs."""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        data = json.loads(request.body)
        course_id = data.get("course_id")
        title = data.get("title")
        # selections: list of {question_id, part, order, slot}
        selections = data.get("selections", [])

        course = get_object_or_404(Course, id=course_id)
        paper = ExamPaper.objects.create(
            course=course, title=title, status="completed", max_marks=50
        )

        for s in selections:
            question = get_object_or_404(QuestionBank, id=s["question_id"])
            ExamPaperQuestion.objects.create(
                paper=paper,
                question=question,
                part=s["part"],
                order=s["order"],
                slot=s.get("slot"),
            )

        return JsonResponse({"status": "success", "paper_id": paper.id})
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)
