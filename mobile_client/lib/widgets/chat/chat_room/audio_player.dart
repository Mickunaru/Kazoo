import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/audio_player_service.dart';

class AudioPlayerWidget extends StatefulWidget {
  final String? audioUrl;
  final double? duration;

  const AudioPlayerWidget({
    super.key,
    required this.audioUrl,
    this.duration,
  });

  @override
  State<AudioPlayerWidget> createState() => _AudioPlayerWidgetState();
}

class _AudioPlayerWidgetState extends State<AudioPlayerWidget> {
  final AudioPlayerService _audioPlayerService =
      locator.get<AudioPlayerService>();

  late AudioPlayer _audioPlayer;
  bool isPlaying = false;
  double progress = 0;

  @override
  void initState() {
    super.initState();
    _audioPlayer = AudioPlayer();

    _audioPlayer.onPositionChanged.listen((Duration current) {
      if (widget.duration != null && widget.duration! > 0) {
        setState(() {
          progress = (current.inSeconds / widget.duration!).clamp(0.0, 1.0);
        });
      }
    });

    _audioPlayer.onPlayerComplete.listen((event) {
      setState(() {
        isPlaying = false;
        progress = 0;
      });
      _audioPlayerService.clear(_audioPlayer);
    });

    _audioPlayerService.activePlayer.addListener(_handleActivePlayerChange);
  }

  void _handleActivePlayerChange() {
    final isNowPlaying = _audioPlayerService.isCurrent(_audioPlayer);
    if (isPlaying && !isNowPlaying) {
      // Got interrupted
      setState(() {
        isPlaying = false;
        progress = 0;
      });
    }
  }

  Future<void> togglePlayPause() async {
    if (widget.audioUrl == null) return;

    if (isPlaying) {
      await _audioPlayer.stop();
      setState(() {
        isPlaying = false;
        progress = 0;
      });
      _audioPlayerService.clear(_audioPlayer);
    } else {
      _audioPlayerService.setCurrent(_audioPlayer);
      await _audioPlayer.play(UrlSource(widget.audioUrl!));
      setState(() {
        isPlaying = true;
      });
    }
  }

  @override
  void dispose() {
    _audioPlayerService.clear(_audioPlayer);
    _audioPlayerService.activePlayer.removeListener(_handleActivePlayerChange);
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 48,
      child: Stack(
        alignment: Alignment.center,
        children: [
          CircularProgressIndicator(
            value: isPlaying && widget.duration != null ? progress : 0,
            strokeWidth: 4,
          ),
          IconButton(
            icon: Icon(isPlaying ? Icons.pause : Icons.play_arrow),
            onPressed: togglePlayPause,
            iconSize: 28,
          ),
        ],
      ),
    );
  }
}
