<!-- README.md1 -->
# **🛡️** Gas Shut-off: 가스 누출 분석 자동 차단

## 📌 프로젝트 개요

가정 및 산업 현장에서 발생하는 가스 누출 사고를 예방하고, 누출 감지 시 신속하게 가스 공급을 차단하여 인명 피해와 재산 손실을 최소화하는 것을 목표로 한다.
본 프로젝트는 기존의 수동적 대응 방식을 넘어, **AI 기반의 실시간 감지와 자동 제어 시스템**을 도입함으로써 사용자의 인지 여부와 관계없이 24시간 안정적인 모니터링을 가능하게 한다. 특히, 다양한 가스 센서 데이터를 통해 농도를 정밀하게 예측하고, 열화상 카메라 영상 분석을 통해 누출 위치를 시각적으로 확인할 수 있어 **정량적 데이터와 정성적 시각 정보가 동시에 제공**된다.
또한, 백엔드와 프론트엔드가 유기적으로 연동되어 예측 결과를 즉시 대시보드에 표시하고, WebSocket을 통해 실시간으로 위험 상황을 사용자에게 알림으로써 **사고 발생 시점에서 대응까지 걸리는 시간을 획기적으로 단축**한다. 이러한 구조는 단순한 연구용 모델 구현에 그치지 않고, **실제 산업 현장에 적용 가능한 스마트 안전 솔루션**으로 확장될 수 있는 잠재력을 지니고 있다.
더 나아가, 본 시스템은 가스 누출뿐만 아니라 향후 화학물질 누출, 화재, 전기 위험 등 다양한 안전 리스크 탐지로 확장 가능하며, **산업 안전 관리 패러다임을 예방 중심·자동 대응 중심으로 변화시키는 기반 기술**이 될 것이다.

![결과최종](https://github.com/user-attachments/assets/4574edfe-6fa6-49e8-90df-866d0949d565)  

## **🚀 주요 기능**

| 기능 | 설명 |
| --- | --- |
| 🔬 센서 기반 탐지 | 16개 센서, 6종 가스 → 128 Feature  **LightGBM 분류 모델** / **XGBoost 회귀 모델** |
| 📷 이미지 탐지 | 12,151장 열화상 + 영상 28개  **RT-CAN (GasSegNet)**, ResNet-152 기반 Segmentation |
| ⛔ 자동 차단 | LEL 기준 위험도 설정 (20% 이상 → 자동 밸브 차단) |
| 🖥 백엔드 | FastAPI + Node.js API, Docker 환경, MySQL DB, WebSocket 알림 |
| 💻 프론트엔드 | React 대시보드, 실시간 상태 표시, 자동/수동 밸브 제어, CCTV 스트리밍 |  

## 🏗 아키텍처 다이어그램

```
[센서 데이터] → [LightGBM/XGBoost] → [예측 결과 DB 저장]
[열화상 이미지] → [RT-CAN Segmentation] → [시각화 Overlay]

[MySQL] ↔ [FastAPI/Node.js API] ↔ [React Front-End]
                   ↕
             [WebSocket 알림]

```

## 🧠 기술 스택
[![Python](https://img.shields.io/badge/Python-3.13-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![NumPy](https://img.shields.io/badge/NumPy-013243?logo=numpy&logoColor=white)](https://numpy.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Figma](https://img.shields.io/badge/Figma-F24E1E?logo=figma&logoColor=white)](https://www.figma.com/)
[![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)
[![Jupyter](https://img.shields.io/badge/Jupyter-F37626?logo=jupyter&logoColor=white)](https://jupyter.org/)
[![Notion](https://img.shields.io/badge/Notion-000000?logo=notion&logoColor=white)](https://www.notion.so/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?logo=github&logoColor=white)](https://github.com/)
[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?&logo=node.js&logoColor=white)](https://nodejs.org/ko/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?&logo=docker&logoColor=white)](https://www.docker.com/)
[![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?&logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/stable/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?&logo=TensorFlow&logoColor=white)](https://www.tensorflow.org/?hl=ko)
[![Matplotlib](https://img.shields.io/badge/Matplotlib-%23ffffff.svg?&logo=Matplotlib&logoColor=black)](https://matplotlib.org/)
[![OpenCV](https://img.shields.io/badge/opencv-%23white.svg?&logo=opencv&logoColor=white)](https://opencv.org/)
[![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?&logo=mui&logoColor=white)](https://mui.com/)
[![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?&logo=nginx&logoColor=white)](https://nginx.org/)  

## 👥 팀 구성

| 이름 | 역할 |
| --- | --- |
| 👑 유지원 | 팀장, 이미지 모델링 총괄 |
| 📊 박성언 | 센서 데이터 모델링 |
| 🧪 최회민 | 모델링 총괄 |
| 🎨 김나연 | 프론트엔드 총괄 |
| 📷 서진현 | 이미지 데이터 모델링 |
| 🖥 문주성 | 백엔드 총괄 (Docker 통합) |
| ⚙️ 신보람 | 백엔드 담당 |

---

## 📅 일정 관리

| 주차 | 주요 작업 |
| --- | --- |
| 🗓 1주차 | ✅ 주제 선정  ✅ 데이터 수집 |
| 🗓 2주차 | 🛠 백엔드/프론트엔드 개발환경 구축  
🧪 센서·이미지 모델링 시작 |
| 🗓 3주차 | ⚙️ 모델링 고도화  🌐 API & 대시보드 구현 |
| 🗓 4주차 | 📝 PPT 제작  🎥 시연 영상 제작 & 발표 |


---

## 📈 자체 평가

| 구분 | 내용 |
| --- | --- |
| 🌟 기대효과 | 인명·재산 피해 감소, 24시간 대응 가능 |
| ⚠️ 한계점 | 실제 산업 장비 연동 한계, 실시간 검증 어려움 |
| 🔧 개선 방향 | 센서+이미지 멀티모달 분석, 산업 현장 데이터 축적 |
| 👨‍💻 팀원 성장 | Docker/WS 경험, 데이터 라벨링·모델링 확장, UI·백엔드 통합 경험 |

---

## 📎 참고 자료

- 📰 [롯데 물류창고 가스 누출 사고 기사](https://www.khan.co.kr/article/202510141710001)
- 🌍 [인도 LG공장 가스 누출 사고 기사](https://www.bbc.com/korean/news-52570235)



