import "dotenv/config";

import { ethers } from "hardhat";

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("ZKredentialsWorldCoin", {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ["ZKredentials"];
