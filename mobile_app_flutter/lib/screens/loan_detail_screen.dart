/**
 * Loan Detail Screen
 *
 * Shows:
 *   - Loan summary card (amount, rate, duration, EMIs paid)
 *   - Next EMI card (amount due, due date, penalty if any)
 *   - Pay EMI / Prepay buttons
 *   - Prepayment quote with fee warning
 *   - Full EMI schedule table
 *   - Interest rules info card
 */

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/loan_provider.dart';

final _inr = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 2);
final _dateFmt = DateFormat('dd MMM yyyy');

class LoanDetailScreen extends StatefulWidget {
  final String loanId;
  const LoanDetailScreen({super.key, required this.loanId});

  @override
  State<LoanDetailScreen> createState() => _LoanDetailScreenState();
}

class _LoanDetailScreenState extends State<LoanDetailScreen> {
  Map<String, dynamic>? _detail;
  bool _loading = true;
  String? _error;
  bool _actionLoading = false;

  @override
  void initState() {
    super.initState();
    _loadDetail();
  }

  Future<void> _loadDetail() async {
    setState(() { _loading = true; _error = null; });
    final provider = Provider.of<LoanProvider>(context, listen: false);
    final data = await provider.getLoanDetail(widget.loanId);
    setState(() {
      _detail = data;
      _loading = false;
      if (data == null) _error = provider.error ?? 'Failed to load loan detail';
    });
  }

  // ── Pay next EMI ──────────────────────────────────────────────────────────
  Future<void> _payEmi() async {
    final confirm = await _confirmDialog(
      title: 'Pay EMI',
      message: 'Confirm payment of the next EMI?',
      confirmLabel: 'Pay',
      confirmColor: const Color(0xFF7C3AED),
    );
    if (!confirm) return;

    setState(() => _actionLoading = true);
    final provider = Provider.of<LoanProvider>(context, listen: false);
    final ok = await provider.repayEmi(widget.loanId);
    setState(() => _actionLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(ok ? 'EMI paid successfully!' : provider.error ?? 'Payment failed'),
        backgroundColor: ok ? Colors.green : Colors.red,
      ));
      if (ok) _loadDetail();
    }
  }

  // ── Prepay loan ───────────────────────────────────────────────────────────
  Future<void> _prepayLoan() async {
    final prepay = _detail?['prepayQuote'];
    if (prepay == null) return;

    final isFree = (prepay['foreclosureFee'] ?? 0) == 0;
    final feeNote = isFree
        ? 'No foreclosure fee (3+ EMIs paid).'
        : '⚠️  2% foreclosure fee: ${_inr.format(prepay['foreclosureFee'])} will be charged.';

    final confirm = await _confirmDialog(
      title: 'Prepay Loan',
      message: 'Total payable: ${_inr.format(prepay['totalPayable'])}\n\n$feeNote\n\n${prepay['rule'] ?? ''}',
      confirmLabel: 'Prepay',
      confirmColor: Colors.orange,
    );
    if (!confirm) return;

    setState(() => _actionLoading = true);
    final provider = Provider.of<LoanProvider>(context, listen: false);
    final ok = await provider.prepayLoan(widget.loanId);
    setState(() => _actionLoading = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(ok ? '✅ Loan prepaid successfully!' : provider.error ?? 'Prepayment failed'),
        backgroundColor: ok ? Colors.green : Colors.red,
      ));
      if (ok) _loadDetail();
    }
  }

  Future<bool> _confirmDialog({
    required String title,
    required String message,
    required String confirmLabel,
    required Color confirmColor,
  }) async {
    return await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: confirmColor, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(context, true),
            child: Text(confirmLabel),
          ),
        ],
      ),
    ) ?? false;
  }

  // ── Build ─────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F3FF),
      appBar: AppBar(
        title: const Text('Loan Details'),
        backgroundColor: const Color(0xFF7C3AED),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDetail,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? _buildError()
              : _buildBody(),
    );
  }

  Widget _buildError() => Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.error_outline, size: 64, color: Colors.red),
        const SizedBox(height: 16),
        Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
        const SizedBox(height: 24),
        ElevatedButton.icon(
          icon: const Icon(Icons.refresh),
          label: const Text('Retry'),
          onPressed: _loadDetail,
        ),
      ],
    ),
  );

  Widget _buildBody() {
    final loan = _detail!['loan'] as Map<String, dynamic>;
    final nextEmi = _detail!['nextEmi'] as Map<String, dynamic>?;
    final prepayQuote = _detail!['prepayQuote'] as Map<String, dynamic>?;
    final rules = _detail!['interestRules'] as Map<String, dynamic>?;
    final emiSchedule = (loan['emiSchedule'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final status = loan['status'] as String;
    final isActive = status == 'Active';

    return Stack(
      children: [
        RefreshIndicator(
          onRefresh: _loadDetail,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildSummaryCard(loan),
              if (isActive && nextEmi != null) ...[
                const SizedBox(height: 12),
                _buildNextEmiCard(nextEmi),
              ],
              if (isActive && prepayQuote != null) ...[
                const SizedBox(height: 12),
                _buildPrepayCard(prepayQuote),
              ],
              if (rules != null) ...[
                const SizedBox(height: 12),
                _buildRulesCard(rules),
              ],
              if (emiSchedule.isNotEmpty) ...[
                const SizedBox(height: 12),
                _buildScheduleTable(emiSchedule),
              ],
              const SizedBox(height: 80),
            ],
          ),
        ),
        if (isActive)
          Positioned(
            left: 16, right: 16, bottom: 16,
            child: _buildActionBar(nextEmi, prepayQuote),
          ),
        if (_actionLoading)
          Container(
            color: Colors.black26,
            child: const Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }

  // ── Loan Summary Card ─────────────────────────────────────────────────────
  Widget _buildSummaryCard(Map<String, dynamic> loan) {
    final status = loan['status'] as String;
    final statusColor = {
      'Active': Colors.green,
      'Repaid': Colors.blue,
      'Requested': Colors.orange,
      'Funded': Colors.teal,
      'Cancelled': Colors.red,
    }[status] ?? Colors.grey;

    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  _inr.format(loan['amount'] ?? 0),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED)),
                ),
                Chip(
                  label: Text(status, style: const TextStyle(color: Colors.white, fontSize: 12)),
                  backgroundColor: statusColor,
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              loan['reason'] ?? '',
              style: TextStyle(color: Colors.grey[600], fontSize: 13),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const Divider(height: 24),
            _infoRow('Annual Rate', '${loan['annualInterestRate'] ?? '--'}%'),
            _infoRow('Duration', '${loan['durationMonths'] ?? '--'} months'),
            _infoRow('Monthly EMI', loan['emiAmount'] != null ? _inr.format(loan['emiAmount']) : '--'),
            _infoRow('EMIs Paid', '${loan['emisPaid'] ?? 0} / ${loan['durationMonths'] ?? '--'}'),
            _infoRow('Remaining Principal', loan['remainingPrincipal'] != null ? _inr.format(loan['remainingPrincipal']) : '--'),
            if (loan['creditScore'] != null)
              _infoRow('Credit Score', '${loan['creditScore']}'),
            if (loan['isPrepaid'] == true)
              _infoRow('Prepaid', '✅ Yes'),
          ],
        ),
      ),
    );
  }

  // ── Next EMI Card ─────────────────────────────────────────────────────────
  Widget _buildNextEmiCard(Map<String, dynamic> emi) {
    final penalty = (emi['penaltyAmount'] as num?)?.toDouble() ?? 0.0;
    final dueDate = emi['dueDate'] != null ? DateTime.tryParse(emi['dueDate']) : null;
    final isOverdue = dueDate != null && dueDate.isBefore(DateTime.now());

    return Card(
      elevation: 2,
      color: isOverdue ? const Color(0xFFFFF3CD) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isOverdue ? Colors.orange : const Color(0xFF7C3AED), width: 1.5),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(isOverdue ? Icons.warning_amber : Icons.payment, color: isOverdue ? Colors.orange : const Color(0xFF7C3AED)),
                const SizedBox(width: 8),
                Text(
                  isOverdue ? 'EMI OVERDUE' : 'Next EMI Due',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: isOverdue ? Colors.orange : const Color(0xFF7C3AED),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _infoRow('EMI #', '${emi['emiNumber']}'),
            _infoRow('Amount', _inr.format(emi['emiAmount'] ?? 0)),
            _infoRow('Due Date', dueDate != null ? _dateFmt.format(dueDate) : '--'),
            _infoRow('Principal', _inr.format(emi['principalComponent'] ?? 0)),
            _infoRow('Interest', _inr.format(emi['interestComponent'] ?? 0)),
            if (penalty > 0) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(8)),
                child: Row(
                  children: [
                    const Icon(Icons.warning, color: Colors.red, size: 16),
                    const SizedBox(width: 6),
                    Text('Penalty: ${_inr.format(penalty)}', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ── Prepay Quote Card ─────────────────────────────────────────────────────
  Widget _buildPrepayCard(Map<String, dynamic> quote) {
    final isFree = (quote['foreclosureFee'] as num?)?.toDouble() == 0.0;
    return Card(
      elevation: 2,
      color: isFree ? const Color(0xFFE8F5E9) : const Color(0xFFFFF8E1),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(isFree ? Icons.check_circle : Icons.info_outline,
                    color: isFree ? Colors.green : Colors.orange),
                const SizedBox(width: 8),
                Text('Prepayment Quote',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isFree ? Colors.green[800] : Colors.orange[800],
                    )),
              ],
            ),
            const SizedBox(height: 8),
            Text(quote['rule'] ?? '', style: TextStyle(fontSize: 13, color: Colors.grey[700])),
            const Divider(height: 20),
            _infoRow('Remaining Principal', _inr.format(quote['remainingPrincipal'] ?? 0)),
            _infoRow('Current Month Interest', _inr.format(quote['currentMonthInterest'] ?? 0)),
            if (!isFree)
              _infoRow('⚠️  Foreclosure Fee (2%)', _inr.format(quote['foreclosureFee'] ?? 0),
                  valueColor: Colors.orange[800]),
            const Divider(height: 16),
            _infoRow('Total Payable', _inr.format(quote['totalPayable'] ?? 0),
                bold: true, valueColor: const Color(0xFF7C3AED)),
          ],
        ),
      ),
    );
  }

  // ── Rules Card ────────────────────────────────────────────────────────────
  Widget _buildRulesCard(Map<String, dynamic> rules) {
    return Card(
      elevation: 1,
      color: const Color(0xFFF3E8FF),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.info_outline, size: 18, color: Color(0xFF7C3AED)),
                SizedBox(width: 6),
                Text('Platform Fee Policy', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF7C3AED))),
              ],
            ),
            const SizedBox(height: 8),
            _ruleItem(Icons.percent, rules['platformFee']?.toString() ?? '4% upfront on acceptance'),
            _ruleItem(Icons.account_balance, rules['lenderServiceFee']?.toString() ?? '4.5% per EMI to platform'),
            _ruleItem(Icons.payment, rules['prepaymentPolicy']?.toString() ?? 'Prepayment policy'),
          ],
        ),
      ),
    );
  }

  Widget _ruleItem(IconData icon, String text) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 2),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: Colors.grey[600]),
        const SizedBox(width: 6),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 12))),
      ],
    ),
  );

  // ── EMI Schedule Table ────────────────────────────────────────────────────
  Widget _buildScheduleTable(List<Map<String, dynamic>> schedule) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF7C3AED),
            child: const Text('EMI Schedule',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columnSpacing: 12,
              headingRowColor: WidgetStateProperty.all(const Color(0xFFF3E8FF)),
              columns: const [
                DataColumn(label: Text('#', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Due Date', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('EMI', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Principal', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Interest', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Remaining', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
              ],
              rows: schedule.map((e) {
                final emiStatus = e['status'] as String? ?? 'pending';
                final dueDate = e['dueDate'] != null ? DateTime.tryParse(e['dueDate']) : null;
                Color rowColor = Colors.transparent;
                if (emiStatus == 'paid') rowColor = const Color(0xFFE8F5E9);
                if (emiStatus == 'missed') rowColor = const Color(0xFFFFEBEE);

                return DataRow(
                  color: WidgetStateProperty.all(rowColor),
                  cells: [
                    DataCell(Text('${e['emiNumber']}')),
                    DataCell(Text(dueDate != null ? _dateFmt.format(dueDate) : '--', style: const TextStyle(fontSize: 12))),
                    DataCell(Text(_inr.format(e['emiAmount'] ?? 0), style: const TextStyle(fontSize: 12))),
                    DataCell(Text(_inr.format(e['principalComponent'] ?? 0), style: const TextStyle(fontSize: 12))),
                    DataCell(Text(_inr.format(e['interestComponent'] ?? 0), style: const TextStyle(fontSize: 12))),
                    DataCell(Text(_inr.format(e['remainingPrincipal'] ?? 0), style: const TextStyle(fontSize: 12))),
                    DataCell(_buildStatusChip(emiStatus)),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    final cfg = <String, Map<String, dynamic>>{
      'paid':    {'label': '✓ Paid',    'color': Colors.green},
      'pending': {'label': '⏳ Pending', 'color': Colors.orange},
      'missed':  {'label': '✗ Missed',  'color': Colors.red},
    }[status] ?? {'label': status, 'color': Colors.grey};

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: (cfg['color'] as Color).withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: cfg['color'] as Color, width: 0.8),
      ),
      child: Text(cfg['label'] as String,
          style: TextStyle(color: cfg['color'] as Color, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }

  // ── Action Bar ────────────────────────────────────────────────────────────
  Widget _buildActionBar(Map<String, dynamic>? nextEmi, Map<String, dynamic>? prepayQuote) {
    return Row(
      children: [
        if (nextEmi != null)
          Expanded(
            child: ElevatedButton.icon(
              icon: const Icon(Icons.payment),
              label: Text('Pay EMI (${nextEmi['emiAmount'] != null ? _inr.format(nextEmi['emiAmount']) : ''})', overflow: TextOverflow.ellipsis),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _actionLoading ? null : _payEmi,
            ),
          ),
        if (nextEmi != null && prepayQuote != null) const SizedBox(width: 10),
        if (prepayQuote != null)
          Expanded(
            child: OutlinedButton.icon(
              icon: const Icon(Icons.close),
              label: const Text('Prepay', overflow: TextOverflow.ellipsis),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.orange,
                side: const BorderSide(color: Colors.orange),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _actionLoading ? null : _prepayLoan,
            ),
          ),
      ],
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  Widget _infoRow(String label, String value, {bool bold = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
          Text(
            value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.bold : FontWeight.w600,
              fontSize: 13,
              color: valueColor,
            ),
          ),
        ],
      ),
    );
  }
}
