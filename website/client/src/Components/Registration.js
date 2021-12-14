import axios from "axios";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import Config from "../Utils/Config";

const { backend } = Config();

async function handleRegistration(citizenAddress, setAlertType, setMessage) {
  setAlertType("info");
  setMessage(`Trying to register ${citizenAddress} ... `);
  axios
    .post(`${backend}/register`, {
      citizenAddress,
    })
    .then(function (response) {
      console.log(response);
      setAlertType(response.data.error != undefined ? "error" : "success");
      setMessage(response.data.msg);
    })
    .catch(function (error) {
      console.log(error);
      setAlertType("error");
      setMessage("Something went wrong.");
    });
}
function Registration(props) {
  const [citizenAddress, setCitizenAddress] = useState(undefined);
  const [alertType, setAlertType] = useState(undefined);
  const [message, setMessage] = useState(undefined);
  return (
    <div className="Registration">
      <h1>Registration Page</h1>
      <p>
        In the field bellow enter a valid ETH address and press REGISTER button - this will make that address eligible
        to vote in the Wakanda UN Elections.
      </p>
      <TextField
        fullWidth
        id="outlined-basic"
        label="Enter ETH address"
        variant="outlined"
        onChange={(e) => setCitizenAddress(e.target.value)}
        InputProps={{
          endAdornment: (
            <Button variant="outlined" onClick={() => handleRegistration(citizenAddress, setAlertType, setMessage)}>
              REGISTER
            </Button>
          ),
        }}
      />
      <br></br>
      <p className="Message">{message ? <Alert severity={alertType}>{message}</Alert> : undefined}</p>
    </div>
  );
}

export default Registration;
