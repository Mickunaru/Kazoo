import 'package:flutter/material.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/widgets/chat/chat_room_navigator/joinable_chat_room_list.dart';
import 'package:mobile_client/widgets/chat/chat_room_navigator/joined_chat_room_list.dart';

class ChatRoomNavigator extends StatefulWidget {
  final Function(ChatRoomDto) onRoomSelected;
  final Function() onCreateRoom;

  const ChatRoomNavigator({
    super.key,
    required this.onRoomSelected,
    required this.onCreateRoom,
  });

  @override
  State<ChatRoomNavigator> createState() => _ChatRoomNavigatorState();
}

class _ChatRoomNavigatorState extends State<ChatRoomNavigator> {
  void selectRoom(ChatRoomDto room) {
    widget.onRoomSelected(room);
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
        length: 2,
        child: Scaffold(
          body: Column(children: [
            TabBar(
              tabs: const [
                Tab(text: 'Mes salles'),
                Tab(text: 'Rejoindre'),
              ],
            ),
            Expanded(
                child: TabBarView(children: [
              JoinedChatRoomList(onSelectedRoom: selectRoom),
              JoinableChatRoomList(onJoinRoom: selectRoom)
            ]))
          ]),
        ));
  }
}
