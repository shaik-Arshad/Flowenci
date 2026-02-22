"""
Main analysis orchestrator.
Calls all sub-analyzers and assembles the full feedback object.
"""
from services.transcription import transcribe_audio
from services.analysis.filler_detector import detect_fillers
from services.analysis.pace_analyzer import calculate_wpm, evaluate_pace, detect_pauses
from services.analysis.star_analyzer import analyze_star
from services.analysis.confidence_scorer import score_confidence
from services.coaching.tip_mapper import generate_coaching_tips


def run_full_analysis(
    audio_path: str,
    use_star: bool = False,
    question_text: str = "",
) -> dict:
    # 1. Transcription
    transcription = transcribe_audio(audio_path)
    transcript = transcription["text"]
    duration = transcription.get("duration") or 0
    words = transcription.get("words", [])

    # 2. Filler detection
    filler_result = detect_fillers(transcript)
    filler_count = filler_result["total_count"]
    filler_detail = filler_result["detail"]

    # 3. Pace analysis
    wpm = calculate_wpm(transcript, duration)
    pace_eval = evaluate_pace(wpm)
    pauses = detect_pauses(words, pause_threshold=2.0)
    pause_count = len(pauses)
    total_words = len(transcript.split())

    # 4. STAR analysis
    star_result = analyze_star(transcript, use_star=use_star)
    star_score = star_result.get("star_score")
    star_breakdown = star_result.get("breakdown", {})
    star_missing = star_result.get("missing", [])

    # 5. Confidence + readiness score
    conf_result = score_confidence(
        filler_count=filler_count,
        duration_seconds=duration,
        pause_count=pause_count,
        wpm=wpm,
        star_score=star_score,
    )

    # 6. Coaching tips
    coaching_tips = generate_coaching_tips(
        filler_count=filler_count,
        filler_detail=filler_detail,
        wpm=wpm,
        pause_count=pause_count,
        star_breakdown=star_breakdown,
        star_missing=star_missing,
        confidence_flags=conf_result["flags"],
        duration_seconds=duration,
    )

    return {
        "transcript": transcript,
        "duration_seconds": duration,
        "filler_word_count": filler_count,
        "filler_words_detail": filler_detail,
        "words_per_minute": wpm,
        "total_word_count": total_words,
        "pause_count": pause_count,
        "star_score": star_score,
        "star_breakdown": star_breakdown,
        "pronunciation_issues": [],
        "confidence_score": conf_result["confidence_score"],
        "confidence_flags": conf_result["flags"],
        "readiness_score": conf_result["readiness_score"],
        "coaching_tips": coaching_tips,
    }
