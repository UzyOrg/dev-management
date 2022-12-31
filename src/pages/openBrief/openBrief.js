import { Add, Autorenew, BarChart, Check, History, Notes, StopCircle, TextSnippet } from "@mui/icons-material";
import { Box, Button, Grid, Modal, Paper, Select, TextField, Typography, FormControl, InputLabel, MenuItem, List, ListItem, Avatar, ListItemAvatar, ListItemText, ToggleButtonGroup, ToggleButton, Autocomplete, Tabs, Tab } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../components/pageLayout/pageLayout";
import { DataGridPro } from "@mui/x-data-grid-pro";
import style from "../../styles/modal";
import ButtonBox from "../../components/buttonBox/buttonBox";
import { v4 as uuidv4 } from 'uuid';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Gantt from "./gantt";
import ListView from "./list";
import checkToken from "../../utils/checkToken";
import FormDetails from "./formDetails";
import Review from "./review";

function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
}

function allyProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
}

function OpenBrief() {
    const navigate = useNavigate();
    const avatar = localStorage.getItem('avatar');
    const { id } = useParams();
    const [brief, setBrief] = useState({});
    const [milestones, setMilestones] = useState([]);
    const [view, setView] = useState('gantt');
    const [milestoneOpen, setMilestoneOpen] = useState(false);
    const [newMilestone, setNewMilestone] = useState({
        startDate: new Date(),
        endDate: new Date(),
        percentComplete: 0
    });
    const [displayNote, setDisplayNote] = useState(false);
    const [note, setNote] = useState({});
    const [reassignOpen, setReassignOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [assignedTo, setAssignedTo] = useState('');
    const [completeOpen, setCompleteOpen] = useState(false);
    const [value, setValue] = useState(0);
    const handleTabChange = (event, newValue) => {
        setValue(newValue);
    }

    const resources = [
        'DEVELOPMENT',
        'PRE-PRODUCTION',
        'PRINCIPAL PHOTOGRAPHY',
        'POST PRODUCTION',
        'COMPLETED'
    ];

    const historyCols = [
        {field: 'action', headerName: 'Event', flex: 1},
        {field: 'date', headerName: 'Date', flex: .5, valueGetter: (params) => new Date(params.row.date).toLocaleDateString()},
        {field: 'user', headerName: 'User', flex: .5}
    ];

    useEffect(() => {
        axios.get(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/getbyid?containerId=briefs&id=${id}`).then(res => {
            setBrief(res.data);
            if(res.data.milestones) {
                setMilestones(res.data.milestones)
            }
        })
    }, [])

    
    async function getAllUsers() {
        const token = await checkToken();
        axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            setUsers(res.data.value);
        })
    };

    useEffect(() => {
        getAllUsers();
    }, []);

    function saveMilestone() {
        newMilestone.created = new Date().getTime();
        newMilestone.id = uuidv4();

        let arr = brief.milestones || [];

        let sorted = [newMilestone, ...arr];
        sorted = sorted.sort((a, b) => {
            let adate = new Date(a.startDate).getTime();
            let bdate = new Date(b.startDate).getTime();

            if(adate < bdate) return -1
            if(adate > bdate) return 1
            return 0
        })

        let history = [{
            action: `Created ${newMilestone.name} Milestone`,
            date: new Date().getTime(),
            user: localStorage.getItem('user'),
            id: uuidv4()
        }, ...brief.history];

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            history: history,
            milestones: sorted
        }).then(res => {
            setBrief({
                ...brief,
                history: [...history],
                milestones: sorted
            });

            setMilestones(sorted);
            setMilestoneOpen(false);
        })
    };

    function handleChange(e) {
        setNewMilestone({
            ...newMilestone,
            [e.target.id]: e.target.value
        })
    };

    function handleDateChange(newValue, period) {
        period === 'start'
            ? setNewMilestone({
                ...newMilestone,
                startDate: newValue
            })
            : setNewMilestone({
                ...newMilestone,
                endDate: newValue
            })
    };

    function saveNote() {
        const user = localStorage.getItem('user');
        note.date = new Date().getTime();
        note.user = user;
        note.id = uuidv4();
        note.avatar = avatar;

        let arr = brief.notes || [];

        let history = [{
            action: `Added a note`,
            date: new Date().getTime(),
            user: user,
            id: uuidv4()
        }, ...brief.history];

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            notes: [note, ...arr],
            history: [...history]
        }).then(async res => {
            const token = await checkToken();
            axios.post(`https://graph.microsoft.com/v1.0/me/sendMail`, {
                "message": {
                  "subject": "A production note has been added",
                  "body": {
                    "contentType": "HTML",
                    "content": `Hello, <br /><br />A production note has been added by ${user}, here are the details:<br /><br />
                    Brief: ${brief.id}<br />
                    Note: ${note.note}<br /><br />

                    Check it out here:<br />
                    <a href='https://m3.evergreenbrands.com/briefs/${id}'>https://m3.evergreenbrands.com/briefs/${id}</a>

                    Best wishes,<br />
                    Your friendly Evergreen Brands Dev team :D
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
            }).then(res => {
                setBrief({
                    ...brief,
                    notes: [note, ...arr],
                    history: [...history]
                })
                setNote({});
                setDisplayNote(false);
            });
        });
    };

    async function reassign() {
        let token = await checkToken();

        let history = [{
            action: `Brief reassigned to ${assignedTo.name}`,
            date: new Date().getTime(),
            user: localStorage.getItem('user'),
            id: uuidv4()
        }, ...brief.history];

        setBrief({
            ...brief,
            assignedTo: assignedTo,
            history: history
        });

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            assignedTo: assignedTo,
            history: history
        }).then(res => {
            axios.post(`https://graph.microsoft.com/v1.0/me/sendMail`, {
                "message": {
                  "subject": "Creative Brief assigned to you",
                  "body": {
                    "contentType": "HTML",
                    "content": `Hello, <br /><br />A creative brief has been assigned to you, here is the link:<br /><br />
                    <a href='https://m3.evergreenbrands.com/briefs/${id}'>https://m3.evergreenbrands.com/briefs/${id}</a>
                    `
                  },
                  "toRecipients": [
                    {
                      "emailAddress": {
                        "address": assignedTo.email
                      }
                    }
                  ],
                }
              },{
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-type': 'application/json'
                }
            }).then(res => {
                console.log(res)
                setReassignOpen(false);
            });
        });
    };

    function markComplete() {
        let history = [{
            action: `Marked Complete`,
            date: new Date().getTime(),
            user: localStorage.getItem('user'),
            id: uuidv4()
        }, ...brief.history];

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            completed: new Date(),
            link: brief.link,
            status: 'Complete',
            history: history
        }).then(res => {
            navigate('/briefs')
        })
    };

    function editPhase(e) {
        if(e.target.value === 'POST PRODUCTION' || e.target.value === 'COMPLETED') {
            setNewMilestone({
                ...newMilestone,
                resource: e.target.value
            })
        }

        else {
            setNewMilestone({
                ...newMilestone,
                resource: e.target.value,
                subResource: null
            })
        };
    };

    function markStalled() {
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            stalled: true
        }).then(res => {
            navigate('/briefs');
        })
    }

    function markActive() {
        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${id}`, {
            stalled: false
        }).then(res => {
            setBrief({
                ...brief,
                stalled: false
            })
        })
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Modal
                open={milestoneOpen}
                onClose={() => setMilestoneOpen(false)}
            >
                <Box sx={{...style, maxWidth: '600px', p: 3}}>
                    <Typography variant='h6' sx={{mb: 2}}>Add a Milestone</Typography>

                    <TextField
                        value={newMilestone.name || ''}
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
                            onChange={(e, newValue) => setNewMilestone({
                                ...newMilestone,
                                assignedTo: newValue
                            })}
                            value={newMilestone.assignedTo}
                            multiple
                            sx={{mb: 2}}
                        />
                    }

                    <FormControl fullWidth size='small' sx={{mb: 2}}>
                        <InputLabel>Project Phase</InputLabel>
                        <Select
                            value={newMilestone.resource || ''}
                            onChange={editPhase}
                        >
                            {resources.map(resource => (
                                <MenuItem key={resource} value={resource}>{resource}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {newMilestone.resource === 'POST PRODUCTION' &&
                        <FormControl fullWidth size='small' sx={{mb: 3}}>
                            <InputLabel>Sub Phase</InputLabel>
                            <Select
                                value={newMilestone.subResource || ''}
                                onChange={(e) => setNewMilestone({
                                    ...newMilestone,
                                    subResource: e.target.value
                                })}
                            >
                                <MenuItem key='AWAITING EDITING' value='AWAITING EDITING'>AWAITING EDITING</MenuItem>
                                <MenuItem key='ACTIVE EDITING' value='ACTIVE EDITING'>ACTIVE EDITING</MenuItem>
                                <MenuItem key='REVIEW' value='REVIEW'>REVIEW</MenuItem>  
                            </Select>
                        </FormControl>
                    }

                    {newMilestone.resource === 'COMPLETED' &&
                        <FormControl fullWidth size='small' sx={{mb: 3}}>
                            <InputLabel>Sub Phase</InputLabel>
                            <Select
                                value={newMilestone.subResource || ''}
                                onChange={(e) => setNewMilestone({
                                    ...newMilestone,
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
                                value={newMilestone.startDate}
                                onChange={(newValue) => handleDateChange(newValue, 'start')}
                                renderInput={(params) => <TextField {...params} size='small'  fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DesktopDatePicker
                                label="Select End Date"
                                inputFormat="MM/dd/yyyy"
                                value={newMilestone.endDate}
                                onChange={(newValue) => handleDateChange(newValue, 'end')}
                                renderInput={(params) => <TextField {...params} size='small'  fullWidth />}
                            />
                        </Grid>
                    </Grid>

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
                            onClick={saveMilestone}
                            color='success'
                        >
                            save milestone
                        </Button>
                    </ButtonBox>
                </Box>
            </Modal>
            <Modal
                open={reassignOpen}
                onClose={() => setReassignOpen(true)}
            >
                <Box sx={{...style, maxWidth: '400px', p: 3}}>
                    <Typography variant="h5" sx={{mb: 3}}>Reassign {brief.name}</Typography>
                    {users.length > 0 && 
                        <Autocomplete
                            freeSolo
                            renderInput={(params) => <TextField {...params} label='Assigned To' size='small' fullWidth />}
                            getOptionLabel={option => option.displayName || ''}
                            options={users}
                            className='mb-2'
                            onChange={(e, newValue) => setAssignedTo({
                                name: newValue.displayName,
                                email: newValue.mail
                            })}
                            sx={{mb: 3}}
                        />
                    }

                    <ButtonBox>
                        <Button
                            sx={{fontSize: '10px', mr: 1}}
                            color='error'
                            onClick={() => setReassignOpen(false)}
                            variant='contained'
                        >
                            cancel
                        </Button>
                        <Button
                            sx={{fontSize: '10px'}}
                            color='success'
                            onClick={reassign}
                            variant='contained'
                        >
                            save
                        </Button>
                    </ButtonBox>
                </Box>
            </Modal>
            <Modal
                open={completeOpen}
                onClose={() => setCompleteOpen(false)}
            >
                <Box sx={{...style, maxWidth: '400px', p: 3}}>
                    <Typography variant='h5'>Mark Project Complete</Typography>
                    <TextField
                        size='small'
                        fullWidth
                        value={brief.link || ''}
                        label='Video Link'
                        sx={{my:2}}
                        id='link'
                        onChange={(e) => setBrief({
                            ...brief,
                            link: e.target.value
                        })}
                    />

                    <ButtonBox>
                        <Button
                            sx={{fontSize: '10px', mr: 1}}
                            color='error'
                            onClick={() => setCompleteOpen(false)}
                            variant='contained'
                        >
                            cancel
                        </Button>
                        <Button
                            sx={{fontSize: '10px'}}
                            color='success'
                            onClick={markComplete}
                            variant='contained'
                        >
                            complete
                        </Button>
                    </ButtonBox>
                </Box>
            </Modal>
            <PageLayout
                page='Creative Briefs'
            >
                {Object.keys(brief).length > 0 &&
                    <>
                        <Paper sx={{px: 3, py: 1, mb: 1}}>
                            <Grid container>
                                <Grid item xs={7}>
                                    <Typography variant='h6'>{brief.name}</Typography>
                                </Grid>
                                <Grid item xs={5}>
                                   <Box sx={{display: 'flex', width: '100%', justifyContent: 'flex-end'}}>
                                        {!brief.stalled 
                                            ?   <Button
                                                    sx={{fontSize: '12px', mr: 1}}
                                                    startIcon={<StopCircle />}
                                                    onClick={markStalled}
                                                    color='error'
                                                >
                                                    mark stalled
                                                </Button>
                                            :   <Button
                                                    sx={{fontSize: '12px', mr: 1}}
                                                    startIcon={<TextSnippet />}
                                                    onClick={markActive}
                                                    color='success'
                                                >
                                                    mark active
                                                </Button>
                                        }

                                        <Button
                                            sx={{fontSize: '12px'}}
                                            startIcon={<Autorenew />}
                                            onClick={() => setReassignOpen(true)}
                                        >
                                            reassign
                                        </Button>
                                        <Button
                                            sx={{fontSize: '12px'}}
                                            startIcon={<Check />}
                                            onClick={() => setCompleteOpen(true)}
                                            color='success'
                                        >
                                            Complete
                                        </Button>
                                   </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={7}>
                                <Paper sx={{p: 2, mb: 1}}>
                                    <Grid container>
                                        <Grid item xs={6}>
                                            <Box sx={{mb: 2}}><BarChart sx={{verticalAlign: 'middle', mr: 1}} /> Milestones</Box>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <ButtonBox>
                                                <ToggleButtonGroup
                                                    value={view}
                                                    onChange={(e) => setView(e.target.value)}
                                                    size='small'
                                                    sx={{mb: 3}}
                                                >
                                                    <ToggleButton value='gantt'>GANTT</ToggleButton>
                                                    <ToggleButton value='list'>LIST</ToggleButton>
                                                </ToggleButtonGroup>
                                            </ButtonBox>
                                        </Grid>
                                    </Grid>

                                    {milestones.length > 0 && view === 'gantt' &&
                                        <Gantt milestones={milestones} setMilestones={setMilestones} />
                                    }
                                    {milestones.length > 0 && view === 'list' &&
                                        <ListView milestones={milestones} setMilestones={setMilestones} brief={brief} />
                                    }

                                    <Button
                                        sx={{mt: 3, fontSize: '12px'}}
                                        startIcon={<Add />}
                                        onClick={() => setMilestoneOpen(true)}
                                    >
                                        milestone
                                    </Button>
                                </Paper>
                                <Review brief={brief} />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Tabs value={value} onChange={handleTabChange}>
                                    <Tab label='Details' {...allyProps(0)} />
                                    <Tab label='Production Notes' {...allyProps(1)} />
                                    <Tab label='History' {...allyProps(2)} />
                                </Tabs>

                                <Paper sx={{p: 0, maxHeight: 'calc(100vh - 200px)', overflowY: 'auto'}}>
                                    <TabPanel value={value} index={0}>
                                        <FormDetails brief={brief} />
                                    </TabPanel>
                                    <TabPanel value={value} index={1}>
                                        {displayNote &&
                                            <>
                                                <TextField
                                                    value={note.note}
                                                    onChange={(e) => setNote({
                                                        ...note,
                                                        note: e.target.value
                                                    })}
                                                    multiline
                                                    fullWidth
                                                    minRows={4}
                                                    sx={{mb: 3}}
                                                />

                                                <ButtonBox>
                                                    <Button
                                                        variant="contained"
                                                        sx={{fontSize: '10px', mr: 1}}
                                                        onClick={() => setDisplayNote(false)}
                                                        color='error'
                                                    >
                                                        cancel
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        sx={{fontSize: '10px'}}
                                                        onClick={saveNote}
                                                        color='success'
                                                    >
                                                        save note
                                                    </Button>
                                                </ButtonBox>
                                            </>
                                        }

                                        {brief.notes && brief.notes.length > 0 &&
                                            <List sx={{mb: 3}}>
                                                {brief.notes.map(note => {
                                                    return (
                                                        <ListItem alignItems='flex-start' key={note.id} sx={{px: 0}}>
                                                            <ListItemAvatar>
                                                                <Avatar alt={note.user} src={note.avatar} />
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={new Date(note.date).toLocaleDateString()}
                                                                secondary={
                                                                    <React.Fragment>
                                                                        <Typography
                                                                            sx={{ display: 'inline' }}
                                                                            component="span"
                                                                            variant="body2"
                                                                            color="text.primary"
                                                                        >
                                                                            {note.user}
                                                                        </Typography>
                                                                        {` — ${note.note}`}
                                                                    </React.Fragment>
                                                                }
                                                            />
                                                        </ListItem>
                                                    )
                                                })}
                                            </List>
                                        }

                                        {!displayNote && 
                                            <Button
                                                startIcon={<Add />}
                                                onClick={() => setDisplayNote(true)}
                                                sx={{fontSize: '12px'}}
                                            >
                                                note
                                            </Button>
                                        }
                                    </TabPanel>
                                    <TabPanel value={value} index={2}>
                                        <DataGridPro
                                            disableSelectionOnClick
                                            rows={brief.history}
                                            columns={historyCols}
                                            pageSize={5}
                                            pagination
                                            autoHeight
                                            autoPageSize
                                            rowsPerPageOptions={[5]}
                                            density='compact'
                                            getRowId={(row) => row.date}
                                        />
                                    </TabPanel>
                                </Paper>
{/* 
                                <Paper sx={{p: 2, mb: 1}} >
                                    <Box sx={{mb: 1}}><History sx={{verticalAlign: 'middle', mr: 1}} /> History</Box>

                                    
                                </Paper>
                                <Paper sx={{p: 2}}>
                                    <Box sx={{mb: 1}}><Notes sx={{verticalAlign: 'middle', mr: 1}} /> Progress Notes</Box>


                                </Paper> */}
                            </Grid>
                        </Grid>
                    </>
                }
            </PageLayout>
        </LocalizationProvider>
    )
}

export default OpenBrief;