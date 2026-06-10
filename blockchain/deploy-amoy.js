/**
 * deploy-amoy.js - Custom deployment script for Polygon Amoy
 * 
 * Bypasses Truffle's timeout issues by using web3 directly
 * with manual receipt polling. Much more reliable.
 * 
 * Usage: node deploy-amoy.js
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../backend/.env' });

const RPC_URL = process.env.POLYGON_AMOY_RPC_URL;
const PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;
const WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS;

// Validate config
if (!RPC_URL || !PRIVATE_KEY || !WALLET_ADDRESS) {
    console.error('❌ Missing env vars. Check backend/.env has:');
    console.error('   POLYGON_AMOY_RPC_URL, PLATFORM_WALLET_PRIVATE_KEY, PLATFORM_WALLET_ADDRESS');
    process.exit(1);
}

// Load compiled contract
const contractPath = path.join(__dirname, 'build/contracts/MicrofinanceLoan.json');
if (!fs.existsSync(contractPath)) {
    console.error('❌ Contract not compiled. Run: npx truffle compile first');
    process.exit(1);
}

const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const { abi, bytecode } = contractJson;

async function deploy() {
    console.log('\n🚀 Deploying MicrofinanceLoan to Polygon Amoy...\n');
    console.log(`📡 RPC: ${RPC_URL}`);
    console.log(`👛 From: ${WALLET_ADDRESS}\n`);

    const web3 = new Web3(RPC_URL);

    // Add account
    const pk = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY;
    const account = web3.eth.accounts.privateKeyToAccount(pk);
    web3.eth.accounts.wallet.add(account);

    // Check balance
    const balance = await web3.eth.getBalance(WALLET_ADDRESS);
    const balancePOL = parseFloat(web3.utils.fromWei(balance, 'ether'));
    console.log(`💰 Balance: ${balancePOL.toFixed(4)} POL`);

    if (balancePOL < 0.01) {
        console.error('❌ Insufficient balance. Get POL from faucet.polygon.technology');
        process.exit(1);
    }

    // Get current nonce and gas price
    const nonce = await web3.eth.getTransactionCount(WALLET_ADDRESS, 'pending');
    const gasPrice = await web3.eth.getGasPrice();
    const gasPriceGwei = parseFloat(web3.utils.fromWei(gasPrice.toString(), 'gwei'));
    console.log(`🔢 Nonce: ${nonce}`);
    console.log(`⛽ Gas Price: ${gasPriceGwei.toFixed(2)} Gwei\n`);

    // Build deploy transaction
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({ data: bytecode });

    // Estimate gas
    let gasEstimate;
    try {
        gasEstimate = await deployTx.estimateGas({ from: WALLET_ADDRESS });
        console.log(`📊 Estimated gas: ${gasEstimate}`);
    } catch (e) {
        console.warn('⚠️  Could not estimate gas, using 2,500,000');
        gasEstimate = 2500000n;
    }

    // Use 1.2x gas estimate as limit
    const gasLimit = BigInt(Math.ceil(Number(gasEstimate) * 1.2));
    const totalCostWei = gasLimit * gasPrice;
    const totalCostPOL = parseFloat(web3.utils.fromWei(totalCostWei.toString(), 'ether'));
    console.log(`💸 Max cost: ${totalCostPOL.toFixed(4)} POL\n`);

    if (balancePOL < totalCostPOL) {
        console.error(`❌ Not enough POL. Need ${totalCostPOL.toFixed(4)}, have ${balancePOL.toFixed(4)}`);
        process.exit(1);
    }

    // Sign and send transaction
    console.log('📤 Sending transaction...');
    const txData = {
        from: WALLET_ADDRESS,
        data: deployTx.encodeABI(),
        gas: gasLimit.toString(),
        gasPrice: gasPrice.toString(),
        nonce: nonce
    };

    const signedTx = await web3.eth.accounts.signTransaction(txData, pk);

    // Send and manually poll for receipt (no timeout)
    const txHash = await new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signedTx.rawTransaction)
            .on('transactionHash', (hash) => {
                console.log(`✅ Transaction submitted!`);
                console.log(`🔗 Hash: ${hash}`);
                console.log(`🔍 Track: https://amoy.polygonscan.com/tx/${hash}\n`);
                console.log('⏳ Waiting for mining (checking every 5s)...');
                resolve(hash);
            })
            .on('error', reject);
    });

    // Poll for receipt manually (no timeout)
    let receipt = null;
    let attempts = 0;
    while (!receipt) {
        attempts++;
        process.stdout.write(`\r   Attempt ${attempts} - waiting for block...`);
        await new Promise(r => setTimeout(r, 5000)); // wait 5 seconds

        try {
            receipt = await web3.eth.getTransactionReceipt(txHash);
        } catch (e) {
            // Keep polling
        }

        if (attempts > 120) { // 10 minutes max
            console.log('\n⚠️  10 minutes elapsed. Check PolygonScan manually.');
            console.log(`   https://amoy.polygonscan.com/tx/${txHash}`);
            process.exit(0);
        }
    }

    console.log('\n\n🎉 CONTRACT DEPLOYED SUCCESSFULLY!\n');
    console.log('='.repeat(50));
    console.log(`📋 Contract Address: ${receipt.contractAddress}`);
    console.log(`🧱 Block Number:     ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used:         ${receipt.gasUsed}`);
    console.log(`🔗 PolygonScan:      https://amoy.polygonscan.com/address/${receipt.contractAddress}`);
    console.log('='.repeat(50));

    // Save contract data
    const contractData = {
        address: receipt.contractAddress,
        network: 'amoy',
        chainId: 80002,
        txHash: txHash,
        blockNumber: Number(receipt.blockNumber),
        deployedAt: new Date().toISOString(),
        abi: abi
    };

    const outputPath = path.join(__dirname, 'deployment/contract-data.json');
    if (!fs.existsSync(path.join(__dirname, 'deployment'))) {
        fs.mkdirSync(path.join(__dirname, 'deployment'));
    }
    fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));
    console.log(`\n✅ Contract data saved to: blockchain/deployment/contract-data.json`);
    console.log('\n📝 Next steps:');
    console.log(`   1. Update backend/.env: CONTRACT_ADDRESS=${receipt.contractAddress}`);
    console.log(`   2. Update backend/.env: BLOCKCHAIN_NETWORK=amoy`);
    console.log(`   3. Restart backend: npm start`);
    console.log(`   4. Look for: "🔗 Blockchain network: AMOY"\n`);
}

deploy().catch(err => {
    console.error('\n❌ Deployment failed:', err.message);
    process.exit(1);
});
