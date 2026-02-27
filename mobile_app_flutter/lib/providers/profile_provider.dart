import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import '../services/api_service.dart';

/// Profile Provider
/// 
/// Manages user profile data, portfolio analytics, and history
class ProfileProvider with ChangeNotifier {
  final ApiService _apiService;

  // Lender Portfolio Data
  Map<String, dynamic>? _lenderPortfolio;
  List<dynamic> _investmentHistory = [];
  Map<String, dynamic>? _portfolioGraph;
  bool _isLoadingPortfolio = false;
  String? _portfolioError;

  // Borrower Profile Data
  Map<String, dynamic>? _borrowerSummary;
  List<dynamic> _loanHistory = [];
  bool _isLoadingSummary = false;
  String? _summaryError;

  // Graph filters
  String _graphPeriod = 'monthly';
  String _graphFilter = 'overall';

  ProfileProvider(this._apiService);

  // Getters
  Map<String, dynamic>? get lenderPortfolio => _lenderPortfolio;
  List<dynamic> get investmentHistory => _investmentHistory;
  Map<String, dynamic>? get portfolioGraph => _portfolioGraph;
  bool get isLoadingPortfolio => _isLoadingPortfolio;
  String? get portfolioError => _portfolioError;

  Map<String, dynamic>? get borrowerSummary => _borrowerSummary;
  List<dynamic> get loanHistory => _loanHistory;
  bool get isLoadingSummary => _isLoadingSummary;
  String? get summaryError => _summaryError;

  String get graphPeriod => _graphPeriod;
  String get graphFilter => _graphFilter;

  /// Safe notifyListeners — defers to post-frame if a build is in progress.
  /// Prevents "setState() called during build" crashes.
  void _notify() {
    if (SchedulerBinding.instance.schedulerPhase == SchedulerPhase.persistentCallbacks) {
      // A frame is being built — defer to avoid setState-during-build
      SchedulerBinding.instance.addPostFrameCallback((_) => notifyListeners());
    } else {
      notifyListeners();
    }
  }

  /// Fetch lender's complete portfolio
  Future<void> fetchLenderPortfolio() async {
    _isLoadingPortfolio = true;
    _portfolioError = null;
    _notify();

    try {
      final response = await _apiService.getLenderPortfolio();
      
      debugPrint('Portfolio response: $response');
      
      if (response['success']) {
        _lenderPortfolio = response['data'];
        _portfolioError = null;
        debugPrint('Portfolio data: $_lenderPortfolio');
      } else {
        _portfolioError = response['message'] ?? 'Failed to load portfolio';
        debugPrint('Portfolio error: $_portfolioError');
      }
    } catch (e) {
      _portfolioError = 'Error loading portfolio: $e';
      debugPrint('Fetch portfolio error: $e');
    } finally {
      _isLoadingPortfolio = false;
      _notify();
    }
  }

  /// Fetch lender's investment history
  Future<void> fetchInvestmentHistory() async {
    try {
      final response = await _apiService.getLenderHistory();
      
      debugPrint('Investment history response: $response');
      
      if (response['success']) {
        _investmentHistory = response['data'] ?? [];
        debugPrint('Investment history count: ${_investmentHistory.length}');
      } else {
        debugPrint('Investment history error: ${response['message']}');
      }
      _notify();
    } catch (e) {
      debugPrint('Fetch investment history error: $e');
    }
  }

  /// Fetch portfolio graph data
  Future<void> fetchPortfolioGraph({String? period, String? filter}) async {
    if (period != null) _graphPeriod = period;
    if (filter != null) _graphFilter = filter;

    try {
      final response = await _apiService.getPortfolioGraph(_graphPeriod, _graphFilter);
      
      if (response['success']) {
        _portfolioGraph = response['data'];
      }
      _notify();
    } catch (e) {
      debugPrint('Fetch portfolio graph error: $e');
    }
  }

  /// Fetch borrower's summary
  Future<void> fetchBorrowerSummary() async {
    _isLoadingSummary = true;
    _summaryError = null;
    _notify();

    try {
      final response = await _apiService.getBorrowerSummary();
      
      if (response['success']) {
        _borrowerSummary = response['data'];
        _summaryError = null;
      } else {
        _summaryError = response['message'] ?? 'Failed to load summary';
      }
    } catch (e) {
      _summaryError = 'Error loading summary: $e';
      debugPrint('Fetch borrower summary error: $e');
    } finally {
      _isLoadingSummary = false;
      _notify();
    }
  }

  /// Fetch borrower's loan history
  Future<void> fetchLoanHistory() async {
    try {
      final response = await _apiService.getBorrowerHistory();
      
      if (response['success']) {
        _loanHistory = response['data'] ?? [];
      }
      _notify();
    } catch (e) {
      debugPrint('Fetch loan history error: $e');
    }
  }

  /// Update graph period (monthly/yearly)
  void setGraphPeriod(String period) {
    if (_graphPeriod != period) {
      _graphPeriod = period;
      _notify(); // Immediately update UI to show button selection
      fetchPortfolioGraph(); // Then fetch new data asynchronously
    }
  }

  /// Update graph filter (overall/per-investment)
  void setGraphFilter(String filter) {
    if (_graphFilter != filter) {
      _graphFilter = filter;
      fetchPortfolioGraph();
    }
  }

  /// Clear all data
  void clear() {
    _lenderPortfolio = null;
    _investmentHistory = [];
    _portfolioGraph = null;
    _borrowerSummary = null;
    _loanHistory = [];
    _portfolioError = null;
    _summaryError = null;
    _notify();
  }
}

