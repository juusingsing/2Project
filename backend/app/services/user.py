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

def idCheck(conn: Connection, user_id: str) -> str:
    """비밀번호찾기에서 아이디찾기"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT user_id
            FROM users
            WHERE user_id = %s AND del_yn = 'N'
        """, (user_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="아이디가 존재하지않습니다.")
    return row
    
def getId(conn: Connection, email: str) -> str:
    """아이디찾기"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT user_id, created_at
            FROM users
            WHERE email = %s AND del_yn = 'N'
        """, (email,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="아이디가 존재하지않습니다.")
    return row

def reset_password(conn: Connection, user) -> str:
    """비밀번호 재설정"""
    with conn.cursor() as cur:
        # 비밀번호 업데이트
        sql = """
            UPDATE users
            SET password = %s
            WHERE email = %s AND del_yn = 'N'
        """
        hashed_pw = pwd_ctx.hash(user.password)
        cur.execute(sql, (hashed_pw, user.email,))
        affected = cur.rowcount   # 영향을 받은 행 수
        
        conn.commit()

        if affected == 0:
            raise HTTPException(status_code=401, detail="비밀번호 재설정 실패")

    return "비밀번호 재설정 성공"


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

def edit_user_info(conn: Connection, user) -> str:
    """회원정보 수정"""
    try:
        with conn.cursor() as cur:
            sql = """
                UPDATE users
                SET
                    name       = %s,
                    phone      = NULLIF(%s, ''),
                    company    = NULLIF(%s, ''),
                    department = NULLIF(%s, ''),
                    position   = NULLIF(%s, ''),
                    updated_at = NOW()
                WHERE email = %s AND del_yn = 'N'
            """
            cur.execute(sql, (
                user.name,
                user.phone or "",
                user.company or "",
                user.department or "",
                user.position or "",
                user.email,
            ))
            if cur.rowcount == 0:
                raise HTTPException(status_code=404, detail="회원정보 수정 실패")

        conn.commit()
        
        return "회원정보 수정 성공"

    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print("edit_user_info error:", e)
        raise HTTPException(status_code=500, detail="internal error")