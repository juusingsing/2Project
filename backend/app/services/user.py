# app/services/user.py
from fastapi import HTTPException
from pymysql.connections import Connection
from passlib.context import CryptContext

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def check_duplicate_id(conn: Connection, user_id: str) -> str:
    """아이디 중복 체크"""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(1) AS cnt FROM users WHERE user_id = %s", (user_id,))
            row = cur.fetchone()
            cnt = row[0] if isinstance(row, (list, tuple)) else row.get("cnt", 0)
            return "exists" if cnt > 0 else "not exists"
    except Exception as e:
        print("duplicateId error:", e)
        raise HTTPException(status_code=500, detail="internal error")


def register_user(conn: Connection, user) -> str:
    """회원가입"""
    with conn.cursor() as cur:
        sql = """
        INSERT INTO users (user_id, password, name, email, phone, company, department, position)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        hashed = pwd_ctx.hash(user.password)
        cur.execute(sql, (
            user.user_id, hashed, user.name, user.email,
            user.phone, user.company, user.department, user.position
        ))
        conn.commit()
    return "success"


def login_user(conn: Connection, payload):
    """로그인"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT user_id, password, name, email
            FROM users
            WHERE user_id = %s AND del_yn = 'N'
            LIMIT 1
        """, (payload.user_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

        if not pwd_ctx.verify(payload.password, row["password"]):
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

        return {
            "result": "ok",
            "user": {
                "user_id": row["user_id"],
                "name": row["name"],
                "email": row["email"],
            }
        }


def get_user_info(conn: Connection, user_id: str):
    """사용자 정보 조회"""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
            row = cur.fetchone()
            return row
    except Exception as e:
        print("userInfo error:", e)
        raise HTTPException(status_code=500, detail="internal error")
