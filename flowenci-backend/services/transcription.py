"""
Transcription using OpenAI Whisper API.
Tuned for Indian English accents via prompt priming.
"""
from openai import OpenAI
from pathlib import Path
from config import get_settings

settings = get_settings()

WHISPER_PROMPT = (
    "This is an interview answer by an Indian engineering student or professional. "
    "Common words: implemented, algorithm, experience, responsibilities, achievement, "
    "leadership, teamwork, project, deadline, challenge, solution, result, internship."
)


def transcribe_audio(file_path: str | Path) -> dict:
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    client = OpenAI(api_key=settings.openai_api_key)

    with open(file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model=settings.openai_whisper_model,
            file=audio_file,
            language="en",
            prompt=WHISPER_PROMPT,
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )

    words = []
    if hasattr(response, "words") and response.words:
        for w in response.words:
            words.append({"word": w.word, "start": w.start, "end": w.end})

    return {
        "text": response.text.strip(),
        "language": getattr(response, "language", "en"),
        "duration": getattr(response, "duration", None),
        "words": words,
    }
