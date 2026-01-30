class PowerUpsCount {
  final int tricheur;
  final int vitesse;
  final int confusion;
  final int surge;
  final int tornade;

  PowerUpsCount({
    required this.tricheur,
    required this.vitesse,
    required this.confusion,
    required this.surge,
    required this.tornade,
  });

  factory PowerUpsCount.fromJson(Map<String, dynamic> json) => PowerUpsCount(
        tricheur: (json['tricheur'] ?? 0) as int,
        vitesse: (json['vitesse'] ?? 0) as int,
        confusion: (json['confusion'] ?? 0) as int,
        surge: (json['surge'] ?? 0) as int,
        tornade: (json['tornade'] ?? 0) as int,
      );

  Map<String, dynamic> toJson() {
    return {
      'tricheur': tricheur,
      'vitesse': vitesse,
      'confusion': confusion,
      'surge': surge,
      'tornade': tornade,
    };
  }

  PowerUpsCount copyWith({
    int? tricheur,
    int? vitesse,
    int? confusion,
    int? surge,
    int? tornade,
  }) {
    return PowerUpsCount(
      tricheur: tricheur ?? this.tricheur,
      vitesse: vitesse ?? this.vitesse,
      confusion: confusion ?? this.confusion,
      surge: surge ?? this.surge,
      tornade: tornade ?? this.tornade,
    );
  }
}
