"""
Pace analyzer: words per minute, pace evaluation, and pause detection.
"""
from typing import List, Dict


def calculate_wpm(transcript: str, duration_seconds: float) -> float:
    """Calculate words per minute."""
    if duration_seconds <= 0:
        return 0.0
    word_count = len(transcript.split())
    return round((word_count / duration_seconds) * 60, 1)


def evaluate_pace(wpm: float) -> str:
    """Evaluate speaking pace."""
    if wpm < 90:
        return "very_slow"
    elif wpm < 120:
        return "slow"
    elif wpm <= 160:
        return "ideal"
    elif wpm <= 190:
        return "fast"
    else:
        return "very_fast"


def detect_pauses(words: List[Dict], pause_threshold: float = 2.0) -> List[Dict]:
    """
    Detect significant pauses between words using word-level timestamps.
    Returns list of pauses with duration info.
    """
    pauses = []
    for i in range(1, len(words)):
        prev_end = words[i - 1].get("end", 0)
        curr_start = words[i].get("start", 0)
        gap = curr_start - prev_end
        if gap >= pause_threshold:
            pauses.append({
                "before_word": words[i].get("word", ""),
                "duration": round(gap, 2),
            })
    return pauses
