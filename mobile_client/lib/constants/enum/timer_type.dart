enum TimerType {
  answerDuration,
  gameStart,
  none,
  questionTransition;

  String toJson() => name;
  static TimerType fromJson(String json) => values.byName(json);
}
