import React,{useEffect, useRef} from "react";
import { Outlet, useLocation } from "react-router-dom";
import AlertNavigate from "./AlertNavigate";

function isLoggedIn() {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("user_id");
    return Boolean(token || userId);
    }

export default function RequireAuth() {
    const location = useLocation();
    const firedRef = useRef(false);
    if (!isLoggedIn() && !firedRef.current) {
        firedRef.current = true;

        // 🔒 React 18/StrictMode에서도 안정적으로: 렌더 후 바로 실행
        const run = () => {
        alert("로그인이 필요합니다.");
        //   console.log("RequireAuth mount", location.pathname);
        window.location.replace("/login");
        };

        // queueMicrotask가 있으면 선호
        if (typeof queueMicrotask === "function") {
        queueMicrotask(run);
        } else {
        setTimeout(run, 0); // 폴백
        }

        return null; // 지금 프레임에서는 아무것도 렌더하지 않음
    }

    if (!isLoggedIn()) return null;
    return <Outlet />;
}