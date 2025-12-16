#!/usr/bin/env python3

def build_prompt(co_id, co_desc, bloom, module, topics):
    topic_list = "\n".join([f"- {t}" for t in topics])

    return f"""
You are a university exam question setter.

Course: Graph Theory
Module: {module}

Course Outcome: {co_id}
Outcome Description: {co_desc}
Bloom Level: {bloom}

The following topics are strictly within the syllabus:
{topic_list}

Generate 3 internal examination questions ONLY from the above syllabus topics.
DO NOT include any out-of-syllabus concepts.

Return only a numbered list.
Include answers.
"""
