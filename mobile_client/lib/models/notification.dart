import 'package:mobile_client/constants/enum/notification_type.dart';

class Notification {
  final String id;
  final NotificationType type;
  final String senderUsername;
  final String? data;

  Notification({
    required this.id,
    required this.type,
    required this.senderUsername,
    this.data,
  });

  factory Notification.fromJson(Map<String, dynamic> json) {
    return Notification(
      id: json['id'],
      type: NotificationType.values.firstWhere(
          (e) => e.toString() == 'NotificationType.${json['type']}'),
      senderUsername: json['senderUsername'],
      data: json['data'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.toString().split('.').last,
      'senderUsername': senderUsername,
      'data': data,
    };
  }
}
