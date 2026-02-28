/**
 * KYC Screen
 *
 * Displays three document upload cards (Aadhaar, PAN, Selfie).
 * Uses image_picker to capture from camera or gallery.
 * Shows upload progress, status badges, and submit button.
 */

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../providers/kyc_provider.dart';
import '../providers/language_provider.dart';

class KycScreen extends StatefulWidget {
  const KycScreen({super.key});

  @override
  State<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends State<KycScreen> {
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<KycProvider>(context, listen: false).fetchKycStatus();
    });
  }

  Future<void> _pickAndUpload(String docType, String label) async {
    final choice = await _showPickerDialog(label);
    if (choice == null) return;

    final XFile? picked = choice == 'camera'
        ? await _picker.pickImage(source: ImageSource.camera, imageQuality: 80)
        : await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);

    if (picked == null) return;

    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    final success = await kycProvider.uploadDocument(docType, File(picked.path));

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? '$label uploaded successfully ✓'
              : kycProvider.error ?? 'Upload failed'),
          backgroundColor: success ? Colors.green.shade700 : Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<String?> _showPickerDialog(String label) async {
    return showModalBottomSheet<String>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Upload $label',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF312E81).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.camera_alt, color: Color(0xFF312E81)),
                ),
                title: const Text('Take Photo'),
                subtitle: const Text('Use your camera'),
                onTap: () => Navigator.pop(context, 'camera'),
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF312E81).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.photo_library, color: Color(0xFF312E81)),
                ),
                title: const Text('Choose from Gallery'),
                subtitle: const Text('Select an existing photo'),
                onTap: () => Navigator.pop(context, 'gallery'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submitKyc() async {
    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    final success = await kycProvider.submitKyc();

    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('KYC submitted! Verification usually takes 1-2 business days.'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 4),
          ),
        );
        Navigator.pop(context, true); // signal refresh to parent
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(kycProvider.error ?? 'Submission failed. Try again.'),
            backgroundColor: Colors.red.shade700,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    context.watch<LanguageProvider>(); // rebuild on language change
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('KYC Verification'),
        backgroundColor: const Color(0xFF312E81),
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Consumer<KycProvider>(
        builder: (context, kycProvider, _) {
          if (kycProvider.isLoading && kycProvider.kycStatus == 'not_started') {
            return const Center(child: CircularProgressIndicator());
          }
          return RefreshIndicator(
            onRefresh: kycProvider.fetchKycStatus,
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildStatusHeader(kycProvider),
                  const SizedBox(height: 20),
                  _buildDocCard(kycProvider, 'aadhaar', 'Aadhaar Card',
                      'Upload your 12-digit Aadhaar card', Icons.credit_card),
                  const SizedBox(height: 12),
                  _buildDocCard(kycProvider, 'pan', 'PAN Card',
                      'Upload your PAN card issued by Income Tax Dept', Icons.article),
                  const SizedBox(height: 12),
                  _buildDocCard(kycProvider, 'selfie', 'Live Selfie',
                      'Take a clear selfie or upload your photo', Icons.face),
                  const SizedBox(height: 24),
                  if (kycProvider.kycStatus != 'submitted' &&
                      kycProvider.kycStatus != 'verified')
                    _buildSubmitButton(kycProvider),
                  if (kycProvider.kycStatus == 'submitted')
                    _buildSubmittedBanner(),
                  if (kycProvider.kycStatus == 'verified')
                    _buildVerifiedBanner(),
                  const SizedBox(height: 20),
                  _buildInfoNote(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusHeader(KycProvider kycProvider) {
    final statusConfig = {
      'not_started': {'color': Colors.grey.shade600, 'icon': Icons.pending_outlined, 'label': 'Not Started'},
      'documents_uploaded': {'color': const Color(0xFF312E81), 'icon': Icons.cloud_done_rounded, 'label': 'Documents Uploaded'},
      'submitted': {'color': Colors.orange.shade700, 'icon': Icons.hourglass_top, 'label': 'Under Review'},
      'verified': {'color': Colors.green.shade700, 'icon': Icons.verified, 'label': 'Verified'},
      'rejected': {'color': Colors.red.shade700, 'icon': Icons.cancel, 'label': 'Rejected'},
    };

    final config = statusConfig[kycProvider.kycStatus] ??
        statusConfig['not_started']!;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(config['icon'] as IconData, color: config['color'] as Color, size: 28),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('KYC Status', style: TextStyle(color: Colors.grey, fontSize: 12)),
                  Text(
                    config['label'] as String,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: config['color'] as Color,
                    ),
                  ),
                ],
              ),
            ],
          ),
          if (kycProvider.isRejected && kycProvider.rejectionReason != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.red, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      kycProvider.rejectionReason!,
                      style: const TextStyle(color: Colors.red, fontSize: 13),
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

  Widget _buildDocCard(KycProvider kycProvider, String docType, String title,
      String subtitle, IconData icon) {
    final isUploaded = kycProvider.documentsUploaded[docType] == true;
    final isCurrentlyUploading =
        kycProvider.isUploading && kycProvider.uploadingDoc == docType;
    final isLocked = kycProvider.kycStatus == 'submitted' ||
        kycProvider.kycStatus == 'verified';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isUploaded
              ? Colors.green.shade300
              : isCurrentlyUploading
                  ? const Color(0xFF312E81).withOpacity(0.4)
                  : Colors.grey.shade200,
          width: 1.5,
        ),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isUploaded
                ? Colors.green.shade50
                : const Color(0xFF312E81).withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: isCurrentlyUploading
              ? const Padding(
                  padding: EdgeInsets.all(12),
                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF7C3AED)),
                )
              : Icon(
                  isUploaded ? Icons.check_circle : icon,
                  color: isUploaded ? Colors.green.shade600 : const Color(0xFF7C3AED),
                  size: 26,
                ),
        ),
        title: Text(title,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        subtitle: Text(
          isCurrentlyUploading
              ? 'Uploading...'
              : isUploaded
                  ? 'Uploaded ✓'
                  : subtitle,
          style: TextStyle(
            fontSize: 12,
            color: isUploaded ? Colors.green.shade600 : Colors.grey.shade600,
          ),
        ),
        trailing: isLocked
            ? Icon(
                isUploaded ? Icons.check_circle : Icons.lock_outline,
                color: isUploaded ? Colors.green : Colors.grey,
              )
            : TextButton(
                onPressed: isCurrentlyUploading
                    ? null
                    : () => _pickAndUpload(docType, title),
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF312E81),
                  backgroundColor: const Color(0xFF312E81).withOpacity(0.08),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                ),
                child: Text(
                  isUploaded ? 'Re-upload' : 'Upload',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                ),
              ),
      ),
    );
  }

  Widget _buildSubmitButton(KycProvider kycProvider) {
    final canSubmit = kycProvider.allUploaded && !kycProvider.isLoading;

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: canSubmit ? _submitKyc : null,
        icon: kycProvider.isLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              )
            : const Icon(Icons.send_rounded),
        label: const Text('Submit for Verification',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
        style: ElevatedButton.styleFrom(
          backgroundColor: canSubmit ? const Color(0xFF312E81) : Colors.grey.shade300,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: canSubmit ? 2 : 0,
        ),
      ),
    );
  }

  Widget _buildSubmittedBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.orange.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.hourglass_top, color: Colors.orange.shade700),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Under Review', style: TextStyle(fontWeight: FontWeight.bold)),
                SizedBox(height: 2),
                Text('Your documents are being reviewed. This typically takes 1-2 business days.',
                    style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerifiedBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade300),
      ),
      child: Row(
        children: [
          Icon(Icons.verified, color: Colors.green.shade700, size: 28),
          const SizedBox(width: 12),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('KYC Verified', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
                Text('You have full access to all platform features.',
                    style: TextStyle(fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoNote() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(10),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.security, color: Colors.blue, size: 18),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'Your documents are encrypted and stored securely. We never share your personal information with third parties.',
              style: TextStyle(fontSize: 12, color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }
}
