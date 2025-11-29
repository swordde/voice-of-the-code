import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")
DB_NAME = "interview_flow_db"

class Database:
    client: AsyncIOMotorClient = None

    def connect(self):
        if not MONGO_URI:
            print("Warning: MONGO_URI not found in environment variables.")
            return
        
        # Use certifi to provide valid SSL certificates
        self.client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
        print("Connected to MongoDB.")

    def close(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB.")

    def get_db(self):
        if self.client:
            return self.client[DB_NAME]
        return None

db = Database()
