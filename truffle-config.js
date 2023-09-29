require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');
const privateKey = process.env.PRIVATE_KEY;
module.exports = {
  networks: {
    matic: {
      provider: () => new HDWalletProvider(privateKey, `https://rpc.ankr.com/polygon/${process.env.ANKR_API_KEY}`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      gas: 24354410,
      gasPrice: 80000000000,
      skipDryRun: true
    },
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 30000000,
    },
  },

  mocha: {
    timeout: 100000
  },

  compilers: {
    solc: {
      version: "0.8.13",
    }
  },

  db: {
    enabled: false,
  }
};
