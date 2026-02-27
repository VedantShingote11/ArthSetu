/**
 * Main Server File for Microfinance Backend
 * 
 * This server handles:
 * - User authentication (JWT)
 * - Loan management (off-chain metadata)
 * - Blockchain integration (Web3.js)
 * - API endpoints for Flutter mobile app
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const loanRoutes = require('./routes/loan.routes');
const walletRoutes = require('./routes/wallet.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const profileRoutes = require('./routes/profile.routes');
const kycRoutes = require('./routes/kyc.routes');

// Initialize Express app
const app = express();

// ============ Middleware ============

// CORS configuration
app.use(cors({
    origin: '*', // For development; restrict in production
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============ Database Connection ============

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('✅ Connected to MongoDB successfully');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });

// ============ Routes ============

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Microfinance API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/loan', loanRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/kyc', kycRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ============ Error Handling Middleware ============

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// ============ Start Server ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    const network = process.env.BLOCKCHAIN_NETWORK || 'ganache';
    const rpcUrl = network === 'amoy'
        ? process.env.POLYGON_AMOY_RPC_URL
        : process.env.GANACHE_RPC_URL;
    console.log('\n=================================');
    console.log('🚀 Microfinance Backend Server');
    console.log('=================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI}`);
    console.log(`🔗 Blockchain: ${network.toUpperCase()} → ${rpcUrl}`);
    console.log(`📋 Contract:  ${process.env.CONTRACT_ADDRESS}`);
    console.log('=================================\n');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    process.exit(1);
});

module.exports = app;
