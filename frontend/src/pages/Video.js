import { Typography, Box, Grid, Paper, Button, Divider, DialogContent, Dialog, DialogTitle, } from "@mui/material";
import background from "../image/sensorBackground.png";
import { useState, useMemo, useRef, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function Video() {
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const feeds = [
        { src: `${BASE_URL}/stream/1`, label: "CAM 1", place: '어디1' },
        { src: `${BASE_URL}/stream/2`, label: "CAM 2", place: '어디2' },
        { src: `${BASE_URL}/stream/3`, label: "CAM 3", place: '어디3' },
        { src: `${BASE_URL}/stream/4`, label: "CAM 4", place: '어디4' },
    ];

    const [selected, setSelected] = useState(null);
    const videoRefs = useRef([]);

    const wsRef = useRef(null);
    const [blocked, setBlocked] = useState(() => new Set());
    useEffect(() => {
        const ws = new WebSocket("ws://192.168.0.107/api/stream/events/");
        wsRef.current = ws;
        ws.onmessage = (e) => {
            console.log("WS message:", e.data);
            const data = JSON.parse(e.data);
            // if (data.blocking) {
            //     window.dispatchEvent(new CustomEvent("gas-block", { detail: data }));
            //     console.log(`영상 ${data.video} 차단 로직 발동!`);
            // }
            window.dispatchEvent(new CustomEvent("gas-block", { detail: data }));
            if (data.blocking) console.log(`영상 ${data.video} 차단 로직 발동!`);
        };
        ws.onerror = (e) => console.error("WS error:", e);
        ws.onclose = () => console.warn("WS closed");
        return () => ws.close();
    }, []);

    useEffect(() => {
        const handler = (e) => {
            console.log("[gas-block] raw detail =", e.detail);
            const { video, blocking } = e.detail || {};
            const idx = Number(video) - 1;
            console.log("[gas-block] parsed:", { idx, blocking, feedsLen: feeds.length });

            if (Number.isNaN(idx) || idx < 0 || idx >= feeds.length) return;


            setBlocked(prev => {
                const next = new Set(prev);

                if(blocking === true) next.add(idx);
                else next.delete(idx);
                return next;
            });
        };
        window.addEventListener("gas-block", handler);
       
    }, []);
    


    const handleUnblock=(idx)=>{
        const ws= wsRef.current;
        if(ws&&ws.readyState===WebSocket.OPEN){
            ws.send(JSON.stringify({action:"release", video: idx +1}));
        }else{
            console.warn("WS not open; release skipped");
        }
    }
    return (
        <>
            <Box sx={{
                width: "100%",
                minHeight: "93.3vh",
                display: "flex",
                backgroundColor: '#92a5b6ff',
                // backgroundImage: `linear-gradient(rgba(216, 216, 216, 0.7), rgba(216, 216, 216, 0.7)), url(${background})`,
                // backgroundSize: "cover",
                // backgroundPosition: "center",
                // backgroundRepeat: "no-repeat",
                display: 'flex',
                flexDirection: 'column'
            }}>

                <Box>
                    <Typography sx={{ m: '25px 0px 20px 40px', fontSize: '24px', fontWeight: 600, color: '#ffffffff' }}>CCTV</Typography>
                </Box>

                {selected && (
                    <Dialog open={selected} onClose={() => setSelected(false)} maxWidth={false}
                        PaperProps={{
                            sx: { width: 900, justifyItems: 'center', bgcolor: "#92a5b6ff" }
                        }}
                    >
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'end', width: 850 }}>
                            {/* <Button onClick={() => setSelected(false)} sx={{ p: 0, m: 0 }}> */}
                            <CloseIcon
                                onClick={() => setSelected(false)}
                                sx={{ fontSize: "30px", color: '#001929', cursor: 'pointer' }} />
                            {/* </Button> */}
                        </DialogTitle>
                        <DialogContent sx={{ width: 800 }}>
                            <Box sx={{
                                display: "flex",
                                gap: 2,
                                px: 3,
                                mb: 2,
                                justifyItems: 'center'
                            }}>
                                {/* 확대된 비디오 */}
                                <Box sx={{
                                    position: "relative",
                                    flex: "0 0 800px",
                                    height: 600,
                                    // minWidth: 700,
                                    // aspectRatio: "16/9",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    bgcolor: "black",
                                    boxShadow: 3,
                                }}>
                                    <img
                                        src={selected.src}
                                        controls={false}
                                        preload="auto"
                                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                                        // onLoadedMetadata={(e) => {
                                        //     try {
                                        //         if (selected.time != null) e.currentTarget.currentTime = selected.time;
                                        //         const p = e.currentTarget.play();
                                        //         if (p?.catch) p.catch(() => { });
                                        //     } catch { }
                                        // }}
                                    />
                                    <Box sx={{ position: "absolute", top: 8, left: 10, px: 1, py: 0.5, bgcolor: "rgba(0,0,0,.55)", borderRadius: 1 }}>
                                        <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>
                                            {selected.label}
                                        </Typography>
                                    </Box>
                                </Box>

                            </Box>
                        </DialogContent>
                    </Dialog>
                )}
                <Box sx={{ display: 'flex', mb: 2 }}>
                    <Grid container spacing={2} sx={{ ml: '25px', width: '80%' }}>
                        {feeds.map(({ src, label, place }, i) => (
                            <Box
                                onClick={() => {
                                    const time = videoRefs.current[i]?.currentTime ?? 0;
                                    setSelected({ src, label, place, time })
                                }}
                                sx={{
                                    position: "relative",
                                    width: "48%",
                                    aspectRatio: "13/9",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    bgcolor: "black",
                                    border: blocked.has(i) ? "2px solid #ff224fff" : "2px solid transparent",
                                    boxShadow: blocked.has(i)
                                        ? "0 0 0 2px rgba(255,23,68,.35), 0 0 16px rgba(255,23,68,.45)"
                                        : 2,
                                }}
                            >
                                <img
                                    ref={(el) => (videoRefs.current[i] = el)}
                                    src={src}
                                    
                                    controls={false}
                                    // 여러 개 동시에라면 네트워크 부담 줄이려면 'metadata'나 'none' 사용
                                    preload="metadata"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "110%",
                                        objectFit: "cover",
                                    }}

                                />

                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 8,
                                        left: 10,
                                        px: 1,
                                        py: 0.5,
                                        bgcolor: "rgba(0,0,0,.55)",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "#fff", fontWeight: 700 }}>
                                        {label}
                                    </Typography>
                                </Box>
                            </Box>

                        ))}
                    </Grid>
                    <Paper sx={{ backgroundColor: '#001929', width: '14%', color: '#fff', p: 2 }}>
                        <Typography sx={{ textAlign: 'center', fontWeight: 700 }}>가스 노출 차단</Typography>
                        <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,.2)" }} />
                        {blocked.size === 0 ? (
                            <Typography sx={{ opacity: 0.8, textAlign: "center" }}>이상 없음</Typography>
                        ) : (
                            Array.from(blocked).sort((a, b) => a - b).map(idx => (
                                <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", p: "6px 8px", mb: 1, borderRadius: 1, bgcolor: "rgba(255, 23, 68, .15)" }}>
                                    <Typography>{feeds[idx].label}</Typography>
                                    <Box onClick={() => handleUnblock(idx)} sx={{ cursor: 'pointer', px: 1, py: "2px", borderRadius: "6px", bgcolor: "#ff224fff", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                                        차단해지
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Paper>
                </Box>
            </Box>
        </>
    )
}