const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const ethers = require("ethers");

const utils = require("./utils");

require("dotenv").config();

const localKeyProvider = new HDWalletProvider({
  privateKeys: [process.env.SERVER_ACCOUNT_PRIVATE_KEY],
  providerOrUrl: process.env.ALCHEMY_API,
});
const web3 = new Web3(localKeyProvider);

const { tokenSC, votingSC } = utils.LoadContracts(web3);

const serverAccount = web3.eth.accounts.privateKeyToAccount(process.env.SERVER_ACCOUNT_PRIVATE_KEY);

const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//frontend
app.use(express.static(path.join(__dirname, "client/build")));

//backend API
app.post("/getAccountInfo", async function (req, res) {
  // For the provided citizenAddress gets the balance, registration status and voting status
  const { citizenAddress } = req.body;

  const balance = await tokenSC.methods.balanceOf(citizenAddress).call();
  const isRegistered = await votingSC.methods.citizenIsRegistered(citizenAddress).call();
  let citizenVoteArray = await votingSC.methods.citizenHasVoted(citizenAddress).call();

  res.json({ balance, isRegistered, citizenVote: { hasVoted: citizenVoteArray[2] } });
});

app.get("/getCandidates", async function (req, res) {
  // Returns all candidates involved in the elections
  const candidates = await votingSC.methods.seeAllCandidates().call();

  res.json({ candidates });
});

app.get("/getWinningCandidates", async function (req, res) {
  // Returns top 3 candidates
  const candidates = await votingSC.methods.winningCandidates().call();

  res.json({ candidates });
});

app.post("/register", async function (req, res) {
  // Tries to register the provided citizenAddress
  const { citizenAddress } = req.body;

  if (utils.isValidAddress(web3, citizenAddress) == false) {
    res.json({ error: "Invalid ETH address", msg: `Address ${citizenAddress} is not a valid ETH address.` });
    return;
  }

  const isRegistered = await votingSC.methods.citizenIsRegistered(citizenAddress).call();
  if (isRegistered) {
    res.json({ error: "Already Registered", msg: `Citizen : ${citizenAddress} has been previously registered.` });
    return;
  }

  try {
    const resp = await votingSC.methods.register(citizenAddress).send({ from: serverAccount.address });
    console.log(`Citizen : ${citizenAddress} is now registered.`);
    res.json({ msg: "SUCCESS: Citizen is now registered.", info: resp });
  } catch (err) {
    console.log(`Citizen : ${citizenAddress} has been previously registered.`);
    res.json({ error: "Already Registered", err, msg: `Citizen : ${citizenAddress} has been previously registered.` });
  }
});

app.post("/vote", async function (req, res) {
  // Tries to cast a vote on the behalf of the provided citizenAddress
  const { citizenAddress, candidateId, amount, signature } = req.body;

  const isRegistered = await votingSC.methods.citizenIsRegistered(citizenAddress).call();
  if (isRegistered == false) {
    res.json({ error: "Need to register", msg: `ERROR: Citizen needs to register.` });
    return;
  }
  const hasVoted = (await votingSC.methods.citizenHasVoted(citizenAddress).call())[2];
  if (hasVoted) {
    res.json({ error: "PREVIOUSLY VOTED", msg: `ERROR: Citizen has previously voted.` });
    return;
  }

  const balance = await tokenSC.methods.balanceOf(citizenAddress).call();
  if (balance < amount) {
    res.json({ error: "Not Enough tokens", msg: `ERROR: Insufficient Balance.` });
    return;
  }

  try {
    const resp = await votingSC.methods
      .delegatedVote(signature, citizenAddress, candidateId, amount)
      .send({ from: serverAccount.address });
    console.log(resp);
    res.json({ msg: `SUCCESS: Citizen has voted.`, info: resp });
  } catch (err) {
    console.log(err);
    res.json({ error: "Something went wrong", err, msg: `ERROR: Something went wrong.` });
  }
});

app.post("/getVotingMessage", async function (req, res) {
  // Returns a message to be signed by the voter (citizenAddress)
  const { citizenAddress, candidateId, amount } = req.body;

  const nonce = await votingSC.methods.getNonce(citizenAddress).call();

  const chainId = process.env.CHAIN_ID; // RINKEBY

  res.json({
    // Domain
    domain: {
      name: "UN.Elections",
      version: "1.0.0",
      chainId,
      verifyingContract: votingSC.address,
    },
    // Types
    types: {
      vote: [
        { name: "citizenAddress", type: "address" },
        { name: "candidateId", type: "uint256" },
        { name: "amount", type: "uint256" },
        { name: "nonce", type: "uint256" },
      ],
    },
    // Value
    value: { citizenAddress, candidateId, amount, nonce },
  });
});

app.get("*", (req, resp) => {
  resp.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Wakanda server listening at http://localhost:${PORT}`);
});
