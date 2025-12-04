from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Body, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.services.ai.llmService import get_ai_response
import src.services.ai.llmService as llm_module
# from src.services.ai.transcriptionService import TranscriptionService
# from src.services.ai.ttsService import TextToSpeechService
from src.services.ai.gradingService import grade_interview
from src.services.reportService import save_report_to_db, get_recent_reports
from src.services.authService import get_current_user
from src.config.database import db
from src.routes import auth
import asyncio
import json
import base64

app = FastAPI()

@app.websocket("/ws/ping")
async def websocket_ping(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("pong")
    await websocket.close()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.on_event("startup")
async def startup_db_client():
    db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    db.close()

@app.get("/")
def read_root():
    return {"message": "InterviewFlow AI Backend is running! UPDATED"}

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {
        "username": current_user["username"],
        "email": current_user["email"],
        "streak": current_user.get("streak", 0)
    }

@app.post("/grade")
async def generate_report(data: dict = Body(...), current_user: dict = Depends(get_current_user)):
    history = data.get("history", [])
    interview_type = data.get("type", "technical")
    
    report = await grade_interview(history, interview_type)
    
    # Save the report to MongoDB with user email
    await save_report_to_db(report, interview_type, user_email=current_user["email"])
    
    return report

@app.get("/reports")
async def get_reports(current_user: dict = Depends(get_current_user)):
    return await get_recent_reports(user_email=current_user["email"])

@app.websocket("/ws/interview/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, type: str = "technical", difficulty: str = "medium"):
    print(f"WebSocket connection attempt: {client_id}, type: {type}, difficulty: {difficulty}")
    try:
        await websocket.accept()
        print(f"WebSocket accepted: {client_id}")
    except Exception as e:
        print(f"WebSocket accept failed: {e}")
        return

    history = []
    
    # Queue for sending messages back to the client
    response_queue = asyncio.Queue()
    
    # State to hold current user answer
    current_transcript = []

    async def receive_audio():
        try:
            while True:
                message = await websocket.receive()
                # print(f"Received message type: {message.keys()}") # Debug
                if "text" in message:
                    data = json.loads(message["text"])
                    if data.get("type") == "submit_answer":
                        # User finished speaking, trigger AI
                        # Check if text was provided directly (Browser STT) or accumulated (Server STT)
                        if data.get("text"):
                            full_answer = data.get("text")
                        else:
                            full_answer = " ".join(current_transcript)
                        
                        current_transcript.clear() # Reset for next turn
                        
                        # Add to history
                        history.append({"role": "user", "content": full_answer})
                        
                        # Get AI Response
                        print(f"Calling AI Service from {llm_module.__file__}")
                        ai_reply = await get_ai_response(history, type, difficulty)
                        print(f"AI Service returned: {ai_reply}")
                        # ai_reply = "UPDATED MOCK"
                        history.append({"role": "assistant", "content": ai_reply})
                        
                        # Send Text Response
                        await response_queue.put({"type": "ai_response", "text": ai_reply})
                        
        except WebSocketDisconnect:
            pass
        except Exception as e:
            print(f"Error in receive_audio: {e}")

    async def send_responses():
        try:
            while True:
                item = await response_queue.get()
                
                if item["type"] == "transcript":
                    current_transcript.append(item["text"])
                    await websocket.send_text(json.dumps(item))
                else:
                    await websocket.send_text(json.dumps(item))
                
        except Exception as e:
            print(f"Error in send_responses: {e}")

    # Initial greeting
    initial_greeting = "Hello! I'm your interviewer today. Let's start with a simple question: Tell me about yourself."
    history.append({"role": "assistant", "content": initial_greeting})
    await response_queue.put({"type": "ai_response", "text": initial_greeting})

    try:
        await asyncio.gather(receive_audio(), send_responses())
    except Exception as e:
        print(f"Connection closed: {e}")

