import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/user_model.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/avatar.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/enum/shop_item_type.dart';
import 'package:mobile_client/shop/user_config_service.dart';
import 'package:mobile_client/widgets/avatar/avatar_picker.dart';
import 'package:mobile_client/widgets/friend/friends.dart';
import 'package:mobile_client/widgets/notification/notifications.dart';

class AccountPage extends StatefulWidget {
  const AccountPage({super.key});

  @override
  State<AccountPage> createState() => AccountPageState();
}

class AccountPageState extends State<AccountPage> {
  final _userConfigService = locator.get<UserConfigService>();
  final _userAuthService = locator.get<UserAuthService>();
  final Avatar _chosenAvatar = Avatar();
  late UserModel? _curUser;

  @override
  void initState() {
    super.initState();
    _curUser = _userAuthService.curUser;
    _chosenAvatar.avatarURI = _curUser?.avatar ?? "";
  }

  void changeAvatar(ShopItem avatar) async {
    await _userConfigService.changeAvatar(context, avatar.id);
    setState(() {
      _chosenAvatar.avatarURI = avatar.imageUrl;
    });
  }

  getCurrentAvatar() {
    return ShopItem(
        id: "",
        name: "",
        type: ShopItemType.AVATAR,
        cost: 0,
        imageUrl: _curUser?.avatar ?? '');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Padding(
      padding: EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Row(
            children: [
              Padding(
                padding: EdgeInsets.only(right: 20.0),
                child: AvatarPicker(
                  onAvatarPicked: changeAvatar,
                  selectedAvatar: getCurrentAvatar(),
                ),
              ),
              Text(
                "Bienvenue ${_curUser?.username ?? " "}",
                style: TextStyle(fontSize: FontSize.xxl),
              ),
            ],
          ),
          SizedBox(height: 10.0),
          Expanded(
            child: Row(
              children: [
                Expanded(child: NotificationsBox()),
                SizedBox(width: 20),
                Expanded(child: FriendsBox()),
              ],
            ),
          ),
        ],
      ),
    ));
  }
}
