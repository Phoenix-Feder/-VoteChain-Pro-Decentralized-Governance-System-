// ===============================
// PROVIDER (Ganache)
// ===============================
const provider = new ethers.providers.JsonRpcProvider(
  "http://127.0.0.1:7545"
);

// ===============================
// CONTRACT DETAILS
// ===============================
const CONTRACT_ADDRESS = "0xc710b085cE5E0a1E854F00aE456898F40407228e";
const ADMIN_ADDRESS = "0xC92dD829502E98df4014676836f97aeFcdEc25E3";

const ABI = [
  "function admin() view returns (address)",
  "function elections(uint256) view returns (string,uint256,uint256,bool)",
  "function createElection(string,uint256,uint256)",
  "function deleteElection(uint256)",
  "function addCandidate(uint256,string)",
  "function registerVoter(uint256,address)",
  "function vote(uint256,uint256)",
  "function getElections() view returns (uint256[],string[])",
  "function getCandidates(uint256) view returns (tuple(uint256 id,string name,uint256 voteCount)[])",
  "function getRegisteredVoters(uint256) view returns (address[])",
  "event VoteCast(uint256,uint256,address)"
];

let contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

// ===============================
// STATE
// ===============================
let adminWallet = null;
let voterAddress = null;
let chartInstance = null;

// ===============================
// HELPERS
// ===============================
function output(msg) {
  const el = document.getElementById("output");
  if (el) el.innerText = msg;
}

function startOfDay(dateStr) {
  return Math.floor(new Date(dateStr + "T00:00:00").getTime() / 1000);
}

function endOfDay(dateStr) {
  return Math.floor(new Date(dateStr + "T23:59:59").getTime() / 1000);
}

// ===============================
// ADMIN LOGIN
// ===============================
async function adminLogin() {
  try {
    const pk = adminPrivateKey.value.trim();
    const wallet = new ethers.Wallet(pk, provider);

    if (wallet.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
      return output("❌ Not admin");

    if ((await contract.admin()).toLowerCase() !== wallet.address.toLowerCase())
      return output("❌ Contract admin mismatch");

    adminWallet = wallet;
    contract = contract.connect(wallet);
    adminPanel.style.display = "block";

    output("✅ Admin authenticated");
  } catch (e) {
    output("❌ Admin login failed");
  }
}

// ===============================
// ADMIN ACTIONS
// ===============================
async function createElection() {
  const name = electionName.value;
  const start = startOfDay(startDate.value);
  const end = endOfDay(endDate.value);

  await (await contract.createElection(name, start, end)).wait();
  output("✅ Election created");
}

async function addCandidate() {
  const id = electionId.value;
  const e = await contract.elections(id);
  if (Date.now() / 1000 >= e[1]) {
    return output("⚠️ Election already started");
  }

  await (await contract.addCandidate(id, candidateName.value)).wait();
  output("✅ Candidate added");
}

async function registerVoter() {
  await (await contract.registerVoter(
    electionId.value,
    voterRegister.value
  )).wait();
  output("✅ Voter registered");
}

async function deleteElection() {
  const e = await contract.elections(electionId.value);
  if (!e[3]) return output("⚠️ Already inactive");

  await (await contract.deleteElection(electionId.value)).wait();
  output("✅ Election deleted");
}

// ===============================
// ADMIN VIEWS
// ===============================
async function showCandidates() {
  const list = await contract.getCandidates(electionId.value);
  let txt = "Candidates:\n";
  list.forEach(c => txt += `${c.id}. ${c.name} → ${c.voteCount}\n`);
  output(txt);
  drawChart(list);
}

async function showVoters() {
  const v = await contract.getRegisteredVoters(electionId.value);
  output("Voters:\n" + v.join("\n"));
}

// ===============================
// VOTER LOGIN
// ===============================
function voterLogin() {
  voterAddress = voterLoginAddress.value.trim().toLowerCase();
  voterPanel.style.display = "block";
  output("✅ Voter logged in");
}

// ===============================
// VOTING
// ===============================
async function castVote() {
  const wallet = new ethers.Wallet(voterPrivateKey.value, provider);
  if (wallet.address.toLowerCase() !== voterAddress)
    return output("❌ Key mismatch");

  await (await contract
    .connect(wallet)
    .vote(voteElectionId.value, voteCandidateId.value)).wait();

  output("✅ Vote recorded on blockchain");
  showCandidates();
}

// ===============================
// CHART (SAFE)
// ===============================
function drawChart(candidates) {
  const canvas = document.getElementById("resultsChart");
  if (!canvas) return;

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: candidates.map(c => c.name),
      datasets: [{
        label: "Votes",
        data: candidates.map(c => Number(c.voteCount)),
        backgroundColor: "#6366f1"
      }]
    },
    options: {
      scales: { y: { beginAtZero: true } }
    }
  });
}