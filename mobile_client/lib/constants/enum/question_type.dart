enum QuestionType {
  multiChoice,
  openEnded,
  estimation,
  drawing;

  static Map<String, QuestionType> stringToQuestionType = {
    'QCM': QuestionType.multiChoice,
    'QRL': QuestionType.openEnded,
    'QRE': QuestionType.estimation,
    'QD': QuestionType.drawing,
  };

  static Map<QuestionType, String> questionTypeToString = {
    QuestionType.multiChoice: 'QCM',
    QuestionType.openEnded: 'QRL',
    QuestionType.estimation: 'QRE',
    QuestionType.drawing: 'QD',
  };

  String toJson() => questionTypeToString[this]!;

  static QuestionType fromString(String json) =>
      QuestionType.stringToQuestionType[json]!;

  static QuestionType fromJson(String json) => values.byName(json);
}
