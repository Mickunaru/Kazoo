import 'package:flutter/material.dart';
import 'package:mobile_client/constants/socket_events/home_event.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/user_model.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class MoneyDisplay extends StatefulWidget {
  const MoneyDisplay({super.key});

  @override
  State<MoneyDisplay> createState() => _MoneyDisplayState();
}

class _MoneyDisplayState extends State<MoneyDisplay> {
  final UserAuthService _userAuthService = locator.get<UserAuthService>();
  final WebSocketService _webSocketService = locator.get<WebSocketService>();

  @override
  void initState() {
    super.initState();
    _webSocketService.on<Map<String, dynamic>>(HomeEvent.updateUserMoney.name,
        (json) {
      final userCurrency = UserCurrency.fromJson(json);
      _userAuthService.updateCurrency(userCurrency.currency);
    });
  }

  @override
  void dispose() {
    _webSocketService.removeAllListeners(HomeEvent.updateUserMoney.name);
    super.dispose();
  }

  String formatCurrencyWithK(int? currency) {
    if (currency == null) {
      return '0';
    }

    if (currency >= 1000) {
      return '${(currency / 1000).toStringAsFixed(0)}k';
    }

    return currency.toString();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 60,
      padding: EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.white),
        borderRadius: BorderRadius.circular(10),
        color: Colors.transparent,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ListenableBuilder(
              listenable: _userAuthService,
              builder: (_, __) {
                return Text(
                  formatCurrencyWithK(_userAuthService.curUser?.currency),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                );
              }),
          SizedBox(width: 1),
          Icon(
            Icons.monetization_on,
            color: Colors.white,
            size: 16,
          ),
        ],
      ),
    );
  }
}
