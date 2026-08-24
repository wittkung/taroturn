/**
 * Taroturn Universal C-ABI Header
 * Copyright (c) 2026 Taroturn Engineering Team.
 * Licensed under MIT or Apache-2.0.
 */

#ifndef TAROTURN_H
#define TAROTURN_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Returns static library version string (e.g. "0.1.0").
 */
const char* taroturn_version(void);

/**
 * Generates a 64-character hexadecimal CSPRNG seed.
 * Buffer must have at least 65 bytes capacity.
 * Returns 0 on success, negative error code on failure.
 */
int32_t taroturn_generate_seed(char* out_buf, size_t buf_len);

/**
 * Draws a deterministic reading session and returns JSON string.
 * Caller MUST free out_json via taroturn_free_string().
 * Returns 0 on success, negative error code on failure.
 */
int32_t taroturn_draw_session_json(
    const char* spread_id,
    const char* question,
    const char* seed_hex,
    float reversal_rate,
    char** out_json
);

/**
 * Retrieves a single Tarot card archetype definition by card ID (0..77) as JSON.
 * Caller MUST free out_json via taroturn_free_string().
 */
int32_t taroturn_get_card_json(uint8_t card_id, char** out_json);

/**
 * Retrieves the list of canonical spreads as JSON.
 * Caller MUST free out_json via taroturn_free_string().
 */
int32_t taroturn_list_spreads_json(char** out_json);

/**
 * Frees a string allocated across the C-ABI boundary by taroturn.
 */
void taroturn_free_string(char* ptr);

#ifdef __cplusplus
}
#endif

#endif /* TAROTURN_H */
