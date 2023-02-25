import { Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import checkToken from "../../utils/checkToken";
import Container from '../../components/hierarchyLayout/index'
import PageLayout from "../../components/pageLayout/pageLayout";
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

    return (
        <PageLayout>


            <Container>
                {users?.map((user, index) => (
                    <div key={uuidv4()} style={{ width: '20%', backgroundColor: 'white', padding: '5px', margin: '5px', textAlign: 'center', boxShadow: '10px 5px 5px grey', borderRadius: '20px', flexWrap:'wrap', minWidth:'200px'}}>
                        <p key={uuidv4()}>{user.displayName}</p>
                        <p key={uuidv4()}>{user.email}</p>
                        <p key={uuidv4()}>{user.mobilePhone}</p>
                    </div>
                ))}
            </Container>

        </PageLayout>
    )
}

export default Hierarchy