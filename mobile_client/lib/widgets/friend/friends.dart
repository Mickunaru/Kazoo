import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/friend_service.dart';
import 'package:mobile_client/widgets/friend/friend_search.dart';

class FriendsBox extends StatefulWidget {
  const FriendsBox({super.key});
  @override
  FriendsBoxState createState() => FriendsBoxState();
}

class FriendsBoxState extends State<FriendsBox> {
  TextEditingController friendSearchController = TextEditingController();
  final FriendService friendService = locator.get<FriendService>();

  @override
  void initState() {
    super.initState();
    friendService.initialize();
    friendService.addListener(_onFriendChange);
  }

  @override
  void dispose() {
    friendService.removeListener(_onFriendChange);
    friendService.removeListeners();
    super.dispose();
  }

  void _onFriendChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.grey[350],
      child: Column(children: [
        Row(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                  child: DecoratedBox(
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(10),
                          bottomRight: Radius.circular(10),
                        ),
                      ),
                      child: Padding(
                          padding: EdgeInsets.all(
                            16.0,
                          ),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Padding(
                                    padding: EdgeInsets.only(right: 8.0),
                                    child:
                                        Icon(Icons.group, color: Colors.white)),
                                Text("Liste d'amis",
                                    style: TextStyle(
                                        fontSize: FontSize.l,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white)),
                              ]))))
            ]),
        Padding(
            padding: EdgeInsets.all(16.0),
            child: Column(
              children: [
                FriendsSearch(),
                SingleChildScrollView(
                    child: Container(
                  constraints: BoxConstraints(maxHeight: 310, minHeight: 100),
                  child: friendService.friendList.isEmpty
                      ? Text('Ajoute des amis!',
                          style: TextStyle(fontSize: FontSize.m))
                      : ListView.builder(
                          padding: EdgeInsets.zero,
                          shrinkWrap: true,
                          itemCount: friendService.friendList.length,
                          itemBuilder: (context, index) {
                            return Card(
                                child: ListTile(
                              contentPadding: EdgeInsets.all(8.0),
                              title: Text(friendService.friendList[index]),
                              leading: Icon(Icons.person),
                              trailing: IconButton(
                                  icon: Icon(Icons.remove),
                                  onPressed: () {
                                    friendService.removeFriend(
                                        friendService.friendList[index]);
                                  }),
                            ));
                          },
                        ),
                )),
              ],
            ))
      ]),
    );
  }
}
