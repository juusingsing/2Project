import cv2
import numpy as np
import torch
from torchvision import transforms
import glob
import sys, os
# 현재 파일(app/services/image.py) 기준으로 상위 두 단계 -> backend/
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
sys.path.append(os.path.join(base_dir, "data", "models", "image"))
from RT_CAN import GasSegNet
from pathlib import Path
import platform

def is_running_in_docker() -> bool:
    try:
        # 도커 컨테이너 내에서는 /.dockerenv 파일이 존재하는 것이 일반적
        return Path("/.dockerenv").exists()
    except Exception:
        return False
    
    
def pick_media_root() -> Path:
    # 1) ENV 오버라이드
    env_root = os.getenv("MEDIA_ROOT")
    if env_root:
        p = Path(env_root)
        if p.exists() and p.is_dir():
            print(f"[MEDIA] Using MEDIA_ROOT from ENV: {p}")
            return p
        else:
            raise FileNotFoundError(f"환경변수 MEDIA_ROOT 경로가 존재하지 않습니다: {p}")

    # 2) 윈도우 호스트 경로 (사용자 환경에 맞게 수정)
    win_root = Path("D:/2pjfiles/videos")
    if win_root.exists() and win_root.is_dir():
        print(f"[MEDIA] Using Windows path: {win_root}")
        return win_root

    # 3) 컨테이너 경로
    docker_root = Path("/data/videos")
    if docker_root.exists() and docker_root.is_dir():
        print(f"[MEDIA] Using Docker path: {docker_root}")
        return docker_root

    # 4) 상대 경로
    local_root = Path("data/videos")
    if local_root.exists() and local_root.is_dir():
        print(f"[MEDIA] Using local relative path: {local_root}")
        return local_root

    # 실패
    raise FileNotFoundError(
        "동영상 루트 폴더를 찾을 수 없습니다. 다음 중 하나가 존재해야 합니다:\n"
        f"- ENV MEDIA_ROOT\n- {win_root}\n- {docker_root}\n- {local_root}"
    )

# ====== 선택 및 로깅 ======
IN_DOCKER = is_running_in_docker()
print(f"[ENV] platform={platform.system()} in_docker={IN_DOCKER}")

MEDIA_ROOT = pick_media_root()

# ------------------------
# 1. 경로 설정
# ------------------------
rgb_dir = MEDIA_ROOT / "RGB"
thermal_dir = MEDIA_ROOT / "T"
save_video = MEDIA_ROOT / "result" / os.getenv("RESULT_NAME", "result_with_severity.mp4")

device = "cuda" if torch.cuda.is_available() else "cpu"

# ------------------------
# 2. Transform 정의
# ------------------------
transform = transforms.Compose([
    transforms.ToTensor(),
])

# ------------------------
# 3. 이미지 리스트 (정렬 필수)
# ------------------------
rgb_files = sorted(glob.glob(os.path.join(rgb_dir, "*.png")))
thermal_files = sorted(glob.glob(os.path.join(thermal_dir, "*.png")))

print(f"총 {len(rgb_files)}개 프레임 처리 예정")

# ------------------------
# 4. 첫 이미지 크기로 비디오 초기화
# ------------------------
sample = cv2.imread(rgb_files[0])
h, w, _ = sample.shape
fourcc = cv2.VideoWriter_fourcc(*"mp4v")
out = cv2.VideoWriter(save_video, fourcc, 10, (w, h))  # fps=10

# ------------------------
# 5. 모델 불러오기
# ------------------------
model = GasSegNet(n_class=2, num_resnet_layers=152).to(device)

weights_path = MEDIA_ROOT / "weights" / "12_latest.pth"
state_dict = torch.load(str(weights_path), map_location=device)
model.load_state_dict(state_dict)

model.eval()

# ------------------------
# 6. 가스 심각도 계산 함수
# ------------------------
def compute_gas_severity(gas_area, frame_area, alpha=0.7, beta=0.3):
    norm_area = gas_area / frame_area if frame_area > 0 else 0
    area_ratio = norm_area
    severity = alpha * norm_area + beta * area_ratio
    return severity

# ------------------------
# 7. 게이지 그리기 함수
# ------------------------
def draw_gas_gauge(frame, severity, max_val=0.02, bar_w=40, bar_h=200, margin=30):
    """
    오른쪽에 세로 게이지 바 표시 (색상 무조건 빨강)
    severity: 계산된 가스 심각도
    max_val: 게이지 최대 기준 (0.02 = 2%)
    """
    H, W, _ = frame.shape
    x1, y1 = W - margin - bar_w, H//2 - bar_h//2
    x2, y2 = W - margin, H//2 + bar_h//2

    # 외곽선
    cv2.rectangle(frame, (x1, y1), (x2, y2), (255,255,255), 2)

    # 비율 계산
    ratio = min(severity / max_val, 1.0)
    fill_h = int(bar_h * ratio)

    # 게이지 채우기 (무조건 빨강)
    fy1 = y2 - fill_h
    cv2.rectangle(frame, (x1, fy1), (x2, y2), (0, 0, 255), -1)

    # 텍스트 (퍼센트)
    cv2.putText(frame, f"{severity*100:.2f}%",
                (x1-80, y2+20), cv2.FONT_HERSHEY_SIMPLEX,
                0.7, (255,255,255), 2, cv2.LINE_AA)

    return frame

# ------------------------
# 8. 모든 프레임 처리
# ------------------------
frame_area = h * w
for i, (rgb_path, thermal_path) in enumerate(zip(rgb_files, thermal_files)):
    rgb = cv2.imread(rgb_path)
    thermal = cv2.imread(thermal_path, cv2.IMREAD_GRAYSCALE)
    thermal = np.expand_dims(thermal, axis=-1)

    # RGB + Thermal 합치기
    input_img = np.concatenate([rgb, thermal], axis=-1)
    img_tensor = transform(input_img).unsqueeze(0).to(device)

    # 모델 추론
    with torch.no_grad():
        logits_S, logits_T, _, _, _ = model(img_tensor)
        pred = torch.argmax(logits_T, dim=1).cpu().numpy()[0]

    # 마스크 후처리
    mask = (pred == 1).astype(np.uint8) * 255
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    vis = rgb.copy()
    total_gas_area = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        total_gas_area += area
        x, y, w_, h_ = cv2.boundingRect(cnt)
        cv2.rectangle(vis, (x,y), (x+w_,y+h_), (0,255,0), 2)
        cv2.drawContours(vis, [cnt], -1, (0,0,255), 2)

    # GasSeverity 계산
    gas_severity = compute_gas_severity(total_gas_area, frame_area)

    # 오른쪽 게이지 표시
    vis = draw_gas_gauge(vis, gas_severity, max_val=0.02)

    # 영상에 추가
    out.write(vis)

    if i % 50 == 0:
        print(f"{i}/{len(rgb_files)} 프레임 처리 완료")

# ------------------------
# 9. 마무리
# ------------------------
out.release()
print("🎬 영상 저장 완료:", save_video)
