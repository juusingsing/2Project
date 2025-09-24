# app/api/routers/user_routes.py
from fastapi import APIRouter, Depends
from pymysql.connections import Connection

from app.schemas.user import UserRegister, UserLogin
from app.db.session import get_connection
from app.services.user import (
    check_duplicate_id,
    register_user,
    login_user,
    get_user_info,
)

router = APIRouter(prefix="", tags=["users"])


@router.get("/duplicateId/{id}")
def duplicate_id(id: str, conn: Connection = Depends(get_connection)):
    result = check_duplicate_id(conn, id)
    return {"result": result}


@router.post("/register")
def register(user: UserRegister, conn: Connection = Depends(get_connection)):
    result = register_user(conn, user)
    return {"result": result}


@router.post("/login")
def login(payload: UserLogin, conn: Connection = Depends(get_connection)):
    return login_user(conn, payload)


@router.get("/userInfo/{id}")
def user_info(id: str, conn: Connection = Depends(get_connection)):
    row = get_user_info(conn, id)
    return row
