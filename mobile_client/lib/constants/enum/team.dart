class TeamId {
  final String name;

  TeamId({required this.name});

  Map<String, dynamic> toJson() {
    return {
      'name': name,
    };
  }
}

class Team extends TeamId {
  final String icon;
  final String color;

  Team({
    required super.name,
    required this.icon,
    required this.color,
  });

  factory Team.fromJson(Map<String, dynamic> json) {
    return Team(
      name: json['name'] as String,
      icon: json['icon'] as String,
      color: json['color'] as String,
    );
  }
}
