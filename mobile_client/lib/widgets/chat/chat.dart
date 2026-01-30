import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/chat_room_type.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/widgets/chat/chat.const.dart';
import 'package:mobile_client/widgets/chat/chat_room/chat_room_widget.dart';
import 'package:mobile_client/widgets/chat/chat_room_navigator/chat_room_navigator.dart';
import 'package:mobile_client/widgets/chat/create_chat_room/create_chat_room.dart';

class Chat extends StatefulWidget {
  const Chat({super.key});

  @override
  State<Chat> createState() => _ChatState();
}

class _ChatState extends State<Chat> {
  final ChatService _chatService = locator.get<ChatService>();
  String? currentPage;
  String title = chatWindowTitle;

  @override
  void initState() {
    super.initState();
    _chatService.currentRoomNotifier.addListener(_onRoomNameChange);
  }

  @override
  void dispose() {
    _chatService.removeListener(_onRoomNameChange);
    super.dispose();
  }

  void _onRoomNameChange() {
    if (_chatService.currentRoomNotifier.value == null) {
      currentPage = null;
      title = chatWindowTitle;
    }
  }

  void goBack() {
    setState(() {
      if (currentPage == 'room') {
        _chatService.changeRoom(null);
      }
      currentPage = null;
      title = chatWindowTitle;
      _chatService.currentChatRoomType = null;
    });
  }

  void openCreateRoom() {
    setState(() {
      currentPage = 'create';
      title = 'Nouvelle Salle';
      _chatService.currentChatRoomType = null;
    });
  }

  void roomSelected(ChatRoomDto room) {
    _chatService.changeRoom(room);
    setState(() {
      currentPage = 'room';
      title = room.name;
      _chatService.currentChatRoomType;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
            centerTitle: true,
            title: Text(
              switch (_chatService.currentChatRoomType) {
                ChatRoomType.teamRoom =>
                  'Équipe: ${title.split('#').elementAtOrNull(1)}',
                ChatRoomType.gameRoom => 'Jeu: ${title.split('#').firstOrNull}',
                _ => title,
              },
              style: TextStyle(
                  color: Theme.of(context).colorScheme.onSecondary,
                  fontWeight: FontWeight.w900),
            ),
            leading: currentPage == null
                ? IconButton(
                    onPressed: openCreateRoom,
                    icon: Icon(Icons.add,
                        color: Theme.of(context).colorScheme.onSecondary))
                : IconButton(
                    onPressed: goBack,
                    icon: Icon(Icons.arrow_back,
                        color: Theme.of(context).colorScheme.onSecondary)),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(
                bottom: Radius.circular(10.0),
              ),
            ),
            elevation: 4.0,
            shadowColor: Colors.black.withAlpha(50)
            ),
        body: Builder(
          builder: (context) {
            switch (currentPage) {
              case 'create':
                return CreateChatRoom(
                  onRoomCreated: (room) {
                    roomSelected(room);
                  },
                );
              case 'room':
                return ChatRoomWidget();
              default:
                return ChatRoomNavigator(
                  onRoomSelected: (room) {
                    roomSelected(room);
                  },
                  onCreateRoom: openCreateRoom,
                );
            }
          },
        ));
  }
}
