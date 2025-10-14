import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Container, Button, Input, } from "@mui/material";
import background from "../image/heroSectionBackground.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from "axios";
import { useEffect, useState, useRef } from "react";

export default function PwReset() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email?.trim()
    const warnedRef = useRef(false);

    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");

    useEffect(() => {
        console.log("email222", email);
        if (!email && !warnedRef.current) {
            warnedRef.current = true;
            alert("인증된 이메일 정보가 없습니다. 이메일 인증부터 진행해주세요.");
            navigate("/pwresetemail", { replace: true });
        }
    }, [email, navigate]);


    const passwordReset = async (e) => {
        e.preventDefault();
        // 1. 비밀번호 공백
        if (!password?.trim()) {
            alert("비밀번호를 입력해주세요.");
            return;
        }
        // 2. 비밀번호 불일치
        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            await axios.post(`${BASE_URL}/users/reset-password`, {
                email: email,
                password: password,
            });

            alert("비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.");
            navigate("/login", { replace: true });
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.detail || "비밀번호 변경을 실패하였습니다.");
        }
    };




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
                    <Box sx={{ width: '400px', mt: '80px' }}>
                        <Typography color="#FFFFFF">비밀번호</Typography>
                        <Input disableUnderline
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="비밀번호 입력(영어, 숫자 포함 8글자 이상)"
                            required
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">비밀번호 확인</Typography>
                        <Input disableUnderline
                            value={passwordCheck}
                            type="password"
                            onChange={(e) => setPasswordCheck(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="비밀번호 확인"
                            required
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '50px' }}>
                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                            onClick={(e) => passwordReset(e)}>
                            비밀번호 재설정
                        </Button>

                    </Box>





                </Box>
            </Box>
        </>
    )
}