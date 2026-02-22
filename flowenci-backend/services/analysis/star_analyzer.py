"""
STAR structure analyzer using GPT-4o-mini.
"""
import json
from typing import Optional
from config import get_settings

settings = get_settings()

STAR_PROMPT = """You are evaluating whether a job interview answer follows the STAR structure 
(Situation, Task, Action, Result).

Interview answer:
{transcript}

Evaluate each STAR component (0-25 points each, total 0-100).
Return ONLY valid JSON:
{{
  "star_score": <0-100>,
  "breakdown": {{
    "situation": <0-25>,
    "task": <0-25>,
    "action": <0-25>,
    "result": <0-25>
  }},
  "missing": ["situation" | "task" | "action" | "result"] (list of missing/weak components),
  "notes": "<1 sentence assessment>"
}}"""


def analyze_star(transcript: str, use_star: bool = True) -> dict:
    """
    Analyze STAR structure in transcript.
    If use_star is False, returns None scores (not a behavioral question).
    """
    if not use_star or len(transcript.split()) < 20:
        return {"star_score": None, "breakdown": {}, "missing": []}

    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.openai_api_key)

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "user", "content": STAR_PROMPT.format(transcript=transcript[:2000])}
            ],
            temperature=0.2,
            max_tokens=400,
        )
        raw = response.choices[0].message.content.strip()
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except Exception as e:
        print(f"[STAR] Analysis error: {e}")
        return {"star_score": None, "breakdown": {}, "missing": []}
