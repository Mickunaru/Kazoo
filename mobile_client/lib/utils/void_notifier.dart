import 'package:flutter/cupertino.dart';

class VoidNotifier extends ValueNotifier {
  VoidNotifier() : super(false);

  void notify() {
    value = !value;
  }
}
