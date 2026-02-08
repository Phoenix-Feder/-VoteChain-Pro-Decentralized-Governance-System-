async function main() {
  const votingAddress = "0x5a880ea878cdaE754d7CFfBdC17F080CcE2f9820";

  const Voting = await ethers.getContractFactory("Voting");
  const voting = Voting.attach(votingAddress);

  const result = await voting.getResults();

  const ids = result[0];
  const names = result[1];
  const votes = result[2];

  console.log("Election Results:");
  for (let i = 0; i < ids.length; i++) {
    console.log(`${names[i]} (ID ${ids[i]}): ${votes[i]} vote(s)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});