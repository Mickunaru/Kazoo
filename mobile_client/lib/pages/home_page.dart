import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/home_page/home_lobby_service.dart';
import 'package:mobile_client/widgets/home/create_game.dart';
import 'package:mobile_client/widgets/home/game_list.dart';
import 'package:mobile_client/widgets/home/join_room_form.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final HomeLobbyService _homeLobbyService = locator.get<HomeLobbyService>();

  @override
  void initState() {
    super.initState();
    _homeLobbyService.joinHomeLobby();
  }

  @override
  void dispose() {
    _homeLobbyService.leaveHomeLobby();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Row(
            children: [
              const SizedBox(width: 40),
              Expanded(child: CreateGame()),
              const SizedBox(width: 20),
              Expanded(child: JoinRoomForm()),
              const SizedBox(width: 40),
            ],
          ),
          Expanded(child: GameList())
        ],
      ),
    );
  }
}
