import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/question_type.dart';
import 'package:mobile_client/models/game/player_answer.dart';
import 'package:mobile_client/models/question.dart';
import 'package:mobile_client/services/flutter_painter_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/s3_service.dart';
import 'package:mobile_client/utils/void_notifier.dart';
import 'package:uuid/uuid.dart';

class SubmitManagerService extends ChangeNotifier {
  final FlutterPainterService _flutterPainterService;
  final S3Service _s3service;
  final RoomService _roomService;
  final Uuid uuid = Uuid();

  SubmitManagerService(
      this._flutterPainterService, this._s3service, this._roomService);

  List<bool> buttonsAreActive = [];
  Set<int> disabledAnswerChoices = {};

  String _textAnswer = '';
  int numericalAnswer = 0;
  VoidNotifier resetInputs = VoidNotifier();

  void buttonWasClicked(int index) {
    buttonsAreActive[index] = !buttonsAreActive[index];
    buttonsAreActive = [...buttonsAreActive];
    notifyListeners();
  }

  void changeTextAnswer(String answer) {
    _textAnswer = answer;
    notifyListeners();
  }

  void changeNumericalAnswer(int answer) {
    numericalAnswer = answer;
    notifyListeners();
  }

  void setInputs(Question question) {
    _textAnswer = '';
    numericalAnswer = 0;

    resetInputs.notify();
    if (question.type == QuestionType.multiChoice) {
      disabledAnswerChoices.clear();
      buttonsAreActive = List.filled(question.choices.length, false);
    }
    notifyListeners();
  }

  bool answerIsChosen(QuestionType questionType) {
    switch (questionType) {
      case QuestionType.multiChoice:
        return buttonsAreActive.contains(true);
      case QuestionType.openEnded:
        return _textAnswer.isNotEmpty;
      case QuestionType.drawing:
      case QuestionType.estimation:
        return true;
    }
  }

  Future<PlayerAnswer> getAnswer(QuestionType questionType) async {
    switch (questionType) {
      case QuestionType.multiChoice:
        return MultiChoicePlayerAnswer(data: buttonsAreActive);
      case QuestionType.openEnded:
        return OpenEndedPlayerAnswer(data: _textAnswer);
      case QuestionType.estimation:
        return EstimationPlayerAnswer(data: numericalAnswer);
      case QuestionType.drawing:
        Uint8List? blob = await _flutterPainterService.getDrawingBlob();
        String awsKey = "drawings/${_roomService.roomId}/${uuid.v4()}.png";
        await _s3service.uploadBlobImage(blob ?? Uint8List(0), awsKey);
        return DrawingPlayerAnswer(data: awsKey);
    }
  }
}
