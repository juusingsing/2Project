import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toolbar, Box } from "@mui/material";
import TopBar from "../componants/TopBar";
import Menu from "../componants/Menu";

export default function MainLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        id: sessionStorage.getItem("user_id"),
        name: sessionStorage.getItem("name"),
        email: sessionStorage.getItem("email"),
    });

    const openMenu = () => setMenuOpen(true);
    const closeMenu = () => setMenuOpen(false);
    const toggleMenu = () => setMenuOpen(v => !v);

    useEffect(() => closeMenu(), [location.pathname]);

    // name이 있으면 "이름님 환영합니다!", 없으면 "로그인"
    const welcomeText = user.name ? `${user.name}님 환영합니다!` : "로그인";

    return (
        <>
            <TopBar
                open={menuOpen}
                onOpen={openMenu}
                onClose={closeMenu}
                onToggle={toggleMenu}
                welcomeText={welcomeText}
            />
            <Box sx={{ height: `60px` }} />
            <Outlet context={{ user, setUser }} />
            <Menu
                open={menuOpen}
                onClose={closeMenu}
                onSelect={(it) => it.path && navigate(it.path)}
            />
        </>
    );
}