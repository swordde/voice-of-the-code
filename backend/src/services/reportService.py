from src.config.database import db
from datetime import datetime, timedelta

async def update_streak(email):
    """
    Updates the user's streak based on their last practice date.
    """
    users = db.get_db()["users"]
    user = await users.find_one({"email": email})
    
    if not user:
        return

    now = datetime.utcnow()
    today = now.date()
    
    last_practice = user.get("last_practice_date")
    current_streak = user.get("streak", 0)
    
    if last_practice:
        last_date = last_practice.date()
        if last_date == today:
            # Already practiced today, do nothing
            pass
        elif last_date == today - timedelta(days=1):
            # Practiced yesterday, increment streak
            current_streak += 1
        else:
            # Missed a day (or more), reset streak
            current_streak = 1
    else:
        # First time practicing
        current_streak = 1
        
    await users.update_one(
        {"email": email},
        {
            "$set": {
                "last_practice_date": now,
                "streak": current_streak
            }
        }
    )

async def save_report_to_db(report_data, interview_type, user_email=None):
    """
    Saves the generated interview report to MongoDB.
    """
    if not db.client:
        print("Database not connected. Skipping save.")
        return None

    document = {
        "user_email": user_email,
        "timestamp": datetime.utcnow(),
        "type": interview_type,
        "scores": {
            "technical": report_data.get("technical_score", 0),
            "communication": report_data.get("communication_score", 0),
            "confidence": report_data.get("confidence_score", 0)
        },
        "feedback": report_data.get("feedback", ""),
        "strengths": report_data.get("strengths", []),
        "improvements": report_data.get("improvements", []),
        "keywords_mentioned": report_data.get("keywords_mentioned", []),
        "keywords_missed": report_data.get("keywords_missed", []),
        "filler_word_count": report_data.get("filler_word_count", 0),
        "filler_details": report_data.get("filler_details", {})
    }
    
    try:
        result = await db.get_db()["reports"].insert_one(document)
        print(f"Report saved with ID: {result.inserted_id}")
        
        if user_email:
            await update_streak(user_email)
            
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving report: {e}")
        return None

async def get_recent_reports(user_email=None, limit=5):
    """
    Fetches the most recent reports from MongoDB.
    """
    if not db.client:
        return []
    
    try:
        query = {}
        if user_email:
            query["user_email"] = user_email
            
        cursor = db.get_db()["reports"].find(query).sort("timestamp", -1).limit(limit)
        reports = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string for JSON serialization
        for report in reports:
            report["_id"] = str(report["_id"])
            
        return reports
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return []
