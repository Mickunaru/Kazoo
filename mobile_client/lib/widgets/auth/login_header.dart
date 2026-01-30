import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile_client/constants/styles/colors/colors.dart';

class LoginHeader extends StatelessWidget {
  const LoginHeader({
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(13.0),
      child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Flexible(
              child: SvgPicture.asset(
                "assets/images/logo.svg",
                height: 125,
                fit: BoxFit.contain,
              ),
            ),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                "Kazoo!",
                style: TextStyle(
                  color: MyColors.pinkOrange,
                  fontSize: 90,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            Column(
              children: [
                Text(
                    "Le jeu questionnaire de renommée internationale de l'équipe 111",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                    )),
                Text(
                    "Émilie Laverdière, Enrique Llerena, Gabriel Uriza, Michael Le, Yanis Pierre, Zachary Ouellet",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    )),
              ],
            )
          ]),
    );
  }
}
