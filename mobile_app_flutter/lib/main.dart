/**
 * Main Entry Point - Hybrid Blockchain Microfinance App
 * 
 * Sets up:
 * - Material App with purple/white fintech theme
 * - Provider state management (Auth, Loan, Wallet, Profile)
 * - Route configuration
 * - INR-only interface (no crypto UI)
 */

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'providers/language_provider.dart';
import 'providers/loan_provider.dart';
import 'providers/profile_provider.dart';
import 'providers/wallet_provider.dart';
import 'providers/kyc_provider.dart';
import 'services/api_service.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/borrower_dashboard.dart';
import 'screens/lender_dashboard.dart';
import 'screens/lender_profile_screen.dart';
import 'screens/borrower_profile_screen.dart';
import 'screens/kyc_screen.dart';

void main() {
  runApp(const MicrofinanceApp());
}

class MicrofinanceApp extends StatelessWidget {
  const MicrofinanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => LoanProvider()),
        ChangeNotifierProvider(create: (_) => WalletProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider(ApiService())),
        ChangeNotifierProvider(create: (_) => KycProvider()),
      ],
      child: Consumer2<AuthProvider, LanguageProvider>(
        builder: (context, authProvider, langProvider, _) {
          return MaterialApp(
            locale: langProvider.locale,
            supportedLocales: const [
              Locale('en'),
              Locale('hi'),
              Locale('mr'),
            ],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            title: 'arthsetu',
            debugShowCheckedModeBanner: false,
            
            // ============ Theme Configuration ============
            theme: ThemeData(
              // Primary color: Indigo
              primarySwatch: Colors.indigo,
              primaryColor: const Color(0xFF312E81),
              
              // Accent color
              colorScheme: ColorScheme.fromSeed(
                seedColor: const Color(0xFF312E81),
                primary: const Color(0xFF312E81),
                secondary: const Color(0xFF4338CA),
                background: Colors.white,
                surface: Colors.white,
              ),
              
              // Scaffold background
              scaffoldBackgroundColor: const Color(0xFFF7FAFC),
              
              // AppBar theme
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFF312E81),
                foregroundColor: Colors.white,
                elevation: 0,
                centerTitle: true,
              ),
              
              // Card theme
              cardTheme: CardTheme(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                color: Colors.white,
              ),
              
              // Button theme
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF312E81),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 16,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  elevation: 2,
                ),
              ),
              
              // Input decoration theme
              inputDecorationTheme: InputDecorationTheme(
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: Color(0xFF312E81),
                    width: 2,
                  ),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 16,
                ),
              ),
              
              // Text theme
              textTheme: const TextTheme(
                headlineLarge: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
                headlineMedium: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1A202C),
                ),
                bodyLarge: TextStyle(
                  fontSize: 16,
                  color: Color(0xFF4A5568),
                ),
                bodyMedium: TextStyle(
                  fontSize: 14,
                  color: Color(0xFF718096),
                ),
              ),
              
              // Use Material 3
              useMaterial3: true,
            ),
            
            // ============ Route Configuration ============
            initialRoute: authProvider.isAuthenticated ? _getHomeRoute(authProvider.userRole) : '/login',
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/borrower-dashboard': (context) => const BorrowerDashboard(),
              '/lender-dashboard': (context) => const LenderDashboard(),
              '/lender-profile': (context) => const LenderProfileScreen(),
              '/borrower-profile': (context) => const BorrowerProfileScreen(),
              '/kyc': (context) => const KycScreen(),
            },
          );
        },
      ),
    );
  }
  
  String _getHomeRoute(String? role) {
    if (role == 'borrower') {
      return '/borrower-dashboard';
    } else if (role == 'lender') {
      return '/lender-dashboard';
    }
    return '/login';
  }
}
