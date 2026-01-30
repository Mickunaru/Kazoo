import 'dart:convert';
import 'dart:io';

import 'package:firebase_auth/firebase_auth.dart' as fb_auth;
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/enum/page_url.dart';
import 'package:mobile_client/constants/socket_events/auth_event.dart';
import 'package:mobile_client/constants/socket_events/friend_event.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/power_ups_count.dart';
import 'package:mobile_client/models/user_model.dart';
import 'package:mobile_client/services/firebase_messaging_service.dart';
import 'package:mobile_client/services/websocket_service.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class UserAuthService extends ChangeNotifier {
  final WebSocketService _webSocketService;
  final FirebaseMessagingService _firebaseMessagingService;

  UserAuthService(this._webSocketService, this._firebaseMessagingService);

  UserModel? _curUser;
  String? idToken;
  final String baseUrl = '${Environment.apiBaseUrl}/$usersEndpoint';
  final client = http.Client();
  final auth = fb_auth.FirebaseAuth.instance;

  UserModel? get curUser => _curUser;

  set curUser(UserModel? newUser) {
    if (_curUser != newUser) {
      _curUser = newUser;
      notifyListeners();
    }
  }

  Map<String, String> get headerAuthOptions =>
      {"Authorization": "Bearer $idToken"};

  void notifyUserHasChanged() {
    notifyListeners();
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    if (curUser != null || _webSocketService.isSocketConnected()) return;

    final responseSignedIn =
        await client.get(Uri.parse('$baseUrl/$isSignedInEndpoint/$username'));
    final isSignedIn = jsonDecode(responseSignedIn.body) as bool;

    if (isSignedIn) {
      throw Exception('Votre compte est actif sur un autre appareil.');
    }

    final user = await getUser(username);

    final credential = await auth.signInWithEmailAndPassword(
        email: user.email, password: password);
    idToken = await credential.user?.getIdToken();

    try {
      await _webSocketService.connect();
      _webSocketService.send(AuthEvent.userLogin.name, {
        'username': user.username,
        'uid': user.uid,
      });
      curUser = user;
      _updateFcmToken(_firebaseMessagingService.fCMToken);
    } catch (e) {
      await auth.signOut();
      _webSocketService.disconnect();
      _resetAuthInfo();
      throw Exception('Échec de la connexion. Veuillez réessayer plus tard.');
    }
  }

  Future<void> signUp(
      {required String email,
      required String password,
      required String username,
      required String avatar}) async {
    if (curUser != null || _webSocketService.isSocketConnected()) return;

    final usernameResponse =
        await client.get(Uri.parse('$baseUrl/$usernameEndpoint/$username'));
    if (usernameResponse.statusCode ~/ 100 != 2) {
      throw Exception("Échec de la création de compte.");
    }

    if (usernameResponse.body.isNotEmpty) {
      throw Exception("Nom d'utilisateur déjà pris");
    }

    final credential = await auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    idToken = await credential.user?.getIdToken();

    try {
      if (credential.user == null) {
        throw Exception('Échec de la création de compte.');
      }

      final newUser = UserModel(
        email: email,
        username: username,
        avatar: avatar,
        friendsIds: [],
        uid: credential.user!.uid,
        powerUpsCount: PowerUpsCount(
            tricheur: 0, vitesse: 0, confusion: 0, surge: 0, tornade: 0),
        vanityItems: [],
        currency: 0,
      );

      await client.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(newUser.toJson()),
      );
      await _webSocketService.connect();
      _webSocketService.send(AuthEvent.userLogin.name, {
        'username': newUser.username,
        'uid': newUser.uid,
        'imageUrl': newUser.avatar,
      });
      curUser = newUser;
      _updateFcmToken(_firebaseMessagingService.fCMToken);
    } catch (error) {
      if (credential.user != null) {
        try {
          _webSocketService.disconnect();
          await credential.user!.delete();
        } catch (error) {
          debugPrint(error.toString());
        }
      }
      _resetAuthInfo();
      debugPrint(error.toString());
      throw Exception('Échec de la création de compte.');
    }
    _webSocketService.send(FriendEvent.newUser.name, username);
  }

  Future<void> updateUser() async {
    if (curUser != null) {
      curUser = await getUser(curUser!.username);
    }
  }

  Future<UserModel> getUser(String username) async {
    final response =
        await client.get(Uri.parse('$baseUrl/$usernameEndpoint/$username'));

    if (response.statusCode == HttpStatus.notFound) {
      throw Exception("Aucun compte trouvé avec ce nom d'utilisateur.");
    }

    return UserModel.fromJson(jsonDecode(response.body));
  }

  Future<void> signOutAndRedirect(BuildContext context) async {
    await signOut();
    if (context.mounted) {
      AppNavigator.go("/${PageUrl.login.name}");
    }
  }

  Future<void> signOut() async {
    if (curUser == null || !_webSocketService.isSocketConnected()) return;
    try {
      await auth.signOut();
      _updateFcmToken("");
      _webSocketService.disconnect();
    } catch (error) {
      debugPrint(error.toString());
    }
    _resetAuthInfo();
  }

  Future<void> updateUsername(String username) async {
    if (curUser == null) return;
    try {
      final updatedUser = {
        ...curUser!.toJson(),
        'username': username,
      };

      await client.put(
        Uri.parse('$baseUrl/${curUser!.uid}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(updatedUser),
      );
      curUser = UserModel.fromJson(updatedUser);
    } catch (error) {
      debugPrint(error.toString());
      throw Exception('Échec de la mise à jour du pseudonyme.');
    }
  }

  void updateCurrency(int currency) {
    if (curUser != null) {
      curUser!.currency = currency;
    }
    notifyListeners();
  }

  void _resetAuthInfo() {
    curUser = null;
    idToken = null;
  }

  Future<void> _updateFcmToken(String? token) async {
    if (token == null) return;
    await client.put(Uri.parse('$baseUrl/$fcmTokenEndpoint'),
        headers: {
          ...headerAuthOptions,
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'fcmToken': token}));
  }
}
