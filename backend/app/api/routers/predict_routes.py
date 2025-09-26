# app/api/routers/predict_routes.py

from __future__ import annotations
import traceback
from fastapi import APIRouter, BackgroundTasks, Query, HTTPException
from typing import List

from app.services.predict import (
    #run_prediction,
    load_artifacts,
    get_engine,
    select_unpredicted_ids,
    fetch_rows_by_ids,
    concentration_to_lel,
    run_prediction_one,
    predict_next_unpredicted
)

router = APIRouter(prefix="", tags=["pred"])

# 엔드포인트 헬스 체크
@router.get("/health")
def predict_health():
    """엔드포인트 헬스체크"""
    return {"ok": True}


@router.post("/one")
def predict_one(sample_id: int | None = Query(None, ge=1)):
    try:
        # sample_id를 무시하고 “미예측 중 다음 1건”을 처리하려면:
        return run_prediction_one()                 # ✅ 괄호로 호출
        # 만약 sample_id가 있으면 그걸로 처리하고 싶다면 predict_one_by_id(sample_id) 호출
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"predict_one error: {e}")

@router.post("/next")
def predict_next():
    try:
        return predict_next_unpredicted()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"predict_next error: {e}")

# 동기 실행
# @router.post("/sync")
# def predict_sync():
#     """요청이 끝날 때까지 예측을 동기 실행"""
#     result = run_prediction()
#     return {"status": "done", **result}


# 비동기 실행
# def _bg_task():
#     try:
#         run_prediction()
#     except Exception as e:
#         print(f"[predict async] error: {e}")

# @router.post("/async", status_code=202)
# def predict_async(bg: BackgroundTasks):
#     """백그라운드로 예측 실행(바로 202 반환)"""
#     bg.add_task(_bg_task)
#     return {"status": "scheduled"}


# -------- 아래 api (내부 점검용) -------------------

# 아티팩트(모델 등) 점검
@router.get("/artifacts-check")
def artifacts_check():
    try:
        scaler, clf, regs = load_artifacts()
        return {
            "scaler": type(scaler).__name__,
            "classifier": type(clf).__name__,
            "regressors": [f"class {k}: {type(v).__name__}" for k, v in regs.items()],
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"artifact missing: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"artifact load error: {e}")


# 미예측 행 조회
@router.get("/fetch-samples")
def fetch_samples(limit: int = Query(5, ge=1, le=1000)):
    """미예측 샘플 중 일부 행 원본 조회(점검용)"""
    try:
        eng = get_engine()
        ids = select_unpredicted_ids(eng, offset=0, limit=limit)
        if not ids:
            return {"rows": [], "count": 0}
        df = fetch_rows_by_ids(eng, ids)
        rows = df.to_dict(orient="records")
        return {"rows": rows, "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"db fetch error: {e}")

# 가스 농도 변환 
@router.get("/lel-check")
def lel_check(gas: str, ppm: float = Query(..., ge=0.0)):
    """가스 농도(ppm)를 LEL%와 상태로 변환"""
    try:
        lel_val, state = concentration_to_lel(gas, ppm)
        return {"gas": gas, "ppm": ppm, "lel_value": lel_val, "state": state}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid input: {e}")


#------------------- 기능 추가 ---------------------------

@router.get("/latest", tags=["logs"])
def latest_logs(limit: int = Query(15, ge=1, le=100)):
    """
    최신 로그 N개 (기본 15개)
    """
    return {"items": get_latest_predictions(limit)}




