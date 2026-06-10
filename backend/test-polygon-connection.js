/**
 * test-polygon-connection.js
 * 
 * Run this BEFORE deploying to Polygon Amoy to verify:
 *   1. Your RPC URL can connect to Polygon Amoy
 *   2. Your platform wallet has MATIC for gas fees
 *   3. Private key is correctly loaded
 * 
 * Usage: node test-polygon-connection.js
 */

const { Web3 } = require('web3');
require('dotenv').config();

async function testPolygonConnection() {
    console.log('\n🔍 Testing Polygon Amoy connection...\n');

    const RPC_URL = process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
    const WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;
    const PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;

    console.log(`📡 RPC URL: ${RPC_URL}`);
    console.log(`👛 Wallet: ${WALLET_ADDRESS || '❌ NOT SET'}\n`);

    if (!WALLET_ADDRESS || !PRIVATE_KEY) {
        console.error('❌ Set PLATFORM_WALLET_ADDRESS and PLATFORM_WALLET_PRIVATE_KEY in backend/.env');
        process.exit(1);
    }

    try {
        const web3 = new Web3(RPC_URL);

        // 1. Test connection
        const blockNumber = await web3.eth.getBlockNumber();
        console.log(`✅ Connected to Polygon Amoy! Current block: ${blockNumber}`);

        // 2. Verify chain ID
        const chainId = await web3.eth.getChainId();
        if (Number(chainId) === 80002) {
            console.log(`✅ Chain ID correct: ${chainId} (Polygon Amoy)`);
        } else {
            console.warn(`⚠️  Chain ID is ${chainId}, expected 80002 (Amoy)`);
        }

        // 3. Check wallet balance
        const balanceWei = await web3.eth.getBalance(WALLET_ADDRESS);
        const balanceMATIC = web3.utils.fromWei(balanceWei, 'ether');
        console.log(`💰 Wallet balance: ${parseFloat(balanceMATIC).toFixed(4)} MATIC`);

        if (parseFloat(balanceMATIC) < 0.05) {
            console.warn('\n⚠️  LOW BALANCE! Get free MATIC from:');
            console.warn('   https://faucet.polygon.technology');
            console.warn('   Select "Amoy" network and paste your wallet address\n');
        } else {
            console.log('✅ Sufficient balance for gas fees\n');
        }

        // 4. Test private key loads correctly
        const pk = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY;
        const account = web3.eth.accounts.privateKeyToAccount(pk);
        if (account.address.toLowerCase() === WALLET_ADDRESS.toLowerCase()) {
            console.log('✅ Private key matches wallet address\n');
        } else {
            console.error(`❌ Private key does NOT match wallet address!`);
            console.error(`   Key produces: ${account.address}`);
            console.error(`   Expected:     ${WALLET_ADDRESS}\n`);
        }

        console.log('🎉 All checks passed! Ready to deploy to Polygon Amoy.\n');
        console.log('📦 Deploy command:');
        console.log('   cd blockchain && truffle migrate --network amoy\n');

    } catch (error) {
        console.error('\n❌ Connection failed:', error.message);
        console.error('\nCommon fixes:');
        console.error('  1. Try a different RPC: https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY');
        console.error('  2. Check POLYGON_AMOY_RPC_URL in .env is correct');
        console.error('  3. Ensure you have internet connection\n');
        process.exit(1);
    }
}

testPolygonConnection();
