import 'package:mobile_client/constants/enum/game_visibility.dart';

class GameVisibilityDto {
  final GameVisibility visibility;

  GameVisibilityDto({required this.visibility});

  factory GameVisibilityDto.fromJson(Map<String, dynamic> json) {
    return GameVisibilityDto(
      visibility: _parseGameVisibility(json['visibility']),
    );
  }

  static GameVisibility _parseGameVisibility(dynamic value) {
    return GameVisibility.values.firstWhere((e) => e.name == value);
  }
}
