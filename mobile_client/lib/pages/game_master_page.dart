import 'package:flutter/material.dart';
import 'package:mobile_client/widgets/game_master/game_master_widget.dart';

class GameMasterPage extends StatelessWidget {
  const GameMasterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(body: GameMasterWidget());
  }
}
