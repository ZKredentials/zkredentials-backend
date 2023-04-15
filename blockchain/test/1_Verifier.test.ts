import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Verifier } from '../typechain';
import { deployments, ethers } from 'hardhat';

const { expect } = require('chai');

describe('Verifier', function () {
  let verifier: Verifier;
  let owner: SignerWithAddress;

  beforeEach(async () => {
    let VerifierFact = await ethers.getContractFactory('Verifier');
    [owner] = await ethers.getSigners();
    verifier = await VerifierFact.deploy();
    await verifier.deployed();
  });

  it('should be able to call verifyProof', async () => {
    let proof =
      '{"proof":{"pi_a":["12590093758044893063480613487932346761383462951727691844239245293228549731921","5372461870089260763522225338566809917751583158160963148825840631922572729779","1"],"pi_b":[["7881726153206779055917326231377654683383282357983983603175452106248528367447","17933661734883379302270451070475572104789250754926990169394697390386678526358"],["21375473272920787686581596239527966172540791366519265531602360487131293947745","10460425762632033783736766720155512670058482612301031972022021864713233327686"],["1","0"]],"pi_c":["1390017451587477485931672316437491427775469394725208568794421543054395009188","12170763139629044255950212621884406597833702713931514590555445558510680465652","1"],"protocol":"groth16","curve":"bn128"},"publicSignals":["22"]}';
    // Parse json
    proof = JSON.parse(proof);
    let a = proof.proof.pi_a;
    // Remove last element from a
    a.pop();
    // Transform all elements to BigNumber
    //a = a.map((element: string) => BigNumber.from(element));

    console.log(a);
    let b = proof.proof.pi_b;
    // Remove last array from b
    b.pop();
    // Transform all elements to BigNumber
    //b = b.map((element: string[]) => element.map((element: string) => BigNumber.from(element)));
    console.log(b);
    let c = proof.proof.pi_c;
    // Remove last element from c
    c.pop();
    // Transform all elements to BigNumber
    // c = c.map((element: string) => BigNumber.from(element));
    console.log(c);
    let publicSignals = proof.publicSignals;
    // Transform all elements to BigNumber
    //publicSignals = publicSignals.map((element: string) => BigNumber.from(element));
    let tx = await verifier.verifyProof(a, b, c, [1]);
    console.log(tx);
  });
});
