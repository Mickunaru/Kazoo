class ReviewedAnswerScore {
  final double percentageGiven;
  final String name;

  ReviewedAnswerScore({required this.percentageGiven, required this.name});

  Map<String, dynamic> toJson() {
    return {
      'percentageGiven': percentageGiven,
      'name': name,
    };
  }

  factory ReviewedAnswerScore.fromJson(Map<String, dynamic> json) {
    return ReviewedAnswerScore(
      percentageGiven: json['percentageGiven'],
      name: json['name'],
    );
  }
}
