import React, { useState } from "react";
import { Box, Typography, Container, Stack, Paper, Button, Chip } from "@mui/material";
import background from "../image/sensorBackground.png";
import ModeToggle from "../componants/Toggle.js";

export default function Sensor() {
    const [mode, setMode] = useState("auto");
    const isManual = mode === "manual";
    return (
        <>
            <Box sx={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                backgroundColor:'#92a5b6ff'
                // backgroundImage: `linear-gradient(rgba(216, 216, 216, 0.7), rgba(216, 216, 216, 0.7)), url(${background})`,
                // backgroundSize: "cover",
                // backgroundPosition: "center",
                // backgroundRepeat: "no-repeat",
            }}>
                <Box>
                    <Typography sx={{ color: '#ffffffff', m: '25px 0px 20px 40px', fontSize: '24px', fontWeight: 600 }}>농도 기반 예측</Typography>
                    <Box sx={{ justifyItems: 'center' }}>

                        <Stack direction="row" spacing={6} sx={{ width: '100vw', justifyContent: 'center' }}>
                            <Paper sx={{ width: '27%', height: '220px', backgroundColor: '#41515B', borderRadius: '25px' }}>
                                <Typography sx={{
                                    color: '#FFFFFF',
                                    m: '15px 0px 0px 20px',
                                    fontSize: '20px',
                                }}>가스</Typography>
                                {/* 가스 종류 연결 */}
                                <Typography sx={{
                                    textAlign:'center',
                                    color: '#FFFFFF',
                                    mt: '50px',
                                    fontSize: '30px',
                                }}>가스 종류</Typography>
                            </Paper>
                            <Paper sx={{ width: '27%', backgroundColor: '#41515B', borderRadius: '25px' }}>
                                <Typography sx={{
                                    color: '#FFFFFF',
                                    m: '15px 0px 0px 20px',
                                    fontSize: '20px'
                                }}>LEL</Typography>
                                <Box sx={{display:'flex', justifyContent:'center', mt:'35px', alignItems:'center', gap:1}}>
                                {/* 여기 LEL 연결 */}
                                <Typography sx={{
                                    color: '#FFFFFF',
                                    m: '15px 0px 0px 20px',
                                    fontSize: '30px'
                                }}>수치</Typography>
                                <Typography sx={{
                                    color: '#FFFFFF',
                                    m: '15px 0px 0px 20px',
                                    fontSize: '20px'
                                }}>%</Typography>
                                </Box>
                            </Paper>
                            <Paper sx={{ width: '27%', backgroundColor: '#41515B', borderRadius: '25px' }}>
                                <Typography sx={{
                                    color: '#FFFFFF',
                                    m: '15px 0px 0px 20px',
                                    fontSize: '20px'
                                }}>상태</Typography>
                                {/* 여기 상태 연결 */}
                                <Typography sx={{
                                    textAlign:'center',
                                    color: '#FFFFFF',
                                    mt: '50px',
                                    fontSize: '30px'
                                }}>상태</Typography>
                            </Paper>
                        </Stack>



                        <Paper sx={{ width: '90%', mt: 5, borderRadius: '15px' }}>
                            <Box sx={{ display: 'flex', p: '15px 20px', justifyContent:'space-between' }}>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, }}>벨브 제어</Typography>
                                <ModeToggle value={mode} onChange={setMode} width={140} height={40} />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, ml: 2, alignItems: 'center' }}>
                                <Typography>현재 상태:</Typography>
                                {/* 이거 바뀌어야함 */}
                                <Typography sx={{ fontSize: '20px', fontWeight: 600 }}>닫힘 </Typography>
                                <Chip sx={{ backgroundColor: '#ffb168ff' }} label='gg' size='small'></Chip>
                            </Box>
                            {/* 자동일떄 */}
                            {!isManual && (
                                <>
                                    <Box sx={{ display: "flex", ml: 2, mt: 1, gap: 1 }}>
                                        <Button 
                                        onClick={()=>alert('수동모드에서만 조작이 가능합니다.')}
                                        sx={{
                                            height: '45px',
                                            width: '12%',
                                            backgroundColor: 'rgba(95, 64, 64, 1)',
                                            borderRadius: '15px',
                                            color: '#ffffff67'
                                        }}>잠김(닫기)</Button>
                                        <Button 
                                        onClick={()=>alert('수동모드에서만 조작이 가능합니다.')}
                                        sx={{
                                            height: '45px',
                                            width: '12%',
                                            backgroundColor: 'rgba(56, 77, 57, 1)',
                                            borderRadius: '15px',
                                            color: '#ffffff67'
                                        }}>해제(열기)</Button>
                                    </Box>
                                    <Typography sx={{
                                        fontSize: '12px',
                                        color: '#6d6d6dff',
                                        ml: 3,
                                        mt: 1,
                                        pb: 2
                                    }}>수동 모드에서만 조작이 가능합니다.</Typography>
                                </>
                            )}
                            {/* 수동일떄 */}
                            {isManual && (
                                <Box sx={{ display: "flex", ml: 2, mt: 1, gap: 1, pb: 2 }}>
                                    <Button sx={{
                                        height: '45px',
                                        width: '12%',
                                        backgroundColor: '#B43737',
                                        borderRadius: '15px',
                                        color: '#ffffffff'
                                    }}>잠김(닫기)</Button>
                                    <Button sx={{
                                        height: '45px',
                                        width: '12%',
                                        backgroundColor: '#33682F',
                                        borderRadius: '15px',
                                        color: '#ffffffff'
                                    }}>해제(열기)</Button>
                                </Box>
                            )}
                        </Paper>
                        <Paper sx={{ width: '90%', mt: 3, borderRadius: '15px' }}>
                            <Box sx={{ p: '15px 20px', }}>
                                <Typography sx={{ fontSize: '20px', fontWeight: 700, }}>예측 로그</Typography>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </>
    )
}