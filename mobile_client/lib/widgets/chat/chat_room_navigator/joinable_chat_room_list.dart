import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/services/chat_service.dart';

class JoinableChatRoomList extends StatefulWidget {
  final Function(ChatRoomDto) onJoinRoom;
  const JoinableChatRoomList({super.key, required this.onJoinRoom});

  @override
  State<JoinableChatRoomList> createState() => _JoinableChatRoomListState();
}

class _JoinableChatRoomListState extends State<JoinableChatRoomList> {
  final _chatService = locator.get<ChatService>();
  List<ChatRoomDto> allRooms = [];
  List<ChatRoomDto> displayedRooms = [];
  String searchValue = '';

  @override
  void initState() {
    super.initState();
    _updateRooms();
    _chatService.addListener(_updateRooms);
  }

  void _updateRooms() {
    setState(() {
      allRooms = _chatService.availableRooms;
      applyFilter();
    });
  }

  void applyFilter() {
    displayedRooms = allRooms.where((ChatRoomDto chatRoom) {
      final input = searchValue.trim().toLowerCase();
      return chatRoom.name.trim().toLowerCase().contains(input) ||
          chatRoom.creator.trim().toLowerCase().contains(input);
    }).toList();
  }

  Future<void> selectNewRoom(ChatRoomDto room) async {
    await _chatService.joinRoom(room.name);
    widget.onJoinRoom(room);
  }

  @override
  void dispose() {
    _chatService.removeListener(_updateRooms);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 16, right: 8, bottom: 8, left: 8),
          child: DecoratedBox(
            decoration: BoxDecoration(color: cardColor),
            child: TextField(
              decoration: InputDecoration(
                labelText: 'Recherche',
                hintText: 'Nom ou créateur',
                suffixIcon: searchValue.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () {
                          setState(() {
                            searchValue = '';
                            applyFilter();
                          });
                        },
                      )
                    : null,
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  searchValue = value;
                  applyFilter();
                });
              },
            ),
          ),
        ),
        if (displayedRooms.isEmpty && allRooms.isNotEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Aucune salle n\'a ce nom',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        if (displayedRooms.isEmpty && allRooms.isEmpty)
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text('Aucune salle disponible',
                style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(left: 4, right: 4),
            child: ListView.builder(
              itemCount: displayedRooms.length,
              itemBuilder: (context, index) {
                final room = displayedRooms[index];
                return Card(
                    color: Color.lerp(Theme.of(context).colorScheme.primary,
                        Colors.white, 0.63),
                    child: ListTile(
                      title: Text(
                        room.name,
                        style: TextStyle(fontWeight: FontWeight.w500),
                      ),
                      subtitle: Text(
                        room.creator,
                        style: TextStyle(
                            color: Theme.of(context).disabledColor,
                            fontWeight: FontWeight.w500),
                      ),
                      trailing: IconButton.filled(
                        onPressed: () => selectNewRoom(room),
                        icon: Icon(
                          Icons.login,
                          color: Colors.white,
                        ),
                      ),
                    ));
              },
            ),
          ),
        ),
      ],
    );
  }
}
