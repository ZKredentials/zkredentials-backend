// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZKredentialsGitHub is ERC721 {
    // Mapping to store user's IPFS URL
    mapping(address => string) private _tokenURIs;
    // Mapping to store user registration status
    mapping(address => bool) private _registered;

    event Registered(address indexed user);
    event TokenURIUpdated(address indexed user, string tokenURI);
    constructor() ERC721("ZKredentials GitHub", "ZKG") {}

    function mint(address to, uint256 tokenId) public {
        // Users can only have 1 NFT
        require(!_registered[msg.sender], "User already registered");
        _safeMint(to, tokenId);
    }

    function register() external {
        // Users can only have 1 NFT
        require(!_registered[msg.sender], "User already registered");
        _registered[msg.sender] = true;
        emit Registered(msg.sender);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[msg.sender] = _tokenURI;
        emit TokenURIUpdated(msg.sender, _tokenURI);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory _tokenURI = _tokenURIs[msg.sender];
        return _tokenURI;
    }
}
