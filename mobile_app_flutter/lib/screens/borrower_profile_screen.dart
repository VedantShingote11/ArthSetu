import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/profile_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/loan_provider.dart';
import '../providers/wallet_provider.dart';
import '../providers/kyc_provider.dart';
import '../providers/language_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/stat_card.dart';
import '../widgets/transaction_list_item.dart';
import '../widgets/language_selector_dialog.dart';
import 'kyc_screen.dart';
import '../services/api_service.dart';

/// Borrower Profile Screen
/// 
/// Displays borrower's loan history, repayment tracking, and credit score
class BorrowerProfileScreen extends StatefulWidget {
  const BorrowerProfileScreen({super.key});

  @override
  State<BorrowerProfileScreen> createState() => _BorrowerProfileScreenState();
}

class _BorrowerProfileScreenState extends State<BorrowerProfileScreen> {
  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

  // Optimistic local state for auto-pay toggle — flips instantly on tap
  bool? _autoPayOptimistic;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
    final walletProvider = Provider.of<WalletProvider>(context, listen: false);
    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    await Future.wait([
      profileProvider.fetchBorrowerSummary(),
      profileProvider.fetchLoanHistory(),
      kycProvider.fetchKycStatus(),
      // Only fetch wallet if KYC verified
      if (kycProvider.isVerified) walletProvider.fetchBalance(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    context.watch<LanguageProvider>(); // rebuild instantly on language change
    final authProvider = Provider.of<AuthProvider>(context);
    final profileProvider = Provider.of<ProfileProvider>(context);
    final user = authProvider.userData;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: Text(AppL10n.of(context).myProfile),
        backgroundColor: const Color(0xFF7C3AED),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: profileProvider.isLoadingSummary
            ? const Center(child: CircularProgressIndicator())
            : profileProvider.summaryError != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(profileProvider.summaryError!),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadData,
                          child: Text(AppL10n.of(context).retry),
                        ),
                      ],
                    ),
                  )
                : SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Consumer<KycProvider>(
                      builder: (context, kycProvider, _) => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildHeader(authProvider.userData),
                          const SizedBox(height: 16),
                          // KYC banner — always show so user can track status
                          _buildKycBanner(kycProvider),
                          if (kycProvider.isVerified) ...[  
                            const SizedBox(height: 16),
                            _buildWalletBalance(),
                          ],
                          const SizedBox(height: 16),
                          _buildCreditScore(profileProvider.borrowerSummary),
                          const SizedBox(height: 16),
                          _buildAutoPayToggle(authProvider),
                          const SizedBox(height: 16),
                          _buildLanguageCard(),
                          const SizedBox(height: 16),
                          _buildLoanSummary(profileProvider.borrowerSummary),
                          const SizedBox(height: 24),
                          _buildActiveLoans(profileProvider.loanHistory),
                          const SizedBox(height: 24),
                          _buildLoanHistory(profileProvider.loanHistory),
                        ],
                      ),
                    ),
                  ),
      ),
    );
  }

  // ── Auto-Pay Toggle ──────────────────────────────────────────────────────
  Widget _buildAutoPayToggle(AuthProvider authProvider) {
    final user = authProvider.userData;
    final bool serverValue = (user?['autoPayEnabled'] as bool?) ?? false;
    // Use optimistic local value if set, otherwise fall back to server value
    final bool current = _autoPayOptimistic ?? serverValue;

    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: SwitchListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        secondary: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: current ? const Color(0xFF7C3AED).withOpacity(0.12) : Colors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            Icons.autorenew,
            color: current ? const Color(0xFF7C3AED) : Colors.grey,
          ),
        ),
        title: Text(AppL10n.of(context).autoPayEmi, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(
          current
              ? AppL10n.of(context).autoPayEnabled
              : AppL10n.of(context).autoPayDisabled,
          style: const TextStyle(fontSize: 12),
        ),
        value: current,
        activeColor: const Color(0xFF7C3AED),
        onChanged: (val) async {
          // Flip instantly (optimistic UI)
          setState(() => _autoPayOptimistic = val);
          try {
            final resp = await ApiService().toggleAutoPay(enabled: val);
            if (resp['success'] == true) {
              await authProvider.refreshUser();
              // Sync optimistic state to the confirmed server value so the
              // button never reverts — regardless of provider rebuild timing.
              final confirmedVal =
                  (authProvider.userData?['autoPayEnabled'] as bool?) ?? val;
              if (mounted) setState(() => _autoPayOptimistic = confirmedVal);
              if (mounted) {
                final l10n = AppL10n.of(context);
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text(confirmedVal ? l10n.autoPayToggleSuccess : l10n.autoPayDisabled),
                  backgroundColor: confirmedVal ? Colors.green : Colors.grey,
                  duration: const Duration(seconds: 2),
                ));
              }
            } else {
              // API returned failure — revert
              if (mounted) setState(() => _autoPayOptimistic = !val);
            }
          } catch (e) {
            // Network/error — revert
            if (mounted) setState(() => _autoPayOptimistic = !val);
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('${AppL10n.of(context).autoPayToggleFailed}: $e'),
                backgroundColor: Colors.red,
              ));
            }
          }
        },
      ),
    );
  }

  // ── Language Card ────────────────────────────────────────────────────────
  Widget _buildLanguageCard() {
    return Consumer<LanguageProvider>(
      builder: (context, langProvider, _) => Card(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: ListTile(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.language_rounded,
                color: Color(0xFF7C3AED)),
          ),
          title: Text(AppL10n.of(context).languageSettingLabel,
              style: const TextStyle(fontWeight: FontWeight.w600)),
          subtitle: Text(
            langProvider.languageName,
            style: const TextStyle(fontSize: 12),
          ),
          trailing: const Icon(Icons.chevron_right, color: Colors.grey),
          onTap: () => LanguageSelectorDialog.show(context),
        ),
      ),
    );
  }

  Widget _buildKycBanner(KycProvider kycProvider) {
    if (kycProvider.isVerified) {
      // Small verified chip instead of full banner
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.green.shade50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.green.shade200),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.verified, color: Colors.green.shade700, size: 16),
            const SizedBox(width: 6),
            Text(AppL10n.of(context).kycVerified, style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w600, fontSize: 13)),
          ],
        ),
      );
    }

    final isSubmitted = kycProvider.isSubmitted;
    final isRejected = kycProvider.isRejected;

    return GestureDetector(
      onTap: () async {
        final refreshed = await Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const KycScreen()),
        );
        if (refreshed == true) _loadData();
      },
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isSubmitted
              ? Colors.orange.shade50
              : isRejected
                  ? Colors.red.shade50
                  : const Color(0xFF7C3AED).withOpacity(0.07),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSubmitted
                ? Colors.orange.shade200
                : isRejected
                    ? Colors.red.shade200
                    : const Color(0xFF7C3AED).withOpacity(0.3),
          ),
        ),
        child: Row(
          children: [
            Icon(
              isSubmitted ? Icons.hourglass_top : isRejected ? Icons.cancel_outlined : Icons.shield_outlined,
              color: isSubmitted ? Colors.orange.shade700 : isRejected ? Colors.red.shade700 : const Color(0xFF7C3AED),
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isSubmitted
                        ? AppL10n.of(context).kycUnderReview
                        : isRejected
                            ? AppL10n.of(context).kycRejected
                            : AppL10n.of(context).completeKyc,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSubmitted ? Colors.orange.shade800 : isRejected ? Colors.red.shade800 : const Color(0xFF7C3AED),
                      fontSize: 13,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isSubmitted
                        ? AppL10n.of(context).kycDescription
                        : isRejected
                            ? (kycProvider.rejectionReason ?? AppL10n.of(context).kycDescription)
                            : AppL10n.of(context).kycDescription,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                  ),
                ],
              ),
            ),
            if (!isSubmitted)
              const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(Map<String, dynamic>? user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: const Color(0xFF7C3AED).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.person,
              size: 32,
              color: Color(0xFF7C3AED),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?['name'] ?? 'Borrower',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user?['email'] ?? '',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.blue.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.verified,
                            size: 14,
                            color: Colors.blue[700],
                          ),
                          const SizedBox(width: 4),
                          Text(
                            AppL10n.of(context).borrowerLabel,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[700],
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWalletBalance() {
    final walletProvider = Provider.of<WalletProvider>(context);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF7C3AED), Color(0xFF9F7AEA)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF7C3AED).withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppL10n.of(context).walletBalance,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.add_circle, color: Colors.white),
                onPressed: _showAddFundsDialog,
                tooltip: AppL10n.of(context).addFunds,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _currencyFormat.format(walletProvider.availableBalance),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            AppL10n.of(context).availableBalance,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
          if (walletProvider.lockedBalance > 0) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    AppL10n.of(context).lockedFundsLoans,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    _currencyFormat.format(walletProvider.lockedBalance),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showAddFundsDialog() {
    final amountController = TextEditingController();
    final formKey = GlobalKey<FormState>();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppL10n.of(context).addFunds),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                AppL10n.of(context).walletBalance,
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: amountController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: AppL10n.of(context).amount,
                  prefixIcon: const Icon(Icons.currency_rupee),
                  border: const OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return AppL10n.of(context).pleaseEnterAmount;
                  }
                  final amount = double.tryParse(value);
                  if (amount == null || amount <= 0) {
                    return AppL10n.of(context).error;
                  }
                  if (amount > 100000) {
                    return 'Maximum ₹1,00,000';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(AppL10n.of(context).cancel),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                Navigator.pop(context);
                
                final walletProvider = Provider.of<WalletProvider>(context, listen: false);
                final amount = double.parse(amountController.text);
                
                final success = await walletProvider.requestDeposit(amount);
                
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        success
                            ? '₹${amount.toStringAsFixed(2)} ${AppL10n.of(context).success}'
                            : walletProvider.error ?? AppL10n.of(context).error,
                      ),
                      backgroundColor: success ? Colors.green : Colors.red,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
            ),
            child: Text(AppL10n.of(context).addFunds),
          ),
        ],
      ),
    );
  }

  Widget _buildCreditScore(dynamic creditScoreData) {
    if (creditScoreData == null) return const SizedBox.shrink();

    print('=== Credit Score Debug ===');
    print('Credit score data type: ${creditScoreData.runtimeType}');
    print('Credit score data: $creditScoreData');

    // Extract score - handle nested creditScore object
    int score = 0;
    String rating = 'New Borrower';
    
    if (creditScoreData is Map) {
      // Check if creditScore is nested (borrowerSummary contains creditScore object)
      if (creditScoreData.containsKey('creditScore') && creditScoreData['creditScore'] is Map) {
        final nestedScore = creditScoreData['creditScore'];
        score = (nestedScore['score'] ?? 0).toInt();
        rating = nestedScore['rating'] ?? 'New Borrower';
        print('Extracted from nested creditScore - score: $score, rating: $rating');
      } else if (creditScoreData.containsKey('score')) {
        // Direct score object
        score = (creditScoreData['score'] ?? 0).toInt();
        rating = creditScoreData['rating'] ?? 'New Borrower';
        print('Extracted from direct Map - score: $score, rating: $rating');
      }
    } else if (creditScoreData is int) {
      score = creditScoreData;
      print('Direct int value: $score');
    }

    final scorePercentage = score / 1000;
    Color scoreColor;
    
    if (score >= 800) {
      scoreColor = Colors.green;
    } else if (score >= 650) {
      scoreColor = Colors.blue;
    } else if (score >= 500) {
      scoreColor = Colors.orange;
    } else {
      scoreColor = Colors.red;
    }
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [scoreColor.withOpacity(0.1), Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: scoreColor.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Credit Score',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: scoreColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  rating,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 120,
                height: 120,
                child: CircularProgressIndicator(
                  value: scorePercentage,
                  strokeWidth: 12,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
                ),
              ),
              Column(
                children: [
                  Text(
                    score.toString(),
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: scoreColor,
                    ),
                  ),
                  Text(
                    AppL10n.of(context).outOf1000,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLoanSummary(Map<String, dynamic>? summary) {
    if (summary == null) return const SizedBox.shrink();

    final totalLoans = summary['totalLoans'] ?? 0;
    final totalBorrowed = (summary['totalBorrowed'] ?? 0).toDouble();
    final totalRepaid = (summary['totalRepaid'] ?? 0).toDouble();
    final activeLoans = summary['activeLoans'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppL10n.of(context).loanSummary,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.4,
          children: [
            StatCard(
              title: AppL10n.of(context).totalLoans,
              value: totalLoans.toString(),
              icon: Icons.receipt_long,
              color: const Color(0xFF7C3AED),
            ),
            StatCard(
              title: AppL10n.of(context).totalBorrowed,
              value: '₹${totalBorrowed.toStringAsFixed(2)}',
              icon: Icons.account_balance_wallet,
              color: Colors.blue,
            ),
            StatCard(
              title: AppL10n.of(context).totalRepaid,
              value: '₹${totalRepaid.toStringAsFixed(2)}',
              icon: Icons.check_circle,
              color: Colors.green,
            ),
            StatCard(
              title: AppL10n.of(context).activeLoans,
              value: activeLoans.toString(),
              icon: Icons.pending,
              color: Colors.orange,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActiveLoans(List<dynamic> loans) {
    debugPrint('=== Active Loans Debug ===');
    debugPrint('Total loans received: ${loans.length}');
    
    // Log all loan statuses
    for (var loan in loans) {
      debugPrint('Loan ${loan['loanId']}: status = ${loan['status']}');
    }
    
    // Filter for active loans - check both 'Active' and 'Funded' status
    final activeLoans = loans.where((loan) {
      final status = loan['status'];
      return status == 'Active' || status == 'Funded';
    }).toList();
    
    debugPrint('Active loans found: ${activeLoans.length}');

    if (activeLoans.isEmpty) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              AppL10n.of(context).activeLoansSection,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                '${activeLoans.length}',
                style: const TextStyle(
                  color: Colors.orange,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Column(
          children: activeLoans.map((loan) {
            final amount = (loan['amount'] ?? 0).toDouble();
            // Backend field is annualInterestRate, not interestRate
            final interestRate = (loan['annualInterestRate'] ?? loan['interestRate'] ?? 0).toDouble();
            // Correct total = sum of all EMI amounts from schedule
            final schedule = (loan['emiSchedule'] as List?) ?? [];
            double totalRepayment = schedule.fold(0.0,
              (sum, e) => sum + ((e['emiAmount'] as num?)?.toDouble() ?? 0.0));
            // Fallback to simple estimate if schedule empty
            if (totalRepayment == 0) totalRepayment = amount + (amount * interestRate / 100);
            final lenders = loan['lenders'] ?? [];
            final loanId = loan['id'] ?? loan['_id'];

            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.orange.withOpacity(0.3)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Loan #${loan['loanId'] ?? 'N/A'}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          AppL10n.of(context).activeLoans,
                          style: const TextStyle(
                            color: Colors.orange,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    loan['reason'] ?? 'No description',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppL10n.of(context).principalRepaid,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '₹${amount.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppL10n.of(context).interest,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '${interestRate.toStringAsFixed(1)}%',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            AppL10n.of(context).totalDueNow,
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[600],
                            ),
                          ),
                          Text(
                            '₹${totalRepayment.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.orange,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    '${lenders.length} Lender(s)',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _showEmiRepaymentDialog(loan),
                      icon: const Icon(Icons.payment),
                      label: const Text('Pay Next EMI'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // EMI-based repayment dialog (mirrors borrower_dashboard.dart logic)
  void _showEmiRepaymentDialog(Map<String, dynamic> loan) {
    // ── Pull next pending EMI from schedule ──────────────────────────────────
    final schedule = (loan['emiSchedule'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final nextEmi = schedule.firstWhere(
      (e) => e['status'] == 'pending',
      orElse: () => <String, dynamic>{},
    );

    final durationMonths = (loan['durationMonths'] as num?)?.toInt() ?? 0;
    final emisPaid = (loan['emisPaid'] as num?)?.toInt() ?? 0;
    final emisRemaining = durationMonths - emisPaid;

    final emiNumber = (nextEmi['emiNumber'] as num?)?.toInt() ?? (emisPaid + 1);
    final emiAmount = (nextEmi['emiAmount'] as num?)?.toDouble()
        ?? (loan['emiAmount'] as num?)?.toDouble()
        ?? 0.0;
    final principalComponent = (nextEmi['principalComponent'] as num?)?.toDouble() ?? 0.0;
    final interestComponent = (nextEmi['interestComponent'] as num?)?.toDouble() ?? 0.0;
    final penaltyAmount = (nextEmi['penaltyAmount'] as num?)?.toDouble() ?? 0.0;
    final penaltyPaid = nextEmi['penaltyPaid'] == true;
    final penaltyDue = (!penaltyPaid && penaltyAmount > 0) ? penaltyAmount : 0.0;
    final totalDue = emiAmount + penaltyDue;

    final dueDate = nextEmi['dueDate'] != null
        ? DateTime.tryParse(nextEmi['dueDate'].toString())
        : null;
    final isOverdue = dueDate != null && dueDate.isBefore(DateTime.now());

    // If no pending EMI, show info
    if (nextEmi.isEmpty && emisPaid >= durationMonths) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppL10n.of(context).emiPaidSuccess),
          backgroundColor: Colors.green,
        ),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.payment, color: isOverdue ? Colors.orange : const Color(0xFF7C3AED)),
            const SizedBox(width: 8),
            Text(isOverdue ? AppL10n.of(context).emiOverdue : AppL10n.of(context).payNextEmiTitle),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── EMI counter ───────────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF3E8FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF7C3AED), width: 0.8),
                ),
                child: Column(
                  children: [
                    Text(
                      'EMI $emiNumber of $durationMonths',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Color(0xFF7C3AED),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$emisRemaining EMI${emisRemaining != 1 ? 's' : ''} remaining after this',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    if (dueDate != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        'Due: ${dueDate.day.toString().padLeft(2, '0')} ${_monthName(dueDate.month)} ${dueDate.year}${isOverdue ? ' ⚠️ OVERDUE' : ''}',
                        style: TextStyle(
                          fontSize: 12,
                          color: isOverdue ? Colors.orange : Colors.grey,
                          fontWeight: isOverdue ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // ── Breakdown ─────────────────────────────────────────────────
              _repayRow(AppL10n.of(context).principalRepaid, '₹${principalComponent.toStringAsFixed(2)}'),
              _repayRow(AppL10n.of(context).interest, '₹${interestComponent.toStringAsFixed(2)}'),
              const Divider(height: 12),
              _repayRow(AppL10n.of(context).emiAmount, '₹${emiAmount.toStringAsFixed(2)}', bold: true),

              if (penaltyDue > 0) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.red[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        const Icon(Icons.warning, color: Colors.red, size: 14),
                        const SizedBox(width: 4),
                        Text(AppL10n.of(context).latePenalty, style: const TextStyle(color: Colors.red, fontSize: 12)),
                      ]),
                      Text('₹${penaltyDue.toStringAsFixed(2)}',
                          style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],

              const Divider(height: 14),
              _repayRow(AppL10n.of(context).totalDueNow, '₹${totalDue.toStringAsFixed(2)}', bold: true, color: const Color(0xFF7C3AED)),

              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  AppL10n.of(context).reducingBalanceNote,
                  style: const TextStyle(fontSize: 11, color: Colors.blueGrey),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(AppL10n.of(context).cancel),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF7C3AED),
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(dialogContext);

              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (ctx) => const Center(child: CircularProgressIndicator()),
              );

              try {
                final loanProvider = Provider.of<LoanProvider>(context, listen: false);
                final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
                final walletProvider = Provider.of<WalletProvider>(context, listen: false);

                final loanId = loan['_id'] ?? loan['id'];
                final success = await loanProvider.repayEmi(loanId);

                if (mounted) Navigator.pop(context);

                if (success) {
                  // Refresh data — also refresh user so credit score is updated everywhere
                  final authProvider = Provider.of<AuthProvider>(context, listen: false);
                  await Future.wait([
                    profileProvider.fetchBorrowerSummary(),
                    profileProvider.fetchLoanHistory(),
                    walletProvider.fetchBalance(),
                    authProvider.refreshUser(),
                  ]);

                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(
                        '${AppL10n.of(context).emiAmount} $emiNumber/$durationMonths ${AppL10n.of(context).success}! ₹${totalDue.toStringAsFixed(2)} deducted.',
                      ),
                      backgroundColor: Colors.green,
                      duration: const Duration(seconds: 4),
                    ));
                  }
                } else {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(loanProvider.error ?? AppL10n.of(context).repaymentFailed),
                      backgroundColor: Colors.red,
                    ));
                  }
                }
              } catch (e) {
                if (mounted) Navigator.pop(context);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('${AppL10n.of(context).error}: $e'),
                    backgroundColor: Colors.red,
                  ));
                }
              }
            },
            child: Text('${AppL10n.of(context).totalDueNow} ₹${totalDue.toStringAsFixed(2)}'),
          ),
        ],
      ),
    );
  }

  // Helper row for breakdown
  Widget _repayRow(String label, String value, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
          Text(value,
              style: TextStyle(
                fontSize: 13,
                fontWeight: bold ? FontWeight.bold : FontWeight.w600,
                color: color,
              )),
        ],
      ),
    );
  }

  String _monthName(int m) =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];

  Widget _buildLoanHistory(List<dynamic> loans) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppL10n.of(context).loanHistory,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        loans.isEmpty
            ? Container(
                padding: const EdgeInsets.all(32),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Column(
                    children: [
                      Icon(
                        Icons.inbox,
                        size: 64,
                        color: Colors.grey[300],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        AppL10n.of(context).noLoansYet,
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              )
            : Column(
                children: loans.map((loan) {
                  final amount = (loan['amount'] ?? 0).toDouble();
                  final status = loan['status'] ?? 'Requested';
                  final createdAt = DateTime.tryParse(
                    loan['createdAt'] ?? '',
                  ) ?? DateTime.now();
                  final lenders = loan['lenders'] ?? [];

                  return TransactionListItem(
                    title: 'Loan #${loan['loanId'] ?? 'N/A'}',
                    subtitle: '${lenders.length} lender(s) • ${loan['reason'] ?? 'No description'}',
                    amount: amount,
                    date: createdAt,
                    status: status,
                    onTap: () {
                      // TODO: Navigate to loan detail screen
                    },
                  );
                }).toList(),
              ),
      ],
    );
  }
}
