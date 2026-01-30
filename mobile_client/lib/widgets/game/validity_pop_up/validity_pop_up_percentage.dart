import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';

class ValidityPopUpPercentage extends StatelessWidget {
  final double _percentageGiven;
  const ValidityPopUpPercentage({super.key, required percentageGiven})
      : _percentageGiven = percentageGiven * 100;

  @override
  Widget build(BuildContext context) {
    return Container(
        width: 80,
        height: 80,
        padding: const EdgeInsets.all(8.0),
        decoration: BoxDecoration(
          color: _percentageGiven == 100
              ? MyColors.green
              : _percentageGiven == 50
                  ? Colors.orangeAccent
                  : MyColors.red,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(
            '${_percentageGiven.toInt()}%',
            style: TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ));
  }
}
