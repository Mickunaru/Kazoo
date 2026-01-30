class PlayerDrawingAnswer {
  final String name;
  final String awsKey;

  PlayerDrawingAnswer({required this.name, required this.awsKey});

  factory PlayerDrawingAnswer.fromJson(Map<String, dynamic> json) {
    return PlayerDrawingAnswer(
      name: json['name'] as String,
      awsKey: json['awsKey'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'awsKey': awsKey,
    };
  }
}
