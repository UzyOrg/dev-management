import React from "react";
import { useState } from "react";
import { Button, MenuItem, Select, Table, TableCell, TableRow, TextField } from "@mui/material";
import { Cancel, Edit, Save } from "@mui/icons-material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from "@mui/x-date-pickers";
import axios from "axios";


const TableRowComp = (props) => {
    const { children } = props;
   

    return (
        <TableRow >
            <TableCell>{ children[0] }</TableCell>
            <TableCell>{ children[1] }</TableCell>
        </TableRow>
    )
}
function FormDetails(props) {
    const { brief, setBrief } = props;
   
    const [editOn, setEditOn] = useState(false);
    const [localBrief, setLocalBrief] = useState(props.brief);

    let rows = {
        Project: brief.name,
        Details: brief.details,
        'Assigned To': brief.assignedTo.name,
        // Audience: brief.audience,
        // Objective: brief.objective,
        // Content: brief.content,
        // Live: brief.live ? 'Yes' : 'No',
        // 'Air Date': brief.airDate ? new Date(brief.airDate).toLocaleString() : 'N/A',
        'Due Date':   (brief.dueDateType && brief.dueDateType) === 'specificDay'
        ?   new Date(brief.dueDate).toLocaleDateString()
        :   brief.dueDate
    }
    
    if(brief.request) {
        let { clientInterview, subInterview, description, contactName, location } = brief.request;
        rows = {
            ...rows,
            'Client Interview': clientInterview ? 'Yes' : 'No',
            'Sub Interview': subInterview ? 'Yes' : 'No',
            'Project Description': description,
            'Contact Name': contactName,
            Location: location
        }
    }
    function handleChange(e) {
        setLocalBrief({
            ...localBrief,
            [e.target.id]: e.target.value
        })
    }
    function saveUpdates() {
        setBrief(localBrief);
        
        axios.post(`https://my-tb-cors.herokuapp.com/https://dev-fns.azurewebsites.net/api/update?containerId=projects&id=${brief.id}`, localBrief).then(res => {
            setEditOn(false);
        }).catch(() => {
            alert('Oops! There was an error saving updates. Please try again')
        })
    }
    return(
        <>
         {!editOn &&
            <Table size='small'>
            {Object.keys(rows).map((row, i) => {
                return (
                    <TableRowComp key={i}>
                        <>{row}</>
                        <>{rows[row]}</>
                    </TableRowComp>
                )
            })}
        </Table>
        }
        {!editOn &&
            <Button
                startIcon={<Edit />}
                onClick={() => setEditOn(true)}
                sx={{mt: 2}}
            >
                edit details
            </Button>
        }

        {editOn &&
            <>
                <Table size='small'>
                    <TableRow>
                        <TableCell>
                            <>Name</>
                        </TableCell>
                        <TableCell>
                            <TextField
                                value={localBrief.name || ''}
                                size='small'
                                id='name'
                                onChange={handleChange}
                                label='Brief Name'
                                fullWidth
                            />
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            <>Details</>
                        </TableCell>
                        <TableCell>
                            <TextField
                                value={localBrief.details || ''}
                                size='small'
                                id='details'
                                onChange={handleChange}
                                label='Details'
                                fullWidth
                            />
                        </TableCell>
                    </TableRow>
                    
                    
                    
                    <TableRow>
                        <TableCell>
                            <>Due Date</>
                        </TableCell>
                        <TableCell>
                            <Select
                                size='small'
                                value={localBrief.dueDateType}
                                sx={{mr: 1}}
                                onChange={(e) => setLocalBrief({
                                    ...localBrief,
                                    dueDateType: e.target.value
                                })}
                            >
                                <MenuItem value='quarterly'>Quarterly</MenuItem>
                                <MenuItem value='specificDay'>Specific Day</MenuItem>
                            </Select>
                            {localBrief.dueDateType === 'quarterly' &&
                                <Select
                                    size='small'
                                    value={localBrief.dueDate}
                                    onChange={(e) => setLocalBrief({
                                        ...localBrief,
                                        dueDate: e.target.value
                                    })}
                                >
                                    <MenuItem value='Q1'>Q1</MenuItem>
                                    <MenuItem value='Q2'>Q2</MenuItem>
                                    <MenuItem value='Q3'>Q3</MenuItem>
                                    <MenuItem value='Q4'>Q4</MenuItem>
                                </Select>
                            }
                            {localBrief.dueDateType === 'specificDay' &&
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Due Date"
                                        value={localBrief.dueDate || new Date()}
                                        onChange={(newValue) => setLocalBrief({
                                            ...localBrief,
                                            dueDate: newValue
                                        })}
                                        renderInput={(params) => <TextField fullWidth size='small' {...params} />}
                                    />
                                </LocalizationProvider>
                            }
                        </TableCell>
                    </TableRow>
                   
                </Table>
                <Button
                    sx={{mt: 2}}
                    color='success'
                    startIcon={<Save />}
                    onClick={saveUpdates}
                >
                    save updates
                </Button>
                <Button
                    sx={{mt: 2}}
                    color='error'
                    startIcon={<Cancel />}
                    onClick={() => setEditOn(false)}
                >
                    discard updates
                </Button>
            </>
        }
        </>
    )
}

export default FormDetails;