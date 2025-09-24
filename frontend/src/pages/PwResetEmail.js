import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, Input, } from "@mui/material";
import background from "../image/heroSectionBackground.png";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function PwResetEmail() {
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
                justifyContent: 'center'

            }}>
                <Box maxWidth="lg" sx={{ position: "relative", p: '65px 120px 0px 120px', marginTop: '10%', marginBottom: '11%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <ArrowBackIosIcon sx={{ color: "#ffffffff", position: 'absolute', top: '15px', left: '18px', cursor: 'pointer' }} onClick={() => navigate(-1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>비밀번호 재설정</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '75px' }}>
                        <Typography color="#FFFFFF">이메일</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="이름 이메일 입력(aaaaaa@aaaaa.aaa)"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
                        <Button
                            sx={{
                                width: "70%",
                                height: '40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '700'
                            }}
                            onClick={{}}>
                            이메일 인증
                        </Button>

                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">인증번호</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="인증번호 입력" />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'center', mt: '10px' }}>
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
                            onClick={() => navigate()}>
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
                            onClick={{}}>
                            비밀번호 재설정
                        </Button>
                    </Box>
                </Box>
            </Box>
        </>
    )
}