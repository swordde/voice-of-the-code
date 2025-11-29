import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import certifi

load_dotenv()

MONGO_URI = os.environ.get("MONGO_URI")

async def test_connection():
    print(f"Testing connection to: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else 'HIDDEN'}")
    try:
        print("--- STARTING CONNECTION TEST ---")
        # Try with certifi AND invalid certs allowed
        client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
        # Force a connection
        await client.admin.command('ping')
        print("--- SUCCESS: CONNECTED TO MONGODB ---")
    except Exception as e:
        print(f"--- FAILURE: {e} ---")

if __name__ == "__main__":
    asyncio.run(test_connection())
