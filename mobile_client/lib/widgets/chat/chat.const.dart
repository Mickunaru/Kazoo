import 'package:flutter/material.dart';
import 'package:mobile_client/models/sound_board_element.dart';

const String chatWindowTitle = 'Clavardage';

final List<SoundboardElement> soundboardElements = [
  SoundboardElement(
    name: 'Victoire!',
    url:
        'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/celebrate.mp3',
    icon: Icons.celebration,
  ),
  SoundboardElement(
    name: 'Bruh',
    url: 'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/bruh.mp3',
    icon: Icons.sentiment_neutral,
  ),
  SoundboardElement(
    name: 'Cloche',
    url:
        'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/cloche.mp3',
    icon: Icons.notifications,
  ),
];

const String chatNotificationSound =
    'https://kazooteam.s3.ca-central-1.amazonaws.com/soundboard/chatNotificationSound.mp3';
