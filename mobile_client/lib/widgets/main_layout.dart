import 'package:flutter/material.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/chat_service.dart';
import 'package:mobile_client/services/notification_service.dart';
import 'package:mobile_client/widgets/chat/chat.dart';
import 'package:mobile_client/widgets/navigation/nav_bar.dart';

class MainLayout extends StatefulWidget {
  final Widget child;
  const MainLayout({super.key, required this.child});

  @override
  State<MainLayout> createState() => _MainLayoutState();
}

class _MainLayoutState extends State<MainLayout> {
  final ChatService _chatService = locator.get<ChatService>();
  final NotificationService _notificationService =
      locator.get<NotificationService>();
  bool isChatVisible = false;

  @override
  void initState() {
    _chatService.initialize();
    _notificationService.initialize();
    super.initState();
  }

  void toggleChat() {
    setState(() {
      isChatVisible = !isChatVisible;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
            top: 0,
            bottom: 0,
            left: 0,
            child: NavBar(returnRoute: "/${PageUrl.home.name}")),
        AnimatedPositioned(
          duration: Duration(milliseconds: 100),
          top: 0,
          bottom: 0,
          left: navBarWidth,
          right: isChatVisible ? 300 : 0,
          child: widget.child,
        ),
        AnimatedPositioned(
          duration: Duration(milliseconds: 100),
          right: isChatVisible ? 0 : -300,
          top: 0,
          bottom: 0,
          child: Container(
            width: 300,
            color: Colors.grey[200],
            child: DecoratedBox(
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withValues(alpha: 0.5),
                        spreadRadius: 5,
                        blurRadius: 7,
                        offset: Offset(0, 3),
                      ),
                    ]),
                child: Chat()),
          ),
        ),
        AnimatedPositioned(
          duration: Duration(milliseconds: 100),
          right: isChatVisible ? 310 : 10,
          bottom: 20,
          child: FloatingActionButton(
            onPressed: toggleChat,
            backgroundColor: Theme.of(context).colorScheme.secondary,
            child: Icon(Icons.chat),
          ),
        ),
      ],
    );
  }
}
