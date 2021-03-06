# Introduction

This is a solution to the MVPW 3327 Wakanda Forever assignment. Goal of which is to build a decentralized
voting system using the blockchain to provide for fair elections.

The citizens of Wakanda can register using their ETH addresses and receive 1 WKND token that can be used to
vote for one of the candidates in the Wakanda's UN Election.

WKND token is an ERC20 token - which means it can be transfered between different addresses and multiple votes
can come from one address.

Three candidates with the highest number of votes will be elected as the Wakanda's UN representatives.

The detailed assignment info is available at: **[3327] Wakanda.pdf**

# DEMO

The DEMO Application is available at : https://mvpw-3327-wakanda-forever.herokuapp.com/

![DEMO](/demo.png)

NOTE: After 30 minutes of inactivity the Application goes to sleep so first time loading can be a little slow.

# Solution's approach

Have a server as the intermediary that will pass signed messages (generated by the front end) to the smart contracts (SC) which will
then verify the signature and act accordingly.

## Folder structure

The solution is structured like this:

- **smart-contracts** :
  Used for developing, testing and deploying smart contracts using "brownie" framework.
- **website** :
  NodeJS Express backend with React frontend.
- **CONFIG.json** :
  Common constants seen across the solution.

## Smart Contracts

The contracts are stored in the: _smart-contracts/contracts_

The two main are : **Token.sol** and **Voting.sol**

### Token.sol

Is an ERC20 token with an added concept of "Authority" - an address that is able to transfer to and from voters' accounts - this is the address of the Voting.sol contract.\
The SC besides standard ERC20 functions (fransfer, approve, ...) has three additional public functions :

- **setAuthority (address \_authority)**
  - Called by the King (contract's deployer) to set the authority. Can be called only once.
- **usingRegistrationRight (address \_voter, uint256 \_value)**
  - Called by the Voting contract when there is a register call. It transfers to the _\_voter_ the registration amount (_\_value_).
- **usingVotingRight (address \_voter, uint256 \_value)**
  - Called by the Voting contract when there is a vote call. It burns the amount of tokens provided (_\_value_) - To disable the possibility of multiple votes being cast using the same tokens.

### Voting.sol

Is a custom SC that fascilates the requirements that are listed in the assignment.

Main functions of SC are:

- **register (address \_citizen)**
  - Can be called by any address - anyone can register any non previously registered address.
- **vote (uint256 \_candidateId, uint256 \_amount)**
  - While the frontend is designed such that the message (intended vote) is signed by the voter and passed to the server to be posted on the blockchain, SC has the ability for the voter to cast a vote directly.
- **winningCandidates ()**
  - Returns top 3 candidates with highest number of votes.

The most interesting part of this SC is the:

- **delegatedVote (bytes calldata signature, address citizenAddress, uint256 candidateId, uint256 amount)**
  - Which takes the _signature_ generated by another address (not the one calling the SC function) and determines if the message was signed by the _citizenAddress_ as well as if the corresponding parts of the message (_candidateId_ and _amount_) are the same. If so, it proceeds to cast the vote for the right candidate.

## Website

NodeJS (ExpressJS) server as backend and ReactJS as frontend framework. Located in : _website_ and _website/client_ folder respectively.

# Requirements and Setup

- smart-contracts:
  - Brownie 1.16.4 [pip install eth-brownie]
- website:
  - NodeJS v13.12.0 and NPM 6.14.4
  - NPM modules listed in "website/package.json"[cd website && npm install]
  - NPM modules listed in "website/client/package.json" [cd website/client && npm install]

# General development flow

Have three active terminals :

**cd smart-contracts**

- This is where the SC development, testing and deployment is done. After making changes to .sol files, use the command : **\*brownie run scripts/deploy_all.py --network NETWORK_NAME \***
  which deploys all contracts and updates the _website/DeployedContracts_ folder for the backend to use.

**cd website && npm start**

- Starts the local NodeJS server (backend)

**cd website/client && npm start**

- Starts the local ReactJS development environment

# Some important information

- The verification of signed messages by the Voting SC fails on the local network but passes on the Rinkeby network.
