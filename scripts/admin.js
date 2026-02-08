async function main() {
  const [admin] = await ethers.getSigners();

  const votingAddress = "0x5a880ea878cdaE754d7CFfBdC17F080CcE2f9820";
  const Voting = await ethers.getContractFactory("Voting");
  const voting = Voting.attach(votingAddress);

  // Add candidates
  await voting.addCandidate("Alice");
  await voting.addCandidate("Bob");

  console.log("Candidates added");

  // Register voters (use Ganache accounts)
  const accounts = await ethers.getSigners();
  await voting.registerVoter(accounts[1].address);
  await voting.registerVoter(accounts[2].address);

  console.log("Voters registered");

  // Start election
  await voting.startElection();
  console.log("Election started");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});