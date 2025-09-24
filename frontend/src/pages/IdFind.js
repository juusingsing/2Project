import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, Input, } from "@mui/material";
import background from "../image/heroSectionBackground.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from "axios"

export default function IdFind() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [emailCheck, setEmailCheck] = useState("");

    const [emailSendCheck, setEmailSendCheck] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [DupEmailCheck, setDupEmailCheck] = useState(false);

    const emailSend = async () => {
        console.log("email", email);
        try {
            const res = await axios.post(`${BASE_URL}/email/send-email-code`, {
                email: email,
                purpose: "idFind",

            })
            console.log("res", res);
            alert(res?.data?.result);
            setEmailSendCheck(true);
        } catch (err) {
            console.error("이메일 인증번호 전송 실패", err);
            setEmailSendCheck(false);
        }
    }

    const verifyEmailCode = async () => {
        console.log("email", email);
        try {
            const res = await axios.post(`${BASE_URL}/email/verify-email-code`, {
                email: email,
                purpose: "idFind",
                code: emailCheck,
            })
            const result = res?.data?.result; // "verified" | "already verified"
            if (result === "verified" || result === "already verified") {
                alert("이메일 인증 완료!");
                setDupEmailCheck(true);   // ✅ 최종 인증 통과
            } else {
                alert("이메일 인증에 실패했습니다.");
                setDupEmailCheck(false);
            }
        } catch (err) {
            console.error("이메일 인증 실패", err);
            alert(err?.response?.data?.detail || "이메일 인증 실패");
            setDupEmailCheck(false);
        }
    }

    const idFindOut = () => {
        // 1. 이메일 인증 안 됨
        if (!DupEmailCheck) {
            alert("이메일을 인증해주세요.");
            return;
        }
        alert("good");
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
                <Box maxWidth="lg" sx={{ position: "relative", p: '75px 120px 0px 120px', marginTop: '10%', marginBottom: '16%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <ArrowBackIosIcon sx={{ color: "#ffffffff", position: 'absolute', top: '15px', left: '18px', cursor: 'pointer' }} onClick={() => navigate(-1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>아이디 찾기</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">이메일</Typography>
                        <Input disableUnderline
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="이메일 입력(aaaaaa@aaaaa.aaa)"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
                        <Button
                            onClick={() => emailSend()}
                            disabled={!emailRegex.test(email)}  // 이메일 형식 맞아야만 활성화
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}>
                            이메일 인증
                        </Button>

                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">인증번호</Typography>
                        <Input disableUnderline
                            value={emailCheck}
                            onChange={(e) => setEmailCheck(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="인증번호 입력"
                            required
                        />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', mt: '10px' }}>
                        <Button
                            disabled={!emailSendCheck}   // false면 비활성화
                            onClick={() => verifyEmailCode()}
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#FFFFFF",
                                color: "#001929",
                                border: "3px solid #001929",
                                borderRadius: '10px',
                                fontWeight: '800'
                            }}
                        >
                            인증 확인
                        </Button>
                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                            onClick={() => idFindOut()}>
                            아이디 찾기
                        </Button>
                    </Box>




                </Box>
            </Box>
        </>
    )
}