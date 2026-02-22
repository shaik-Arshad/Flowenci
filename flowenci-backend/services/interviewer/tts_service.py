"""
TTS service using gTTS (Google Text-to-Speech) — free, no API key needed.
Returns base64-encoded MP3.
"""
import io
import base64
import asyncio
from functools import partial


async def text_to_speech_base64(text: str) -> str:
    """Convert text to speech, return base64 encoded audio."""
    try:
        from gtts import gTTS
        loop = asyncio.get_event_loop()
        # Run blocking gTTS in thread pool to not block event loop
        tts_func = partial(_synthesize, text)
        audio_b64 = await loop.run_in_executor(None, tts_func)
        return audio_b64
    except ImportError:
        # gTTS not installed — return empty
        return ""
    except Exception as e:
        print(f"[TTS] Error: {e}")
        return ""


def _synthesize(text: str) -> str:
    from gtts import gTTS
    tts = gTTS(text=text, lang="en", slow=False)
    buf = io.BytesIO()
    tts.write_to_fp(buf)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")
