class SoundboardRequest {
  String sound;
  String room;

  SoundboardRequest({required this.sound, required this.room});

  factory SoundboardRequest.fromJson(Map<String, dynamic> json) =>
      SoundboardRequest(
        sound: json['sound'],
        room: json['room'],
      );

  Map<String, dynamic> toJson() {
    return {
      'sound': sound,
      'room': room,
    };
  }
}
