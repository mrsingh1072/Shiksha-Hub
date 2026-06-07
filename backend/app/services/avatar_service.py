import edge_tts
import asyncio


async def generate_voice(
    text: str,
    output_file: str
):

    communicate = edge_tts.Communicate(
        text,
        "en-US-AriaNeural"
    )

    await communicate.save(
        output_file
    )