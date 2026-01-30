import 'package:mobile_client/constants/enum/player_status.dart';

class PlayerInfo {
  final String username;
  final int score;
  final int bonusCount;
  final int? rank;
  final PlayerStatus? status;

  PlayerInfo(
      {required this.username,
      required this.score,
      required this.bonusCount,
      this.rank,
      this.status});

  factory PlayerInfo.fromJson(Map<String, dynamic> json) {
    return PlayerInfo(
        username: json['username'] as String,
        score: json['score'] as int,
        bonusCount: json['bonusCount'] as int,
        rank: json['rank'] as int?,
        status: PlayerStatus.fromName(json['status']));
  }
}
