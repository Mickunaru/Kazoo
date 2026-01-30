import 'package:flutter/material.dart';
import 'package:mobile_client/globals.dart';

void showCustomSnackBar({
  required BuildContext context,
  required String message,
  String actionLabel = '❌',
  int durationSeconds = 3,
  double width = 300,
}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(message),
      duration: Duration(seconds: durationSeconds),
      behavior: SnackBarBehavior.floating,
      action: SnackBarAction(
        label: actionLabel,
        onPressed: () {
          ScaffoldMessenger.of(context).hideCurrentSnackBar();
        },
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
      width: width,
    ),
  );
}

void showCustomGlobalSnackBar({
  required String message,
  String actionLabel = '❌',
  int durationSeconds = 3,
  double width = 300,
}) {
  snackbarKey.currentState?.showSnackBar(
    SnackBar(
      content: Text(message),
      duration: Duration(seconds: durationSeconds),
      behavior: SnackBarBehavior.floating,
      action: SnackBarAction(
        label: actionLabel,
        onPressed: () {
          snackbarKey.currentState?.hideCurrentSnackBar();
        },
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(4)),
      ),
      width: width,
    ),
  );
}
