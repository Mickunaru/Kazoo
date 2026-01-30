import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/enum/room_state.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/game_config_dto.dart';
import 'package:mobile_client/models/home_page/active_game.dart';
import 'package:mobile_client/services/join_game_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/snackbar.dart';
import 'package:tap_debouncer/tap_debouncer.dart';

class GameCard extends StatelessWidget {
  GameCard({super.key, required this.activeGame});

  final ActiveGame activeGame;
  final roomService = locator.get<RoomService>();

  Future<void> _joinGame(String roomId, BuildContext context) async {
    final roomAcessStatus =
        await locator.get<JoinGameService>().roomIdValidator(roomId);

    if (roomAcessStatus == null && context.mounted) {
      await roomService.playerJoinRoom(roomId);
      if (context.mounted) AppNavigator.go('/${PageUrl.waitingRoom.name}');
    } else if (context.mounted) {
      showCustomSnackBar(context: context, message: roomAcessStatus!);
    }
  }

  String getGameType(ActiveGame activeGame) {
    switch (activeGame.gameConfig.gameMode) {
      case GameMode.classic:
        return "Classique";
      case GameMode.elimination:
        return "Élimination Rapide";
      case GameMode.team:
        return "Équipe";
    }
  }

  String getRoomState(ActiveGame activeGame) {
    switch (activeGame.roomState) {
      case RoomState.finished:
        return 'terminée';
      case RoomState.inGame:
        return 'en partie';
      case RoomState.locked:
        return 'verrouillée';
      case RoomState.open:
        return 'ouvert';
    }
  }

  @override
  Widget build(BuildContext context) {
    return TapDebouncer(
        onTap: () async => await _joinGame(activeGame.roomId, context),
        builder: (_, onTap) {
          return InkWell(
            borderRadius: BorderRadius.circular(8),
            onTap: onTap,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                color: Theme.of(context)
                    .colorScheme
                    .surfaceContainerHighest
                    .withAlpha(80),
              ),
              padding: EdgeInsets.all(8.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Jeu ${getGameType(activeGame)} #${activeGame.roomId}',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 24),
                  ),
                  Text(
                    activeGame.gameTitle,
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  SizedBox(
                    height: 12,
                  ),
                  Text.rich(
                    TextSpan(
                      text: 'Nombre de joueur: ',
                      style: TextTheme.of(context).titleLarge,
                      children: [
                        TextSpan(
                          text: '${activeGame.playerCount}',
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                      ],
                    ),
                  ),
                  Text.rich(
                    TextSpan(
                      text: 'État de la salle: ',
                      style: TextTheme.of(context).titleLarge,
                      children: [
                        TextSpan(
                          text: getRoomState(activeGame),
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                      ],
                    ),
                  ),
                  if (activeGame.gameConfig.gameMode == GameMode.elimination)
                    Text.rich(
                      TextSpan(
                        text: "Nombre de question: ",
                        style: TextTheme.of(context).titleLarge,
                        children: [
                          TextSpan(
                            text:
                                '${(activeGame.gameConfig as RandomGameConfig).questionCount}',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 20),
                          ),
                        ],
                      ),
                    ),
                  if (activeGame.gameConfig.entryPrice > 0)
                    Text.rich(
                      TextSpan(
                        text: "Prix d'entrée: ",
                        style: TextTheme.of(context).titleLarge,
                        children: [
                          TextSpan(
                            text: '${activeGame.gameConfig.entryPrice}',
                            style: TextStyle(
                                fontWeight: FontWeight.bold, fontSize: 20),
                          ),
                        ],
                      ),
                    ),
                  if (activeGame.gameConfig.arePowerUpsEnabled)
                    Text(
                      'Avec Modificateurs de Partie',
                      style:
                          TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                    ),
                ],
              ),
            ),
          );
        });
  }
}
