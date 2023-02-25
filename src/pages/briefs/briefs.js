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
    console.log(user)
    useEffect(() => {
        axios.get('https://my-tb-cors.herokuapp.com/https://dev-fns.azurewebsites.net/api/getAll?databaseId=dev&containerId=projects').then(res => {
            console.log('entro')
            if(res.data !== 'No items found') {
                console.log(res.data)
                // setBriefs(res.data.filter(brief => !brief.stalled && brief.assignedTo?.name === user));
                setBriefs(res.data);
                setUnfilteredBriefs(res.data);
                console.log('si jaló')
            }else{
                console.log('no items found')
            }
            setLoading(false);
        }).catch((e)=>console.log(e))
        console.log('salio')
    }, []);

    async function getAllUsers() {
        const token = await checkToken();
        axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            console.log(res.data)
        })
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    // useEffect(() =>{
    //     async function getAllUsers() {
    //         const token = await checkToken();
           
    //         axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
    //             headers: {
    //                 'Authorization': `Bearer ${token}`
    //             }
    //         }).then(res => {
    //             console.log(res)
    //                 //console.log(res.data.value.filter(user => user && user.id === '6d8192e3-f52c-4d14-b9e7-8e8a83ae8fd2'))
    //                 let emails = res.data.value.map(user => {
    //                     if(typeof user.mail === 'string') return user.mail
    //                     else return ''
    //                 });
    //                 setUserEmails([...userEmails, ...emails]);
    //                 //res.data.value.map(user => console.log(user.mail))
    //             })
    //     }
    //     getAllUsers();
    // }, []);

    const columns = [
        { field: "id", headerName: "ID" },
        { field: "assignedTo", headerName: "Assigned to", flex:0.20 },
        {
          field: "date",
          headerName: "Due Date",
          renderCell: (params) =>
            (params.row.dueDateType && params.row.dueDateType) === "specificDay"
              ? new Date(params.row.dueDate).toLocaleDateString()
              : params.row.dueDate,
        },
    
        { field: "media", headerName: "project", flex: 0.2 },
        { field: "link", headerName: "Link", flex: 0.2 },
        { field: "details", headerName: "Description", flex: 0.75 },
        {
          field: "status",
          headerName: "Status",
          flex: 0.20,
          renderCell: (params) => {
            if(params.row.status === "Completed") {return <Typography variant='body2' sx={{color: 'green'}}>Completed</Typography>}
          }
        },
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