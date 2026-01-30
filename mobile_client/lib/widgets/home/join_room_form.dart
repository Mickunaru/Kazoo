import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/join_game_service.dart';
import 'package:mobile_client/services/room_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class JoinRoomForm extends StatefulWidget {
  const JoinRoomForm({super.key});

  @override
  State<JoinRoomForm> createState() => _JoinRoomFormState();
}

class _JoinRoomFormState extends State<JoinRoomForm> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _roomCodeController = TextEditingController();
  final _roomService = locator.get<RoomService>();
  String? _errorMessage;

  Future<void> joinRoom() async {
    setState(() => _errorMessage = null);

    if (_formKey.currentState?.validate() ?? false) {
      final roomCode = _roomCodeController.text.trim();

      if (roomCode.isEmpty) {
        setState(() => _errorMessage = "Le code est requis.");
        return;
      }

      _roomService.isProcessing.value = true;
      final error =
          await locator.get<JoinGameService>().roomIdValidator(roomCode);
      if (error != null) {
        setState(() => _errorMessage = error);
        _roomService.isProcessing.value = false;
        return;
      }

      await _roomService.playerJoinRoom(roomCode);
      if (mounted) {
        AppNavigator.go("/${PageUrl.waitingRoom.name}");
      }
    }
    _roomService.isProcessing.value = false;
  }

  @override
  Widget build(BuildContext context) {
    return Form(
        key: _formKey,
        child: Padding(
            padding:
                EdgeInsetsDirectional.symmetric(horizontal: 5, vertical: 20),
            child: Container(
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(12), // Rounded corners
              ),
              padding: const EdgeInsets.symmetric(vertical: 25, horizontal: 10),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Participez!",
                      style: TextStyle(
                          fontSize: FontSize.xl,
                          color: Colors.black,
                          fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _textInput()),
                      const SizedBox(width: 10),
                      _sendButton()
                    ],
                  ),
                  if (_errorMessage != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 8.0),
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: Colors.red),
                      ),
                    ),
                ],
              ),
            )));
  }

  Widget _textInput() {
    return TextFormField(
      controller: _roomCodeController,
      onFieldSubmitted: (_) => joinRoom(),
      maxLength: 4,
      decoration: InputDecoration(
        filled: true,
        fillColor: Theme.of(context).colorScheme.surface,
        hintText: "Entrer le code...",
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        counterText: "",
      ),
      validator: (value) =>
          value?.isEmpty == true ? "Le code est requis." : null,
    );
  }

  Widget _sendButton() {
    return ValueListenableBuilder(
        valueListenable: _roomService.isProcessing,
        builder: (_, isProcessing, __) {
          return ElevatedButton(
              onPressed: isProcessing ? null : joinRoom,
              style: ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                  backgroundColor: Theme.of(context).colorScheme.secondary,
                  disabledBackgroundColor:
                      Theme.of(context).colorScheme.secondary),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text("Rejoindre",
                      style: TextStyle(
                          fontSize: FontSize.l,
                          color: Theme.of(context).colorScheme.onSecondary)),
                ],
              ));
        });
  }
}
