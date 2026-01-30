import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';

class ValidityPopUpIcon extends StatelessWidget {
  const ValidityPopUpIcon({super.key, required this.pointsGained});
  final int pointsGained;

  @override
  Widget build(BuildContext context) => Icon(
        pointsGained > 0 ? Icons.check_circle : Icons.cancel,
        color: pointsGained > 0 ? MyColors.green : MyColors.red,
        size: 80,
      );
}
