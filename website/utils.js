function LoadContracts(web3) {
  if (web3 == undefined) return undefined;

  const { WKND_Token_Address, Voting_Address } = require("./DeployedContracts/DeployedContracts.json");

  const TOKEN_ABI = require("./DeployedContracts//build/contracts/Token.json").abi;
  const VOTING_ABI = require("./DeployedContracts//build/contracts/Voting.json").abi;

  tokenSC = new web3.eth.Contract(TOKEN_ABI, WKND_Token_Address);
  votingSC = new web3.eth.Contract(VOTING_ABI, Voting_Address, { gasLimit: "1000000" });

  tokenSC.address = WKND_Token_Address;
  votingSC.address = Voting_Address;
  return { tokenSC, votingSC };
}

const isValidAddress = (web3, addr) => {
  try {
    web3.utils.toChecksumAddress(addr);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports.LoadContracts = LoadContracts;
module.exports.isValidAddress = isValidAddress;
