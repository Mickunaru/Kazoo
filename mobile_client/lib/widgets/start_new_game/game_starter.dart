import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/enum/game_start_error_types.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/error_messages.dart';
import 'package:mobile_client/constants/errors/game_starter_error.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/game.dart';
import 'package:mobile_client/models/game_config_dto.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/game_starter_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';
import 'package:mobile_client/widgets/snackbar.dart';
import 'package:tap_debouncer/tap_debouncer.dart';

class GameStarter extends StatefulWidget {
  final Game? selectedGame;

  const GameStarter({super.key, required this.selectedGame});

  @override
  State<GameStarter> createState() => _GameStarterState();
}

class _GameStarterState extends State<GameStarter> {
  late double entryPrice;
  late double questionCount;
  late bool isFriendsOnly;
  late bool arePowerUpsEnabled;
  late bool hasSoundboard;
  late GameMode gameMode;
  final GameStateService _gameStateService = locator.get<GameStateService>();

  @override
  void initState() {
    super.initState();

    entryPrice = 0;
    questionCount = 5;
    isFriendsOnly = false;
    arePowerUpsEnabled = true;
    hasSoundboard = true;
    gameMode = GameMode.classic;
  }

  Future<void> _startGame() async {
    final GameConfigDto gameConfigDto;
    final chosenGameMode =
        widget.selectedGame == null ? GameMode.elimination : gameMode;

    switch (chosenGameMode) {
      case GameMode.elimination:
        gameConfigDto = RandomGameConfig(
          isFriendsOnly: isFriendsOnly,
          arePowerUpsEnabled: arePowerUpsEnabled,
          hasSoundboard: hasSoundboard,
          entryPrice: entryPrice.toInt(),
          gameMode: chosenGameMode,
          questionCount: questionCount.toInt(),
        );
      case GameMode.classic:
      case GameMode.team:
        gameConfigDto = BaseGameConfig(
          gameId: widget.selectedGame!.id,
          isFriendsOnly: isFriendsOnly,
          arePowerUpsEnabled: arePowerUpsEnabled,
          hasSoundboard: hasSoundboard,
          entryPrice: entryPrice.toInt(),
          gameMode: chosenGameMode,
        );
    }

    _gameStateService.questionsLength =
        widget.selectedGame?.questions.length ?? 0;

    try {
      await locator.get<GameStarterService>().startGame(gameConfigDto);
      if (mounted) {
        AppNavigator.go('/${PageUrl.waitingRoom.name}');
      }
    } catch (error) {
      _handleError(error);
    }
  }

  void _handleError(error) {
    String message = "An error occurred $error";
    if (error is GameStartError) {
      switch (error.type) {
        case GameStartErrorTypes.hidden:
          message = GameStarterErrorMessage.hidden;
          break;
        case GameStartErrorTypes.deleted:
          message = GameStarterErrorMessage.deleted;
          break;
        case GameStartErrorTypes.notEnoughQuestions:
          message = GameStarterErrorMessage.notEnoughQuestions;
          break;
        case GameStartErrorTypes.notEnoughMoney:
          message = GameStarterErrorMessage.notEnoughMoney;
          break;
        case GameStartErrorTypes.impossible:
          message = GameStarterErrorMessage.impossible;
          break;
      }
    }

    showCustomSnackBar(context: context, message: message);
  }

  static final List<DropdownMenuItem<GameMode>> entries =
      UnmodifiableListView<DropdownMenuItem<GameMode>>(
    GameMode.values.where((mode) => mode != GameMode.elimination).map((mode) =>
        DropdownMenuItem(
            value: mode, child: Text(GameMode.modeDisplayName(mode)))),
  );

  @override
  Widget build(BuildContext context) {
    return Card(
        color: cardMenuBackground,
        margin: EdgeInsets.only(top: 20, right: 50, left: 50),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(
            color: Colors.black,
            width: 1,
          ),
        ),
        elevation: 3,
        child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Column(
              children: [
                Text(
                  widget.selectedGame?.title ?? 'Élimination Rapide',
                  style: TextStyle(fontSize: FontSize.l),
                ),
                const SizedBox(height: 10),
                if (widget.selectedGame != null)
                  Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                            height: 140,
                            child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                      child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                        Text('Description',
                                            style: TextStyle(
                                                fontSize: FontSize.m,
                                                color: Colors.black,
                                                fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 10),
                                        ScrollBox(
                                            height: 100,
                                            child: Text(widget
                                                .selectedGame!.description))
                                      ])),
                                  const SizedBox(width: 10),
                                  Expanded(
                                      child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                        Text("Questionnaire",
                                            style: TextStyle(
                                                fontSize: FontSize.m,
                                                color: Colors.black,
                                                fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 10),
                                        ScrollBox(
                                            height: 70,
                                            child: ListView.builder(
                                              shrinkWrap: true,
                                              physics:
                                                  const NeverScrollableScrollPhysics(),
                                              itemCount: widget.selectedGame!
                                                  .questions.length,
                                              itemBuilder: (context, index) {
                                                var question = widget
                                                    .selectedGame!
                                                    .questions[index];
                                                return Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          top: 2),
                                                  child: Text(
                                                      "- ${question.text}"),
                                                );
                                              },
                                            )),
                                        const SizedBox(height: 10),
                                        Text(
                                            "Temps de réponse: ${widget.selectedGame!.duration} seconde${widget.selectedGame!.duration > 1 ? 's' : ''}"),
                                      ])),
                                ])),
                        const SizedBox(height: 12),
                      ]),
                Form(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    spacing: 12,
                    children: [
                      Row(
                        spacing: 20,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (widget.selectedGame == null)
                            SizedBox(
                                height: 40,
                                width: 300,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Text('Questions'),
                                    SizedBox(
                                        width: 170,
                                        child: Slider(
                                            min: 5,
                                            max: 20,
                                            divisions: 15,
                                            value: questionCount,
                                            onChanged: (value) {
                                              setState(() {
                                                questionCount = value;
                                              });
                                            })),
                                    Text('${questionCount.toInt()}'),
                                  ],
                                )),
                          if (widget.selectedGame != null)
                            SizedBox(
                              height: 40,
                              width: 200,
                              child: Row(
                                spacing: 4,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text('Mode:'),
                                  Expanded(
                                    child: Container(
                                      decoration:
                                          BoxDecoration(color: cardColor),
                                      child: DropdownButton(
                                        isExpanded: true,
                                        value: gameMode,
                                        onChanged: (GameMode? newValue) {
                                          setState(() {
                                            gameMode = newValue!;
                                          });
                                        },
                                        items: entries,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          SizedBox(
                              height: 40,
                              width: 300,
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text('Prix d\'entrée'),
                                  SizedBox(
                                    width: 170,
                                    child: Slider(
                                      inactiveColor: Colors.grey,
                                      min: 0,
                                      max: 200,
                                      divisions: 20,
                                      value: entryPrice,
                                      onChanged: (value) {
                                        setState(() {
                                          entryPrice = value;
                                        });
                                      },
                                    ),
                                  ),
                                  Text('${entryPrice.toInt()}'),
                                ],
                              )),
                        ],
                      ),
                      Row(
                        spacing: 20,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Checkbox(
                                visualDensity: VisualDensity.compact,
                                value: isFriendsOnly,
                                onChanged: (value) {
                                  setState(() {
                                    isFriendsOnly = value!;
                                  });
                                },
                              ),
                              const Text('Ouvert aux amis seulement')
                            ],
                          ),
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            Checkbox(
                              visualDensity: VisualDensity.compact,
                              value: arePowerUpsEnabled,
                              onChanged: (value) {
                                setState(() {
                                  arePowerUpsEnabled = value!;
                                });
                              },
                            ),
                            const Text('Activer les modificateurs de partie'),
                          ]),
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            Checkbox(
                              visualDensity: VisualDensity.compact,
                              value: hasSoundboard,
                              onChanged: (value) {
                                setState(() {
                                  hasSoundboard = value!;
                                });
                              },
                            ),
                            const Text('Activer le tableau de son'),
                          ])
                        ],
                      ),
                      Center(
                          child: TapDebouncer(
                              cooldown: const Duration(seconds: 1),
                              onTap: () async => await _startGame(),
                              builder: (context, onTap) {
                                return ElevatedButton(
                                  onPressed: onTap,
                                  style: ElevatedButton.styleFrom(
                                      disabledBackgroundColor: Colors.grey,
                                      backgroundColor: Theme.of(context)
                                          .colorScheme
                                          .secondary,
                                      foregroundColor: Colors.white),
                                  child: Text(
                                    "Lancer une partie",
                                    style: TextStyle(
                                        fontSize: FontSize.m,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .onPrimary,
                                        fontWeight: FontWeight.bold),
                                  ),
                                );
                              }))
                    ],
                  ),
                )
              ],
            )));
  }
}

class ScrollBox extends StatelessWidget {
  final double height;
  final Widget child;

  const ScrollBox({
    super.key,
    required this.height,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final ScrollController scrollController = ScrollController();

    return Container(
      height: height,
      width: double.infinity,
      padding: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey),
        color: cardColor,
        borderRadius: BorderRadius.circular(5),
      ),
      child: RawScrollbar(
        controller: scrollController,
        thumbVisibility: true,
        thickness: 6,
        radius: const Radius.circular(10),
        child: SingleChildScrollView(
          controller: scrollController,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [child],
          ),
        ),
      ),
    );
  }
}
