from src.services.ai.transcriptionService import TranscriptionService
import os

# Ensure key is unset
if "DEEPGRAM_API_KEY" in os.environ:
    del os.environ["DEEPGRAM_API_KEY"]

print("Initializing TranscriptionService...")
try:
    ts = TranscriptionService()
    print("Initialization successful")
except Exception as e:
    print(f"Initialization failed: {e}")
