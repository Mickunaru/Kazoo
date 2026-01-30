import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/team.dart';
import 'package:mobile_client/constants/enum/team_creation_response.dart';
import 'package:mobile_client/constants/socket_events/room_event.dart';
import 'package:mobile_client/widgets/snackbar.dart';

import 'websocket_service.dart';

class TeamService extends ChangeNotifier {
  final WebSocketService _websocketService;
  List<Team> teams = [];
  String teamName = '';
  Team? team;

  TeamService(this._websocketService);

  Future<void> createTeam(String name, BuildContext context) async {
    teamName = name;
    final data = await _websocketService.sendWithAck<TeamId, String>(
        RoomEvent.createTeam.name, TeamId(name: name));
    final creationResponse = TeamCreationResponse.fromJson(data);

    if (!context.mounted) return;
    switch (creationResponse) {
      case TeamCreationResponse.teamNameTaken:
        showCustomSnackBar(
            message: "Nom de l'équipe existe déjà.", context: context);
        teamName = '';
        break;
      case TeamCreationResponse.maximumTeamLimitReached:
        showCustomSnackBar(
            message: "Le nombre maximal d'équipe a été atteint.",
            context: context);
        teamName = '';
        break;
      case TeamCreationResponse.teamCreated:
        break;
    }
  }

  void selectTeam(String name) {
    teamName = name;
    _websocketService.send(RoomEvent.selectTeam.name, TeamId(name: name));
  }

  Team? getTeam(String teamName) {
    return teams.firstWhereOrNull((team) => team.name == teamName);
  }

  void setup() {
    _websocketService.on<List<dynamic>>(RoomEvent.updateTeams.name, (data) {
      teams = data.map((team) => Team.fromJson(team)).toList();
      team = getTeam(teamName);
      notifyListeners();
    });
    _websocketService.send(RoomEvent.updateTeams.name);
  }

  void removeListeners() {
    _websocketService.removeAllListeners(RoomEvent.updateTeams.name);
  }

  void resetManager() {
    teams.clear();
    teamName = '';
    team = null;
    removeListeners();
    notifyListeners();
  }
}
