import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/theme/theme_config_service.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/custom_dialog.dart';
import 'package:mobile_client/widgets/navigation/money_display.dart';
import 'package:mobile_client/widgets/navigation/theme_menu.dart';

final double navBarWidth = 70;

class NavBar extends StatefulWidget {
  final String returnRoute;
  const NavBar({
    super.key,
    required this.returnRoute,
  });

  @override
  State<NavBar> createState() => _NavBarState();
}

class _NavBarState extends State<NavBar> {
  final ChatService chatService = locator.get<ChatService>();
  final UserAuthService userAuthService = locator.get<UserAuthService>();
  final ThemeService themeService = locator.get<ThemeService>();
  final RoomService roomService = locator.get<RoomService>();

  void signOut(BuildContext context) {
    userAuthService.signOut();
    themeService.setTheme('Thème défaut');
    AppNavigator.go("/${PageUrl.login.name}");
  }

  void _showExitDialog({
    isLoggout = false,
    required Function func,
  }) {
    if (roomService.roomId.isEmpty && !isLoggout) {
      func();
      return;
    }
    showCustomDialog(
        context: context,
        title: 'Attention!',
        description: 'Êtes-vous certain de vouloir quitter la partie ?',
        cancelText: 'Annuler',
        confirmText: 'Quitter',
        func: func);
  }

  void _goBack() => AppNavigator.go(widget.returnRoute);

  void _goToShop() => AppNavigator.go("/${PageUrl.shop.name}");

  void _goToAccount() => AppNavigator.go("/${PageUrl.account.name}");

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Expanded(
            flex: 2,
            child: GestureDetector(
              onTap: () => _showExitDialog(func: _goBack),
              child: Container(
                  width: 70,
                  color: Theme.of(context).colorScheme.secondary,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8.0),
                    child: Center(
                        child: SafeArea(
                            child: SvgPicture.asset(
                      "assets/images/logo-white.svg",
                    ))),
                  )),
            )),
        Expanded(
          flex: 18,
          child: Container(
            color: Theme.of(context).colorScheme.primary,
            width: 70,
            constraints: const BoxConstraints(maxWidth: 200),
            child: Column(
              spacing: 10,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                SizedBox(height: 10),
                IconButton(
                  onPressed: () => _showExitDialog(func: _goToShop),
                  icon: const Icon(Icons.shopping_cart),
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              
                IconButton(
                    onPressed: () => _showExitDialog(func: _goToAccount),
                    color: Theme.of(context).colorScheme.onPrimary,
                    icon: Icon(Icons.person)),
                Spacer(),
                const MoneyDisplay(),
                const ThemeMenu(),
                IconButton(
                  onPressed: () {
                    _showExitDialog(
                        func: () => signOut(context), isLoggout: true);
                  },
                  icon: Icon(
                    Icons.logout,
                    color: Theme.of(context).colorScheme.error,
                  ),
                ),
                SizedBox(
                  height: 10,
                )
              ],
            ),
          ),
        ),
      ],
    );
  }
}
