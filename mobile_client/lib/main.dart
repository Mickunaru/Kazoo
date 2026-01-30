import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile_client/globals.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/services/firebase_messaging_service.dart';
import 'package:mobile_client/services/lifecycle_service.dart';
import 'package:mobile_client/services/theme/theme_config_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: Environment.fileName);
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  setupServices();
  await locator.get<FirebaseMessagingService>().initNotifications();
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  final _lifecycleService = locator.get<LifecycleService>();
  final _themeService = locator.get<ThemeService>();
  late ThemeData _theme;

  @override
  initState() {
    super.initState();
    _lifecycleService.init();
    _themeService.addListener(_updateTheme);
  }

  @override
  void dispose() {
    _lifecycleService.dispose();
    _themeService.removeListener(_updateTheme);
    super.dispose();
  }

  void _updateTheme() {
    setState(() {
      _theme = _themeService.themeData;
    });
  }

  @override
  Widget build(BuildContext context) {
    _theme = _themeService.themeData;
    return MaterialApp.router(
        scaffoldMessengerKey: snackbarKey,
        debugShowCheckedModeBanner: false,
        title: 'Kazoo',
        theme: _theme,
        routerConfig: AppNavigator.router);
  }
}
