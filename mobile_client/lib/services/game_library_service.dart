import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/enum/game_visibility.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/game.dart';
import 'package:mobile_client/models/game_visibility_dto.dart';
import 'package:mobile_client/services/user_auth_service.dart';

class GameLibraryService {
  final String _gameLibraryBaseURL =
      '${Environment.apiBaseUrl}/$gameLibraryEndpoint';
  List<Game> publicGames = [];

  final UserAuthService _userAuthService;
  GameLibraryService(this._userAuthService);

  Future<void> updatePublicGames() async {
    final response = await http.get(
        Uri.parse(
          '$_gameLibraryBaseURL/$publicGamesEndpoint',
        ),
        headers: _userAuthService.headerAuthOptions);
    if (response.statusCode ~/ 100 == 2) {
      publicGames = (jsonDecode(response.body) as List)
          .map((game) => Game.fromJson(game))
          .toList();
    } else {
      throw Exception('Failed to load public games');
    }
  }

  Future<GameVisibility> getGameVisibility(String id) async {
    final response = await http.get(
        Uri.parse('$_gameLibraryBaseURL/$gameVisibilityEndpoint/$id'),
        headers: _userAuthService.headerAuthOptions);

    if (response.statusCode ~/ 100 == 2) {
      final Map<String, dynamic> data = jsonDecode(response.body);
      return GameVisibilityDto.fromJson(data).visibility;
    }
    throw Exception("Failed to get game visibility: ${response.body}");
  }
}
