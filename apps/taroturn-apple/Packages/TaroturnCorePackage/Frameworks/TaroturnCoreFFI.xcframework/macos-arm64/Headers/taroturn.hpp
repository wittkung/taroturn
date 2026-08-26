/**
 * Taroturn Modern C++20 SDK Wrapper
 * Header-only wrapper around taroturn C-ABI.
 */

#ifndef TAROTURN_HPP
#define TAROTURN_HPP

#include "taroturn.h"
#include <string>
#include <memory>
#include <stdexcept>
#include <optional>

namespace taroturn {

class TarotEngine {
public:
    static std::string version() {
        return taroturn_version();
    }

    static std::string generate_seed() {
        char buf[65] = {0};
        int32_t rc = taroturn_generate_seed(buf, sizeof(buf));
        if (rc != 0) {
            throw std::runtime_error("Failed to generate taroturn seed: " + std::to_string(rc));
        }
        return std::string(buf);
    }

    static std::string draw_session_json(
        const std::string& spread_id,
        const std::optional<std::string>& question = std::nullopt,
        const std::optional<std::string>& seed_hex = std::nullopt,
        float reversal_rate = 0.5f
    ) {
        char* raw_json = nullptr;
        const char* q_ptr = question ? question->c_str() : nullptr;
        const char* s_ptr = seed_hex ? seed_hex->c_str() : nullptr;

        int32_t rc = taroturn_draw_session_json(spread_id.c_str(), q_ptr, s_ptr, reversal_rate, &raw_json);
        if (rc != 0 || !raw_json) {
            throw std::runtime_error("Failed to draw tarot session: " + std::to_string(rc));
        }

        std::string result(raw_json);
        taroturn_free_string(raw_json);
        return result;
    }

    static std::string get_card_json(uint8_t card_id) {
        char* raw_json = nullptr;
        int32_t rc = taroturn_get_card_json(card_id, &raw_json);
        if (rc != 0 || !raw_json) {
            throw std::runtime_error("Failed to get card: " + std::to_string(rc));
        }
        std::string result(raw_json);
        taroturn_free_string(raw_json);
        return result;
    }

    static std::string list_spreads_json() {
        char* raw_json = nullptr;
        int32_t rc = taroturn_list_spreads_json(&raw_json);
        if (rc != 0 || !raw_json) {
            throw std::runtime_error("Failed to list spreads: " + std::to_string(rc));
        }
        std::string result(raw_json);
        taroturn_free_string(raw_json);
        return result;
    }
};

} // namespace taroturn

#endif /* TAROTURN_HPP */
