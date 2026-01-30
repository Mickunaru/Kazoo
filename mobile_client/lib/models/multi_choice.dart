class MultiChoice {
  final String text;
  final bool isCorrect;

  MultiChoice({required this.text, required this.isCorrect});

  factory MultiChoice.fromJson(Map<String, dynamic> json) {
    return MultiChoice(
      text: json['text'],
      isCorrect: json['isCorrect'],
    );
  }

  MultiChoice copyWith({
    String? text,
    bool? isCorrect,
  }) {
    return MultiChoice(
      text: text ?? this.text,
      isCorrect: isCorrect ?? this.isCorrect,
    );
  }
}
