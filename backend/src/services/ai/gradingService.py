import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def count_filler_words(text):
    """
    Counts common filler words in the text.
    """
    fillers = ["um", "uh", "like", "you know", "basically", "actually", "literally"]
    count = 0
    found = {}
    
    # Normalize text
    text = text.lower()
    words = text.split()
    
    for word in words:
        # Simple check, can be improved with regex for phrases
        clean_word = re.sub(r'[^\w\s]', '', word)
        if clean_word in fillers:
            count += 1
            found[clean_word] = found.get(clean_word, 0) + 1
            
    return count, found

async def grade_interview(history, interview_type):
    """
    Analyzes the interview transcript and returns a structured score.
    history: List of {"role": "...", "content": "..."}
    """
    
    # Convert history to a single string for the prompt
    transcript_text = ""
    candidate_text_only = ""
    
    for msg in history:
        role = "Interviewer" if msg["role"] == "assistant" else "Candidate"
        transcript_text += f"{role}: {msg['content']}\n"
        if role == "Candidate":
            candidate_text_only += f"{msg['content']} "

    # Calculate filler words locally (more accurate than LLM sometimes)
    filler_count, filler_details = count_filler_words(candidate_text_only)

    system_prompt = f"""
    You are an expert interview evaluator for a {interview_type} interview.
    Analyze the following transcript and provide a structured evaluation.
    
    Return ONLY a JSON object with the following fields:
    - technical_score (0-100): Accuracy of technical answers.
    - communication_score (0-100): Clarity, conciseness, and flow.
    - confidence_score (0-100): Assertiveness and tone.
    - feedback: A short summary of performance (max 3 sentences).
    - strengths: A list of 2-3 strong points.
    - improvements: A list of 2-3 areas to improve.
    - keywords_mentioned: A list of relevant technical keywords or concepts the candidate used.
    - keywords_missed: A list of important keywords or concepts the candidate should have mentioned but didn't.
    
    Do not include markdown formatting like ```json. Just the raw JSON string.
    """

    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": transcript_text}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.2, # Low temp for consistent JSON output
            response_format={"type": "json_object"} # Force JSON mode if supported, or rely on prompt
        )
        
        result = completion.choices[0].message.content
        report = json.loads(result)
        
        # Ensure all fields exist
        required_fields = ["technical_score", "communication_score", "confidence_score", "feedback", "strengths", "improvements", "keywords_mentioned", "keywords_missed"]
        for field in required_fields:
            if field not in report:
                if "score" in field:
                    report[field] = 0
                elif field == "feedback":
                    report[field] = "No feedback generated."
                else:
                    report[field] = []

        # Inject filler word data into the report
        report["filler_word_count"] = filler_count
        report["filler_details"] = filler_details
        
        return report
    except Exception as e:
        print(f"Error grading interview: {e}")
        return {
            "technical_score": 0,
            "communication_score": 0,
            "confidence_score": 0,
            "feedback": "Error generating report.",
            "strengths": [],
            "improvements": [],
            "keywords_mentioned": [],
            "keywords_missed": [],
            "filler_word_count": 0,
            "filler_details": {}
        }
