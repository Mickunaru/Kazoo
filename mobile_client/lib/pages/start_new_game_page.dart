import 'package:flutter/material.dart';
import 'package:mobile_client/widgets/start_new_game/game_selection.dart';

class StartNewGamePage extends StatelessWidget {
  const StartNewGamePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Column(
      children: [
        Text("Créer une partie",
            style: Theme.of(context).textTheme.headlineLarge),
        SizedBox(height: 20),
        Text("Sélectionnez un jeu",
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.black,
            )),
        Expanded(child: GameSelection()),
      ],
    ));
  }
}
