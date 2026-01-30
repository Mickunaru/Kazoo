import 'package:flutter/material.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:mobile_client/models/game/player_drawing_answer.dart';
import 'package:mobile_client/utils/app_navigator.dart';

class PlayersDrawingsPopUp extends StatefulWidget {
  final List<PlayerDrawingAnswer> playersDrawings;
  const PlayersDrawingsPopUp({super.key, required this.playersDrawings});

  @override
  State<PlayersDrawingsPopUp> createState() => _PlayersDrawingsPopUpState();
}

class _PlayersDrawingsPopUpState extends State<PlayersDrawingsPopUp> {
  int currentIndex = 0;

  @override
  void initState() {
    super.initState();
  }

  PlayerDrawingAnswer? get currentDrawing {
    return widget.playersDrawings.isEmpty
        ? null
        : widget.playersDrawings[currentIndex];
  }

  void goToPrevious() {
    if (currentIndex > 0) {
      setState(() {
        currentIndex--;
      });
    }
  }

  void goToNext() {
    if (currentIndex < widget.playersDrawings.length - 1) {
      setState(() {
        currentIndex++;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      contentPadding: EdgeInsets.all(0),
      titlePadding: EdgeInsets.all(0),
      title: Container(
        padding: EdgeInsets.only(top: 4, right: 16, bottom: 0, left: 16),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text.rich(
              TextSpan(
                text: 'Par ',
                style: Theme.of(context).textTheme.headlineSmall,
                children: [
                  TextSpan(
                    text: currentDrawing?.name ?? '',
                    style: Theme.of(context)
                        .textTheme
                        .headlineSmall
                        ?.copyWith(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: Icon(Icons.close),
              onPressed: () => AppNavigator.pop(context),
            ),
          ],
        ),
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Divider(),
          currentDrawing == null
              ? CircularProgressIndicator()
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Container(
                    height: 500,
                    width: 750,
                    decoration: BoxDecoration(
                        border: Border.all(
                            color: Color.lerp(
                                Theme.of(context).colorScheme.secondary,
                                Colors.white,
                                0.63)!,
                            width: 4),
                        borderRadius: BorderRadius.circular(10)),
                    child: Image.network(
                      '${Environment.s3BucketUrl}${currentDrawing!.awsKey}',
                      fit: BoxFit.contain,
                      height: 500,
                      width: 750,
                    ),
                  ),
                ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.arrow_back),
                onPressed: goToPrevious,
                disabledColor: Colors.grey,
                splashColor: Colors.transparent,
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  '${currentIndex + 1}/${widget.playersDrawings.length}',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              IconButton(
                icon: Icon(Icons.arrow_forward),
                onPressed: goToNext,
                disabledColor: Colors.grey,
                splashColor: Colors.transparent,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
