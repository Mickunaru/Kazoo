import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class PageHeader extends StatelessWidget {
  final String title;
  final String returnRoute;
  final Function? action;
  const PageHeader(
      {super.key, required this.title, required this.returnRoute, this.action});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).colorScheme.primary,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (returnRoute.isNotEmpty)
            GestureDetector(
              onTap: () {
                action?.call();
                AppNavigator.go(returnRoute);
              },
              child: Container(
                padding: const EdgeInsets.fromLTRB(8, 20, 8, 4),
                height: 60,
                width: 170,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.secondary,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    SvgPicture.asset(
                      "assets/images/logo-white.svg",
                      height: 32,
                      width: 32,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "Kazoo!",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 22,
                      ),
                    )
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
