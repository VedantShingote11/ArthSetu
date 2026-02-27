/**
 * API Service - Hybrid Blockchain Microfinance
 * 
 * HTTP client for backend API communication
 * Handles authentication, wallet, loan, and transaction operations
 * All amounts in INR (₹) - NO blockchain interaction from app
 */

import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // ─── Pick ONE line below ───────────────────────────────────────────────────
  // Emulator:       10.0.2.2  (Android emulator → PC localhost)
  // Physical phone: your PC's WiFi IP  (run `ipconfig`, look for IPv4 Address)
  // iOS Simulator:  localhost
  // ──────────────────────────────────────────────────────────────────────────

  // static const String baseUrl = 'http://10.0.2.2:5000/api';          // Android Emulator
  static const String baseUrl = 'http://localhost:5000/api';             // Physical phone via USB (adb reverse)
  // static const String baseUrl = 'http://192.168.43.xxx:5000/api';    // WiFi hotspot
  
  // ============ Token Management ============
  
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  // ============ HTTP Methods ============
  
  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final token = await getToken();
      final headers = {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      };
      
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: headers,
        body: jsonEncode(body),
      );
      
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Network error: $e');
    }
  }
  
  // ============ Response Handling ============
  
  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw Exception(data['message'] ?? 'Request failed');
    }
  }
  
  // ============ Authentication Endpoints ============
  
  Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await post('/auth/register', userData);
    
    // Save token if registration successful
    if (response['success'] == true && response['data']['token'] != null) {
      await saveToken(response['data']['token']);
    }
    
    return response;
  }
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await post('/auth/login', {
      'email': email,
      'password': password,
    });
    
    // Save token if login successful
    if (response['success'] == true && response['data']['token'] != null) {
      await saveToken(response['data']['token']);
    }
    
    return response;
  }
  
  /// Fetch current authenticated user data from server (refreshes autoPayEnabled, etc.)
  Future<Map<String, dynamic>> getMe() async {
    return await get('/auth/me');
  }

  Future<void> logout() async {
    await clearToken();
  }
  
  // ============ Wallet Endpoints ============
  
  /// Get wallet balance (available + locked)
  Future<Map<String, dynamic>> getWalletBalance() async {
    return await get('/wallet/balance');
  }
  
  /// Get wallet details including transaction count
  Future<Map<String, dynamic>> getWalletDetails() async {
    return await get('/wallet/details');
  }
  
  /// Get transaction history
  Future<Map<String, dynamic>> getTransactionHistory({
    int limit = 50,
    int skip = 0,
  }) async {
    return await get('/wallet/transactions?limit=$limit&skip=$skip');
  }
  
  /// Request deposit (in production, this would redirect to payment gateway)
  Future<Map<String, dynamic>> requestDeposit(double amount) async {
    return await post('/wallet/deposit', {
      'amount': amount,
    });
  }
  
  /// Request withdrawal (in production, this would process bank transfer)
  Future<Map<String, dynamic>> requestWithdrawal(double amount) async {
    return await post('/wallet/withdrawal', {
      'amount': amount,
    });
  }
  
  // ============ Loan Endpoints ============
  
  /// Create a new loan request — interest is computed server-side from credit score
  Future<Map<String, dynamic>> createLoan({
    required double amount,
    required int durationMonths,
    required String reason,
  }) async {
    return await post('/loan/create', {
      'amount': amount,
      'durationMonths': durationMonths,
      'reason': reason,
    });
  }
  
  /// Get my loans (borrower or lender perspective)
  Future<Map<String, dynamic>> getMyLoans() async {
    return await get('/loan/my-loans');
  }
  
  /// Get all available loans (for lenders to browse)
  Future<Map<String, dynamic>> getAllLoans({
    String? status,
    double? minAmount,
    double? maxAmount,
    int? maxDuration,
  }) async {
    String endpoint = '/loan/all?';
    
    if (status != null) endpoint += 'status=$status&';
    if (minAmount != null) endpoint += 'minAmount=$minAmount&';
    if (maxAmount != null) endpoint += 'maxAmount=$maxAmount&';
    if (maxDuration != null) endpoint += 'maxDuration=$maxDuration&';
    
    return await get(endpoint);
  }
  
  /// Get basic loan details by ID (existing route)
  Future<Map<String, dynamic>> getLoanDetails(String loanId) async {
    return await get('/loan/$loanId');
  }

  /// Get full loan detail including EMI schedule and prepay quote
  Future<Map<String, dynamic>> getLoanDetail(String loanId) async {
    return await get('/loan/detail/$loanId');
  }

  /// Get prepayment cost breakdown (quote only, no payment)
  Future<Map<String, dynamic>> getPrepayQuote(String loanId) async {
    return await get('/loan/prepay-quote/$loanId');
  }

  /// Fund a loan (lender action)
  Future<Map<String, dynamic>> fundLoan({
    required String loanId,
    required double amount,
  }) async {
    return await post('/loan/fund', {
      'loanId': loanId,
      'amount': amount,
    });
  }
  
  /// Accept a loan (borrower action) — triggers 4% fee + EMI schedule generation
  Future<Map<String, dynamic>> acceptLoan(String loanId) async {
    return await post('/loan/accept', {
      'loanId': loanId,
    });
  }
  
  /// Pay the next pending EMI
  Future<Map<String, dynamic>> repayEmi(String loanId) async {
    return await post('/loan/repay', {
      'loanId': loanId,
    });
  }

  /// Prepay (foreclose) an active loan
  Future<Map<String, dynamic>> prepayLoan(String loanId) async {
    return await post('/loan/prepay', {
      'loanId': loanId,
    });
  }

  /// Cancel a loan (borrower action, only if not funded)
  Future<Map<String, dynamic>> cancelLoan(String loanId) async {
    return await post('/loan/cancel', {
      'loanId': loanId,
    });
  }

  /// Toggle auto-pay on/off. Pass [enabled] to set explicitly, or omit to flip.
  Future<Map<String, dynamic>> toggleAutoPay({bool? enabled}) async {
    final body = enabled != null ? {'enabled': enabled} : <String, dynamic>{};
    return await post('/profile/auto-pay/toggle', body);
  }

  
  // ============ Profile/Stats Endpoints ============
  
  /// Get lender portfolio summary
  Future<Map<String, dynamic>> getLenderPortfolio() async {
    return await get('/profile/lender/portfolio');
  }
  
  /// Get lender investment history
  Future<Map<String, dynamic>> getLenderHistory() async {
    return await get('/profile/lender/history');
  }
  
  /// Get borrower summary
  Future<Map<String, dynamic>> getBorrowerSummary() async {
    return await get('/profile/borrower/summary');
  }
  
  /// Get borrower loan history
  Future<Map<String, dynamic>> getBorrowerHistory() async {
    return await get('/profile/borrower/history');
  }
  
  /// Get portfolio graph data (for lender)
  Future<Map<String, dynamic>> getPortfolioGraph(String period, String filter) async {
    return await get('/profile/lender/portfolio/graph?period=$period&filter=$filter');
  }
  
  /// Get investment detail (for lender)
  Future<Map<String, dynamic>> getInvestmentDetail(String investmentId) async {
    return await get('/profile/lender/investment/$investmentId');
  }
  
  /// Get loan repayments (for borrower)
  Future<Map<String, dynamic>> getLoanRepayments(String loanId) async {
    return await get('/profile/borrower/repayments/$loanId');
  }

  // ============ KYC Endpoints ============

  /// Get KYC status and which documents are uploaded
  Future<Map<String, dynamic>> getKycStatus() async {
    return await get('/kyc/status');
  }

  /// Submit KYC for admin review
  Future<Map<String, dynamic>> submitKyc() async {
    return await post('/kyc/submit', {});
  }

  /// Upload a KYC document (aadhaar | pan | selfie) via multipart form
  Future<Map<String, dynamic>> uploadKycDocument(String docType, File file) async {
    try {
      final token = await getToken();
      final uri = Uri.parse('$baseUrl/kyc/upload/$docType');
      final request = http.MultipartRequest('POST', uri);

      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      // Read bytes explicitly — avoids Android content URI issues with fromPath
      final bytes = await file.readAsBytes();
      final filename = file.path.split('/').last.split('\\').last;

      // Detect content type from file extension
      final ext = filename.split('.').last.toLowerCase();
      final mimeType = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf',
      }[ext] ?? 'image/jpeg';

      request.files.add(
        http.MultipartFile.fromBytes(
          'document',
          bytes,
          filename: filename,
          contentType: MediaType.parse(mimeType), // ← critical: tells multer the file type
        ),
      );

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      return _handleResponse(response);
    } catch (e) {
      throw Exception('Upload error: $e');
    }
  }
}
