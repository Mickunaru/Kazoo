import 'package:flutter/material.dart';

class ImageViewer extends StatelessWidget {
  final String imageUrl;
  const ImageViewer({super.key, required this.imageUrl});

  void _showImageDialog(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (BuildContext context) {
        return GestureDetector(
          onTap: () {
            Navigator.of(context).pop();
          },
          child: Scaffold(
            backgroundColor: Colors.black54,
            body: Center(
              child: GestureDetector(
                onTap: () {},
                child: Container(
                  constraints: BoxConstraints(
                    maxHeight: 600,
                    maxWidth: 1000,
                  ),
                  child: InteractiveViewer(
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showImageDialog(context, imageUrl),
      child: Image.network(
        imageUrl,
        fit: BoxFit.cover,
      ),
    );
  }
}
