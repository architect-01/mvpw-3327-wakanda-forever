import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";

import Config from "../Utils/Config";

async function logIn(setUserLogState, setAddress) {
  if (typeof window.ethereum !== "undefined") {
    // Instance web3 with the provided information
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access
      await window.ethereum.enable();
      const address = (await web3.eth.getAccounts())[0];
      setUserLogState(true);
      setAddress(address);
    } catch (e) {
      // User denied access
      setUserLogState(false);
      alert("You must enable access to METAMASK.");
    }
  } else {
    alert("You need METAMASK.");
  }
}

async function getAccountInfo(citizenAddress, setUserBalance, setRegistrationStatus, setHasVoted) {
  if (citizenAddress == undefined) return;

  const { backend } = Config();
  try {
    const resp = await axios.post(`${backend}/getAccountInfo`, {
      citizenAddress,
    });
    const { balance, isRegistered, citizenVote } = resp.data;
    setUserBalance(balance);
    setRegistrationStatus(isRegistered);
    setHasVoted(citizenVote.hasVoted);
  } catch (err) {
    console.log(err);
  }
}

function AccountInfo() {
  const [loggedIn, setUserLogState] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(undefined);
  const [hasVoted, setHasVoted] = useState(undefined);
  const [address, setAddress] = useState(undefined);
  const [balance, setUserBalance] = useState(0);

  if (loggedIn == false) {
    logIn(setUserLogState, setAddress);
  } else {
    getAccountInfo(address, setUserBalance, setRegistrationStatus, setHasVoted);
  }

  return (
    <div className="AccountInfo">
      <div className="InfoPiece Address">
        <h4>
          <strong>Address:</strong>
        </h4>
        <h4>{`${address}`}</h4>
      </div>

      <div className="InfoPiece">
        <h4>
          <strong>Balance:</strong>
        </h4>
        <h4>{`${balance} WKND`}</h4>
      </div>
      <div className="InfoPiece">
        <h4>
          <strong>Is Registered:</strong>
        </h4>
        <h4>{`${registrationStatus}`}</h4>
      </div>

      <div className="InfoPiece">
        <h4>
          <strong>Has Voted:</strong>
        </h4>
        <h4>{`${hasVoted}`}</h4>
      </div>
    </div>
  );
}

export default AccountInfo;
