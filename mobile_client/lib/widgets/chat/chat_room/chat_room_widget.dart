import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/message_type.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/widgets/chat/chat_room/chat_bubble.dart';
import 'package:mobile_client/widgets/chat/chat_room/chat_footer.dart';
import 'package:provider/provider.dart';

class ChatRoomWidget extends StatefulWidget {
  const ChatRoomWidget({super.key});

  @override
  State<ChatRoomWidget> createState() => _ChatRoomWidgetState();
}

class _ChatRoomWidgetState extends State<ChatRoomWidget> {
  final ScrollController _scrollController = ScrollController();
  final ChatService _chatService = locator.get<ChatService>();

  @override
  void initState() {
    super.initState();
    _chatService.loadChatHistory();

    _chatService.addListener(() {
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(_scrollController.position.minScrollExtent,
          duration: Duration(milliseconds: 300), curve: Curves.easeOut);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ChangeNotifierProvider.value(
            value: _chatService,
            child: Consumer<ChatService>(
              builder: (context, chatService, child) {
                if (chatService.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                final reversedMessages = chatService.messages.reversed.toList();

                return ListView.builder(
                  reverse: true,
                  controller: _scrollController,
                  itemCount: chatService.messages.length,
                  padding: const EdgeInsets.only(bottom: 10),
                  itemBuilder: (context, index) {
                    final message = reversedMessages[index];
                    return ChatBubble(
                      message: message,
                      isMine: message.author == chatService.chatterName,
                    );
                  },
                );
              },
            ),
          ),
        ),
        ChatFooter(
            onSendMessage: (message) {
              _chatService.sendMessage(message, MessageType.text, null);
            },
            hasSoundboard:
                _chatService.currentRoomNotifier.value?.hasSoundboard ?? false),
      ],
    );
  }
}
