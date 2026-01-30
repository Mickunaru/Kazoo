import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/models/environment.dart';

class RandomGameService {
  final String _baseUrl = '${Environment.apiBaseUrl}/$randomGameEndpoint';

  Future<bool> hasEnoughQuestionsForRandomGame(int questionCountNeeded) async {
    try {
      final Uri uri = Uri.parse('$_baseUrl/$gameAvailabilityEndPoint')
          .replace(queryParameters: {'count': questionCountNeeded.toString()});

      final response = await http.get(uri);

      if (response.statusCode ~/ 100 == 2) {
        return json.decode(response.body) as bool;
      } else {
        throw Exception(
            'Failed to check game availability: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error checking game availability: $e');
    }
  }
}
