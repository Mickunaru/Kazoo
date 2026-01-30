import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/team.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/services/team_service.dart';
import 'package:mobile_client/widgets/waiting_room/section_title.dart';

class WaitingTeam extends StatefulWidget {
  const WaitingTeam({super.key, required this.isDisabled});
  final bool isDisabled;

  @override
  State<WaitingTeam> createState() => _WaitingTeamState();
}

class _WaitingTeamState extends State<WaitingTeam> {
  final TeamService teamService = locator.get<TeamService>();
  final RoomService roomService = locator.get<RoomService>();
  final TextEditingController controller = TextEditingController();

  @override
  void initState() {
    super.initState();
    teamService.setup();
  }

  Future<void> createTeam() async {
    if (disableTeamCreation()) return;
    await teamService.createTeam(controller.text.trim(), context);
    setState(() {
      controller.text = '';
    });
  }

  selectTeam(String teamName) {
    if (widget.isDisabled) return;
    if (roomService.isGameMaster) return;
    teamService.selectTeam(teamName);
  }

  bool disableTeamCreation() {
    return teamService.teams.length >= teamNumberLimit ||
        controller.text.trim().isEmpty ||
        widget.isDisabled;
  }

  @override
  void dispose() {
    controller.dispose();
    teamService.removeListeners();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      elevation: 3,
      child: DecoratedBox(
        decoration: BoxDecoration(color: cardColor),
        child: Column(
          children: [
            SectionTitle(context: context, title: 'Équipes :'),
            Center(
              child: Container(
                padding: EdgeInsets.all(10),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  spacing: 10,
                  children: [
                    if (!roomService.isGameMaster)
                      SizedBox(
                        width: 250,
                        child: TextField(
                            inputFormatters: <TextInputFormatter>[
                              FilteringTextInputFormatter.deny(RegExp("#"))
                            ],
                            controller: controller,
                            maxLength: 20,
                            decoration: InputDecoration(
                              labelText: 'Créer une équipe',
                              helperText:
                                  'Équipes: ${teamService.teams.length}/4',
                              counterText: '',
                              helperMaxLines: 1,
                              border: const OutlineInputBorder(),
                              suffixIcon: Align(
                                widthFactor: 1.0,
                                heightFactor: 1.0,
                                child: IconButton(
                                  icon: const Icon(Icons.add),
                                  tooltip: 'Créer Équipe',
                                  onPressed:
                                      widget.isDisabled ? null : createTeam,
                                ),
                              ),
                            ),
                            onSubmitted:
                                widget.isDisabled ? null : (_) => createTeam()),
                      ),
                    ListenableBuilder(
                        listenable: teamService,
                        builder: (context, child) {
                          return Row(
                            spacing: 10,
                            children: [
                              for (final team in teamService.teams)
                                InkWell(
                                  onTap: () => selectTeam(team.name),
                                  child: Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(5)),
                                        color: teamColorMap[team.color],
                                      ),
                                      padding: EdgeInsets.all(10),
                                      height: 50,
                                      child: Row(children: [
                                        Icon(teamIconMap[team.icon],
                                            color: Colors.black),
                                        Text(team.name),
                                      ])),
                                )
                            ],
                          );
                        }),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
