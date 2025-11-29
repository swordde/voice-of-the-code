from fastapi import APIRouter, HTTPException, status, Depends
from src.models.user import UserCreate, UserLogin, Token
from src.services.authService import get_password_hash, verify_password, create_access_token
from src.config.database import db
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user: UserCreate):
    try:
        if not db.client:
            print("Database client is None")
            raise HTTPException(status_code=500, detail="Database not connected")
        
        users_collection = db.get_db()["users"]
        
        # Check if user exists
        print(f"Checking for existing user: {user.email}")
        existing_user = await users_collection.find_one({"email": user.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        print("Hashing password...")
        try:
            hashed_password = get_password_hash(user.password)
            print(f"Password hashed: {hashed_password[:10]}...")
        except Exception as e:
            print(f"Hashing failed: {e}")
            raise e

        new_user = {
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_password
        }
        
        print(f"Inserting new user: {user.email}")
        result = await users_collection.insert_one(new_user)
        print(f"User inserted with ID: {result.inserted_id}")
        
        # Create token
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        print(f"Error during registration: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    print(f"Login attempt for: {user.email}")
    if not db.client:
        print("Database not connected during login")
        raise HTTPException(status_code=500, detail="Database not connected")
        
    users_collection = db.get_db()["users"]
    
    # Find user
    db_user = await users_collection.find_one({"email": user.email})
    if not db_user:
        print(f"User not found: {user.email}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Verify password
    print("Verifying password...")
    try:
        if not verify_password(user.password, db_user["hashed_password"]):
            print("Password verification failed")
            raise HTTPException(status_code=400, detail="Incorrect email or password")
    except Exception as e:
        print(f"Error during password verification: {e}")
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    # Create token
    print("Login successful, creating token")
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
