import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:flutter_painter_v2/flutter_painter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:mobile_client/constants/enum/canvas_shape.dart';
import 'package:mobile_client/locator.dart';
import 'package:mobile_client/services/flutter_painter_service.dart';

class DrawingBoard extends StatefulWidget {
  final bool isReadOnly;
  final double width;
  final double height;
  final CanvasShape canvasShape;

  const DrawingBoard({
    super.key,
    this.isReadOnly = false,
    this.width = 675,
    this.height = 450,
    this.canvasShape = CanvasShape.rectangle,
  });

  @override
  State<DrawingBoard> createState() => _DrawingBoardState();
}

class _DrawingBoardState extends State<DrawingBoard> {
  final FlutterPainterService flutterPainterService =
      locator.get<FlutterPainterService>();

  late PainterController controller;
  OverlayEntry? colorPickerOverlay;
  OverlayEntry? brushSettingsOverlay;
  final double iconButtonSize = 25;

  @override
  void initState() {
    super.initState();
    controller = PainterController(
        settings: PainterSettings(
            freeStyle:
                FreeStyleSettings(strokeWidth: 3, mode: FreeStyleMode.draw)));
    flutterPainterService.setPainterController(controller);
  }

  @override
  void dispose() {
    super.dispose();
  }

  void showColorPicker(BuildContext context, Offset buttonPosition) {
    if (widget.isReadOnly) return;

    colorPickerOverlay = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: hideColorPicker,
              behavior: HitTestBehavior.opaque,
              child: Container(),
            ),
          ),
          Positioned(
            left: buttonPosition.dx + 10,
            top: buttonPosition.dy,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: EdgeInsets.all(10),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ColorPicker(
                      labelTypes: [],
                      colorPickerWidth: 200,
                      pickerColor: controller.freeStyleColor,
                      onColorChanged: changeColor,
                    ),
                    TextButton(onPressed: hideColorPicker, child: Text("OK")),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(colorPickerOverlay!);
  }

  void hideColorPicker() {
    colorPickerOverlay?.remove();
    colorPickerOverlay = null;
  }

  void showBrushSettings(BuildContext context, Offset buttonPosition) {
    if (widget.isReadOnly) return;

    brushSettingsOverlay = OverlayEntry(
      builder: (context) => Stack(
        children: [
          Positioned.fill(
            child: GestureDetector(
              onTap: hideBrushSettings,
              behavior: HitTestBehavior.opaque,
              child: Container(),
            ),
          ),
          Positioned(
            left: buttonPosition.dx + 10,
            top: buttonPosition.dy,
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                ),
                width: 300,
                child: StatefulBuilder(
                  builder: (context, state) {
                    return Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                            "Taille: ${flutterPainterService.brushSize.toInt()}"),
                        Slider(
                          value: flutterPainterService.brushSize,
                          min: 1.0,
                          max: 100.0,
                          onChanged: (value) {
                            state(() {
                              setBrushSize(value);
                            });
                          },
                        ),
                        TextButton(
                          onPressed: hideBrushSettings,
                          child: const Text("OK"),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
        ],
      ),
    );

    Overlay.of(context).insert(brushSettingsOverlay!);
  }

  void hideBrushSettings() {
    brushSettingsOverlay?.remove();
    brushSettingsOverlay = null;
  }

  void undo() => controller.undo();

  void clearBoard() => controller.clearDrawables();

  void toggleBrush() {
    controller.freeStyleMode = controller.freeStyleMode == FreeStyleMode.draw
        ? FreeStyleMode.none
        : FreeStyleMode.draw;
    controller.freeStyleStrokeWidth = flutterPainterService.brushSize;
  }

  void toggleEraser() {
    controller.freeStyleMode = controller.freeStyleMode == FreeStyleMode.erase
        ? FreeStyleMode.none
        : FreeStyleMode.erase;
    controller.freeStyleStrokeWidth = 30;
  }

  void setBrushSize(double value) {
    flutterPainterService.brushSize = value;
    controller.freeStyleStrokeWidth = value;
  }

  void changeColor(Color color) {
    controller.freeStyleColor = color;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ValueListenableBuilder(
          valueListenable: controller,
          builder: (context, _, __) => Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            elevation: 12,
            margin: const EdgeInsets.all(8.0),
            child: Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  GestureDetector(
                    onTapDown: widget.isReadOnly
                        ? null
                        : (details) =>
                            showColorPicker(context, details.globalPosition),
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: controller.freeStyleColor,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 12,
                  ),
                  GestureDetector(
                    onTapDown: widget.isReadOnly
                        ? null
                        : (details) =>
                            showBrushSettings(context, details.globalPosition),
                    child: SizedBox(
                      width: 30,
                      height: 30,
                      child: SvgPicture.asset(
                        'assets/images/ruler-svgrepo-com.svg',
                        width: iconButtonSize,
                        height: iconButtonSize,
                      ),
                    ),
                  ),
                  SizedBox(
                    height: 12,
                  ),
                  Container(
                    height: 2,
                    width: 40,
                    color: Colors.grey.shade300,
                  ),
                  IconButton(
                    icon: SvgPicture.asset(
                      'assets/images/brush-2-svgrepo-com.svg',
                      width: iconButtonSize,
                      height: iconButtonSize,
                      colorFilter:
                          controller.freeStyleMode == FreeStyleMode.draw
                              ? ColorFilter.mode(
                                  Theme.of(context).colorScheme.secondary,
                                  BlendMode.srcIn)
                              : null,
                    ),
                    onPressed: widget.isReadOnly ? null : toggleBrush,
                  ),
                  IconButton(
                    icon: SvgPicture.asset(
                      'assets/images/eraser-svgrepo-com.svg',
                      width: iconButtonSize,
                      height: iconButtonSize,
                      colorFilter:
                          controller.freeStyleMode == FreeStyleMode.erase
                              ? ColorFilter.mode(
                                  Theme.of(context).colorScheme.secondary,
                                  BlendMode.srcIn)
                              : null,
                    ),
                    onPressed: widget.isReadOnly ? null : toggleEraser,
                  ),
                  IconButton.filledTonal(
                    icon: Icon(Icons.undo, size: iconButtonSize),
                    onPressed: widget.isReadOnly ? null : undo,
                  ),
                  IconButton.filledTonal(
                    icon: Icon(Icons.delete, size: iconButtonSize),
                    onPressed: widget.isReadOnly ? null : clearBoard,
                  ),
                ],
              ),
            ),
          ),
        ),
        ClipRRect(
          borderRadius: widget.canvasShape == CanvasShape.circle
              ? BorderRadius.circular(1000)
              : BorderRadius.circular(10),
          child: Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              shape: widget.canvasShape == CanvasShape.circle
                  ? BoxShape.circle
                  : BoxShape.rectangle,
              border: Border.all(
                color: Theme.of(context).colorScheme.secondary,
                width: 4,
              ),
            ),
            child: FlutterPainter(controller: controller),
          ),
        )
      ],
    );
  }
}
