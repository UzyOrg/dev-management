import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../components/pageLayout/pageLayout";
import { Button, Grid, MenuItem, Paper, Table, TableBody, TableCell, TableRow, TextField, Typography, Autocomplete, Select } from "@mui/material";
import ButtonBox from "../../components/buttonBox/buttonBox";
import checkToken from "../../utils/checkToken";
import { v4 as uuidv4 } from 'uuid';
import { LocalSeeOutlined } from "@mui/icons-material";
import CreativeBriefForm from "../../forms/brief";

const RowComponent = (props) => {
    const { children } = props;
    
    return (
        <TableRow>
            <TableCell>
                {children[0]}
            </TableCell>
            <TableCell>
                {children[1]}
            </TableCell>
        </TableRow>
    )
}

function OpenRequest() {
    const options = { style: 'currency', currency: 'USD' };
    const navigate = useNavigate();
    const { id } = useParams();
    const [request, setRequest] = useState({});
    const [brief, setBrief] = useState({
        type: 'Branding'
    });
    const [userEmails, setUserEmails] = useState([]);

    useEffect(() => {
        axios.get(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/getbyid?containerId=requests&id=${id}`)
            .then(res => {
                let obj = {...res.data};
                setRequest(res.data);
            })
    }, []);

    function closeRequest() {
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=requests&id=${request.id}`, {archived: true}).then(res => {
            if(res.statusText === 'OK') {
                navigate('/requests')
            }
        })
    }

    return(
        <>
            <PageLayout page='Requests'>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{p: 3, mb: 2}}>
                            <Typography variant='h5' sx={{mb: 3}}>Request Details</Typography>
                            {Object.keys(request).length > 0 && 
                                <Table size='small'>
                                    <TableBody>
                                        <RowComponent>
                                            <>Franchise</>
                                            {request.location}
                                        </RowComponent>
                                        <RowComponent>
                                            <>Request Submitted</>
                                            {new Date(request.submitted).toLocaleDateString()}
                                        </RowComponent>
                                        <RowComponent>
                                            <>Project Type</>
                                            {request.type}
                                        </RowComponent>
                                        <RowComponent>
                                            <>Project Value</>
                                            {new Intl.NumberFormat('en-US', options).format(request.value)}
                                        </RowComponent>
                                        <RowComponent>
                                            <>Description</>
                                            <>{request.description}</>
                                        </RowComponent>
                                        <RowComponent>
                                            <>Contact</>
                                            {request.contactName}
                                        </RowComponent>
                                        <RowComponent>
                                            <>Is the customer willing to interview?</>
                                            <>{request.clientInterview ? 'Yes' : 'No'}</>
                                        </RowComponent>
                                        <RowComponent>
                                            <>Is the sub willing to interview?</>
                                            <>{request.subInterview ? 'Yes' : 'No'}</>
                                        </RowComponent>
                                    </TableBody>
                                </Table>
                            }
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{p: 3}}>
                            <CreativeBriefForm initialValues={{request: request}} cancel={closeRequest} cancelText='Archive Request' />
                        </Paper>
                    </Grid>
                </Grid>
            </PageLayout>
        </>
    )
}

export default OpenRequest;