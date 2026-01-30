import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/enum/avatar_dialog_step.dart';
import 'package:mobile_client/constants/enum/canvas_shape.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/services/flutter_painter_service.dart';
import 'package:mobile_client/services/s3_service.dart';
import 'package:mobile_client/services/user_auth_service.dart';
import 'package:mobile_client/shop/classes/shop_item.dart';
import 'package:mobile_client/shop/enum/shop_item_type.dart';
import 'package:mobile_client/shop/shop_service.dart';
import 'package:mobile_client/widgets/avatar/default_avatars.dart';
import 'package:mobile_client/widgets/drawing/drawing_board.dart';

class AvatarDialog extends StatefulWidget {
  final bool isCustomAvatarDisabled;
  const AvatarDialog({super.key, required this.isCustomAvatarDisabled});

  @override
  State<AvatarDialog> createState() => _AvatarDialogState();
}

class _AvatarDialogState extends State<AvatarDialog> {
  final _shopServiceState = locator.get<ShopService>();
  final _s3Service = locator.get<S3Service>();
  final _userAuthService = locator.get<UserAuthService>();
  final flutterPainterService = locator.get<FlutterPainterService>();
  ShopItem? selectedAvatar;
  List<ShopItem> avatarPreset = [];
  final ImagePicker _imagePicker = ImagePicker();
  AvatarDialogStep _currentStep = AvatarDialogStep.pickAvatar;

  void _goToDrawAvatar() {
    setState(() {
      _currentStep = AvatarDialogStep.drawAvatar;
    });
  }

  void _goBack() {
    setState(() {
      _currentStep = AvatarDialogStep.pickAvatar;
    });
  }

  @override
  void initState() {
    super.initState();
    avatarPreset = [...defaultAvatarItems, ..._shopServiceState.ownedAvatars];
  }

  void selectAvatar(ShopItem avatar) {
    setState(() {
      selectedAvatar = avatar;
    });
  }

  Future<void> onConfirm() async {
    if (_currentStep == AvatarDialogStep.drawAvatar) {
      await savePaint();
    }
    if (mounted) {
      Navigator.of(context).pop(selectedAvatar);
    }
  }

  Future<void> onCameraSelected() async {
    final XFile? image =
        await _imagePicker.pickImage(source: ImageSource.camera);
    if (image != null && _userAuthService.curUser != null) {
      final File photo = File(image.path);
      final blob = await photo.readAsBytes();
      await _setCustomAvatar(blob);
      onConfirm();
    }
  }

  Future<void> savePaint() async {
    final blob = await flutterPainterService.getDrawingBlob();
    if (blob == null) return;
    await _setCustomAvatar(blob);
  }

  Future<void> _setCustomAvatar(Uint8List blob) async {
    final awsKey =
        "$customAvatarEndpoint/${_userAuthService.curUser!.username}.png";
    await _s3Service.uploadBlobImage(blob, awsKey);
    selectAvatar(ShopItem(
        id: '',
        name: '',
        type: ShopItemType.AVATAR,
        cost: 0,
        imageUrl: "${Environment.s3BucketUrl}$awsKey"));
  }

  Widget _buildAvatarPicker() {
    return SizedBox(
      width: MediaQuery.of(context).size.width / 2,
      height: MediaQuery.of(context).size.height / 2,
      child: GridView.count(crossAxisCount: 4, children: [
        if (!widget.isCustomAvatarDisabled) ...[
          InkWell(
            borderRadius: BorderRadius.circular(200),
            onTap: onCameraSelected,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(200),
                ),
                child: Center(
                  child:
                      Icon(Icons.camera_alt, size: 30, color: Colors.grey[800]),
                ),
              ),
            ),
          ),
          InkWell(
            borderRadius: BorderRadius.circular(200),
            onTap: _goToDrawAvatar,
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(200),
                ),
                child: Center(
                  child: Icon(Icons.draw_outlined,
                      size: 30, color: Colors.grey[800]),
                ),
              ),
            ),
          )
        ],
        ...avatarPreset.map((avatar) {
          return InkWell(
            borderRadius: BorderRadius.circular(200),
            onTap: () => selectAvatar(avatar),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: avatar == selectedAvatar
                        ? Theme.of(context).primaryColor
                        : Colors.transparent,
                    width: 3,
                  ),
                  borderRadius: BorderRadius.circular(200),
                ),
                child: ClipOval(
                  child: Image.network(
                    avatar.imageUrl,
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
          );
        })
      ]),
    );
  }

  Widget _buildDrawAvatar() {
    return SizedBox(
        width: MediaQuery.of(context).size.width / 2,
        height: MediaQuery.of(context).size.height / 2,
        child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            DrawingBoard(
              width: 350,
              height: 350,
              isReadOnly: false,
              canvasShape: CanvasShape.circle,
            ),
            SizedBox(
              width: 60,
            )
          ],
        ));
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AppBar(
            leading: _currentStep == AvatarDialogStep.pickAvatar
                ? null
                : IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: _goBack,
                  ),
            automaticallyImplyLeading: false,
            title: Text(
              _currentStep == AvatarDialogStep.pickAvatar
                  ? 'Choisissez un avatar'
                  : 'Dessinez votre avatar',
              style: TextStyle(fontSize: 32),
            ),
          ),
          _currentStep == AvatarDialogStep.pickAvatar
              ? _buildAvatarPicker()
              : _buildDrawAvatar()
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text('Annuler', style: TextStyle(color: Colors.black)),
        ),
        TextButton(
          onPressed: onConfirm,
          child: Text('Confirmer', style: TextStyle(color: Colors.black)),
        ),
      ],
    );
  }
}
