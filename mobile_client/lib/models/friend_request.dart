class FriendRequestResponse {
  final String senderName;
  final bool isAccepted;
  final String notificationId;

  FriendRequestResponse({
    required this.senderName,
    required this.isAccepted,
    required this.notificationId,
  });

  factory FriendRequestResponse.fromJson(Map<String, dynamic> json) {
    return FriendRequestResponse(
        senderName: json['senderName'],
        isAccepted: json['isAccepted'],
        notificationId: json['notificationId']);
  }

  Map<String, dynamic> toJson() {
    return {
      'senderName': senderName,
      'isAccepted': isAccepted,
      'notificationId': notificationId,
    };
  }
}
