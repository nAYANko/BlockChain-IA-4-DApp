# ChainAid — Community Aid DApp

ChainAid is an educational decentralized application for community aid requests. A requester publishes a need and a funding goal; donors can contribute ETH directly to the request creator. Request details, funding progress, and transaction events are recorded on an Ethereum-compatible blockchain.

## Features

- Solidity smart contract with constructor, validation, events, and request lifecycle.
- HTML/CSS/JavaScript responsive frontend.
- MetaMask wallet connection using ethers.js v6.
- Create aid requests, donate ETH, cancel eligible requests, and retrieve/display on-chain request data.
- Validation for empty fields, zero goals/donations, overfunding, inactive requests, unknown IDs, and unauthorized cancellation.

## Project structure

```text
ChainAid-DApp/
├── contracts/ChainAid.sol
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── tests/test-cases.md
├── evidence/                 # Add your real screenshots here
└── README.md
```

## 1. Deploy with Remix and Ganache

1. Start Ganache and create a local Ethereum workspace. Note the RPC URL, chain ID, and test accounts.
2. Open [Remix IDE](https://remix.ethereum.org/) and create `ChainAid.sol`; paste in `contracts/ChainAid.sol`.
3. In **Solidity Compiler**, select compiler `0.8.20` or a compatible `0.8.x` compiler and compile.
4. In **Deploy & Run Transactions**, select **Injected Provider - MetaMask** after connecting MetaMask to your Ganache network, or use Remix VM for initial contract tests.
5. Deploy `ChainAid`. The deployer becomes `owner` (the current implementation does not restrict normal use to the owner).
6. Copy the deployed contract address.

### Connect MetaMask to Ganache

Add a network in MetaMask using the RPC URL and chain ID shown by your Ganache instance. Import a Ganache test account only for local testing, using its private key in MetaMask. **Never use a real wallet's seed phrase/private key or upload any key to GitHub.** Do not use test account keys outside the local development environment.

## 2. Configure and run the frontend

1. Open `frontend/app.js`.
2. Set `CONTRACT_ADDRESS` to the address deployed in the same network selected in MetaMask.
3. Serve the `frontend` directory over localhost (recommended; avoid opening `index.html` as a `file://` URL). For example, from the repository root:

   ```bash
   python -m http.server 8000 --directory frontend
   ```

4. Visit `http://localhost:8000` in a browser with MetaMask installed.
5. Click **Connect MetaMask**, approve the connection, and create or donate to a request. Confirm transactions in MetaMask.
6. Ensure MetaMask is on the same chain where the contract was deployed. Re-deploy and update the address if the local chain is reset.

## 3. How to use

- **Create request:** Enter a title (1–80 characters), description (1–500 characters), and positive ETH goal; submit and confirm the transaction.
- **Donate:** Enter a positive ETH amount and confirm. Donations are transferred directly to the requester's wallet; the contract records the contribution and updates raised funds.
- **Cancel:** The requester can cancel only while the request has received no donations.
- **Read data:** The UI fetches all requests from the deployed contract and displays status, goal, amount raised, and requester.

## Contract behavior and security notes

- Request IDs start at 1.
- Donations cannot exceed the remaining goal. A request is marked fulfilled when its goal is met.
- Requests are public and immutable except for status changes; avoid posting sensitive personal information.
- This is a coursework prototype, not audited software. Test only with local/test-network funds.
- The `owner` variable is recorded for assignment coverage; no owner-only privileged operation is included.
- ETH is forwarded to the requester in the same transaction. A failed transfer reverts the donation and state updates.

## 4. Test cases

See [`tests/test-cases.md`](tests/test-cases.md) for valid, invalid, and unauthorized test scenarios. Execute them in Remix with separate test accounts. Record actual results; do not report planned tests as executed.

## 5. Evidence checklist

Save genuine screenshots in `evidence/` and reference them here after testing:

- [ ] `01-compile.png` — Remix compiler shows successful compilation.
- [ ] `02-deploy.png` — deployed contract and address.
- [ ] `03-metamask.png` — connected wallet/network (hide sensitive details).
- [ ] `04-successful-transaction.png` — successful request creation or donation.
- [ ] `05-failed-transaction.png` — rejected/reverted invalid or unauthorized operation.
- [ ] `06-ui-blockchain-data.png` — frontend showing data retrieved from the contract.

Deployment details to fill in after you deploy:

- Network: **[Ganache / test network name]**
- Chain ID: **[fill in]**
- Contract address: **[fill in]**
- Deployment transaction hash: **[fill in]**
- Test date: **[fill in]**

## 6. Submission

Upload the source, frontend, test results, deployment details, and genuine screenshots to your GitHub repository. Include the repository URL in the required Word/PDF submission document. Do not commit private keys, seed phrases, `.env` files, or credentials.
