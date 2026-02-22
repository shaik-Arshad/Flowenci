"""
Confidence scorer — composite readiness score from all metrics.
"""
from typing import Optional


def score_confidence(
    filler_count: int,
    duration_seconds: float,
    pause_count: int,
    wpm: float,
    star_score: Optional[float],
) -> dict:
    """
    Compute confidence score (0-100) and overall readiness score.
    Returns dict with confidence_score, readiness_score, and flags.
    """
    flags = []
    score = 100.0

    # Filler word penalty
    if filler_count > 15:
        score -= 25
        flags.append("high_filler_count")
    elif filler_count > 8:
        score -= 15
        flags.append("moderate_filler_count")
    elif filler_count > 4:
        score -= 5

    # Pace penalty
    if wpm:
        if wpm > 190 or wpm < 80:
            score -= 20
            flags.append("pace_issue")
        elif wpm > 165 or wpm < 100:
            score -= 10

    # Pause penalty
    if pause_count >= 6:
        score -= 15
        flags.append("many_pauses")
    elif pause_count >= 3:
        score -= 5

    # Duration penalty
    if duration_seconds < 30:
        score -= 20
        flags.append("too_short")
    elif duration_seconds < 50:
        score -= 10

    confidence_score = max(0, min(100, score))

    # Readiness = confidence weighted with STAR (if available)
    if star_score is not None:
        readiness = confidence_score * 0.6 + star_score * 0.4
    else:
        readiness = confidence_score

    readiness_score = max(0, min(100, readiness))

    return {
        "confidence_score": round(confidence_score, 1),
        "readiness_score": round(readiness_score, 1),
        "flags": flags,
    }
