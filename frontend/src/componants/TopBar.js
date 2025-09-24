import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, IconButton, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Logo from '../image/logo.png';

export default function TopBar({ open, onOpen, onClose, welcomeText = "님 환영합니다!" }) {
    const navigate = useNavigate();
    return (
        <Box sx={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            zIndex: (t) => t.zIndex.modal + 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '60px',
            backgroundColor: '#001929',
        }}>
            <Box component="img" src={Logo} alt="Logo" sx={{ height: 36, ml: '15px', cursor:'pointer' }} onClick={()=>navigate(`/main`)}/>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '15px', paddingInline: '15px' }}>
                <Typography sx={{ color: '#FFFFFF' }}>{welcomeText}</Typography>
                <IconButton
                    aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
                    onClick={open ? onClose : onOpen}
                    size="large"
                    sx={{ color: "white" }}
                >
                    {open ? <CloseRoundedIcon fontSize="inherit" /> : <MenuIcon fontSize="inherit" />}
                </IconButton>
            </Box>
        </Box>
    )
}