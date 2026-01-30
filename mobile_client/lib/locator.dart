import 'package:get_it/get_it.dart';
import 'package:mobile_client/guards/game_pages_guard.dart';
import 'package:mobile_client/services/audio_player_service.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/services/firebase_messaging_service.dart';
import 'package:mobile_client/services/flutter_painter_service.dart';
import 'package:mobile_client/services/friend_service.dart';
import 'package:mobile_client/services/game/game_manager_service.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game/player_review_snackbar_service.dart';
import 'package:mobile_client/services/game/prize_service.dart';
import 'package:mobile_client/services/game/random_game_service.dart';
import 'package:mobile_client/services/game/review_manager_service.dart';
import 'package:mobile_client/services/game/submit_manager_service.dart';
import 'package:mobile_client/services/game/timer_service.dart';
import 'package:mobile_client/services/game_library_service.dart';
import 'package:mobile_client/services/game_starter_service.dart';
import 'package:mobile_client/services/home_page/home_lobby_service.dart';
import 'package:mobile_client/services/join_game_service.dart';
import 'package:mobile_client/services/lifecycle_service.dart';
import 'package:mobile_client/services/notification_service.dart';
import 'package:mobile_client/services/participant_service.dart';
import 'package:mobile_client/services/power_up_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/s3_service.dart';
import 'package:mobile_client/services/sound_service.dart';
import 'package:mobile_client/services/team_service.dart';
import 'package:mobile_client/services/theme/theme_config_service.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/shop/user_config_service.dart';

final locator = GetIt.instance;

void setupServices() {
  locator.registerLazySingleton<WebSocketService>(() => WebSocketService());
  locator.registerLazySingleton<FirebaseMessagingService>(
      () => FirebaseMessagingService());
  locator.registerLazySingleton<UserAuthService>(() => UserAuthService(
      locator.get<WebSocketService>(),
      locator.get<FirebaseMessagingService>()));
  locator.registerLazySingleton<LifecycleService>(() => LifecycleService(
        locator.get<WebSocketService>(),
        locator.get<UserAuthService>(),
      ));
  locator.registerLazySingleton<ChatService>(() => ChatService(
        locator.get<WebSocketService>(),
        locator.get<UserAuthService>(),
        locator.get<SoundService>(),
      ));

  locator.registerLazySingleton<ShopService>(() => ShopService(
        locator.get<UserAuthService>(),
      ));

  locator.registerLazySingleton<UserConfigService>(() => UserConfigService(
        locator.get<UserAuthService>(),
      ));

  locator.registerLazySingleton<GameLibraryService>(
      () => GameLibraryService(locator.get<UserAuthService>()));

  locator.registerLazySingleton<FriendService>(() => FriendService(
      locator.get<WebSocketService>(), locator.get<NotificationService>()));
  locator.registerLazySingleton<NotificationService>(() => NotificationService(
        locator.get<WebSocketService>(),
        locator.get<SoundService>(),
      ));
  locator.registerLazySingleton<FlutterPainterService>(
      () => FlutterPainterService());

  _setupLobbyInjectionServices();
  _setupGameInjectionServices();
}

void _setupLobbyInjectionServices() {
  locator.registerLazySingleton<RoomService>(() => RoomService(
        locator.get<WebSocketService>(),
      ));

  locator.registerLazySingleton<HomeLobbyService>(() => HomeLobbyService(
        locator.get<WebSocketService>(),
      ));

  locator.registerLazySingleton<JoinGameService>(() => JoinGameService(
        locator.get<RoomService>(),
      ));

  locator.registerLazySingleton<ParticipantService>(() => ParticipantService(
        locator.get<WebSocketService>(),
      ));

  locator.registerLazySingleton<TeamService>(() => TeamService(
        locator.get<WebSocketService>(),
      ));
  locator.registerLazySingleton<RandomGameService>(() => RandomGameService());

  locator.registerLazySingleton<GameStarterService>(() => GameStarterService(
        locator.get<WebSocketService>(),
        locator.get<RoomService>(),
        locator.get<GameLibraryService>(),
        locator.get<RandomGameService>(),
      ));
}

void _setupGameInjectionServices() {
  locator.registerLazySingleton<PowerUpService>(() => PowerUpService(
        locator.get<WebSocketService>(),
        locator.get<GameStateService>(),
      ));

  locator.registerLazySingleton<GamePagesGuard>(() => GamePagesGuard(
        locator.get<WebSocketService>(),
        locator.get<TimerService>(),
        locator.get<GameManagerService>(),
        locator.get<PowerUpService>(),
        locator.get<RoomService>(),
        locator.get<TeamService>(),
      ));

  locator.registerLazySingleton<GameManagerService>(() => GameManagerService(
        locator.get<GameStateService>(),
        locator.get<WebSocketService>(),
        locator.get<SubmitManagerService>(),
        locator.get<ReviewManagerService>(),
        locator.get<PrizeService>(),
      ));

  locator.registerLazySingleton<TimerService>(() => TimerService(
        locator.get<WebSocketService>(),
      ));
  locator.registerLazySingleton<PrizeService>(() => PrizeService(
        locator.get<WebSocketService>(),
      ));

  locator
      .registerLazySingleton<ReviewManagerService>(() => ReviewManagerService(
            locator.get<GameStateService>(),
            locator.get<WebSocketService>(),
          ));

  locator.registerLazySingleton<GameStateService>(() => GameStateService());

  locator.registerLazySingleton<S3Service>(() => S3Service(
        locator.get<UserAuthService>(),
      ));

  locator.registerLazySingleton<ThemeService>(() => ThemeService());

  locator
      .registerLazySingleton<SubmitManagerService>(() => SubmitManagerService(
            locator<FlutterPainterService>(),
            locator<S3Service>(),
            locator<RoomService>(),
          ));
  locator.registerLazySingleton<PlayerReviewSnackbarService>(() =>
      PlayerReviewSnackbarService(
          locator.get<GameStateService>(), locator.get<WebSocketService>()));

  locator.registerLazySingleton<SoundService>(() => SoundService());
  locator.registerLazySingleton<AudioPlayerService>(() => AudioPlayerService());
}
