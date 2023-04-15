import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';
import 'solidity-docgen';
import 'hardhat-deploy';

import { task } from 'hardhat/config';

// import '@graphprotocol/hardhat-graph';

let ethers = require('ethers');
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('new:wallet', 'Generate New Wallet', async (taskArgs, hre) => {
  const wallet = ethers.Wallet.createRandom();
  console.log('PK: ', wallet._signingKey().privateKey);
  console.log('Address: ', wallet.address);
});
// Setup Default Values
let PRIVATE_KEY;
if (process.env.PRIVATE_KEY) {
  PRIVATE_KEY = process.env.PRIVATE_KEY;
} else {
  console.log('⚠️ Please set PRIVATE_KEY in the .env file');
  PRIVATE_KEY = ethers.Wallet.createRandom()._signingKey().privateKey;
}

let PRIVATE_KEY_TESTNET;
if (process.env.PRIVATE_KEY_TESTNET) {
  PRIVATE_KEY_TESTNET = process.env.PRIVATE_KEY_TESTNET;
} else {
  console.log('⚠️ Please set PRIVATE_KEY_TESTNET in the .env file');
  PRIVATE_KEY_TESTNET = ethers.Wallet.createRandom()._signingKey().privateKey;
}

if (!process.env.INFURA_API_KEY) {
  console.log('⚠️ Please set INFURA_API_KEY in the .env file');
}

if (!process.env.ETHERSCAN_API_KEY) {
  console.log('⚠️ Please set ETHERSCAN_API_KEY in the .env file');
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    localhost: {
      url: 'http://0.0.0.0:8545',
      saveDeployments: true,
      // accounts: [PRIVATE_KEY],
    },
    hardhat: {
      blockGasLimit: 10000000000,
      mining: {
        auto: true,
      },
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 1,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 4,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 5,
      accounts: [PRIVATE_KEY_TESTNET],
      saveDeployments: true,
      gasPrice: 52071155694,
    },
    matic: {
      url: 'https://nd-178-050-667.p2pify.com/6de244435837d2e254f9dacadc307f19',
      chainId: 137,
      accounts: [PRIVATE_KEY],
      maxFeePerGas: 500000000000,
      maxPriorityFeePerGas: 40000000000,
    },
    gnosis: {
      url: 'https://rpc.gnosischain.com',
      chainId: 100,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      chainId: 80001,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    optimism_mainnet: {
      url: 'https://dry-silent-needle.optimism.discover.quiknode.pro/e512f6275a66375bec37ad953e978957d491a8d5/',
      chainId: 10,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    optimism_testnet: {
      url: 'https://goerli.optimism.io',
      chainId: 420,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    arbitrum_mainnet: {
      url: 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    arbitrum_testnet: {
      url: 'https://rinkeby.arbitrum.io/rpc',
      chainId: 421611,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    scroll_testnet: {
      url: 'https://alpha-rpc.scroll.io/l2',
      chainId: 534353,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    metis_testnet: {
      url: 'https://goerli.gateway.metisdevops.link',
      chainId: 599,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    base_testnet: {
      url: 'https://goerli.base.org',
      chainId: 84531,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
    mantle_testnet: {
      url: 'https://rpc.testnet.mantle.xyz',
      chainId: 5001,
      accounts: [PRIVATE_KEY],
      saveDeployments: true,
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.15',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.8.11',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
    treasury: {
      default: 1, // here this will by default take the second account as treasury
    },
  },
  etherscan: {
    apiKey: {
      mumbai: process.env.POLYGONSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
    deploy: './deploy',
  },
  mocha: {
    timeout: 2000000000,
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: true,
    gasPrice: 100,
  },
};
