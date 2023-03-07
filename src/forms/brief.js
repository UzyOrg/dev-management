import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import checkToken from "../utils/checkToken";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ButtonBox from "../components/buttonBox/buttonBox";
import { format } from "date-fns";
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Autocomplete,
  Button,
  Grid,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers";

function CreativeBriefForm(props) {
  const [nextBriefId, setNextBriefId] = useState("");
  const { initialValues, cancel, cancelText } = props;
  const [brief, setBrief] = useState({});
  
  let devlopersList = [
    {
      displayName: "Sarah Carter",
      mail: "carters@transblue.org",
    },
    {
      displayName: "Uziel Morales",
      mail: "uziel.morales@transblue.com",
    },
  ];
  useEffect(() => {
    axios
      .get(
        "https://my-tb-cors.herokuapp.com/https://dev-fns.azurewebsites.net/api/getall?databaseId=dev&containerId=projects"
      )
      .then((res) => {
        if (res.data === "No items found") {
          setNextBriefId("PJ-300");
        } else {
          // increment the creative brief ids
          setNextBriefId(
            `PJ-${parseInt(res.data[res.data.length - 1].id.split("-")[1]) + 1}`
          );
        }
      });
  }, []);

  useEffect(() => {
    setBrief({
      ...brief,
      ...initialValues,
    });
  }, [initialValues]);

  const [userEmails, setUserEmails] = useState([]);

  function handleChange(e) {
    setBrief({
      ...brief,
      [e.target.id]: e.target.value,
    });
  }

  useEffect(() => {
    async function getAllUsers() {
      const token = await checkToken();

      axios
        .get("https://graph.microsoft.com/v1.0/users?$top=999", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          // console.log(res.data.value);
          setUserEmails(res.data.value);
        });
    }
    getAllUsers();
  }, []);

  async function createBrief() {
    const token = await checkToken();
    brief.created = new Date().getTime();
    brief.id = nextBriefId;
    brief.history = [{
      action: `Brief Created and assigned to ${brief.assignedTo.name}`,
      date: new Date().getTime(),
      user: localStorage.getItem('user')
  }];
    let newObj = {
      ...brief,
      dueDate: format(brief.dueDate, "MM/dd/yyyy"),
      status: "In progress",
      id: nextBriefId,
      assignedTo: brief.assignedTo,
      history: brief.history,
    };
    // console.log(newObj)
    axios
      .post(
        `https://my-tb-cors.herokuapp.com/https://dev-fns.azurewebsites.net/api/save?databaseId=dev&containerId=projects`,
        newObj
      )
      .then((res) => {
        // console.log(res);
        // console.log('socialRequest');
        if (res.statusText === "OK") {
          setBrief({});
          props.updateTable(uuidv4())
          cancel();
          // console.log(brief.id);
          //   try {
          //     axios
          //       .post(
          //         `https://graph.microsoft.com/v1.0/me/sendMail`,
          //         {
          //           message: {
          //             subject: "Media Content request created",
          //             body: {
          //               contentType: "HTML",
          //               content: `Hello, <br /><br />A media content has been created by ${localStorage.getItem(
          //                 "user"
          //               )}, here is the link:<br /><br />
          //           <a href='https://m3.evergreenbrands.com/shorts/${
          //             brief.id
          //           }'>https://m3.evergreenbrands.com/shorts/${brief.id}</a>
          //           `,
          //             },
          //             toRecipients: [
          //               {
          //                 emailAddress: {
          //                   address: "ralhel@transblue.org",
          //                 },
          //               },
          //             ],
          //           },
          //         },
          //         {
          //           headers: {
          //             Authorization: `Bearer ${token}`,
          //             "Content-type": "application/json",
          //           },
          //         }
          //       )
          //       .then(() => {
          //         setBrief({});
          //       })
          //       .catch((err) => {
          //         alert(err);
          //       });
          //   } catch (e) {
          //     console.log(e);
          //   }
          //   cancel();
        } else {
        }
      });
  }

  return (
    <>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Request development
      </Typography>

      <TextField
        value={brief.name || ""}
        size="small"
        id="name"
        onChange={handleChange}
        label="Development needed"
        sx={{ mb: 3 }}
        fullWidth
      />
      <TextField
        value={brief.details || ""}
        size="small"
        id="details"
        onChange={handleChange}
        label="Details"
        sx={{ mb: 3 }}
        multiline
        minRows={4}
        fullWidth
      />
      <TextField
        value={brief.link || ""}
        size="small"
        id="link"
        onChange={handleChange}
        label="Link"
        sx={{ mb: 3 }}
        fullWidth
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DesktopDatePicker
          label="Due Date"
          fullWidth
          value={brief.dueDate || null}
          onChange={(newValue) =>
            setBrief({
              ...brief,
              dueDate: newValue,
            })
          }
          renderInput={(params) => (
            <TextField fullWidth size="small" sx={{ mb: 3 }} {...params} />
          )}
        />
      </LocalizationProvider>
        <Autocomplete
          freeSolo
          renderInput={(params) => (
            <TextField
              {...params}
              id="asign"
              label="Assigned To"
              size="small"
              fullWidth
            />
          )}
          options={devlopersList}
          getOptionLabel={(option) => option.displayName || ""}
          className="mb-2"
          onChange={(e, newValue) => {
            setBrief({
              ...brief,
              assignedTo: {
                name: newValue.displayName,
                email: newValue.mail,
              },
            });
          }}
          sx={{ mb: 3 }}
        />
      <ButtonBox>
        <Button
          sx={{ fontSize: "10px", mr: 1 }}
          variant="contained"
          color="error"
          onClick={cancel}
        >
          {cancelText}
        </Button>
        <Button
          sx={{ fontSize: "10px" }}
          variant="contained"
          color="success"
          onClick={createBrief}
        >
          save
        </Button>
      </ButtonBox>
    </>
  );
}

export default CreativeBriefForm;
