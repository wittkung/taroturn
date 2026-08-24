#![allow(unsafe_code)]
use std::ffi::{CStr, CString};
use std::os::raw::c_char;
use std::ptr;
use crate::card::CardDeck;
use crate::session::ReadingSession;
use crate::shuffling::ShufflingEngine;
use crate::spread::Spread;

#[no_mangle]
pub extern "C" fn taroturn_version() -> *const c_char {
    static VERSION: &str = concat!(env!("CARGO_PKG_VERSION"), "\0");
    VERSION.as_ptr() as *const c_char
}

#[no_mangle]
pub unsafe extern "C" fn taroturn_generate_seed(out_buf: *mut c_char, buf_len: usize) -> i32 {
    if out_buf.is_null() || buf_len < 65 {
        return -1;
    }
    match ShufflingEngine::generate_random_seed() {
        Ok(seed) => {
            let c_str = CString::new(seed).unwrap();
            ptr::copy_nonoverlapping(c_str.as_ptr(), out_buf, 65);
            0
        }
        Err(_) => -2,
    }
}

#[no_mangle]
pub unsafe extern "C" fn taroturn_draw_session_json(
    spread_id: *const c_char,
    question: *const c_char,
    seed_hex: *const c_char,
    reversal_rate: f32,
    out_json: *mut *mut c_char,
) -> i32 {
    if spread_id.is_null() || out_json.is_null() {
        return -1;
    }

    let spread_str = match CStr::from_ptr(spread_id).to_str() {
        Ok(s) => s,
        Err(_) => return -2,
    };

    let question_opt = if !question.is_null() {
        CStr::from_ptr(question).to_str().ok().map(|s| s.to_string())
    } else {
        None
    };

    let seed_opt = if !seed_hex.is_null() {
        CStr::from_ptr(seed_hex).to_str().ok().map(|s| s.to_string())
    } else {
        None
    };

    match ReadingSession::create(spread_str, question_opt, seed_opt, reversal_rate) {
        Ok(session) => match session.to_json() {
            Ok(json_str) => {
                let c_json = CString::new(json_str).unwrap();
                *out_json = c_json.into_raw();
                0
            }
            Err(_) => -3,
        },
        Err(_) => -4,
    }
}

#[no_mangle]
pub unsafe extern "C" fn taroturn_get_card_json(card_id: u8, out_json: *mut *mut c_char) -> i32 {
    if out_json.is_null() {
        return -1;
    }
    match CardDeck::get_by_id(card_id) {
        Ok(card) => match serde_json::to_string_pretty(&card) {
            Ok(json) => {
                let c_json = CString::new(json).unwrap();
                *out_json = c_json.into_raw();
                0
            }
            Err(_) => -2,
        },
        Err(_) => -3,
    }
}

#[no_mangle]
pub unsafe extern "C" fn taroturn_list_spreads_json(out_json: *mut *mut c_char) -> i32 {
    if out_json.is_null() {
        return -1;
    }
    let spreads = Spread::canonical_spreads();
    match serde_json::to_string_pretty(&spreads) {
        Ok(json) => {
            let c_json = CString::new(json).unwrap();
            *out_json = c_json.into_raw();
            0
        }
        Err(_) => -2,
    }
}

#[no_mangle]
pub unsafe extern "C" fn taroturn_free_string(ptr: *mut c_char) {
    if !ptr.is_null() {
        drop(CString::from_raw(ptr));
    }
}
