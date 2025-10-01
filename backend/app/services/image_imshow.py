import os
import cv2
import torch
import numpy as np
import sys
from pathlib import Path
import platform

# RT-CAN 불러오기
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(os.path.join(base_dir, "data", "models", "image"))
from RT_CAN import GasSegNet

# ========================
# 환경 확인
# ========================
def is_running_in_docker() -> bool:
    try:
        return Path("/.dockerenv").exists()
    except Exception:
        return False
    
def pick_media_root() -> Path:
    env_root = os.getenv("MEDIA_ROOT")
    if env_root:
        p = Path(env_root)
        if p.exists() and p.is_dir():
            print(f"[MEDIA] Using MEDIA_ROOT from ENV: {p}")
            return p
        else:
            raise FileNotFoundError(f"환경변수 MEDIA_ROOT 경로가 존재하지 않습니다: {p}")

    win_root = Path("D:/2pjfiles/videos")
    if win_root.exists() and win_root.is_dir():
        print(f"[MEDIA] Using Windows path: {win_root}")
        return win_root

    docker_root = Path("/data/videos")
    if docker_root.exists() and docker_root.is_dir():
        print(f"[MEDIA] Using Docker path: {docker_root}")
        return docker_root

    local_root = Path("data/videos")
    if local_root.exists() and local_root.is_dir():
        print(f"[MEDIA] Using local relative path: {local_root}")
        return local_root

    raise FileNotFoundError("동영상 루트 폴더를 찾을 수 없습니다.")

# ====== 선택 및 로깅 ======
IN_DOCKER = is_running_in_docker()
print(f"[ENV] platform={platform.system()} in_docker={IN_DOCKER}")

MEDIA_ROOT = pick_media_root()

# ========================
# 설정
# ========================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
input_w, input_h = 640, 512
video_out = MEDIA_ROOT / "result" / os.getenv("RESULT_NAME", "gas_pred_vs_gt_full.mp4")

# ========================
# 모델 로드
# ========================
print("[INFO] Loading model...")
model = GasSegNet(n_class=2, num_resnet_layers=152).to(device)
weights_path = MEDIA_ROOT / "weights" / "11_latest.pth"
checkpoint = torch.load(str(weights_path), map_location=device)
model.load_state_dict(checkpoint, strict=False)
model.eval()
print("[INFO] 모델 로드 완료")

# ========================
# 데이터 경로
# ========================
bg_dir = MEDIA_ROOT / "Lang-Gas" / "sim" / "background"
gt_dir = MEDIA_ROOT / "Lang-Gas" / "sim" / "gt"

pairs = [
    ("vid3_bats", "smoke_only3_bats", 451),
]

# ========================
# 비디오 저장 준비
# ========================
fourcc = cv2.VideoWriter_fourcc(*"XVID")
video_writer = cv2.VideoWriter(str(video_out), fourcc, 20.0, (input_w, input_h))

# ========================
# 전체 루프
# ========================
for bg_prefix, gt_prefix, frame_count in pairs:
    print(f"[INFO] Processing pair: {bg_prefix} ↔ {gt_prefix} ({frame_count} frames)")

    for i in range(frame_count):
        bg_name = f"{bg_prefix}_{i:04d}.png"
        gt_name = f"{gt_prefix}_{i:04d}.png"

        # 배경 이미지
        bg_path = os.path.join(bg_dir, bg_name)
        frame = cv2.imread(bg_path, cv2.IMREAD_GRAYSCALE)
        if frame is None: 
            print(f"[WARN] Skip {bg_name}")
            continue
        frame_resized = cv2.resize(frame, (input_w, input_h))
        frame_color = cv2.cvtColor(frame_resized, cv2.COLOR_GRAY2BGR)

        # GT 이미지
        gt_path = os.path.join(gt_dir, gt_name)
        gt = cv2.imread(gt_path, cv2.IMREAD_GRAYSCALE)
        if gt is None:
            print(f"[WARN] Skip {gt_name}")
            continue
        gt_resized = cv2.resize(gt, (input_w, input_h), interpolation=cv2.INTER_NEAREST)

        # 입력 준비
        inp = torch.tensor(frame_resized/255.0, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(device)

        # 모델 예측
        with torch.no_grad():
            pred, _, _ = model(inp)
        pred = torch.softmax(pred, dim=1)
        pred_mask = (pred[0,1].cpu().numpy() > 0.3).astype(np.uint8) * 255
        pred_mask_resized = cv2.resize(pred_mask, (input_w, input_h), interpolation=cv2.INTER_NEAREST)

        # Overlay (GT + Pred)
        gt_color = np.zeros_like(frame_color)
        gt_color[gt_resized > 127] = (0, 0, 255)
        overlay = cv2.addWeighted(frame_color, 1.0, gt_color, 0.5, 0)

        pred_color = np.zeros_like(frame_color)
        pred_color[pred_mask_resized > 127] = (0, 0, 255)
        overlay = cv2.addWeighted(overlay, 1.0, pred_color, 0.5, 0)

        # ========================
        # 바운딩 박스 (GT + Pred)
        # ========================
        gt_bin = (gt_resized > 127).astype(np.uint8) * 255
        contours_gt, _ = cv2.findContours(gt_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_gt:
            if cv2.contourArea(cnt) < 1: continue
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(overlay, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(overlay, "GT", (x, y-5), cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (0, 255, 0), 2, cv2.LINE_AA)

        pred_bin = pred_mask_resized.copy()
        contours_pred, _ = cv2.findContours(pred_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours_pred:
            if cv2.contourArea(cnt) < 1: continue
            x, y, w, h = cv2.boundingRect(cnt)
            cv2.rectangle(overlay, (x, y), (x+w, y+h), (255, 255, 0), 2)
            cv2.putText(overlay, "PRED", (x, y-5), cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (255, 255, 0), 2, cv2.LINE_AA)

        # ========================
        # 저장 & 화면 출력
        # ========================
        video_writer.write(overlay)             # 파일 저장
        cv2.imshow("Gas Detection", overlay)    # 실시간 출력

        # ESC(27) 또는 q 누르면 종료
        if cv2.waitKey(30) & 0xFF in [27, ord('q')]:
            break

video_writer.release()
cv2.destroyAllWindows()
print(f"[INFO] 저장 완료 → {video_out}")
