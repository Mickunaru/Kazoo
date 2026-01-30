import 'package:flutter/material.dart';

class ShopDisplayHeader extends StatelessWidget {
  const ShopDisplayHeader({super.key, required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(children: [
      Expanded(
        child: Container(
          color: Theme.of(context).colorScheme.secondary,
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).colorScheme.onSecondary,
                )),
          ),
        ),
      ),
    ]);
  }
}
