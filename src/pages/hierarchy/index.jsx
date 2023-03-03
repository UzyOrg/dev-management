import { Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import checkToken from "../../utils/checkToken";
import Container from '../../components/hierarchyLayout/index'
import PageLayout from "../../components/pageLayout/pageLayout";

import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
// import TreeItem from '@mui/lab/TreeItem';
import { v4 as uuidv4 } from 'uuid';

const Hierarchy = () => {
    const [users, setUsers] = useState([])
    async function getAllUsers() {
        const token = await checkToken();
        axios.get('https://graph.microsoft.com/v1.0/users?$top=999', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(res => {
            console.log(res.data)
            let newUsers = res.data.value.map((user) => {
                return {
                    displayName: user.displayName,
                    email: user.mail,
                    mobilePhone: user.mobilePhone
                }
            })
            setUsers([...newUsers])
        })
    };

    useEffect(() => {
        getAllUsers();
    }, []);
    let half = users.filter((item, i)=>{
        return i<=10
    })
    let otherHalf = users.filter((item, i)=>{
        return i>10&i<30
    })
    return (
        <PageLayout>


            {/* <Container>
                {users?.map((user, index) => (
                    <div key={uuidv4()} style={{ width: '20%', backgroundColor: 'white', padding: '5px', margin: '5px', textAlign: 'center', boxShadow: '10px 5px 5px grey', borderRadius: '20px', flexWrap: 'wrap', minWidth: '200px' }}>
                        <p key={uuidv4()}>{user.displayName}</p>
                        <p key={uuidv4()}>{user.email}</p>
                        <p key={uuidv4()}>{user.mobilePhone}</p>
                    </div>
                ))}
            </Container> */}
            <TreeView
                aria-label="file system navigator"
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
                sx={{ height: 540, flexGrow: 1, maxWidth: 600, overflowY: 'auto' }}
            >
                <TreeItem nodeId="1" label="Marketing">
                    <TreeItem nodeId="2" label="Jim Wescott">
                    {half?.map((user, index) => (
                        <TreeItem nodeId={`${index}A`} label={user.displayName}>
                            <TreeItem nodeId={`${index}B`} label={`${user?.email}`}/>    
                            <TreeItem nodeId={`${index}C`}label={`${user?.mobilePhone}`}/>    
                        </TreeItem>
                    
                ))}
                    </TreeItem>
                </TreeItem>
                <TreeItem nodeId="5" label="Development">
                {otherHalf?.map((user, index) => (
                        <TreeItem nodeId={`${index}A`} label={user.displayName}>
                            <TreeItem nodeId={`${index}B`} label={`${user?.email}`}/>    
                            <TreeItem nodeId={`${index}C`}label={`${user?.mobilePhone}`}/>    
                        </TreeItem>
                ))}
                        
                    
                </TreeItem>
            </TreeView>
        </PageLayout>
    )
}

export default Hierarchy