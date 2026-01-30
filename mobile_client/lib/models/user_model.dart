import 'package:mobile_client/models/power_ups_count.dart';

class UserModel {
  final String email;
  final String username;
  String avatar;
  final List<String> friendsIds;
  final String uid;
  int currency = 0;
  final List<String> vanityItems;
  PowerUpsCount powerUpsCount;
  String fcmToken;
  UserModel(
      {required this.email,
      required this.username,
      required this.avatar,
      required this.friendsIds,
      required this.uid,
      required this.currency,
      required this.vanityItems,
      required this.powerUpsCount,
      this.fcmToken = ''});

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
      uid: json['uid'],
      username: json['username'],
      email: json['email'],
      avatar: json['avatar'],
      friendsIds: List<String>.from(json['friendsIds'] ?? []),
      currency: json['currency'],
      vanityItems: List<String>.from(json['vanityItems']),
      powerUpsCount: PowerUpsCount.fromJson(json['powerUpsCount']),
      fcmToken: json['fcmToken']);

  Map<String, dynamic> toJson() => {
        'email': email,
        'username': username,
        'avatar': avatar,
        'friendsIds': friendsIds,
        'uid': uid,
        'powerUpsCount': powerUpsCount.toJson()
      };
}

class UserCurrency {
  final int currency;

  UserCurrency({required this.currency});

  factory UserCurrency.fromJson(Map<String, dynamic> json) =>
      UserCurrency(currency: json['currency']);
}
