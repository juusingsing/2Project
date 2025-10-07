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


# === 새로 추가: 학습 시점 피처 정렬 유틸 ===
def _get_feat_names(obj):
    """sklearn 계열 모델/스케일러의 feature_names_in_을 안전하게 꺼낸다."""
    return getattr(obj, "feature_names_in_", None)

def _align(X_df: pd.DataFrame, names) -> pd.DataFrame:
    """
    모델이 기대하는 컬럼 순서(names)에 맞춰 DataFrame을 재정렬.
    빠진 컬럼은 0.0으로 채우고, dtype은 float로 강제.
    """
    X2 = X_df.copy()
    names = list(map(str, names))
    for c in names:
        if c not in X2.columns:
            X2[c] = 0.0
    X2 = X2[names]
    return X2.astype(float)


try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

def _resolve_relative_to_backend(path_or_str) -> Path:
    """절대경로면 그대로, 상대경로면 backend/ 기준으로 붙여서 반환"""
    p = Path(path_or_str)
    backend_dir = Path(__file__).resolve().parents[2]  # services → app → backend
    return p if p.is_absolute() else (backend_dir / p)

HERE = Path(__file__).resolve()
BACKEND_DIR = HERE.parent.parent
DATA_DIR = BACKEND_DIR / "data"

DB_HOST = os.getenv("MYSQL_HOST", "192.168.0.107")
DB_USER = os.getenv("MYSQL_USER", "project2")
DB_PASS = os.getenv("MYSQL_PASSWORD", "1111")
DB_NAME = os.getenv("MYSQL_DATABASE", "secondpj")
DB_PORT = int(os.getenv("MYSQL_PORT", "3307"))

TABLE_INPUT = "samples_wide"
TABLE_OUTPUT = "predictions_wide"
BATCH_SIZE = 3000

MODELS_DIR = _resolve_relative_to_backend(os.getenv("MODELS_DIR", "data/models"))
SCALER_PATH     = _resolve_relative_to_backend(os.getenv("SCALER_PATH",     MODELS_DIR / "scaler_classification.pkl"))
CLASSIFIER_PATH = _resolve_relative_to_backend(os.getenv("CLASSIFIER_PATH", MODELS_DIR / "lgbm_classifier.pkl"))

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

GAS_LEL = {                               # 하한 폭팔 농도
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


def search_alert_logs(engine, gas_class, specific_state, offset, limit) -> pd.DataFrame:
    base = f"""
        SELECT
            sample_id,
            pred_gas_class,
            pred_gas_value,
            created_at,
            state,
            CAST(lel_value AS DOUBLE) AS lel_value
        FROM {TABLE_OUTPUT}
    """
    conditions = ["state != '안전'"]
    params = {"limit": limit, "offset": offset}
    if gas_class:
        conditions.append("pred_gas_class = :gas_class")
        params["gas_class"] = gas_class
    if specific_state:
        conditions.append("state = :specific_state")
        params["specific_state"] = specific_state

    where_clause = " WHERE " + " AND ".join(conditions)
    q = f"""
        {base}
        {where_clause}
        ORDER BY created_at DESC, sample_id DESC
        LIMIT :limit OFFSET :offset
    """
    return pd.read_sql(text(q), con=engine, params=params)


def run_prediction() -> dict:
    """
    samples_wide → 모델링 → predictions_wide 적재
    (스케일러/분류기/회귀기 로드 후, 미예측 샘플들 일괄 처리)
    """
    eng = get_engine()
    scaler, clf, regs = load_artifacts()

    # --- 미예측 샘플 개수 조회 ---
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

    # --- 페이지 단위 예측 ---
    for pi in range(pages):
        ids = select_unpredicted_ids(eng, offset=pi * BATCH_SIZE, limit=BATCH_SIZE)
        if not ids:
            break

        df = fetch_rows_by_ids(eng, ids)
        if df.empty:
            continue

        # -------------------------------
        # (1) 피처 선택 및 정렬
        # -------------------------------
        feats_base = pick_feature_cols(df)
        X_raw = df[feats_base].copy()

        # 스케일러가 학습 시점 피처 순서를 알고 있다면 그 순서대로 재정렬
        scaler_feat = _get_feat_names(scaler)
        if scaler_feat is not None:
            X_raw = _align(X_raw, scaler_feat)

        # NaN 처리
        if X_raw.isna().any().any():
            X_raw = X_raw.fillna(X_raw.median(numeric_only=True))

        # -------------------------------
        # (2) 분류 예측
        # -------------------------------
        Xs = scaler.transform(X_raw)
        y_cls = clf.predict(Xs).astype(int)

        # -------------------------------
        # (3) 클래스별 회귀 예측
        # -------------------------------
        pred_ppm = np.full(len(y_cls), np.nan, dtype=float)

        for cls_id in np.unique(y_cls):
            idx = np.where(y_cls == cls_id)[0]
            if idx.size == 0:
                continue
            if cls_id not in regs:
                print(f"[predict] NO REGRESSOR for class {cls_id}")
                continue

            reg = regs[cls_id]
            reg_feat = _get_feat_names(reg)
            nfi = getattr(reg, "n_features_in_", None)

            # 회귀 모델 피처 이름이 있으면 정렬
            if reg_feat is not None:
                X_raw_aligned = _align(X_raw, reg_feat)
            else:
                X_raw_aligned = X_raw

            # 정렬된 raw를 다시 스케일링 (차원 맞춤)
            try:
                X_scaled_aligned = scaler.transform(X_raw_aligned)
            except Exception as e:
                print(f"[predict] scaler.transform failed -> {e}; fallback to Xs")
                X_scaled_aligned = Xs

            # 시도 후보 결정
            candidates = []
            if nfi is not None:
                if X_scaled_aligned.shape[1] == nfi:
                    candidates.append(("scaled", X_scaled_aligned[idx]))
                if X_raw_aligned.shape[1] == nfi:
                    candidates.append(("raw", X_raw_aligned.iloc[idx].to_numpy(dtype=float)))
            if not candidates:
                candidates = [
                    ("scaled", X_scaled_aligned[idx]),
                    ("raw",    X_raw_aligned.iloc[idx].to_numpy(dtype=float)),
                ]

            # 예측 시도
            used = False
            for kind, Xcand in candidates:
                try:
                    yhat = reg.predict(Xcand).astype(float)
                    pred_ppm[idx] = yhat
                    print(f"[predict] class {cls_id}: used {kind} ({Xcand.shape[1]} feats)")
                    used = True
                    break
                except Exception as e:
                    print(f"[predict] class {cls_id}: {kind} predict failed -> {e}")

            if not used:
                print(f"[predict] class {cls_id}: ALL attempts failed; "
                      f"nfi={nfi}, raw={X_raw_aligned.shape[1]}, scaled={X_scaled_aligned.shape[1]}")

        # -------------------------------
        # (4) 결과 변환 및 적재
        # -------------------------------
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
                state = "NO_REGRESSOR" if cls_id not in regs else "PREDICT_FAIL"
                ppm_out, lel_out = (None, None)

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
