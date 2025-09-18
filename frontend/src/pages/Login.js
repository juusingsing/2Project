import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, TextField, Input } from "@mui/material";
import background from "../image/heroSectionBackground.png"

export default function Login() {
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
                <Box maxWidth="lg" sx={{ p: '75px 120px 0px 120px', marginTop: '13%',marginBottom:'18%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>로그인</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">아이디</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">비밀번호</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }} />
                    </Box>
                    <Box sx={{display:'flex', flexDirection:'column', gap:'5px', alignItems:'center', mt:'30px'}}>
                        <Button
                            sx={{
                                width: "70%",
                                height:'40px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight:'700'
                            }}
                            onClick={{}}>
                            로그인
                        </Button>
                        
          
                        <Button
                            sx={{
                                width: "70%",
                                height:'40px',
                                backgroundColor: "#FFFFFF",
                                color: "#001929",
                                border:"3px solid #001929",
                                borderRadius: '10px',
                                fontWeight:'800'
                            }}
                            onClick={()=>navigate("/register")}>
                            회원가입
                        </Button>
                        
                    </Box>
                </Box>
            </Box>
        </>
    );
}