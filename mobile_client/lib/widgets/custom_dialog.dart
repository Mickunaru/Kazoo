import 'package:flutter/material.dart';

void showCustomDialog({
  required BuildContext context,
  required String title,
  required String description,
  required String cancelText,
  required String confirmText,
  required Function func,
}) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(title),
      content: Text(description),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: Text(cancelText),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            func();
          },
          child: Text(confirmText),
        ),
      ],
    ),
  );
}
