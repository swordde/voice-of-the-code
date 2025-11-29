import os
import requests
from dotenv import load_dotenv

load_dotenv()

class TextToSpeechService:
    def __init__(self):
        self.api_key = os.environ.get("ELEVENLABS_API_KEY")
        self.voice_id = "21m00Tcm4TlvDq8ikWAM" # Rachel Voice (Default)
        
    def generate_audio(self, text):
        if not self.api_key:
            print("Warning: ELEVENLABS_API_KEY not found")
            return None
            
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{self.voice_id}"
        
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        
        try:
            response = requests.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return response.content
            else:
                print(f"ElevenLabs Error: {response.text}")
                return None
        except Exception as e:
            print(f"Error generating audio: {e}")
            return None
