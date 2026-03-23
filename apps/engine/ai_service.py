"""
KTU-QGen AI Service — HuggingFace Inference API
"""

from huggingface_hub import InferenceClient
from django.conf import settings
import json
import re
import logging

logger = logging.getLogger(__name__)


class HuggingFaceService:
    def __init__(self):
        self.client = InferenceClient(api_key=settings.HUGGINGFACE_API_KEY)
        self.models = [
            "meta-llama/Meta-Llama-3-8B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.2",
            "microsoft/Phi-3-mini-4k-instruct",
        ]

    def _call(self, prompt: str, max_tokens: int = 2048) -> str:
        last_error = None

        messages = [{"role": "user", "content": prompt}]

        for model_id in self.models:
            try:
                logger.debug("Trying %s via chat_completion...", model_id)

                response = self.client.chat.completions.create(
                    model=model_id,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                )

                content = response.choices[0].message.content
                if content:
                    return content

            except Exception as e:
                logger.warning("%s failed: %s", model_id, str(e)[:100])
                last_error = e
                continue

        raise Exception(f"AI Generation failed. Last error: {last_error}")

    # ------------------------------------------------------------------ #
    def generate_part_a(self, subject, units, difficulty, n=5):
        units_txt = "\n".join(
            f"- Unit {u['unit_number']}: {u['title']} | Topics: {u['topics']}"
            for u in units
        )
        prompt = f"""[INST] You are an expert academic question-paper setter.
Generate exactly {n} short-answer questions for a university internal examination.

Subject: {subject}
Difficulty: {difficulty}
Syllabus units:
{units_txt}

Rules:
- Each question carries 3 marks (answer in 3-5 sentences).
- Cover different units where possible.
- Questions must be original and exam-ready.
- Return ONLY a valid JSON array. No prose, no markdown fences.
- **MERMAID RULES**: If helpful, use ONLY "graph LR" or "stateDiagram-v2". 
  - **CRITICAL**: No semicolons after "graph LR". 
  - **CRITICAL**: Use "-->|label| Target" for labeled arrows. 
  - **CRITICAL**: Keep it simple and valid.

Format:
[
  {{
    "question_number": 1,
    "question": "...",
    "unit": "Unit X",
    "marks": 3,
    "blooms_level": "L1/L2/L3/L4",
    "diagram_code": "graph LR\\nA-->|input|B"
  }}
]
[/INST]"""
        raw = self._call(prompt, 1200 + (n * 100))
        return self._parse(raw, list)

    # ------------------------------------------------------------------ #
    def generate_part_b(self, subject, units, difficulty, n=5):
        units_txt = "\n".join(
            f"- Unit {u['unit_number']}: {u['title']} | Topics: {u['topics']}"
            for u in units
        )
        prompt = f"""[INST] You are an expert academic question-paper setter.
Generate exactly {n} question groups for Part B of a university internal examination.

Subject: {subject}
Difficulty: {difficulty}
Syllabus units:
{units_txt}

Rules:
- Each group has Question (a) AND Question (b) — student answers EITHER one.
- Each question is worth 7 marks.
- Use varied verbs: explain, analyze, design, compare, evaluate, implement.
- Questions must be original.
- Return ONLY a valid JSON array.
- **MERMAID RULES**: If helpful, use ONLY "graph LR" or "stateDiagram-v2".
  - **CRITICAL**: No semicolons after "graph LR".
  - **CRITICAL**: Use "-->|label| Target" for labeled arrows. NEVER use "|label|>" or "|label|>>".
  - **CRITICAL**: Keep it simple and valid.

Format:
[
  {{
    "unit": "Unit 1",
    "question_a": {{
      "text": "...",
      "marks": 7,
      "blooms_level": "L3",
      "diagram_code": "graph LR\\nA-->|input|B"
    }},
    "question_b": {{
      "text": "...",
      "marks": 7,
      "blooms_level": "L4",
      "diagram_code": "stateDiagram-v2\\nState1 --> State2: label"
    }}
  }}
]
[/INST]"""
        raw = self._call(prompt, 4096)
        return self._parse(raw, list)

    # ------------------------------------------------------------------ #
    def generate_answer_key(self, part_a, part_b):
        a_txt = "\n".join(
            f"Q{q.get('question_number', i + 1)}. {q.get('question', '')} [3 marks]"
            for i, q in enumerate(part_a)
        )
        b_txt = "\n".join(
            f"Group {g['group_number']}a. {g.get('question_a', {}).get('text', '')} [7 marks]\n"
            f"Group {g['group_number']}b. {g.get('question_b', {}).get('text', '')} [7 marks]"
            for g in part_b
        )
        prompt = f"""[INST] Generate model answer key for the following exam questions.

PART A (3 marks — 3 key points each):
{a_txt}

PART B (7 marks — 6 key points each):
{b_txt}

Return ONLY valid JSON, no prose.

{{
  "part_a_answers": [
    {{
      "question_number": 1,
      "key_points": ["point 1", "point 2", "point 3"],
      "model_answer": "..."
    }}
  ],
  "part_b_answers": [
    {{
      "group_number": 1,
      "answer_a": {{ "key_points": ["..."], "model_answer": "..." }},
      "answer_b": {{ "key_points": ["..."], "model_answer": "..." }}
    }}
  ]
}}
[/INST]"""
        raw = self._call(prompt, 3000)
        return self._parse(raw, dict)

    # ------------------------------------------------------------------ #
    def check_plagiarism(self, questions):
        q_txt = "\n".join(
            f"{i + 1}. {q.get('question') or q.get('text', '')}"
            for i, q in enumerate(questions)
        )
        prompt = f"""[INST] Assess originality of these exam questions. For each, estimate how likely it is copied from common textbooks (0 = definitely copied, 100 = fully original).

Questions:
{q_txt}

Return ONLY valid JSON:
{{
  "overall_originality_score": 85,
  "questions": [
    {{
      "question_number": 1,
      "originality_score": 90,
      "risk_level": "Low",
      "status": "Original",
      "suggestion": "..."
    }}
  ],
  "summary": "...",
  "recommendations": ["..."]
}}
[/INST]"""
        raw = self._call(prompt, 1200)
        return self._parse(raw, dict)

    # ------------------------------------------------------------------ #
    def classify_blooms(self, questions):
        q_list = [
            {"id": i, "question": q.get("question") or q.get("text", "")}
            for i, q in enumerate(questions)
        ]
        prompt = f"""[INST] Classify each exam question by Bloom's Taxonomy (Revised):
L1 Remember, L2 Understand, L3 Apply, L4 Analyze, L5 Evaluate, L6 Create.

Questions: {json.dumps(q_list)}

Return ONLY valid JSON array:
[
  {{
    "id": 0,
    "blooms_level": "L2",
    "level_name": "Understand",
    "action_verbs": ["explain", "describe"],
    "justification": "..."
  }}
]
[/INST]"""
        raw = self._call(prompt, 1200)
        return self._parse(raw, list)

    # ------------------------------------------------------------------ #
    @staticmethod
    def _parse(text: str, expected):
        if not text:
            return [] if expected is list else {}
        
        # Clean [INST] tags often echoed by some models
        text = re.sub(r"\[/?INST\]", "", text).strip()
        
        def try_json(s):
            try:
                # Remove common AI wrappers
                s = s.strip()
                if s.startswith("```"):
                    s = re.sub(r"^```[a-z]*\n", "", s, flags=re.I)
                    s = re.sub(r"\n```$", "", s)
                
                parsed = json.loads(s.strip())
                if isinstance(parsed, expected):
                    return parsed
            except Exception:
                pass
            return None

        # 1. Try direct
        res = try_json(text)
        if res is not None: return res

        # 2. Extract potential blocks and find the largest valid one
        candidates = []
        # Find all content between furthest [ ] or { }
        if expected is list:
            matches = re.findall(r"(\[[\s\S]*\])", text)
        else:
            matches = re.findall(r"(\{[\s\S]*\})", text)
            
        for m in matches:
            # We also try sub-matches just in case of nested noise
            inner_res = try_json(m)
            if inner_res is not None:
                candidates.append(inner_res)

        if candidates:
            # Return the one with most items/keys as it's likely the intended one
            return max(candidates, key=lambda x: len(x) if isinstance(x, (list, dict)) else 0)

        return [] if expected is list else {}


ai_service = HuggingFaceService()
