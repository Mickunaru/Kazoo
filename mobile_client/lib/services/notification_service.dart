import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/account_notification.dart';
import 'package:mobile_client/constants/socket_events/friend_event.dart';
import 'package:mobile_client/constants/socket_events/notification_event.dart';
import 'package:mobile_client/models/friend_request.dart';
import 'package:mobile_client/models/notification.dart';
import 'package:mobile_client/services/sound_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class NotificationService extends ChangeNotifier {
  final WebSocketService _webSocketService;
  final SoundService _soundService;

  List<Notification> notificationList = [];

  NotificationService(this._webSocketService, this._soundService);

  void initialize() {
    _webSocketService.on<dynamic>(NotificationEvent.addNotification.name,
        (data) {
      final notification = Notification.fromJson(data);
      addNotification(notification);
    });
    getNotificationsEvent();
  }

  Future<void> getNotificationsEvent() async {
    final data = await _webSocketService.sendWithAck<void, List<dynamic>>(
        NotificationEvent.getNotification.name);
    notificationList = data
        .map((notification) => Notification.fromJson(notification))
        .toList();
    notifyListeners();
  }

  void respondToFriendRequest(
      Notification notification, bool isAccepted) async {
    final answer = FriendRequestResponse(
      senderName: notification.senderUsername,
      isAccepted: isAccepted,
      notificationId: notification.id,
    );
    _webSocketService.send<FriendRequestResponse>(
        FriendEvent.friendRequestResponse.name, answer);
    removeNotification(notification.id);
  }

  void removeNotification(String notificationId) {
    notificationList
        .removeWhere((notification) => notification.id == notificationId);
    notifyListeners();
  }

  void addNotification(Notification notification) {
    notificationList.add(notification);
    _soundService.playSound(friendNotificationSound);
    notifyListeners();
  }
}
