import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/power_up_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/custom_dialog.dart';
import 'package:mobile_client/widgets/game/game_pannel.dart';
import 'package:mobile_client/widgets/game/shake_sensor.dart';
import 'package:mobile_client/widgets/game_controls/game_controls_widget.dart';
import 'package:mobile_client/widgets/game_controls/surge_dialog.dart';

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  final RoomService roomService = locator.get<RoomService>();
  final PowerUpService _powerUpService = locator.get<PowerUpService>();

  late final StreamSubscription _surgePopupSubscription;

  @override
  void initState() {
    super.initState();
    if (!roomService.arePowerUpsEnabled) return;
    _surgePopupSubscription = _powerUpService.surgePopupStream.listen((event) {
      switch (event) {
        case SurgePopupEvent.generate:
          _generateSurgePopups();
          break;
        case SurgePopupEvent.clear:
          setState(() {});
          break;
      }
    });
  }

  @override
  void dispose() {
    _surgePopupSubscription.cancel();
    super.dispose();
  }

  void _generateSurgePopups() {
    final size = MediaQuery.of(context).size;

    List<Offset> popups = [];
    for (int i = 0; i < 15; i++) {
      final padding = 50.0;

      final top =
          Random().nextDouble() * (size.height - 200 - padding) + padding;
      final left = Random().nextDouble() * (size.width - 250 - padding) + 100;
      popups.add(Offset(left, top));
    }

    setState(() {
      _powerUpService.surgePopups = popups;
    });
  }

  void _closePopup(Offset position) {
    setState(() {
      _powerUpService.surgePopups.remove(position);
    });
  }

  void _showExitDialog() {
    showCustomDialog(
        context: context,
        title: 'Attention!',
        description: 'Êtes-vous certain de vouloir quitter la partie ?',
        cancelText: 'Annuler',
        confirmText: 'Quitter',
        func: () => AppNavigator.go("/${PageUrl.home.name}"));
  }

  @override
  Widget build(BuildContext context) {
    return ShakeToExit(
      leaveGame: () => AppNavigator.go("/${PageUrl.home.name}"),
      child: Scaffold(
        body: Stack(
          children: [
            Row(
              children: [
                if (roomService.arePowerUpsEnabled) GameControlsWidget(),
                Expanded(
                  child: const GamePannel(),
                ),
              ],
            ),
            ..._powerUpService.surgePopups.map(
              (popupPosition) => SurgeDialog(
                position: popupPosition,
                onClose: () => _closePopup(popupPosition),
              ),
            ),
            Positioned(
              bottom: 16,
              left: 80,
              child: Container(
                decoration: BoxDecoration(
                    border: Border.all(
                        width: 1, color: Theme.of(context).colorScheme.primary),
                    borderRadius: BorderRadius.circular(10)),
                height: 50,
                child: ElevatedButton.icon(
                  icon: Icon(Icons.exit_to_app),
                  onPressed: _showExitDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                  ),
                  label: Text(
                    'Quitter',
                    style: TextStyle(
                        fontSize: 18,
                        color: Theme.of(context).colorScheme.primary),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }
}
