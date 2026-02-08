async function main() {
  const Voting = await ethers.getContractFactory("Voting");
  const contract = await Voting.deploy();
  await contract.deployed();

  console.log("Voting deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});