import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';

ThemeData defaultMode = ThemeData(
  colorScheme: ColorScheme.light(
    onSecondary: Colors.white,
    surface: Colors.white,
    surfaceContainerHighest: MyColors.lightGrey,
    primary: MyColors.darkBlue,
    secondary: MyColors.pinkOrange,
    tertiary: MyColors.lightPink,
    error: Colors.red, // Can be changed
    inversePrimary: Colors.grey.shade900,
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10), 
      ),
    ),
  ),
  textTheme: GoogleFonts.robotoSlabTextTheme(),
);
