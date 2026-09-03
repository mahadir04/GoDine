from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.chat_service import process_chat_query
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat_message import ChatMessage

router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@router.post("/")
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Processes chat queries. If the message is a user-to-user chat request
    (recipient_id specified), it stores and forwards the message.
    Otherwise, it processes as a geospatial query for venue recommendations.
    """
    if request.message.startswith("/msg "):
        parts = request.message[5:].strip().split(" ", 1)
        if len(parts) == 2:
            recipient_id, content = parts[0], parts[1]
            # Save user-to-user message
            db_message = ChatMessage(
                sender_id=current_user.id,
                recipient_id=recipient_id,
                content=content
            )
            db.add(db_message)
            db.commit()
            db.refresh(db_message)
            return {"response": f"Message sent to user {recipient_id}", "message_id": db_message.id}
    
    bot_response = process_chat_query(db, request.message)
    return {"response": bot_response}

@router.get("/recipients")
def get_chat_recipients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of users with opposite role for chat."""
    my_role = current_user.role
    recipients = db.query(User).filter(User.role != my_role).all()
    return [{"id": r.id, "email": r.email, "full_name": r.full_name, "role": r.role} for r in recipients]