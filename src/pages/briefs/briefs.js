import { Box, Button, Grid, Modal, Paper, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonBox from "../../components/buttonBox/buttonBox";
import PageLayout from "../../components/pageLayout/pageLayout";
import { DataGridPro } from "@mui/x-data-grid-pro";
import style from "../../styles/modal";
import checkToken from "../../utils/checkToken";

import CreativeBriefForm from "../../forms/brief";
import { TextSnippet, Visibility } from "@mui/icons-material";

function Briefs() {
    const navigate = useNavigate()
    const [briefs, setBriefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [userEmails, setUserEmails] = useState([]);
    const [unfilteredBriefs, setUnfilteredBriefs] = useState([]);
    const [view, setView] = useState('active');
    const [userView, setUserView] = useState('mine');
    const user = localStorage.getItem('user');

    useEffect(() => {
        axios.get('https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/getall?containerId=briefs').then(res => {
            if(res.data !== 'No items found') {
                setBriefs(res.data.filter(brief => !brief.stalled && brief.assignedTo.name === user));
                setUnfilteredBriefs(res.data);
            }
            setLoading(false);
        })
    }, []);

    useEffect(() =>{
        async function getAllUsers() {
            const token =await checkToken();

            axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                console.log(res)
                    //console.log(res.data.value.filter(user => user && user.id === '6d8192e3-f52c-4d14-b9e7-8e8a83ae8fd2'))
                    let emails = res.data.value.map(user => {
                        if(typeof user.mail === 'string') return user.mail
                        else return ''
                    });
                    setUserEmails([...userEmails, ...emails]);
                    //res.data.value.map(user => console.log(user.mail))
                })
        }
        getAllUsers();
    }, []);

    const columns = [
        {field: 'id', headerName: 'ID'},
        {field: 'dueDate', headerName: 'Due Date', renderCell: (params) => (
            (params.row.dueDateType && params.row.dueDateType) === 'specificDay'
                ?   new Date(params.row.dueDate).toLocaleDateString()
                :   params.row.dueDate
        )},
        {field: 'type', headerName: 'Video Type', flex: .5},
        {field: 'name', headerName: 'Brief Name', flex: .75},
        {field: 'location', headerName: 'Location', flex: .5, valueGetter: (params) => params.row.request ? params.row.request.location : params.row.location},
        {field: 'submitted', headerName: 'Requested', valueGetter: (params) => params.row.submitted ? new Date(params.row.submitted).toLocaleDateString() : 'N/A', flex: .5},
        {field: 'created', headerName: 'Brief Created', valueGetter: (params) => new Date(params.row.created).toLocaleDateString(), flex: .5},
        {field: 'assignedTo', headerName: 'Assigned To', flex: .5, valueGetter: (params) => params.row.assignedTo.name},
        {
            field: 'status', 
            headerName: 'Status', 
            renderCell: (params) => {
                
                if(params.row.completed) {
                    return <Typography variant='body2' sx={{color: 'green'}}>Complete</Typography>
                }

                else if(params.row.milestones.length > 0) {
                    let incomplete = params.row.milestones.filter(milestone => milestone.percentComplete !== 100);
                    if(incomplete.length === 0) {
                        let index = params.row.milestones.length - 1;
                        return <Typography variant='body2'>{params.row.milestones[index].resource}</Typography>
                    }
                    return <Typography variant='body2'>{incomplete[0].resource}</Typography>
                }

                return <Typography variant='body2'>New Brief</Typography>
            }
        }
    ];

    function redirect(params) {
        navigate(`/briefs/${params.row.id}`)
    }

    function viewStalled() {
        setView('stalled');
        setBriefs(unfilteredBriefs.filter(brief => brief.stalled));
    };

    function viewActive() {
        setView('active')
        setBriefs(unfilteredBriefs.filter(brief => !brief.stalled))
    };

    function toggleUserView() {
        if(userView === 'mine') {
            setBriefs(unfilteredBriefs.filter(brief => !brief.stalled));
            setUserView('all');
        }

        else {
            setBriefs(unfilteredBriefs.filter(brief => !brief.stalled && brief.assignedTo.name === user));
            setUserView('mine')
        }
    };

    return(
        <>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
            >
                <Box sx={{...style, maxWidth: '600px', p: 3, maxHeight: '90vh', overflowY: 'auto'}}>
                    <CreativeBriefForm initialValues={{type: 'Branding', location: 'Monroe'}} cancel={() => setOpen(false)} cancelText='Cancel' />
                </Box>
            </Modal>
            <PageLayout page='Creative Briefs'>
                <Grid container>
                    <Grid item xs={6}>
                        <Button
                            onClick={toggleUserView}
                            sx={{fontSize: '12px'}}
                        >
                            {userView === 'mine'
                                ? 'view all briefs'
                                : 'view my briefs'
                            }
                        </Button>
                    </Grid>
                    <Grid item xs={6}>

                        <ButtonBox>
                            {view === 'active' &&
                                <Button
                                    sx={{fontSize: '12px', mr: 1}}
                                    color='error'
                                    startIcon={<Visibility />}
                                    onClick={viewStalled}
                                >
                                    view stalled
                                </Button>
                            }
                            {view === 'stalled' &&
                                <Button
                                    sx={{fontSize: '12px', mr: 1}}
                                    color='success'
                                    startIcon={<TextSnippet />}
                                    onClick={viewActive}
                                >
                                    view active
                                </Button>
                            }
                            <Button
                                sx={{fontSize: '12px', bgcolor: '#ed6a22'}}
                                variant='contained'
                                onClick={() => setOpen(true)}
                            >
                                create
                            </Button>
                        </ButtonBox>
                    </Grid>
                </Grid>

                <Paper sx={{p: 3, mt: 2}}>
                    <DataGridPro
                        loading={loading}
                        disableSelectionOnClick
                        onRowClick={(params) => redirect(params)}
                        rows={briefs}
                        columns={columns}
                        pageSize={50}
                        pagination
                        autoHeight
                        autoPageSize
                        rowsPerPageOptions={[50]}
                        //checkboxSelection
                        density='compact'
                    />

                </Paper>
            </PageLayout>
        </>
    )
}

export default Briefs;