import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/socket_events/game_event.dart';
import 'package:mobile_client/models/game/player_answer_for_review.dart';
import 'package:mobile_client/models/game/player_drawing_answer.dart';
import 'package:mobile_client/models/game/question_answer.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/game/player_review_pop_up.dart';
import 'package:mobile_client/widgets/game/players_drawings_pop_up.dart';
import 'package:mobile_client/widgets/game/validity_pop_up/validity_pop_up.dart';

class ReviewManagerService {
  final GameStateService _gameStateService;
  final WebSocketService _webSocketService;
  BuildContext? _validityPopUp;

  ReviewManagerService(
    this._gameStateService,
    this._webSocketService,
  );

  void setupManager() {
    _setupQuestionAnswersEvent();
    _setupPlayerAnswerReviewEvent();
    _setupDialogCloseNextQuestion();
    _setupDialogCloseResultsView();
    _setupDrawingsEvent();
  }

  void resetReviewManager() {
    _webSocketService.removeAllListeners(GameEvent.sendAnswers.name);
    _webSocketService.removeAllListeners(GameEvent.sendReviews.name);
    _webSocketService.removeAllListeners(GameEvent.nextQuestion.name);
    _webSocketService.removeAllListeners(GameEvent.gameFinished.name);
    _webSocketService.removeAllListeners(GameEvent.getDrawings.name);
  }

  void _setupQuestionAnswersEvent() {
    _webSocketService.on<Map<String, dynamic>?>(GameEvent.sendAnswers.name,
        (json) {
      if (json == null) return;
      final questionAnswer = QuestionAnswer.fromJson(json);

      _gameStateService.playerScore.value = questionAnswer.score;
      _showAnswerPlayer(questionAnswer);
    });
  }

  void _setupDrawingsEvent() {
    _webSocketService.on<List<dynamic>?>(GameEvent.getDrawings.name, (json) {
      if (json == null) return;
      final playersDrawings = json
          .map((playerDrawing) => PlayerDrawingAnswer.fromJson(playerDrawing))
          .toList();
      _showDrawings(playersDrawings);
    });
  }

  void _setupPlayerAnswerReviewEvent() {
    _webSocketService.on<List<dynamic>>(GameEvent.sendReviews.name, (json) {
      final playerAnswers = json
          .map((playerAnswer) => PlayerAnswerForReview.fromJson(playerAnswer))
          .toList();
      _showReviewAnswersPopUp(playerAnswers);
    });
  }

  void _setupDialogCloseNextQuestion() {
    _webSocketService.on(GameEvent.nextQuestion.name, (_) {
      _clearPopUp();
    });
  }

  void _setupDialogCloseResultsView() {
    _webSocketService.once(GameEvent.gameFinished.name, (_) {
      _clearPopUp();
      AppNavigator.go('/${PageUrl.results.name}');
    });
  }

  void _showAnswerPlayer(QuestionAnswer questionAnswer) {
    if (AppNavigator.navigatorKey.currentContext == null) return;
    showDialog(
        context: AppNavigator.navigatorKey.currentContext!,
        barrierDismissible: false,
        builder: (context) {
          _validityPopUp = context;
          return ValidityPopUp(
              questionAnswer: questionAnswer,
              isEliminated: _gameStateService.isEliminated.value);
        });
  }

  void _clearPopUp() {
    if (_validityPopUp == null) return;
    AppNavigator.pop(AppNavigator.navigatorKey.currentContext!);
    _validityPopUp = null;
  }

  void _showDrawings(List<PlayerDrawingAnswer> playersDrawings) {
    if (AppNavigator.navigatorKey.currentContext == null) return;
    showDialog(
        context: AppNavigator.navigatorKey.currentContext!,
        barrierDismissible: false,
        builder: (context) {
          _validityPopUp = context;
          return PlayersDrawingsPopUp(playersDrawings: playersDrawings);
        });
  }

  void _showReviewAnswersPopUp(List<PlayerAnswerForReview> playerAnswers) {
    if (AppNavigator.navigatorKey.currentContext == null) return;
    showDialog(
        context: AppNavigator.navigatorKey.currentContext!,
        barrierDismissible: false,
        builder: (context) {
          _validityPopUp = context;
          return PlayerReviewPopUp(answers: playerAnswers);
        });
  }
}
