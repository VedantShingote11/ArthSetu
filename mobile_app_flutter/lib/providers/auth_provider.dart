/**
 * Authentication Provider
 * 
 * Manages authentication state and user session
 */

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  
  bool _isAuthenticated = false;
  String? _userRole;
  Map<String, dynamic>? _userData;
  bool _isLoading = false;
  String? _error;
  
  // Getters
  bool get isAuthenticated => _isAuthenticated;
  String? get userRole => _userRole;
  Map<String, dynamic>? get userData => _userData;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Constructor - check if user is already logged in
  AuthProvider() {
    _checkAuthStatus();
  }
  
  Future<void> _checkAuthStatus() async {
    final token = await _apiService.getToken();
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      final role = prefs.getString('user_role');
      final userDataString = prefs.getString('user_data');
      
      if (role != null && userDataString != null) {
        _isAuthenticated = true;
        _userRole = role;
        // Parse user data if needed
        notifyListeners();
      }
    }
  }
  
  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.login(email, password);
      
      if (response['success'] == true) {
        final user = response['data']['user'];
        
        _isAuthenticated = true;
        _userRole = user['role'];
        _userData = user;
        
        // Save user data to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_role', user['role']);
        await prefs.setString('user_data', user.toString());
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Login failed';
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
  
  // Register
  Future<bool> register(Map<String, dynamic> userData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await _apiService.register(userData);
      
      if (response['success'] == true) {
        final user = response['data']['user'];
        
        _isAuthenticated = true;
        _userRole = user['role'];
        _userData = user;
        
        // Save user data to local storage
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_role', user['role']);
        await prefs.setString('user_data', user.toString());
        
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = response['message'] ?? 'Registration failed';
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
  
  // Logout
  Future<void> logout() async {
    await _apiService.logout();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_role');
    await prefs.remove('user_data');
    
    _isAuthenticated = false;
    _userRole = null;
    _userData = null;
    
    notifyListeners();
  }
  
  // Refresh user data from server (e.g. after toggling auto-pay)
  Future<void> refreshUser() async {
    try {
      final response = await _apiService.getMe();
      if (response['success'] == true) {
        final user = response['data'];
        _userData = user;
        notifyListeners();
      }
    } catch (_) {
      // Non-critical: silently ignore refresh failures
    }
  }

  // Convenience alias used by some screens
  Map<String, dynamic>? get user => _userData;

  // Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
