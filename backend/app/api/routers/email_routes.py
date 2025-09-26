# app/api/routers/email_routes.py
from fastapi import APIRouter, BackgroundTasks, Depends
from pymysql.connections import Connection

from app.schemas.email import SendCodeIn, VerifyCodeIn
from app.db.session import get_connection
from app.services.email import (
    create_and_save_code,
    verify_code,
    send_verification_email,
    emailCheck,
)

router = APIRouter(prefix="", tags=["email-auth"])

@router.get("/emailCheck/{email}")
def emailCheck_handler(email: str, conn: Connection = Depends(get_connection)):
    return emailCheck(conn, email)

@router.post("/send-email-code")
def send_email_code(payload: SendCodeIn, bg: BackgroundTasks, conn: Connection = Depends(get_connection)):
    code = create_and_save_code(conn, payload.email, payload.purpose)
    send_verification_email(bg, payload.email, code)
    return {"result": "입력하신 이메일로 인증번호를 전송했습니다."}


@router.post("/verify-email-code")
def verify_email_code(payload: VerifyCodeIn, conn: Connection = Depends(get_connection)):
    result = verify_code(conn, payload.email, payload.purpose, payload.code)
    return {"result": result}
