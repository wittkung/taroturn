"""
Taroturn Python SDK
Python bindings for the Taroturn universal Tarot microkernel.
"""

import ctypes
import json
import os
import sys
from typing import Optional, Dict, Any, List


def _load_taroturn_lib():
    # Find compiled libtaroturn.dylib / libtaroturn.so / taroturn.dll
    lib_names = ["libtaroturn_core.dylib", "libtaroturn_core.so", "taroturn_core.dll", "libtaroturn.dylib", "libtaroturn.so"]
    search_paths = [
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "target", "release"),
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "target", "debug"),
        os.path.join(os.path.dirname(__file__), "..", "..", "target", "release"),
        os.path.join(os.path.dirname(__file__), "..", "..", "target", "debug"),
        os.path.join(os.path.dirname(__file__), "lib"),
        "/usr/local/lib",
        "/usr/lib",
    ]
    for path in search_paths:
        for name in lib_names:
            full_path = os.path.abspath(os.path.join(path, name))
            if os.path.exists(full_path):
                try:
                    return ctypes.CDLL(full_path)
                except Exception:
                    pass
    return None


_lib = _load_taroturn_lib()
if _lib:
    _lib.taroturn_version.restype = ctypes.c_char_p
    _lib.taroturn_generate_seed.argtypes = [ctypes.c_char_p, ctypes.c_size_t]
    _lib.taroturn_generate_seed.restype = ctypes.c_int32

    _lib.taroturn_draw_session_json.argtypes = [
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.c_float,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.taroturn_draw_session_json.restype = ctypes.c_int32

    _lib.taroturn_get_card_json.argtypes = [ctypes.c_uint8, ctypes.POINTER(ctypes.c_char_p)]
    _lib.taroturn_get_card_json.restype = ctypes.c_int32

    _lib.taroturn_list_spreads_json.argtypes = [ctypes.POINTER(ctypes.c_char_p)]
    _lib.taroturn_list_spreads_json.restype = ctypes.c_int32

    _lib.taroturn_free_string.argtypes = [ctypes.c_char_p]
    _lib.taroturn_free_string.restype = None


class TarotEngine:
    @staticmethod
    def version() -> str:
        if not _lib:
            return "0.1.0-pure"
        return _lib.taroturn_version().decode("utf-8")

    @staticmethod
    def generate_seed() -> str:
        if not _lib:
            import secrets
            return secrets.token_hex(32)
        buf = ctypes.create_string_buffer(65)
        rc = _lib.taroturn_generate_seed(buf, 65)
        if rc != 0:
            raise RuntimeError(f"taroturn_generate_seed failed with code {rc}")
        return buf.value.decode("utf-8")

    @staticmethod
    def draw_session(
        spread_id: str = "three_cards_time",
        question: Optional[str] = None,
        seed_hex: Optional[str] = None,
        reversal_rate: float = 0.5,
    ) -> Dict[str, Any]:
        if not _lib:
            raise RuntimeError("Native libtaroturn binary not found. Build with `cargo build --release` first.")

        q_bytes = question.encode("utf-8") if question else None
        s_bytes = seed_hex.encode("utf-8") if seed_hex else None
        out_ptr = ctypes.c_char_p()

        rc = _lib.taroturn_draw_session_json(
            spread_id.encode("utf-8"),
            q_bytes,
            s_bytes,
            ctypes.c_float(reversal_rate),
            ctypes.byref(out_ptr),
        )

        if rc != 0 or not out_ptr.value:
            raise RuntimeError(f"taroturn_draw_session_json failed with code {rc}")

        json_str = out_ptr.value.decode("utf-8")
        _lib.taroturn_free_string(out_ptr)
        return json.loads(json_str)

    @staticmethod
    def get_card(card_id: int) -> Dict[str, Any]:
        if not _lib:
            raise RuntimeError("Native libtaroturn binary not found.")
        out_ptr = ctypes.c_char_p()
        rc = _lib.taroturn_get_card_json(ctypes.c_uint8(card_id), ctypes.byref(out_ptr))
        if rc != 0 or not out_ptr.value:
            raise RuntimeError(f"taroturn_get_card_json failed with code {rc}")
        json_str = out_ptr.value.decode("utf-8")
        _lib.taroturn_free_string(out_ptr)
        return json.loads(json_str)

    @staticmethod
    def list_spreads() -> List[Dict[str, Any]]:
        if not _lib:
            raise RuntimeError("Native libtaroturn binary not found.")
        out_ptr = ctypes.c_char_p()
        rc = _lib.taroturn_list_spreads_json(ctypes.byref(out_ptr))
        if rc != 0 or not out_ptr.value:
            raise RuntimeError(f"taroturn_list_spreads_json failed with code {rc}")
        json_str = out_ptr.value.decode("utf-8")
        _lib.taroturn_free_string(out_ptr)
        return json.loads(json_str)
