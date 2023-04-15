import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { ZKredentialsGitHub } from '../typechain';
const { expect } = require('chai');

describe('ZKredentialsWorldID', function () {
  let ZKredentialsWorldID;
  let zkWorldID: ZKredentialsGitHub;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs;

  beforeEach(async () => {
    ZKredentialsWorldID = await ethers.getContractFactory('ZKredentialsWorldID');
    [owner, user1, addr1, addr2, ...addrs] = await ethers.getSigners();
    zkWorldID = await ZKredentialsWorldID.deploy();
    await zkWorldID.deployed();
  });

  it('should deploy the contract and set the correct name and symbol', async () => {
    const name = await zkWorldID.name();
    const symbol = await zkWorldID.symbol();
    expect(name).to.equal('ZKredentials WorldID');
    expect(symbol).to.equal('ZKWID');
  });

  it('should mint an NFT and set the correct tokenURI', async () => {
    const cid = 'Qmabc123';
    await zkWorldID.connect(user1).mint(cid);

    const tokenURI = await zkWorldID.connect(user1)['tokenURI()']();
    expect(tokenURI).to.equal(`ipfs://${cid}/`);
  });

  it('should emit Registered event when a user registers', async () => {
    const cid = 'Qmabc123';
    await expect(zkWorldID.connect(user1).mint(cid)).to.emit(zkWorldID, 'Registered').withArgs(user1.address);
  });

  it('should emit TokenURIUpdated event when the tokenURI is updated', async () => {
    const cid = 'Qmabc123';
    await zkWorldID.connect(user1).mint(cid);

    const newCid = 'Qmdef456';
    await expect(zkWorldID.connect(user1).setTokenURI(newCid))
      .to.emit(zkWorldID, 'TokenURIUpdated')
      .withArgs(user1.address, `ipfs://${newCid}/`);
  });

  it('should not allow a user to register more than once', async () => {
    const cid = 'Qmabc123';
    await zkWorldID.connect(user1).mint(cid);

    await expect(zkWorldID.connect(user1).mint(cid)).to.be.revertedWith('User already registered');
  });
});
