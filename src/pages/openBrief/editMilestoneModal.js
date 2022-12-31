import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Autocomplete, Box, Button, Grid, Modal, Paper, Select, TextField, Typography, FormControl, InputLabel, MenuItem } from "@mui/material";
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import style from "../../styles/modal";
import ButtonBox from "../../components/buttonBox/buttonBox";
import { useParams } from "react-router-dom";
import checkToken from "../../utils/checkToken";
import Briefs from "../briefs/briefs";

function EditMilestoneModal(props) {
    const { milestoneOpen, setMilestoneOpen, milestones, setMilestones } = props;
    const [milestone, setMilestone] = useState({
        assignedTo: []
    });
    const { id } = useParams();
    const [users, setUsers] = useState([])

    useEffect(() => {
        setMilestone({
            ...props.milestone,
            assignedTo: props.milestone.assignedTo || []
        })
    }, [props.milestone])

    useEffect(() =>{
        async function getAllUsers() {
            const token =await checkToken();

            axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                console.log(res.data.value)
                setUsers(res.data.value);
                //res.data.value.map(user => console.log(user.mail))
                })
        }
        getAllUsers();
    }, [])

    const resources = [
        'DEVELOPMENT',
        'PRE-PRODUCTION',
        'PRINCIPAL PHOTOGRAPHY',
        'POST PRODUCTION',
        'COMPLETED'
    ];

    function handleDateChange(newValue, period) {
        period === 'start'
            ? setMilestone({
                ...milestone,
                startDate: newValue
            })
            : setMilestone({
                ...milestone,
                endDate: newValue
            })
    }

    function handleChange(e) {
        setMilestone({
            ...milestone,
            [e.target.id]: e.target.value
        })
    }

    function updateMilestone() {
        let arr = milestones.map(item => {
            if(milestone.id === item.id) {
                return milestone
            }
            return item
        });
        
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            milestones: arr
        }).then(res => {
            setMilestones(arr);
            setMilestoneOpen(false);
        });
    };

    function editPhase(e) {
        if(e.target.value === 'POST PRODUCTION' || e.target.value === 'COMPLETED') {
            setMilestone({
                ...milestone,
                resource: e.target.value
            })
        }

        else {
            setMilestone({
                ...milestone,
                resource: e.target.value,
                subResource: null
            })
        };
    };

    return(
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Modal
                open={milestoneOpen}
                onClose={() => setMilestoneOpen(false)}
            >
                <Box sx={{...style, maxWidth: '600px', p: 3}}>
                    <Typography variant='h6' sx={{mb: 2}}>Add a Milestone</Typography>

                    <TextField
                        value={milestone.name}
                        onChange={handleChange}
                        fullWidth
                        size='small'
                        label='Name'
                        sx={{mb: 2}}
                        id='name'
                    />

                    
                    {users.length > 0 && 
                        <Autocomplete
                            freeSolo
                            renderInput={(params) => <TextField {...params} label='Assigned To' size='small' fullWidth />}
                            getOptionLabel={option => option.displayName || ''}
                            options={users}
                            className='mb-2'
                            onChange={(e, newValue) => setMilestone({
                                ...milestone,
                                assignedTo: newValue
                            })}
                            value={milestone.assignedTo}
                            multiple
                            sx={{mb: 2}}
                        />
                    }

                    <FormControl fullWidth size='small' sx={{mb: 2}}>
                        <InputLabel>Project Phase</InputLabel>
                        <Select
                            value={milestone.resource || ''}
                            onChange={editPhase}
                        >
                            {resources.map(resource => (
                                <MenuItem key={resource} value={resource}>{resource}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {milestone.resource === 'POST PRODUCTION' &&
                        <FormControl fullWidth size='small' sx={{mb: 3}}>
                            <InputLabel>Sub Phase</InputLabel>
                            <Select
                                value={milestone.subResource || ''}
                                onChange={(e) => setMilestone({
                                    ...milestone,
                                    subResource: e.target.value
                                })}
                            >
                                <MenuItem key='AWAITING EDITING' value='AWAITING EDITING'>AWAITING EDITING</MenuItem>
                                <MenuItem key='ACTIVE EDITING' value='ACTIVE EDITING'>ACTIVE EDITING</MenuItem>
                                <MenuItem key='REVIEW' value='REVIEW'>REVIEW</MenuItem>  
                            </Select>
                        </FormControl>
                    }

                    {milestone.resource === 'COMPLETED' &&
                        <FormControl fullWidth size='small' sx={{mb: 3}}>
                            <InputLabel>Sub Phase</InputLabel>
                            <Select
                                value={milestone.subResource || ''}
                                onChange={(e) => setMilestone({
                                    ...milestone,
                                    subResource: e.target.value
                                })}
                            >
                                <MenuItem key='AWAITING PUBLISHING' value='AWAITING PUBLISHING'>AWAITING PUBLISHING</MenuItem>
                                <MenuItem key='PUBLISHED' value='PUBLISHED'>PUBLISHED</MenuItem>
                            </Select>
                        </FormControl>
                    }

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <DesktopDatePicker
                                label="Select Start Date"
                                inputFormat="MM/dd/yyyy"
                                value={milestone.startDate}
                                onChange={(newValue) => handleDateChange(newValue, 'start')}
                                renderInput={(params) => <TextField {...params} size='small'  fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DesktopDatePicker
                                label="Select End Date"
                                inputFormat="MM/dd/yyyy"
                                value={milestone.endDate}
                                onChange={(newValue) => handleDateChange(newValue, 'end')}
                                renderInput={(params) => <TextField {...params} size='small'  fullWidth />}
                            />
                        </Grid>
                    </Grid>

                    <Typography variant='body2' sx={{fontWeight: 'bold', mt: 3}}>Percent Complete</Typography>
                    <Select
                        value={milestone.percentComplete || 0}
                        size='small'
                        fullWidth
                        onChange={(e) => {
                            setMilestone({
                                ...milestone,
                                percentComplete: e.target.value
                            })
                        }}
                        sx={{mt: 1}}
                    >
                        <MenuItem value={0}>0</MenuItem>
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={20}>20</MenuItem>
                        <MenuItem value={30}>30</MenuItem>
                        <MenuItem value={40}>40</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                        <MenuItem value={60}>60</MenuItem>
                        <MenuItem value={70}>70</MenuItem>
                        <MenuItem value={80}>80</MenuItem>
                        <MenuItem value={90}>90</MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                    </Select>

                    <ButtonBox>
                        <Button
                            variant="contained"
                            sx={{fontSize: '10px', mr: 1, mt: 3}}
                            onClick={() => setMilestoneOpen(false)}
                            color='error'
                        >
                            cancel
                        </Button>
                        <Button
                            variant="contained"
                            sx={{fontSize: '10px', mt: 3}}
                            onClick={updateMilestone}
                            color='success'
                        >
                            save milestone
                        </Button>
                    </ButtonBox>
                </Box>
            </Modal>
        </LocalizationProvider>
    )
}

export default EditMilestoneModal;