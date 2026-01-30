import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/s3_url.dart';
import 'package:mobile_client/services/user_auth_service.dart';

class UserConfigService extends ChangeNotifier {
  final UserAuthService _userAuthService;
  final String _baseUrl = '${Environment.apiBaseUrl}/$usersEndpoint';

  UserConfigService(this._userAuthService);

  Future<void> changeAvatar(context, String id) async {
    try {
      final response = await http.put(
        Uri.parse(getAvatarPath(id)),
        headers: _userAuthService.headerAuthOptions,
      );

      if (response.statusCode ~/ 100 == 2) {
        final S3URL newAvatar = S3URL.fromJson(jsonDecode(response.body));
        if (_userAuthService.curUser != null) {
          _userAuthService.curUser?.avatar = newAvatar.url;
          _userAuthService.notifyUserHasChanged();
          notifyListeners();
        }
      } else {
        showSnackBar(context, "Échec de mise à jour de l'avatar ");
      }
    } catch (error) {
      showSnackBar(
          context, "Erreur en mettant à jour l'avatar: ${error.toString()}");
    }
  }

  getAvatarPath(String id) {
    return id.isNotEmpty
        ? "$_baseUrl/$avatarEndpoint/$id"
        : "$_baseUrl/$customAvatarEndpoint";
  }

  Future<void> changeDrawnAvatar(String id) async {
    throw UnimplementedError("Method not implemented. ID: $id");
  }

  Future<void> changeTheme(String id) async {
    throw UnimplementedError("Method not implemented. ID: $id");
  }

  void showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }
}
