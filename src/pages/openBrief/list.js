import { Clear, Edit } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { DataGridPro, GridActionsCellItem } from '@mui/x-data-grid-pro';
import axios from 'axios';
import React, { useState } from 'react';
import EditMilestoneModal from './editMilestoneModal';


function ListView(props) {
    const { milestones, setMilestones, brief } = props;
    const [activeMilestone, setActiveMilestone] = useState({});
    const [milestoneOpen, setMilestoneOpen] = useState(false);
    const handleMilestoneOpen = (milestone) => {
        console.log(milestone);
        setActiveMilestone(milestone)
        setMilestoneOpen(true);
    }

    function deleteMilestone(id) {
        let arr = milestones.filter(milestone => milestone.id !== id);

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${brief.id}`, {
            milestones: arr
        }).then(res => {
            if(res.statusText === 'OK') {
                alert('Brief Saved!');
                setMilestones(arr);
            }

            else {
                alert('Oops! There was an error deleting milestone. Please try again')
            }
        })
    }

    const columns = [
        {field: 'name', headerName: 'Name', flex: 1},
        {field: 'assignedTo', headerName: 'Assigned To', renderCell: (params) => params.row.assignedTo ? params.row.assignedTo.map(user => <><Typography variant='body2' sx={{mr: 1}}>{`${user.displayName}, `}</Typography></>) : '', flex: 1},
        {field: 'startDate', headerName: 'Start', flex: .5, valueGetter: (params) => new Date(params.row.startDate).toLocaleDateString()},
        {field: 'endDate', headerName: 'End', flex: .5, valueGetter: (params) => new Date(params.row.endDate).toLocaleDateString()},
        {field: 'resource', headerName: 'Phase'},
        {field: 'subResource', headerName: 'Sub Phase'},
        {
            field: 'percentComplete', 
            headerName: '% Complete', 
            renderCell: (params) => params.row.percentComplete ? `${params.row.percentComplete} %` : `0 %`,
            editable: true
        },
        {
            field: 'actions',
            headerName: '',
            type: 'actions',
            getActions: (params) => [
                <GridActionsCellItem icon={<Edit />} onClick={() => handleMilestoneOpen(params.row)} />,
                <GridActionsCellItem icon={<Clear color='error' />} onClick={() => deleteMilestone(params.row.id)} />
            ]
        }
    ]

    function saveMilestones(e) {
        let arr = milestones.map(milestone => {
            if(milestone.id === e.row.id) {
                return e.row
            }
            return milestone
        })

        axios.post(`https://my-tb-cors.herokuapp.com/https://tbmedia-fns.azurewebsites.net/api/update?containerId=briefs&id=${brief.id}`, {
            milestones: arr
        }).then(res => {
            if(res.statusText === 'OK') {
                alert('Brief Saved!');
                //setMilestones(arr);
            }

            else {
                alert('Oops! There was an error deleting milestone. Please try again')
            }
        })

    }

    return(
        <>
            <EditMilestoneModal 
                milestone={activeMilestone} 
                setMilestoneOpen={setMilestoneOpen} 
                milestoneOpen={milestoneOpen} 
                setMilestones={setMilestones} 
                milestones={milestones}
            />
            <DataGridPro
                disableSelectionOnClick
                rows={milestones}
                columns={columns}
                pageSize={10}
                pagination
                autoHeight
                autoPageSize
                rowsPerPageOptions={[10]}
                density='compact'
                editMode='row'
                onRowEditStop={saveMilestones}

            />
        </>
    )
}

export default ListView;