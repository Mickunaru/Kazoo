import 'package:flutter/material.dart';
import 'package:mobile_client/constants/styles/colors/constant_colors.dart';
import 'package:mobile_client/constants/styles/fonts/font_sizes.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/widgets/avatar/avatar_dialog.dart';

class AvatarPicker extends StatefulWidget {
  final Function(ShopItem) onAvatarPicked;
  final ShopItem? selectedAvatar;
  final bool? isCustomAvatarDisabled;
  const AvatarPicker(
      {super.key,
      required this.onAvatarPicked,
      this.selectedAvatar,
      this.isCustomAvatarDisabled});

  @override
  State<AvatarPicker> createState() => _AvatarPickerState();
}

class _AvatarPickerState extends State<AvatarPicker> {
  ShopItem? selectedAvatar;
  final _userAuthService = locator.get<UserAuthService>();

  @override
  initState() {
    super.initState();
    selectedAvatar = widget.selectedAvatar;
  }

  void openAvatarDialog() async {
    final avatar = await showDialog<ShopItem>(
      context: context,
      builder: (context) => AvatarDialog(
        isCustomAvatarDisabled: widget.isCustomAvatarDisabled ?? false,
      ),
    );

    if (avatar != null) {
      setState(() {
        selectedAvatar = avatar;
      });
      widget.onAvatarPicked(avatar);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: openAvatarDialog,
          child: Container(
            width: 130,
            height: 130,
            padding: EdgeInsets.all(4),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: cardColor,
            ),
            child: selectedAvatar?.imageUrl != null
                ? AspectRatio(
                    aspectRatio: 1,
                    child: FractionallySizedBox(
                      widthFactor: 1,
                      heightFactor: 1,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(100),
                        child: Image.network(
                          '${selectedAvatar!.imageUrl}?${DateTime.now().millisecondsSinceEpoch}',
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  )
                : Icon(
                    Icons.add,
                    size: 30,
                  ),
          ),
        ),
        if (_userAuthService.curUser != null)
        ElevatedButton(
            style: ElevatedButton.styleFrom(
                padding:
                    const EdgeInsets.symmetric(vertical: 7, horizontal: 10),
                backgroundColor: Theme.of(context).colorScheme.primary,
                disabledBackgroundColor: Theme.of(context).colorScheme.primary),
            onPressed: openAvatarDialog,
            child: Text("Modifier l'avatar",
                style: TextStyle(
                    fontSize: FontSize.s,
                color: Theme.of(context).colorScheme.surface,
                fontWeight: FontWeight.bold,
              ),
            ))
      ],
    );
  }
}
