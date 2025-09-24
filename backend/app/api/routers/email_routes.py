import os
import random
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pymysql.connections import Connection
import pymysql

from app.schemas.email import SendCodeIn, VerifyCodeIn
from app.util.email_sender import send_email
from app.db.session import get_connection

router = APIRouter(prefix="", tags=["email-auth"])

# 정책 기본값(환경변수 없으면 이 값 사용)
CODE_TTL_MIN = int(os.getenv("EMAIL_CODE_TTL_MINUTES", "5"))   # 분
COOLDOWN_SEC = int(os.getenv("EMAIL_COOLDOWN_SECONDS", "60"))   # 초

def gen_code(n: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(n))

@router.post("/send-email-code")
def send_email_code(payload: SendCodeIn, bg: BackgroundTasks, conn: Connection = Depends(get_connection)):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    code = gen_code()

    with conn.cursor() as cur:
        # 최근 발송 1건 조회 → 쿨다운 체크
        cur.execute("""
            SELECT sent_at FROM email_verifications
            WHERE email=%s AND purpose=%s
            ORDER BY sent_at DESC
            LIMIT 1
        """, (payload.email, payload.purpose))
        last = cur.fetchone()
        if last:
            diff = (now - last["sent_at"]).total_seconds()
            if diff < COOLDOWN_SEC:
                remain = COOLDOWN_SEC - int(diff)
                raise HTTPException(status_code=429, detail=f"{remain}초 후 다시 시도하세요.")

        # 새 레코드 저장
        cur.execute("""
            INSERT INTO email_verifications
            (email, code, purpose, verified, sent_at, expires_at)
            VALUES (%s, %s, %s, 0, %s, %s)
        """, (payload.email, code, payload.purpose, now, now + timedelta(minutes=CODE_TTL_MIN)))
        conn.commit()

    # 메일 발송은 백그라운드
    subject = "이메일 인증번호"
    body = f"인증번호는 {code} 입니다. 유효기간은 {CODE_TTL_MIN}분입니다."
    bg.add_task(send_email, payload.email, subject, body)

    return {"result": "sent"}

@router.post("/verify-email-code")
def verify_email_code(payload: VerifyCodeIn, conn: Connection = Depends(get_connection)):
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    with conn.cursor() as cur:
        # 최근 발송 중 미검증 & 미만료 1건
        cur.execute("""
            SELECT id, code, expires_at, verified
            FROM email_verifications
            WHERE email=%s AND purpose=%s
            ORDER BY sent_at DESC
            LIMIT 1
        """, (payload.email, payload.purpose))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="코드를 먼저 발송하세요.")
        if row["verified"]:
            return {"result": "already verified"}
        if now > row["expires_at"]:
            raise HTTPException(status_code=400, detail="코드가 만료되었습니다.")
        if payload.code != row["code"]:
            raise HTTPException(status_code=400, detail="코드가 올바르지 않습니다.")

        # 검증 완료
        cur.execute("UPDATE email_verifications SET verified = 1 WHERE id = %s", (row["id"],))
        conn.commit()

    return {"result": "verified"}
