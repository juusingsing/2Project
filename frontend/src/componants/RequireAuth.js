import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import AlertNavigate from "./AlertNavigate";

function isLoggedIn() {
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("user_id");
  return Boolean(token || userId);
}

export default function RequireAuth() {
  const location = useLocation();
  if (!isLoggedIn()) {
    return (
      <AlertNavigate
        to="/login"
        message="로그인이 필요합니다."
        state={{ from: location, }}
      />
    );
  }
  return <Outlet />;
}