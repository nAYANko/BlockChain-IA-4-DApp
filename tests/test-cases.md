# ChainAid test plan

Run these tests against a fresh deployment in Remix + Ganache or a test network. Use separate Ganache accounts for requester, donor, and an unrelated account. Capture screenshots and record actual transaction hashes/results before submission.

| ID | Scenario | Steps / input | Expected result |
|---|---|---|---|
| T01 | Valid request | Create title `School supplies`, description `Books for students`, goal `1 ether` | Transaction succeeds; request count increments; request is shown in UI |
| T02 | Empty title | Call `createRequest("", "Need", 1 ether)` | Reverts: `Title must be 1-80 chars` |
| T03 | Empty description | Call `createRequest("Need", "", 1 ether)` | Reverts: `Description must be 1-500 chars` |
| T04 | Zero goal | Call `createRequest("Need", "Description", 0)` | Reverts: `Goal must be greater than zero` |
| T05 | Valid donation | Donate `0.1 ether` to active request with enough goal remaining | Transaction succeeds; raised amount and donor contribution update |
| T06 | Zero donation | Call `donate(id)` with no ETH | Reverts: `Donation must be greater than zero` |
| T07 | Over-goal donation | Donate more than the remaining goal | Reverts: `Donation exceeds remaining goal` |
| T08 | Unknown request | Call `getRequest(999)` on deployment with fewer requests | Reverts: `Request does not exist` |
| T09 | Unauthorised cancellation | Account other than requester calls `cancelRequest(id)` | Reverts: `Only requester can cancel` |
| T10 | Cancellation after donation | Requester calls `cancelRequest(id)` after a donation | Reverts: `Cannot cancel after donations` |
| T11 | Exact funding goal | Donate remaining amount to reach goal | Request becomes fulfilled and no longer accepts donations |
| T12 | Donation after closure | Donate to fulfilled/cancelled request | Reverts: `Request is not active` |

**Important:** These are planned test cases and expected outcomes, not claimed execution results. Replace this note with observed results and transaction hashes after running tests.
