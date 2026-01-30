import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/models/multi_choice.dart';
import 'package:mobile_client/models/player_info.dart';
import 'package:mobile_client/models/question.dart';

class GameStateService {
  ValueNotifier<bool> isSubmitted = ValueNotifier<bool>(false);
  ValueNotifier<int> playerScore = ValueNotifier<int>(0);
  ValueNotifier<Question?> currentQuestion = ValueNotifier<Question?>(null);
  int currentQuestionIndex = 0;
  int questionsLength = 0;
  List<PlayerInfo> playerInfos = [];
  List<String> playersAwsKeys = [];
  ValueNotifier<bool> isEliminated = ValueNotifier<bool>(false);

  List<MultiChoice> get questionChoices =>
      currentQuestion.value?.choices.map((choice) => choice).toList() ?? [];

  List<int> get questionIndexes => currentQuestion.value?.choices != null
      ? List.generate(currentQuestion.value!.choices.length, (i) => i)
      : [];

  QuestionType get questionType => currentQuestion.value!.type;

  void submit() {
    isSubmitted.value = true;
  }

  void resetGameState() {
    isEliminated.value = false;
    isSubmitted.value = false;
    playerScore.value = 0;
    currentQuestionIndex = 0;
    questionsLength = 0;
  }

  void changeQuestion(Question question) {
    isSubmitted.value = false;
    currentQuestion.value = question;
    currentQuestionIndex++;
  }
}
