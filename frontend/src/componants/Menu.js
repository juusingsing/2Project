import React from "react";
import { Drawer, Box, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function BottomMenu({ open, onClose, onSelect }) {
    const items = [
        { key: "home", label: "홈", path: "/main" },
        { key: "sensor", label: "센서", path: "/sensor" },
        { key: "video", label: "영상", path: "/video" },
        { key: "menu3", label: "메뉴3", path: "/menu3" },
    ];
    const bottomItems = [
        { key: "alert", label: "알림", path: "/alert" },
        { key: "option", label: "설정", path: "/option" },
        { key: "logout", label: "로그아웃" }
    ]
    const HEADER_H = 60;
    const { pathname } = useLocation();
    const isActive = (path) => !!path && pathname.startsWith(path);


    const navigate = useNavigate();
    const logout = () => {
        sessionStorage.removeItem("user_id");
        sessionStorage.removeItem("name");
        sessionStorage.removeItem("email");

        alert("로그아웃 하였습니다.");

        navigate('/login');
    }


    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            keepMounted
            ModalProps={{
                BackdropProps: {
                    sx: {
                        top: 60,
                    },
                },
            }}
            transitionDuration={{ enter: 280, exit: 200 }}
            PaperProps={{
                sx: {
                    top: 60,
                    height: `calc(100vh-60)`,
                    width: '100vw',
                    borderTopLeftRadius: 16,
                    borderBottomRightRadius: 16,
                    backgroundColor: "rgba(78, 78, 78, 0.48)",
                    backdropFilter: "blur(10px)",
                    color: "common.white",
                },
            }}
        >
            <Box sx={{ p: 4 }}>
                {/* <Box sx={{ width: 40, height: 4, bgcolor: "grey.500", borderRadius: 99, mx: "auto", mb: 2 }} /> */}
                <Typography sx={{ px: 1, pb: 1, opacity: 0.9, fontSize: '24px' }}>메뉴</Typography>
                <List sx={{ p: 0 }}>
                    {items.map((it) => {
                        const selected = isActive(it.path);
                        return (
                            <ListItemButton
                                key={it.key}
                                selected={selected}
                                aria-current={selected ? "page" : undefined}
                                onClick={() => {
                                    onSelect?.(it);
                                    onClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.75)", color: 'black' },
                                    "&.Mui-selected": {
                                        bgcolor: "rgba(255,255,255,0.95)",
                                        color: "black",
                                    },
                                    "&.Mui-selected:hover": {
                                        bgcolor: "rgba(255,255,255,0.95)",
                                        color: "black",
                                    },
                                }}
                            >
                                <ListItemText primary={it.label} primaryTypographyProps={{ fontSize: 20, fontWeight: 400, lineHeight: 1.1, }} />
                            </ListItemButton>
                        )
                    })}
                </List>
            </Box>
            <Box sx={{ p: 4, marginTop: 40 }}>
                <List >
                    {bottomItems.map((bit) => {
                        const selected = isActive(bit.path);
                        return (
                            <ListItemButton
                                key={bit.key}
                                selected={selected}
                                aria-current={selected ? "page" : undefined}
                                onClick={() => {
                                    if (bit.key === "logout") {
                                        logout()
                                        // onLogout?.();
                                    } else {
                                        onSelect?.(bit);
                                    }
                                    onClose();
                                }}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.75)", color: 'black' },
                                    "&.Mui-selected": {
                                        bgcolor: "rgba(255,255,255,0.95)",
                                        color: "black",
                                    },
                                    "&.Mui-selected:hover": {
                                        bgcolor: "rgba(255,255,255,0.95)",
                                        color: "black",
                                    },
                                }}
                            >
                                <ListItemText primary={bit.label} primaryTypographyProps={{ fontSize: 12, fontWeight: 400, lineHeight: 1.1 }} />
                            </ListItemButton>
                        )
                    })}
                </List>
            </Box>
        </Drawer>
    );
}
