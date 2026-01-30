import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/custom_dialog.dart';
import 'package:mobile_client/widgets/game/leaderboard.dart';
import 'package:mobile_client/widgets/game_master/organizer_controls.dart';

class GameMasterWidget extends StatelessWidget {
  const GameMasterWidget({super.key});

  void _showEndGameDialog(context) {
    showCustomDialog(
        context: context,
        title: "Quitter ?",
        description: "Êtes-vous certain de vouloir mettre fin à la partie ?",
        cancelText: "Annuler",
        confirmText: "Confirmer",
        func: () => AppNavigator.go("/${PageUrl.home.name}"));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context).colorScheme;
    return Stack(children: [
      Positioned(
        bottom: 20,
        left: 20,
        child: ElevatedButton.icon(
          onPressed: () => _showEndGameDialog(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: theme.surface,
            side: BorderSide(color: theme.primary, width: 1),
          ),
          icon: Icon(Icons.close, color: theme.primary),
          label: Text("Mettre fin à la partie",
              style: TextStyle(color: theme.primary)),
        ),
      ),
      Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Expanded(
                flex: 1,
                child: const Leaderboard(resultMode: false),
              ),
              
              Expanded(
                  flex: 2,
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: OrganizerControls(),
                  )),
            ],
          ),
        ],
      ),
    ]);
  }
}
