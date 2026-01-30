import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/home_page/home_lobby_service.dart';
import 'package:mobile_client/widgets/home/game_card.dart';

class GameList extends StatelessWidget {
  GameList({super.key});

  final HomeLobbyService _homeLobbyService = locator.get<HomeLobbyService>();

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
        listenable: _homeLobbyService,
        builder: (context, child) {
          return Column(mainAxisAlignment: MainAxisAlignment.start, children: [
            if (_homeLobbyService.activeGames.isNotEmpty)
              const Align(
                alignment: Alignment.centerLeft,
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 8.0),
                  child: Text("Jeux Disponibles",
                      style: TextStyle(
                          fontSize: FontSize.l, fontWeight: FontWeight.bold)),
                ),
              ),
            Expanded(
                child: Padding(
              padding: const EdgeInsets.only(left: 8, right: 8),
              child: GridView(
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 8,
                    crossAxisSpacing: 8,
                    childAspectRatio: 2 / 1.2),
                children: [
                  for (var activeGame in _homeLobbyService.activeGames)
                    GameCard(activeGame: activeGame)
                ],
              ),
            ))
          ]);
        });
  }
}
