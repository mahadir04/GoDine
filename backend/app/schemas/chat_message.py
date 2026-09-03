from pydantic import BaseModel
from typing import Optional, List

class ChatMessageCreate(BaseModel):
    recipient_id: str
    content: str

class ChatMessageResponse(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    created_at: str

    class Config:
        from_attributes = True

class ChatMessageList(BaseModel):
    messages: List[ChatMessageResponse]