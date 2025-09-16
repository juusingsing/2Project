from fastapi import APIRouter
from pydantic import BaseModel, Field
from db import get_connection

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0)

@router.get("/user")
def get_users():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM wangnuna")  # users 테이블 가정
            rows = cur.fetchall()
        return rows
    finally:
        conn.close()

@router.post("/user")
def add_user(payload: UserCreate):
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = "INSERT INTO wangnuna (name, age) VALUES (%s, %s)"
            cur.execute(sql, (payload.name, payload.age))
        conn.commit()
        return {"msg": "유저 추가성공"}
    finally:
        conn.close()