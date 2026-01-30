import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/enum/message_type.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/widgets/chat/chat.const.dart';
import 'package:mobile_client/widgets/chat/chat_room/audio_player.dart';
import 'package:record/record.dart';

const int maxAudioLengthS = 60;
const int maxAudioLengthMs = maxAudioLengthS * 1000;

class ChatFooter extends StatefulWidget {
  final void Function(String message)
      onSendMessage; // Callback for sending messages
  final bool hasSoundboard;

  const ChatFooter(
      {super.key, required this.onSendMessage, required this.hasSoundboard});

  @override
  State<ChatFooter> createState() => _ChatFooterState();
}

class _ChatFooterState extends State<ChatFooter> {
  final ChatService _chatService = locator.get<ChatService>();
  final TextEditingController _messageController = TextEditingController();

  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();
  double _duration = 0;
  double _progress = 0;
  bool _isRecording = false;
  String? _localUrl;

  Timer? _interval;
  Timer? _timeout;

  @override
  void dispose() {
    _audioPlayer.dispose();
    _recorder.dispose();
    _interval?.cancel();
    _timeout?.cancel();
    super.dispose();
  }

  Future<void> _startRecording() async {
    _duration = 0;
    _progress = 0;
    if (await _recorder.hasPermission()) {
      _reset();

      final filePath =
          '${Directory.systemTemp.path}/audio_${DateTime.now().millisecondsSinceEpoch}.m4a';

      await _recorder.start(
        RecordConfig(
          encoder: AudioEncoder.aacLc,
          bitRate: 128000,
          sampleRate: 44100,
        ),
        path: filePath,
      );

      setState(() {
        _isRecording = true;
        _localUrl = null;
      });

      _timeout =
          Timer(Duration(milliseconds: maxAudioLengthMs), _stopRecording);

      _interval = Timer.periodic(const Duration(milliseconds: 100), (_) {
        setState(() {
          _duration += 0.1;
          _progress = (_duration / maxAudioLengthS) * 100;
          if (_duration >= maxAudioLengthMs) {
            _stopRecording();
          }
        });
      });
    }
  }

  Future<void> _stopRecording() async {
    final path = await _recorder.stop();
    _interval?.cancel();
    _timeout?.cancel();

    setState(() {
      _isRecording = false;
      _localUrl = path;
    });
  }

  void _reset() {
    _duration = 0;
    _progress = 0;
    _isRecording = false;
  }

  void _deleteRecording() {
    if (_localUrl != null) {
      File(_localUrl!).delete();
      setState(() => _localUrl = null);
    }
    _reset();
  }

  void sendMessage() {
    final inputText = _messageController.text.trim();
    if (inputText.isEmpty) return;

    widget.onSendMessage(inputText);
    _messageController.clear(); // Clear input field
  }

  Future<void> sendAudio() async {
    if (_localUrl == null) return;

    final uri = Uri.parse('${Environment.apiBaseUrl}/chat');
    final file = File(_localUrl!);

    final request = http.MultipartRequest('POST', uri)
      ..files.add(
        http.MultipartFile(
          'audio',
          file.readAsBytes().asStream(),
          file.lengthSync(),
          filename: 'audio.mp3',
        ),
      );

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode == 201) {
      final data = json.decode(response.body);
      final fileUrl = data['fileUrl'];

      if (fileUrl != null && fileUrl is String && fileUrl.isNotEmpty) {
        _chatService.sendMessage(fileUrl, MessageType.sound, _duration);
      }
    } else {
      debugPrint('Upload failed with status: ${response.statusCode}');
    }
    _deleteRecording();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).colorScheme.tertiary,
      padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
      child: Column(
        children: [
          _soundBoard(),
          Row(children: [
            Column(
              children: [
                if (_localUrl == null)
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          value: _progress / 100,
                          color: Theme.of(context).colorScheme.error,
                          strokeWidth: 4,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.mic),
                        color: _isRecording
                            ? Theme.of(context).colorScheme.error
                            : Theme.of(context).colorScheme.primary,
                        onPressed:
                            _isRecording ? _stopRecording : _startRecording,
                        iconSize: 28,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                    ],
                  )
                else
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      AudioPlayerWidget(
                          audioUrl: _localUrl, duration: _duration),
                      IconButton(
                        icon: const Icon(Icons.delete_forever),
                        color: Theme.of(context).colorScheme.error,
                        onPressed: _deleteRecording,
                      ),
                    ],
                  ),
              ],
            ),
            Expanded(child: _textInput())
          ]),
          const SizedBox(height: 10),
          _sendButton(),
        ],
      ),
    );
  }

  Widget _soundBoard() {
    if (!widget.hasSoundboard) return SizedBox.shrink();

    final soundboardList = soundboardElements;

    return Container(
      padding: EdgeInsets.all(5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.volume_up),
          SizedBox(width: 5),
          Expanded(
            child: Container(
              padding: EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: Color.fromARGB(25, 0, 0, 0),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: soundboardList.map((item) {
                  return Tooltip(
                    message: item.name,
                    child: SizedBox(
                      width: 35,
                      height: 35,
                      child: FloatingActionButton(
                        backgroundColor:
                            Theme.of(context).colorScheme.secondary,
                        heroTag: item.name,
                        onPressed: () =>
                            _chatService.sendSoundboardMessage(item),
                        mini: true,
                        shape: const CircleBorder(),
                        child: Icon(item.icon, size: 20),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _textInput() {
    return Container(
        constraints: BoxConstraints(maxHeight: 100),
        child: TextField(
          minLines: 2,
          controller: _messageController,
          onSubmitted: (_) => sendMessage(),
          maxLength: 200,
          maxLines: null,
          keyboardType: TextInputType.multiline,
          decoration: InputDecoration(
            filled: true,
            fillColor: Theme.of(context).colorScheme.surface,
            hintText: "Message...",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            counterText: "",
          ),
        ));
  }

  Widget _sendButton() {
    return ElevatedButton(
        onPressed: () {
          sendMessage();
          sendAudio();
        },
        style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            disabledBackgroundColor: Theme.of(context).colorScheme.secondary),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text("Envoyer",
                style: TextStyle(
                    fontSize: FontSize.l,
                    color: Theme.of(context).colorScheme.surface)),
            SizedBox(
              width: 10,
            ),
            Icon(
              Icons.send,
              color: Theme.of(context).colorScheme.surface,
              size: 20,
            ),
          ],
        ));
  }
}
