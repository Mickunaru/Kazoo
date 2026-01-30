import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/guards/game_pages_guard.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/pages/account_page.dart';
import 'package:mobile_client/pages/game_master_page.dart';
import 'package:mobile_client/pages/game_page.dart';
import 'package:mobile_client/pages/home_page.dart';
import 'package:mobile_client/pages/login_page.dart';
import 'package:mobile_client/pages/result_page.dart';
import 'package:mobile_client/pages/signup_page.dart';
import 'package:mobile_client/pages/start_new_game_page.dart';
import 'package:mobile_client/pages/waiting_room_page.dart';
import 'package:mobile_client/shop/shop_page.dart';
import 'package:mobile_client/widgets/main_layout.dart';

class AppNavigator {
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  static final GoRouter _router = GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: "/${PageUrl.login.name}",
    redirect: (context, state) {
      locator.get<GamePagesGuard>().resetManagerOnLogOut(state.fullPath);
      return null;
    },
    routes: [
      GoRoute(
        path: "/${PageUrl.login.name}",
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: "/${PageUrl.signup.name}",
        builder: (context, state) => const SignupPage(),
      ),
      GoRoute(
        path: '/',
        redirect: (context, state) => "/${PageUrl.login.name}",
      ),
      ShellRoute(
        observers: [locator.get<GamePagesGuard>()],
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: "/${PageUrl.home.name}",
            builder: (context, state) => const HomePage(),
          ),
          GoRoute(
            path: "/${PageUrl.newGame.name}",
            builder: (context, state) => const StartNewGamePage(),
          ),
          GoRoute(
            path: "/${PageUrl.waitingRoom.name}",
            builder: (context, state) => const WaitingRoomPage(),
          ),
          GoRoute(
            path: "/${PageUrl.game.name}",
            builder: (context, state) => const GamePage(),
          ),
          GoRoute(
            path: "/${PageUrl.gameMaster.name}",
            builder: (context, state) => const GameMasterPage(),
          ),
          GoRoute(
            path: "/${PageUrl.results.name}",
            builder: (context, state) => const ResultPage(),
          ),
          GoRoute(
            path: "/${PageUrl.shop.name}",
            builder: (context, state) => const ShopPage(),
          ),
          GoRoute(
            path: "/${PageUrl.account.name}",
            builder: (context, state) => const AccountPage(),
          ),
        ],
      ),
    ],
  );

  static GoRouter get router => _router;

  static void go(String routeName) {
    debugPrint('Navigating to: $routeName');
    _router.go(routeName);
  }

  static Future<dynamic>? push(String routeName) {
    debugPrint('Pushing route: $routeName');
    return _router.push(routeName);
  }

  static Future<dynamic>? replace(String routeName) {
    debugPrint('Replacing with route: $routeName');
    return _router.replace(routeName);
  }

  static void pop(BuildContext? context) {
    debugPrint('Popping route');
    if (_router.canPop()) {
      _router.pop(context);
    } else {
      debugPrint('Cannot pop: Already at the root route');
    }
  }
}
