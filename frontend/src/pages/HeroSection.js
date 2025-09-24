import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, } from "@mui/material";
import background from "../image/heroSectionBackground.png"

export default function HeroSection() {
    const navigate = useNavigate();
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
            }}>
                <Container maxWidth="lg" sx={{mt:'20%', ml:'4%'}} >
                    <Typography fontSize="28px" color="common.white" fontWeight={700}>
                        가스 누출, 예측과 동시에 차단
                    </Typography>
                    <Typography color="grey.100" mt={1} mb={4}>
                        실시간 AI 분석으로 LEL 도달 전 자동 밸브 제어<br/>
                        누출을 ‘발생 전에’ 멈추는 방법
                    </Typography>
                    <Box sx={{display:"flex", width:'360px', justifyContent:'center'}}>
                    <Button 
                    sx={{
                        width: "160px", 
                        background:"rgba(255, 255, 255, 0.35)", 
                        color:"#001421", 
                        borderRadius:'10px'
                        }}
                        onClick={()=>navigate('/login')}>
                        로그인
                    </Button>
                    </Box>
                </Container>
            </Box>
        </>
    );
}