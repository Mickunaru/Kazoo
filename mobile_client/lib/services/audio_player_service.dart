import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class AudioPlayerService {
  AudioPlayer? _current;
  final ValueNotifier<AudioPlayer?> activePlayer = ValueNotifier(null);

  void setCurrent(AudioPlayer audioPlayer) {
    if (_current != null && _current != audioPlayer) {
      _current!.stop();
    }
    _current = audioPlayer;
    activePlayer.value = audioPlayer;
  }

  void clear(AudioPlayer audioPlayer) {
    if (_current == audioPlayer) {
      _current = null;
      activePlayer.value = null;
    }
  }

  bool isCurrent(AudioPlayer player) => _current == player;
}
