// src/pages/Sensor.js
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { Box, Typography, Stack, Paper, Button, Chip } from "@mui/material";
import ModeToggle from "../componants/Toggle.js";
import axios from "axios";

export default function Sensor() {
  // 0) 환경설정
  const RAW_BASE = process.env.REACT_APP_BASE_URL ?? "http://localhost:8000";
  const BASE_URL = RAW_BASE.replace(/\/+$/, "");
  const BASE_WITH_PRED = /\/pred($|\/)/.test(BASE_URL) ? BASE_URL : `${BASE_URL}/pred`;
  const api = useMemo(() => axios.create({ baseURL: BASE_WITH_PRED }), [BASE_WITH_PRED]);

  // 1) 상태
  const MAX_VISIBLE = 15;
  const [mode, setMode] = useState("auto");   // "auto" | "manual"
  const [valve, setValve] = useState("open"); // "open" | "closed"
  const [logs, setLogs] = useState([]);       // 화면에 보이는 15개
  const bufferRef = useRef([]);               // 서버에서 가져온 최신 로그 버퍼 (FIFO)
  const seenRef = useRef(new Set());          // 중복 방지 키 저장
  const fetchTimerRef = useRef(null);         // 서버 폴링 타이머(2초)
  const dequeueTimerRef = useRef(null);       // 디큐 타이머(1초)

  const nextOffsetRef = useRef(15);     // 다음 과거 페이지 offset (초기값)
  const noMoreOlderRef = useRef(false); // 과거 더 없음 플래그

  // === 상태 칩 색상 ===
  const stateChipSx = (state) => {
    if (state === "주의") return { backgroundColor: "#FFEB3B", color: "#000", fontWeight: 700 };      // 노란색
    if (state?.startsWith("위험")) return { backgroundColor: "#FF9800", color: "#000", fontWeight: 700 }; // 주황색
    return { backgroundColor: "#9E9E9E", color: "#fff" }; // 기타
  };

  
  // 2) 유틸
  const keyOf = useCallback((r) => `${r.sample_id}-${r.created_at}`, []);

  const pruneSeen = useCallback(() => {
    // seen 키가 너무 커지지 않게 주기적으로 절제
    const LIMIT = 4000;
    const DROP = 1000;
    const s = seenRef.current;
    if (s.size > LIMIT) {
      const it = s.values();
      for (let i = 0; i < DROP; i++) {
        const v = it.next();
        if (v.done) break;
        s.delete(v.value);
      }
    }
  }, []);

  const pushToBuffer = useCallback((rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    // created_at 오름차순(오래된 → 최신)
    const sortedAsc = [...rows].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      if (ta !== tb) return ta - tb;
      return (a.sample_id ?? 0) - (b.sample_id ?? 0);
    });

    const toAppend = [];
    for (const r of sortedAsc) {
      const k = keyOf(r);
      if (!seenRef.current.has(k)) {
        seenRef.current.add(k);
        toAppend.push(r);
      }
    }
    if (toAppend.length) {
      bufferRef.current = [...bufferRef.current, ...toAppend].slice(-500); // 안전 버퍼
      pruneSeen();
    }
  }, [keyOf, pruneSeen]);

  // ✅ 과거 페이지 페치
  const fetchOlderOnce = useCallback(async () => {
    if (noMoreOlderRef.current) return;
    try {
      const offset = nextOffsetRef.current;
      const { data } = await api.get("/alert-logs", { params: { limit: 15, offset } });
      const rows = data?.rows ?? [];
      if (rows.length > 0) {
        pushToBuffer(rows);
        nextOffsetRef.current = offset + rows.length; // 다음 offset 업데이트
      } else {
        noMoreOlderRef.current = true; // 과거 더 없음
      }
    } catch (e) {
      console.error("fetch older page fail", {
        offset: nextOffsetRef.current,
        message: e?.message,
        status: e?.response?.status,
        data: e?.response?.data,
      });
    }
  }, [api, pushToBuffer]);

  const dequeueOnce = useCallback(() => {
    const buf = bufferRef.current;
    if (!buf.length) {
      // 버퍼가 비면 과거 페이지 가져오기 시도
      fetchOlderOnce();
      return;
    }

    const next = buf.shift();
    bufferRef.current = buf;
    setLogs((prev) => [next, ...prev].slice(0, MAX_VISIBLE));

    // 버퍼가 얕아지면(3개 이하 남으면) 과거 페이지 미리 채우기
    if (bufferRef.current.length < 3) {
      fetchOlderOnce();
    }
  }, [fetchOlderOnce]);

  const shouldDequeue = useCallback(
    () => mode === "auto" || (mode === "manual" && valve === "open"),
    [mode, valve]
  );

  // 3) 초기 제어 상태(선택 기능: 백엔드에 없으면 무시)
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/control/state");
        if (data?.mode) setMode(data.mode);
        if (data?.valve) setValve(data.valve);
      } catch {
        // 제어 API가 아직 없다면 조용히 무시
      }
    })();
  }, [api]);

  // 4) 서버 폴링 — 1초마다 최신 15개 받아 버퍼 적재
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        // 백엔드가 state != '안전' 만 반환하도록 구현되어 있음
        const { data } = await api.get("/alert-logs", { params: { limit: 15, offset: 0 } });
        pushToBuffer(data?.rows ?? []);
      } catch (e) {
        console.error("fetch /pred/alert-logs fail:", e?.message ?? e);
      }
    };
    fetchLatest(); // 즉시 1회
    fetchTimerRef.current = setInterval(fetchLatest, 1000);
    return () => {
      if (fetchTimerRef.current) clearInterval(fetchTimerRef.current);
      fetchTimerRef.current = null;
    };
  }, [api, pushToBuffer]);

  // 5) 디큐 타이머 — 1초에 한 줄씩 화면에 쌓기 (모드/밸브에 따라 on/off)
  useEffect(() => {
    const on = shouldDequeue();
    if (on && !dequeueTimerRef.current) {
      dequeueOnce(); // UX 좋게 즉시 1개
      dequeueTimerRef.current = setInterval(dequeueOnce, 1000);
    } else if (!on && dequeueTimerRef.current) {
      clearInterval(dequeueTimerRef.current);
      dequeueTimerRef.current = null;
    }
    return () => {
      if (dequeueTimerRef.current) {
        clearInterval(dequeueTimerRef.current);
        dequeueTimerRef.current = null;
      }
    };
  }, [shouldDequeue, dequeueOnce]);

  // 6) 제어 핸들러(선택 기능: 백엔드 있으면 연동)
  const handleModeChange = async (next) => {
    setMode(next);
    try {
      const { data } = await api.post("/control/mode", { mode: next });
      if (data?.mode) setMode(data.mode);
      if (data?.valve) setValve(data.valve);
    } catch {
      // 제어 API가 없으면 로컬 상태만 유지
    }
  };

  const handleLock = async () => {
    if (mode !== "manual") return alert("수동 모드에서만 조작이 가능합니다.");
    try {
      const { data } = await api.post("/control/valve", { action: "lock" });
      if (data?.valve) setValve(data.valve);
    } catch {
      setValve("closed");
    }
  };

  const handleUnlock = async () => {
    if (mode !== "manual") return alert("수동 모드에서만 조작이 가능합니다.");
    try {
      const { data } = await api.post("/control/valve", { action: "unlock" });
      if (data?.valve) setValve(data.valve);
    } catch {
      setValve("open");
    }
  };

  // 7) 표시용 파생값
  const isManual = mode === "manual";
  const currStateText = valve === "closed" ? "닫힘" : "해제";
  const currStateChip = valve === "closed" ? "잠김" : "열림";


  return (
    <Box sx={{ width: "100%", minHeight: "100vh", display: "flex", backgroundColor: "#92a5b6ff" }}>
      <Box>
        <Typography sx={{ color: "#fff", m: "25px 0 20px 40px", fontSize: "24px", fontWeight: 600 }}>
          농도 기반 예측
        </Typography>

        <Box sx={{ justifyItems: "center" }}>
          {/* 상단 카드 */}
          <Stack direction="row" spacing={6} sx={{ width: "100vw", justifyContent: "center" }}>
            <Paper sx={{ width: "27%", height: "220px", backgroundColor: "#41515B", borderRadius: "25px" }}>
              <Typography sx={{ color: "#FFFFFF", m: "15px 0 0 20px", fontSize: "20px" }}>가스</Typography>
              <Typography sx={{ textAlign: "center", color: "#FFFFFF", mt: "50px", fontSize: "30px" }}>
                {logs[0]?.pred_gas_class ?? "가스 종류"}
              </Typography>
            </Paper>

            <Paper sx={{ width: "27%", backgroundColor: "#41515B", borderRadius: "25px" }}>
              <Typography sx={{ color: "#FFFFFF", m: "15px 0 0 20px", fontSize: "20px" }}>LEL</Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1, mt: "35px" }}>
                <Typography sx={{ color: "#FFFFFF", m: 0, fontSize: "30px", lineHeight: 1, textAlign: "center" }}>
                  {logs[0]?.lel_value != null ? Number(logs[0].lel_value).toFixed(3) : "수치"}
                </Typography>
                <Typography sx={{ color: "#FFFFFF", m: 0, fontSize: "20px", lineHeight: 1 }}>%</Typography>
              </Box>
            </Paper>

            <Paper sx={{ width: "27%", backgroundColor: "#41515B", borderRadius: "25px" }}>
              <Typography sx={{ color: "#FFFFFF", m: "15px 0 0 20px", fontSize: "20px" }}>상태</Typography>
              <Typography sx={{ textAlign: "center", color: "#FFFFFF", mt: "50px", fontSize: "30px" }}>
                {logs[0]?.state ?? "상태"}
              </Typography>
            </Paper>
          </Stack>

          {/* 벨브 제어 */}
          <Paper sx={{ width: "90%", mt: 5, borderRadius: "15px", mx: "auto" }}>
            <Box sx={{ display: "flex", p: "15px 20px", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>벨브 제어</Typography>
              <ModeToggle value={mode} onChange={handleModeChange} width={140} height={40} />
            </Box>

            <Box sx={{ display: "flex", gap: 1, ml: 2, alignItems: "center" }}>
              <Typography>현재 상태:</Typography>
              <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>{currStateText}</Typography>
              <Chip
                sx={{ backgroundColor: valve === "closed" ? "#ffb168ff" : "#80d6bfff" }}
                label={currStateChip}
                size="small"
              />
            </Box>

            {/* 자동 모드: 버튼 비활성 */}
            {!isManual && (
              <>
                <Box sx={{ display: "flex", ml: 2, mt: 1, gap: 1 }}>
                  <Button
                    onClick={() => alert("수동 모드에서만 조작이 가능합니다.")}
                    sx={{ height: 45, width: "12%", backgroundColor: "rgba(95, 64, 64, 1)", borderRadius: "15px", color: "#ffffff67" }}
                  >
                    잠김(닫기)
                  </Button>
                  <Button
                    onClick={() => alert("수동 모드에서만 조작이 가능합니다.")}
                    sx={{ height: 45, width: "12%", backgroundColor: "rgba(56, 77, 57, 1)", borderRadius: "15px", color: "#ffffff67" }}
                  >
                    해제(열기)
                  </Button>
                </Box>
                <Typography sx={{ fontSize: 12, color: "#6d6d6dff", ml: 3, mt: 1, pb: 2 }}>
                  수동 모드에서만 조작이 가능합니다.
                </Typography>
              </>
            )}

            {/* 수동 모드: 제어 가능 */}
            {isManual && (
              <Box sx={{ display: "flex", ml: 2, mt: 1, gap: 1, pb: 2 }}>
                <Button onClick={handleLock} sx={{ height: 45, width: "12%", backgroundColor: "#B43737", borderRadius: "15px", color: "#fff" }}>
                  잠김(닫기)
                </Button>
                <Button onClick={handleUnlock} sx={{ height: 45, width: "12%", backgroundColor: "#33682F", borderRadius: "15px", color: "#fff" }}>
                  해제(열기)
                </Button>
              </Box>
            )}
          </Paper>

          {/* 예측 로그: 최신이 위, 최대 15줄 유지 */}
          <Paper sx={{ width: "90%", mt: 3, borderRadius: "15px", mx: "auto", p: 2 }}>
            <Box sx={{ p: "0 20px 10px" }}>
              <Typography sx={{ fontSize: "20px", fontWeight: 700 }}>예측 로그</Typography>
            </Box>
            <Box sx={{ display: "grid", gap: 1 }}>
              <Paper
                sx={{
                  p: 1.2,
                  display: "grid",
                  gridTemplateColumns: "200px 1fr 110px 120px 130px", // 시간 / 가스 종류 / 예측값 / LEL / 상태
                  backgroundColor: "#394b56",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: "10px",
                  gap: 8,
                  alignItems: "center", // 행 내부 수직 가운데
                }}
              >
                <span style={{ textAlign: "center" }}>시간</span>
                <span style={{ textAlign: "center" }}>가스 종류</span>
                <span style={{ textAlign: "center" }}>예측값</span>
                <span style={{ textAlign: "center" }}>LEL</span>
                <span style={{ textAlign: "center" }}>상태</span>
              </Paper>

              {logs.map((r, i) => (
                <Paper
                  key={`${r.sample_id}-${r.created_at}-${i}`}
                  sx={{
                    p: 1.5,
                    display: "grid",
                    gridTemplateColumns: "200px 1fr 110px 120px 130px", // 시간 / 가스 / 예측값 / LEL / 상태
                    gap: 8,
                    alignItems: "center", // 행 내부 수직 가운데
                  }}
                >
                  <span style={{ textAlign: "center" }}>{new Date(r.created_at).toLocaleString()}</span>
                  <span style={{ textAlign: "center" }}>{r.pred_gas_class}</span>
                  <span style={{ textAlign: "center" }}>{r.pred_gas_value ?? "-"}</span>
                  <span style={{ textAlign: "center" }}>
                    {r.lel_value != null ? `${Number(r.lel_value).toFixed(3)}%` : "-"}
                  </span>
                  <Chip label={r.state} size="small" sx={stateChipSx(r.state)} />
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
