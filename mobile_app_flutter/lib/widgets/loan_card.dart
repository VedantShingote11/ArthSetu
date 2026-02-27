/**
 * Loan Card Widget
 * 
 * Reusable card component for displaying loan information
 */

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class LoanCard extends StatelessWidget {
  final Map<String, dynamic> loan;
  final VoidCallback? onTap;
  final Widget? actionButton;
  /// 'lender' → shows fixed 12% base return; 'borrower' / null → shows actual rate
  final String? viewerRole;

  const LoanCard({
    super.key,
    required this.loan,
    this.onTap,
    this.actionButton,
    this.viewerRole,
  });

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Requested':
        return Colors.orange;
      case 'Funded':
        return Colors.blue;
      case 'Active':
        return Colors.green;
      case 'Repaid':
        return Colors.grey;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final amount = (loan['amount'] as num?)?.toDouble() ?? 0;
    final fundedAmount = (loan['fundedAmount'] as num?)?.toDouble() ?? 0;
    // ── Use new field names from EMI model, with fallbacks for old data ──
    final annualRate = (loan['annualInterestRate'] as num?)?.toDouble()
        ?? (loan['interestRate'] as num?)?.toDouble()
        ?? 0.0;
    final durationMonths = (loan['durationMonths'] as num?)?.toInt()
        ?? (loan['duration'] as num?)?.toInt()
        ?? 0;
    final status = loan['status'] ?? 'Unknown';
    final reason = loan['reason'] ?? 'No reason provided';
    final createdAt = loan['createdAt'] != null
        ? DateTime.parse(loan['createdAt'])
        : DateTime.now();

    // ── Compute monthly EMI for display (reducing balance) ──
    String? emiLabel;
    if (annualRate > 0 && durationMonths > 0 && amount > 0) {
      if (durationMonths == 1) {
        final total = amount * (1 + annualRate / 100 / 12);
        emiLabel = '₹${total.toStringAsFixed(0)}';
      } else {
        final r = annualRate / 12 / 100;
        double f = 1.0;
        for (int i = 0; i < durationMonths; i++) f *= (1 + r);
        final emi = (amount * r * f) / (f - 1);
        emiLabel = '₹${emi.toStringAsFixed(0)}/mo';
      }
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: amount + status badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '₹${amount.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getStatusColor(status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: _getStatusColor(status), width: 1),
                    ),
                    child: Text(
                      status,
                      style: TextStyle(
                        color: _getStatusColor(status),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),

              // Reason
              Text(
                reason,
                style: Theme.of(context).textTheme.bodyLarge,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 14),

              // Loan details row
              Row(
                children: [
                  Expanded(
                    child: _buildDetailItem(
                      context,
                      // Lenders always see the fixed base rate they earn;
                      // Borrowers see their actual (credit-score-based) rate.
                      viewerRole == 'lender' ? 'Your Return' : 'Interest Rate',
                      viewerRole == 'lender'
                          ? '12% p.a. (base)'
                          : (annualRate > 0 ? '${annualRate.toStringAsFixed(1)}% p.a.' : '—'),
                      Icons.percent,
                    ),
                  ),
                  Expanded(
                    child: _buildDetailItem(
                      context,
                      'Duration',
                      durationMonths > 0
                          ? '$durationMonths month${durationMonths > 1 ? 's' : ''}'
                          : '—',
                      Icons.calendar_today,
                    ),
                  ),
                ],
              ),

              // EMI row (only when rate & duration known)
              if (emiLabel != null) ...[
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _buildDetailItem(
                        context,
                        'Monthly EMI',
                        emiLabel,
                        Icons.payments_outlined,
                      ),
                    ),
                    if (durationMonths > 0)
                      Expanded(
                        child: _buildDetailItem(
                          context,
                          'Total EMIs',
                          '$durationMonths',
                          Icons.receipt_long,
                        ),
                      ),
                  ],
                ),
              ],

              // Funding progress bar
              if (status == 'Requested' && fundedAmount > 0) ...[
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Funded', style: Theme.of(context).textTheme.bodyMedium),
                    Text(
                      '₹${fundedAmount.toStringAsFixed(2)} / ₹${amount.toStringAsFixed(2)}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: amount > 0 ? (fundedAmount / amount).clamp(0.0, 1.0) : 0,
                  backgroundColor: Colors.grey[200],
                  valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).primaryColor),
                ),
              ],

              const SizedBox(height: 12),
              Text(
                'Created: ${DateFormat('MMM dd, yyyy').format(createdAt)}',
                style: Theme.of(context).textTheme.bodySmall,
              ),

              if (actionButton != null) ...[
                const SizedBox(height: 16),
                actionButton!,
              ],
            ],
          ),
        ),
      ),
    );
  }


  Widget _buildDetailItem(
    BuildContext context,
    String label,
    String value,
    IconData icon,
  ) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: Theme.of(context).primaryColor,
        ),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
      ],
    );
  }
}
