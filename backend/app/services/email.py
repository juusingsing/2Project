# app/services/email.py
import os
import random
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from pymysql.connections import Connection

from app.util.email_sender import send_email

# 정책 기본값 (환경변수 없으면 이 값 사용)
CODE_TTL_MIN = int(os.getenv("EMAIL_CODE_TTL_MINUTES", "5"))   # 분
COOLDOWN_SEC = int(os.getenv("EMAIL_COOLDOWN_SECONDS", "60"))  # 초


def gen_code(n: int = 6) -> str:
    return "".join(str(random.randint(0, 9)) for _ in range(n))


def create_and_save_code(conn: Connection, email: str, purpose: str) -> str:
    """코드 생성 후 DB 저장, 쿨다운 검사"""
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    code = gen_code()

    with conn.cursor() as cur:
        # idFind 목적일 경우 이메일 존재 여부 확인
        if purpose == "idFind":
            cur.execute("SELECT 1 FROM users WHERE email=%s LIMIT 1", (email,))
            if not cur.fetchone():
                raise HTTPException(status_code=404, detail="가입된 아이디가 없습니다.")

        # 최근 발송 1건 조회 → 쿨다운 체크
        cur.execute("""
            SELECT sent_at FROM email_verifications
            WHERE email=%s AND purpose=%s
            ORDER BY sent_at DESC
            LIMIT 1
        """, (email, purpose))
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
        """, (email, code, purpose, now, now + timedelta(minutes=CODE_TTL_MIN)))
        conn.commit()

    return code


def verify_code(conn: Connection, email: str, purpose: str, code: str) -> str:
    """코드 검증"""
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, code, expires_at, verified
            FROM email_verifications
            WHERE email=%s AND purpose=%s
            ORDER BY sent_at DESC
            LIMIT 1
        """, (email, purpose))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="코드를 먼저 발송하세요.")
        if row["verified"]:
            return "already verified"
        if now > row["expires_at"]:
            raise HTTPException(status_code=400, detail="코드가 만료되었습니다.")
        if code != row["code"]:
            raise HTTPException(status_code=400, detail="코드가 올바르지 않습니다.")

        # 검증 완료
        cur.execute("UPDATE email_verifications SET verified = 1 WHERE id = %s", (row["id"],))
        conn.commit()

    return "verified"


def send_verification_email(bg, email: str, code: str):
    """실제 메일 발송"""
    subject = "이메일 인증번호"
    body = f"인증번호는 {code} 입니다. 유효기간은 {CODE_TTL_MIN}분입니다."
    bg.add_task(send_email, email, subject, body)
