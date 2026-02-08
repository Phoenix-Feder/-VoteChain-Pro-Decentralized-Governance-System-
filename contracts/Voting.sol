// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

contract Voting {
    address public admin;
    uint public electionCount;

    struct Election {
        string name;
        uint startDate; 
        uint endDate;   
        bool active;
    }

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    mapping(uint => Election) public elections;
    mapping(uint => mapping(uint => Candidate)) private candidates;
    mapping(uint => uint) public candidateCount;
    mapping(uint => mapping(address => Voter)) public voters;
    mapping(uint => address[]) private voterList;

    event ElectionCreated(uint electionId, string name);
    event ElectionDeleted(uint electionId);
    event CandidateAdded(uint electionId, uint candidateId, string name);
    event VoterRegistered(uint electionId, address voter);
    event VoteCast(uint electionId, uint candidateId, address voter);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    function createElection(string memory _name, uint _startDate, uint _endDate) public onlyAdmin {
        require(_startDate < _endDate, "Invalid date range");
        electionCount++;
        elections[electionCount] = Election({
            name: _name,
            startDate: _startDate,
            endDate: _endDate,
            active: true
        });
        emit ElectionCreated(electionCount, _name);
    }

    function deleteElection(uint _electionId) public onlyAdmin {
        require(elections[_electionId].active, "Already inactive");
        elections[_electionId].active = false;
        emit ElectionDeleted(_electionId);
    }

    function addCandidate(uint _electionId, string memory _name) public onlyAdmin {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(elections[_electionId].active, "Election inactive");
        require(block.timestamp < elections[_electionId].endDate, "Election ended");

        candidateCount[_electionId]++;
        candidates[_electionId][candidateCount[_electionId]] = Candidate(candidateCount[_electionId], _name, 0);
        emit CandidateAdded(_electionId, candidateCount[_electionId], _name);
    }

    function registerVoter(uint _electionId, address _voter) public onlyAdmin {
        require(elections[_electionId].active, "Election inactive");
        require(!voters[_electionId][_voter].isRegistered, "Already registered");

        voters[_electionId][_voter] = Voter(true, false);
        voterList[_electionId].push(_voter);
        emit VoterRegistered(_electionId, _voter);
    }

    function vote(uint _electionId, uint _candidateId) public {
        Election memory e = elections[_electionId];
        require(e.active, "Election inactive");
        require(block.timestamp >= e.startDate, "Not started");
        require(block.timestamp <= e.endDate, "Ended");

        Voter storage v = voters[_electionId][msg.sender];
        require(v.isRegistered, "Not registered");
        require(!v.hasVoted, "Already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount[_electionId], "Invalid candidate");

        v.hasVoted = true;
        candidates[_electionId][_candidateId].voteCount++;
        emit VoteCast(_electionId, _candidateId, msg.sender);
    }

    function getElections() public view returns (uint[] memory, string[] memory) {
        uint[] memory ids = new uint[](electionCount);
        string[] memory names = new string[](electionCount);
        for (uint i = 1; i <= electionCount; i++) {
            ids[i - 1] = i;
            names[i - 1] = elections[i].name;
        }
        return (ids, names);
    }

    function getCandidates(uint _electionId) public view returns (Candidate[] memory) {
        uint count = candidateCount[_electionId];
        Candidate[] memory list = new Candidate[](count);
        for (uint i = 1; i <= count; i++) {
            list[i - 1] = candidates[_electionId][i];
        }
        return list;
    }

    function getRegisteredVoters(uint _electionId) public view returns (address[] memory) {
        return voterList[_electionId];
    }
}