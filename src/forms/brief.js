import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkToken from "../utils/checkToken";
import ButtonBox from "../components/buttonBox/buttonBox";
import { Box, Typography, TextField, Select, MenuItem, Autocomplete, Button, Grid } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from "@mui/x-date-pickers";

function CreativeBriefForm(props) {
    const [nextBriefId, setNextBriefId] = useState('');
    const navigate = useNavigate();
    const { initialValues, cancel, cancelText } = props;
    const [ brief, setBrief ] = useState({
        type: 'Branding',
        live: false,
        airDate: new Date(),
        dueDateType: 'quarterly',
        dueDate: 'Q1'
    });

    useEffect(() => {
        axios.get('https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/getall?containerId=briefs').then(res => {
            if(res.data === 'No items found') {
                setNextBriefId('CB-300')
            }

            else {
                // increment the creative brief ids
                setNextBriefId(`CB-${parseInt(res.data[res.data.length - 1].id.split('-')[1]) + 1}`);
            }
        });
    },[]);

    useEffect(() => {
        setBrief({
            ...brief,
            ...initialValues
        })
    }, [initialValues]);
    

    const [userEmails, setUserEmails] = useState([]);

    function handleChange(e) {
        setBrief({
            ...brief,
            [e.target.id]: e.target.value
        })
    }

    useEffect(() =>{
        async function getAllUsers() {
            const token =await checkToken();

            axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }).then(res => {
                setUserEmails(res.data.value);
                })
        }
        getAllUsers();
    }, []);

    async function createBrief() {
        const token = await checkToken();
        brief.created = new Date().getTime();
        brief.history = [{
            action: `Brief Created and assigned to ${brief.assignedTo}`,
            date: new Date().getTime(),
            user: localStorage.getItem('user')
        }];
        brief.id = nextBriefId;
        brief.milestones = [];

        if(!brief.live) {
            // remove air date if brief is not for a live video
            brief.airDate = null;
        };

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/save?containerId=briefs`, brief).then(res => {
            console.log(res)
            if(res.statusText === 'OK') {
                setBrief({})
                alert('Creative brief saved!');

                axios.post(`https://graph.microsoft.com/v1.0/me/sendMail`, {
                    "message": {
                      "subject": "Creative Brief created and assigned to you",
                      "body": {
                        "contentType": "HTML",
                        "content": `Hello, <br /><br />A creative brief has been created by ${localStorage.getItem('user')} and assigned to you, here is the link:<br /><br />
                        <a href='https://m3.evergreenbrands.com/briefs/${brief.id}'>https://m3.evergreenbrands.com/briefs/${brief.id}</a>
                        `
                      },
                      "toRecipients": [
                        {
                          "emailAddress": {
                            "address": brief.assignedTo.email
                          }
                        }
                      ],
                    }
                  },{
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-type': 'application/json'
                    }
                }).then(() => {
                    navigate(`/briefs/${brief.id}`)
                }).catch(err => {
                    alert('There was an error senin')
                })
            }
            else {

            }
        });
    };

    return (
        <>
            <Typography variant='h5'  sx={{mb: 3}}>Create new brief</Typography>

            <TextField
                value={brief.name || ''}
                size='small'
                id='name'
                onChange={handleChange}
                label='Name'
                sx={{mb: 3}}
                fullWidth
            />
            <Select
                value={brief.type}
                onChange={(e) => setBrief({
                    ...brief,
                    type: e.target.value
                })}
                fullWidth
                size='small'
                sx={{mb: 3}}
            >
                <MenuItem value='Branding'>Branding</MenuItem>
                <MenuItem value='Construction'>Construction</MenuItem>
                <MenuItem value='Dave Wescott'>Dave Wescott</MenuItem>
                <MenuItem value='Franchise'>Franchise</MenuItem>
                <MenuItem value='Series'>Series</MenuItem>
                <MenuItem value='Training'>Training</MenuItem>
                <MenuItem value='Transblue Does it Right'>Transblue Does it Right</MenuItem>
            </Select>
            <Grid container mb={3}>
                <Grid item xs={9} my='auto'>
                    <Typography>Is this a live video?</Typography>
                </Grid>
                <Grid item xs={3} my='auto'>
                    <Select 
                        value={brief.live}
                        size='small'
                        fullWidth
                        onChange={(e) => setBrief({
                            ...brief,
                            live: e.target.value
                        })}
                    >
                        <MenuItem value={false}>No</MenuItem>
                        <MenuItem value={true}>Yes</MenuItem>
                    </Select>
                </Grid>
                {brief.live && 
                    <Grid item xs={6} my='auto'>
                        <Typography sx={{mt: 3}}>What is the air date?</Typography>
                    </Grid>
                }
                {brief.live &&
                    <Grid item xs={6} my='auto'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DateTimePicker
                                label="Date&Time picker"
                                value={brief.airDate}
                                onChange={(newValue) => setBrief({
                                    ...brief,
                                    airDate: newValue
                                })}
                                renderInput={(params) => <TextField fullWidth size='small' sx={{mt: 3}} {...params} />}
                            />
                        </LocalizationProvider>
                    </Grid>
                }
            </Grid>

            <Grid container mb={3}>
                <Grid item xs={6}>
                    <Typography>What is the type of due date?</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', width: '100%'}}>
                        <Select
                            size='small'
                            value={brief.dueDateType}
                            sx={{mr: 1}}
                            onChange={(e) => setBrief({
                                ...brief,
                                dueDateType: e.target.value
                            })}
                        >
                            <MenuItem value='quarterly'>Quarterly</MenuItem>
                            <MenuItem value='specificDay'>Specific Day</MenuItem>
                        </Select>
                        {brief.dueDateType === 'quarterly' &&
                            <Select
                                size='small'
                                value={brief.dueDate}
                                onChange={(e) => setBrief({
                                    ...brief,
                                    dueDate: e.target.value
                                })}
                            >
                                <MenuItem value='Q1'>Q1</MenuItem>
                                <MenuItem value='Q2'>Q2</MenuItem>
                                <MenuItem value='Q3'>Q3</MenuItem>
                                <MenuItem value='Q4'>Q4</MenuItem>
                            </Select>
                        }
                        {brief.dueDateType === 'specificDay' &&
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Due Date"
                                    value={brief.dueDate || new Date()}
                                    onChange={(newValue) => setBrief({
                                        ...brief,
                                        dueDate: newValue
                                    })}
                                    renderInput={(params) => <TextField fullWidth size='small' {...params} />}
                                />
                            </LocalizationProvider>
                        }
                    </Box>
                </Grid>
            </Grid>
            
            <TextField
                value={brief.audience || ''}
                size='small'
                id='audience'
                onChange={handleChange}
                label='Who is the audience?'
                sx={{mb: 3}}
                fullWidth
            />
            <TextField
                value={brief.objective || ''}
                size='small'
                id='objective'
                onChange={handleChange}
                label='What is the objective?'
                sx={{mb: 3}}
                fullWidth
            />

            <TextField
                value={brief.content || ''}
                size='small'
                id='content'
                onChange={handleChange}
                label='What will you be filming?'
                sx={{mb: 3}}
                multiline
                minRows={4}
                fullWidth
            />

            {userEmails.length > 0 && 
                <Autocomplete
                    freeSolo
                    renderInput={(params) => <TextField {...params} label='Assigned To' size='small' fullWidth />}
                    options={userEmails}
                    getOptionLabel={option => option.displayName || ''}
                    className='mb-2'
                    onChange={(e, newValue) => {
                        setBrief({
                            ...brief,
                            assignedTo: {
                                name: newValue.displayName,
                                email: newValue.mail
                            }
                        })
                    }}
                    sx={{mb: 3}}
                />
            }

            <ButtonBox>
                <Button 
                    sx={{fontSize: '10px', mr: 1}}
                    variant='contained'
                    color='error'
                    onClick={cancel}
                >
                   { cancelText }
                </Button>
                <Button
                    sx={{fontSize: '10px'}}
                    variant='contained'
                    color='success'
                    onClick={createBrief}
                >
                    save
                </Button>
            </ButtonBox>
        </>
    )


}

export default CreativeBriefForm;