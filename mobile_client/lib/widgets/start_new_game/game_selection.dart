import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/game.dart';
import 'package:mobile_client/services/game_library_service.dart';
import 'package:mobile_client/widgets/start_new_game/game_starter.dart';

class GameSelection extends StatefulWidget {
  const GameSelection({super.key});

  @override
  State<GameSelection> createState() => _GameSelectionState();
}

class _GameSelectionState extends State<GameSelection> {
  final GameLibraryService _gameLibraryService =
      locator.get<GameLibraryService>();
  final ScrollController _scrollController = ScrollController();
  List<Game> publicGames = [];
  Game? selectedGame;
  bool isGameSelect = false;
  bool areGamesFetched = false;
  final ScrollController controller = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadGames();
  }

  Future<void> _loadGames() async {
    await _gameLibraryService.updatePublicGames();
    setState(() {
      publicGames = _gameLibraryService.publicGames;
      areGamesFetched = true;
    });
  }

  void showGameDetails(Game? game) {
    setState(() {
      selectedGame = game;
      isGameSelect = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Card(
          margin: EdgeInsets.only(top: 10, right: 50, left: 50),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          elevation: 3,
          child: Container(
            decoration: BoxDecoration(
              color: cardMenuBackground,
              border: Border.all(color: Colors.black, width: 1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              child: Column(
                children: [
                  SizedBox(
                      height: 200,
                      child: publicGames.isEmpty
                          ? Center(
                              child: areGamesFetched
                                  ? Text(
                                      "Aucun jeu n'est disponible",
                                      style: TextStyle(color: Colors.black),
                                    )
                                  : CircularProgressIndicator(),
                            )
                          : ListView.builder(
                              padding: EdgeInsets.all(10),
                              controller: _scrollController,
                              itemCount: publicGames.length + 1,
                              itemBuilder: (context, index) {
                                final game =
                                    index == 0 ? null : publicGames[index - 1];
                                return Padding(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 5),
                                    child: ElevatedButton(
                                        onPressed: () => showGameDetails(game),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: selectedGame == game
                                              ? cardSelectedColor
                                              : cardColor,
                                          foregroundColor: selectedGame == game
                                              ? Colors.white
                                              : Colors.black,
                                          padding: const EdgeInsets.symmetric(
                                              vertical: 15),
                                          shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(10),
                                          ),
                                          side: const BorderSide(
                                              color: Colors.grey, width: 1),
                                        ),
                                        child: Text(
                                          game?.title ?? 'Élimination Rapide',
                                          style: TextStyle(color: Colors.black),
                                        )));
                              },
                            )),
                ],
              ),
            ),
          ),
        ),
        if (isGameSelect) GameStarter(selectedGame: selectedGame),
      ],
    );
  }
}
