import 'package:flutter/material.dart';
import 'package:mobile_client/constants/power_ups_constants.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/shop/shop_widgets/.shop_ui_params.dart';

class PowerItemShowcase extends StatefulWidget {
  final ShopItem item;

  const PowerItemShowcase({
    super.key,
    required this.item,
  });

  @override
  State<PowerItemShowcase> createState() => _PowerItemShowcaseState();
}

class _PowerItemShowcaseState extends State<PowerItemShowcase> {
  final _shopService = locator.get<ShopService>();
  final _userAuthService = locator.get<UserAuthService>();
  int _amount = 0;

  @override
  initState() {
    super.initState();
    _amount = _shopService.getPowerUpCount(widget.item.name);
    _userAuthService.addListener(_updatePowerUpCount);
  }

  void _updatePowerUpCount() {
    setState(() {
      if (_userAuthService.curUser == null) return;
      _amount = _shopService.getPowerUpCount(widget.item.name);
    });
  }

  String capitalizeFirstLetter(String input) {
    if (input.isEmpty) return input;
    return input[0].toUpperCase() + input.substring(1);
  }

  @override
  void dispose() {
    _userAuthService.removeListener(_updatePowerUpCount);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      spacing: 5,
      children: [
        Text(
          capitalizeFirstLetter(widget.item.name),
          style: TextStyle(
              fontSize: itemNameFontSize, fontWeight: FontWeight.bold),
        ),
        Badge.count(
          count: _amount,
          backgroundColor: Theme.of(context).colorScheme.secondary,
          textColor: Theme.of(context).colorScheme.onSecondary,
          alignment: Alignment.bottomRight,
          offset: const Offset(10, -10),
          largeSize: 28,
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
          child: Container(
            width: 90,
            height: 90,
            decoration: BoxDecoration(
              border: shopItemBorder.border,
              borderRadius: BorderRadius.circular(12),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                widget.item.imageUrl.isNotEmpty
                    ? widget.item.imageUrl
                    : shopPlaceHolder,
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        SizedBox(
          width: 170,
          height: 110,
          child: Center(
            child: Text(
              powerUpDescription[widget.item.name] ??
                  'Aucune description disponible',
              style: const TextStyle(fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            iconColor: Theme.of(context).colorScheme.onPrimary,
          ),
          onPressed: () =>
              _shopService.buySelectedItem(context, widget.item.id),
          child: Row(
            mainAxisSize: shopButtonSize,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              Text(
                widget.item.cost.toString(),
                style: TextStyle(fontSize: ShopbuttonTextSize),
              ),
              SizedBox(width: 10),
              Icon(Icons.paid),
            ],
          ),
        ),
      ],
    );
  }
}
