import 'package:collection/collection.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/enum/chat_room_type.dart';
import 'package:mobile_client/constants/enum/message_type.dart';
import 'package:mobile_client/constants/socket_events/chat_event.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/models/message.dart';
import 'package:mobile_client/models/sound_board_element.dart';
import 'package:mobile_client/models/soundboard_request.dart';
import 'package:mobile_client/services/sound_service.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/widgets/chat/chat.const.dart';

class ChatService extends ChangeNotifier {
  final WebSocketService _webSocketService;
  final UserAuthService _userAuthService;
  final SoundService _soundService;

  ChatService(
      this._webSocketService, this._userAuthService, this._soundService);

  final ValueNotifier<ChatRoomDto?> currentRoomNotifier = ValueNotifier(null);

  List<ChatRoomDto> joinedRooms = [];
  List<ChatRoomDto> availableRooms = [];
  List<Message> messages = [];
  bool isLoading = true;
  String? chatterName;
  ChatRoomType? currentChatRoomType;

  Future<void> initialize() async {
    setupWsListeners();
    chatterName = _userAuthService.curUser?.username;
    await refreshRooms();
    notifyListeners();
  }

  void setCurrentRoom(ChatRoomDto? room) {
    if (currentRoomNotifier.value?.name != room?.name) {
      currentRoomNotifier.value = room;
    }
  }

  void changeRoom(ChatRoomDto? room) {
    setCurrentRoom(room);
    loadChatHistory();
    currentChatRoomType = joinedRooms
        .firstWhereIndexedOrNull(
            (index, element) => currentRoomNotifier.value?.name == element.name)
        ?.type;
    if (room != null) {
      room.unreadMessages.value = 0;
      _webSocketService.send(ChatEvent.seeUnreadMessages.name, room.name);
    }
    notifyListeners();
  }

  Future<void> joinRoom(String name) async {
    final data =
        await _webSocketService.sendWithAck(ChatEvent.joinRoom.name, name);
    final room = ChatRoomDto.fromJson(data);
    availableRooms.removeWhere((room) => room.name == name);
    joinedRooms.add(room);
    changeRoom(room);
    notifyListeners();
  }

  Future<void> leaveRoom(String name) async {
    await _webSocketService.sendWithAck(ChatEvent.leaveRoom.name, name);
    joinedRooms.removeWhere((room) => room.name == name);
    updateOtherRooms();
    notifyListeners();
  }

  void deleteRoom(String name) {
    _webSocketService.send(ChatEvent.deleteRoom.name, name);
  }

  void sendMessage(String text, MessageType type, double? duration) {
    if (type == MessageType.sound && duration == null) {
      throw Exception('Duration is required for audio messages');
    }
    _webSocketService.send(
        ChatEvent.sendMessage.name,
        Message(
                room: currentRoomNotifier.value!.name,
                text: text,
                author: chatterName ?? "",
                type: type,
                date: DateTime.now(),
                duration: duration,
                avatar: _userAuthService.curUser?.avatar ?? '')
            .toJson());
  }

  void sendSoundboardMessage(SoundboardElement sound) {
    final room = currentRoomNotifier.value;
    if (room == null) {
      throw Exception('No room selected');
    }

    final request = SoundboardRequest(sound: sound.url, room: room.name);
    _webSocketService.send(ChatEvent.sendSound.name, request.toJson());
  }

  Future<void> loadChatHistory() async {
    messages = [];
    isLoading = true;
    notifyListeners();
    final data = await _webSocketService.sendWithAck<String, List<dynamic>>(
        ChatEvent.sendChatHistory.name, currentRoomNotifier.value?.name);
    messages = data.map((message) => Message.fromJson(message)).toList();
    isLoading = false;
    notifyListeners();
  }

  Future<ChatRoomDto> createRoom(String name) async {
    final data = await _webSocketService.sendWithAck<String, dynamic>(
        ChatEvent.createChatRoom.name, name);
    final room = ChatRoomDto.fromJson(data);
    joinedRooms.add(room);
    changeRoom(room);
    notifyListeners();
    return room;
  }

  Future<void> updateOtherRooms() async {
    final data = await _webSocketService
        .sendWithAck<void, List<dynamic>>(ChatEvent.getOtherRooms.name);
    final rooms = data.map((room) => ChatRoomDto.fromJson(room)).toList();
    availableRooms = _sortChatRooms(rooms);
    notifyListeners();
  }

  Future<void> updateJoinedRooms() async {
    final data = await _webSocketService
        .sendWithAck<void, List<dynamic>>(ChatEvent.getJoinedRooms.name);
    final rooms = data.map((room) => ChatRoomDto.fromJson(room)).toList();
    joinedRooms = _sortChatRooms(rooms);
    notifyListeners();
  }

  Future<void> refreshRooms() async {
    await Future.wait([updateJoinedRooms(), updateOtherRooms()]);
  }

  void setupWsListeners() {
    _webSocketService.on<dynamic>(ChatEvent.sendMessage.name, (data) {
      if (data == null) return;
      final message = Message.fromJson(data);
      if (message.author != chatterName) {
        _soundService.playSound(chatNotificationSound);
      }
      if (message.room != currentRoomNotifier.value?.name) {
        for (final room in joinedRooms) {
          if (room.name == message.room) {
            room.unreadMessages.value = (room.unreadMessages.value ?? 0) + 1;
            break;
          }
        }
        return;
      }
      messages.add(message);
      _webSocketService.send(ChatEvent.seeUnreadMessages.name, message.room);
      notifyListeners();
    });

    _webSocketService.on<dynamic>(ChatEvent.sendSound.name, (sound) {
      if (sound == null) return;
      _soundService.playSound(sound);
      notifyListeners();
    });

    _webSocketService.on<String>(ChatEvent.deleteRoom.name, (roomName) {
      joinedRooms.removeWhere((room) => room.name == roomName);
      availableRooms.removeWhere((room) => room.name == roomName);
      if (currentRoomNotifier.value?.name == roomName) {
        changeRoom(null);
      }
      notifyListeners();
    });

    _webSocketService.on<dynamic>(ChatEvent.createChatRoom.name, (data) {
      final room = ChatRoomDto.fromJson(data);
      availableRooms.add(room);
      notifyListeners();
    });

    _webSocketService.on<String>(ChatEvent.creatorUpgrade.name, (roomName) {
      final roomToChange =
          joinedRooms.firstWhereOrNull((room) => room.name == roomName);
      if (roomToChange == null) return;
      roomToChange.creator = chatterName ?? "";
      notifyListeners();
    });

    _webSocketService.on<dynamic>(ChatEvent.joinRoom.name, (data) {
      if (data == null) return;
      final room = ChatRoomDto.fromJson(data);
      joinedRooms.add(room);
      joinedRooms = _sortChatRooms(joinedRooms);
    });
  }

  List<ChatRoomDto> _sortChatRooms(List<ChatRoomDto> chatRooms) {
    const typeOrder = {
      ChatRoomType.general: 1,
      ChatRoomType.gameRoom: 2,
      ChatRoomType.teamRoom: 3,
      ChatRoomType.custom: 4,
    };

    chatRooms.sort((a, b) {
      final typeComparison =
          (typeOrder[a.type] ?? 0) - (typeOrder[b.type] ?? 0);
      if (typeComparison != 0) return typeComparison;

      return a.name.compareTo(b.name);
    });

    return chatRooms;
  }
}
