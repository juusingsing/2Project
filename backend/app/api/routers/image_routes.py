# app/api/serve.py
from fastapi import APIRouter
from pydantic import BaseModel
import subprocess, os, sys
from pathlib import Path

router = APIRouter(prefix="", tags=["serve"])

MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", "/data/videos"))  # 컨테이너 내부 기준
IMAGE_ENTRY = ["python", "-m", "app.services.image"]       # 너의 기존 모듈 실행

class ProcessReq(BaseModel):
    # 필요한 경우 확장: prefix, result_name 등
    result_name: str | None = None  # result_with_severity.mp4 대신 커스텀 이름 원하면

@router.post("/process")
def process_video(req: ProcessReq):
    # 결과 이름 결정
    result_name = req.result_name or "result_with_severity.mp4"
    out_path = MEDIA_ROOT / "result" / result_name
    out_path.parent.mkdir(parents=True, exist_ok=True)

    # image.py가 MEDIA_ROOT 기준으로 RGB/T/weights를 읽고,
    # 저장은 MEDIA_ROOT/result/{result_name} 으로 하도록(아래 '3) image.py 수정' 참고)
    env = os.environ.copy()
    # env["MEDIA_ROOT"] = str(MEDIA_ROOT)
    env["RESULT_NAME"] = result_name

    # 모듈 실행 (에러 시 예외 발생)
    subprocess.run(IMAGE_ENTRY, check=True, env=env)

    return {
        "status": "ok",
        "result_url": f"/videos/result/{result_name}"  # Nginx가 서빙
    }

@router.get("/healthz")
def healthz():
    return {"ok": True}
