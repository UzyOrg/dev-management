import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import PageLayout from "../../components/pageLayout/pageLayout";
import { Autocomplete, Box, Button, Divider, Drawer, Grid, MenuItem, Select, TextField, Typography } from "@mui/material";
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import listViewPlugin from '@fullcalendar/list';
import { ArrowRightAlt, Clear } from "@mui/icons-material";
import ButtonBox from "../../components/buttonBox/buttonBox";
import { useNavigate } from "react-router-dom";
import { createRef } from "react";

function Calendar() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [activeEvent, setActiveEvent] = useState({});
    const [briefs, setBriefs] = useState([]);
    const [unfilteredEvents, setUnfilteredEvents] = useState([]);
    const [filterValues, setFilterValues] = useState([]);
    const [calendarView, setCalendarView] = useState('dayGridMonth');

    const calendarRef = createRef();

    function selectEvent(eventInfo) {
        setActiveEvent(briefs.filter(event => event.id === eventInfo.event._def.extendedProps.id)[0]);
    }

    const colors = {
        'DESIGN': '#ff3366', 
        'DEVELOPMENT': '#ff3366', 
        'PRE-PRODUCTION': '#3399ff', 
        'TESTING': '#3399ff', 
        'DEPLOYMENT': '#00cc00', 
        'PRINCIPAL PHOTOGRAPHY': '#00cc00', 
        'AWAITING EDITING': '#33000', 
        'ACTIVE EDITING': '#ff6600', 
        'REVIEW': '#9966ff', 
        'AWAITING EDITING': '#0066cc', 
        'PUBLISHED': '#990099',
        '': '#006600',
        '': '#ffcc00'
    };

    useEffect(() => {
        axios.get('https://my-tb-cors.herokuapp.com/https://dev-fns.azurewebsites.net/api/getall?databaseId=dev&containerId=projects').then(res => {
            console.log(res.data)    
        setBriefs(res.data);
            if(res.data !== 'No items found') {
                let liveEvents = res.data.filter(brief => brief.live).map(brief => {
                    return {
                        title: `${brief.name} - Air Date`,
                        id: brief.id,
                        status: '',
                        backgroundColor: '#38e038',
                        date: new Date(brief.airDate).toISOString().split('T')[0],
                        extendedProps: {
                            id: brief.id,
                            type: brief.type
                        },
                        backgroundColor: '#ed6a22',
                        borderColor: '#ed6a22'
                    }
                })

                let completed = res.data.filter(brief => brief.completed && !brief.live).map(brief => {
                    return {
                        title: `${brief.name} - Completed`,
                        id: brief.id,
                        status: 'Complete',
                        backgroundColor: '#38e038',
                        date: new Date(brief.completed).toISOString().split('T')[0],
                        extendedProps: {
                            id: brief.id,
                            type: brief.type
                        },
                        backgroundColor: 'green'
                    }
                });
                let incomplete = res.data.filter(brief => !brief.completed && brief?.milestones?.length > 0 && !brief.live).map((brief, index) => {
                    let arr = brief.milestones.filter(milestone => milestone.percentComplete !== 100);
                    let status;
                    let subStatus;

                    if(arr.length === 0) {
                        let index = brief?.milestones.length - 1;
                        status = brief?.milestones[index].resource;
                        subStatus = brief?.milestones[index].subResource;
                    }

                    else {
                        status = brief?.milestones.filter(milestone => milestone.percentComplete !== '100')[0].resource;
                        subStatus = brief?.milestones.filter(milestone => milestone.percentComplete !== 100)[0].subResource;
                    }

                    return {
                        title: `${brief.name} - ${subStatus || status}`,
                        id: brief.id,
                        start: brief.milestones[0].startDate,
                        end: brief.milestones[brief.milestones.length - 1].endDate,
                        allDay: true,
                        extendedProps: {
                            id: brief.id,
                            type: brief.type
                        },
                        backgroundColor: colors[status],
                        borderColor: colors[status]
                    }
                });

                setEvents([...completed, ...incomplete, ...liveEvents]);
                setUnfilteredEvents([...completed, ...incomplete, ...liveEvents]);
            };
        });
    }, []);

    function filterEvents(e, newValue) {
        setFilterValues(newValue);
        if(newValue.length === 0) {
            setEvents(unfilteredEvents);
        }
        else {
            setEvents(unfilteredEvents.filter(event => newValue.indexOf(event.extendedProps.type) > -1));
        }
    }

    const options = [
        'Branding',
        'Construction',
        'Dave Wescott',
        'Franchise',
        'Series',
        'Training',
        'Transblue Does it Right'
    ];

    const changeView = (e) => {
        calendarRef.current
            .getApi()
            .changeView(e.target.value)
        setCalendarView(e.target.value);
    }
    
    return(
        <>
            <PageLayout
                page='Calendar'
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Grid container py={2}>
                            <Grid item xs={4}>
                                <Select
                                    value={calendarView}
                                    onChange={changeView}
                                    size='small'
                                    sx={{width: '200px', bgcolor: 'white'}}
                                >
                                    <MenuItem value='dayGridMonth'>Month View</MenuItem>
                                    <MenuItem value='dayGridWeek'>Week View</MenuItem>
                                    <MenuItem value='listWeek'>Week List View</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={4} justifyContent='center'>
                                <Autocomplete
                                    multiple
                                    value={filterValues}
                                    onChange={(e, newValue) => filterEvents(e, newValue)}
                                    options={options}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Filter by Brief Type" size='small' sx={{bgcolor: 'white'}} />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{width: '100%', bgcolor: 'white', p: 2}}>
                            <FullCalendar
                                height='100vh'
                                plugins={[ dayGridPlugin, listViewPlugin ]}
                                initialView='dayGridMonth'
                                events={events}
                                eventClick={(eventInfo) => selectEvent(eventInfo)}
                                ref={calendarRef}
                            />
                        </Box>
                    </Grid>
                    {Object.keys(activeEvent).length > 0 &&
                        <Drawer
                            open={Object.keys(activeEvent).length > 0}
                            anchor='right'
                        >
                            <Box sx={{width: '400px', p: 2}}>
                                <ButtonBox>
                                    <Button
                                        sx={{fontSize: '12px'}}
                                        startIcon={<Clear />}
                                        onClick={() => setActiveEvent({})}
                                    >
                                        close
                                    </Button>
                                </ButtonBox>
                                <Typography variant='h5' sx={{mb: 1}}>{activeEvent.name}</Typography>
                                <Typography variant='subtitle2' sx={{mb: 2}}>{activeEvent.id}</Typography>

                                <Divider sx={{mb: 2}} />

                                <Typography sx={{mb: 1, fontWeight: 'bold'}}>Dates:</Typography>
                                {activeEvent.milestones.length > 0 &&
                                    <>
                                        <Typography variant='body2'>{new Date(activeEvent.milestones[0].startDate).toLocaleDateString()} - {new Date(activeEvent.milestones[activeEvent.milestones.length - 1].endDate).toLocaleDateString()}</Typography>
                                    </>
                                }

                                <Divider sx={{my: 2}} />

                                <Typography sx={{mb: 1, fontWeight: 'bold'}}>Status:</Typography>
                                <Typography variant='body2'>
                                    {activeEvent.milestones.filter(item => item.percentComplete !== 100).length > 0
                                        ?   activeEvent.milestones.filter(item => item.percentComplete !== 100)[0].resource
                                        :   activeEvent.milestones[activeEvent.milestones.length - 1].resource
                                    }
                                </Typography>

                                <Divider sx={{my: 2}} />

                                <Typography sx={{mb: 2, fontWeight: 'bold'}}>Recent Progress Notes:</Typography>
                                    {activeEvent.notes 
                                        ?   <>
                                                {activeEvent.notes.length < 3
                                                    ?   activeEvent.notes.map(note => {
                                                            return (
                                                                <Box sx={{mb: 2}} key={note.id}>
                                                                    <Typography variant='body2' sx={{fontWeight: 'bold', color: '#ed6a22'}}>{new Date(note.date).toLocaleDateString()}</Typography>
                                                                    <Typography variant='body2'>
                                                                        {note.user}: {note.note}
                                                                    </Typography>
                                                                </Box>
                                                            )
                                                        })
                                                    :   activeEvent.notes.slice(0,3).map(note => {
                                                            return (
                                                                <Box sx={{mb: 2}} key={note.id}>
                                                                    <Typography variant='body2' sx={{fontWeight: 'bold', color: '#ed6a22'}}>{new Date(note.date).toLocaleDateString()}</Typography>
                                                                    <Typography variant='body2'>
                                                                        {note.user}: {note.note}
                                                                    </Typography>
                                                                </Box>
                                                            )
                                                        })
                                                }
                                            </>
                                        :   <Typography variant='body2'>No notes to display</Typography>
                                    }

                                <Divider sx={{my: 2}} />

                                <ButtonBox>
                                    <Button
                                        onClick={() => navigate(`/projects/${activeEvent.id}`)}
                                        sx={{fontSize: '12px'}}
                                        endIcon={<ArrowRightAlt />}
                                    >
                                        go to brief
                                    </Button>
                                </ButtonBox>
                            </Box>
                        </Drawer>
                    }
                </Grid>
            </PageLayout>
        </>
    )
}

export default Calendar;