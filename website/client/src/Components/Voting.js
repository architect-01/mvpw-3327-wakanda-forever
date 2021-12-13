import { useState, useEffect } from "react";
import axios from "axios";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import Alert from "@mui/material/Alert";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Config from "../Utils/Config";
import { ethers } from "ethers";

const { backend } = Config();

async function getCandidates(setCandidates) {
  try {
    const resp = await axios.get(`${backend}/getCandidates`, {});
    console.log(resp);

    const { candidates } = resp.data;
    setCandidates(candidates);
  } catch (err) {
    console.log(err);
  }
}

async function handleVoting(candidateId, amount, setMessage, setAlertType, setCandidates) {
  if (window.ethereum === undefined) {
    alert("You need metamask!");
    return;
  }

  const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
  const signerAddress = await signer.getAddress();
  try {
    const resp = await axios.post(`${backend}/getVotingMessage`, {
      citizenAddress: signerAddress,
      candidateId,
      amount,
    });
    const { domain, types, value } = resp.data;
    const signature = await signer._signTypedData(domain, types, value);

    try {
      setAlertType("info");
      setMessage(`Trying to cast a vote ...`);

      const resp = await axios.post(`${backend}/vote`, {
        citizenAddress: signerAddress,
        candidateId,
        amount,
        signature,
      });
      setMessage(resp.data.msg);
      setAlertType(resp.data.error ? "error" : "success");
      getCandidates(setCandidates);
    } catch (err) {
      setMessage("Something went wrong.");
      setAlertType("error");
    }
  } catch (err) {
    console.log(err);
  }
}

function CandidateTable(props) {
  const { candidates } = props;
  return (
    <div className="CandidateTable">
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Candidate ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Cult</TableCell>
              <TableCell>No. Votes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((e, k) => (
              <TableRow key={k} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {k}
                </TableCell>
                <TableCell>{e[0]}</TableCell>
                <TableCell>{e[1]}</TableCell>
                <TableCell>{e[2]}</TableCell>
                <TableCell>{e[3]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function Voting(props) {
  const [loaded, setLoaded] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState(0);
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState("Happy Voting.");
  const [alertType, setAlertType] = useState("info");

  if (loaded == false) {
    getCandidates(setCandidates);
    setLoaded(true);
  }
  return (
    <div className="Voting">
      <h1>Voting Page</h1>
      <div className="CastingVotes">
        <CandidateTable candidates={candidates} />
        <div className="VoteOption">
          <h3>Cast your vote</h3>
          <FormControl fullWidth className="Component">
            <InputLabel id="demo-simple-select-helper-label">Select Candidate ID</InputLabel>
            <Select
              labelId="demo-simple-select-helper-label"
              label="Select Candidate ID"
              value={candidateId}
              fullWidth
              onChange={(e) => setCandidateId(e.target.value)}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((e, k) => (
                <MenuItem value={k}>{e}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <hr></hr>
          <TextField
            className="Component"
            fullWidth
            id="outlined-basic2"
            label="Enter WKND amount"
            type="number"
            variant="outlined"
            onChange={(e) => setAmount(e.target.value)}
            InputProps={{
              endAdornment: (
                <Button
                  variant="outlined"
                  onClick={() => handleVoting(candidateId, amount, setMessage, setAlertType, setCandidates)}
                >
                  VOTE
                </Button>
              ),
            }}
          />
          <div className="Component">
            <Alert severity={alertType}>{message}</Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Voting;
