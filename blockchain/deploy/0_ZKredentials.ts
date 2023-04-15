import 'dotenv/config';

import { ethers } from 'hardhat';

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy('ZKredentialsWorldID', {
    from: deployer,
    log: true,
    args: [],
  });
  await deploy('ZKredentialsGitHub', {
    from: deployer,
    log: true,
    args: [],
  });

  await deploy('ZKredentialsTwitter', {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ['ZKredentials'];
