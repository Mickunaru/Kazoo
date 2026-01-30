import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:mobile_client/constants/endpoint_constants.dart';
import 'package:mobile_client/constants/enum/s3_crud.dart';
import 'package:mobile_client/models/environment.dart';

import 'user_auth_service.dart';

class S3Service {
  final String _baseUrl = '${Environment.apiBaseUrl}/$s3Endpoint';
  final UserAuthService userAuthService;

  S3Service(this.userAuthService);

  Future<void> uploadLocalImage(String localImagePath, String awsKey) async {
    final signedURL = await _getSignedURL(S3Crud.put.name, awsKey);
    final imageBytes = await _getImageAsBinary(localImagePath);
    final headers = {'Content-Type': 'image/png'};

    final response = await http.put(
      Uri.parse(signedURL),
      headers: headers,
      body: imageBytes,
    );

    if (response.statusCode ~/ 100 != 2) {
      throw Exception("Échec du téléchargement de l'image");
    }
  }

  Future<void> uploadBlobImage(Uint8List imageBytes, String awsKey) async {
    final signedURL = await _getSignedURL(S3Crud.put.name, awsKey);
    final headers = {'Content-Type': 'image/png'};

    final response = await http.put(
      Uri.parse(signedURL),
      headers: headers,
      body: imageBytes,
    );

    if (response.statusCode ~/ 100 != 2) {
      throw Exception("Échec du téléchargement de l'image");
    }
  }

  Future<void> deleteImage(String awsKey) async {
    final signedURL = await _getSignedURL(S3Crud.delete.name, awsKey);
    final response = await http.delete(Uri.parse(signedURL));

    if (response.statusCode ~/ 100 != 2) {
      throw Exception("Échec de la suppression de l'image");
    }
  }

  Future<Uint8List> _getImageAsBinary(String path) async {
    return (await rootBundle.load(path)).buffer.asUint8List();
  }

  Future<String> _getSignedURL(String operation, String key) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/$operation/$key'),
      headers: userAuthService.headerAuthOptions,
    );

    if (response.statusCode ~/ 100 != 2) {
      throw Exception('Échec de l’obtention de l’URL signée');
    }

    final data = jsonDecode(response.body);
    return data['url'];
  }

  // I know it's not good practice to leave dead code But I think it's really important to leave this
  // as an example of how it to interact with the s3 service it might even help with future debugging.
  // Future<void> testUpload() async {
  //   print('Current Directory: ${Directory.current.path}');

  //   const String localFilePath = 'assets/images/tim.png';
  //   const String awsKey = 'tim.png';

  //   try {
  //     await uploadImage(localFilePath, awsKey);
  //     // deleteImage(awsKey);

  //     print('Image uploaded successfully!');
  //   } catch (e) {
  //     print('Error uploading image: $e');
  //   }
  // }
}
