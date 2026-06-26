import edge_tts
import logging

logger = logging.getLogger(__name__)


async def generate_voice(
    text: str,
    output_file: str,
    voice: str = "en-US-AriaNeural",
):
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)
    except Exception as e:
        logger.error("Voice generation failed: %s", e)
        raise