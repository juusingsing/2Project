from fastapi import APIRouter, Depends, HTTPException
from pymysql.connections import Connection
from app.schemas.user import UserCreateTest, UserRegister, UserLogin
from app.db.session import get_connection

# 비밀번호 해시
from passlib.context import CryptContext
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="", tags=["users"])


@router.get("/duplicateId/{id}")
def check_duplicate_id(id: str, conn: Connection = Depends(get_connection)):
    try:
        with conn.cursor() as cur:
            sql = "SELECT COUNT(1) AS cnt FROM users WHERE user_id = %s"
            cur.execute(sql, (id,))
            row = cur.fetchone()          # 튜플 또는 딕셔너리(커서 타입에 따라)
             # 튜플 커서인 경우
            if isinstance(row, (list, tuple)):
                cnt = int(row[0]) if row and row[0] is not None else 0
            else:
                # DictCursor 인 경우
                cnt = int(row.get("cnt", 0))

            return {"result": "exists" if cnt > 0 else "not exists"}
    except Exception as e:
        # 디버깅을 위해 로그 남기기
        print("duplicateId error:", e)
        raise HTTPException(status_code=500, detail="internal error")
    finally:
        conn.close()


@router.post("/register")
def register_user(user: UserRegister, conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        
        sql = """
        INSERT INTO users (user_id, password, name, email, phone, company, department, position)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        hashed = pwd_ctx.hash(user.password)
        # INSERT 시 password 대신 hashed 사용

        cur.execute(sql, (
            user.user_id, hashed, user.name, user.email,
            user.phone, user.company, user.department, user.position
        ))
        conn.commit()
    return {"result": "success"}


@router.post("/login")
def add_user(payload: UserLogin, conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
         # del_yn = 'N' 인 활성 사용자만
        cur.execute("""
            SELECT user_id, password, name, email
            FROM users
            WHERE user_id = %s AND del_yn = 'N'
            LIMIT 1
        """, (payload.user_id,))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

        # 해시 검증
        if not pwd_ctx.verify(payload.password, row["password"]):
            raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 올바르지 않습니다.")

        # 로그인 성공 응답 (토큰이 없다면 최소 정보 반환)
        return {
            "result": "ok",
            "user": {
                "user_id": row["user_id"],
                "name": row["name"],
                "email": row["email"],
            }
        }
    
@router.get("/userInfo/{id}")
def check_duplicate_id(id: str, conn: Connection = Depends(get_connection)):
    try:
        with conn.cursor() as cur:
            sql = "SELECT * FROM users WHERE user_id = %s"
            cur.execute(sql, (id,))
            row = cur.fetchone()

            return row
    except Exception as e:
        print("error:", e)
        raise HTTPException(status_code=500, detail="internal error")
    finally:
        conn.close()



@router.get("/usertest")
def get_users(conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM wangnuna")
        return cur.fetchall()

@router.post("/usertest")
def add_user(payload: UserCreateTest, conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO wangnuna (name, age) VALUES (%s, %s)",
            (payload.name, payload.age),
        )
    conn.commit()
    return {"msg": "유저 추가성공"}


@router.get("/usertest/{id}")
def get_users(id:int, conn: Connection = Depends(get_connection)):
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM wangnuna WHERE id = %s", (id,))
        row = cur.fetchone()
        return row