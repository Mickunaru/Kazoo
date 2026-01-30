class S3URL {
  final String url;

  S3URL({required this.url});

  factory S3URL.fromJson(Map<String, dynamic> json) {
    return S3URL(
      url: json['url'] as String,
    );
  }
}
