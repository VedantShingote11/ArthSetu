/**
 * Loan Provider
 * 
 * Manages loan state and operations
 */

import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class LoanProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  List<dynamic> _myLoans = [];
  List<dynamic> _allLoans = [];
  bool _isLoading = false;
  String? _error;
  
  // Getters
  List<dynamic> get myLoans => _myLoans;
  List<dynamic> get allLoans => _allLoans;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Fetch my loans
  Future<void> fetchMyLoans() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.getMyLoans();
      
      if (response['success'] == true) {
        _myLoans = response['data'] ?? [];
      } else {
        _error = response['message'] ?? 'Failed to fetch loans';
      }
    } catch (e) {
      _error = e.toString();
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  // Fetch all loans (for lenders)
  Future<void> fetchAllLoans({
    String? status,
    double? minAmount,
    double? maxAmount,
    int? maxDuration,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.getAllLoans(
        status: status,
        minAmount: minAmount,
        maxAmount: maxAmount,
        maxDuration: maxDuration,
      );
      
      if (response['success'] == true) {
        _allLoans = response['data'] ?? [];
      } else {
        _error = response['message'] ?? 'Failed to fetch loans';
      }
    } catch (e) {
      _error = e.toString();
    }
    
    _isLoading = false;
    notifyListeners();
  }
  
  // Create loan — interest rate computed server-side from credit score
  // [durationMonths] must be one of: 1, 6, 12, 24, 36 (RBI-approved)
  Future<bool> createLoan({
    required double amount,
    required int durationMonths,
    required String reason,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.createLoan(
        amount: amount,
        durationMonths: durationMonths,
        reason: reason,
      );
      
      if (response['success'] == true) {
        await fetchMyLoans();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to create loan';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Fund loan
  Future<bool> fundLoan({
    required String loanId,
    required double amount,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.fundLoan(
        loanId: loanId,
        amount: amount,
      );
      
      if (response['success'] == true) {
        // Refresh loans
        await fetchMyLoans();
        await fetchAllLoans();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to fund loan';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Accept loan
  Future<bool> acceptLoan(String loanId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.acceptLoan(loanId);
      
      if (response['success'] == true) {
        await fetchMyLoans();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to accept loan';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  // Pay next pending EMI
  Future<bool> repayEmi(String loanId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.repayEmi(loanId);
      
      if (response['success'] == true) {
        await fetchMyLoans();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to pay EMI';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Prepay (foreclose) active loan
  Future<bool> prepayLoan(String loanId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.prepayLoan(loanId);
      
      if (response['success'] == true) {
        await fetchMyLoans();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Failed to prepay loan';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // Get full loan detail (EMI schedule + prepay quote)
  Future<Map<String, dynamic>?> getLoanDetail(String loanId) async {
    try {
      final response = await _apiService.getLoanDetail(loanId);
      if (response['success'] == true) return response['data'];
      _error = response['message'] ?? 'Failed to fetch loan detail';
      return null;
    } catch (e) {
      _error = e.toString();
      return null;
    }
  }
  
  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
