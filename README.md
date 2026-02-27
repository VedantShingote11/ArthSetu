# Decentralized Microfinance Lending Platform

A complete blockchain-based peer-to-peer microfinance platform connecting unbanked borrowers with lenders using a hybrid architecture (off-chain MongoDB + on-chain Solidity smart contracts).

## 🏗️ Architecture

```
Flutter Mobile App (Borrower & Lender)
         ↓
Node.js Backend (Auth + API + Blockchain Middleware)
         ↓
Web3.js Service Layer
         ↓
Smart Contracts (Solidity via Truffle)
         ↓
Ganache Local Blockchain
```

## 🛠️ Tech Stack

### Frontend
- **Flutter** (Dart) - Cross-platform mobile app
- **Provider** - State management
- **Purple + White** fintech theme

### Backend
- **Node.js** + **Express.js** - REST API server
- **MongoDB** (Mongoose) - Off-chain data storage
- **JWT** - Authentication
- **Web3.js** - Blockchain integration

### Blockchain
- **Solidity** (v0.8.19) - Smart contracts
- **Truffle** - Development framework
- **Ganache** - Local blockchain for testing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community)
- **Ganache** - [Download](https://trufflesuite.com/ganache/)
- **Truffle** - Install globally: `npm install -g truffle`
- **Flutter** (v3.0+) - [Install Guide](https://docs.flutter.dev/get-started/install)

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd microfinance-app
```

### 2. Setup Ganache (Local Blockchain)

1. Open Ganache GUI
2. Create a new workspace or quickstart
3. Note the RPC Server URL (default: `http://127.0.0.1:7545`)
4. Copy the first 3 account addresses for demo use:
   - Account 0: Deployer
   - Account 1: Demo Borrower
   - Account 2: Demo Lender

### 3. Deploy Smart Contract

```bash
cd blockchain
npm install
truffle compile
truffle migrate --network development
```

**Important**: After deployment, the contract address and ABI will be saved to `blockchain/deployment/contract-data.json`

### 4. Setup Backend

```bash
cd ../backend
npm install
```

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/microfinance

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

# Ganache
GANACHE_RPC_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=<paste_from_deployment>

# Demo accounts (from Ganache)
DEMO_BORROWER_ADDRESS=<account_1_from_ganache>
DEMO_LENDER_ADDRESS=<account_2_from_ganache>
```

Start the backend server:

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### 5. Setup Flutter App

```bash
cd ../mobile_app_flutter
flutter pub get
```

**Update API Base URL** in `lib/services/api_service.dart`:

- For Android Emulator: `http://10.0.2.2:3000/api`
- For iOS Simulator: `http://localhost:3000/api`
- For Physical Device: `http://<your-computer-ip>:3000/api`

Run the app:

```bash
flutter run
```

## 📱 User Roles & Features

### Borrower Features
- ✅ Register with KYC details
- ✅ Create loan requests (amount, duration, interest rate, reason)
- ✅ View loan status (Requested / Funded / Active / Repaid)
- ✅ Accept funded loans
- ✅ Repay loans with interest
- ✅ View transaction history

### Lender Features
- ✅ Register with KYC details
- ✅ Browse available loan requests
- ✅ Fund loans (partial or full funding)
- ✅ View funded loans and ROI
- ✅ Track repayments
- ✅ View transaction details

## 🔐 Security Features

- ✅ Bcrypt password hashing
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation on all endpoints
- ✅ Private keys never exposed in frontend
- ✅ Environment variables for secrets
- ✅ Smart contract access control

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Loans (Borrower)
- `POST /api/loan/create` - Create loan request
- `GET /api/loan/my-loans` - Get my loans
- `POST /api/loan/accept` - Accept funded loan
- `POST /api/loan/repay` - Repay active loan

### Loans (Lender)
- `GET /api/loan/all` - Get all available loans
- `POST /api/loan/fund` - Fund a loan

### Blockchain
- `GET /api/blockchain/transaction/:hash` - Get transaction details
- `GET /api/blockchain/balance/:address` - Get wallet balance
- `GET /api/blockchain/contract-info` - Get contract info

## 🧪 Testing the Platform

### Demo Flow

1. **Start all services**:
   - Ganache running
   - MongoDB running
   - Backend server running (`npm run dev`)
   - Flutter app running (`flutter run`)

2. **Register Borrower**:
   - Open app
   - Click "Register"
   - Select "Borrower" role
   - Fill KYC form
   - Use Ganache Account 1 address as wallet

3. **Create Loan Request**:
   - Login as borrower
   - Click "Create Loan" button
   - Enter: Amount (e.g., 1 ETH), Duration (30 days), Interest (5%), Reason
   - Submit

4. **Register Lender**:
   - Logout
   - Register new account
   - Select "Lender" role
   - Use Ganache Account 2 address as wallet

5. **Fund Loan**:
   - Login as lender
   - View "Available Loans" tab
   - Click "Fund Loan" on the borrower's request
   - Enter funding amount
   - Confirm transaction

6. **Accept & Repay**:
   - Logout and login as borrower
   - View loan (status should be "Funded")
   - Click "Accept Loan"
   - After acceptance, click "Repay Loan"

## 📁 Project Structure

```
microfinance-app/
├── blockchain/
│   ├── contracts/
│   │   └── MicrofinanceLoan.sol
│   ├── migrations/
│   │   └── 1_deploy_contracts.js
│   ├── truffle-config.js
│   └── package.json
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Loan.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── loan.routes.js
│   │   └── blockchain.routes.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── services/
│   │   └── web3.service.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── mobile_app_flutter/
    ├── lib/
    │   ├── main.dart
    │   ├── providers/
    │   │   ├── auth_provider.dart
    │   │   └── loan_provider.dart
    │   ├── screens/
    │   │   ├── login_screen.dart
    │   │   ├── register_screen.dart
    │   │   ├── borrower_dashboard.dart
    │   │   └── lender_dashboard.dart
    │   ├── services/
    │   │   └── api_service.dart
    │   └── widgets/
    │       └── loan_card.dart
    └── pubspec.yaml
```

## 🎯 Smart Contract Functions

### Core Functions
- `createLoanRequest()` - Borrower creates loan
- `fundLoan()` - Lender funds loan (supports partial funding)
- `acceptLoanContract()` - Borrower accepts funded loan
- `repayLoan()` - Borrower repays with interest
- `getLoanDetails()` - View loan information
- `calculateRepaymentAmount()` - Calculate total repayment

### Events
- `LoanCreated` - Emitted when loan is created
- `LoanFunded` - Emitted when loan receives funding
- `LoanFullyFunded` - Emitted when loan is fully funded
- `LoanAccepted` - Emitted when borrower accepts loan
- `LoanRepaid` - Emitted when loan is repaid

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod`
- Check if port 3000 is available
- Verify `.env` file exists and is configured

### Smart contract deployment fails
- Ensure Ganache is running
- Check RPC URL in `truffle-config.js`
- Verify Solidity version matches

### Flutter app can't connect to backend
- Check API base URL in `api_service.dart`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- Ensure backend server is running

### Transaction fails
- Check wallet has sufficient balance in Ganache
- Verify contract address in backend `.env`
- Check Ganache console for error messages

## 📝 License

MIT License

## 👥 Contributors

Built for hackathon demonstration purposes.

## 🙏 Acknowledgments

- Truffle Suite for blockchain development tools
- Flutter team for the amazing framework
- MongoDB for database solutions
