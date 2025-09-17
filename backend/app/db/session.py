# backend/app/db/session.py
import os
import pymysql
from pymysql.cursors import DictCursor
from contextlib import contextmanager
from dotenv import load_dotenv

# .env 로드 (앱 프로세스 시작 시 1회)
load_dotenv()

# ── 환경변수: 기존 네이밍 그대로 유지 (MYSQL_*)
DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "192.168.0.107"),
    "port": int(os.getenv("MYSQL_PORT", "3307")),  # 프록시/도커 포트면 그대로
    "user": os.getenv("MYSQL_USER", "project2"),
    "password": os.getenv("MYSQL_PASSWORD", "1111"),
    "database": os.getenv("MYSQL_DATABASE", "secondpj"),
    "charset": "utf8mb4",
    "cursorclass": DictCursor,
    "autocommit": False,
}

def get_connection():
    """내부 커넥션 팩토리"""
    return pymysql.connect(**DB_CONFIG)

# def get_connection():
#     """
#     FastAPI 의존성으로 사용하는 커넥션 제공자.
#     라우터에서: conn: Connection = Depends(get_connection)
#     """
#     conn = _connect()
#     try:
#         yield conn
#     finally:
#         try:
#             conn.close()
#         except Exception:
#             pass

# @contextmanager
# def connection_ctx():
#     """
#     비-FastAPI 컨텍스트(스크립트, 배치)에서 쓰기 좋은 컨텍스트 매니저.
#     with connection_ctx() as conn:
#         ...
#     """
#     conn = _connect()
#     try:
#         yield conn
#         conn.commit()
#     except Exception:
#         conn.rollback()
#         raise
#     finally:
#         conn.close()
