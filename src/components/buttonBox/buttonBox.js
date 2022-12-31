import { Box } from "@mui/system";
import React from "react";

function ButtonBox(props) {
    const { children } = props;

    return(
        <Box sx={{width: '100%', display: 'flex', justifyContent: 'flex-end'}}>
            { children }
        </Box>
    )
}

export default ButtonBox