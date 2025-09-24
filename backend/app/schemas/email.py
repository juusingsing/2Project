from pydantic import BaseModel, EmailStr, Field

class SendCodeIn(BaseModel):
    email: EmailStr
    purpose: str = Field(max_length=32)

class VerifyCodeIn(BaseModel):
    email: EmailStr
    purpose: str = Field(max_length=32)
    code: str = Field(..., min_length=6, max_length=6)