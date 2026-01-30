import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/socket_events/friend_event.dart';
import 'package:mobile_client/constants/socket_events/notification_event.dart';
import 'package:mobile_client/models/friend_lists.dart';
import 'package:mobile_client/models/friend_update.dart';
import 'package:mobile_client/models/notification.dart';
import 'package:mobile_client/services/notification_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class FriendService extends ChangeNotifier {
  final WebSocketService _webSocketService;
  final NotificationService _notificationService;

  List<String> friendList = [];
  List<String> notFriendList = [];
  List<String> pendingList = [];

  FriendService(this._webSocketService, this._notificationService);

  void initialize() {
    _webSocketService.on<dynamic>(FriendEvent.updateSingleFriend.name, (data) {
      final update = FriendUpdate.fromJson(data);
      updateFriend(update.username, update.isAdded);
    });
    _webSocketService.on<String>(FriendEvent.requestIgnored.name, (username) {
      requestIgnored(username);
    });
    _webSocketService.on<dynamic>(NotificationEvent.addNotification.name,
        (data) {
      final notification = Notification.fromJson(data);
      notFriendList.remove(notification.senderUsername);
    });
    _webSocketService.on<String>(FriendEvent.addNotFriend.name, (username) {
      notFriendList.add(username);
      notifyListeners();
    });
    getFriendsEvent();
  }

  void removeListeners() {
    _webSocketService.removeAllListeners(FriendEvent.updateSingleFriend.name);
    _webSocketService.removeAllListeners(FriendEvent.requestIgnored.name);
  }

  Future<void> getFriendsEvent() async {
    final data = await _webSocketService
        .sendWithAck<void, dynamic>(FriendEvent.getFriends.name);

    friendList.clear();
    notFriendList.clear();
    pendingList.clear();

    final lists = FriendLists.fromJson(data);
    friendList = lists.friends;
    notFriendList = lists.notFriends;
    pendingList = lists.pending;

    notifyListeners();
  }

  void removeFriend(String username) {
    _webSocketService.send(FriendEvent.removeFriend.name, username);
  }

  void sendFriendRequest(String username) {
    _webSocketService.send(NotificationEvent.sendFriendRequest.name, username);
    pendingList.add(username);
    notFriendList.remove(username);
    notifyListeners();
  }

  void updateFriend(String username, bool isAdded) {
    if (isAdded) {
      friendList.add(username);
      pendingList.remove(username);
    } else {
      notFriendList.add(username);
      friendList.remove(username);
    }
    notifyListeners();
  }

  void requestIgnored(String username) {
    pendingList.remove(username);
    notFriendList.add(username);
    notifyListeners();
  }

  String? validateEntry(value) {
    if (value == null || value.isEmpty) {
      return "Veuillez entrer le nom d'un utilisateur";
    }

    value = value.toString().trim();
    if (notFriendList.contains(value)) {
      return null;
    }
    if (friendList.contains(value)) {
      return "Vous êtes déjà des amis";
    }
    if (pendingList.contains(value)) {
      final notificationExists = _notificationService.notificationList.any(
        (notif) => notif.senderUsername == value,
      );
      if (notificationExists) {
        return "Vous avez une demande de cet utilisateur";
      }
      return "Vous avez déjà envoyé une demande à cet utilisateur";
    }
    return "Entrez un nom d'utilisateur valide";
  }
}
