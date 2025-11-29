import os
from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents
from dotenv import load_dotenv

load_dotenv()

class TranscriptionService:
    def __init__(self):
        self.api_key = os.environ.get("DEEPGRAM_API_KEY")
        if not self.api_key:
            print("Warning: DEEPGRAM_API_KEY not found")
            self.deepgram = None
        else:
            self.deepgram = DeepgramClient(self.api_key)
        self.connection = None

    async def connect(self, on_message):
        if not self.deepgram:
            return False

        try:
            # Create a websocket connection to Deepgram
            self.connection = self.deepgram.listen.live.v("1")
            
            def on_result(self, result, **kwargs):
                # Only send final results to avoid flooding the frontend
                if result.is_final:
                    sentence = result.channel.alternatives[0].transcript
                    if len(sentence) > 0:
                        on_message(sentence)

            self.connection.on(LiveTranscriptionEvents.Transcript, on_result)

            options = LiveOptions(
                model="nova-2",
                language="en-US",
                smart_format=True,
            )
            
            if self.connection.start(options) is False:
                print("Failed to start Deepgram connection")
                return False
                
            return True
        except Exception as e:
            print(f"Error connecting to Deepgram: {e}")
            return False

    def send_audio(self, audio_data):
        if self.connection:
            self.connection.send(audio_data)

    def close(self):
        if self.connection:
            self.connection.finish()
