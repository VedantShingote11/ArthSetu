/**
 * deploy-amoy.js - Manual deployment script for Polygon Amoy
 * Run from backend folder: node deploy-amoy.js
 *
 * Uses raw JSON-RPC over fetch to bypass ALL web3 timeout issues.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const RPC_URL = process.env.POLYGON_AMOY_RPC_URL;
const PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;
const WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY || !WALLET_ADDRESS) {
    console.error('❌ Missing env vars in .env');
    process.exit(1);
}

const contractPath = path.join(__dirname, '../blockchain/build/contracts/MicrofinanceLoan.json');
if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract not compiled. Run: cd ../blockchain && npx truffle compile');
    process.exit(1);
}
const { abi, bytecode } = JSON.parse(fs.readFileSync(contractPath, 'utf8'));

// ── Raw JSON-RPC call (no web3 timeout issues) ────────────────────
async function rpc(method, params = []) {
    const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    });
    const json = await res.json();
    if (json.error) throw new Error(`RPC ${method}: ${json.error.message}`);
    return json.result;
}

// ── Sign transaction with web3 (only for signing, not sending) ─────
async function signTx(txData) {
    const Web3Module = require('web3');
    const Web3 = typeof Web3Module === 'function' ? Web3Module : (Web3Module.Web3 || Web3Module.default);
    const web3 = new Web3(RPC_URL);
    const pk = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY;
    const signed = await web3.eth.accounts.signTransaction(txData, pk);
    return { rawTransaction: signed.rawTransaction, web3 };
}

// ── Manual receipt polling ─────────────────────────────────────────
async function waitForReceipt(txHash, maxWaitMs = 600000) {
    const start = Date.now();
    let attempt = 0;
    while (Date.now() - start < maxWaitMs) {
        attempt++;
        const elapsed = Math.round((Date.now() - start) / 1000);
        process.stdout.write(`\r   Waiting... attempt ${attempt} (${elapsed}s elapsed)`);
        await new Promise(r => setTimeout(r, 5000));
        const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
        if (receipt) {
            process.stdout.write('\n');
            return receipt;
        }
    }
    return null;
}

async function deploy() {
    console.log('\n🚀 Deploying MicrofinanceLoan to Polygon Amoy...\n');
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`👛 From: ${WALLET_ADDRESS}\n`);

    // Balance check
    const balanceHex = await rpc('eth_getBalance', [WALLET_ADDRESS, 'latest']);
    const balanceWei = BigInt(balanceHex);
    const balancePOL = Number(balanceWei) / 1e18;
    console.log(`💰 Balance: ${balancePOL.toFixed(4)} POL`);
    if (balancePOL < 0.01) {
        console.error('❌ Insufficient POL. Get some at: https://faucet.polygon.technology');
        process.exit(1);
    }

    // Nonce
    const nonceHex = await rpc('eth_getTransactionCount', [WALLET_ADDRESS, 'pending']);
    const nonce = parseInt(nonceHex, 16);
    console.log(`🔢 Nonce: ${nonce}`);

    // Gas price
    const gasPriceHex = await rpc('eth_gasPrice');
    const gasPrice = BigInt(gasPriceHex);
    const gasPriceGwei = Number(gasPrice) / 1e9;
    console.log(`⛽ Gas Price: ${gasPriceGwei.toFixed(2)} Gwei`);

    // Chain ID
    const chainIdHex = await rpc('eth_chainId');
    const chainId = parseInt(chainIdHex, 16);

    // Estimate gas
    let gasLimit;
    try {
        const estimatedHex = await rpc('eth_estimateGas', [{
            from: WALLET_ADDRESS,
            data: bytecode
        }]);
        const estimated = parseInt(estimatedHex, 16);
        gasLimit = Math.ceil(estimated * 1.3);
        console.log(`📊 Estimated gas: ${estimated} → using ${gasLimit} (1.3x buffer)`);
    } catch (e) {
        gasLimit = 2500000;
        console.warn(`⚠️  Gas estimation failed, using ${gasLimit}`);
    }

    const maxCostPOL = Number(gasPrice * BigInt(gasLimit)) / 1e18;
    console.log(`💸 Max cost: ${maxCostPOL.toFixed(4)} POL\n`);

    // Sign transaction
    const txData = {
        from: WALLET_ADDRESS,
        data: bytecode,
        gas: `0x${gasLimit.toString(16)}`,
        gasPrice: `0x${gasPrice.toString(16)}`,
        nonce: `0x${nonce.toString(16)}`,
        chainId
    };

    console.log('✍️  Signing transaction...');
    const { rawTransaction } = await signTx(txData);

    // Send via raw RPC (NO web3 timeout interference)
    console.log('📤 Sending transaction via raw RPC...');
    const txHash = await rpc('eth_sendRawTransaction', [rawTransaction]);

    console.log(`\n✅ Transaction submitted!`);
    console.log(`🔗 Hash:  ${txHash}`);
    console.log(`🔍 Track: https://amoy.polygonscan.com/tx/${txHash}\n`);
    console.log('⏳ Polling every 5s (up to 10 min)...');

    const receipt = await waitForReceipt(txHash);

    if (!receipt) {
        console.log('\n⚠️  10 min elapsed. Check manually:');
        console.log(`   https://amoy.polygonscan.com/tx/${txHash}`);
        process.exit(0);
    }

    if (receipt.status === '0x0') {
        console.error('\n❌ Transaction mined but REVERTED (out of gas or contract error)');
        console.error(`   Check: https://amoy.polygonscan.com/tx/${txHash}`);
        process.exit(1);
    }

    const contractAddress = receipt.contractAddress;
    const blockNumber = parseInt(receipt.blockNumber, 16);
    const gasUsed = parseInt(receipt.gasUsed, 16);

    console.log('\n\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!\n' + '='.repeat(50));
    console.log(`📋 Contract Address: ${contractAddress}`);
    console.log(`🧱 Block Number:     ${blockNumber}`);
    console.log(`⛽ Gas Used:         ${gasUsed}`);
    console.log(`🔗 Explorer:         https://amoy.polygonscan.com/address/${contractAddress}`);
    console.log('='.repeat(50));

    // Save contract data
    const outputDir = path.join(__dirname, '../blockchain/deployment');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const contractData = { address: contractAddress, network: 'amoy', chainId: 80002, txHash, blockNumber, deployedAt: new Date().toISOString(), abi };
    fs.writeFileSync(path.join(outputDir, 'contract-data.json'), JSON.stringify(contractData, null, 2));

    console.log('\n✅ Saved to blockchain/deployment/contract-data.json');
    console.log('\n📝 Now update backend/.env with these two lines:');
    console.log(`   CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   BLOCKCHAIN_NETWORK=amoy\n`);
    console.log('Then restart backend: npm start\n');
}

deploy().catch(err => {
    console.error('\n❌ Deployment failed:', err.message || err);
    process.exit(1);
});
