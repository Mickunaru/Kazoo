import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/flutter_painter_service.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';
import 'package:mobile_client/widgets/drawing/drawing_board.dart';

class DrawingAnswerWidget extends StatefulWidget {
  const DrawingAnswerWidget({super.key});

  @override
  State<DrawingAnswerWidget> createState() => _DrawingAnswerWidgetState();
}

class _DrawingAnswerWidgetState extends State<DrawingAnswerWidget> {
  final gameStateService = locator.get<GameStateService>();
  final submitManagerService = locator.get<SubmitManagerService>();
  final flutterPainterService = locator.get<FlutterPainterService>();

  @override
  void initState() {
    super.initState();
    submitManagerService.resetInputs
        .addListener(flutterPainterService.resetControllerSettings);
  }

  @override
  void dispose() {
    submitManagerService.resetInputs
        .removeListener(flutterPainterService.resetControllerSettings);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
        valueListenable: gameStateService.isSubmitted,
        builder: (context, isSubmitted, _) => Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                DrawingBoard(
                  isReadOnly: isSubmitted,
                ),
                SizedBox(
                  width: 70,
                )
              ],
            ));
  }
}
