import bcrypt
import sys

print("Starting bcrypt test (direct)...")
try:
    password = "test"
    print(f"Password: {password}")
    
    # Hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    print(f"Hash created: {hashed}")
    
    # Verify
    verify = bcrypt.checkpw(password.encode('utf-8'), hashed)
    print(f"Verification: {verify}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
