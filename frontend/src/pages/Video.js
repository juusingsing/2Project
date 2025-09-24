import { Typography, Box } from "@mui/material";
import background from "../image/sensorBackground.png";

export default function Video() {
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
                {/* <Grid>

                </Grid> */}
            </Box>
        </>
    )
}