import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

MONGO_URI = "mongodb+srv://mithun55ff_db_user:R7blJf2lWQn4WJEK@cluster0.wkbp3jg.mongodb.net/?appName=Cluster0"

async def test_connection():
    print("Testing connection...")
    try:
        client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
        db = client["interview_flow_db"]
        print("Client created.")
        
        # Try a simple command
        print("Pinging...")
        # await client.admin.command('ping') # This might fail if user doesn't have admin access
        
        # Try to find a user (even if empty)
        print("Finding one user...")
        user = await db["users"].find_one({})
        print(f"Find result: {user}")
        
        print("Connection successful!")
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
