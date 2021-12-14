import { useState } from "react";
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

async function getWinningCandidates(setCandidates) {
  try {
    const resp = await axios.get(`${backend}/getWinningCandidates`, {});
    console.log(resp);
    const { candidates } = resp.data;
    setCandidates(candidates);
  } catch (err) {
    console.log(err);
  }
}

function CandidateTable(props) {
  const { candidates } = props;

  if (candidates.length == 0) {
    return <div className="CandidateTable"> Press SHOW LEADS to display the winning candidates</div>;
  }

  return (
    <div className="CandidateTable">
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Cult</TableCell>
              <TableCell>No. Votes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {candidates.map((e, k) => (
              <TableRow key={k} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
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

function ShowLeads(props) {
  const [candidates, setCandidates] = useState([]);

  return (
    <div className="ShowLeads">
      <Button variant="outlined" onClick={() => getWinningCandidates(setCandidates)}>
        SHOW LEADS
      </Button>
      <hr></hr>
      <CandidateTable candidates={candidates}></CandidateTable>
    </div>
  );
}

export default ShowLeads;
