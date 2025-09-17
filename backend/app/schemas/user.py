# app/schemas/user.py
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)

class UserOut(BaseModel):
    id: int
    name: str
    age: int
