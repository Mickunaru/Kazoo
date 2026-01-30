import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile_client/constants/enum/message_type.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/models/message.dart';
import 'package:mobile_client/widgets/chat/chat_room/audio_player.dart';

class ChatBubble extends StatelessWidget {
  final Message message;
  final bool isMine;

  const ChatBubble({
    super.key,
    required this.message,
    required this.isMine,
  });

  @override
  Widget build(BuildContext context) {
    final formattedDate = DateFormat('h:mm:ss a').format(message.date);

    final avatar = ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Image.network(
        message.avatar,
        height: 40,
        width: 40,
        fit: BoxFit.cover,
      ),
    );

    final bubbleColor = isMine
        ? Theme.of(context).colorScheme.tertiary
        : Theme.of(context).colorScheme.surfaceContainerHighest.withAlpha(80);

    final borderRadius = BorderRadius.only(
      topLeft: Radius.circular(10),
      topRight: Radius.circular(10),
      bottomLeft: isMine ? Radius.circular(10) : Radius.circular(0),
      bottomRight: isMine ? Radius.circular(0) : Radius.circular(10),
    );

    final messageContent = Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.all(8),
      constraints: const BoxConstraints(maxWidth: 190),
      decoration: BoxDecoration(
        color: bubbleColor,
        borderRadius: borderRadius,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            message.author,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: Colors.black,
            ),
          ),
          const SizedBox(height: 2),
          if (message.type == MessageType.text)
            Text(
              message.text.trim(),
              style: const TextStyle(color: Colors.black),
            ),
          if (message.type == MessageType.sound && message.duration != null)
            AudioPlayerWidget(
              audioUrl: message.text,
              duration: message.duration,
            ),
          const SizedBox(height: 2),
          Text(
            formattedDate,
            style: const TextStyle(
              fontSize: FontSize.s,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment:
            isMine ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: isMine
            ? [
                messageContent,
                const SizedBox(width: 8),
                avatar,
              ]
            : [
                avatar,
                const SizedBox(width: 8),
                messageContent,
              ],
      ),
    );
  }
}
