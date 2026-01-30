import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';

class ValidityPopUpIconTitle extends StatelessWidget {
  const ValidityPopUpIconTitle(
      {super.key,
      required this.pointsGained,
      this.isPartial,
      required this.isEliminated});
  final int pointsGained;
  final bool? isPartial;
  final bool isEliminated;

  String title() {
    if (isEliminated) return 'Réponse';
    if (isPartial == true) return 'Réponse partielle';
    if (pointsGained == 0) return 'Mauvaise réponse';
    return 'Bonne réponse!';
  }

  @override
  Widget build(BuildContext context) => Text(
        title(),
        style: TextStyle(
          fontSize: 22,
          fontWeight: FontWeight.bold,
          color: isPartial ?? false
              ? Colors.orangeAccent
              : pointsGained > 0
                  ? MyColors.green
                  : MyColors.red,
        ),
      );
}
