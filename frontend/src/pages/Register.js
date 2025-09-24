import React from "react";
import { Box, Typography, Container, Button, TextField, Input } from "@mui/material";
import background from "../image/heroSectionBackground.png"

export default function Register() {

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
                <Box maxWidth="lg" sx={{ p: '75px 120px 40px 120px', marginBlock: '5%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>회원가입</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">아이디</Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{display:'flex', justifyContent:'space-between'}}>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '80%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="아이디 입력(영어, 숫자 포함 6글자 이상)"
                        />
                        <Button 
                        sx={{
                            marginBlock: '10px',
                            backgroundColor:'#FFFFFF',
                            borderRadius:'10px',
                            border:'2px solid #001929', 
                            height:'40px',
                            color:'#001929',
                            width:'78px'
                        }}>
                            중복 체크
                        </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">비밀번호 </Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="비밀번호 입력(영어, 숫자 포함 8글자 이상)"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">비밀번호 확인</Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="비밀번호 재입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">이름</Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="이름 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">이메일</Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{display:'flex', justifyContent:'space-between'}}>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '80%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="이름 이메일 입력(aaaaaa@aaaaa.aaa)"
                        />
                        <Button 
                        sx={{
                            marginBlock: '10px',
                            backgroundColor:'#FFFFFF',
                            borderRadius:'10px',
                            border:'2px solid #001929', 
                            height:'40px',
                            color:'#001929',
                            width:'78px'
                        }}>
                            인증 번호
                        </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{display:"flex"}}>
                        <Typography color="#FFFFFF">이메일 인증</Typography>
                        <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{display:'flex', justifyContent:'space-between'}}>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '80%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="인증번호 입력"
                        />
                        <Button 
                        sx={{
                            marginBlock: '10px',
                            backgroundColor:'#FFFFFF',
                            borderRadius:'10px',
                            border:'2px solid #001929', 
                            height:'40px',
                            color:'#001929',
                            width:'78px'
                        }}>
                            인증
                        </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">전화번호</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="전화번호 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">회사</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="회사명 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">부서</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="부서 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">직책</Typography>
                        <Input disableUnderline
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius:'10px',
                                padding:'10px'
                            }}
                            placeholder="직책 입력"
                        />
                    </Box>

                    <Box sx={{display:'flex', justifyContent:'center', mt:'30px'}}>
                        <Button
                            sx={{
                                width: "70%",
                                height:'50px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight:'500',
                                fontSize:'20px'
                            }}
                            onClick={{}}>
                            회원가입
                        </Button>
                        
                        
                    </Box>
                </Box>
            </Box>
        </>
    );
}