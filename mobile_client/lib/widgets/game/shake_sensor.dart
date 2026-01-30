import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

class ShakeToExit extends StatefulWidget {
  final Widget child;
  final Function leaveGame;

  const ShakeToExit({super.key, required this.child, required this.leaveGame});

  @override
  State<ShakeToExit> createState() => _ShakeToExitState();
}

class _ShakeToExitState extends State<ShakeToExit> {
  static const double shakeThreshold = 15.0;
  bool isDialogOn = false;
  DateTime lastShakeTime = DateTime.now().subtract(const Duration(seconds: 2));
  StreamSubscription? _accelSub;

  @override
  void initState() {
    super.initState();
    _accelSub = accelerometerEventStream().listen(_onAccelerometerEvent);
  }

  void _onAccelerometerEvent(AccelerometerEvent event) {
    final double totalAcceleration = sqrt(
      pow(event.x, 2) + pow(event.y, 2) + pow(event.z, 2),
    );

    final now = DateTime.now();
    final timeSinceLastShake = now.difference(lastShakeTime).inMilliseconds;

    if (!isDialogOn &&
        totalAcceleration > shakeThreshold &&
        timeSinceLastShake > 1500) {
      lastShakeTime = now;
      _showExitDialog();
    }
  }

  void _showExitDialog() {
    isDialogOn = true;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Quitter jeu?'),
        content: const Text('Voulez-vous quitter la partie?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              isDialogOn = false;
            },
            child: const Text('Annuler'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              isDialogOn = false;
              widget.leaveGame();
            },
            child: const Text('Confirmer'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _accelSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
