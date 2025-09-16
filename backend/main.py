from fastapi import FastAPI
from routes.user_routes import router as user_router

app = FastAPI()

# 라우터 등록
app.include_router(user_router)

@app.get("/")
def index():
    return {"msg": "Hello from main!"}