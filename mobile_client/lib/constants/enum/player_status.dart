import 'package:collection/collection.dart';

enum PlayerStatus {
  left,
  pending,
  submitted;

  static PlayerStatus? fromName(String name) {
    return PlayerStatus.values.firstWhereOrNull(
      (type) => type.name == name,
    );
  }
}
