// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MicrofinanceLoan - Hybrid Blockchain Model
 * @dev Immutable audit layer for microfinance platform
 * @notice This contract stores ONLY loan metadata and events
 * @notice NO funds are held, transferred, or distributed by this contract
 * @notice All monetary transactions happen OFF-CHAIN in INR via backend wallet system
 * @notice Blockchain provides transparent, immutable audit trail
 */
contract MicrofinanceLoan {
    
    // ============ Enums ============
    
    enum LoanStatus {
        Requested,      // Loan created, awaiting funding
        Funded,         // Fully funded, awaiting borrower acceptance
        Active,         // Loan accepted and active
        Repaid,         // Loan fully repaid
        Cancelled       // Loan cancelled
    }
    
    // ============ Structs ============
    
    struct LenderContribution {
        address lenderRef;          // Reference only (not actual wallet)
        uint256 amountINR;          // Amount in INR (basis points for precision)
        uint256 fundedAt;           // Timestamp
    }
    
    struct Loan {
        uint256 loanId;
        address borrowerRef;                    // Reference only (not actual wallet)
        LenderContribution[] lenderContributions;
        uint256 loanAmountINR;                  // Total loan amount in INR (basis points)
        uint256 fundedAmountINR;                // Amount funded so far in INR
        uint256 interestRate;                   // Interest rate in basis points (e.g., 500 = 5%)
        uint256 duration;                       // Loan duration in days
        uint256 createdAt;                      // Timestamp of loan creation
        uint256 fundedAt;                       // Timestamp when fully funded
        uint256 activatedAt;                    // Timestamp when loan activated
        uint256 repaidAt;                       // Timestamp of repayment
        LoanStatus status;
        string reason;                          // Loan purpose/reason
    }
    
    // ============ State Variables ============
    
    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;
    
    // ============ Events ============
    
    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrowerRef,
        uint256 loanAmountINR,
        uint256 interestRate,
        uint256 duration,
        string reason,
        uint256 timestamp
    );
    
    event ContributionRecorded(
        uint256 indexed loanId,
        address indexed lenderRef,
        uint256 amountINR,
        uint256 totalFundedINR,
        uint256 timestamp
    );
    
    event LoanFullyFunded(
        uint256 indexed loanId,
        uint256 totalAmountINR,
        uint256 timestamp
    );
    
    event LoanActivated(
        uint256 indexed loanId,
        address indexed borrowerRef,
        uint256 timestamp
    );
    
    event RepaymentLogged(
        uint256 indexed loanId,
        address indexed borrowerRef,
        uint256 repaymentAmountINR,
        uint256 timestamp
    );
    
    event LenderRepaymentShare(
        uint256 indexed loanId,
        address indexed lenderRef,
        uint256 shareAmountINR,
        uint256 timestamp
    );
    
    event LoanCancelled(
        uint256 indexed loanId,
        address indexed borrowerRef,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier loanExists(uint256 _loanId) {
        require(_loanId < loanCounter, "Loan does not exist");
        _;
    }
    
    modifier inStatus(uint256 _loanId, LoanStatus _status) {
        require(loans[_loanId].status == _status, "Invalid loan status for this operation");
        _;
    }
    
    // ============ Core Functions ============
    
    /**
     * @dev Create a new loan request (metadata only)
     * @param _borrowerRef Reference address for borrower (not actual wallet)
     * @param _loanAmountINR Amount of loan in INR (in basis points, e.g., 500000 = ₹5000.00)
     * @param _interestRate Interest rate in basis points (e.g., 500 = 5%)
     * @param _duration Loan duration in days
     * @param _reason Purpose of the loan
     * @return loanId The ID of the created loan
     */
    function createLoanRequest(
        address _borrowerRef,
        uint256 _loanAmountINR,
        uint256 _interestRate,
        uint256 _duration,
        string memory _reason
    ) external returns (uint256) {
        require(_loanAmountINR > 0, "Loan amount must be greater than 0");
        require(_interestRate > 0 && _interestRate <= 10000, "Interest rate must be between 0.01% and 100%");
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_reason).length > 0, "Reason cannot be empty");
        
        uint256 loanId = loanCounter++;
        Loan storage newLoan = loans[loanId];
        
        newLoan.loanId = loanId;
        newLoan.borrowerRef = _borrowerRef;
        newLoan.loanAmountINR = _loanAmountINR;
        newLoan.fundedAmountINR = 0;
        newLoan.interestRate = _interestRate;
        newLoan.duration = _duration;
        newLoan.createdAt = block.timestamp;
        newLoan.status = LoanStatus.Requested;
        newLoan.reason = _reason;
        
        emit LoanCreated(
            loanId,
            _borrowerRef,
            _loanAmountINR,
            _interestRate,
            _duration,
            _reason,
            block.timestamp
        );
        
        return loanId;
    }
    
    /**
     * @dev Record lender contribution (NO actual fund transfer)
     * @param _loanId ID of the loan
     * @param _lenderRef Reference address for lender
     * @param _amountINR Contribution amount in INR (basis points)
     * @notice Backend must handle actual INR transfer before calling this
     */
    function recordContribution(
        uint256 _loanId,
        address _lenderRef,
        uint256 _amountINR
    ) 
        external 
        loanExists(_loanId) 
        inStatus(_loanId, LoanStatus.Requested) 
    {
        Loan storage loan = loans[_loanId];
        
        require(_lenderRef != loan.borrowerRef, "Borrower cannot fund their own loan");
        require(_amountINR > 0, "Contribution amount must be greater than 0");
        require(loan.fundedAmountINR + _amountINR <= loan.loanAmountINR, "Contribution exceeds loan amount");
        
        // Record contribution
        loan.lenderContributions.push(LenderContribution({
            lenderRef: _lenderRef,
            amountINR: _amountINR,
            fundedAt: block.timestamp
        }));
        
        loan.fundedAmountINR += _amountINR;
        
        emit ContributionRecorded(
            _loanId,
            _lenderRef,
            _amountINR,
            loan.fundedAmountINR,
            block.timestamp
        );
        
        // Check if loan is fully funded
        if (loan.fundedAmountINR == loan.loanAmountINR) {
            loan.status = LoanStatus.Funded;
            loan.fundedAt = block.timestamp;
            emit LoanFullyFunded(_loanId, loan.loanAmountINR, block.timestamp);
        }
    }
    
    /**
     * @dev Update loan status to Active (NO fund transfer)
     * @param _loanId ID of the loan to activate
     * @notice Backend must handle actual INR disbursement before calling this
     */
    function activateLoan(uint256 _loanId) 
        external 
        loanExists(_loanId) 
        inStatus(_loanId, LoanStatus.Funded) 
    {
        Loan storage loan = loans[_loanId];
        
        loan.status = LoanStatus.Active;
        loan.activatedAt = block.timestamp;
        
        emit LoanActivated(_loanId, loan.borrowerRef, block.timestamp);
    }
    
    /**
     * @dev Log repayment event (NO actual fund distribution)
     * @param _loanId ID of the loan
     * @param _repaymentAmountINR Total repayment amount in INR (basis points)
     * @param _lenderShares Array of lender share amounts (must match lender count)
     * @notice Backend must handle actual INR distribution before calling this
     */
    function logRepayment(
        uint256 _loanId,
        uint256 _repaymentAmountINR,
        uint256[] memory _lenderShares
    ) 
        external 
        loanExists(_loanId) 
        inStatus(_loanId, LoanStatus.Active) 
    {
        Loan storage loan = loans[_loanId];
        
        require(_repaymentAmountINR > 0, "Repayment amount must be greater than 0");
        require(_lenderShares.length == loan.lenderContributions.length, "Lender shares count mismatch");
        
        // Verify total shares equal repayment amount
        uint256 totalShares = 0;
        for (uint256 i = 0; i < _lenderShares.length; i++) {
            totalShares += _lenderShares[i];
        }
        require(totalShares == _repaymentAmountINR, "Total shares must equal repayment amount");
        
        loan.status = LoanStatus.Repaid;
        loan.repaidAt = block.timestamp;
        
        emit RepaymentLogged(
            _loanId,
            loan.borrowerRef,
            _repaymentAmountINR,
            block.timestamp
        );
        
        // Emit individual lender share events
        for (uint256 i = 0; i < loan.lenderContributions.length; i++) {
            emit LenderRepaymentShare(
                _loanId,
                loan.lenderContributions[i].lenderRef,
                _lenderShares[i],
                block.timestamp
            );
        }
    }
    
    /**
     * @dev Cancel a loan request
     * @param _loanId ID of the loan to cancel
     * @notice Backend must handle refunds before calling this
     */
    function cancelLoan(uint256 _loanId) 
        external 
        loanExists(_loanId) 
        inStatus(_loanId, LoanStatus.Requested) 
    {
        Loan storage loan = loans[_loanId];
        loan.status = LoanStatus.Cancelled;
        
        emit LoanCancelled(_loanId, loan.borrowerRef, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Calculate total repayment amount (principal + interest)
     * @param _loanId ID of the loan
     * @return Total repayment amount in INR (basis points)
     */
    function calculateRepaymentAmount(uint256 _loanId) 
        public 
        view 
        loanExists(_loanId) 
        returns (uint256) 
    {
        Loan storage loan = loans[_loanId];
        uint256 interest = (loan.loanAmountINR * loan.interestRate) / 10000;
        return loan.loanAmountINR + interest;
    }
    
    /**
     * @dev Get detailed loan information
     * @param _loanId ID of the loan
     */
    function getLoanDetails(uint256 _loanId) 
        external 
        view 
        loanExists(_loanId) 
        returns (
            uint256 loanId,
            address borrowerRef,
            uint256 loanAmountINR,
            uint256 fundedAmountINR,
            uint256 interestRate,
            uint256 duration,
            uint256 createdAt,
            LoanStatus status,
            string memory reason
        ) 
    {
        Loan storage loan = loans[_loanId];
        
        return (
            loan.loanId,
            loan.borrowerRef,
            loan.loanAmountINR,
            loan.fundedAmountINR,
            loan.interestRate,
            loan.duration,
            loan.createdAt,
            loan.status,
            loan.reason
        );
    }
    
    /**
     * @dev Get lender contributions for a loan
     * @param _loanId ID of the loan
     */
    function getLenderContributions(uint256 _loanId)
        external
        view
        loanExists(_loanId)
        returns (LenderContribution[] memory)
    {
        return loans[_loanId].lenderContributions;
    }
    
    /**
     * @dev Get total number of loans
     */
    function getTotalLoans() external view returns (uint256) {
        return loanCounter;
    }
    
    /**
     * @dev Get loan status
     */
    function getLoanStatus(uint256 _loanId) 
        external 
        view 
        loanExists(_loanId) 
        returns (LoanStatus) 
    {
        return loans[_loanId].status;
    }
}
