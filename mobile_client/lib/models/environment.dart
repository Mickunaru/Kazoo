import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class Environment {
  static String get fileName {
    if (kReleaseMode) {
      return '.env.production';
    }

    return '.env.development';
  }

  static String get apiKey {
    return dotenv.env['API_KEY'] ?? "API_KEY not specified";
  }

  static String get apiBaseUrl {
    return '${Environment.serverBaseUrl}/api';
  }

  static String get serverBaseUrl {
    if (kIsWeb) return '${dotenv.env['SERVER_BASE_URL_WEB']}';

    return '${dotenv.env['SERVER_BASE_URL']}';
  }

  static String get s3BucketUrl {
    return '${dotenv.env['S3_BUCKET_URL']}';
  }

  static bool get isDeveloperMode {
    return !kReleaseMode && dotenv.env['ENV'] != 'production';
  }
}
