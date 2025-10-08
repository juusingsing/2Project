from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers.user_routes import router as user_router
from app.api.routers.predict_routes import router as predict_router
from app.api.routers.email_routes import router as email_router
from app.api.routers.image_routes import router as image_router
from app.api.routers.gas_stream_routes import router as gas_stream_router
# 함수가져올용도
from app.api.routers import gas_stream_routes

from dotenv import load_dotenv
import os
load_dotenv()  # /app/.env 읽음

app = FastAPI(
    docs_url="/docs",
    openapi_url="/openapi.json",
    redoc_url=None,
)

# 도커 nginx에 CORS설정있어서 주석처리   중복설정X
# origins = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "http://192.168.0.107:3000",   # 예시: 같은 LAN에서 접속
    
# ]

# # 🔐 CORS 설정
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,  # 프론트 주소
#     allow_credentials=False,
#     allow_methods=["*"],             # GET, POST, PUT, DELETE, OPTIONS...
#     allow_headers=["*"],             # Authorization, Content-Type 등
# )

# 라우터 등록
app.include_router(user_router, prefix="/users")
app.include_router(predict_router, prefix="/pred")
app.include_router(email_router, prefix="/email")
app.include_router(image_router, prefix="/image")
app.include_router(gas_stream_router, prefix="/stream")
gas_stream_routes.register_notify_worker(app)

@app.get("/")
def index():
    return {"msg": "Hello from main!"}

@app.get("/healthzzz")
def healthz():
    return {"okzzz": True}