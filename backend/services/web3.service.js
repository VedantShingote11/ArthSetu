/**
 * Web3 Service Layer - Hybrid Blockchain Model
 * 
 * Handles blockchain interactions for AUDIT TRAIL ONLY
 * NO funds are transferred through blockchain
 * All monetary transactions happen off-chain in INR via wallet system
 * Blockchain provides transparent, immutable record of loan events
 * 
 * Supports:
 *   - Ganache (local dev): set BLOCKCHAIN_NETWORK=ganache in .env
 *   - Polygon Amoy (testnet): set BLOCKCHAIN_NETWORK=amoy in .env
 */

const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Determine which network to use based on environment
const NETWORK = process.env.BLOCKCHAIN_NETWORK || 'ganache';

const RPC_URL = NETWORK === 'amoy'
    ? (process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology')
    : (process.env.GANACHE_RPC_URL || 'http://127.0.0.1:7545');

console.log(`🔗 Blockchain network: ${NETWORK.toUpperCase()} (${RPC_URL})`);

// Initialize Web3 instance
const web3 = new Web3(RPC_URL);

// Platform wallet address and private key (used for all blockchain transactions)
const PLATFORM_WALLET_ADDRESS = process.env.PLATFORM_WALLET_ADDRESS || null;
const PLATFORM_WALLET_PRIVATE_KEY = process.env.PLATFORM_WALLET_PRIVATE_KEY || null;

// Add private key to web3 wallet for transaction signing
// Required for Polygon/public networks (Ganache manages accounts internally)
if (PLATFORM_WALLET_PRIVATE_KEY) {
    try {
        const privateKey = PLATFORM_WALLET_PRIVATE_KEY.startsWith('0x')
            ? PLATFORM_WALLET_PRIVATE_KEY
            : '0x' + PLATFORM_WALLET_PRIVATE_KEY;
        web3.eth.accounts.wallet.add(privateKey);
        console.log('✅ Platform wallet account loaded for signing');
    } catch (e) {
        console.error('❌ Failed to load platform wallet private key:', e.message);
    }
}

// Load contract ABI and address
let contractABI;
let contractAddress;

try {
    // Load contract data from deployment
    const contractDataPath = path.join(__dirname, '../../blockchain/deployment/contract-data.json');

    if (fs.existsSync(contractDataPath)) {
        const contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));
        contractABI = contractData.abi;
        contractAddress = contractData.address;
        console.log('✅ Contract ABI and address loaded successfully');
        console.log('Contract Address:', contractAddress);
    } else {
        console.warn('⚠️  Contract data not found. Please deploy the smart contract first.');
    }
} catch (error) {
    console.error('❌ Error loading contract data:', error.message);
}

// Create contract instance
let contract;
if (contractABI && contractAddress) {
    contract = new web3.eth.Contract(contractABI, contractAddress);
}

/**
 * Get Web3 instance
 */
const getWeb3 = () => {
    return web3;
};

/**
 * Get contract instance
 */
const getContract = () => {
    if (!contract) {
        throw new Error('Smart contract not initialized. Please deploy the contract first.');
    }
    return contract;
};

/**
 * Get platform wallet address
 */
const getPlatformWallet = () => {
    if (!PLATFORM_WALLET_ADDRESS) {
        throw new Error('Platform wallet address not configured');
    }
    return PLATFORM_WALLET_ADDRESS;
};

/**
 * Convert INR to basis points for blockchain storage
 * @param {Number} amountINR - Amount in INR (e.g., 5000.50)
 * @returns {Number} Amount in basis points (e.g., 500050)
 */
const convertINRToBasisPoints = (amountINR) => {
    return Math.round(amountINR * 100);
};

/**
 * Convert basis points to INR
 * @param {Number} basisPoints - Amount in basis points
 * @returns {Number} Amount in INR
 */
const convertBasisPointsToINR = (basisPoints) => {
    return Number(basisPoints) / 100;
};

/**
 * Raw JSON-RPC call — bypasses web3 entirely (no timeout)
 */
const rawRpc = async (method, params = []) => {
    const res = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);
    return json.result;
};

/**
 * Sign and submit a transaction fire-and-forget (no waiting for mining).
 * Returns txHash immediately. Mining happens in background on Polygon Amoy.
 * @param {String} encodedData  - ABI-encoded contract call
 * @param {Number} gasLimit     - Gas limit
 * @returns {String}            - Transaction hash
 */
const sendTxFireAndForget = async (encodedData, gasLimit = 400000) => {
    const pk = PLATFORM_WALLET_PRIVATE_KEY
        ? (PLATFORM_WALLET_PRIVATE_KEY.startsWith('0x') ? PLATFORM_WALLET_PRIVATE_KEY : '0x' + PLATFORM_WALLET_PRIVATE_KEY)
        : null;

    if (!pk || !PLATFORM_WALLET_ADDRESS) {
        throw new Error('Platform wallet not configured');
    }

    // Use 'pending' nonce so sequential blockchain calls get sequential nonces.
    // 'latest' caused nonce collisions: recordContribution and activateLoan would
    // both get nonce N (since latest doesn't count unconfirmed pending txs), causing
    // one to replace the other and breaking the contract's state machine.
    const [nonceHex, block, chainIdHex] = await Promise.all([
        rawRpc('eth_getTransactionCount', [PLATFORM_WALLET_ADDRESS, 'pending']),
        rawRpc('eth_getBlockByNumber', ['latest', false]),
        rawRpc('eth_chainId')
    ]);

    const nonce = parseInt(nonceHex, 16);
    const chainId = parseInt(chainIdHex, 16);

    // EIP-1559: maxFeePerGas = 2 × baseFee + priorityFee
    // Polygon Amoy requires at least 25-30 Gwei priority fee
    const baseFee = BigInt(block.baseFeePerGas || '0x1');
    const priorityFee = BigInt('30000000000'); // 30 Gwei — enough for Amoy inclusion
    const maxFee = baseFee * 2n + priorityFee;

    // Sign locally with EIP-1559 parameters
    const signedTx = await web3.eth.accounts.signTransaction({
        from: PLATFORM_WALLET_ADDRESS,
        to: contractAddress,
        data: encodedData,
        gas: gasLimit,
        maxFeePerGas: maxFee.toString(),
        maxPriorityFeePerGas: priorityFee.toString(),
        nonce,
        chainId,
        type: '0x2'   // EIP-1559
    }, pk);

    // Submit via raw RPC — returns txHash immediately, NO waiting
    const txHash = await rawRpc('eth_sendRawTransaction', [signedTx.rawTransaction]);
    console.log(`📤 Blockchain tx submitted (fire-and-forget): ${txHash}`);
    return txHash;
};


/**
 * Create loan on blockchain (metadata only, NO funds)
 * @param {String} borrowerRef - Reference address for borrower
 * @param {Number} loanAmountINR - Loan amount in INR
 * @param {Number} interestRate - Interest rate in basis points (e.g., 500 = 5%)
 * @param {Number} duration - Loan duration in days
 * @param {String} reason - Loan purpose
 * @returns {Object} Transaction receipt and loan ID
 */
const createLoanOnBlockchain = async (borrowerRef, loanAmountINR, interestRate, duration, reason) => {
    try {
        const contractInstance = getContract();
        const amountBasisPoints = convertINRToBasisPoints(loanAmountINR);

        // Step 1: Simulate via eth_call to capture the returned loanId (free, no gas)
        // This gives us the loanId the contract WILL assign, without waiting for mining
        let loanId = null;
        try {
            const simulatedId = await contractInstance.methods
                .createLoanRequest(borrowerRef, amountBasisPoints, interestRate, duration, reason)
                .call({ from: PLATFORM_WALLET_ADDRESS });
            loanId = Number(simulatedId);
            console.log(`📋 Blockchain loanId pre-fetched via eth_call: ${loanId}`);
        } catch (callErr) {
            console.warn(`⚠️  eth_call loanId pre-fetch failed: ${callErr.message}`);
        }

        // Step 2: Submit the actual transaction fire-and-forget (no waiting for mining)
        const encodedData = contractInstance.methods
            .createLoanRequest(borrowerRef, amountBasisPoints, interestRate, duration, reason)
            .encodeABI();

        const txHash = await sendTxFireAndForget(encodedData);

        return {
            success: true,
            transactionHash: txHash,
            loanId,          // now populated from eth_call
            blockNumber: null,
            gasUsed: null
        };
    } catch (error) {
        // Transient mempool/network errors — audit trail is best-effort, don't block loan
        const msg = error.message || '';
        console.warn(`⚠️  Blockchain (createLoan) skipped: ${msg}`);
        return { success: true, transactionHash: null, loanId: null, blockNumber: null, gasUsed: null, warning: msg };
    }
};


/**
 * Record lender contribution on blockchain (metadata only, NO funds)
 * @param {Number} loanId - Loan ID on blockchain
 * @param {String} lenderRef - Reference address for lender
 * @param {Number} contributionAmountINR - Contribution amount in INR
 * @returns {Object} Transaction receipt
 */
const recordContributionOnBlockchain = async (loanId, lenderRef, contributionAmountINR) => {
    if (loanId == null) {
        console.warn('⚠️  Blockchain (recordContribution) skipped: loanId is null');
        return { success: true, transactionHash: null, warning: 'loanId is null' };
    }
    try {
        const contractInstance = getContract();
        const amountBasisPoints = convertINRToBasisPoints(contributionAmountINR);

        const encodedData = contractInstance.methods
            .recordContribution(loanId, lenderRef, amountBasisPoints)
            .encodeABI();

        const txHash = await sendTxFireAndForget(encodedData);
        return { success: true, transactionHash: txHash, blockNumber: null, gasUsed: null };
    } catch (error) {
        const msg = error.message || '';
        console.warn(`⚠️  Blockchain (recordContribution) skipped: ${msg}`);
        return { success: true, transactionHash: null, blockNumber: null, gasUsed: null, warning: msg };
    }
};

/**
 * Activate loan on blockchain (status update only, NO funds)
 * @param {Number} loanId - Loan ID on blockchain
 * @returns {Object} Transaction receipt
 */
const activateLoanOnBlockchain = async (loanId) => {
    if (loanId == null) {
        console.warn('⚠️  Blockchain (activateLoan) skipped: loanId is null');
        return { success: true, transactionHash: null, warning: 'loanId is null' };
    }
    try {
        const contractInstance = getContract();
        const encodedData = contractInstance.methods.activateLoan(loanId).encodeABI();
        const txHash = await sendTxFireAndForget(encodedData);
        return { success: true, transactionHash: txHash, blockNumber: null, gasUsed: null };
    } catch (error) {
        const msg = error.message || '';
        console.warn(`⚠️  Blockchain (activateLoan) skipped: ${msg}`);
        return { success: true, transactionHash: null, blockNumber: null, gasUsed: null, warning: msg };
    }
};

/**
 * Log repayment on blockchain (event logging only, NO funds)
 * @param {Number} loanId - Loan ID on blockchain
 * @param {Number} repaymentAmountINR - Total repayment amount in INR
 * @param {Array} lenderSharesINR - Array of lender share amounts in INR
 * @returns {Object} Transaction receipt
 */
const logRepaymentOnBlockchain = async (loanId, repaymentAmountINR, lenderSharesINR) => {
    if (loanId == null) {
        console.warn('⚠️  Blockchain (logRepayment) skipped: loanId is null');
        return { success: true, transactionHash: null, warning: 'loanId is null' };
    }
    // Guard: if contract not loaded, skip gracefully instead of crashing
    if (!contract) {
        console.warn('⚠️  Blockchain (logRepayment) skipped: contract not initialized');
        return { success: true, transactionHash: null, warning: 'contract not initialized' };
    }
    // Guard: ensure lenderSharesINR is always an array
    const sharesArray = Array.isArray(lenderSharesINR) ? lenderSharesINR : [];
    try {
        const contractInstance = getContract();
        // Convert to basis points
        const repaymentBasisPoints = convertINRToBasisPoints(repaymentAmountINR);
        const sharesBasisPoints = sharesArray.map(share => convertINRToBasisPoints(share));

        // Contract requires sum(shares) === repaymentAmount exactly.
        // Fix any rounding difference by adjusting the last share.
        const sharesSum = sharesBasisPoints.reduce((a, b) => a + b, 0);
        if (sharesSum !== repaymentBasisPoints && sharesBasisPoints.length > 0) {
            sharesBasisPoints[sharesBasisPoints.length - 1] += (repaymentBasisPoints - sharesSum);
        }

        const encodedData = contractInstance.methods
            .logRepayment(loanId, repaymentBasisPoints, sharesBasisPoints)
            .encodeABI();

        const txHash = await sendTxFireAndForget(encodedData);
        return { success: true, transactionHash: txHash, blockNumber: null, gasUsed: null };
    } catch (error) {
        const msg = error.message || '';
        console.warn(`⚠️  Blockchain (logRepayment) skipped: ${msg}`);
        return { success: true, transactionHash: null, blockNumber: null, gasUsed: null, warning: msg };
    }
};


/**
 * Cancel loan on blockchain
 * @param {Number} loanId - Loan ID on blockchain
 * @returns {Object} Transaction receipt
 */
const cancelLoanOnBlockchain = async (loanId) => {
    if (loanId == null) {
        console.warn('⚠️  Blockchain (cancelLoan) skipped: loanId is null');
        return { success: true, transactionHash: null, warning: 'loanId is null' };
    }
    try {
        const contractInstance = getContract();
        const encodedData = contractInstance.methods.cancelLoan(loanId).encodeABI();
        const txHash = await sendTxFireAndForget(encodedData);
        return { success: true, transactionHash: txHash, blockNumber: null, gasUsed: null };
    } catch (error) {
        const msg = error.message || '';
        console.warn(`⚠️  Blockchain (cancelLoan) skipped: ${msg}`);
        return { success: true, transactionHash: null, blockNumber: null, gasUsed: null, warning: msg };
    }
};

/**
 * Get loan details from blockchain
 * @param {Number} loanId - Loan ID on blockchain
 * @returns {Object} Loan details
 */
const getLoanDetailsFromBlockchain = async (loanId) => {
    try {
        const contractInstance = getContract();

        // Call smart contract view function
        const loanDetails = await contractInstance.methods
            .getLoanDetails(loanId)
            .call();

        // Parse the returned tuple and convert basis points to INR
        return {
            loanId: Number(loanDetails.loanId),
            borrowerRef: loanDetails.borrowerRef,
            loanAmountINR: convertBasisPointsToINR(loanDetails.loanAmountINR),
            fundedAmountINR: convertBasisPointsToINR(loanDetails.fundedAmountINR),
            interestRate: Number(loanDetails.interestRate),
            duration: Number(loanDetails.duration),
            createdAt: Number(loanDetails.createdAt),
            status: Number(loanDetails.status),
            reason: loanDetails.reason
        };
    } catch (error) {
        console.error('Blockchain error (getLoanDetails):', error.message);
        throw new Error(`Failed to get loan details from blockchain: ${error.message}`);
    }
};

/**
 * Get lender contributions from blockchain
 * @param {Number} loanId - Loan ID on blockchain
 * @returns {Array} Lender contributions
 */
const getLenderContributionsFromBlockchain = async (loanId) => {
    try {
        const contractInstance = getContract();

        const contributions = await contractInstance.methods
            .getLenderContributions(loanId)
            .call();

        return contributions.map(c => ({
            lenderRef: c.lenderRef,
            amountINR: convertBasisPointsToINR(c.amountINR),
            fundedAt: Number(c.fundedAt)
        }));
    } catch (error) {
        console.error('Blockchain error (getLenderContributions):', error.message);
        throw new Error(`Failed to get lender contributions from blockchain: ${error.message}`);
    }
};

/**
 * Get transaction details
 * @param {String} transactionHash - Transaction hash
 * @returns {Object} Transaction details
 */
const getTransactionDetails = async (transactionHash) => {
    try {
        const transaction = await web3.eth.getTransaction(transactionHash);
        const receipt = await web3.eth.getTransactionReceipt(transactionHash);

        return {
            transaction,
            receipt,
            success: receipt.status
        };
    } catch (error) {
        console.error('Blockchain error (getTransaction):', error.message);
        throw new Error(`Failed to get transaction details: ${error.message}`);
    }
};

/**
 * Calculate repayment amount from blockchain
 * @param {Number} loanId - Loan ID on blockchain
 * @returns {Number} Total repayment amount in INR
 */
const calculateRepaymentAmount = async (loanId) => {
    try {
        const contractInstance = getContract();

        const repaymentBasisPoints = await contractInstance.methods
            .calculateRepaymentAmount(loanId)
            .call();

        return convertBasisPointsToINR(repaymentBasisPoints);
    } catch (error) {
        console.error('Blockchain error (calculateRepayment):', error.message);
        throw new Error(`Failed to calculate repayment: ${error.message}`);
    }
};

module.exports = {
    getWeb3,
    getContract,
    getPlatformWallet,
    convertINRToBasisPoints,
    convertBasisPointsToINR,
    createLoanOnBlockchain,
    recordContributionOnBlockchain,
    activateLoanOnBlockchain,
    logRepaymentOnBlockchain,
    cancelLoanOnBlockchain,
    getLoanDetailsFromBlockchain,
    getLenderContributionsFromBlockchain,
    getTransactionDetails,
    calculateRepaymentAmount,
    contractAddress
};
