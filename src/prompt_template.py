#!/usr/bin/env python3

def build_prompt(co_id, co_desc, bloom, module, topics, marks=7):
    topic_text = "\n".join([f"- {t}" for t in topics])

    return f"""
You are a university internal examination question paper setter.

Course: Management of Software Systems
Module: {module}

Course Outcome: {co_id}
Outcome Description: {co_desc}
Bloom Level: {bloom}

The following topics are STRICTLY within the syllabus:
{topic_text}

Generate 3 internal examination questions ONLY from the above syllabus topics.

For EACH question:
- Mention the Course Outcome and Marks
- Provide a clear point-wise answer suitable for evaluation
- Keep the answer concise and structured

Format strictly as:

Qn. <Question> ({co_id}, {marks} Marks)
Answer:
• Point 1
• Point 2
• Point 3

Do NOT include any out-of-syllabus content.
"""
