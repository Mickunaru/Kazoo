import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/chat_room_type.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/services/chat_service.dart';

class JoinedChatRoomList extends StatefulWidget {
  final Function(ChatRoomDto) onSelectedRoom;

  const JoinedChatRoomList({super.key, required this.onSelectedRoom});

  @override
  State<JoinedChatRoomList> createState() => _JoinedChatRoomListState();
}

class _JoinedChatRoomListState extends State<JoinedChatRoomList> {
  final ChatService _chatService = locator.get<ChatService>();
  List<ChatRoomDto> joinedRooms = [];
  late VoidCallback _listener;

  @override
  void initState() {
    super.initState();
    _listener = () {
      setState(() {
        joinedRooms = _chatService.joinedRooms;
      });
    };
    _chatService.addListener(_listener);
  }

  @override
  void dispose() {
    _chatService.removeListener(_listener);
    super.dispose();
  }

  void leaveRoom(BuildContext context, String room) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Quitter la salle'),
          content:
              Text('Êtes-vous certain de vouloir quitter la salle: \'$room\'?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(false);
              },
              child: Text(
                'Annuler',
                style: TextStyle(
                    color:
                        Theme.of(context).colorScheme.surfaceContainerHighest),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(true);
              },
              child: Text(
                'Quitter',
                style:
                    TextStyle(color: Theme.of(context).colorScheme.secondary),
              ),
            ),
          ],
        );
      },
    ).then((result) {
      if (result) {
        _chatService.leaveRoom(room);
      }
    });
  }

  void deleteRoom(BuildContext context, String room) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Supprimer la salle'),
          content: Text(
              'Êtes vous certain de vouloir supprimer la salle: \'$room\'?'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(false);
              },
              child: Text(
                'Annuler',
                style: TextStyle(
                    color:
                        Theme.of(context).colorScheme.surfaceContainerHighest),
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(true);
              },
              child: Text(
                'Supprimer',
                style:
                    TextStyle(color: Theme.of(context).colorScheme.secondary),
              ),
            ),
          ],
        );
      },
    ).then((result) {
      if (result) {
        _chatService.deleteRoom(room);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: _chatService.joinedRooms.length,
      itemBuilder: (context, index) {
        final room = _chatService.joinedRooms[index];
        return ValueListenableBuilder<int?>(
          valueListenable: room.unreadMessages,
          builder: (context, unreadMessages, _) {
            final hasUnread = unreadMessages != null && unreadMessages > 0;

            return Stack(
              clipBehavior: Clip.none,
              children: [
                Padding(
                  padding: const EdgeInsets.only(left: 8.0),
                  child: Card(
                    color: Color.lerp(
                      Theme.of(context).colorScheme.secondary,
                      Colors.white,
                      0.63,
                    ),
                    shape: hasUnread
                        ? RoundedRectangleBorder(
                            side: BorderSide(
                              color: Theme.of(context).colorScheme.error,
                              width: 5,
                            ),
                            borderRadius: BorderRadius.circular(12),
                          )
                        : RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                    child: ListTile(
                      title: Text(
                        switch (room.type) {
                          ChatRoomType.teamRoom =>
                            'Équipe: ${room.name.split('#').elementAtOrNull(1)}',
                          ChatRoomType.gameRoom =>
                            'Jeu: ${room.name.split('#').firstOrNull}',
                          _ => room.name,
                        },
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      onTap: () => widget.onSelectedRoom(room),
                      trailing: Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (room.type == ChatRoomType.custom)
                            IconButton(
                              onPressed: () {
                                leaveRoom(context, room.name);
                              },
                              icon: Icon(Icons.logout),
                              color: Theme.of(context).colorScheme.secondary,
                            ),
                          if (room.creator == _chatService.chatterName)
                            IconButton.filledTonal(
                              onPressed: () {
                                deleteRoom(context, room.name);
                              },
                              icon: Icon(Icons.delete_forever),
                              color: Colors.white,
                            ),
                        ],
                      ),
                    ),
                  ),
                ),

                // Badge
                if (hasUnread)
                  Positioned(
                    top: 1,
                    left: 5,
                    child: Badge(
                      label: Text(
                        unreadMessages.toString(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 4),
                      backgroundColor: Theme.of(context).colorScheme.error,
                    ),
                  ),
              ],
            );
          },
        );
      },
    );
  }
}
