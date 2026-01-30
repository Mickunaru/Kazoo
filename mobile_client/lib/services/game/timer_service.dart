import 'package:flutter/foundation.dart';
import 'package:mobile_client/constants/enum/timer_type.dart';
import 'package:mobile_client/constants/socket_events/timer_event.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/void_notifier.dart';

class TimerService {
  TimerService(this.webSocketService);

  ValueNotifier<int> time = ValueNotifier<int>(0);
  ValueNotifier<TimerType> timerStarted =
      ValueNotifier<TimerType>(TimerType.none);
  VoidNotifier timerEnded = VoidNotifier();

  ValueNotifier<bool> isTimerActivated = ValueNotifier(false);

  ValueNotifier<bool> isPanicMode = ValueNotifier(false);
  TimerType currentType = TimerType.none;

  final WebSocketService webSocketService;

  void setTimerListeners() {
    removeTimerListeners();
    _setEventListeners();
  }

  void removeTimerListeners() {
    webSocketService.removeAllListeners(TimerEvent.panicTimer.name);
    webSocketService.removeAllListeners(TimerEvent.timerTick.name);
    webSocketService.removeAllListeners(TimerEvent.timerEnded.name);
    webSocketService.removeAllListeners(TimerEvent.timerStarted.name);
    currentType = TimerType.none;
    isPanicMode.value = false;
    time.value = 0;
    removeResetValueNotifiers();
  }

  void removeResetValueNotifiers() {
    timerStarted.dispose();
    time.dispose();
    timerEnded.dispose();
    isTimerActivated.dispose();

    time = ValueNotifier<int>(0);
    timerStarted = ValueNotifier<TimerType>(TimerType.none);
    timerEnded = VoidNotifier();
    isTimerActivated = ValueNotifier(false);
  }

  void pauseCountdown() {
    isTimerActivated.value = false;
    webSocketService.send(TimerEvent.stopTimer.name);
  }

  void enterPanicMode() {
    isTimerActivated.value = true;
    webSocketService.send(TimerEvent.panicTimer.name);
  }

  void resumeCountdown() {
    webSocketService.send(TimerEvent.resumeTimer.name);
  }

  void _setEventListeners() {
    webSocketService.on<dynamic>(TimerEvent.timerStarted.name, (data) {
      currentType = TimerType.fromJson(data);
      isTimerActivated.value = true;
      timerStarted.value = currentType;
    });

    webSocketService.on<void>(TimerEvent.timerEnded.name, (_) {
      isTimerActivated.value = false;
      isPanicMode.value = false;
      timerEnded.notify();
    });

    webSocketService.on<dynamic>(TimerEvent.timerTick.name, (timeValue) {
      isTimerActivated.value = true;
      time.value = timeValue;
    });

    webSocketService.on<void>(TimerEvent.panicTimer.name, (_) {
      // TO DO ADD panic audio
      isPanicMode.value = true;
    });
  }
}
