/**
 * Lender Dashboard
 * 
 * Features:
 * - View all available loans
 * - Filter loans
 * - Fund loans
 * - View funded loans
 */

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/loan_provider.dart';
import '../providers/wallet_provider.dart';
import '../providers/profile_provider.dart';
import '../providers/kyc_provider.dart';
import '../providers/language_provider.dart';
import '../l10n/app_localizations.dart';
import '../widgets/loan_card.dart';
import 'kyc_screen.dart';
import 'package:intl/intl.dart';

class LenderDashboard extends StatefulWidget {
  const LenderDashboard({super.key});

  @override
  State<LenderDashboard> createState() => _LenderDashboardState();
}

class _LenderDashboardState extends State<LenderDashboard> {
  @override
  void initState() {
    super.initState();
    // Fetch loans on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final loanProvider = Provider.of<LoanProvider>(context, listen: false);
      loanProvider.fetchAllLoans();
      loanProvider.fetchMyLoans();
      Provider.of<KycProvider>(context, listen: false).fetchKycStatus();
    });
  }

  void _showKycRequired() {
    final l10n = AppL10n.of(context);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified_user_outlined, size: 48, color: Color(0xFF7C3AED)),
            const SizedBox(height: 16),
            Text(
              l10n.kycRequiredTitle,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              l10n.kycRequiredBody,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.arrow_forward),
                label: Text(l10n.completeKycNow),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const KycScreen()),
                  );
                },
              ),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(l10n.cancel),
            ),
          ],
        ),
      ),
    );
  }

  void _showFundLoanDialog(Map<String, dynamic> loan) {
    // ─── KYC Guard ───────────────────────────────────────────────
    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    if (!kycProvider.isVerified) {
      _showKycRequired();
      return;
    }
    // ─────────────────────────────────────────────────────────────

    // Lender always earns the base 12% p.a. (platform fixed rate for lenders).
    // The borrower may pay more (14–27%), but that surplus goes to platform.
    const double lenderRate = 12.0;
    final loanDuration = (loan['durationMonths'] as num?)?.toInt() ?? 12;

    // ── Estimate lender's net return (12% base, minus 4.5% service fee) ────────
    double estimatedNetReturn(double principal) {
      final r = lenderRate / 12 / 100;
      final n = loanDuration;
      double f = 1.0;
      for (int i = 0; i < n; i++) f *= (1 + r);
      final totalEmi = n == 0 ? principal : (principal * r * f) / (f - 1);
      return (totalEmi * n * (1 - 0.045)).roundToDouble();
    }
    // ────────────────────────────────────────────────────────────────────────

    final formKey = GlobalKey<FormState>();
    final amountController = TextEditingController();
    final loanAmount = (loan['amount'] as num?)?.toDouble() ?? 0.0;
    final fundedAmount = (loan['fundedAmount'] as num?)?.toDouble() ?? 0.0;
    final remainingAmount = loanAmount - fundedAmount;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (_, setInner) {
          final rawAmt = double.tryParse(amountController.text) ?? 0;
          final netReturn = rawAmt > 0 ? estimatedNetReturn(rawAmt) : 0.0;
          final profit = netReturn - rawAmt;

          return AlertDialog(
            title: Text(AppL10n.of(context).fundLoan),
            content: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ── Lender rate info pill ──
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEEF2FF), // Violet -> light indigo
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFF312E81), width: 0.8),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text('Your Interest Rate', style: TextStyle(fontSize: 11, color: Colors.grey)),
                            Text('12% p.a.', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF312E81), fontSize: 16)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: const [
                            Text('Net rate (after 4.5% fee)', style: TextStyle(fontSize: 10, color: Colors.grey)),
                            Text('~11.5% p.a.', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green, fontSize: 14)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Remaining: ₹${remainingAmount.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.bodyLarge,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: amountController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Amount to Fund (₹)',
                      prefixIcon: Icon(Icons.currency_rupee),
                    ),
                    onChanged: (_) => setInner(() {}),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Please enter amount';
                      final amount = double.tryParse(value);
                      if (amount == null || amount <= 0) return 'Invalid amount';
                      if (amount > remainingAmount) return 'Amount exceeds remaining';
                      return null;
                    },
                  ),
                  // ── Live return preview ──
                  if (rawAmt > 0) ...[  
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.green[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total you receive back', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text('₹${netReturn.toStringAsFixed(2)}', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green[700])),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Profit (net of fees)', style: TextStyle(fontSize: 12, color: Colors.grey)),
                              Text(
                                profit >= 0 ? '+₹${profit.toStringAsFixed(2)}' : '-₹${(-profit).toStringAsFixed(2)}',
                                style: TextStyle(fontWeight: FontWeight.bold, color: profit >= 0 ? Colors.green[700] : Colors.red),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Platform deducts 4.5% per EMI as service fee.',
                            style: TextStyle(fontSize: 10, color: Colors.grey),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  ],
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
                  backgroundColor: const Color(0xFF4338CA), // Lighter indigo
                  foregroundColor: Colors.white,
                ),
                onPressed: () async {
                  if (formKey.currentState!.validate()) {
                    Navigator.pop(dialogContext);
                    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
                    final success = await loanProvider.fundLoan(
                      loanId: loan['id'],
                      amount: double.parse(amountController.text),
                    );
                    if (success && mounted) {
                      Provider.of<WalletProvider>(context, listen: false).fetchBalance();
                      final profileProvider = Provider.of<ProfileProvider>(context, listen: false);
                      profileProvider.fetchLenderPortfolio();
                      profileProvider.fetchPortfolioGraph();
                    }
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                        content: Text(success
                            ? AppL10n.of(context).investmentSuccess
                            : loanProvider.error ?? AppL10n.of(context).investmentFailed),
                        backgroundColor: success ? Colors.green : Colors.red,
                      ));
                    }
                  }
                },
                child: Text(AppL10n.of(context).fund),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    context.watch<LanguageProvider>(); // rebuild instantly on language change
    final l10n = AppL10n.of(context);
    final user = Provider.of<AuthProvider>(context).user;
    String rawName = 'User';
    if (user != null && user['email'] != null) {
      rawName = user['email'].split('@').first;
    } else if (user != null && user['firstName'] != null) {
      rawName = user['firstName'];
    }
    final userName = rawName.isNotEmpty ? '${rawName[0].toUpperCase()}${rawName.substring(1)}' : 'User';
    final getInitials = (String name) => name.isNotEmpty ? name[0].toUpperCase() : 'U';

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFF312E81), // Darker Indigo background for header
        body: SafeArea(
          child: Column(
            children: [
              // Custom Header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.white24,
                      child: Text(getInitials(userName), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Hi, $userName',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.account_circle, color: Colors.white),
                      tooltip: l10n.myPortfolio,
                      onPressed: () {
                        Navigator.of(context).pushNamed('/lender-profile');
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.logout, color: Colors.white),
                      tooltip: l10n.logout,
                      onPressed: () async {
                        await Provider.of<AuthProvider>(context, listen: false).logout();
                        if (mounted) {
                          Navigator.of(context).pushReplacementNamed('/login');
                        }
                      },
                    ),
                  ],
                ),
              ),

              // TabBar inside the dark header area
              TabBar(
                labelColor: Colors.white,
                unselectedLabelColor: Colors.white54,
                indicatorColor: Colors.white,
                indicatorWeight: 3,
                tabs: [
                  Tab(text: l10n.availableLoans),
                  Tab(text: l10n.myInvestments),
                ],
              ),
              
              const SizedBox(height: 10),

              // Main Content Area (Tab Views)
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: Color(0xFFF9FAFB), // Very light gray/white background
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
                    child: TabBarView(
                      children: [
                        _buildAvailableLoansTab(),
                        _buildMyInvestmentsTab(),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAvailableLoansTab() {
    return Consumer<LoanProvider>(
      builder: (context, loanProvider, _) {
        if (loanProvider.isLoading && loanProvider.allLoans.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (loanProvider.allLoans.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.inbox, size: 80, color: Colors.grey[400]),
                const SizedBox(height: 16),
                Text(AppL10n.of(context).noAvailableLoans, style: Theme.of(context).textTheme.headlineSmall),
              ],
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: loanProvider.allLoans.length + 1, // +1 for the earnings banner
          itemBuilder: (context, index) {
            // First item = earnings info banner
            if (index == 0) {
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4338CA), Color(0xFF312E81)], // Lighter theme colors
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.trending_up, color: Colors.white, size: 32),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Earn with Your Money',
                            style: TextStyle(color: Colors.white70, fontSize: 13)),
                        SizedBox(height: 2),
                        Text('Interest: 12% p.a.',
                            style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        SizedBox(height: 2),
                        Text('Fixed base return on every funded loan.',
                            style: TextStyle(color: Colors.white70, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              );
            }

            final loan = loanProvider.allLoans[index - 1];
            final status = loan['status'];
            Widget? actionButton;
            if (status == 'Requested') {
              actionButton = ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4338CA), // Lighter indigo to match the banner above
                  foregroundColor: Colors.white,
                ),
                onPressed: () => _showFundLoanDialog(loan),
                icon: const Icon(Icons.account_balance_wallet),
                label: Text(AppL10n.of(context).fundLoan),
              );
            }
            return LoanCard(loan: loan, actionButton: actionButton, viewerRole: 'lender');
          },
        );
      },
    );
  }

  Widget _rateChip(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildMyInvestmentsTab() {
    return Consumer<LoanProvider>(
      builder: (context, loanProvider, _) {
        if (loanProvider.isLoading && loanProvider.myLoans.isEmpty) {
          return const Center(child: CircularProgressIndicator());
        }

        if (loanProvider.myLoans.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.inbox,
                  size: 80,
                  color: Colors.grey[400],
                ),
                const SizedBox(height: 16),
                Text(
                  AppL10n.of(context).noInvestmentsYet,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                Text(
                  'Start funding loans to see them here',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            await loanProvider.fetchMyLoans();
            if (context.mounted) {
              Provider.of<WalletProvider>(context, listen: false).fetchBalance();
              final pp = Provider.of<ProfileProvider>(context, listen: false);
              pp.fetchLenderPortfolio();
              pp.fetchPortfolioGraph();
            }
          },
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: loanProvider.myLoans.length,
            itemBuilder: (context, index) {
              final loan = loanProvider.myLoans[index];
              return GestureDetector(
                onTap: () => _showLoanEmiDetail(loan),
                child: LoanCard(loan: loan, viewerRole: 'lender'),
              );
            },
          ),
        );
      },
    );
  }

  // ── Lender EMI Detail Bottom Sheet ───────────────────────────────────────
  void _showLoanEmiDetail(Map<String, dynamic> loan) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '\u20b9', decimalDigits: 2);

    final schedule = (loan['emiSchedule'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final durationMonths = (loan['durationMonths'] as num?)?.toInt() ?? schedule.length;
    final emisPaid = (loan['emisPaid'] as num?)?.toInt() ?? schedule.where((e) => e['status'] == 'paid').length;
    final emisRemaining = durationMonths - emisPaid;
    final totalLoanAmount = (loan['amount'] as num?)?.toDouble() ?? 1.0;

    // Find this lender's contribution
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final myUserId = authProvider.userData?['_id'] ?? authProvider.userData?['id'] ?? '';
    final lenders = (loan['lenders'] as List?) ?? [];
    final myLenderEntry = lenders.cast<Map<String, dynamic>>().firstWhere(
      (l) {
        // DB stores as lenderId (ObjectId), but populated versions may use lender._id
        final lid = l['lenderId']?.toString()
            ?? l['lender']?['_id']?.toString()
            ?? l['lender']?['id']?.toString()
            ?? '';
        return lid == myUserId;
      },
      orElse: () => {},
    );
    // contributionAmount is the DB field name; fall back to contribution for older data
    final myContribution = (myLenderEntry['contributionAmount'] as num?)?.toDouble()
        ?? (myLenderEntry['contribution'] as num?)?.toDouble()
        ?? 0.0;
    final myShare = totalLoanAmount > 0 ? myContribution / totalLoanAmount : 0.0;

    // Total money received = sum of paid EMIs × my share
    double totalReceived = 0.0;
    for (final emi in schedule) {
      if (emi['status'] == 'paid') {
        final amt = (emi['emiAmount'] as num?)?.toDouble() ?? 0.0;
        totalReceived += amt * myShare;
      }
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.4,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // ── Drag handle ──
              Container(
                margin: const EdgeInsets.only(top: 10),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 8),

              // ── Header ──
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Loan #${loan['loanId'] ?? 'N/A'}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'EMI Tracker',
                        style: const TextStyle(color: Color(0xFF7C3AED), fontWeight: FontWeight.w600, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // ── Summary row ──
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7C3AED), Color(0xFF5B21B6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _emiStat('Paid', '$emisPaid', Colors.greenAccent),
                      Container(width: 1, height: 36, color: Colors.white30),
                      _emiStat('Remaining', '$emisRemaining', Colors.orangeAccent),
                      Container(width: 1, height: 36, color: Colors.white30),
                      _emiStat('Total\nReceived', currencyFormat.format(totalReceived), Colors.white),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),

              const Divider(height: 1),

              // ── EMI cards list ──
              Expanded(
                child: schedule.isEmpty
                    ? const Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.hourglass_empty, size: 48, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('EMI schedule not available yet.', style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: schedule.length,
                        itemBuilder: (_, i) {
                          final emi = schedule[i];
                          final status = emi['status'] ?? 'pending';
                          final isPaid = status == 'paid';
                          final rawEmiAmt = (emi['emiAmount'] as num?)?.toDouble() ?? 0.0;
                          final principal = (emi['principalComponent'] as num?)?.toDouble() ?? 0.0;
                          final interest = (emi['interestComponent'] as num?)?.toDouble() ?? 0.0;
                          // Fallback: if emiAmount missing/0 derive from components
                          final emiAmt = rawEmiAmt > 0 ? rawEmiAmt : (principal + interest);
                          final myEmiAmt = emiAmt * myShare;
                          final emiNum = (emi['emiNumber'] as num?)?.toInt() ?? (i + 1);
                          final paidDate = emi['paidDate'] != null
                              ? DateTime.tryParse(emi['paidDate'].toString())
                              : null;
                          final dueDate = emi['dueDate'] != null
                              ? DateTime.tryParse(emi['dueDate'].toString())
                              : null;
                          final isOverdue = !isPaid && dueDate != null && dueDate.isBefore(DateTime.now());

                          Color borderColor;
                          Color bgColor;
                          Color iconColor;
                          IconData statusIcon;
                          String statusLabel;

                          if (isPaid) {
                            borderColor = Colors.green;
                            bgColor = Colors.green.shade50;
                            iconColor = Colors.green;
                            statusIcon = Icons.check_circle;
                            statusLabel = 'Paid';
                          } else if (isOverdue) {
                            borderColor = Colors.red;
                            bgColor = Colors.red.shade50;
                            iconColor = Colors.red;
                            statusIcon = Icons.warning_rounded;
                            statusLabel = 'Overdue';
                          } else {
                            borderColor = Colors.grey.shade300;
                            bgColor = Colors.grey.shade50;
                            iconColor = Colors.grey;
                            statusIcon = Icons.schedule;
                            statusLabel = 'Pending';
                          }

                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: bgColor,
                              border: Border.all(color: borderColor, width: isPaid ? 1.8 : 1.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                // Status icon circle
                                Container(
                                  width: 38,
                                  height: 38,
                                  decoration: BoxDecoration(
                                    color: borderColor.withOpacity(0.12),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(statusIcon, color: iconColor, size: 20),
                                ),
                                const SizedBox(width: 12),
                                // Main info
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'EMI $emiNum of $durationMonths',
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                      const SizedBox(height: 2),
                                      if (isPaid && paidDate != null)
                                        Text(
                                          'Paid on ${paidDate.day.toString().padLeft(2, '0')} ${_monthName(paidDate.month)} ${paidDate.year}',
                                          style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                                        )
                                      else if (dueDate != null)
                                        Text(
                                          'Due: ${dueDate.day.toString().padLeft(2, '0')} ${_monthName(dueDate.month)} ${dueDate.year}',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: isOverdue ? Colors.red : Colors.grey[600],
                                          ),
                                        ),
                                    ],
                                  ),
                                ),
                                // Amount + status badge
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text(
                                      currencyFormat.format(myEmiAmt),
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: isPaid ? Colors.green[700] : Colors.black87,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: borderColor.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        statusLabel,
                                        style: TextStyle(fontSize: 10, color: iconColor, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // Small stat column for the summary bar
  Widget _emiStat(String label, String value, Color valueColor) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value,
            style: TextStyle(color: valueColor, fontWeight: FontWeight.bold, fontSize: 15),
            textAlign: TextAlign.center),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(color: Colors.white70, fontSize: 10),
            textAlign: TextAlign.center),
      ],
    );
  }

  String _monthName(int m) =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}
