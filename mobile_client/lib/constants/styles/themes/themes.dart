import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MyColors {
  static const lightGrey = Color(0xFFE0E0E0);
  static const darkBlue = Color(0xFF002B5B);
  static const pinkOrange = Color(0xFFFF6F61);
  static const lightPink = Color(0xFFFFD3DC);
  static const cottonGreen = Color(0xFF007F5F);
  static const cottonYellow = Color(0xFFFFBB1B);
  static const cottonPeach = Color(0xFFFFB5A7);
}

final ThemeData darkTheme = ThemeData(
  colorScheme: ColorScheme.light(
    surface: Colors.white,
    surfaceContainerHighest: MyColors.lightGrey,
    primary: const Color(0xFF6A1B9A), // Joker Primary Color (Purple)
    secondary: const Color(0xFF2E7D32), // Joker Accent Color (Green)
    tertiary: const Color(0xFFA5D6A7), // Joker ter Color (Bright green)
    error: Colors.red,
    inversePrimary: Colors.white,
    onSecondary: Colors.white,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    ),
  ),
  textTheme: GoogleFonts.robotoSlabTextTheme(),
  useMaterial3: true,
);

final ThemeData shamrockTheme = ThemeData(
  colorScheme: ColorScheme.light(
    surface: Colors.white,
    surfaceContainerHighest: MyColors.lightGrey,
    primary: MyColors.cottonGreen,
    secondary: MyColors.cottonYellow,
    tertiary: MyColors.cottonPeach,
    error: Colors.red,
    inversePrimary: Colors.grey.shade900,
    onSecondary: Colors.black,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
      ),
    ),
  ),
  textTheme: GoogleFonts.robotoSlabTextTheme(),
  useMaterial3: true,
);
