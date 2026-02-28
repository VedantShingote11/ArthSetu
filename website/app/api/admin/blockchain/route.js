import { requireRole } from '@/lib/auth/middleware';
import { getBlockchainStats, validateChain } from '@/lib/blockchain';
import BlockchainBlock from '@/lib/models/BlockchainBlock';
import dbConnect from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const authCheck = requireRole(request, ['admin']);
    if (!authCheck.authorized) return authCheck.response;

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const blockId = searchParams.get('blockId');

        // If requesting specific block
        if (blockId) {
            const block = await BlockchainBlock.findById(blockId)
                .populate('fromUser', 'name email role')
                .populate('toUser', 'name email role');

            if (!block) {
                return NextResponse.json(
                    { error: 'Block not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                block: block.toObject(),
            });
        }

        // Get paginated blockchain
        const skip = (page - 1) * limit;

        const blocks = await BlockchainBlock.find()
            .populate('fromUser', 'name email role')
            .populate('toUser', 'name email role')
            .sort({ blockIndex: -1 })
            .skip(skip)
            .limit(limit);

        const totalBlocks = await BlockchainBlock.countDocuments();

        // Validate chain
        const validation = await validateChain();

        // Get stats
        const stats = await getBlockchainStats();

        return NextResponse.json({
            success: true,
            blocks,
            pagination: {
                page,
                limit,
                totalBlocks,
                totalPages: Math.ceil(totalBlocks / limit),
            },
            validation,
            stats,
        });

    } catch (error) {
        console.error('Get blockchain error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blockchain' },
            { status: 500 }
        );
    }
}
