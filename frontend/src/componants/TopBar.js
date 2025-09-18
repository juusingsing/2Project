import React from "react";
import {Box, IconButton, Typography} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../image/logo.png';

export default function TopBar() {
    return (
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', width: '100%',height:'60px', backgroundColor:'#001929',  }}>
            <Box component="img" src={Logo} alt="Logo" sx={{ height: 36, ml:'15px' }} />
            <Box sx={{display:'flex', alignItems:'center', gap:'15px', paddingInline:'15px'}}>
                <Typography sx={{color:'#FFFFFF'}}>님 환영합니다!</Typography>
                {/* <IconButton>
                    <img src={MenuIcon}/>
                </IconButton> */}
                <MenuIcon sx={{color:'white', fontSize:'44px'}}></MenuIcon>
            </Box>
        </Box>
    )
}