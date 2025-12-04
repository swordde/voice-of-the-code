import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize the client
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

async def get_ai_response(history, interview_type, difficulty="medium", topic=None):
    """
    history: A list of dictionaries [{"role": "user", "content": "..."}, ...]
    interview_type: "technical", "hr", etc.
    difficulty: "easy", "medium", "hard"
    topic: Specific topic for practice (e.g., "Python DSA", "React Hooks")
    """
    
    # 1. Define the Persona based on selection
    base_prompts = {
        "technical": "You are a strict Senior Software Architect. Ask deep technical questions. Be concise. Do not be overly friendly.",
        "hr": "You are a professional HR Manager. Focus on behavioral questions using the STAR method.",
        "managerial": "You are a VP of Engineering. Focus on leadership and conflict resolution.",
        "system_design": "You are a Lead Engineer focusing on scalability and architecture. Maintain a professional tone.",
        "dsa_practice": "You are a coding problem generator. You are NOT an interviewer. Your ONLY job is to output a coding problem. Do not say 'Hello'. Do not say 'Let's start'. Do not ask 'Are you ready?'. IMMEDIATELY provide the problem title and description. The user is here to practice, not to chat."
    }
    
    difficulty_modifiers = {
        "easy": "Ask fundamental, beginner-friendly questions (e.g. Arrays, Strings).",
        "medium": "Ask standard industry-level questions. Expect solid understanding but allow for some guidance.",
        "hard": "Ask complex, edge-case heavy, and deep-dive questions. Be rigorous and challenge assumptions. Do not give hints."
    }

    base_prompt = base_prompts.get(interview_type, "You are a professional interviewer.")
    difficulty_prompt = difficulty_modifiers.get(difficulty, difficulty_modifiers["medium"])
    
    topic_prompt = ""
    if topic:
        topic_prompt = f" The specific topic for this session is '{topic}'. Focus all your questions and evaluation on this topic."
    
    full_system_prompt = f"{base_prompt} The difficulty level is {difficulty.upper()}. {difficulty_prompt}{topic_prompt}"

    # 2. Construct the messages list
    messages = [
        {"role": "system", "content": full_system_prompt}
    ]
    
    # Add the conversation history so the AI remembers context
    messages.extend(history)

    # 3. Call Groq
    try:
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile", # Updated to a supported model
            temperature=0.6,        # Lower temperature = more formal/focused
            max_tokens=150,         # Keep answers short for voice interaction
        )
        return chat_completion.choices[0].message.content
    except Exception as e:
        print(f"Error calling Groq: {e}")
        return "I apologize, but I am having trouble processing that right now."
