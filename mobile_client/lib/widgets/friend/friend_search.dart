import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/friend_service.dart';

class FriendsSearch extends StatefulWidget {
  const FriendsSearch({super.key});
  @override
  FriendSearchState createState() => FriendSearchState();
}

class FriendSearchState extends State<FriendsSearch> {
  TextEditingController friendSearchController = TextEditingController();
  final FriendService friendService = locator.get<FriendService>();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    friendService.addListener(_onFriendChange);
  }

  @override
  void dispose() {
    friendService.removeListener(_onFriendChange);
    super.dispose();
  }

  void _onFriendChange() {
    if (mounted) {
      setState(() {});
    }
  }

  void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void sendFriendRequest(BuildContext context) {
    final String username = friendSearchController.text;
    if (username.isEmpty || !friendService.notFriendList.contains(username)) {
      showSnackBar(context, 'Sélectionnez un nom d\'utilisateur valide');
      return;
    }
    friendService.sendFriendRequest(username);
    friendSearchController.clear();
    showSnackBar(context, 'Une invitation a été envoyée à $username');
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(top: 16.0, bottom: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Autocomplete<String>(
            optionsBuilder: (TextEditingValue textEditingValue) {
              return friendService.notFriendList
                  .where((user) => user.toLowerCase().contains(
                        textEditingValue.text.toLowerCase(),
                      ))
                  .toList();
            },
            onSelected: (String selection) {
              friendSearchController.text = selection;
            },
            fieldViewBuilder:
                (context, controller, focusNode, onFieldSubmitted) {
              friendSearchController = controller;
              return Form(
                  key: _formKey,
                  child: SizedBox(
                      width: 327,
                      child: TextFormField(
                        controller: controller,
                        focusNode: focusNode,
                        onTap: () {
                          _formKey.currentState?.reset();
                        },
                        decoration: InputDecoration(
                          fillColor: Colors.white,
                          filled: true,
                          prefixIcon: Icon(Icons.search),
                          labelText: 'Recherche',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        validator: (value) {
                          FocusScope.of(context).unfocus();
                          return friendService.validateEntry(value);
                        },
                      )));
            },
            optionsViewBuilder: (context, onSelected, options) {
              return Align(
                  alignment: Alignment.topLeft,
                  child: Column(children: [
                    Material(
                        elevation: 6,
                        borderRadius: BorderRadius.circular(2),
                        child: Container(
                          constraints: BoxConstraints(
                              maxHeight: 210,
                              minHeight: 100,
                              minWidth: 100,
                              maxWidth: 328),
                          child: ListView.builder(
                            itemCount: options.length,
                            itemBuilder: (BuildContext context, int index) {
                              final String option = options.elementAt(index);
                              return GestureDetector(
                                onTap: () {
                                  onSelected(option);
                                },
                                child: ListTile(
                                  title: Text(option),
                                ),
                              );
                            },
                          ),
                        )),
                    IconButton(
                      icon: Icon(Icons.close),
                      iconSize: 50,
                      color: Colors.red,
                      onPressed: () {
                        FocusScope.of(context).unfocus();
                      },
                    ),
                  ]));
            },
          ),
          IconButton(
            icon: Icon(Icons.group_add),
            iconSize: 30.0,
            color: Colors.black,
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                sendFriendRequest(context);
              }
            },
          ),
        ],
      ),
    );
  }
}
