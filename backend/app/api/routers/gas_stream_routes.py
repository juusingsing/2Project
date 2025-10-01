# backend/app/services/gas_stream.py
import cv2, numpy as np, time, asyncio
from fastapi import APIRouter, WebSocket
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="", tags=["gas_stream"])
clients = []  # 연결된 WebSocket 클라이언트

# --------------------------
# ✅ 추가: 전역 큐
# --------------------------
notify_queue: asyncio.Queue = asyncio.Queue()

# --------------------------
# WebSocket: 이벤트 알림
# --------------------------
@router.websocket("/events")
async def websocket_endpoint(websocket: WebSocket):
    print(">>> WS 연결 시도 들어옴")
    await websocket.accept()
    clients.append(websocket)
    await websocket.send_json({"msg": "connected!"})
    try:
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        print("WS closed:", e)
        clients.remove(websocket)

async def notify_blocking(video_id: int):
    """차단 이벤트 브로드캐스트"""
    living = []
    for ws in clients:
        try:
            await ws.send_json({"video": video_id, "blocking": True})
            living.append(ws)
        except:
            pass
    clients[:] = living

async def notify_worker():
    while True:
        video_id = await notify_queue.get()
        await notify_blocking(video_id)

# --------------------------
# 영상 프레임 제너레이터
# --------------------------
def frame_generator(video_id: int, path: str):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30   # 영상 FPS (기본 30)
    delay = 1 / fps

    block_triggered, block_time = False, None
    PIXEL_THRESHOLD_RATIO = 0.001
    BLOCK_DURATION = 5

    while True:  # 무한 루프
        ret, frame = cap.read()
        if not ret:
            # 영상 끝났으면 처음으로 되돌리기
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # --- 가스 감지 로직 ---
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        mask = cv2.inRange(hsv, (40, 50, 50), (80, 255, 255))
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

        green_ratio = cv2.countNonZero(mask) / (frame.shape[0] * frame.shape[1])
        gas_detected = green_ratio > PIXEL_THRESHOLD_RATIO

        if gas_detected and not block_triggered:
            block_triggered, block_time = True, time.time()
            # asyncio.run(notify_blocking(video_id))
            notify_queue.put_nowait(video_id)

        if block_triggered and block_time and (time.time() - block_time > BLOCK_DURATION):
            block_triggered = False

        if gas_detected:
            cv2.putText(frame, "Gas Detected!", (330, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
        if block_triggered:
            cv2.putText(frame, "Blocking Activated", (330, 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,255), 2)

        _, jpeg = cv2.imencode(".jpg", frame)
        yield (b"--frame\r\n"
               b"Content-Type: image/jpeg\r\n\r\n" + jpeg.tobytes() + b"\r\n")
        
        # --- FPS 맞추기 ---
        time.sleep(delay)


# --------------------------
# API 엔드포인트
# --------------------------
@router.get("/{video_id}")
def stream_video(video_id: int):
    path_map = {
        1: "/data/videos/11.mp4",
        2: "/data/videos/22.mp4",
        3: "/data/videos/33.mp4",
        4: "/data/videos/44.mp4",
    }
    return StreamingResponse(frame_generator(video_id, path_map[video_id]),
                             media_type="multipart/x-mixed-replace; boundary=frame")

# --------------------------
# 앱 시작 시 notify_worker 실행
# --------------------------
from fastapi import FastAPI

def register_notify_worker(app: FastAPI):
    @app.on_event("startup")
    async def startup_event():
        asyncio.create_task(notify_worker())