import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/shop/shop_widgets/.shop_ui_params.dart';
import 'package:mobile_client/shop/shop_widgets/shop_display_header.dart';
import 'package:mobile_client/shop/shop_widgets/vanity/vanity_item_showcase.dart';

class VanityShopDisplay extends StatelessWidget {
  VanityShopDisplay({super.key});
  final _shopService = locator.get<ShopService>();

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      ShopDisplayHeader(title: "Thèmes & Avatars"),
      Expanded(
        child: Container(
          decoration: showCaseBoxDecoration,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            mainAxisSize: MainAxisSize.max,
            children: [
              for (ShopItem item in _shopService.vanityItems)
                VanityItemShowcase(item: item),
            ],
          ),
        ),
      )
    ]);
  }
}
