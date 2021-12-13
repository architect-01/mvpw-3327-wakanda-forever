import { useState, useEffect } from "react";
import Link from "@mui/material/Link";

const GITHUB_LINK = "https://github.com/architect-01/mvpw-3327-wakanda-forever";
const TOKEN_SC_ADDRESS = "https://rinkeby.etherscan.io/address/0x038F0184BF2979944DEB7B4045d17AA5501Ba0F0";
const VOTING_SC_ADDRESS = "https://rinkeby.etherscan.io/address/0x23eCaC0b6f301bc9513b0487BF64a9d9e2EEDdc7";

function Header() {
  return (
    <div className="Header">
      <div className="C0">
        <a href="https://mvpworkshop.co/" target="_blank">
          <img className="HeaderImg" src="./mvpw.png" />
        </a>
        <a href="https://3327.io/" target="_blank">
          <img className="HeaderImg" src="./3327.png" />
        </a>
        <h1>Wakanda Forever</h1>
        <Link className="GithubLink" href={GITHUB_LINK} target="_blank" color="primary">
          <h2> architect-01/mvpw-3327-wakanda-forever</h2>
        </Link>
      </div>
      <div className="C1">
        <div className="EtherscanReferences">
          <h4>View contracts on Etherscan: {"      "}</h4>
          <Link className="Link" href={TOKEN_SC_ADDRESS} target="_blank" color="primary">
            Token
          </Link>
          <Link className="Link" href={VOTING_SC_ADDRESS} target="_blank" color="primary">
            Voting
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
