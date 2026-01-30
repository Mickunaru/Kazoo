class PlayerDrawingReview {
  final String name;
  final String awsKey;
  final double percentageGiven;

  PlayerDrawingReview(
      {required this.name,
      required this.awsKey,
      required this.percentageGiven});

  factory PlayerDrawingReview.fromJson(Map<String, dynamic> json) {
    return PlayerDrawingReview(
      name: json['name'] as String,
      awsKey: json['awsKey'] as String,
      percentageGiven: json['percentageGiven'] as double,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'awsKey': awsKey,
      'percentageGiven': percentageGiven,
    };
  }
}
