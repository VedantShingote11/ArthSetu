# ArthSetu - Blockchain-Based Microfinance Platform

A high-fidelity prototype demonstrating transparent blockchain-based microfinance with three distinct user roles: Borrowers, Lenders, and Admins.

## Features

### For Borrowers
- Aadhaar-based KYC verification (simulated)
- Create loan requests with customizable terms
- Track loan status and repayment progress
- View Profile Score and loan history

### For Lenders
- Browse verified borrower loan requests
- Filter loans by Profile Score, purpose, and amount
- Fund loans with simulated wallet
- Track portfolio performance and returns

### For Admins
- Approve/reject KYC requests
- View all users and loans
- Blockchain explorer with transaction visualization
- System oversight and statistics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, JavaScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT-based
- **Blockchain**: Simulated using SHA-256 hashing

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Python 3.9+ installed
- MongoDB running locally or MongoDB Atlas connection

### Running the Backend (Machine Learning API)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the virtual environment or create a new one:
```bash
# To create a new virtual environment:
python -m venv .venv

# To activate (Windows):
.venv\Scripts\activate
# To activate (Mac/Linux):
source .venv/bin/activate
```

3. Install requirements:
```bash
pip install -r requirements.txt
```

4. Check your environment variables in `.env` (you can copy from `.env.example` if it doesn't exist).

5. Run the FastAPI server:
```bash
python main.py
```
The ML API backend will run on `http://localhost:8000`. You can test it at `http://localhost:8000/docs`.

### Running the Frontend (Next.js Application)

1. Navigate to the project root directory (if you are in `backend/`):
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/morpheus
JWT_SECRET=your-secret-key-change-in-production
NEXT_PUBLIC_URL=http://localhost:3000
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication
│   │   ├── borrower/     # Borrower endpoints
│   │   ├── lender/       # Lender endpoints
│   │   └── admin/        # Admin endpoints
│   ├── borrower/         # Borrower pages
│   ├── lender/           # Lender pages
│   ├── admin/            # Admin pages
│   └── auth/             # Auth pages
├── components/           # Reusable components
├── lib/
│   ├── models/          # MongoDB models
│   ├── auth/            # Auth utilities
│   ├── blockchain.js    # Blockchain simulation
│   ├── riskEngine.js    # Risk scoring
│   └── mongodb.js       # Database connection
└── public/              # Static assets
```

## Key Concepts

### Blockchain Simulation
Every financial transaction creates a new block in the simulated blockchain:
- Loan creation → Block created
- Loan funding → Block created
- Repayment → Block created

Each block contains:
- Block index
- Timestamp
- Transaction type and data
- Previous block hash
- Current block hash (SHA-256)

### Risk Engine
Borrower Profile Scores (0-100) are calculated based on:
- Past repayment behavior
- Active loan burden
- Total borrowed vs repaid ratio
- Loan amount consistency

Interest rates are suggested based on Profile Scores.

## Demo Accounts

You can create accounts for each role:
- **Borrower**: Register → Submit KYC → Request loans
- **Lender**: Register → Browse loans → Fund loans
- **Admin**: Register → Approve KYC → View blockchain

## Important Notes

⚠️ **This is a prototype for demonstration purposes only**

- No real blockchain integration
- No real Aadhaar verification
- No real payment processing
- Simulated wallet balances
- Not production-ready

## License

This project is for educational and demonstration purposes.
