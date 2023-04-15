import "dotenv/config";

import { ethers } from "hardhat";

module.exports = async ({ getNamedAccounts, deployments, getChainId }: any) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("Verifier", {
    from: deployer,
    log: true,
    args: [],
  });
};

module.exports.tags = ["Verifier"];
