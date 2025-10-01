import cv2
import numpy as np
import os

# 영상 파일 경로
video_path = "D:/2pjfiles/videos/11.mp4"
output_path = "D:/2pjfiles/videos/111.mp4"  # 결과 영상 저장

cap = cv2.VideoCapture(video_path)

# 차단 상태 초기화
block_triggered = False

# 임계값 설정 (초록 박스 픽셀 수 기준)
PIXEL_THRESHOLD = 500  # 필요에 따라 조정

# 비디오 저장 준비
os.makedirs(os.path.dirname(output_path), exist_ok=True)
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
fps = cap.get(cv2.CAP_PROP_FPS) or 30
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # 1. BGR → HSV 변환
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

    # 2. 초록색 범위 마스크
    lower_green = np.array([40, 50, 50])
    upper_green = np.array([80, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)

    # 3. 초록색 픽셀 수 계산
    green_pixels = cv2.countNonZero(mask)

    # 4. 가스 감지 판단
    gas_detected = green_pixels > PIXEL_THRESHOLD

    # 5. 차단 로직 실행
    if gas_detected and not block_triggered:
        block_triggered = True
        print("차단 로직 발동! → Blocking Activated!")

    # 6. 화면 표시
    if gas_detected:
        cv2.putText(frame, "Gas Detected!", (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,0), 2)
    if block_triggered:
        cv2.putText(frame, "Blocking Activated", (50, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0,255,255), 2)

    out.write(frame)
    
    # 7. 결과 영상 보여주기
    cv2.imshow("Gas Detection & Blocking", frame)
    if cv2.waitKey(30) & 0xFF == ord('q'):
        break

# 자원 해제
cap.release()
cv2.destroyAllWindows()
print(f"결과 영상 저장 완료 → {output_path}")
