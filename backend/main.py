from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.user_routes import router as user_router

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.0.10:3000",   # 예시: 같은 LAN에서 접속
]

# 🔐 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 프론트 주소
    allow_credentials=True,
    allow_methods=["*"],             # GET, POST, PUT, DELETE, OPTIONS...
    allow_headers=["*"],             # Authorization, Content-Type 등
)

# 라우터 등록
app.include_router(user_router)

@app.get("/")
def index():
    return {"msg": "Hello from main!"}