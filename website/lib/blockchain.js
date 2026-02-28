import crypto from 'crypto';
import BlockchainBlock from './models/BlockchainBlock.js';

/**
 * Calculate SHA-256 hash for a block
 */
export function calculateHash(blockData, previousHash) {
    const dataString = JSON.stringify({
        ...blockData,
        previousHash,
    });
    return crypto.createHash('sha256').update(dataString).digest('hex');
}

/**
 * Get the latest block in the chain
 */
export async function getLatestBlock() {
    const latestBlock = await BlockchainBlock.findOne().sort({ blockIndex: -1 });
    return latestBlock;
}

/**
 * Create a new block in the blockchain
 */
export async function createBlock(transactionType, fromUser, toUser, amount, data = {}) {
    try {
        // Get the latest block to link to
        const latestBlock = await getLatestBlock();

        const blockIndex = latestBlock ? latestBlock.blockIndex + 1 : 0;
        const previousHash = latestBlock ? latestBlock.currentHash : '0';

        const blockData = {
            blockIndex,
            timestamp: new Date(),
            transactionType,
            fromUser,
            toUser,
            amount,
            data,
        };

        const currentHash = calculateHash(blockData, previousHash);

        const newBlock = new BlockchainBlock({
            ...blockData,
            previousHash,
            currentHash,
        });

        await newBlock.save();

        console.log(`✅ Block ${blockIndex} created: ${transactionType}`);

        return newBlock;
    } catch (error) {
        console.error('❌ Error creating block:', error);
        throw error;
    }
}

/**
 * Validate the entire blockchain
 */
export async function validateChain() {
    const blocks = await BlockchainBlock.find().sort({ blockIndex: 1 });

    for (let i = 1; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const previousBlock = blocks[i - 1];

        // Check if previous hash matches
        if (currentBlock.previousHash !== previousBlock.currentHash) {
            return {
                valid: false,
                error: `Block ${currentBlock.blockIndex} has invalid previous hash`,
            };
        }

        // Recalculate hash to verify integrity
        const blockData = {
            blockIndex: currentBlock.blockIndex,
            timestamp: currentBlock.timestamp,
            transactionType: currentBlock.transactionType,
            fromUser: currentBlock.fromUser,
            toUser: currentBlock.toUser,
            amount: currentBlock.amount,
            data: currentBlock.data,
        };

        const recalculatedHash = calculateHash(blockData, currentBlock.previousHash);

        if (recalculatedHash !== currentBlock.currentHash) {
            return {
                valid: false,
                error: `Block ${currentBlock.blockIndex} has been tampered with`,
            };
        }
    }

    return { valid: true, blockCount: blocks.length };
}

/**
 * Get blockchain statistics
 */
export async function getBlockchainStats() {
    const totalBlocks = await BlockchainBlock.countDocuments();
    const loanCreatedBlocks = await BlockchainBlock.countDocuments({ transactionType: 'loan_created' });
    const loanFundedBlocks = await BlockchainBlock.countDocuments({ transactionType: 'loan_funded' });
    const repaymentBlocks = await BlockchainBlock.countDocuments({ transactionType: 'repayment' });

    return {
        totalBlocks,
        loanCreatedBlocks,
        loanFundedBlocks,
        repaymentBlocks,
    };
}
