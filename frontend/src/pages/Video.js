import { Typography, Box, Grid } from "@mui/material";
import background from "../image/sensorBackground.png";
// 영상 임포트
// import cam1 from "../assets/cam1.mp4";
// import cam2 from "../assets/cam2.mp4";
// import cam3 from "../assets/cam3.mp4";
// import cam4 from "../assets/cam4.mp4";

export default function Video() {
    // const feeds = [
    //     { src: cam1, label: "CAM 1" },
    //     { src: cam2, label: "CAM 2" },
    //     { src: cam3, label: "CAM 3" },
    //     { src: cam4, label: "CAM 4" },
    // ];
    return (
        <>
            <Box sx={{
                width: "100%",
                minHeight: "100vh",
                display: "flex",
                backgroundColor: '#92a5b6ff'
                // backgroundImage: `linear-gradient(rgba(216, 216, 216, 0.7), rgba(216, 216, 216, 0.7)), url(${background})`,
                // backgroundSize: "cover",
                // backgroundPosition: "center",
                // backgroundRepeat: "no-repeat",
            }}>
                <Box>
                    <Typography sx={{ m: '25px 0px 20px 40px', fontSize: '24px', fontWeight: 600, color: '#ffffffff' }}>CCTV</Typography>
                </Box>
                {/* <Grid container spacing={2}>
                    {feeds.map(({ src, label }, i) => (
                        <Grid key={i} item xs={12} sm={6} md={6} lg={6}>
                            <Box
                                sx={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "16/9",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    bgcolor: "black",
                                    boxShadow: 2,
                                }}
                            >
                                <video
                                    src={src}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    // controls를 주석/삭제하거나 false로
                                    controls={false}
                                    // 여러 개 동시에라면 네트워크 부담 줄이려면 'metadata'나 'none' 사용
                                    preload="metadata"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                    onLoadedMetadata={(e) => {
                                        // 일부 브라우저에서 자동재생 보조
                                        const v = e.currentTarget;
                                        const p = v.play();
                                        if (p && typeof p.catch === "function") p.catch(() => { });
                                    }}
                                /> */}

                                {/* 좌상단 라벨 (선택)
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
                        </Grid> */}
                    {/* ))} */}
                {/* </Grid> */}
            </Box>
        </>
    )
}