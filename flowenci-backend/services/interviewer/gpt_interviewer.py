"""
Core GPT-4o-mini interviewer service.
"""
import json
from typing import List, Dict, Any
from openai import AsyncOpenAI
from config import get_settings
from services.interviewer.prompts import (
    SYSTEM_PROMPT_BASE, PERSONAS, OPENING_QUESTIONS, SESSION_END_PROMPT
)

settings = get_settings()


def build_system_prompt(company_key, interview_type, role, experience_level, current_turn, max_turns):
    persona = PERSONAS.get(company_key.lower(), PERSONAS["generic"])
    return SYSTEM_PROMPT_BASE.format(
        interview_type=interview_type,
        role=role,
        company=persona["company"],
        persona_description=persona["persona_description"],
        experience_level=experience_level,
        current_turn=current_turn,
        max_turns=max_turns,
    )


async def get_interviewer_response(
    conversation_history: List[Dict[str, str]],
    company_key: str,
    interview_type: str,
    role: str,
    experience_level: str,
    current_turn: int,
    max_turns: int = 8,
) -> str:
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    system_prompt = build_system_prompt(
        company_key=company_key,
        interview_type=interview_type,
        role=role,
        experience_level=experience_level,
        current_turn=current_turn,
        max_turns=max_turns,
    )

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)

    if current_turn == 1 and not conversation_history:
        opening = OPENING_QUESTIONS.get(interview_type, OPENING_QUESTIONS["behavioral"])
        messages.append({
            "role": "system",
            "content": f"Start the interview now. Your first question should be around: '{opening}'"
        })

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=300,
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()


async def generate_session_feedback(
    conversation_history: List[Dict[str, str]],
    company_key: str,
) -> Dict[str, Any]:
    client = AsyncOpenAI(api_key=settings.openai_api_key)
    persona = PERSONAS.get(company_key.lower(), PERSONAS["generic"])

    messages = [
        {
            "role": "system",
            "content": (
                f"You are an expert interview coach who just observed a full interview at {persona['company']}. "
                "Analyze the candidate's performance from the conversation below."
            )
        },
        *conversation_history,
        {"role": "user", "content": SESSION_END_PROMPT}
    ]

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        max_tokens=800,
        temperature=0.3,
    )

    raw = response.choices[0].message.content.strip()
    try:
        clean = raw.replace("```json", "").replace("```", "").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "overall_score": 60,
            "summary": "Session completed. Detailed analysis unavailable.",
            "top_wins": [],
            "top_improvements": [],
            "delivery_notes": raw,
            "interview_ready": False,
        }
