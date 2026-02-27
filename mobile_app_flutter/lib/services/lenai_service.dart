// LenAI Service
// Uses OpenAI's native Function Calling (Tools API) for guaranteed,
// structured execution of all financial operations.

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

// ─── Return types ────────────────────────────────────────────────────────────

/// Holds a function call the model wants to make.
class LenAiToolCall {
  final String id;
  final String name;
  final Map<String, dynamic> args;
  LenAiToolCall({required this.id, required this.name, required this.args});
}

/// What sendMessage returns — either a text reply or a tool call.
class LenAiResponse {
  final String? text;
  final LenAiToolCall? toolCall;
  LenAiResponse.text(String this.text) : toolCall = null;
  LenAiResponse.tool(LenAiToolCall this.toolCall) : text = null;
  bool get isToolCall => toolCall != null;
}

// ─── Tool definitions (declared to OpenAI) ───────────────────────────────────

const List<Map<String, dynamic>> _tools = [
  {
    'type': 'function',
    'function': {
      'name': 'apply_loan',
      'description': 'Submit a loan application after collecting and confirming all details from the user.',
      'parameters': {
        'type': 'object',
        'properties': {
          'amount': {'type': 'number', 'description': 'Loan amount in INR (minimum 1000)'},
          'purpose': {'type': 'string', 'description': 'Purpose or reason for the loan'},
          'tenure_months': {
            'type': 'integer',
            'description': 'Repayment tenure in months. Must be one of: 1, 6, 12, 24, 36',
            'enum': [1, 6, 12, 24, 36],
          },
        },
        'required': ['amount', 'purpose', 'tenure_months'],
      },
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'pay_emi',
      'description': 'Pay the next pending EMI for the user\'s active loan.',
      'parameters': {
        'type': 'object',
        'properties': {
          'loan_id': {
            'type': 'string',
            'description': 'Optional specific loan ID. Leave empty to pay the first active loan.',
          },
        },
        'required': [],
      },
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'check_emi',
      'description': 'Fetch and display EMI details for all active loans.',
      'parameters': {'type': 'object', 'properties': {}, 'required': []},
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'check_kyc_status',
      'description': 'Check the current KYC verification status of the user.',
      'parameters': {'type': 'object', 'properties': {}, 'required': []},
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'check_credit_score',
      'description': 'Retrieve and display the user\'s credit score and associated loan interest rate band.',
      'parameters': {'type': 'object', 'properties': {}, 'required': []},
    },
  },
  {
    'type': 'function',
    'function': {
      'name': 'view_active_loans',
      'description': 'Fetch and list all loans belonging to the user (any status).',
      'parameters': {'type': 'object', 'properties': {}, 'required': []},
    },
  },
];

// ─── System prompt builder ────────────────────────────────────────────────────

String _buildSystemPrompt(String languageCode) {
  final String langName;
  final String langInstruction;

  switch (languageCode) {
    case 'hi':
      langName = 'Hindi (हिंदी)';
      langInstruction =
          'LANGUAGE RULE: You MUST always respond in Hindi (हिंदी) only, '
          'regardless of the language the user writes in. Never switch to English '
          'for responses. Use ₹ for amounts and Devanagari script throughout.';
      break;
    case 'mr':
      langName = 'Marathi (मराठी)';
      langInstruction =
          'LANGUAGE RULE: You MUST always respond in Marathi (मराठी) only, '
          'regardless of the language the user writes in. Never switch to English '
          'for responses. Use ₹ for amounts and Devanagari script throughout.';
      break;
    default:
      langName = 'English';
      langInstruction = 'LANGUAGE RULE: Always respond in English.';
  }

  return '''
You are LenAI, an intelligent financial operations agent inside a decentralized microfinance mobile application.

$langInstruction

Your role is to COMPLETE financial operations conversationally — not just chat.

RULES:
- Identify user intent from natural language (loan, EMI, KYC, credit score, etc.)
- Collect all required information step by step, one or two questions at a time
- Before calling any function, ALWAYS show a confirmation summary to the user and wait for explicit confirmation ("yes", "confirm", "proceed", "ok", "sure")
- After the user confirms, call the appropriate function immediately
- Be concise, professional, and friendly. Use ₹ for amounts.
- If KYC is not verified, inform the user and offer to check KYC status

INTEREST RATE BANDS (for EMI previews):
- Credit score 800+: 14% p.a.
- Credit score 600–799: 20% p.a.
- Credit score below 600: 27% p.a.

EMI FORMULA (reducing balance):
EMI = P × r × (1+r)^n / ((1+r)^n − 1), where r = annual_rate / 12 / 100

TENOR OPTIONS: Only 1, 6, 12, 24, or 36 months (RBI-approved).

LOAN CONFIRMATION FORMAT (mandatory before calling apply_loan):
"Please confirm:
• Amount: ₹[X]
• Purpose: [Y]
• Tenure: [N] months
• Est. Interest Rate: [R]% p.a.
• Est. Monthly EMI: ₹[EMI]
Shall I proceed?"

Do NOT call any function without user confirmation.
Current response language: $langName
''';
}

// ─── Service ──────────────────────────────────────────────────────────────────

class LenAiService {
  static const String _apiKey = AppConfig.openAiApiKey;
  static const String _model = 'gpt-4o-mini';
  static const String _url = 'https://api.openai.com/v1/chat/completions';

  /// Language code used to build the system prompt.
  String languageCode;

  LenAiService({this.languageCode = 'en'});

  // Full conversation history (only user / assistant / tool messages)
  final List<Map<String, dynamic>> _history = [];

  // ── Send a user message ───────────────────────────────────────────────────

  /// Adds user message to history and calls OpenAI.
  /// Returns either a [LenAiResponse.text] (normal reply) or
  /// [LenAiResponse.tool] (function the model wants to call).
  Future<LenAiResponse> sendMessage(String userText) async {
    _history.add({'role': 'user', 'content': userText});
    return _callOpenAI();
  }

  // ── Send tool result back to OpenAI after execution ───────────────────────

  /// Call this after executing the function.
  /// [toolCallId] — from [LenAiToolCall.id]
  /// [functionName] — from [LenAiToolCall.name]
  /// [result] — outcome string to feed back to the model
  ///
  /// Returns a [LenAiResponse] — either text (final reply) or another
  /// tool call (if OpenAI chains a second function).
  Future<LenAiResponse> sendToolResult({
    required String toolCallId,
    required String functionName,
    required String result,
  }) async {
    _history.add({
      'role': 'tool',
      'tool_call_id': toolCallId,
      'content': result,
    });
    return _callOpenAI();
  }

  // ── Core OpenAI call ──────────────────────────────────────────────────────

  Future<LenAiResponse> _callOpenAI() async {
    final body = jsonEncode({
      'model': _model,
      'messages': [
        {'role': 'system', 'content': _buildSystemPrompt(languageCode)},
        ..._history,
      ],
      'tools': _tools,
      'tool_choice': 'auto',
      'temperature': 0.3,
      'max_tokens': 600,
    });

    final httpResponse = await http.post(
      Uri.parse(_url),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_apiKey',
      },
      body: body,
    );

    if (httpResponse.statusCode != 200) {
      final err = jsonDecode(httpResponse.body);
      throw Exception(
          'OpenAI ${httpResponse.statusCode}: ${err['error']?['message'] ?? 'Unknown error'}');
    }

    final data = jsonDecode(httpResponse.body) as Map<String, dynamic>;
    final choice = (data['choices'] as List).first as Map<String, dynamic>;
    final message = choice['message'] as Map<String, dynamic>;
    final finishReason = choice['finish_reason'] as String?;

    if (finishReason == 'tool_calls') {
      // Model wants to call a function
      final toolCalls = message['tool_calls'] as List;
      final call = toolCalls.first as Map<String, dynamic>;
      final fn = call['function'] as Map<String, dynamic>;
      final args = jsonDecode(fn['arguments'] as String) as Map<String, dynamic>;

      // Store assistant message (with tool_calls) in history
      _history.add(message);

      final toolCall = LenAiToolCall(
        id: call['id'] as String,
        name: fn['name'] as String,
        args: args,
      );
      return LenAiResponse.tool(toolCall);
    } else {
      // Normal text response
      final text = (message['content'] as String?)?.trim() ?? '';
      _history.add({'role': 'assistant', 'content': text});
      return LenAiResponse.text(text);
    }
  }

  // ── Reset conversation ────────────────────────────────────────────────────

  void reset() => _history.clear();
}
