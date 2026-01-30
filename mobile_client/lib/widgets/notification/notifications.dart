import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/notification_service.dart';

class NotificationsBox extends StatefulWidget {
  const NotificationsBox({super.key});
  @override
  NotificationsBoxState createState() => NotificationsBoxState();
}

class NotificationsBoxState extends State<NotificationsBox> {
  TextEditingController friendSearchController = TextEditingController();
  final NotificationService notificationService =
      locator.get<NotificationService>();
  @override
  void initState() {
    super.initState();
    notificationService.addListener(_onNotificationChange);
  }

  @override
  void dispose() {
    notificationService.removeListener(_onNotificationChange);
    super.dispose();
  }

  void _onNotificationChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.grey[350],
      child: Column(
        children: [
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
                                    padding: EdgeInsets.only(right: 5),
                                    child: Icon(Icons.notifications,
                                        color: Colors.white)),
                                Text("Notifications",
                                    style: TextStyle(
                                        fontSize: FontSize.l,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white)),
                              ]),
                        ))),
              ]),
          Padding(
              padding: EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16.0),
              child: notificationService.notificationList.isEmpty
                  ? Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Text('Tu n\'as pas de nouvelles notifications.',
                          style: TextStyle(fontSize: FontSize.m)))
                  : SingleChildScrollView(
                      child: Container(
                      constraints:
                          BoxConstraints(maxHeight: 310, minHeight: 100),
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: notificationService.notificationList.length,
                        itemBuilder: (context, index) {
                          return Card(
                              child: ListTile(
                            title: Center(
                                child: Padding(
                                    padding: EdgeInsets.all(8.0),
                                    child: Text.rich(
                                      TextSpan(
                                        children: [
                                          TextSpan(
                                            text:
                                                '${notificationService.notificationList[index].senderUsername} ',
                                            style: TextStyle(
                                              fontSize: FontSize.m,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                          TextSpan(
                                            text:
                                                'vous a envoyé une invitation',
                                            style: TextStyle(
                                              fontSize: FontSize.m,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ))),
                            subtitle: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    elevation: 10,
                                    foregroundColor: Colors.white,
                                    backgroundColor:
                                        Theme.of(context).colorScheme.primary,
                                  ),
                                  onPressed: () {
                                    notificationService.respondToFriendRequest(
                                        notificationService
                                            .notificationList[index],
                                        true);
                                  },
                                  icon: Icon(Icons.add,
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onInverseSurface),
                                  label: Text("Accepter",
                                      style: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .onInverseSurface)),
                                ),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    elevation: 6,
                                    foregroundColor: Colors.white,
                                  ),
                                  onPressed: () {
                                    notificationService.respondToFriendRequest(
                                        notificationService
                                            .notificationList[index],
                                        false);
                                  },
                                  icon: Icon(Icons.close),
                                  label: Text("Ignorer",
                                      style: TextStyle(color: Colors.black)),
                                ),
                              ],
                            ),
                          ));
                        },
                      ),
                    ))),
        ],
      ),
    );
  }
}
