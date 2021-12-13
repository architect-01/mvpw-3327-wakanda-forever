pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;
// SPDX-License-Identifier: MIT

import "./OpenZepellin/contracts/utils/math/SafeMath.sol";
import "./Token.sol";

import "./OpenZepellin/contracts/utils/cryptography/ECDSA.sol";
import "./OpenZepellin/contracts/utils/cryptography/draft-EIP712.sol";

/**
    @title Voting Contract
    @notice Voters Register (receive 1 WKND) token after which, they can particapate in the elections

 */
contract Voting is EIP712{

    uint256 constant ELECTION_WINNERS_LENGTH = 3;
    uint256 constant REGISTRATION_AMOUNT = 1;

    using SafeMath for uint256;

    struct Candidate {
        string name;
        uint8 age;
        string cult;
        uint256 votes;
    }

    struct Vote {
        uint256 candidateId;
        uint256 amount;
        bool hasVoted;
    }

    address king;

    Token wakandaToken;

    mapping (address => bool) isRegistered;
    mapping (address => uint256) nonces;
    mapping (address => Vote) votes;

    Candidate[] candidates;

    uint256[] electionWinners;
    event NewChallenger(Candidate challenger);

    bool hasEnded;

    constructor(string memory _electionName, address _wakandaTokenAddress, string[] memory _candidateNames, uint8[] memory _candidateAges, string[] memory _candidateCults) EIP712(_electionName, "1.0.0") {

        king = msg.sender;

        _addCandidates(_candidateNames, _candidateAges, _candidateCults);

        wakandaToken = Token(_wakandaTokenAddress);

    }

    /**
        @notice Ends the election - there is no voting after
        @return Boolean : True if successful
     */
    function endTheElection() public returns (bool) {
        
        require(msg.sender == king, "Only KING can end the election.");

        hasEnded = true;

        return true;

    }

    /**
        @notice Registers the _citizen to be able to participate in the elections
        @param _citizen Citizen's address
        @return Boolean : True if successful
     */
    function register(address _citizen) public returns (bool) {
        
        require(isRegistered[_citizen] != true, "The citizen has been registered - there are no multiple registrations.");

        wakandaToken.usingRegistrationRight(_citizen, REGISTRATION_AMOUNT);
        isRegistered[_citizen] = true;

        return true;

    }

    /**
        @notice Returns the registration status of _citizenAddress
        @param _citizenAddress Citizen's address
        @return Boolean : True if citizen is registered
     */
    function citizenIsRegistered(address _citizenAddress) public view returns (bool) {

        return isRegistered[_citizenAddress];

    }

    /**
        @notice Voting function - casts a vote from msg.sender
        @param _candidateId Candidate ID
        @param _amount Amount of WKND tokens to be used for voting
     */
    function vote(uint256 _candidateId, uint256 _amount) public {

        _vote(msg.sender, _candidateId, _amount);

    }

    /**
        @notice Returns the voting status of _citizenAddress
        @param _citizenAddress Citizen's address
        @return The Vote struct
     */
    function citizenHasVoted(address _citizenAddress) public view returns (Vote memory) {

        return votes[_citizenAddress];
        
    }

    /**
        @notice Returns the Election's top 3 candidates (winning candidates)
        @return An array of top candidates
     */
    function winningCandidates() public view returns (Candidate[] memory){
    
        Candidate[] memory winners = new Candidate[](electionWinners.length);
        for (uint8 i = 0; i < electionWinners.length; ++i) winners[i] = candidates[electionWinners[i]];
        return winners;
        
    }

    /**
        @notice Returns an array of all candidates involved in the election
        @return Array
     */
    function seeAllCandidates() public view returns (Candidate[] memory) {

        return candidates;

    }

    /**
        @notice Returns a nonce fo the specified citizenAddress
        @param citizenAddress Citizen's address
        @return Nonce
     */
    function getNonce(address citizenAddress) public view returns (uint256){

        return nonces[citizenAddress];
        
    }

    /**
        @notice Returns a digest that will be used in verification of a signature
        @param citizenAddress Citizen's address
        @param candidateId Candidate's ID
        @param amount Amount of WKND tokens to be used in voting
        @return Digest
     */
    function getDigest(address citizenAddress, uint256 candidateId, uint256 amount) public view returns (bytes32){

        uint256 nonce = nonces[citizenAddress];

        return _hashTypedDataV4(
            keccak256(
                abi.encode(    
                    keccak256("vote(address citizenAddress,uint256 candidateId,uint256 amount,uint256 nonce)"),
                    citizenAddress,
                    candidateId,
                    amount,
                    nonce
                )
            )
        );
    }
    
    /**
        @notice Return the signer of a message
        @param digest Digested message
        @param signature Singature
        @return Signer of a message
     */
    function getSigner(bytes32 digest, bytes calldata signature) public pure returns (address){
        return  ECDSA.recover(digest, signature);
    }

    /**
        @notice Used for delegating a vote - can be called by anyone having a signature and rest of the information
        @param citizenAddress Citizen's address
        @param candidateId Candidate's ID
        @param amount Amount of WKND tokens to be used in voting
     */
    function delegatedVote(bytes calldata signature, address citizenAddress, uint256 candidateId, uint256 amount) public {

        bytes32 digest = getDigest(citizenAddress, candidateId, amount);
        address signer = getSigner(digest, signature);
        require(signer == citizenAddress, "Function `vote` : invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");

        _vote(citizenAddress, candidateId, amount);

        nonces[citizenAddress]++;
    }
    /**
        @notice When deployed, instantiates the candidate array
        @param _candidateNames Candidate's Names
        @param _candidateAges Candidate's Ages
        @param _candidateCults Candidate's Cults
     */
    function _addCandidates(string[] memory _candidateNames, uint8[] memory _candidateAges, string[] memory _candidateCults) internal {

        require(msg.sender == king, "Only KING can start a new election !");
        require(_candidateNames.length == _candidateAges.length, "Length mismatch - candidate names and ages !");
        require(_candidateNames.length == _candidateCults.length, "Length mismatch - candidate names and ages !");

        for(uint256 i = 0; i < _candidateNames.length; ++i) {
            candidates.push(Candidate({name: _candidateNames[i], age: _candidateAges[i], cult: _candidateCults[i], votes: 0}));
        }

    }

    /**
        @notice Internal function which handles the voting
        @param _citizen Citizen's address
        @param _candidateId Candidate's ID
        @param _amount Amount of WKND tokens to be used in the voting process
     */
    function _vote(address _citizen, uint256 _candidateId, uint256 _amount) internal {

        require(hasEnded != true, "Voting for the current election has ended .");
        require(votes[_citizen].hasVoted != true, "The citizen already voted in the election .");
        require(_amount >= REGISTRATION_AMOUNT, "The amount is lesser than the REGISTRATION AMOUNT.");
        require(_candidateId < candidates.length, "The candidate ID greater than the number of candidates !");

        wakandaToken.usingVotingRight(_citizen, _amount);

        candidates[_candidateId].votes = candidates[_candidateId].votes.add(_amount);
        votes[_citizen].candidateId = _candidateId;
        votes[_citizen].amount = _amount;
        votes[_citizen].hasVoted = true;

        if(_isInElectionWinners(_candidateId) == false){ // potentially a new challenger 
         
            if (candidates[_candidateId].votes > _getLastPlaceVotes() || electionWinners.length < ELECTION_WINNERS_LENGTH) { // entering the first N places
   
                _insertIntoElectionWinners(_candidateId);
                _sortElectionWinners();
                emit NewChallenger(candidates[_candidateId]);

            } else {

                // do nothing - current candidate didn't enter the first three places
            }
            
        } else { // it is not a new challenger
        
            _sortElectionWinners(); // the order can be different now

        }
    }

    /**
        @notice Internal function which sorts the electionWinners Array
     */
    function _sortElectionWinners() internal {

        if(electionWinners.length == 0) return;

        for(uint8 i = 0; i < electionWinners.length - 1; ++i){
            for(uint8 j = i+1; j < electionWinners.length; ++j){
                uint256 currPlaceId = electionWinners[i];
                uint256 nextPlaceId = electionWinners[j];
                if(candidates[currPlaceId].votes < candidates[nextPlaceId].votes){
                    uint256 temp = electionWinners[i];
                    electionWinners[i] = electionWinners[j];
                    electionWinners[j] = temp;
                }
            }
        }
    }

    /**
        @notice Internal function which returns if the _candidateId is in the electionWinners Array
        @param _candidateId Candidate's ID to be checked
        @return Bool : True if found in the electionWinners
     */
    function _isInElectionWinners(uint256 _candidateId) internal view returns (bool){

        for(uint8 i = 0; i < electionWinners.length; ++i){
            if(_candidateId == electionWinners[i]) return true;
        }
        return false;
    }

    /**
        @notice Internal function which returns the number of votes of the last candidate in the electionWinners
        @return Votes of candidate that is in last place
     */
    function _getLastPlaceVotes() internal view returns (uint256){

        uint256 length = electionWinners.length;
        return length > 0 ? candidates[electionWinners[length-1]].votes : 0;
    }

    /**
        @notice Internal function which inserts a candidate in the electionWinners
        @param _candidateId ID of the Candidate to be inserted
     */
    function _insertIntoElectionWinners(uint256 _candidateId) internal {

        uint256 length = electionWinners.length;
        if(length < ELECTION_WINNERS_LENGTH){
             electionWinners.push(_candidateId);
        } else {
            electionWinners[ELECTION_WINNERS_LENGTH-1] = _candidateId;
        }
    }
}
