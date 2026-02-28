/**
 * Borrower Dashboard
 * 
 * Features:
 * - Create loan requests
 * - View my loans
 * - Accept funded loans
 * - Repay active loans
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
import 'loan_detail_screen.dart';
import 'lenai_chat_screen.dart';

class BorrowerDashboard extends StatefulWidget {
  const BorrowerDashboard({super.key});

  @override
  State<BorrowerDashboard> createState() => _BorrowerDashboardState();
}

class _BorrowerDashboardState extends State<BorrowerDashboard> {
  @override
  void initState() {
    super.initState();
    // Fetch loans on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<LoanProvider>(context, listen: false).fetchMyLoans();
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

  void _showCreateLoanDialog() {
    // ─── KYC Guard ───────────────────────────────────────────────
    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    if (!kycProvider.isVerified) {
      _showKycRequired();
      return;
    }
    // ─────────────────────────────────────────────────────────────

    // RBI-approved durations
    const allowedMonths = [1, 6, 12, 24, 36];
    final formKey = GlobalKey<FormState>();
    final amountController = TextEditingController();
    final reasonController = TextEditingController();
    int selectedMonths = 12;
    // Computed preview fields (updated when amount or months change)
    String? previewEmi;
    String? previewRate;
    final scaffoldContext = context;

    // Base rates mirrors backend: 800+ → 14%, 600-799 → 20%, <600 → 27%
    double _rateForScore(int score) {
      if (score >= 800) return 14.0;
      if (score >= 600) return 20.0;
      return 27.0;
    }

    double _calcEmi(double principal, double annualRate, int months) {
      if (months == 1) return principal * (1 + annualRate / 100 / 12);
      final r = annualRate / 12 / 100;
      double factor = 1.0;
      for (int i = 0; i < months; i++) factor *= (1 + r);
      return (principal * r * factor) / (factor - 1);
    }

    showDialog(
      context: scaffoldContext,
      builder: (dialogContext) => StatefulBuilder(
        builder: (_, setInner) {
          // Rebuild preview when amount or months change
          final raw = double.tryParse(amountController.text);
          if (raw != null && raw >= 1000) {
            // Get credit score from auth user or use default 650
            final authUser = Provider.of<AuthProvider>(scaffoldContext, listen: false).user;
            final score = (authUser?['creditScore'] as num?)?.toInt() ?? 650;
            final rate = _rateForScore(score);
            final emi = _calcEmi(raw, rate, selectedMonths);
            previewRate = '${rate.toStringAsFixed(1)}% p.a.';
            previewEmi = '₹${emi.toStringAsFixed(2)}/mo';
          } else {
            previewRate = null;
            previewEmi = null;
          }

      final l10n = AppL10n.of(context);
      return AlertDialog(
        title: Text(l10n.requestLoan),
            content: SingleChildScrollView(
              child: Form(
                key: formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // ── Amount ──
                    TextFormField(
                      controller: amountController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: l10n.amount,
                        prefixIcon: const Icon(Icons.currency_rupee),
                      ),
                      onChanged: (_) => setInner(() {}),
                      validator: (v) {
                        if (v == null || v.isEmpty) return l10n.pleaseEnterAmount;
                        final amt = double.tryParse(v);
                        if (amt == null || amt < 1000) return l10n.minimumAmount;
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // ── Duration dropdown ──
                    DropdownButtonFormField<int>(
                      value: selectedMonths,
                      decoration: InputDecoration(
                        labelText: l10n.duration,
                        prefixIcon: const Icon(Icons.calendar_month),
                      ),
                      items: allowedMonths.map((m) => DropdownMenuItem(
                        value: m,
                        child: Text('$m month${m > 1 ? 's' : ''}'),
                      )).toList(),
                      onChanged: (v) => setInner(() => selectedMonths = v ?? 12),
                      validator: (_) => null,
                    ),
                    const SizedBox(height: 16),

                    // ── Computed preview ──
                    if (previewRate != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEEF2FF),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF312E81), width: 0.8),
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(l10n.interestRate, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                Text(previewRate!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF312E81))),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(l10n.monthlyEmi, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                                Text(previewEmi!, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF312E81))),
                              ],
                            ),
                            const SizedBox(height: 4),
                              Text(
                              l10n.rateBasedOnScore,
                              style: const TextStyle(fontSize: 10, color: Colors.grey),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              l10n.platformFeeNote,
                              style: const TextStyle(fontSize: 10, color: Colors.orange),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 16),

                    // ── Reason ──
                    TextFormField(
                      controller: reasonController,
                      maxLines: 3,
                      decoration: InputDecoration(
                        labelText: l10n.reason,
                        prefixIcon: const Icon(Icons.description),
                        alignLabelWithHint: true,
                      ),
                      validator: (v) {
                        if (v == null || v.isEmpty) return l10n.pleaseEnterReason;
                        if (v.length < 10) return l10n.reasonTooShort;
                        return null;
                      },
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: Text(AppL10n.of(context).cancel),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4338CA),
                  foregroundColor: Colors.white,
                ),
                onPressed: () async {
                  if (formKey.currentState!.validate()) {
                    Navigator.pop(dialogContext);
                    final loanProvider = Provider.of<LoanProvider>(scaffoldContext, listen: false);
                    final ok = await loanProvider.createLoan(
                      amount: double.parse(amountController.text),
                      durationMonths: selectedMonths,
                      reason: reasonController.text,
                    );
                    if (mounted) {
                      ScaffoldMessenger.of(scaffoldContext).showSnackBar(SnackBar(
                        content: Text(ok
                            ? l10n.loanRequestCreated
                            : loanProvider.error ?? l10n.error),
                        backgroundColor: ok ? Colors.green : Colors.red,
                      ));
                    }
                  }
                },
                child: Text(l10n.submit),
              ),
            ],
          );
        },
      ),
    );
  }

  void _openLoanDetail(String loanId) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => LoanDetailScreen(loanId: loanId)),
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
                    tooltip: l10n.myProfile,
                    onPressed: () {
                      Navigator.of(context).pushNamed('/borrower-profile');
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
            
            const SizedBox(height: 10),

            // Main Content Area (Loans List)
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
                  child: RefreshIndicator(
        onRefresh: () async {
          await Provider.of<LoanProvider>(context, listen: false).fetchMyLoans();
        },
        child: Consumer<LoanProvider>(
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
                      l10n.noLoansYet,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      l10n.createFirstLoan,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: loanProvider.myLoans.length,
              itemBuilder: (context, index) {
                final loan = loanProvider.myLoans[index];
                final status = loan['status'];
                
                Widget? actionButton;
                
                if (status == 'Funded') {
                  actionButton = ElevatedButton.icon(
                    onPressed: () async {
                      final success = await loanProvider.acceptLoan(loan['id']);
                      if (success && mounted) {
                        Provider.of<WalletProvider>(context, listen: false).fetchBalance();
                        Provider.of<ProfileProvider>(context, listen: false).fetchBorrowerSummary();
                      }
                      if (mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(success
                                ? l10n.loanAccepted
                                : loanProvider.error ?? l10n.failedToAcceptLoan),
                            backgroundColor: success ? Colors.green : Colors.red,
                          ),
                        );
                      }
                    },
                    icon: const Icon(Icons.check_circle),
                    label: Text(l10n.acceptLoan),
                  );
                } else if (status == 'Active') {
                  actionButton = ElevatedButton.icon(
                    onPressed: () => _showRepaymentDialog(context, loan, loanProvider),
                    icon: const Icon(Icons.payment),
                    label: Text(l10n.repayLoan),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                    ),
                  );
                }
                
                return LoanCard(
                  loan: loan,
                  actionButton: actionButton,
                );
              },
            );
          },
        ),
      ),
      ),
      ),
      ),
      ],
      ),
      ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── LenAI Agent Button ──────────────────────────────────────────
          FloatingActionButton.small(
            heroTag: 'lenai_fab',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LenAiChatScreen()),
              );
            },
            backgroundColor: Colors.tealAccent.shade400, // Diff color to chat assistant icon
            tooltip: 'LenAI Agent',
            child: const Icon(Icons.smart_toy_rounded, color: Colors.white),
          ),
          const SizedBox(height: 10),
          // ── Create Loan Button ──────────────────────────────────────────
          FloatingActionButton.extended(
            heroTag: 'create_loan_fab',
            onPressed: _showCreateLoanDialog,
            backgroundColor: const Color(0xFF312E81), // matching header dark blue
            icon: const Icon(Icons.add, color: Colors.white), // text should be white
            label: Text(l10n.createLoan, style: const TextStyle(color: Colors.white)), // text should be white
          ),
        ],
      ),
    );
  }

  void _showRepaymentDialog(BuildContext context, Map<String, dynamic> loan, LoanProvider loanProvider) {
    final l10n = AppL10n.of(context);
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

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.payment, color: isOverdue ? Colors.orange : const Color(0xFF312E81)),
            const SizedBox(width: 8),
            Text(isOverdue ? l10n.emiOverdue : l10n.payNextEmiTitle),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── EMI counter ───────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF312E81), width: 0.8),
                ),
                child: Column(
                  children: [
                    Text(
                      'EMI $emiNumber of $durationMonths',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF312E81)),
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

              // ── Breakdown ───────────────────────────────────────────────
              _repayRow(l10n.principalRepaid, '₹${principalComponent.toStringAsFixed(2)}'),
              _repayRow(l10n.interest, '₹${interestComponent.toStringAsFixed(2)}'),
              const Divider(height: 12),
              _repayRow(l10n.emiAmount, '₹${emiAmount.toStringAsFixed(2)}', bold: true),

              if (penaltyDue > 0) ...[
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(children: [
                        const Icon(Icons.warning, color: Colors.red, size: 14),
                        const SizedBox(width: 4),
                        Text(l10n.latePenalty, style: const TextStyle(color: Colors.red, fontSize: 12)),
                      ]),
                      Text('₹${penaltyDue.toStringAsFixed(2)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],

              const Divider(height: 14),
              _repayRow(l10n.totalDueNow, '₹${totalDue.toStringAsFixed(2)}', bold: true, color: const Color(0xFF312E81)),

              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.blue[50], borderRadius: BorderRadius.circular(6)),
                child: Text(
                  l10n.reducingBalanceNote,
                  style: const TextStyle(fontSize: 11, color: Colors.blueGrey),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF312E81),
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
                final success = await loanProvider.repayEmi(loan['id']);

                if (success && context.mounted) {
                  await Future.wait([
                    Provider.of<WalletProvider>(context, listen: false).fetchBalance(),
                    Provider.of<ProfileProvider>(context, listen: false).fetchBorrowerSummary(),
                    Provider.of<AuthProvider>(context, listen: false).refreshUser(),
                  ]);
                }

                if (context.mounted) Navigator.pop(context);

                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(success
                        ? '${AppL10n.of(context).emiAmount} $emiNumber/$durationMonths paid! ₹${totalDue.toStringAsFixed(2)} deducted.'
                        : loanProvider.error ?? AppL10n.of(context).repaymentFailed),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ));
                }
              } catch (e) {
                if (context.mounted) Navigator.pop(context);
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text('Error: $e'),
                    backgroundColor: Colors.red,
                  ));
                }
              }
            },
            child: Text('Pay ₹${totalDue.toStringAsFixed(2)}'),
          ),
        ],
      ),
    );
  }

  // Helper for the repayment dialog rows
  Widget _repayRow(String label, String value, {bool bold = false, Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: Colors.grey)),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: bold ? FontWeight.bold : FontWeight.w600, color: color)),
        ],
      ),
    );
  }

  String _monthName(int m) =>
    ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m - 1];
}

