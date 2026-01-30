import 'package:flutter/material.dart';
import 'package:mobile_client/constants/power_ups_constants.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/power_up_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/enum/power_up_type.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/widgets/game_controls/power_up_count_badge.dart';

class GameControlsWidget extends StatefulWidget {
  const GameControlsWidget({super.key});

  @override
  State<GameControlsWidget> createState() => _GameControlsWidgetState();
}

class _GameControlsWidgetState extends State<GameControlsWidget> {
  final PowerUpService _powerUpService = locator.get<PowerUpService>();
  final ShopService _shopService = locator.get<ShopService>();

  List<ShopItem> powerUps = [];

  Future<List<ShopItem>> _fetchShopItems() async {
    await _shopService.getShopItems();
    return _shopService.powerUps;
  }

  handlePowerUp(String powerUpName) async {
    PowerUpType powerUptype = PowerUpType.fromName(powerUpName);
    final message = await _powerUpService.requestPowerUp(powerUptype);
    if (!mounted) return;
    if (message == successMessage) {
      setState(() {
        _shopService.decreaseAmount(powerUptype);
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(message),
          duration: Duration(seconds: 3),
          backgroundColor: Colors.black,
        ),
      );
    }
  }

  void _showTemporaryTooltip(
      BuildContext context, String name, Offset position) {
    final overlay = Overlay.of(context);
    final overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        left: position.dx - 125,
        top: position.dy - 225,
        child: Material(
          color: Colors.transparent,
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.black..withAlpha(191),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '$name: ${powerUpDescription[name] ?? 'Description indisponible'}',
              style: TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
        ),
      ),
    );

    overlay.insert(overlayEntry);

    Future.delayed(Duration(seconds: 3)).then((_) => overlayEntry.remove());
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(left: 12),
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.grey[300],
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        spacing: 12,
        children: [
          Icon(
            Icons.rocket,
            size: 45,
            color: Colors.black,
          ),
          FutureBuilder(
            future: _fetchShopItems(),
            builder:
                (BuildContext context, AsyncSnapshot<List<ShopItem>> snapshot) {
              if (snapshot.hasData) {
                List<ShopItem> powerUps = snapshot.data!;
                return ValueListenableBuilder<bool>(
                    valueListenable: _powerUpService.disablePowerUps,
                    builder: (context, isDisabled, child) {
                      return Column(
                        spacing: 18,
                        children: powerUps.asMap().entries.map((entry) {
                          ShopItem powerUp = entry.value;

                          bool isSelected =
                              _powerUpService.selectedPowerUp == powerUp.name;

                          return GestureDetector(
                            onTap: isDisabled
                                ? null
                                : () => handlePowerUp(powerUp.name),
                            child: Stack(
                              alignment: Alignment.center,
                              clipBehavior: Clip.none,
                              children: [
                                Container(
                                  width: 68,
                                  height: 68,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                        color: Colors.grey, width: 2),
                                  ),
                                  child: ColorFiltered(
                                    colorFilter: isDisabled
                                        ? ColorFilter.mode(
                                            Colors.grey, BlendMode.saturation)
                                        : ColorFilter.mode(Colors.transparent,
                                            BlendMode.multiply),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(10),
                                      child: Image.network(
                                        powerUp.imageUrl,
                                        width: 48,
                                        height: 48,
                                        fit: BoxFit.cover,
                                      ),
                                    ),
                                  ),
                                ),
                                PowerUpCountBadgeWidget(
                                  amount: _shopService
                                      .getPowerUpCount(powerUp.name),
                                  isDisabled: isDisabled,
                                ),
                                if (isSelected)
                                  Positioned.fill(
                                    child: Align(
                                      alignment: Alignment.center,
                                      child: Icon(
                                        Icons.rocket_launch,
                                        color: Colors.white,
                                        size: 35,
                                        shadows: [
                                          Shadow(
                                            blurRadius: 8,
                                            color: Colors.black,
                                            offset: Offset(0, 0),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                Positioned(
                                  top: -15,
                                  right: -13,
                                  child: GestureDetector(
                                    onTapDown: (details) {
                                      final RenderBox box = context
                                          .findRenderObject() as RenderBox;
                                      final Offset position = box.localToGlobal(
                                          details.globalPosition);
                                      _showTemporaryTooltip(
                                          context, powerUp.name, position);
                                    },
                                    child: Container(
                                      width: 34,
                                      height: 34,
                                      decoration: BoxDecoration(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary,
                                        shape: BoxShape.circle,
                                      ),
                                      child: Icon(
                                        Icons.help_outline,
                                        color: Colors.white,
                                        size: 26,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      );
                    });
              } else {
                return Text('Aucun modificateur disponible');
              }
            },
          ),
        ],
      ),
    );
  }
}
