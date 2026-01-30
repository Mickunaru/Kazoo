import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';

class EstimationAnswerWidget extends StatefulWidget {
  const EstimationAnswerWidget({super.key, required this.canAnswer});
  final bool canAnswer;
  @override
  State<EstimationAnswerWidget> createState() => _EstimationAnswerWidgetState();
}

class _EstimationAnswerWidgetState extends State<EstimationAnswerWidget> {
  final GameStateService gameStateService = locator.get<GameStateService>();
  final SubmitManagerService submitManagerService =
      locator.get<SubmitManagerService>();

  final TextEditingController controller = TextEditingController();
  double sliderValue = 0;

  @override
  void initState() {
    super.initState();
    controller.addListener(_onInput);
    submitManagerService.resetInputs.addListener(resetInput);
  }

  @override
  void dispose() {
    controller.removeListener(_onInput);
    submitManagerService.resetInputs.removeListener(resetInput);
    controller.dispose();
    super.dispose();
  }

  void resetInput() {
    final (lowerBound, upperBound) = getBounds();
    setState(() {
      sliderValue = ((upperBound + lowerBound) / 2).roundToDouble();
      controller.text = '${sliderValue.toInt()}';
      submitManagerService.numericalAnswer = sliderValue.round().toInt();
    });
  }

  (double, double) getBounds() {
    final lowerBound =
        gameStateService.currentQuestion.value?.lowerBound.toDouble() ?? 0.0;
    final upperBound =
        gameStateService.currentQuestion.value?.upperBound.toDouble() ?? 0.0;
    return (lowerBound, upperBound);
  }

  void _onInput() {
    double? numeric = double.tryParse(controller.text);
    if (numeric == null) return;

    final (lowerBound, upperBound) = getBounds();

    if (numeric < lowerBound || numeric > upperBound) return;
    submitManagerService.changeNumericalAnswer(numeric.toInt());

    if (numeric.roundToDouble() == sliderValue.roundToDouble()) return;
    setState(() {
      sliderValue = numeric.roundToDouble();
    });
  }

  @override
  Widget build(BuildContext context) {
    final (lowerBound, upperBound) = getBounds();
    final divisions = (upperBound - lowerBound).toInt();
    debugPrint(controller.text);
    return Container(
      color: Colors.white,
      width: 500,
      child: Column(
        spacing: 5,
        children: [
          SizedBox(
            width: 200,
            child: TextField(
              controller: controller,
              decoration: InputDecoration(labelText: "Réponse"),
              keyboardType: TextInputType.number,
              enabled: widget.canAnswer,
              style: TextStyle(
                  color: widget.canAnswer
                      ? null
                      : Theme.of(context).disabledColor),
              inputFormatters: <TextInputFormatter>[
                FilteringTextInputFormatter.digitsOnly
              ],
            ),
          ),
          Text(
              'Précision acceptée: ± ${gameStateService.currentQuestion.value?.precision}',
              style:
                  TextStyle(fontSize: FontSize.s, fontWeight: FontWeight.bold)),
          Row(
            children: [
              Text('${lowerBound.toInt()}',
                  style: TextStyle(
                    fontSize: FontSize.m,
                    fontWeight: FontWeight.bold,
                  )),
              Expanded(
                child: ListenableBuilder(
                    listenable: controller,
                    builder: (_, context) {
                      return Slider(
                          min: lowerBound,
                          max: upperBound,
                          divisions: divisions,
                          value: sliderValue
                              .clamp(lowerBound, upperBound)
                              .roundToDouble(),
                          onChanged: widget.canAnswer
                              ? (value) {
                                  setState(() {
                                    sliderValue = value;
                                    if (controller.text == '$value') return;
                                    controller.text = '${value.toInt()}';
                                  });
                                }
                              : null);
                    }),
              ),
              Text('${upperBound.toInt()}',
                  style: TextStyle(
                    fontSize: FontSize.m,
                    fontWeight: FontWeight.bold,
                  )),
            ],
          )
        ],
      ),
    );
  }
}
