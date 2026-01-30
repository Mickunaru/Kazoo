import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

class FirebaseMessagingService {
  final _firebaseMessaging = FirebaseMessaging.instance;
  String? fCMToken;

  Future<void> initNotifications() async {
    if (kIsWeb) return;
    await _firebaseMessaging.requestPermission();
    fCMToken = await _firebaseMessaging.getToken();
  }
}
