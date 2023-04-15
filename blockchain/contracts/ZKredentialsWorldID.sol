// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZKredentialsWorldID is ERC721 {
    // Mapping to store user's IPFS URL
    mapping(address => string) private _tokenURIs;
    // Mapping to store user registration status
    mapping(address => bool) private _registered;
    uint256 public tokenId = 1;
    event Registered(address indexed user);
    event TokenURIUpdated(address indexed user, string tokenURI);
    constructor() ERC721("ZKredentials WorldCoin", "ZKW") {}

    function mint(address to, string memory cid) external {
        // Users can only have 1 NFT
        register();
        setTokenURI(string(abi.encodePacked("ipfs://", cid, "/")));
        _safeMint(to, tokenId);
        tokenId++;
    }

    function register() internal {
        // Users can only have 1 NFT
        require(!_registered[msg.sender], "User already registered");
        _registered[msg.sender] = true;
        emit Registered(msg.sender);
    }

    function setTokenURI(string memory cid) public {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[msg.sender] = string(abi.encodePacked("ipfs://", cid, "/"));
        emit TokenURIUpdated(msg.sender, _tokenURIs[msg.sender]);
    }

    function tokenURI() public view returns (string memory) {
        string memory _tokenURI = _tokenURIs[msg.sender];
        return _tokenURI;
    }
}
