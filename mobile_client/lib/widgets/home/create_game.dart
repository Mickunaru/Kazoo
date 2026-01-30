import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class CreateGame extends StatefulWidget {
  const CreateGame({super.key});

  @override
  State<CreateGame> createState() => _CreateGameState();
}

class _CreateGameState extends State<CreateGame> {
  @override
  Widget build(BuildContext context) {
    return Padding(
        padding: EdgeInsetsDirectional.symmetric(horizontal: 5, vertical: 20),
        child: Container(
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text("Organisez!",
                  style: TextStyle(
                      fontSize: FontSize.xl,
                      color: Colors.black,
                      fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              _createGameButton(),
            ],
          ),
        ));
  }

  Widget _createGameButton() {
    return ElevatedButton(
        onPressed: () => AppNavigator.go("/${PageUrl.newGame.name}"),
        style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
            backgroundColor: Theme.of(context).colorScheme.primary,
            disabledBackgroundColor: Theme.of(context).colorScheme.primary),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text("Créer une partie",
                style: TextStyle(
                    fontSize: FontSize.l,
                    color: Theme.of(context).colorScheme.surface)),
          ],
        ));
  }
}
