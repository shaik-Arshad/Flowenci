"""
Filler word detector.
Uses regex to detect common English filler words.
"""
import re
from typing import Dict

FILLER_WORDS = [
    "um", "uh", "uhh", "umm", "like", "basically", "literally",
    "you know", "right", "okay so", "so basically", "kind of", "sort of",
    "actually", "honestly", "just", "i mean", "anyway", "obviously",
    "absolutely", "you see", "i think", "i feel like", "and stuff",
]


def detect_fillers(transcript: str) -> Dict:
    """
    Detect filler words in transcript text.
    Returns total count and breakdown per filler word.
    """
    text_lower = transcript.lower()
    detail = {}

    for filler in FILLER_WORDS:
        pattern = r'\b' + re.escape(filler) + r'\b'
        matches = re.findall(pattern, text_lower)
        if matches:
            detail[filler] = len(matches)

    total = sum(detail.values())
    return {"total_count": total, "detail": detail}


def filler_rate_per_minute(filler_count: int, duration_seconds: float) -> float:
    if duration_seconds <= 0:
        return 0.0
    return round((filler_count / duration_seconds) * 60, 2)
