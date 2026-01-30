import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/game_mode.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/team.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/participant_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/team_service.dart';
import 'package:mobile_client/widgets/waiting_room/section_title.dart';

class WaitingPlayers extends StatefulWidget {
  const WaitingPlayers({super.key});

  @override
  State<WaitingPlayers> createState() => _WaitingPlayersState();
}

class _WaitingPlayersState extends State<WaitingPlayers> {
  final ParticipantService participantService =
      locator.get<ParticipantService>();
  final RoomService roomService = locator.get<RoomService>();
  final TeamService teamService = locator.get<TeamService>();
  @override
  void initState() {
    super.initState();
    participantService.clearParticipants();
    participantService.initializeParticipants(context);
    participantService.addListener(_onParticipantsChanged);
  }

  @override
  void dispose() {
    participantService.removeParticipantsListener();
    participantService.removeListener(_onParticipantsChanged);
    super.dispose();
  }

  void _onParticipantsChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 3,
      child: DecoratedBox(
        decoration: BoxDecoration(color: cardColor),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionTitle(context: context, title: 'Participants :'),
            Flexible(
              fit: FlexFit.loose,
              child: Theme( // themes dont update in the gridView without this
                data: Theme.of(context),
                child: GridView.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: 4,
                      mainAxisExtent: 60
                  ),
                  itemCount: participantService.participants.length,
                  itemBuilder: (context, index) {
                    final player = participantService.participants[index];
                    final teamColor = teamColorMap[
                        teamService.getTeam(player.teamName)?.color];
                    return Center(
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 10.0),
                        decoration: BoxDecoration(
                          color: player.hasLeft
                              ? Theme.of(context)
                                  .colorScheme
                                  .primary
                                  .withAlpha(80)
                              : (roomService.gameMode == GameMode.team &&
                                      teamColor != null
                                  ? teamColor
                                  : Theme.of(context)
                                      .colorScheme
                                      .primary
                                      .withAlpha(80)),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Container(
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: Theme.of(context).primaryColor,
                                    width: 2,
                                  ),
                                  borderRadius: BorderRadius.circular(200),
                                ),
                                child: ClipOval(
                                  child: Image.network(
                                    width: 40,
                                    height: 40,
                                    player.imageUrl,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                            ),
                            SizedBox(
                              width: 80,
                              child: Text(
                                player.username,
                                style: TextStyle(
                                    color: Colors.black,
                                    decoration: player.hasLeft
                                        ? TextDecoration.lineThrough
                                        : null,
                                    fontSize: 20),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            if (roomService.isGameMaster && !player.hasLeft)
                              IconButton(
                                icon:
                                    const Icon(Icons.cancel, color: Colors.red),
                                onPressed: () {
                                  participantService
                                      .removeParticipant(player.username);
                                },
                              )
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
