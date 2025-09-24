import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Container, Button, Input, } from "@mui/material";
import background from "../image/heroSectionBackground.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function IdFindResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const id = location.state?.id?.trim();
    const createdAt = location.state?.created_at;

    return (
        <>
            <Box sx={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${background})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                justifyContent: 'center'

            }}>

                <Box maxWidth="lg" sx={{ position: "relative", p: '65px 120px 0px 120px', marginTop: '10%', marginBottom: '15%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <ArrowBackIosIcon sx={{ color: "#ffffffff", position: 'absolute', top: '15px', left: '18px', cursor: 'pointer' }} onClick={() => navigate(-1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>아이디 찾기</Typography>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                        <Typography sx={{ color: '#ffffffff' }}>회원님의 아이디는 다음과 같습니다.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 13, gap: 2 }}>
                        <Typography sx={{ color: '#ffffff' }}>아이디: {id || "-"}</Typography>
                        <Typography sx={{ color: '#ffffff' }}>가입 일자: {createdAt || "-"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: '140px' }}>

                        <Button
                            sx={{
                                width: "100%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '500',
                                fontSize: '13px'
                            }}
                            onClick={() => navigate("/pwresetid")}>
                            비밀번호 재설정
                        </Button>
                        <Button
                            sx={{
                                width: "100%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '500',
                                fontSize: '13px'
                            }}
                            onClick={() => navigate("/login")}>
                            로그인
                        </Button>
                    </Box>
                </Box>

            </Box>
        </>
    )
}