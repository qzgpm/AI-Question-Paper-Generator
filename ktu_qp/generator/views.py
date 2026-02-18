from django.shortcuts import render
from huggingface_hub import InferenceClient

MODULE_TOPICS = {
    "Module 1": ["DFA", "NFA", "Regular Grammar"],
    "Module 2": ["Regular Expression", "Pumping Lemma", "DFA Minimization"],
    "Module 3": ["Myhill-Nerode", "CFG", "Normal Forms"],
    "Module 4": ["PDA", "Closure Properties", "Pumping Lemma (CFL)"],
    "Module 5": ["Turing Machine", "Halting Problem", "CSG"]
}

with open("hf_api.txt") as f:
    HF_TOKEN = f.read().strip()

client = InferenceClient(token=HF_TOKEN)

def topic_selector(request):
    if request.method == "POST":
        subject = request.POST.get("subject")
        topics = request.POST.getlist("topics")

        # Build topic -> bloom mapping
        topic_bloom = {}
        for t in topics:
            bloom = request.POST.get(f"bloom_{t}")
            if bloom:
                topic_bloom[t] = bloom

        # Build mapping text for prompt
        mapping_lines = [f"{t} → {b}" for t, b in topic_bloom.items()]
        mapping_text = "\n".join(mapping_lines)

        prompt = f"""
You are generating ONLY a KTU style question paper.

Subject: {subject}

Topic → Bloom Mapping:
{mapping_text}

STRICT OUTPUT FORMAT (NO EXTRA TEXT ALLOWED):

PART A (5 x 3 = 15 marks)
1. <question> [Bloom]
2. <question> [Bloom]
3. <question> [Bloom]
4. <question> [Bloom]
5. <question> [Bloom]

PART B (5 x 7 = 35 marks)
6. <question> [Bloom]
OR
7. <question> [Bloom]

8. <question> [Bloom]
OR
9. <question> [Bloom]

10. <question> [Bloom]
OR
11. <question> [Bloom]

12. <question> [Bloom]
OR
13. <question> [Bloom]

14. <question> [Bloom]
OR
15. <question> [Bloom]

MANDATORY RULES:
- EXACTLY 15 questions only
- NO university names
- NO subject codes
- NO (a), (b) subparts
- ONE sentence per question
- Use ONLY given topics
- Bloom level must match mapping
- Append Bloom in [ ]
- PART A = Remember/Understand only
- PART B = Apply/Analyze/Evaluate only
- Include DFA or NFA construction questions
- DO NOT add instructions
- DO NOT add headers
- DO NOT add explanations
- DO NOT stop early
- OUTPUT ONLY THE QUESTION PAPER
"""

        messages = [
            {"role": "system", "content": "You are an expert KTU university question paper setter."},
            {"role": "user", "content": prompt}
        ]

        response = client.chat_completion(
            model="mistralai/Mistral-7B-Instruct-v0.2",
            messages=messages,
            max_tokens=1400,
            temperature=0.7
        )

        paper = response.choices[0].message.content

        return render(request, "result.html", {
            "paper": paper,
            "topic_bloom": topic_bloom,
            "subject": subject
        })

    return render(request, "topic_selector.html", {"modules": MODULE_TOPICS})
