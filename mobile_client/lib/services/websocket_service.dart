import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile_client/models/environment.dart';
import 'package:socket_io_client/socket_io_client.dart' as socket_io_client;

class WebSocketService {
  socket_io_client.Socket? _socket;
  Completer<void>? _connectionCompleter;

  final StreamController<void> _connectionEvent =
      StreamController<void>.broadcast();

  // Useful to notify a part of the app that a connection is established:
  Stream<void> get connectionEventStream => _connectionEvent.stream;

  String? get id => _socket?.id;

  bool isSocketConnected() {
    return _socket?.connected ?? false;
  }

  // Connect to the WebSocket server
  Future<void> connect() async {
    if (_connectionCompleter != null && !_connectionCompleter!.isCompleted) {
      return _connectionCompleter!.future;
    }

    _connectionCompleter = Completer<void>();

    if (!isSocketConnected()) {
      _socket = socket_io_client.io(
          Environment.serverBaseUrl,
          socket_io_client.OptionBuilder()
              .setTransports(['websocket'])
              .disableAutoConnect()
              .build());

      // Connection acknowledgment
      _socket!.onConnect((_) {
        _connectionEvent.add(null);
        if (!_connectionCompleter!.isCompleted) {
          _connectionCompleter!.complete();
        }
      });

      _socket!.onConnectError((error) {
        debugPrint('Connection error: $error');
        if (!_connectionCompleter!.isCompleted) {
          _connectionCompleter!.completeError(error);
        }
      });

      _socket!.connect();
    } else {
      _connectionCompleter!.complete();
    }

    return _connectionCompleter!.future;
  }

  // Disconnect from the WebSocket server
  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket?.clearListeners();
    _connectionCompleter = null;
  }

  // Remove all listeners for a specific event
  void removeAllListeners(String event) {
    _socket?.off(event);
  }

  // Listen to an event
  void on<T>(String event, void Function(T data) action) {
    _socket!.on(event, (data) => action(data as T));
  }

  // Listen to an event only once
  void once<T>(String event, void Function(T? data) action) {
    _socket!.once(event, (data) => action(data as T?));
  }

  // Send an event with optional data
  void send<T>(String event, [T? data]) {
    debugPrint(_socket.toString());
    _socket!.emit(event, data);
  }

  // Send an event and wait for acknowledgment
  Future<U> sendWithAck<T, U>(String event, [T? data]) {
    final completer = Completer<U>();
    _socket!.emitWithAck(event, data, ack: (response) {
      completer.complete(response as U);
    });
    return completer.future;
  }
}
