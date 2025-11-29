from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

try:
    print("Hashing...")
    hash = pwd_context.hash("password123")
    print(f"Hash: {hash}")
    print("Verifying...")
    verify = pwd_context.verify("password123", hash)
    print(f"Verify: {verify}")
except Exception as e:
    print(f"Error: {e}")
