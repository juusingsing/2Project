import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Toolbar,Box } from "@mui/material";
import TopBar from "../componants/TopBar";
import Menu from "../componants/Menu";

export default function MainLayout() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const openMenu = () => setMenuOpen(true);
    const closeMenu = () => setMenuOpen(false);
    const toggleMenu = () => setMenuOpen(v => !v);

    useEffect(() => closeMenu(), [location.pathname]);
    return (
        <>
            <TopBar
                open={menuOpen}
                onOpen={openMenu}
                onClose={closeMenu}
                onToggle={toggleMenu}
                welcomeText="님 환영합니다!"
            />
            <Box sx={{ height: `60px` }} />
            <Outlet />
            <Menu
                open={menuOpen}
                onClose={closeMenu}
                onSelect={(it) => it.path && navigate(it.path)}
            />
        </>
    );
}