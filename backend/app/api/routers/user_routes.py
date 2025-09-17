from fastapi import APIRouter, Depends
from pymysql.connections import Connection
from pydantic import BaseModel, Field
from app.schemas.user import UserCreate
from app.db.session import get_connection

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/user")
def get_users(conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM wangnuna")
        return cur.fetchall()

@router.post("/user")
def add_user(payload: UserCreate, conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO wangnuna (name, age) VALUES (%s, %s)",
            (payload.name, payload.age),
        )
    conn.commit()
    return {"msg": "유저 추가성공"}
