import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/themes/default_mode.dart';
import 'package:mobile_client/constants/styles/themes/themes.dart';


const defaultThemeName = 'Thème Kazoo!';
const darkThemeName = 'Thème joker';
const shamrockThemeName = 'Thème irlandais';


class ThemeService with ChangeNotifier {
  ThemeData _themeData = defaultMode;
  String _themeName = defaultThemeName;
  String get themeName => _themeName;
  ThemeData get themeData => _themeData;

  void setTheme(String themeName) {
    switch (themeName) {
    
      case darkThemeName:
        _themeData = darkTheme;
        _themeName = darkThemeName;
        break;
      case shamrockThemeName:
        _themeData = shamrockTheme;
        _themeName = shamrockThemeName;
        break;
      default:
        _themeData = defaultMode;
        _themeName = defaultThemeName;
        break;
    }
    notifyListeners();
  }


}
