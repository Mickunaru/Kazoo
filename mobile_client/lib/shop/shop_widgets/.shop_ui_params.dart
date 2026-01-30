import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';

final double ShopEdges = 10.0;
final boxColor = Colors.grey[350];
final BoxDecoration showCaseBoxDecoration = BoxDecoration(
    color: boxColor,
    borderRadius: BorderRadius.only(
        bottomLeft: Radius.circular(ShopEdges),
        bottomRight: Radius.circular(ShopEdges)));
final SliverGridDelegateWithFixedCrossAxisCount boxGridSettings =
    SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3, mainAxisSpacing: 5, crossAxisSpacing: 5);
final double ShopbuttonTextSize = FontSize.m;
final MainAxisSize shopButtonSize = MainAxisSize.min;
final double itemNameFontSize = 16;
final String shopPlaceHolder =
    'https://kazooteam.s3.ca-central-1.amazonaws.com/images/placeHolderFour.png';
final BoxDecoration shopItemBorder = BoxDecoration(
  shape: BoxShape.circle,
  border: Border.all(color: Colors.black, width: 2),
);
