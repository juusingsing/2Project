import React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

const ONCE_KEY = "__login_alert_once__";

export default function AlertNavigate({ to, message, state, replace = true }) {
    const navigate = useNavigate();
    const firedRef = useRef(false);

    useEffect(() => {
        if (firedRef.current) return;
        firedRef.current = true;

        // React 18 StrictMode 중복 방지
        if (!sessionStorage.getItem(ONCE_KEY)) {
            sessionStorage.setItem(ONCE_KEY, "1");
            if (message) window.alert(message);
        }

        // 알림이 닫힌 뒤 이동 (alert는 동기 블로킹이므로 다음 줄은 알림 이후 실행)
        navigate(to, { replace, state });
    }, [navigate, to, replace, state, message]);

    return null;
}