import React from "react";
import { Table, TableCell, TableRow } from "@mui/material";

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
    const { brief } = props;
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

    return(
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
    )
}

export default FormDetails;