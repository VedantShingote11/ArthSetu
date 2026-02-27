// LenAI Chat Screen
// Handles OpenAI Function Calling two-step flow:
//   Step 1: User message → AI may call a function
//   Step 2: Execute function on backend → send result back → AI gives final reply

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/lenai_service.dart';
import '../services/voice_service.dart';
import '../providers/loan_provider.dart';
import '../providers/kyc_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/wallet_provider.dart';
import '../providers/language_provider.dart';
import '../l10n/app_localizations.dart';

// ─── Data models ─────────────────────────────────────────────────────────────

enum _Sender { user, ai, system }

class _ChatMessage {
  final String text;
  final _Sender sender;
  final bool isSuccess;
  final bool isError;
  _ChatMessage({
    required this.text,
    required this.sender,
    this.isSuccess = false,
    this.isError = false,
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────

class LenAiChatScreen extends StatefulWidget {
  const LenAiChatScreen({super.key});

  @override
  State<LenAiChatScreen> createState() => _LenAiChatScreenState();
}

class _LenAiChatScreenState extends State<LenAiChatScreen>
    with TickerProviderStateMixin {
  late LenAiService _lenAi;
  final VoiceService _voice = VoiceService();
  final TextEditingController _inputCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isTyping = false;
  bool _isRecording = false;
  bool _isTranscribing = false;
  late AnimationController _dotCtrl;
  String? _currentLangCode;

  List<String> get _quickActions {
    final l10n = AppL10n.of(context);
    return [
      l10n.applyForLoan,
      l10n.payNextEmi,
      l10n.checkEmiStatus,
      l10n.checkKycStatus,
      l10n.viewCreditScore,
      l10n.viewMyLoans,
    ];
  }

  @override
  void initState() {
    super.initState();
    _dotCtrl =
        AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
          ..repeat();
    // Language is initialized in didChangeDependencies
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final langCode =
        Provider.of<LanguageProvider>(context, listen: false).languageCode;
    if (_currentLangCode != langCode) {
      // Language changed — restart the LenAI service with the new language
      _currentLangCode = langCode;
      _lenAi = LenAiService(languageCode: langCode);
      final l10n = AppL10n.forCode(langCode);
      if (_messages.isNotEmpty) {
        // Mid-session language change: reset and show a bilingual note
        setState(() => _messages.clear());
      }
      _addAiMessage(l10n.chatWelcome);
    }
  }

  @override
  void dispose() {
    _dotCtrl.dispose();
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  // ── Message helpers ────────────────────────────────────────────────────────

  void _addAiMessage(String text, {bool isSuccess = false, bool isError = false}) {
    setState(() => _messages.add(_ChatMessage(
          text: text,
          sender: _Sender.ai,
          isSuccess: isSuccess,
          isError: isError,
        )));
    _scrollToBottom();
  }

  void _addUserMessage(String text) {
    setState(() =>
        _messages.add(_ChatMessage(text: text, sender: _Sender.user)));
    _scrollToBottom();
  }

  void _addSystemMessage(String text) {
    setState(() =>
        _messages.add(_ChatMessage(text: text, sender: _Sender.system)));
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // ── Send flow ──────────────────────────────────────────────────────────────

  Future<void> _send(String input) async {
    final text = input.trim();
    if (text.isEmpty || _isTyping) return;
    _inputCtrl.clear();
    FocusScope.of(context).unfocus();

    _addUserMessage(text);
    setState(() => _isTyping = true);

    try {
      final response = await _lenAi.sendMessage(text);

      if (response.isToolCall) {
        // ── Step 2: execute the function ──
        await _handleToolCall(response.toolCall!);
      } else {
        setState(() => _isTyping = false);
        _addAiMessage(response.text ?? '');
      }
    } catch (e) {
      setState(() => _isTyping = false);
      _addAiMessage('⚠️ Error communicating with LenAI: $e\n\nPlease try again.',
          isError: true);
    }
  }

  // ── Tool dispatcher (handles chains of tool calls) ─────────────────────────

  Future<void> _handleToolCall(LenAiToolCall firstCall) async {
    LenAiToolCall call = firstCall;

    // Loop: execute function → send result → if another tool call, repeat
    while (true) {
      _addSystemMessage('⚙️ ${_friendlyName(call.name)}...');

      String toolResult;
      try {
        toolResult = await _executeFunction(call);
      } catch (e) {
        toolResult = 'ERROR: $e';
      }

      // Feed result back to OpenAI
      LenAiResponse nextResponse;
      try {
        nextResponse = await _lenAi.sendToolResult(
          toolCallId: call.id,
          functionName: call.name,
          result: toolResult,
        );
      } catch (e) {
        setState(() => _isTyping = false);
        _addAiMessage('⚠️ LenAI error: $e', isError: true);
        return;
      }

      if (nextResponse.isToolCall) {
        // Chain: OpenAI wants to call another function — loop again
        call = nextResponse.toolCall!;
      } else {
        // Final text reply from OpenAI
        setState(() => _isTyping = false);
        final success = toolResult.startsWith('SUCCESS');
        final error = toolResult.startsWith('ERROR');
        _addAiMessage(nextResponse.text ?? '', isSuccess: success, isError: error);
        return;
      }
    }
  }

  String _friendlyName(String fn) => switch (fn) {
        'apply_loan' => 'Submitting Loan Application',
        'pay_emi' => 'Processing EMI Payment',
        'check_emi' => 'Fetching EMI Details',
        'check_kyc_status' => 'Checking KYC Status',
        'check_credit_score' => 'Fetching Credit Score',
        'view_active_loans' => 'Loading Your Loans',
        _ => fn,
      };

  // ── Backend functions ──────────────────────────────────────────────────────

  Future<String> _executeFunction(LenAiToolCall call) async {
    switch (call.name) {
      case 'apply_loan':
        return _fnApplyLoan(call.args);
      case 'pay_emi':
        return _fnPayEmi(call.args);
      case 'check_emi':
        return _fnCheckEmi();
      case 'check_kyc_status':
        return _fnCheckKyc();
      case 'check_credit_score':
        return _fnCheckCreditScore();
      case 'view_active_loans':
        return _fnViewLoans();
      default:
        return 'ERROR: Unknown function "${call.name}"';
    }
  }

  // ── apply_loan ─────────────────────────────────────────────────────────────
  Future<String> _fnApplyLoan(Map<String, dynamic> args) async {
    final amount = (args['amount'] as num?)?.toDouble() ?? 0;
    final purpose = args['purpose'] as String? ?? '';
    final tenure = (args['tenure_months'] as num?)?.toInt() ?? 12;

    if (amount < 1000) return 'ERROR: Minimum loan amount is ₹1,000.';
    if (purpose.isEmpty) return 'ERROR: Loan purpose is required.';

    // Validate tenure
    const validTenures = [1, 6, 12, 24, 36];
    if (!validTenures.contains(tenure)) {
      return 'ERROR: Tenure must be one of 1, 6, 12, 24, or 36 months.';
    }

    if (!mounted) return 'ERROR: App context lost.';
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    final success = await loanProvider.createLoan(
      amount: amount,
      durationMonths: tenure,
      reason: purpose,
    );

    if (success) {
      if (mounted) {
        Provider.of<WalletProvider>(context, listen: false).fetchBalance();
      }
      return 'SUCCESS: Loan application submitted. '
          'Amount=₹${amount.toStringAsFixed(0)}, '
          'Purpose=$purpose, Tenure=$tenure months. '
          'Status is now Pending.';
    } else {
      return 'ERROR: ${loanProvider.error ?? "Loan creation failed. Please check your KYC status and try again."}';
    }
  }

  // ── pay_emi ────────────────────────────────────────────────────────────────
  Future<String> _fnPayEmi(Map<String, dynamic> args) async {
    if (!mounted) return 'ERROR: App context lost.';
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);

    // Ensure we have fresh loan data
    await loanProvider.fetchMyLoans();

    final activeLoans = loanProvider.myLoans
        .where((l) => l['status'] == 'Active')
        .toList();

    if (activeLoans.isEmpty) {
      return 'INFO: No active loans found. Nothing to pay.';
    }

    // Pick the specific loan or default to first active
    String loanId;
    final requestedId = args['loan_id'] as String?;
    if (requestedId != null && requestedId.isNotEmpty) {
      loanId = requestedId;
    } else {
      loanId = activeLoans.first['id'] as String;
    }

    // Get EMI amount for context
    final loan = activeLoans.firstWhere(
      (l) => l['id'] == loanId,
      orElse: () => activeLoans.first,
    );
    final emiAmount = (loan['emiAmount'] as num?)?.toDouble() ?? 0;
    final emisPaid = (loan['emisPaid'] as num?)?.toInt() ?? 0;
    final totalEmis = (loan['durationMonths'] as num?)?.toInt() ?? 0;

    final success = await loanProvider.repayEmi(loanId);

    if (success) {
      if (mounted) {
        Provider.of<WalletProvider>(context, listen: false).fetchBalance();
        Provider.of<AuthProvider>(context, listen: false).refreshUser();
      }
      return 'SUCCESS: EMI ${emisPaid + 1} of $totalEmis paid. '
          '₹${emiAmount.toStringAsFixed(2)} deducted from wallet. '
          'Credit score updated.';
    } else {
      return 'ERROR: ${loanProvider.error ?? "EMI payment failed. Please check your wallet balance."}';
    }
  }

  // ── check_emi ──────────────────────────────────────────────────────────────
  Future<String> _fnCheckEmi() async {
    if (!mounted) return 'ERROR: App context lost.';
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await loanProvider.fetchMyLoans();

    final activeLoans = loanProvider.myLoans
        .where((l) => l['status'] == 'Active')
        .toList();

    if (activeLoans.isEmpty) {
      return 'INFO: No active loans. The user has no ongoing EMIs to display.';
    }

    final buf = StringBuffer('SUCCESS: Active loan EMI details:\n');
    for (final loan in activeLoans) {
      final amount = (loan['amount'] as num?)?.toDouble() ?? 0;
      final emi = (loan['emiAmount'] as num?)?.toDouble() ?? 0;
      final paid = (loan['emisPaid'] as num?)?.toInt() ?? 0;
      final total = (loan['durationMonths'] as num?)?.toInt() ?? 0;
      final rate = (loan['annualInterestRate'] as num?)?.toDouble() ?? 0;
      buf.writeln(
          'Loan ₹${amount.toStringAsFixed(0)}: EMI=₹${emi.toStringAsFixed(2)}/mo, '
          'Paid=$paid/$total, Rate=${rate.toStringAsFixed(1)}% p.a., '
          'Remaining=${total - paid} EMIs');
    }
    return buf.toString();
  }

  // ── check_kyc_status ───────────────────────────────────────────────────────
  Future<String> _fnCheckKyc() async {
    if (!mounted) return 'ERROR: App context lost.';
    final kycProvider = Provider.of<KycProvider>(context, listen: false);
    await kycProvider.fetchKycStatus();

    final status = kycProvider.kycStatus;
    final docs = kycProvider.documentsUploaded;
    final docsUploaded = docs.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .join(', ');
    final docsMissing = docs.entries
        .where((e) => !e.value)
        .map((e) => e.key)
        .join(', ');

    return 'SUCCESS: KYC Status=$status. '
        'Verified=${kycProvider.isVerified}. '
        'Documents uploaded: ${docsUploaded.isEmpty ? "none" : docsUploaded}. '
        'Documents missing: ${docsMissing.isEmpty ? "none" : docsMissing}. '
        '${kycProvider.rejectionReason != null ? "Rejection reason: ${kycProvider.rejectionReason}." : ""}';
  }

  // ── check_credit_score ─────────────────────────────────────────────────────
  Future<String> _fnCheckCreditScore() async {
    if (!mounted) return 'ERROR: App context lost.';
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.refreshUser();

    final user = authProvider.user;
    final score = (user?['creditScore'] as num?)?.toInt() ?? 0;
    final name = user?['name'] as String? ?? 'User';

    String band;
    String rate;
    if (score >= 800) {
      band = 'Excellent';
      rate = '14%';
    } else if (score >= 600) {
      band = 'Good';
      rate = '20%';
    } else {
      band = 'Fair';
      rate = '27%';
    }

    return 'SUCCESS: User $name has credit score=$score, '
        'rating=$band, applicable interest rate=$rate p.a. '
        'Paying EMIs on time improves the score.';
  }

  // ── view_active_loans ──────────────────────────────────────────────────────
  Future<String> _fnViewLoans() async {
    if (!mounted) return 'ERROR: App context lost.';
    final loanProvider = Provider.of<LoanProvider>(context, listen: false);
    await loanProvider.fetchMyLoans();

    final loans = loanProvider.myLoans;
    if (loans.isEmpty) {
      return 'INFO: The user has no loans yet.';
    }

    final buf = StringBuffer('SUCCESS: ${loans.length} loan(s) found:\n');
    for (final loan in loans) {
      final amount = (loan['amount'] as num?)?.toDouble() ?? 0;
      final status = loan['status'] ?? 'Unknown';
      final reason = loan['reason'] ?? 'N/A';
      final dur = (loan['durationMonths'] as num?)?.toInt() ?? 0;
      final paid = (loan['emisPaid'] as num?)?.toInt() ?? 0;
      buf.writeln(
          'Loan ₹${amount.toStringAsFixed(0)}: Status=$status, Purpose=$reason, '
          'Tenure=$dur months, EMIs paid=$paid');
    }
    return buf.toString();
  }

  // ── BUILD ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    context.watch<LanguageProvider>(); // rebuild on language change
    return Scaffold(
      backgroundColor: const Color(0xFFF8F4FF),
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Expanded(child: _buildMessageList()),
          if (_isTyping) _buildTypingIndicator(),
          _buildMicBar(),
          _buildQuickActions(),
          _buildInputRow(),
        ],
      ),
    );
  }

  // ── App bar ────────────────────────────────────────────────────────────────

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(68),
      child: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF4C1D95), Color(0xFF7C3AED)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          boxShadow: [
            BoxShadow(
                color: Color(0x557C3AED), blurRadius: 14, offset: Offset(0, 4))
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new,
                      color: Colors.white, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.white.withValues(alpha: 0.15),
                    border: Border.all(
                        color: Colors.white.withValues(alpha: 0.5), width: 1.5),
                  ),
                  child: const Icon(Icons.smart_toy_rounded,
                      color: Colors.white, size: 24),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('LenAI',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                              letterSpacing: 0.3)),
                      Row(children: [
                        Container(
                            width: 7,
                            height: 7,
                            decoration: const BoxDecoration(
                                color: Color(0xFF86EFAC),
                                shape: BoxShape.circle)),
                        const SizedBox(width: 4),
                        const Text('Financial Operations Agent',
                            style:
                                TextStyle(color: Colors.white70, fontSize: 11)),
                      ]),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded,
                      color: Colors.white70, size: 22),
                  tooltip: 'New conversation',
                  onPressed: _resetChat,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _resetChat() {
    final langCode =
        Provider.of<LanguageProvider>(context, listen: false).languageCode;
    _lenAi = LenAiService(languageCode: langCode);
    final l10n = AppL10n.forCode(langCode);
    setState(() => _messages.clear());
    _addAiMessage(l10n.chatReset);
  }

  // ── Mic bar ────────────────────────────────────────────────────────────────

  Widget _buildMicBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 2),
      child: GestureDetector(
        onTap: _toggleVoice,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          height: 44,
          decoration: BoxDecoration(
            gradient: _isRecording
                ? const LinearGradient(
                    colors: [Color(0xFFDC2626), Color(0xFFEF4444)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : null,
            color: _isRecording
                ? null
                : const Color(0xFFEDE9FE),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: _isRecording
                  ? Colors.red
                  : const Color(0xFF7C3AED).withValues(alpha: 0.4),
              width: 1.5,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isTranscribing)
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(
                      strokeWidth: 2, color: Color(0xFF7C3AED)),
                )
              else
                Icon(
                  _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                  color: _isRecording ? Colors.white : const Color(0xFF7C3AED),
                  size: 20,
                ),
              const SizedBox(width: 8),
              Text(
                _isTranscribing
                    ? 'Transcribing…'
                    : _isRecording
                        ? 'Listening…  Tap to stop'
                        : 'Tap to speak',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: _isRecording
                      ? Colors.white
                      : const Color(0xFF5B21B6),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Voice toggle ────────────────────────────────────────────────────────────

  Future<void> _toggleVoice() async {
    if (_isTyping || _isTranscribing) return;

    if (_isRecording) {
      setState(() { _isRecording = false; _isTranscribing = true; });
      try {
        final path = await _voice.stopRecording();
        if (path != null) {
          final text = await _voice.transcribe(path);
          setState(() => _isTranscribing = false);
          if (text.isNotEmpty) {
            await _send(text);
            return;
          }
        }
      } catch (e) {
        _addAiMessage('🎤 Voice error: $e', isError: true);
      }
      setState(() => _isTranscribing = false);
    } else {
      // Don't show recording state until permission confirmed and mic is active
      try {
        await _voice.startRecording(); // Kotlin will show permission dialog if needed
        setState(() => _isRecording = true);
      } on Exception catch (e) {
        final msg = e.toString().contains('PERMISSION_DENIED')
            ? '🎤 Microphone permission denied. Please allow microphone access in Settings.'
            : '🎤 Could not start recording: $e';
        _addAiMessage(msg, isError: true);
      }
    }
  }

  // ── Message list ───────────────────────────────────────────────────────────

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollCtrl,
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 8),
      itemCount: _messages.length,
      itemBuilder: (_, i) {
        final msg = _messages[i];
        if (msg.sender == _Sender.user) return _UserBubble(text: msg.text);
        if (msg.sender == _Sender.system) return _SystemBubble(text: msg.text);
        return _AiBubble(
            text: msg.text,
            isSuccess: msg.isSuccess,
            isError: msg.isError);
      },
    );
  }

  // ── Typing indicator ───────────────────────────────────────────────────────

  Widget _buildTypingIndicator() {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(left: 16, bottom: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                    colors: [Color(0xFF4C1D95), Color(0xFF7C3AED)]),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.smart_toy_rounded,
                  color: Colors.white, size: 17),
            ),
            const SizedBox(width: 8),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(4),
                  topRight: Radius.circular(18),
                  bottomLeft: Radius.circular(18),
                  bottomRight: Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 6)
                ],
              ),
              child: _TypingDots(controller: _dotCtrl),
            ),
          ],
        ),
      ),
    );
  }

  // ── Quick action chips ─────────────────────────────────────────────────────

  Widget _buildQuickActions() {
    return Container(
      height: 44,
      margin: const EdgeInsets.only(top: 4),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemCount: _quickActions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) => GestureDetector(
          onTap: () => _send(_quickActions[i]),
          child: Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                  color: const Color(0xFF7C3AED).withValues(alpha: 0.3)),
              boxShadow: [
                BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 4)
              ],
            ),
            child: Text(_quickActions[i],
                style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF5B21B6),
                    fontWeight: FontWeight.w600)),
          ),
        ),
      ),
    );
  }

  // ── Input row ──────────────────────────────────────────────────────────────

  Widget _buildInputRow() {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.08),
              blurRadius: 12,
              offset: const Offset(0, 2))
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _inputCtrl,
              enabled: !_isTyping,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                hintText: 'Ask LenAI anything...',
                hintStyle:
                    TextStyle(color: Color(0xFFBBB3CC), fontSize: 14),
                border: InputBorder.none,
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              ),
              onSubmitted: _send,
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => _send(_inputCtrl.text),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4C1D95), Color(0xFF7C3AED)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                        color: const Color(0xFF7C3AED).withValues(alpha: 0.45),
                        blurRadius: 8,
                        offset: const Offset(0, 3))
                  ],
                ),
                child: const Icon(Icons.send_rounded,
                    color: Colors.white, size: 20),
              ),
            ),
          ),
          ],
        ),
      );
  }
}


// ─── Bubble widgets ────────────────────────────────────────────────────────────

class _UserBubble extends StatelessWidget {
  final String text;
  const _UserBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerRight,
      child: Container(
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.74),
        margin: const EdgeInsets.only(bottom: 10, left: 52),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF5B21B6), Color(0xFF7C3AED)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(4),
            bottomLeft: Radius.circular(18),
            bottomRight: Radius.circular(18),
          ),
          boxShadow: [
            BoxShadow(
                color: Color(0x337C3AED), blurRadius: 8, offset: Offset(0, 3))
          ],
        ),
        child: Text(text,
            style: const TextStyle(
                color: Colors.white, fontSize: 14, height: 1.45)),
      ),
    );
  }
}

// ── AI bubble with optional success (green) / error (red) tint ─────────────

class _AiBubble extends StatelessWidget {
  final String text;
  final bool isSuccess;
  final bool isError;
  const _AiBubble(
      {required this.text, this.isSuccess = false, this.isError = false});

  @override
  Widget build(BuildContext context) {
    final bgColor = isSuccess
        ? const Color(0xFFF0FDF4)
        : isError
            ? const Color(0xFFFEF2F2)
            : Colors.white;
    final borderColor = isSuccess
        ? const Color(0xFF86EFAC)
        : isError
            ? const Color(0xFFFCA5A5)
            : const Color(0xFFEDE9FE);

    return Align(
      alignment: Alignment.centerLeft,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            margin: const EdgeInsets.only(right: 8, top: 2, left: 4),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                  colors: [Color(0xFF4C1D95), Color(0xFF7C3AED)]),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.smart_toy_rounded,
                color: Colors.white, size: 20),
          ),
          Flexible(
            child: Container(
              constraints: BoxConstraints(
                  maxWidth: MediaQuery.of(context).size.width * 0.74),
              margin: const EdgeInsets.only(bottom: 10, right: 20),
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: bgColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(4),
                  topRight: Radius.circular(18),
                  bottomLeft: Radius.circular(18),
                  bottomRight: Radius.circular(18),
                ),
                border: Border.all(color: borderColor, width: 1.1),
                boxShadow: [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 6)
                ],
              ),
              child: _RichText(text: text),
            ),
          ),
        ],
      ),
    );
  }
}

// ── System / status bubble (centered, subtle) ──────────────────────────────

class _SystemBubble extends StatelessWidget {
  final String text;
  const _SystemBubble({required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFEDE9FE),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(text,
            style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF5B21B6),
                fontWeight: FontWeight.w500)),
      ),
    );
  }
}

// ─── Minimal bold renderer (**text** → bold purple) ────────────────────────

class _RichText extends StatelessWidget {
  final String text;
  const _RichText({required this.text});

  @override
  Widget build(BuildContext context) {
    final spans = <TextSpan>[];
    final bold = RegExp(r'\*\*(.*?)\*\*');
    int last = 0;
    for (final m in bold.allMatches(text)) {
      if (m.start > last) {
        spans.add(TextSpan(text: text.substring(last, m.start)));
      }
      spans.add(TextSpan(
          text: m.group(1),
          style: const TextStyle(
              fontWeight: FontWeight.bold, color: Color(0xFF5B21B6))));
      last = m.end;
    }
    if (last < text.length) spans.add(TextSpan(text: text.substring(last)));

    return RichText(
      text: TextSpan(
        style: const TextStyle(
            fontSize: 14, color: Color(0xFF1F1035), height: 1.5),
        children: spans,
      ),
    );
  }
}

// ─── Animated typing dots ──────────────────────────────────────────────────

class _TypingDots extends StatelessWidget {
  final AnimationController controller;
  const _TypingDots({required this.controller});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (_, __) => Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(3, (i) {
          final t = ((controller.value - i * 0.28) % 1.0).clamp(0.0, 1.0);
          final opacity = (t < 0.5 ? t * 2 : (1 - t) * 2).clamp(0.2, 1.0);
          return Opacity(
            opacity: opacity,
            child: Container(
              width: 8,
              height: 8,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: const BoxDecoration(
                  color: Color(0xFF7C3AED), shape: BoxShape.circle),
            ),
          );
        }),
      ),
    );
  }
}
