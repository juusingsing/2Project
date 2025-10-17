import React, { useState, useEffect } from "react";
import { Box, Typography, Container, Button, } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import TopBar from "../componants/TopBar.js";
// import Menu from "../componants/Menu.js";
import mainTop from "../image/mainTop.png";
import mainSensor from '../image/mainSensor.png';
import mainImage from '../image/mainImage.png';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useNavigate, useLocation } from "react-router-dom";

export default function Main() {

    const navigate = useNavigate();

    return (
        <>
            <Box sx={{
                width: "100%",
                minHeight: "650px",
                display: "flex",
                backgroundImage: `linear-gradient(rgba(0,0,0,.35), rgba(133, 133, 133, 0.23)), url(${mainTop})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderEndEndRadius: '60px',

            }}>
                <Container maxWidth="lg" sx={{ mt: '10%', ml: '4%' }} >
                    <Typography fontSize="28px" color="common.white" fontWeight={700}>
                        가스 누출, 예측과 동시에 차단
                    </Typography>
                    <Typography color="grey.100" mt={1} mb={4}>
                        실시간 AI 분석으로 LEL 도달 전 자동 밸브 제어<br />
                        누출을 ‘발생 전에’ 멈추는 방법
                    </Typography>
                </Container>
            </Box>
            <Box sx={{
                marginTop: '20px',
                marginBottom: '30px',
                paddingInline: '20px',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <Box sx={{
                    width: "49%",
                    minHeight: "300px",
                    display: 'flex',
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.70)), url(${mainSensor})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: '15px',
                    "&:hover": {
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85)), url(${mainSensor})`, // 진하게 정도 조절
                    },
                    cursor: 'pointer'
                }}
                    onClick={() => navigate("/sensor")}
                >
                    <Container maxWidth="lg" sx={{ mt: '10%', ml: '4%' }} >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography fontSize="28px" color="common.white" fontWeight={700}>
                                센서
                            </Typography>
                            <ArrowForwardIosIcon sx={{ color: '#FFFFFF' }} />
                        </Box>

                        <Typography color="grey.100" mt={1} mb={4}>
                            실시간 가스 농도 모니터링<br />
                            이상치 알림
                        </Typography>

                    </Container>
                </Box>
                <Box sx={{
                    width: "49%",
                    minHeight: "300px",
                    display: 'flex',
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0.70)), url(${mainImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    borderRadius: '15px',
                    "&:hover": {
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.85)), url(${mainImage})`, // 진하게 정도 조절
                    },
                    cursor: 'pointer'
                }}
                    onClick={() => navigate("/video")}
                >
                    <Container maxWidth="lg" sx={{ mt: '10%', ml: '4%' }} >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography fontSize="28px" color="common.white" fontWeight={700}>
                                CCTV
                            </Typography>
                            <ArrowForwardIosIcon sx={{ color: '#FFFFFF' }} />
                        </Box>
                        <Typography color="grey.100" mt={1} mb={4}>
                        
                            가스 누출 탐지<br/>차단 자동화
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </>
    )
}