import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/enum/player_status.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/player_info.dart';
import 'package:mobile_client/services/game/game_state_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/websocket_service.dart';

class Leaderboard extends StatefulWidget {
  final bool resultMode;
  const Leaderboard({super.key, this.resultMode = false});

  @override
  State<Leaderboard> createState() => _LeaderboardState();
}

class _LeaderboardState extends State<Leaderboard> {
  final WebSocketService _webSocketService = locator.get<WebSocketService>();
  final RoomService _roomService = locator.get<RoomService>();
  late List<PlayerInfo> players = [];

  void setupPlayerInfoListener() {
    _webSocketService.on<List<dynamic>>(RoomEvent.updatePlayersStats.name,
        (playersStats) {
      setState(() {
        players = playersStats
            .map((playerStats) => PlayerInfo.fromJson(playerStats))
            .toList();
      });
    });
    _webSocketService.send(RoomEvent.updatePlayersStats.name);
  }

  @override
  void initState() {
    super.initState();
    if (widget.resultMode) {
      setState(() {
        players = locator.get<GameStateService>().playerInfos;
      });
    } else {
      setupPlayerInfoListener();
    }
  }

  @override
  void dispose() {
    _webSocketService.removeAllListeners(RoomEvent.updatePlayersStats.name);
    super.dispose();
  }

  // Color headerColor = Theme.of(context).colorScheme.onPrimary;

  List<DataColumn> getColumns() {
    List<DataColumn> defaultColumns = [
      DataColumn(
        label: Expanded(
            child: Text(
          _roomService.gameMode == GameMode.team ? 'Équipe' : 'Joueur',
          style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
        )),
      ),
      DataColumn(
        label: Expanded(
            child: Text(
          'Score',
          style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
        )),
      ),
    ];
    if (widget.resultMode) {
      return [
        DataColumn(
          label: Expanded(
              child:
                  Text('Rang',
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Theme.of(context).colorScheme.onPrimary))),
        ),
        ...defaultColumns,
        DataColumn(
          label: Expanded(
              child: Text(
            'Nb. de Bonus',
            style: TextStyle(color: Theme.of(context).colorScheme.onPrimary),
          )),
        ),
      ];
    }
    return defaultColumns;
  }

  List<DataRow> getRows() {
    return players.map((player) {
      List<DataCell> defaultCells = [
        DataCell(SizedBox(
            width: 100,
            child: Text(player.username,
                style: player.status == PlayerStatus.left
                    ? TextStyle(decoration: TextDecoration.lineThrough)
                    : null))),
        DataCell(SizedBox(width: 70, child: Text(player.score.toString()))),
      ];
      return DataRow(
        color: widget.resultMode
            ? WidgetStateProperty.resolveWith<Color>(
                (Set<WidgetState> _) {
                  switch (player.rank) {
                    case 1:
                      return const Color.fromRGBO(255, 215, 0, 1);
                    case 2:
                      return const Color.fromRGBO(192, 192, 192, 1);
                    case 3:
                      return const Color.fromRGBO(206, 137, 70, 1);
                    default:
                      return Colors.white;
                  }
                },
              )
            : WidgetStateProperty.resolveWith<Color>(
                (Set<WidgetState> _) {
                  switch (player.status) {
                    case PlayerStatus.submitted:
                      return Colors.lightGreen;
                    case PlayerStatus.left:
                    case PlayerStatus.pending:
                    default:
                      return Colors.transparent;
                  }
                },
              ),
        cells: widget.resultMode
            ? [
                DataCell(SizedBox(
                    width: 50,
                    child: Text(
                      player.rank.toString(),
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ))),
                ...defaultCells,
                DataCell(SizedBox(
                    width: 70, child: Text(player.bonusCount.toString()))),
              ]
            : defaultCells,
      );
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (!widget.resultMode)
          Text("Liste des joueurs",
              style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onPrimary)),
        Container(
          decoration: BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(10),
                spreadRadius: 2,
                blurRadius: 5,
                offset: Offset(0, 3),
              ),
            ],
          ),
          child: DataTable(
            headingRowColor: WidgetStateProperty.all(
                Theme.of(context).colorScheme.primary.withAlpha(50)),
            columnSpacing: 12,
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
            ),
            columns: getColumns(),
            rows: getRows(),
        ),
        ),
      ],
    );
  }
}
