import 'package:flutter/material.dart';

class PowerUpCountBadgeWidget extends StatelessWidget {
  final int amount;
  final bool isDisabled;

  const PowerUpCountBadgeWidget({
    super.key,
    required this.amount,
    required this.isDisabled,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      bottom: 0,
      right: 0,
      child: ColorFiltered(
        colorFilter: isDisabled
            ? const ColorFilter.mode(Colors.grey, BlendMode.saturation)
            : const ColorFilter.mode(Colors.transparent, BlendMode.multiply),
        child: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.red,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            amount.toString(),
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
