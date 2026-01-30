import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/chat_room_type.dart';

class ChatRoomDto {
  String? id;
  final String name;
  final ChatRoomType type;
  final List<String> members;
  String creator;
  bool hasSoundboard;
  final ValueNotifier<int?> unreadMessages;

  ChatRoomDto({
    this.id,
    required this.name,
    required this.type,
    required this.members,
    required this.creator,
    required this.hasSoundboard,
    int? initialUnreadMessages,
  }) : unreadMessages = ValueNotifier(initialUnreadMessages);

  factory ChatRoomDto.fromJson(Map<String, dynamic> json) {
    return ChatRoomDto(
      id: json['_id'],
      name: json['name'],
      type: ChatRoomType.fromName(json['type']),
      members: List<String>.from(json['members']),
      creator: json['creator'] ?? "",
      hasSoundboard: json['hasSoundboard'],
      // unreadMessages: json['unreadMessages'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'name': name,
      'type': type.name,
      'members': members,
      'creator': creator,
      'hasSoundboard': hasSoundboard,
      'unreadMessages': unreadMessages
    };
  }
}
