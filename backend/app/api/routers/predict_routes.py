# app/api/routers/predict_routes.py

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Query, HTTPException
from typing import List

from app.predict import (
    run_prediction,
    load_artifacts,
    get_engine,
    select_unpredicted_ids,
    fetch_rows_by_ids,
    concentration_to_lel,
)

router = APIRouter(prefix="", tags=["pred"])


@router.get("/health")
def predict_health():
    """엔드포인트 헬스체크"""
    return {"ok": True}


@router.get("/artifacts-check")
def artifacts_check():
    """모델/스케일러/회귀기 로드 확인"""
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


@router.post("/sync")
def predict_sync():
    """요청이 끝날 때까지 예측을 동기 실행"""
    try:
        result = run_prediction()
        return {"status": "done", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"prediction error: {e}")


def _bg_task():
    try:
        run_prediction()
    except Exception as e:
        # TODO: 로깅/알림 연동
        print(f"[predict async] error: {e}")


@router.post("/async", status_code=202)
def predict_async(bg: BackgroundTasks):
    """백그라운드로 예측 실행(바로 202 반환)"""
    bg.add_task(_bg_task)
    return {"status": "scheduled"}


@router.get("/unpredicted-ids")
def unpredicted_ids(limit: int = Query(10, ge=1, le=10000), offset: int = Query(0, ge=0)):
    """결과 미적재 샘플 id 조회"""
    try:
        eng = get_engine()
        ids: List[int] = select_unpredicted_ids(eng, offset=offset, limit=limit)
        return {"count": len(ids), "ids": ids, "limit": limit, "offset": offset}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"db query error: {e}")


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


@router.get("/lel-check")
def lel_check(gas: str, ppm: float = Query(..., ge=0.0)):
    """가스 농도(ppm)를 LEL%와 상태로 변환"""
    try:
        lel_val, state = concentration_to_lel(gas, ppm)
        return {"gas": gas, "ppm": ppm, "lel_value": lel_val, "state": state}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"invalid input: {e}")
