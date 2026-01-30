// Timer widget
import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/timer_type.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/game_manager_service.dart';
import 'package:mobile_client/services/game/timer_service.dart';

class StandardGameTimer extends StatefulWidget {
  const StandardGameTimer({super.key});

  @override
  StandardGameTimerState createState() => StandardGameTimerState();
}

class StandardGameTimerState extends State<StandardGameTimer> {
  final TimerService timerService = locator.get<TimerService>();
  final GameManagerService gameManagerService =
      locator.get<GameManagerService>();

  int fixedTime = 0;
  @override
  void initState() {
    super.initState();
    timerService.timerEnded.addListener(_onStartTimer);
  }

  @override
  void dispose() {
    timerService.timerEnded.removeListener(_onStartTimer);
    super.dispose();
  }

  void _onStartTimer() {
    if (timerService.currentType == TimerType.answerDuration) {
      gameManagerService.submitAnswer();
    }
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
        valueListenable: timerService.time,
        builder: (_, time, __) {
          fixedTime = time;
          return TimerText(
              secondsRemaining: time, timerType: timerService.currentType);
        });
  }
}

class TimerText extends StatelessWidget {
  const TimerText(
      {super.key, required this.secondsRemaining, required this.timerType});

  final int secondsRemaining;
  final TimerType timerType;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: 100,
        child: Center(
          child: Text('$secondsRemaining',
              style: TextStyle(
                fontSize: 40,
                fontWeight: FontWeight.bold,
                color: timerType == TimerType.questionTransition
                    ? Theme.of(context).colorScheme.secondary
                    : Colors.white,
              )),
        ));
  }
}
