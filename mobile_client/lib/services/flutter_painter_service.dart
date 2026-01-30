import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_painter_v2/flutter_painter.dart';

class FlutterPainterService {
  PainterController? _controller;
  double brushSize = 3;

  void setPainterController(PainterController? controller) {
    _controller = controller;
  }

  Future<Uint8List?> getDrawingBlob() async {
    if (_controller == null) return null;

    ui.Image image = await _controller!.renderImage(Size(840, 560));
    ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
    return byteData?.buffer.asUint8List();
  }

  resetControllerSettings() {
    if (_controller != null) {
      _controller!.freeStyleColor = Colors.black;
      _controller!.freeStyleMode = FreeStyleMode.draw;
      _controller!.freeStyleStrokeWidth = 3;
      _controller!.clearDrawables();
    }
  }
}
