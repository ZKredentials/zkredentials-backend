// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ZKredentialsERC721 is ERC721 {
    // Mapping to store user's IPFS URL
    mapping(uint256 => string) private _tokenURIs;
    // Mapping to store user registration status
    mapping(uint256 => bool) private _registered;

    constructor() ERC721("ZKredentials", "ZKC") {}

    function mint(address to, uint256 tokenId) public {
        // Users can only have 1 NFT
        require(!_registered[tokenId], "User already registered");
        _safeMint(to, tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI set of nonexistent token"
        );
        _tokenURIs[tokenId] = _tokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory _tokenURI = _tokenURIs[tokenId];
        return _tokenURI;
    }
}
