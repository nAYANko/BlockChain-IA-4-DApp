/* ChainAid frontend. Set CONTRACT_ADDRESS after deployment and keep ABI in sync with ChainAid.sol. */
const CONTRACT_ADDRESS = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; // Paste deployed contract address here.
const ABI = [
  "function owner() view returns (address)",
  "function requestCount() view returns (uint256)",
  "function createRequest(string title,string description,uint256 goalWei)",
  "function donate(uint256 id) payable",
  "function cancelRequest(uint256 id)",
  "function getAllRequests() view returns (tuple(uint256 id,address requester,string title,string description,uint256 goalWei,uint256 raisedWei,uint256 createdAt,bool fulfilled,bool cancelled)[])",
  "function getRequest(uint256 id) view returns (tuple(uint256 id,address requester,string title,string description,uint256 goalWei,uint256 raisedWei,uint256 createdAt,bool fulfilled,bool cancelled))",
  "function donations(uint256,address) view returns (uint256)"
];
let provider, signer, contract, account;
const $ = (id) => document.getElementById(id);
const shortAddress = (address) => `${address.slice(0,6)}…${address.slice(-4)}`;
function setNotice(message, type="") { const el=$("notice"); el.textContent=message; el.className=`notice ${type}`.trim(); }
function ensureConfigured() { if (!CONTRACT_ADDRESS || !ethers.isAddress(CONTRACT_ADDRESS)) throw new Error("Contract address is not configured. Deploy ChainAid.sol, then paste its address into frontend/app.js."); }
async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask was not detected. Install the MetaMask browser extension and reload this page.");
  await window.ethereum.request({method:"eth_requestAccounts"});
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  account = await signer.getAddress();
  const network = await provider.getNetwork();
  $("walletShort").textContent=shortAddress(account);
  $("connectBtn").textContent=shortAddress(account);
  $("networkPill").textContent=`Chain ID ${network.chainId}`;
  $("networkPill").className="pill connected";
  const balance=await provider.getBalance(account);
  $("walletBalance").textContent=`${Number(ethers.formatEther(balance)).toFixed(4)} ETH balance`;
  ensureConfigured();
  contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  setNotice("Wallet connected. Blockchain data is ready.","success");
  await loadRequests();
}
function active(r) { return !r.fulfilled && !r.cancelled; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function requestCard(r) {
  const id=Number(r.id), goal=BigInt(r.goalWei), raised=BigInt(r.raisedWei);
  const percent=goal===0n?0:Number(raised*10000n/goal)/100;
  const open=active(r);
  const status=r.fulfilled?"Funded":r.cancelled?"Cancelled":"Active";
  const goalEth=Number(ethers.formatEther(goal)), raisedEth=Number(ethers.formatEther(raised));
  const own=account && r.requester.toLowerCase()===account.toLowerCase();
  return `<article class="request-card">
    <div class="request-top"><span class="request-id">REQUEST #${id.toString().padStart(3,"0")}</span><span class="status ${open?"":"closed"}">${status}</span></div>
    <h3>${escapeHtml(r.title)}</h3><p class="description">${escapeHtml(r.description)}</p>
    <div class="progress-label"><span>${raisedEth.toFixed(5)} ETH raised</span><span>${Math.min(percent,100).toFixed(0)}%</span></div>
    <div class="progress"><span style="width:${Math.min(percent,100)}%"></span></div>
    <div class="request-meta"><span>Goal ${goalEth.toFixed(5)} ETH</span><span>By ${shortAddress(r.requester)}</span></div>
    ${open?`<div class="donate-row"><input id="donate-${id}" type="number" min="0.000000000000000001" step="any" placeholder="Amount in ETH" aria-label="Donation amount in ETH"/><button class="btn btn-dark" data-donate="${id}">Donate ↗</button></div>`:""}
    ${own && open?`<button class="btn btn-outline" style="margin-top:9px" data-cancel="${id}">Cancel request</button>`:""}
  </article>`;
}
async function loadRequests() {
  try {
    ensureConfigured();
    if (!contract) {
      if (!window.ethereum) throw new Error("Connect MetaMask to read contract data.");
      provider = provider || new ethers.BrowserProvider(window.ethereum);
      contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer || provider);
    }
    const list=await contract.getAllRequests();
    $("requestCount").textContent=String(list.length);
    $("activeCount").textContent=String(list.filter(active).length);
    $("requestsGrid").innerHTML=list.length?list.slice().reverse().map(requestCard).join(""):`<div class="empty-state"><span class="empty-icon">✳</span><h3>No requests yet</h3><p>Be the first to publish a community aid request.</p></div>`;
  } catch(e) {
    $("requestCount").textContent="—"; $("activeCount").textContent="—";
    if (!CONTRACT_ADDRESS) setNotice("Setup needed: deploy the contract, then paste its address into frontend/app.js.", "");
    else setNotice(e.shortMessage || e.message || "Could not load requests.", "error");
  }
}
$("connectBtn").addEventListener("click", async()=>{try{await connectWallet()}catch(e){setNotice(e.shortMessage||e.message||"Wallet connection failed.","error")}});
$("refreshBtn").addEventListener("click",loadRequests);
$("createForm").addEventListener("submit",async(e)=>{
  e.preventDefault();
  try{
    if(!signer || !contract) await connectWallet();
    const title=$("title").value.trim(), description=$("description").value.trim(), goal=$("goal").value.trim();
    if(!title || !description || !goal || Number(goal)<=0) throw new Error("Enter a title, description, and positive ETH goal.");
    setNotice("Confirm the request transaction in MetaMask…");
    const tx=await contract.createRequest(title,description,ethers.parseEther(goal));
    setNotice(`Transaction submitted: ${tx.hash}. Waiting for confirmation…`);
    await tx.wait(); $("createForm").reset(); setNotice("Request published successfully on-chain.","success"); await loadRequests();
  }catch(e){setNotice(e.shortMessage||e.reason||e.message||"Transaction failed.","error")}
});
$("requestsGrid").addEventListener("click",async(e)=>{
  const donateId=e.target?.dataset?.donate, cancelId=e.target?.dataset?.cancel;
  try{
    if(!signer || !contract) await connectWallet();
    if(donateId){
      const amount=$(`donate-${donateId}`).value;
      if(!amount || Number(amount)<=0) throw new Error("Enter a donation amount greater than zero.");
      setNotice("Confirm the donation in MetaMask…");
      const tx=await contract.donate(donateId,{value:ethers.parseEther(amount)});
      setNotice(`Transaction submitted: ${tx.hash}. Waiting for confirmation…`);
      await tx.wait(); setNotice("Donation confirmed on-chain. Thank you.","success"); await loadRequests();
    }else if(cancelId){
      if(!confirm("Cancel this request? It can only be cancelled if it has received no donations.")) return;
      const tx=await contract.cancelRequest(cancelId); setNotice("Waiting for cancellation confirmation…"); await tx.wait();
      setNotice("Request cancelled on-chain.","success"); await loadRequests();
    }
  }catch(err){setNotice(err.shortMessage||err.reason||err.message||"Transaction failed.","error")}
});
if(window.ethereum){
  window.ethereum.on?.("accountsChanged",()=>location.reload());
  window.ethereum.on?.("chainChanged",()=>location.reload());
}
