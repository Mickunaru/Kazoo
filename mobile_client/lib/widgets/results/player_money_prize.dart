import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/game/prize_service.dart';

class PlayerMoneyPrize extends StatelessWidget {
  PlayerMoneyPrize({super.key});
  final prizeService = locator.get<PrizeService>();

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
        listenable: prizeService,
        builder: (_, __) {
          return Column(
            children: [
              if (prizeService.gamePrize > 0)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Prix obtenu : ${prizeService.gamePrize}',
                      style: TextStyle(
                          fontSize: FontSize.xxl, fontWeight: FontWeight.bold),
                    ),
                    Icon(
                      Icons.paid,
                      size: FontSize.m,
                      color: Colors.black,
                    ),
                  ],
                ),
              if (prizeService.potPrize > 0)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'Prix du pot: ${prizeService.potPrize}',
                      style: TextStyle(
                          fontSize: FontSize.xl, fontWeight: FontWeight.bold),
                    ),
                    Icon(
                      Icons.paid,
                      size: FontSize.m,
                      color: Colors.black,
                    ),
                  ],
                ),
            ],
          );
        });
  }
}
