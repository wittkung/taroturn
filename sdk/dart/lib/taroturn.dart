import 'dart:ffi' as ffi;
import 'dart:convert';
import 'package:ffi/ffi.dart';

typedef TaroturnVersionC = ffi.Pointer<Utf8> Function();
typedef TaroturnVersionDart = ffi.Pointer<Utf8> Function();

typedef TaroturnGenerateSeedC = ffi.Int32 Function(ffi.Pointer<Utf8> outBuf, ffi.Size bufLen);
typedef TaroturnGenerateSeedDart = int Function(ffi.Pointer<Utf8> outBuf, int bufLen);

typedef TaroturnDrawSessionJsonC = ffi.Int32 Function(
    ffi.Pointer<Utf8> spreadId,
    ffi.Pointer<Utf8> question,
    ffi.Pointer<Utf8> seedHex,
    ffi.Float reversalRate,
    ffi.Pointer<ffi.Pointer<Utf8>> outJson);
typedef TaroturnDrawSessionJsonDart = int Function(
    ffi.Pointer<Utf8> spreadId,
    ffi.Pointer<Utf8> question,
    ffi.Pointer<Utf8> seedHex,
    double reversalRate,
    ffi.Pointer<ffi.Pointer<Utf8>> outJson);

typedef TaroturnFreeStringC = ffi.Void Function(ffi.Pointer<Utf8> ptr);
typedef TaroturnFreeStringDart = void Function(ffi.Pointer<Utf8> ptr);

class TarotEngine {
  late final ffi.DynamicLibrary _dylib;
  late final TaroturnVersionDart _version;
  late final TaroturnGenerateSeedDart _generateSeed;
  late final TaroturnDrawSessionJsonDart _drawSessionJson;
  late final TaroturnFreeStringDart _freeString;

  TarotEngine(String dynamicLibPath) {
    _dylib = ffi.DynamicLibrary.open(dynamicLibPath);
    _version = _dylib.lookupFunction<TaroturnVersionC, TaroturnVersionDart>('taroturn_version');
    _generateSeed = _dylib.lookupFunction<TaroturnGenerateSeedC, TaroturnGenerateSeedDart>('taroturn_generate_seed');
    _drawSessionJson = _dylib.lookupFunction<TaroturnDrawSessionJsonC, TaroturnDrawSessionJsonDart>('taroturn_draw_session_json');
    _freeString = _dylib.lookupFunction<TaroturnFreeStringC, TaroturnFreeStringDart>('taroturn_free_string');
  }

  String get version => _version().toDartString();

  String drawSessionJson({
    String spreadId = 'three_cards_time',
    String? question,
    String? seedHex,
    double reversalRate = 0.5,
  }) {
    final cSpread = spreadId.toNativeUtf8();
    final cQuestion = question != null ? question.toNativeUtf8() : ffi.nullptr;
    final cSeed = seedHex != null ? seedHex.toNativeUtf8() : ffi.nullptr;
    final outPtr = calloc<ffi.Pointer<Utf8>>();

    try {
      final rc = _drawSessionJson(cSpread, cQuestion.cast(), cSeed.cast(), reversalRate, outPtr);
      if (rc != 0 || outPtr.value == ffi.nullptr) {
        throw Exception('Failed to draw tarot session: rc=$rc');
      }
      final jsonString = outPtr.value.toDartString();
      _freeString(outPtr.value);
      return jsonString;
    } finally {
      calloc.free(cSpread);
      if (cQuestion != ffi.nullptr) calloc.free(cQuestion);
      if (cSeed != ffi.nullptr) calloc.free(cSeed);
      calloc.free(outPtr);
    }
  }
}
