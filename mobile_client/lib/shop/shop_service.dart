import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/errors/message_exception.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/user_model.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/enum/power_up_type.dart';
import 'package:mobile_client/shop/enum/shop_item_type.dart';
import 'package:mobile_client/widgets/snackbar.dart';

class ShopService extends ChangeNotifier {
  late List<ShopItem> fetchedItems = [];
  final String _baseUrl = '${Environment.apiBaseUrl}/$shopEndPoint';
  final UserAuthService _userAuthService;
  bool isBuyingItem = false;

  ShopService(this._userAuthService);

  List<ShopItem> get powerUps =>
      fetchedItems.where((item) => item.type == ShopItemType.POWER_UP).toList();

  List<ShopItem> get vanityItems =>
      fetchedItems.where((item) => item.type != ShopItemType.POWER_UP).toList();

  List<ShopItem> get ownedAvatars => fetchedItems
      .where((item) => item.type == ShopItemType.AVATAR && isOwned(item.name))
      .toList();

  List<ShopItem> get ownedThemes => fetchedItems
      .where((item) => item.type == ShopItemType.THEME && isOwned(item.name))
      .toList();

  void decreaseAmount(PowerUpType powerUpType) {
    final user = _userAuthService.curUser;
    if (user == null) return;

    switch (powerUpType) {
      case PowerUpType.tricheur:
        user.powerUpsCount = user.powerUpsCount
            .copyWith(tricheur: user.powerUpsCount.tricheur - 1);
        break;
      case PowerUpType.vitesse:
        user.powerUpsCount = user.powerUpsCount
            .copyWith(vitesse: user.powerUpsCount.vitesse - 1);
        break;
      case PowerUpType.confusion:
        user.powerUpsCount = user.powerUpsCount
            .copyWith(confusion: user.powerUpsCount.confusion - 1);
        break;
      case PowerUpType.surge:
        user.powerUpsCount =
            user.powerUpsCount.copyWith(surge: user.powerUpsCount.surge - 1);
        break;
      case PowerUpType.tornade:
        user.powerUpsCount = user.powerUpsCount
            .copyWith(tornade: user.powerUpsCount.tornade - 1);
        break;
    }
  }

  Future<List<ShopItem>> getShopItems() async {
    try {
      final response = await http.get(Uri.parse(_baseUrl));
      if (response.statusCode ~/ 100 == 2) {
        List<dynamic> jsonData = jsonDecode(response.body);
        fetchedItems = jsonData.map((item) => ShopItem.fromJson(item)).toList();
        notifyListeners();
        return fetchedItems;
      } else {
        throw Exception("Failed to load shop items");
      }
    } catch (e) {
      throw Exception("Error fetching shop items: $e");
    }
  }

  bool isOwned(String name) {
    return _userAuthService.curUser?.vanityItems.contains(name) ?? false;
  }

  Future<void> buySelectedItem(context, String id) async {
    if (isBuyingItem) return;
    isBuyingItem = true;
    try {
      UserModel updatedUserInfo = await buyItem(id);
      _userAuthService.curUser = updatedUserInfo;
      notifyListeners();
      showCustomSnackBar(message: "Item acheté", context: context);
    } catch (error) {
      showCustomSnackBar(message: error.toString(), context: context);
    } finally {
      isBuyingItem = false;
    }
  }

  Future<UserModel> buyItem(String id) async {
    final response = await http.put(Uri.parse("$_baseUrl/$id"),
        headers: _userAuthService.headerAuthOptions);
    if (response.statusCode ~/ 100 == 2) {
      return UserModel.fromJson(jsonDecode(response.body));
    } else if (response.statusCode == HttpStatus.unauthorized) {
      throw MessageException(
          "Vous n'avez pas assez d'argent pour l'achat de l'item");
    } else {
      throw MessageException(
          "Une erreur est survenu lors de l'achat de l'item");
    }
  }

  getPowerUpCount(String name) {
    if (!PowerUpType.values.map((e) => e.name).contains(name)) {
      return 0;
    }

    switch (PowerUpType.values.byName(name)) {
      case PowerUpType.tricheur:
        return _userAuthService.curUser?.powerUpsCount.tricheur;
      case PowerUpType.vitesse:
        return _userAuthService.curUser?.powerUpsCount.vitesse;
      case PowerUpType.confusion:
        return _userAuthService.curUser?.powerUpsCount.confusion;
      case PowerUpType.surge:
        return _userAuthService.curUser?.powerUpsCount.surge;
      case PowerUpType.tornade:
        return _userAuthService.curUser?.powerUpsCount.tornade;
    }
  }
}
