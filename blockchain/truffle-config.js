/**
 * Truffle Configuration for Microfinance Platform
 * 
 * Supports:
 *   - Ganache (local development)
 *   - Polygon Amoy Testnet (public demo / hackathon)
 * 
 * Deploy to Amoy: truffle migrate --network amoy
 * Deploy to local: truffle migrate --network development
 */

require('dotenv').config({ path: '../backend/.env' });
const HDWalletProvider = require('@truffle/hdwallet-provider');

const PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;
// Use WebSocket URL for deployment (avoids HTTP timeout issues)
// HTTPS URL works for reading, but WebSocket keeps persistent connection for tx confirmation
const AMOY_RPC_URL = process.env.POLYGON_AMOY_WSS_URL
  || (process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology')
    .replace('https://', 'wss://');

module.exports = {
  networks: {
    // ─────────────────────────────────────────
    // LOCAL DEVELOPMENT (Ganache)
    // ─────────────────────────────────────────
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000  // 20 gwei
    },

    // Alternative Ganache CLI port
    ganache_cli: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 6721975,
      gasPrice: 20000000000
    },

    // ─────────────────────────────────────────
    // POLYGON AMOY TESTNET
    // Chain ID: 80002
    // Explorer: https://amoy.polygonscan.com
    // Faucet: https://faucet.polygon.technology
    // ─────────────────────────────────────────
    amoy: {
      provider: () => {
        if (!PRIVATE_KEY) {
          throw new Error('❌ PLATFORM_WALLET_PRIVATE_KEY not set in backend/.env');
        }
        return new HDWalletProvider({
          privateKeys: [PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY.slice(2) : PRIVATE_KEY],
          providerOrUrl: AMOY_RPC_URL,
          pollingInterval: 8000  // poll every 8s instead of default 4s
        });
      },
      network_id: 80002,
      gas: 3000000,           // enough for contract deployment
      // gasPrice not set → Web3 auto-fetches live price from network
      confirmations: 1,
      timeoutBlocks: 500,
      skipDryRun: true,
      networkCheckTimeout: 60000
    }
  },

  /**
   * Compiler configuration
   * Solidity version must match the contract pragma
   */
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "paris"
      }
    }
  },

  db: {
    enabled: false
  },

  contracts_build_directory: "./build/contracts",

  mocha: {
    timeout: 100000
  }
};
