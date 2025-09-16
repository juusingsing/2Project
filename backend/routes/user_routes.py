from fastapi import APIRouter
from db import get_connection

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/")
def list_users():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name, email FROM users")
            rows = cursor.fetchall()
        return rows
    finally:
        conn.close()