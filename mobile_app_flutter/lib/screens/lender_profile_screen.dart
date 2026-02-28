import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/profile_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';
import '../providers/kyc_provider.dart';
import '../providers/language_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/stat_card.dart';
import '../widgets/portfolio_chart.dart';
import '../widgets/transaction_list_item.dart';
import '../widgets/language_selector_dialog.dart';
import 'kyc_screen.dart';

/// Lender Profile Screen - INR Only
/// 
/// Displays lender's portfolio analytics, investment history, and ROI graphs
/// All amounts in ₹ (Rupees) - NO crypto display
class LenderProfileScreen extends StatefulWidget {
  const LenderProfileScreen({super.key});

  @override
  State<LenderProfileScreen> createState() => _LenderProfileScreenState();
}

class _LenderProfileScreenState extends State<LenderProfileScreen> {
  final _currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);

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
      profileProvider.fetchLenderPortfolio(),
      profileProvider.fetchInvestmentHistory(),
      profileProvider.fetchPortfolioGraph(),
      kycProvider.fetchKycStatus(),
      if (kycProvider.isVerified) walletProvider.fetchBalance(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    context.watch<LanguageProvider>(); // rebuild instantly on language change
    final authProvider = Provider.of<AuthProvider>(context);
    final profileProvider = Provider.of<ProfileProvider>(context);
    final walletProvider = Provider.of<WalletProvider>(context);
    final user = authProvider.userData; // <-- Re-added this defined user getter
    String rawName = 'Lender';
    if (user != null && user['email'] != null) {
      rawName = user['email'].split('@').first;
    } else if (user != null && user['name'] != null) {
      rawName = user['name'];
    }
    final userName = rawName.isNotEmpty ? '${rawName[0].toUpperCase()}${rawName.substring(1)}' : 'Lender';
    final getInitials = (String name) => name.isNotEmpty ? name[0].toUpperCase() : 'L';

    return Scaffold(
      backgroundColor: const Color(0xFF312E81), // Darker Indigo background for header
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                   IconButton(
                    icon: const Icon(Icons.arrow_back, color: Colors.white, size: 32),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: Colors.white24,
                    child: Text(getInitials(userName), style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                     child: Text(
                      'Hi, $userName',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Main Content Area
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Color(0xFFF9FAFB),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(30),
                    topRight: Radius.circular(30),
                  ),
                ),
                child: ClipRRect(
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(30),
                    topRight: Radius.circular(30),
                  ),
                  child: RefreshIndicator(
                    onRefresh: _loadData,
        child: profileProvider.isLoadingPortfolio
            ? const Center(child: CircularProgressIndicator())
            : profileProvider.portfolioError != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(profileProvider.portfolioError!),
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
                          _buildKycBanner(kycProvider),
                          if (kycProvider.isVerified) ...[
                            const SizedBox(height: 16),
                            _buildWalletBalance(walletProvider),
                          ],
                          const SizedBox(height: 16),
                          _buildLanguageCard(),
                          const SizedBox(height: 24),
                          _buildPortfolioSummary(profileProvider.lenderPortfolio),
                          const SizedBox(height: 24),
                          _buildPortfolioGraph(profileProvider),
                          const SizedBox(height: 24),
                          _buildInvestmentHistory(profileProvider.investmentHistory),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Language Card ──────────────────────────────────────────────────
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
              : isRejected ? Colors.red.shade50
              : const Color(0xFF7C3AED).withOpacity(0.07),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSubmitted
                ? Colors.orange.shade200
                : isRejected ? Colors.red.shade200
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
            if (!isSubmitted) const Icon(Icons.chevron_right, color: Colors.grey),
          ],
        ),
      ),
    );
  }


  Widget _buildWalletBalance(WalletProvider walletProvider) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4338CA), Color(0xFF312E81)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF312E81).withOpacity(0.3),
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
            _currencyFormat.format(walletProvider.balance),
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
                    AppL10n.of(context).lockedFundsInvestments,
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
                AppL10n.of(context).addFundsHint,
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

  Widget _buildPortfolioSummary(Map<String, dynamic>? portfolio) {
    if (portfolio == null) return const SizedBox.shrink();

    final totalInvested = (portfolio['totalInvested'] ?? 0).toDouble();
    final totalReturned = (portfolio['totalReturned'] ?? 0).toDouble();
    final profitLoss = (portfolio['profitLoss'] ?? 0).toDouble();
    final activeInvestments = portfolio['activeInvestments'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppL10n.of(context).portfolioSummary,
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
          childAspectRatio: 1.3,
          children: [
            StatCard(
              title: AppL10n.of(context).totalInvested,
              value: _currencyFormat.format(totalInvested),
              icon: Icons.account_balance_wallet,
              color: const Color(0xFF7C3AED),
            ),
            StatCard(
              title: AppL10n.of(context).totalReturns,
              value: _currencyFormat.format(totalReturned),
              icon: Icons.trending_up,
              color: Colors.green,
            ),
            StatCard(
              title: AppL10n.of(context).profitLoss,
              value: _currencyFormat.format(profitLoss),
              icon: profitLoss >= 0 ? Icons.arrow_upward : Icons.arrow_downward,
              color: profitLoss >= 0 ? Colors.green : Colors.red,
              isPositive: profitLoss >= 0,
            ),
            StatCard(
              title: AppL10n.of(context).activeInvestments,
              value: activeInvestments.toString(),
              icon: Icons.pie_chart,
              color: Colors.blue,
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPortfolioGraph(ProfileProvider profileProvider) {
    final graphData = profileProvider.portfolioGraph;
    
    if (graphData == null || graphData['dataPoints'] == null) {
      return const SizedBox.shrink();
    }

    return PortfolioChart(
      dataPoints: graphData['dataPoints'],
      period: profileProvider.graphPeriod,
      onPeriodChanged: (period) {
        // Provider now handles state updates safely with immediate notifyListeners()
        profileProvider.setGraphPeriod(period);
      },
    );
  }

  Widget _buildInvestmentHistory(List<dynamic> investments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          AppL10n.of(context).investmentHistory,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        investments.isEmpty
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
                        AppL10n.of(context).noInvestmentsYet,
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
                children: investments.map((investment) {
                  final loan = investment['loan'] ?? {};
                  final amount = (investment['amountFunded'] ?? 0).toDouble();
                  final status = investment['status'] ?? 'Active';
                  final fundingDate = DateTime.tryParse(
                    investment['fundingDate'] ?? '',
                  ) ?? DateTime.now();

                  return TransactionListItem(
                    title: 'Loan #${loan['loanId'] ?? 'N/A'}',
                    subtitle: loan['reason'] ?? 'No description',
                    amount: amount,
                    date: fundingDate,
                    status: status,
                    onTap: () {
                      // TODO: Navigate to investment detail screen
                    },
                  );
                }).toList(),
              ),
      ],
    );
  }
}
