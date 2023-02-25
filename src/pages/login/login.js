import { Box, Button, Typography } from "@mui/material";
import React from "react";
import bg from '../../images/bg.jpg';
import './style.css';
import logo from '../../images/logo.png';
import LoginLogic from "./loginLogic";

function Login() {

    const { msalLogin } = LoginLogic();

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 500,
        width: '100%',
        textAlign: 'center'
    }

    return(
        <>
            <img className="bgImg" src={bg}></img>
            <Box sx={style}>
                <img src={logo} style={{width: '200px'}} />
                <Typography variant='h2' sx={{color: 'white', my: 3, fontWeight: 400}}>
                    DEVELOPMENT MANAGEMENT
                </Typography>
                <Button
                    sx={{fontSize: '18px', color: 'white', bgcolor: 'rgba(24, 24, 24, 0.65)', backdropFilter: 'blur(2px)', px: 3, letterSpacing: '2px'}}
                    onClick={msalLogin}
                >
                    login
                </Button>
            </Box>
        </>

    )
}

export default Login;