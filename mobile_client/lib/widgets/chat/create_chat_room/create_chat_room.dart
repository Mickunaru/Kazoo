import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/chat_room.dart';
import 'package:mobile_client/services/chat_service.dart';

class CreateChatRoom extends StatefulWidget {
  final void Function(ChatRoomDto room) onRoomCreated;
  const CreateChatRoom({super.key, required this.onRoomCreated});

  @override
  State<CreateChatRoom> createState() => _CreateChatRoomState();
}

class _CreateChatRoomState extends State<CreateChatRoom> {
  final formKey = GlobalKey<FormState>();
  final nameController = TextEditingController();

  Future<void> createRoom(String name) async {
    if (!formKey.currentState!.validate()) return;
    final room = await locator.get<ChatService>().createRoom(name);
    widget.onRoomCreated(room);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Form(
          key: formKey,
          child: Padding(
              padding: EdgeInsets.all(8),
              child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    TextFormField(
                      inputFormatters: <TextInputFormatter>[
                        FilteringTextInputFormatter.deny(RegExp("#"))
                      ],
                      controller: nameController,
                      decoration: const InputDecoration(
                        labelText: "Nom de salle",
                        hintText: "Ex. Chat trop cool",
                        border: OutlineInputBorder(),
                        counterText: ' ',
                      ),
                      validator: (val) {
                        if (val == null || val.isEmpty) {
                          return "Entrez un nom de salle";
                        }
                        return null;
                      },
                      maxLength: 10,
                    ),
                    SizedBox(height: 10),
                    ElevatedButton(
                        onPressed: () {
                          createRoom(nameController.text);
                        },
                        child: Text("Créer"))
                  ]))),
    );
  }
}
