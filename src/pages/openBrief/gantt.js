import React, { useEffect, useState } from "react";
import Chart from "react-google-charts";
import EditMilestoneModal from "./editMilestoneModal";

function Gantt(props) {
    const { milestones, setMilestones } = props;
    const [ganttRows, setGanttRows] = useState([]);
    const [activeMilestone, setActiveMilestone] = useState({});
    const [milestoneOpen, setMilestoneOpen] = useState(false);

    const ganttColumns = [
        { type: "string", label: "Task ID" },
        { type: "string", label: "Task Name" },
        { type: "string", label: "Phase" },
        { type: "date", label: "Start Date" },
        { type: "date", label: "End Date" },
        { type: "number", label: "Duration" },
        { type: "number", label: "Percent Complete" },
        { type: "string", label: "Dependencies" },
    ];

    useEffect(() => {
        if(milestones.length > 0) {
            setGanttRows(milestones.map(milestone => {
                return [
                    milestone.id,
                    milestone.name,
                    milestone.resource,
                    new Date(milestone.startDate),
                    new Date(milestone.endDate),
                    null,
                    milestone.percentComplete || 0,
                    null
                ]
            }))
        }
    }, [milestones]);

    const data = [ganttColumns, ...ganttRows];

    const handleOpen = (id) => {
        setMilestoneOpen(true);
        setActiveMilestone(milestones.filter(milestone => milestone.id === id)[0]);  
    }

    return (
        <>
            <EditMilestoneModal 
                milestone={activeMilestone} 
                setMilestoneOpen={setMilestoneOpen} 
                milestoneOpen={milestoneOpen} 
                setMilestones={setMilestones} 
                milestones={milestones}
            />
            <Chart 
                chartType="Gantt" 
                width="100%" 
                height="100%" 
                data={data} 
                chartEvents={[
                    {
                        eventName: 'select',
                        callback: ({ chartWrapper }) => {
                            const chart = chartWrapper.getChart();
                            const dataTable = chartWrapper.getDataTable();
                            const selected = chart.getSelection();
                            let row = selected[0].row;
                            //console.log(dataTable.getValue(row, 0))
                            let id = dataTable.getValue(row, 0);
                            handleOpen(id);
                        }
                    }
                ]}
            />
        </>
    )
}

export default Gantt;