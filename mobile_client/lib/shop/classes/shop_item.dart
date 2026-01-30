import 'dart:core';

import 'package:mobile_client/shop/enum/shop_item_type.dart';

class ShopItem {
  final String id;
  final String name;
  final ShopItemType type;
  final int cost;
  final String imageUrl;
  final String? soundUrl;

  ShopItem({
    required this.id,
    required this.name,
    required this.type,
    required this.cost,
    required this.imageUrl,
    this.soundUrl,
  });

  factory ShopItem.fromJson(Map<String, dynamic> json) {
    return ShopItem(
      id: json['id'],
      name: json['name'],
      type: ShopItemType.values
          .firstWhere((e) => e.toString().split('.').last == json['type']),
      cost: json['cost'],
      imageUrl: json['imageUrl'] ?? '',
      soundUrl: json['soundUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type.name,
      'cost': cost,
      'imageUrl': imageUrl,
      'soundUrl': soundUrl,
    };
  }
}
