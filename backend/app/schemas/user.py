# app/schemas/user.py
from pydantic import BaseModel, Field, EmailStr


class UserRegister(BaseModel):
    user_id: str = Field(..., max_length=50, description="로그인 아이디")
    password: str = Field(..., max_length=255, description="비밀번호 (해시 저장 예정)")
    name: str = Field(..., min_length=1, max_length=100, description="이름")
    email: EmailStr = Field(..., min_length=1, description="이메일")

    phone: str | None = Field(None, max_length=20, description="전화번호")
    company: str | None = Field(None, max_length=100, description="회사명")
    department: str | None = Field(None, max_length=100, description="부서명")
    position: str | None = Field(None, max_length=100, description="직급")

class UserLogin(BaseModel):
    user_id: str = Field(..., description="로그인 아이디")
    password: str = Field(..., description="비밀번호")

class UserCreateTest(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)

class UserOutTest(BaseModel):
    id: int
    name: str
    age: int
