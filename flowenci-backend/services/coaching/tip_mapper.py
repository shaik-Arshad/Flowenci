"""
Coaching tip mapper using GPT-4o-mini.
"""
import json
import openai
from config import get_settings

settings = get_settings()

COACHING_SYSTEM_PROMPT = """You are Flowenci, an expert interview coach helping Indian students
speak confidently in English job interviews. You give specific, actionable, non-judgmental feedback.

For each issue, respond with exactly this JSON structure:
{
  "metric": "Short metric name (e.g. Filler Words)",
  "value": "What was measured (e.g. You said 'um' 12 times)",
  "why_it_matters": "1-2 sentences on interviewer impact",
  "root_cause": "1 sentence on why this typically happens",
  "technique": "Exact 2-3 step technique to fix it",
  "target": "Specific goal for next attempt"
}"""


def generate_coaching_tips(
    filler_count: int,
    filler_detail: dict,
    wpm: float,
    pause_count: int,
    star_breakdown: dict,
    star_missing: list,
    confidence_flags: list,
    duration_seconds: float,
) -> list:
    issues = _build_issues_summary(
        filler_count, filler_detail, wpm, pause_count,
        star_breakdown, star_missing, confidence_flags, duration_seconds
    )

    if not issues:
        return [{
            "metric": "Great Delivery",
            "value": "No major issues detected",
            "why_it_matters": "Clean delivery builds interviewer confidence in you.",
            "root_cause": "Strong preparation and practice.",
            "technique": "Keep practicing. Try harder questions next.",
            "target": "Maintain this quality consistently.",
        }]

    prompt = f"""Based on these interview delivery issues, generate the TOP 3 most impactful coaching tips.

Issues detected:
{json.dumps(issues, indent=2)}

Return a JSON array of exactly 3 tip objects. Return ONLY a valid JSON array, no other text."""

    try:
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": COACHING_SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        tips = json.loads(raw)
        return tips[:3]
    except Exception as e:
        return _fallback_tips(filler_count, wpm, pause_count)


def _build_issues_summary(filler_count, filler_detail, wpm, pause_count,
                           star_breakdown, star_missing, confidence_flags, duration_seconds):
    issues = []
    if filler_count > 5:
        top = max(filler_detail, key=filler_detail.get) if filler_detail else "um"
        rate = round((filler_count / max(duration_seconds, 1)) * 60, 1)
        issues.append({
            "type": "filler_words",
            "severity": "high" if filler_count > 10 else "medium",
            "data": {"total": filler_count, "top_filler": top, "rate_per_minute": rate},
        })
    if wpm and (wpm > 160 or wpm < 110):
        issues.append({
            "type": "pace",
            "severity": "high" if (wpm > 180 or wpm < 90) else "medium",
            "data": {"wpm": wpm, "target": "120-150 WPM"},
        })
    if pause_count >= 3:
        issues.append({
            "type": "pauses",
            "severity": "high" if pause_count >= 6 else "medium",
            "data": {"pause_count": pause_count},
        })
    if star_missing:
        issues.append({
            "type": "star_structure",
            "severity": "high",
            "data": {"missing_components": star_missing},
        })
    if duration_seconds and duration_seconds < 40:
        issues.append({
            "type": "too_short",
            "severity": "high",
            "data": {"duration_seconds": duration_seconds, "target": "60-90 seconds"},
        })
    return issues


def _fallback_tips(filler_count, wpm, pause_count):
    tips = []
    if filler_count > 5:
        tips.append({
            "metric": "Filler Words",
            "value": f"You used {filler_count} filler words",
            "why_it_matters": "Fillers make you sound unprepared and reduce credibility.",
            "root_cause": "You're filling thinking time with sounds instead of silent pauses.",
            "technique": "Replace every filler with a 1-second silent pause. Practice 3x before re-recording.",
            "target": f"Under {max(2, filler_count // 3)} filler words next attempt.",
        })
    if wpm and wpm > 160:
        tips.append({
            "metric": "Speaking Pace",
            "value": f"You spoke at {round(wpm)} WPM — too fast",
            "why_it_matters": "Fast speech signals nervousness and is hard to follow.",
            "root_cause": "Nerves cause rushing. Deep breathing helps.",
            "technique": "Take one deep breath before starting. Pause after each sentence.",
            "target": "120–150 WPM next attempt.",
        })
    if not tips:
        tips.append({
            "metric": "Overall Delivery",
            "value": "Good attempt — keep building",
            "why_it_matters": "Consistent practice is the fastest path to interview confidence.",
            "root_cause": "N/A",
            "technique": "Record yourself 3 more times this week.",
            "target": "Readiness score above 75.",
        })
    return tips[:3]
