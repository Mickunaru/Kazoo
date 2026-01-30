import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';

class SoundService {
  Future<void> playSound(String url) async {
    final player = AudioPlayer();
    try {
      await player.play(UrlSource(url));
    } catch (e) {
      debugPrint('Error playing sound: $e');
    }

    player.onPlayerComplete.listen((event) {
      player.dispose();
    });
  }
}
