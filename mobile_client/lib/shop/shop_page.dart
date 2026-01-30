import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/enum/shop_item_type.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/shop/shop_widgets/power_ups/power_up_shop_display.dart';
import 'package:mobile_client/shop/shop_widgets/vanity/vanity_shop_display.dart';
import 'package:mobile_client/shop/user_config_service.dart';

class ShopPage extends StatefulWidget {
  const ShopPage({super.key});

  @override
  State<ShopPage> createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  final _shopServiceState = locator.get<ShopService>();
  final _userAuthService = locator.get<UserAuthService>();
  final _userConfigService = locator.get<UserConfigService>();

  getCurrentAvatar() {
    return ShopItem(
        id: "",
        name: "",
        type: ShopItemType.AVATAR,
        cost: 0,
        imageUrl: _userAuthService.curUser?.avatar ?? '');
  }

  changeAvatar(ShopItem avatarItem) async {
    await _userConfigService.changeAvatar(context, avatarItem.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(20),
          child: Column(
            children: [
              Center(
                  child: Padding(
                      padding: EdgeInsets.all(8),
                      child: Text("Magasin",
                          style: TextStyle(
                              fontSize: FontSize.xl,
                              fontWeight: FontWeight.bold)))),
              FutureBuilder(
                  future: _shopServiceState.getShopItems(),
                  builder: (BuildContext context, snapshot) {
                    if (snapshot.hasData) {
                      return Expanded(
                        flex: 3,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: Column(
                            spacing: 5,
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Expanded(flex: 8, child: VanityShopDisplay()),
                              Expanded(flex: 11, child: PowerUpShopDisplay()),
                            ],
                          ),
                        ),
                      );
                    }
                    return Text("Une erreur s'est produite");
                  }),
            ],
          ),
        ),
      ),
    );
  }
}
