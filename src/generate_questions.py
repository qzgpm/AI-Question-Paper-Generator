#!/usr/bin/env python3

from openai import OpenAI
from academic_data import COURSE_OUTCOMES
from syllabus_data import SYLLABUS
from prompt_template import build_prompt

# Load API key
with open("apikey.txt") as f:
    api_key = f.read().strip()

client = OpenAI(api_key=api_key)

co_id = "CO3"
co = COURSE_OUTCOMES[co_id]

module = "Module 3"
topics = SYLLABUS[module]["topics"]

prompt = build_prompt(
    co_id,
    co["description"],
    co["bloom"],
    module,
    topics
)

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.3
)

print(response.choices[0].message.content)
