import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Container, Button, TextField, Input } from "@mui/material";
import background from "../image/heroSectionBackground.png"
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

import axios from "axios";
import { useEffect, useState } from "react";

export default function Register() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;
    const navigate = useNavigate();

    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailCheck, setEmailCheck] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");

    const [DupIdCheck, setDupIdCheck] = useState(false);
    const [emailSendCheck, setEmailSendCheck] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const [DupEmailCheck, setDupEmailCheck] = useState(false);

    const userRegister = async () => {
        // 1. 아이디 공백
        if (!id?.trim()) {
            alert("아이디를 작성해주세요.");
            return;
        }

        // 2. 아이디 중복 확인 안 함
        if (!DupIdCheck) {
            alert("아이디 중복확인을 해주세요.");
            return;
        }

        // 3. 비밀번호 공백
        if (!password?.trim()) {
            alert("비밀번호를 작성해주세요.");
            return;
        }

        // 4. 비밀번호 불일치
        if (password !== passwordCheck) {
            alert("비밀번호가 일치하지 않습니다. 동일하게 입력해주세요.");
            return;
        }

        // 5. 이름 공백
        if (!name?.trim()) {
            alert("이름을 작성해주세요.");
            return;
        }

        // 6. 이메일 인증 안 됨
        if (!DupEmailCheck) {
            alert("이메일을 인증해주세요.");
            return;
        }

        // 통과 후 실제 요청
        try {
            const res = await axios.post(`${BASE_URL}/users/register`, {
                user_id: id,
                password: password,
                name: name,
                email: email,
                phone: phone || null,
                company: company || null,
                department: department || null,
                position: position || null,
            });
            console.log("res", res);
            alert("회원가입이 완료되었습니다.");
            navigate('/login');
        } catch (err) {
            console.error("회원가입 실패vafasfsf",
                err?.response?.status,
                err?.response?.data
            );
            console.error("회원가입 실패", err);
            alert("회원가입 실패");
        }
    };

    const DuplicateId = async (id) => {
        try {
            const res = await axios.get(`${BASE_URL}/users/duplicateId/${id}`);
            const result = res?.data?.result; // "exists" | "not exists"
            if (result === "not exists") {
                alert("사용 가능한 아이디입니다.");
                setDupIdCheck(true);
            } else {
                alert("이미 존재하는 아이디입니다.");
                setDupIdCheck(false);
            }
        } catch (err) {
            console.error("아이디 중복체크 실패", err);
            alert("중복체크 실패");
            setDupIdCheck(false);
        }
    };

    const emailSend = async () => {
        console.log("email", email);

        try {
            const res = await axios.get(`${BASE_URL}/email/emailCheck/${email}`)
            console.log("res emailCheck true", res);
        } catch (err) {
            console.error("res emailCheck false", err);
            alert(err?.response?.data?.detail);
            return;
        }

        try {
            const res = await axios.post(`${BASE_URL}/email/send-email-code`, {
                email: email,
                purpose: "register",

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
                purpose: "register",
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
                <Box maxWidth="lg" sx={{ position: 'relative', p: '75px 120px 40px 120px', marginBlock: '5%', background: "rgba(90, 90, 90, 0.43)" }} >
                    <ArrowBackIosIcon sx={{ color: "#ffffffff", position: 'absolute', top: '15px', left: '18px', cursor: 'pointer' }} onClick={() => navigate(-1)} />
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography sx={{ fontSize: '34px', color: '#FFFFFF' }}>회원가입</Typography>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">아이디</Typography>
                            <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Input disableUnderline
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                sx={{
                                    marginBlock: '10px',
                                    width: '80%',
                                    backgroundColor: '#FFFFFF',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '10px'
                                }}
                                placeholder="아이디 입력(영어, 숫자 포함 6글자 이상)"
                                required
                            />
                            <Button
                                onClick={() => DuplicateId(id)}
                                sx={{
                                    marginBlock: '10px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: '2px solid #001929',
                                    height: '40px',
                                    color: '#001929',
                                    width: '78px'
                                }}>
                                중복 체크
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">비밀번호 </Typography>
                            <Typography color="red">*</Typography>
                        </Box>
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
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">비밀번호 확인</Typography>
                            <Typography color="red">*</Typography>
                        </Box>
                        <Input disableUnderline
                            type="password"
                            value={passwordCheck}
                            onChange={(e) => setPasswordCheck(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="비밀번호 재입력"
                            required
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">이름</Typography>
                            <Typography color="red">*</Typography>
                        </Box>
                        <Input disableUnderline
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="이름 입력"
                            required
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">이메일</Typography>
                            <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Input disableUnderline
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                sx={{
                                    marginBlock: '10px',
                                    width: '80%',
                                    backgroundColor: '#FFFFFF',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '10px'
                                }}
                                placeholder="이름 이메일 입력(aaaaaa@aaaaa.aaa)"
                                required
                            />
                            <Button
                                onClick={() => emailSend()}
                                disabled={!emailRegex.test(email)}  // 이메일 형식 맞아야만 활성화
                                sx={{
                                    marginBlock: '10px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: '2px solid #001929',
                                    height: '40px',
                                    color: '#001929',
                                    width: '78px'
                                }}>
                                인증 번호
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Box sx={{ display: "flex" }}>
                            <Typography color="#FFFFFF">이메일 인증</Typography>
                            <Typography color="red">*</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Input disableUnderline
                                value={emailCheck}
                                onChange={(e) => setEmailCheck(e.target.value)}
                                sx={{
                                    marginBlock: '10px',
                                    width: '80%',
                                    backgroundColor: '#FFFFFF',
                                    height: '40px',
                                    borderRadius: '10px',
                                    padding: '10px'
                                }}
                                placeholder="인증번호 입력"
                                required
                            />
                            <Button
                                disabled={!emailSendCheck}   // false면 비활성화
                                onClick={() => verifyEmailCode()}
                                sx={{
                                    marginBlock: '10px',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: '10px',
                                    border: '2px solid #001929',
                                    height: '40px',
                                    color: '#001929',
                                    width: '78px'
                                }}>
                                인증
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">전화번호</Typography>
                        <Input disableUnderline
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="전화번호 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">회사</Typography>
                        <Input disableUnderline
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="회사명 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">부서</Typography>
                        <Input disableUnderline
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="부서 입력"
                        />
                    </Box>
                    <Box sx={{ width: '400px', mt: '15px' }}>
                        <Typography color="#FFFFFF">직책</Typography>
                        <Input disableUnderline
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            sx={{
                                marginBlock: '10px',
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                height: '40px',
                                borderRadius: '10px',
                                padding: '10px'
                            }}
                            placeholder="직책 입력"
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: '30px' }}>
                        <Button
                            // disabled={
                            //     !id.trim() || id.trim().length < 4 ||
                            //     !DupIdCheck ||
                            //     !password.trim() || password.trim().length < 6 ||
                            //     !passwordCheck.trim() || password !== passwordCheck ||
                            //     !name.trim() ||
                            //     !emailRegex.test(email) ||
                            //     !DupEmailCheck
                            // }
                            sx={{
                                width: "70%",
                                height: '50px',
                                backgroundColor: "#001929",
                                color: "#FFFFFF",
                                borderRadius: '10px',
                                fontWeight: '500',
                                fontSize: '20px'
                            }}
                            onClick={() => userRegister()}>
                            회원가입
                        </Button>


                    </Box>
                </Box>
            </Box>
        </>
    );
}