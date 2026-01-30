import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.context,
    required this.title,
  });

  final BuildContext context;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.only(
                bottomLeft: Radius.circular(10),
                bottomRight: Radius.circular(10),
              ),
            color: Theme.of(context).colorScheme.primary,
            ),
            padding: EdgeInsets.all(20),
            child: Text(title,
                style: TextStyle(
                    fontSize: FontSize.l,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onPrimary)),
          ),
        ),
      ],
    );
  }
}
