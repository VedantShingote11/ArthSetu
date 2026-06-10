/**
 * flush-nonces.js - Cancels all stuck pending transactions
 *
 * Sends 0-value self-transfers with 3x gas price for each stuck nonce.
 * This replaces the stuck txs, clearing the mempool so the deploy can proceed.
 *
 * Run from backend folder: node flush-nonces.js
 */

require('dotenv').config();

const RPC_URL = process.env.POLYGON_AMOY_RPC_URL;
const PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY;
const WALLET = process.env.PLATFORM_WALLET_ADDRESS;

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

async function signAndSend(txData) {
    const Web3Module = require('web3');
    const Web3 = typeof Web3Module === 'function' ? Web3Module : (Web3Module.Web3 || Web3Module.default);
    const web3 = new Web3(RPC_URL);
    const pk = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : '0x' + PRIVATE_KEY;
    const signed = await web3.eth.accounts.signTransaction(txData, pk);
    return await rpc('eth_sendRawTransaction', [signed.rawTransaction]);
}

async function main() {
    console.log('\n🔧 Flushing stuck pending transactions...\n');

    // Confirmed nonce = how many txs were actually MINED
    const confirmedNonceHex = await rpc('eth_getTransactionCount', [WALLET, 'latest']);
    const confirmedNonce = parseInt(confirmedNonceHex, 16);

    // Pending nonce = what the next tx should use
    const pendingNonceHex = await rpc('eth_getTransactionCount', [WALLET, 'pending']);
    const pendingNonce = parseInt(pendingNonceHex, 16);

    console.log(`✅ Confirmed nonce (mined): ${confirmedNonce}`);
    console.log(`⏳ Pending nonce (mempool): ${pendingNonce}`);
    console.log(`🔴 Stuck transactions:      ${pendingNonce - confirmedNonce} (nonces ${confirmedNonce} to ${pendingNonce - 1})\n`);

    if (confirmedNonce === pendingNonce) {
        console.log('✅ No stuck transactions! Mempool is clear.');
        console.log('   You can run deploy-amoy.js now.\n');
        return;
    }

    // Get baseFee from latest block and use 50 Gwei priority fee to guarantee replacement
    const block = await rpc('eth_getBlockByNumber', ['latest', false]);
    const baseFee = BigInt(block.baseFeePerGas || '0x1');
    const priorityFee = BigInt('50000000000'); // 50 Gwei — high priority to replace stuck legacy txs
    const maxFee = baseFee * 2n + priorityFee;

    console.log(`⛽ BaseFee: ${Number(baseFee) / 1e9} Gwei`);
    console.log(`🚀 MaxFee: ${Number(maxFee) / 1e9} Gwei, PriorityFee: ${Number(priorityFee) / 1e9} Gwei\n`);

    const chainIdHex = await rpc('eth_chainId');
    const chainId = parseInt(chainIdHex, 16);

    // Replace each stuck nonce with a 0-value self-transfer (EIP-1559)
    for (let nonce = confirmedNonce; nonce < pendingNonce; nonce++) {
        console.log(`📤 Replacing nonce ${nonce}...`);
        try {
            const txHash = await signAndSend({
                from: WALLET,
                to: WALLET,       // send to ourselves
                value: '0x0',     // 0 POL
                gas: '0x5208',    // 21000 (standard transfer)
                maxFeePerGas: `0x${maxFee.toString(16)}`,
                maxPriorityFeePerGas: `0x${priorityFee.toString(16)}`,
                nonce: `0x${nonce.toString(16)}`,
                chainId,
                type: '0x2'
            });
            console.log(`   ✅ Sent: ${txHash}`);
        } catch (e) {
            console.warn(`   ⚠️  Nonce ${nonce} failed: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000)); // 1s between txs
    }

    // Poll until all flush txs are mined
    console.log('\n⏳ Waiting for flush transactions to mine (polling every 5s)...\n');
    let cleared = false;
    let attempts = 0;
    while (!cleared && attempts < 60) {
        attempts++;
        await new Promise(r => setTimeout(r, 5000));
        const newNonceHex = await rpc('eth_getTransactionCount', [WALLET, 'latest']);
        const newNonce = parseInt(newNonceHex, 16);
        process.stdout.write(`\r   Confirmed nonce: ${newNonce}/${pendingNonce} (attempt ${attempts})`);
        if (newNonce >= pendingNonce) {
            cleared = true;
        }
    }

    if (cleared) {
        console.log('\n\n✅ All stuck transactions cleared!\n');
        console.log('🚀 Now run the deployment:');
        console.log('   node deploy-amoy.js\n');
    } else {
        console.log('\n\n⚠️  Flush txs taking longer than expected.');
        console.log('   Check: https://amoy.polygonscan.com/address/' + WALLET);
        console.log('   Then run: node deploy-amoy.js\n');
    }
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
