import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/shop/shop_widgets/.shop_ui_params.dart';

class VanityItemShowcase extends StatefulWidget {
  final ShopItem item;
  const VanityItemShowcase({super.key, required this.item});

  @override
  State<VanityItemShowcase> createState() => _VanityItemShowcaseState();
}

class _VanityItemShowcaseState extends State<VanityItemShowcase> {
  final _shopService = locator.get<ShopService>();
  late bool _isOwned;

  @override
  void initState() {
    super.initState();
    _isOwned = _shopService.isOwned(widget.item.name);
    _shopService.addListener(_updateOwnedStatus);
  }

  void _updateOwnedStatus() {
    setState(() {
      _isOwned = _shopService.isOwned(widget.item.name);
    });
  }

  @override
  void dispose() {
    _shopService.removeListener(_updateOwnedStatus);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(
          widget.item.name,
          style: TextStyle(
            fontSize: itemNameFontSize,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: 90,
          height: 90,
          decoration: BoxDecoration(
            border: shopItemBorder.border,
            borderRadius: BorderRadius.circular(12),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: ColorFiltered(
              colorFilter: _isOwned
                  ? const ColorFilter.mode(Colors.grey, BlendMode.saturation)
                  : const ColorFilter.mode(
                      Colors.transparent, BlendMode.multiply),
              child: Image.network(
                widget.item.imageUrl.isNotEmpty
                    ? widget.item.imageUrl
                    : shopPlaceHolder,
                fit: BoxFit.cover,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Theme.of(context).colorScheme.primary,
            foregroundColor: Theme.of(context).colorScheme.onPrimary,
            iconColor: Theme.of(context).colorScheme.onPrimary,
          ),
          onPressed: _isOwned
              ? null
              : () => _shopService.buySelectedItem(context, widget.item.id),
          child: Row(
            mainAxisSize: shopButtonSize,
            children: [
              Text(
                widget.item.cost.toString(),
                style: TextStyle(fontSize: ShopbuttonTextSize),
              ),
              SizedBox(width: 10),
              const Icon(Icons.paid),
            ],
          ),
        ),
      ],
    );
  }
}
