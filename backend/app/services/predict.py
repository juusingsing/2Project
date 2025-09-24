from __future__ import annotations
import os, math, datetime as dt
from pathlib import Path
from typing import Dict, List
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import joblib
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

HERE = Path(__file__).resolve()
BACKEND_DIR = HERE.parent.parent
DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = DATA_DIR / "models"

DB_HOST = os.getenv("MYSQL_HOST", "192.168.0.107")
DB_USER = os.getenv("MYSQL_USER", "project2")
DB_PASS = os.getenv("MYSQL_PASSWORD", "1111")
DB_NAME = os.getenv("MYSQL_DATABASE", "secondpj")
DB_PORT = int(os.getenv("MYSQL_PORT", "3307"))

TABLE_INPUT = "samples_wide"
TABLE_OUTPUT = "predictions_wide"
BATCH_SIZE = 3000

SCALER_PATH = Path(os.getenv("SCALER_PATH", MODELS_DIR / "scaler_classification.pkl"))
CLASSIFIER_PATH = Path(os.getenv("CLASSIFIER_PATH", MODELS_DIR / "lgbm_classifier.pkl"))
REG_PATHS: Dict[int, Path] = {
    0: MODELS_DIR / "xgb_model_cls0.pkl",  # 에탄올
    1: MODELS_DIR / "xgb_model_cls1.pkl",  # 에틸렌
    2: MODELS_DIR / "xgb_model_cls2.pkl",  # 암모니아
    3: MODELS_DIR / "xgb_model_cls3.pkl",  # 아세트알데히드
    4: MODELS_DIR / "xgb_model_cls4.pkl",  # 아세톤
    5: MODELS_DIR / "xgb_model_cls5.pkl",  # 톨루엔
}

CLASS_NAME = {
    0: "에탄올",
    1: "에틸렌",
    2: "암모니아",
    3: "아세트알데히드",
    4: "아세톤",
    5: "톨루엔", 
}

GAS_LEL = {
    "에탄올": [33000, 3.3],
    "에틸렌": [27000, 2.7],
    "암모니아": [150000, 15.0],
    "아세트알데히드": [22000, 4.0],
    "아세톤": [25000, 2.6],
    "톨루엔": [12000, 1.2],
}

USE_SCALED_FOR_REGRESSION = True

FEATURES: List[str] | None = None
META_EXCLUDE = {"id", "gas_type_id", "concentration"}

def get_engine() -> Engine:
    url = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return create_engine(url, pool_pre_ping=True, pool_recycle=3600)

def load_artifacts():
    if not SCALER_PATH.exists():
        raise FileNotFoundError(f"스케일러 없음: {SCALER_PATH}")
    if not CLASSIFIER_PATH.exists():
        raise FileNotFoundError(f"분류기 없음: {CLASSIFIER_PATH}")
    scaler = joblib.load(SCALER_PATH)
    clf = joblib.load(CLASSIFIER_PATH)
    regs: Dict[int, object] = {}
    for k, p in REG_PATHS.items() :
        if p.exists():
            regs[k] = joblib.load(p)
    return scaler, clf, regs

def pick_feature_cols(df: pd.DataFrame) -> List[str]:
    if FEATURES:
        return FEATURES
    nums = df.select_dtypes(include=[np.number]).columns.tolist()
    feats = [c for c in nums if c not in META_EXCLUDE]
    if not feats:
        raise ValueError("예측에 사용할 숫자형 피처가 없습니다.")
    return feats

def concentration_to_lel(gas_name: str, ppm: float) -> tuple[float, str]:
    if gas_name not in GAS_LEL:
        return (np.nan, "ERROR")
    lel_ppm, lel_basis_percent = GAS_LEL[gas_name]
    lel_percent = (ppm / float(lel_ppm)) * 100.0
    if lel_percent >= (lel_basis_percent * 0.25):
        state = "위험(차단)"
    elif lel_percent >= (lel_basis_percent * 0.10):
        state = "주의"
    else:
        state = "안전"
    return float(lel_percent), state

def select_unpredicted_ids(engine: Engine, offset: int, limit: int) -> List[int]:
    q = f"""
        SELECT s.id
        FROM {TABLE_INPUT} AS s
        LEFT JOIN {TABLE_OUTPUT} AS p
            ON p.sample_id = s.id
        WHERE p.sample_id IS NULL 
        ORDER BY s.id
        LIMIT :limit OFFSET :offset
    """

    with engine.begin() as conn:
        rows = conn.execute(text(q), {"limit": limit, "offset": offset}).fetchall()
    return [r[0] for r in rows]

def fetch_rows_by_ids(engine: Engine, ids: List[int]) -> pd.DataFrame:
    if not ids:
        return pd.DataFrame()
    ids_csv = ",".join(map(str, ids))
    q = f"SELECT * FROM {TABLE_INPUT} WHERE id IN ({ids_csv})"
    return pd.read_sql(q, con=engine)

def insert_predictions(engine: Engine, payload: List[dict]):
    if not payload:
        return
    ins = text(f"""
        INSERT INTO {TABLE_OUTPUT}
            (sample_id, pred_gas_class, pred_gas_value, created_at, state, lel_value)
        VALUES
            (:sample_id, :pred_gas_class, :pred_gas_value, :created_at, :state, :lel_value)
    """)
    with engine.begin() as conn:
        conn.execute(ins, payload)

def run_prediction() -> dict:
    eng = get_engine()
    scaler, clf, regs = load_artifacts()

    with eng.begin() as conn:
        total = conn.execute(text(f"""
            SELECT COUNT(*) FROM {TABLE_INPUT} s
            LEFT JOIN {TABLE_OUTPUT} p ON p.sample_id = s.id
            WHERE p.sample_id IS NULL
        """)).scalar_one()

    if total == 0:
        return {"total": 0, "inserted": 0, "message": "no pending samples"}
    
    pages = math.ceil(total / BATCH_SIZE)
    inserted = 0

    for pi in range(pages):
        ids = select_unpredicted_ids(eng, offset=pi * BATCH_SIZE, limit=BATCH_SIZE)
        if not ids:
            break

        df = fetch_rows_by_ids(eng, ids)
        if df.empty:
            continue

        feats = pick_feature_cols(df)
        X = df[feats].copy()
        if X.isna().any().any():
            X = X.fillna(X.median(numeric_only=True))

        # 스케일링 + 분류
        Xs = scaler.transform(X)
        y_cls = clf.predict(Xs).astype(int)

        # 클래스별 회귀
        pred_ppm = np.full(len(y_cls), np.nan, dtype=float)
        for cls_id, reg in regs.items():
            idx = np.where(y_cls == cls_id)[0]
            if idx.size == 0:
                continue
            X_reg = Xs[idx] if USE_SCALED_FOR_REGRESSION else X.iloc[idx]
            try:
                pred_ppm[idx] = reg.predict(X_reg).astype(float)
            except Exception:
                pred_ppm[idx] = reg.predict(X.iloc[idx]).astype(float)

        now = dt.datetime.now()
        payload = []
        for i, sid in enumerate(df["id"].astype(int).tolist()):
            cls_id = int(y_cls[i])
            gas_name = CLASS_NAME.get(cls_id, f"class_{cls_id}")
            ppm = pred_ppm[i]
            if np.isfinite(ppm):
                lel_val, state = concentration_to_lel(gas_name, float(ppm))
                ppm_out = float(round(ppm, 6))
                lel_out = float(round(lel_val, 6))
            else:
                ppm_out, lel_out, state = (None, None, "ERROR")

            payload.append({
                "sample_id":      sid,
                "pred_gas_class": gas_name,
                "pred_gas_value": ppm_out,
                "created_at":     now,
                "state":          state,
                "lel_value":      lel_out,
            })

        insert_predictions(eng, payload)
        inserted += len(payload)

    return {"total": int(total), "inserted": int(inserted), "message": "ok"}

def main():
    result = run_prediction()
    print(f"대상: {result['total']}, 적재: {result['inserted']}, msg={result['message']}")

