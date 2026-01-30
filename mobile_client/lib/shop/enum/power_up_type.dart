enum PowerUpType {
  confusion,
  vitesse,
  tricheur,
  surge,
  tornade;

  static PowerUpType fromName(String name) {
    return PowerUpType.values.firstWhere(
      (type) => type.name == name,
      orElse: () => throw ArgumentError('Invalid PowerUpType: $name'),
    );
  }
}
