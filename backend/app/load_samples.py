import os
import pandas as pd
import numpy as np
import joblib
from sqlalchemy import create_engine

# ===== 0) 경로 =====
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # PROJECT2/
DATA_DIR = os.path.join(BASE_DIR, "data")
CSV_PATH = os.path.join(DATA_DIR, "sys_test.csv")

# pkl들이 data/ 안에 있다고 했으므로 data/에서 읽음
SCALER_PATH     = os.path.join(DATA_DIR, "scaler_classification.pkl")
CLASSIFIER_PATH = os.path.join(DATA_DIR, "lgbm_classifier.pkl")  # 가스 종류 분류기

# 가스별 세부 모델(XGB) 경로
GAS_MODEL_PATHS = {
    0: os.path.join(DATA_DIR, "xgb_model_cls0.pkl"),  # 에탄올
    1: os.path.join(DATA_DIR, "xgb_model_cls1.pkl"),  # 에틸렌
    2: os.path.join(DATA_DIR, "xgb_model_cls2.pkl"),  # 암모니아
    3: os.path.join(DATA_DIR, "xgb_model_cls3.pkl"),  # 아세트알데히드
    4: os.path.join(DATA_DIR, "xgb_model_cls4.pkl"),  # 아세톤
    5: os.path.join(DATA_DIR, "xgb_model_cls5.pkl"),  # 톨루엔
}

GAS_LABELS = {0:"에탄올", 1:"에틸렌", 2:"암모니아", 3:"아세트알데히드", 4:"아세톤", 5:"톨루엔"}

TARGET_TABLE = "samples_wide"  # 필요시 "samples_wide_pred" 등으로 변경

# ===== 유틸: 모델의 feature_names_in_이 있으면 그 순서로 맞춰서 사용 =====
def select_features(df: pd.DataFrame, estimator) -> pd.DataFrame:
    if hasattr(estimator, "feature_names_in_"):
        cols = [c for c in estimator.feature_names_in_ if c in df.columns]
        missing = set(estimator.feature_names_in_) - set(cols)
        if missing:
            print(f"[WARN] 누락된 피처: {sorted(missing)} (데이터에 없음)")
        return df[cols]
    # 없으면 숫자형만 사용
    return df.select_dtypes(include=[np.number])

# ===== 1) CSV 읽기 =====
df = pd.read_csv(CSV_PATH)

# ===== 2) 컬럼명 매핑 (DB/모델 스키마 맞춤) =====
df = df.rename(columns={
    "Class": "gas_type_id",
    "Concentration": "concentration",
})

# ===== 3) 스케일러 & 분류기 로드 =====
scaler = joblib.load(SCALER_PATH)
cls_model = joblib.load(CLASSIFIER_PATH)

# 스케일링 대상 피처 선택 → transform
X_for_scaling = select_features(df, scaler)
X_scaled = scaler.transform(X_for_scaling)

# 스케일된 값으로 덮어쓴 DataFrame
df_scaled = df.copy()
df_scaled[X_for_scaling.columns] = X_scaled

# ===== 4) 가스 종류 분류 =====
X_cls = select_features(df_scaled, cls_model)
gas_pred_id = cls_model.predict(X_cls).astype(int)
df_scaled["pred_gas_id"] = gas_pred_id
df_scaled["pred_gas_label"] = df_scaled["pred_gas_id"].map(GAS_LABELS)

# ===== 5) 가스별 세부 모델 예측 (라우팅) =====
df_scaled["pred_value"] = np.nan
loaded_models = {}

def get_model(gid: int):
    if gid not in loaded_models:
        path = GAS_MODEL_PATHS.get(gid)
        if not path or not os.path.exists(path):
            raise FileNotFoundError(f"가스ID {gid} 모델 파일이 없습니다: {path}")
        loaded_models[gid] = joblib.load(path)
    return loaded_models[gid]

for gid, sub in df_scaled.groupby("pred_gas_id"):
    gid = int(gid)
    model = get_model(gid)
    X_sub = select_features(sub, model)       # 모델이 요구하는 피처 순서에 맞춤
    # (가정) 위에서 적용한 scaler와 동일 스케일을 사용
    yhat = model.predict(X_sub.to_numpy())
    df_scaled.loc[sub.index, "pred_value"] = yhat

# ===== 6) DB 적재 =====
engine = create_engine("mysql+pymysql://project2:1111@127.0.0.1:3307/secondpj")

print("✅ CSV → 스케일링 → 분류 → 가스별 모델 예측 → DB 적재 완료")
