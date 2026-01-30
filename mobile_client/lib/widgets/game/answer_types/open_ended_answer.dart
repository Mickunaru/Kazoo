import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_client/constants/game_constants.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';

class OpenEndedAnswer extends StatefulWidget {
  const OpenEndedAnswer({super.key, required this.canAnswer});
  final bool canAnswer;
  @override
  State<OpenEndedAnswer> createState() => _OpenEndedAnswerState();
}

class _OpenEndedAnswerState extends State<OpenEndedAnswer> {
  final GameStateService gameStateService = locator.get<GameStateService>();
  final SubmitManagerService submitManagerService =
      locator.get<SubmitManagerService>();

  int textLength = 0;
  final TextEditingController controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    controller.addListener(_updateTextLength);
    submitManagerService.resetInputs.addListener(_resetText);
  }

  @override
  void dispose() {
    controller.removeListener(_updateTextLength);
    submitManagerService.resetInputs.removeListener(_resetText);
    controller.dispose();
    super.dispose();
  }

  void _resetText() {
    setState(() {
      controller.text = '';
    });
  }

  void _updateTextLength() {
    setState(() {
      textLength = controller.text.length;
    });

    submitManagerService.changeTextAnswer(controller.text);
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      enabled: widget.canAnswer,
      maxLength: maxTextAnswerLength,
      maxLengthEnforcement: MaxLengthEnforcement.enforced,
      decoration: InputDecoration(
        labelText: 'Entrez votre réponse',
        helperText: '${controller.text.length}/$maxTextAnswerLength',
        border: const OutlineInputBorder(),
        counterText: '',
      ),
      style: TextStyle(
        color: widget.canAnswer ? null : Theme.of(context).disabledColor,
      ),
      minLines: 3,
      maxLines: 5,
      textInputAction: TextInputAction.done,
    );
  }
}
