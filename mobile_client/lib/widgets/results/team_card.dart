import 'package:flutter/material.dart';
import 'package:mobile_client/constants/team.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/team_service.dart';

class TeamCard extends StatelessWidget {
  TeamCard({super.key});

  final TeamService _teamService = locator.get<TeamService>();

  @override
  Widget build(BuildContext context) {
    if (_teamService.team == null) return Container();
    return Card(
      color: teamColorMap[_teamService.team?.color],
      child: Container(
        padding: EdgeInsets.all(15),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: 6,
          children: [
            Text('Équipe'),
            Icon(teamIconMap[_teamService.team?.icon], color: Colors.black),
            Text(
              _teamService.teamName,
              style: TextStyle(color: Colors.black),
            ),
          ],
        ),
      ),
    );
  }
}
