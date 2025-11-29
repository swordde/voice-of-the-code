from pydantic import BaseModel, EmailStr, ValidationError

class User(BaseModel):
    email: EmailStr

try:
    User(email='test@example.com')
    print('Validation works')
except Exception as e:
    print(f"Validation failed: {e}")
