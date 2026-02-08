async function main() {
  const accounts = await ethers.getSigners();

  const voter1 = accounts[1];
  const voter2 = accounts[2];

  const votingAddress = "0x5a880ea878cdaE754d7CFfBdC17F080CcE2f9820";
  const Voting = await ethers.getContractFactory("Voting");
  const voting = Voting.attach(votingAddress);

  // voter1 votes for candidate 1 (Alice)
  await voting.connect(voter1).vote(1);
  console.log("Voter 1 voted for Alice");

  // voter2 votes for candidate 2 (Bob)
  await voting.connect(voter2).vote(2);
  console.log("Voter 2 voted for Bob");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});