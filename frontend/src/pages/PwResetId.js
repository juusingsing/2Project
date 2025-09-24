import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, Input, } from "@mui/material";
import background from "../image/heroSectionBackground.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from "axios";
import { useEffect, useState } from "react";

export default function PwResetId() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();

    const [id, setId] = useState("");

    const idCheck = async (id) => {
        // 1. 아이디 공백
        if (!id?.trim()) {
            alert("아이디를 작성해주세요.");
            return;
        }

        try {
            const res = await axios.get(`${BASE_URL}/users/idCheck/${id}`);
            console.log("res", res);
            navigate("/pwresetemail");

        } catch (err) {
            console.error("아이디 없음", err);
            alert(err?.response?.data?.detail || "아이디가 존재하지않습니다.");
        }
    }

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
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>비밀번호 재설정</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '110px' }}>
                        <Typography color="#FFFFFF">아이디</Typography>
                        <Input disableUnderline
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="아이디 입력"
                            required
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '120px' }}>
                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                            onClick={() => idCheck(id)}>
                            아이디 확인
                        </Button>
                    </Box>




                </Box>
            </Box>
        </>
    )
}