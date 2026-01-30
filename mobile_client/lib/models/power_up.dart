import 'package:mobile_client/shop/enum/power_up_type.dart';

class PowerUp {
  final PowerUpType name;
  final List<String> content;

  PowerUp({required this.name, required this.content});

  factory PowerUp.fromJson(Map<String, dynamic> json) {
    return PowerUp(
      name: PowerUpType.fromName(json['name']),
      content:
          json['content'] != null ? List<String>.from(json['content']) : [],
    );
  }
}
