import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, TextField, Input } from "@mui/material";
import background from "../image/heroSectionBackground.png"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import axios from "axios"
import { useEffect, useState } from "react";

export default function Login() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");


    const userLogin = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/users/login`, {
                user_id: id,
                password: password,
            });
            const result = res?.data?.result; // "exists" | "not exists"
            sessionStorage.setItem("user_id", res?.data?.user?.user_id);
            sessionStorage.setItem("name", res?.data?.user?.name);
            sessionStorage.setItem("email", res?.data?.user?.email);
            alert("로그인 성공");
            navigate('/main');
        } catch (err) {
            console.error("로그인 실패", err);
            alert(err?.response?.data?.detail);
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
                <Box maxWidth="lg" sx={{ position: "relative", p: '75px 120px 0px 120px', marginTop: '13%', marginBottom: '18%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <ArrowBackIosIcon sx={{ color: "#ffffffff", position: 'absolute', top: '15px', left: '18px', cursor: 'pointer' }} onClick={() => navigate(-1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>로그인</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
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
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
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
                            }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', mt: '30px' }}>
                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                            onClick={() => userLogin()}>
                            로그인
                        </Button>


                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#FFFFFF",
                                color: "#001929",
                                border: "3px solid #001929",
                                borderRadius: '10px',
                                fontWeight: '800'
                            }}
                            onClick={() => navigate("/register")}>
                            회원가입
                        </Button>

                        <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', height: '25px', display: 'flex', gap: 2, alignItems: 'center', paddingInline: '20px' }}>
                            <Typography onClick={() => navigate('/idfind')} sx={{ color: '#9c9c9cdd', fontSize: '12px', cursor: 'pointer' }}>
                                아이디 찾기
                            </Typography>
                            <Typography sx={{ color: '#9c9c9cdd', fontSize: '12px' }}>|</Typography>
                            <Typography onClick={() => navigate('/pwresetid')} sx={{ color: '#9c9c9cdd', fontSize: '12px', cursor: 'pointer' }}>
                                비밀번호 찾기
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </>
    );
}