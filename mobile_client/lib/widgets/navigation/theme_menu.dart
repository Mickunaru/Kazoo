import 'package:flutter/material.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/theme/theme_config_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/widgets/navigation/default_theme.dart';

class ThemeMenu extends StatefulWidget {
  const ThemeMenu({super.key});

  @override
  State<ThemeMenu> createState() => _ThemeMenuState();
}

class _ThemeMenuState extends State<ThemeMenu> {
  final _shopService = locator.get<ShopService>();
  final themeService = locator.get<ThemeService>();
  List<ShopItem> ownedThemes = [];
  late Future<List<ShopItem>> _shopItemsFuture;

  @override
  initState() {
    super.initState();
    _shopItemsFuture = _shopService.getShopItems();
    _shopService.addListener(_updateThemes);
  }

  void _updateThemes() {
    setState(() {
      ownedThemes = [defaultTheme, ..._shopService.ownedThemes];
    });
  }

  @override
  void dispose() {
    _shopService.removeListener(_updateThemes);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: Icon(
        Icons.palette,
        color: Theme.of(context).colorScheme.onPrimary,
      ),
      onSelected: (selectedTheme) {
        themeService.setTheme(selectedTheme);
      },
      itemBuilder: (context) {
        return [
          PopupMenuItem(
            enabled: false,
            child: FutureBuilder<List<ShopItem>>(
              future: _shopItemsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return SizedBox(
                      height: 20,
                      width: 20,
                      child: Center(child: CircularProgressIndicator()));
                } else if (snapshot.hasError) {
                  return Text(
                    'Erreur de chargement',
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.error),
                  );
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Text('Aucun thème disponible');
                }
                return Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: ownedThemes
                      .map((theme) => PopupMenuItem<String>(
                            value: theme.name,
                            child: Text(theme.name),
                          ))
                      .toList(),
                );
              },
            ),
          ),
        ];
      },
    );
  }
}
