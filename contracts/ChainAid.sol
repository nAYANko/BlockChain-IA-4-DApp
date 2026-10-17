// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ChainAid - transparent community aid requests and donations
/// @notice A lightweight educational DApp for recording aid requests and donations on-chain.
contract ChainAid {
    struct Request {
        uint256 id;
        address payable requester;
        string title;
        string description;
        uint256 goalWei;
        uint256 raisedWei;
        uint256 createdAt;
        bool fulfilled;
        bool cancelled;
    }

    address public immutable owner;
    uint256 public requestCount;
    mapping(uint256 => Request) private requests;
    mapping(uint256 => mapping(address => uint256)) public donations;

    event RequestCreated(uint256 indexed id, address indexed requester, string title, uint256 goalWei);
    event DonationReceived(uint256 indexed id, address indexed donor, uint256 amountWei);
    event RequestFulfilled(uint256 indexed id, address indexed requester);
    event RequestCancelled(uint256 indexed id, address indexed requester);

    modifier validRequest(uint256 id) {
        require(id > 0 && id <= requestCount, "Request does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createRequest(
        string calldata title,
        string calldata description,
        uint256 goalWei
    ) external {
        require(bytes(title).length > 0 && bytes(title).length <= 80, "Title must be 1-80 chars");
        require(bytes(description).length > 0 && bytes(description).length <= 500, "Description must be 1-500 chars");
        require(goalWei > 0, "Goal must be greater than zero");

        requestCount++;
        requests[requestCount] = Request({
            id: requestCount,
            requester: payable(msg.sender),
            title: title,
            description: description,
            goalWei: goalWei,
            raisedWei: 0,
            createdAt: block.timestamp,
            fulfilled: false,
            cancelled: false
        });
        emit RequestCreated(requestCount, msg.sender, title, goalWei);
    }

    function donate(uint256 id) external payable validRequest(id) {
        Request storage r = requests[id];
        require(msg.value > 0, "Donation must be greater than zero");
        require(!r.fulfilled && !r.cancelled, "Request is not active");
        require(r.raisedWei + msg.value <= r.goalWei, "Donation exceeds remaining goal");

        r.raisedWei += msg.value;
        donations[id][msg.sender] += msg.value;
        (bool sent, ) = r.requester.call{value: msg.value}("");
        require(sent, "Transfer failed");
        emit DonationReceived(id, msg.sender, msg.value);
        if (r.raisedWei == r.goalWei) {
            r.fulfilled = true;
            emit RequestFulfilled(id, r.requester);
        }
    }

    function cancelRequest(uint256 id) external validRequest(id) {
        Request storage r = requests[id];
        require(msg.sender == r.requester, "Only requester can cancel");
        require(r.raisedWei == 0, "Cannot cancel after donations");
        require(!r.fulfilled && !r.cancelled, "Request is not active");
        r.cancelled = true;
        emit RequestCancelled(id, msg.sender);
    }

    function getRequest(uint256 id) external view validRequest(id) returns (Request memory) {
        return requests[id];
    }

    function getAllRequests() external view returns (Request[] memory result) {
        result = new Request[](requestCount);
        for (uint256 i = 1; i <= requestCount; i++) {
            result[i - 1] = requests[i];
        }
    }
}
