import { Paper, Typography } from "@mui/material";
import { DataGridPro } from "@mui/x-data-grid-pro";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/pageLayout/pageLayout";

function Requests() {
    const options = { style: 'currency', currency: 'USD' };
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/getall?containerId=requests').then(res => {
            console.log(res.data)
            if(res.data !== 'No items found') {
                setRequests(res.data);
            }
            setLoading(false)
        })
    }, []);

    const columns = [
        {field: 'type', headerName: 'Project Type', flex: 1 },
        {
            field: 'value', 
            headerName: 'Project Value', 
            flex: .5,
            valueGetter: (params) => new Intl.NumberFormat('en-US', options).format(params.row.value)
        },
        {field: 'location', headerName: 'Franchise Location', flex: .5},
        {
            field: 'submitted',
             headerName: 'Submitted', 
             flex: .25,
             valueGetter: (params) => new Date(params.row.submitted).toLocaleDateString()
        },
        {field: 'submittedBy', headerName: 'Submitted By', flex: .5},
    ]

    function redirect(params) {
        navigate(`/requests/${params.row.id}`)
    }

    return(
        <>
            <PageLayout
                page='Requests'
            >
                <Paper sx={{px: 3, py: 1}}>
                    <Typography variant='h6'>MEDIA REQUESTS</Typography>
                </Paper>
                <Paper sx={{p: 3, mt: 2}}>
                    <div style={{height: 'calc(100vh - 200px)', width: '100%', marginTop: '20px'}}>
                        <DataGridPro
                            loading={loading}
                            disableSelectionOnClick
                            onRowClick={(params) => redirect(params)}
                            rows={requests}
                            columns={columns}
                            pageSize={50}
                            pagination
                            autoHeight
                            autoPageSize
                            rowsPerPageOptions={[50]}
                            //checkboxSelection
                            density='compact'
                        />
                    </div>
                </Paper>
            </PageLayout>
        </>
    )
}

export default Requests