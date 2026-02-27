// AudioRecorderService
// Dart wrapper for the native Android MediaRecorder platform channel.
// Path is generated on the Android side (cacheDir) — no path_provider needed.

import 'package:flutter/services.dart';

class AudioRecorderService {
  static const _channel = MethodChannel('com.arthsetu/audio_recorder');
  String? _currentPath;

  /// Start recording. Kotlin generates the path and returns it.
  Future<String?> startRecording() async {
    final path = await _channel.invokeMethod<String>('startRecording');
    _currentPath = path;
    return path;
  }

  /// Stop recording. Returns the path of the saved audio file.
  Future<String?> stopRecording() async {
    final path = await _channel.invokeMethod<String>('stopRecording');
    _currentPath = null;
    return path;
  }
}
