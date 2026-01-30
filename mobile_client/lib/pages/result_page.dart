import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/game/leaderboard.dart';
import 'package:mobile_client/widgets/results/player_money_prize.dart';
import 'package:mobile_client/widgets/results/team_card.dart';

class ResultPage extends StatelessWidget {
  const ResultPage({super.key});

  @override
  Widget build(BuildContext context) {
    var leaveButton = ElevatedButton(
        style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary),
        onPressed: () {
          AppNavigator.go('/${PageUrl.home.name}');
        },
        child: Text("Retour à la page d'accueil →",
            style: TextStyle(color: Theme.of(context).colorScheme.onPrimary)));
    return Scaffold(
      body: Column(
        children: [
          Expanded(
            flex: 7,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                PlayerMoneyPrize(),
                Column(children: [
                  TeamCard(),
                  Leaderboard(resultMode: true),
                  SizedBox(height: 10),
                  leaveButton
                ])
              ],
            ),
          ),
          Spacer(flex: 3),
        ],
      ),
    );
  }
}
