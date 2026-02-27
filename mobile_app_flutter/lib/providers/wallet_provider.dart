/**
 * Wallet Provider
 * 
 * Manages INR wallet state and transactions
 * All amounts in Rupees (₹) - NO crypto involved
 */

import 'package:flutter/foundation.dart';
import '../services/api_service.dart';

class WalletProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  double _balance = 0.0;
  double _lockedBalance = 0.0;
  List<Map<String, dynamic>> _transactions = [];
  bool _isLoading = false;
  String? _error;
  
  // Getters
  double get balance => _balance;
  double get lockedBalance => _lockedBalance;
  double get availableBalance => _balance;
  double get totalBalance => _balance + _lockedBalance;
  List<Map<String, dynamic>> get transactions => _transactions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  /// Fetch wallet balance
  Future<void> fetchBalance() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.getWalletBalance();
      
      if (response['success'] == true) {
        _balance = (response['data']['balance'] ?? 0).toDouble();
        _lockedBalance = (response['data']['lockedBalance'] ?? 0).toDouble();
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Fetch transaction history
  Future<void> fetchTransactions({int limit = 50}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.getTransactionHistory(limit: limit);
      
      if (response['success'] == true) {
        _transactions = List<Map<String, dynamic>>.from(response['data'] ?? []);
      }
      
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Request deposit (in production, would integrate with payment gateway)
  Future<bool> requestDeposit(double amount) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.requestDeposit(amount);
      
      if (response['success'] == true) {
        // Refresh balance after deposit
        await fetchBalance();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Deposit failed';
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
  
  /// Request withdrawal (in production, would process bank transfer)
  Future<bool> requestWithdrawal(double amount) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.requestWithdrawal(amount);
      
      if (response['success'] == true) {
        // Refresh balance after withdrawal
        await fetchBalance();
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Withdrawal failed';
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
  
  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
  
  /// Reset wallet state (on logout)
  void reset() {
    _balance = 0.0;
    _lockedBalance = 0.0;
    _transactions = [];
    _error = null;
    notifyListeners();
  }
}
