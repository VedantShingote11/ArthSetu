/**
 * KYC Provider
 *
 * Manages KYC document upload state, status checks, and submission.
 * Integrates with backend /api/kyc endpoints.
 */

import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import '../services/api_service.dart';

class KycProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  String _kycStatus = 'not_started';
  Map<String, bool> _documentsUploaded = {
    'aadhaar': false,
    'pan': false,
    'selfie': false,
  };
  bool _allUploaded = false;
  String? _rejectionReason;
  bool _isLoading = false;
  bool _isUploading = false;
  String? _uploadingDoc;
  String? _error;

  // Getters
  String get kycStatus => _kycStatus;
  Map<String, bool> get documentsUploaded => _documentsUploaded;
  bool get allUploaded => _allUploaded;
  String? get rejectionReason => _rejectionReason;
  bool get isLoading => _isLoading;
  bool get isUploading => _isUploading;
  String? get uploadingDoc => _uploadingDoc;
  String? get error => _error;
  bool get isVerified => _kycStatus == 'verified';
  bool get isSubmitted => _kycStatus == 'submitted';
  bool get isRejected => _kycStatus == 'rejected';

  /// Safe notifyListeners — defers to post-frame if a build is in progress.
  void _notify() {
    if (SchedulerBinding.instance.schedulerPhase ==
        SchedulerPhase.persistentCallbacks) {
      SchedulerBinding.instance.addPostFrameCallback((_) => notifyListeners());
    } else {
      notifyListeners();
    }
  }

  /// Fetch current KYC status from backend
  Future<void> fetchKycStatus() async {
    _isLoading = true;
    _error = null;
    _notify();

    try {
      final response = await _apiService.getKycStatus();
      if (response['success'] == true) {
        final data = response['data'];
        _kycStatus = data['kycStatus'] ?? 'not_started';
        _documentsUploaded = {
          'aadhaar': data['documentsUploaded']['aadhaar'] ?? false,
          'pan': data['documentsUploaded']['pan'] ?? false,
          'selfie': data['documentsUploaded']['selfie'] ?? false,
        };
        _allUploaded = data['allUploaded'] ?? false;
        _rejectionReason = data['rejectionReason'];
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
    } finally {
      _isLoading = false;
      _notify();
    }
  }

  /// Upload a single KYC document (aadhaar | pan | selfie)
  Future<bool> uploadDocument(String docType, File file) async {
    _isUploading = true;
    _uploadingDoc = docType;
    _error = null;
    _notify();

    try {
      final response = await _apiService.uploadKycDocument(docType, file);
      if (response['success'] == true) {
        final data = response['data'];
        _kycStatus = data['kycStatus'] ?? _kycStatus;
        _documentsUploaded = {
          'aadhaar': data['documentsUploaded']['aadhaar'] ?? _documentsUploaded['aadhaar']!,
          'pan': data['documentsUploaded']['pan'] ?? _documentsUploaded['pan']!,
          'selfie': data['documentsUploaded']['selfie'] ?? _documentsUploaded['selfie']!,
        };
        _allUploaded = data['allUploaded'] ?? false;
        _isUploading = false;
        _uploadingDoc = null;
        _notify();
        return true;
      } else {
        _error = response['message'] ?? 'Upload failed';
        _isUploading = false;
        _uploadingDoc = null;
        _notify();
        return false;
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isUploading = false;
      _uploadingDoc = null;
      _notify();
      return false;
    }
  }

  /// Submit KYC for admin review (requires all 3 docs)
  Future<bool> submitKyc() async {
    _isLoading = true;
    _error = null;
    _notify();

    try {
      final response = await _apiService.submitKyc();
      if (response['success'] == true) {
        _kycStatus = 'submitted';
        _isLoading = false;
        _notify();
        return true;
      } else {
        _error = response['message'] ?? 'Submission failed';
        _isLoading = false;
        _notify();
        return false;
      }
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      _notify();
      return false;
    }
  }

  void clearError() {
    _error = null;
    _notify();
  }
}
