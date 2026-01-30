import 'package:flutter/material.dart';
import 'package:mobile_client/constants/power_ups_constants.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/power_up_service.dart';

class PowerUpIndicator extends StatefulWidget {
  const PowerUpIndicator({super.key});

  @override
  State<PowerUpIndicator> createState() => _PowerUpIndicatorState();
}

class _PowerUpIndicatorState extends State<PowerUpIndicator> {
  final PowerUpService powerUpService = locator.get<PowerUpService>();

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: powerUpService.currentPowerUps,
      builder: (context, currentPowerUps, child) {
        if (currentPowerUps.isEmpty) return const SizedBox.shrink();

        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: currentPowerUps.map((powerUpType) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: AnimatedPowerUpIcon(
                  imageUrl: powerUpImageUrl[powerUpType.name]!),
            );
          }).toList(),
        );
      },
    );
  }
}

class AnimatedPowerUpIcon extends StatefulWidget {
  final String imageUrl;
  const AnimatedPowerUpIcon({super.key, required this.imageUrl});

  @override
  State<AnimatedPowerUpIcon> createState() => _AnimatedPowerUpIconState();
}

class _AnimatedPowerUpIconState extends State<AnimatedPowerUpIcon>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _opacityAnimation;
  // late Animation<List<BoxShadow>> _shadowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _opacityAnimation =
        Tween<double>(begin: 0.92, end: 1.0).animate(_controller);

    // _shadowAnimation = Tween<List<BoxShadow>>(
    //   begin: [
    //     BoxShadow(
    //       color: Colors.redAccent,
    //       offset: Offset(0, 0),
    //       blurRadius: 5.0,
    //       spreadRadius: 0.0,
    //     ),
    //   ],
    //   end: [
    //     BoxShadow(
    //       color: Colors.redAccent,
    //       offset: Offset(0, 0),
    //       blurRadius: 20.0,
    //       spreadRadius: 5.0,
    //     ),
    //   ],
    // ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: 70,
          height: 70,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFF263238), width: 3),
            // boxShadow: _shadowAnimation.value,
          ),
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.network(widget.imageUrl, fit: BoxFit.cover),
            ),
          ),
        );
      },
    );
  }
}
