import json
import os

from gen_cards_rs import MAJOR_CARDS, MINOR_DATA

def build_catalog():
    cards = []
    # Major (0..21)
    for card in MAJOR_CARDS:
        cid, key, elem, name_en, name_zh, astro, hebrew, gu, gr, lu, lr, cu, cr, su, sr, shadow = card
        cards.append({
            "id": cid,
            "key": key,
            "arcana": "Major",
            "suit": None,
            "element": elem,
            "name_en": name_en,
            "name_zh": name_zh,
            "astrology": astro,
            "hebrew_letter": hebrew,
            "facets": {
                "general_upright": gu,
                "general_reversed": gr,
                "love_upright": lu,
                "love_reversed": lr,
                "career_upright": cu,
                "career_reversed": cr,
                "spiritual_upright": su,
                "spiritual_reversed": sr,
                "shadow_aspect": shadow,
            }
        })

    # Minor (22..77)
    cid_counter = 22
    for suit_enum, suit_key, suit_elem, ranks in MINOR_DATA:
        for rank_enum, rank_key, name_en, name_zh, astro, hebrew, gu, gr, lu, lr, cu, cr, su, sr, shadow in ranks:
            cards.append({
                "id": cid_counter,
                "key": f"minor_{suit_key}_{rank_key}",
                "arcana": "Minor",
                "suit": suit_enum,
                "element": suit_elem,
                "name_en": name_en,
                "name_zh": name_zh,
                "astrology": astro,
                "hebrew_letter": hebrew,
                "facets": {
                    "general_upright": gu,
                    "general_reversed": gr,
                    "love_upright": lu,
                    "love_reversed": lr,
                    "career_upright": cu,
                    "career_reversed": cr,
                    "spiritual_upright": su,
                    "spiritual_reversed": sr,
                    "shadow_aspect": shadow,
                }
            })
            cid_counter += 1

    spreads = [
        {
            "id": "daily_single",
            "name_en": "Daily Focus / Oracle",
            "name_zh": "每日启示 / 单张牌",
            "description": "Single card draw for daily contemplation or focused guidance.",
            "category": "Daily",
            "slots": [
                {
                    "slot_id": 0,
                    "title_en": "Core Oracle",
                    "title_zh": "核心启示",
                    "meaning_prompt": "The primary energy and guidance for this moment.",
                    "x": 0.5,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                }
            ],
            "edges": []
        },
        {
            "id": "three_cards_time",
            "name_en": "Past, Present, Future (Time Stream)",
            "name_zh": "时间之流 (过去-现在-未来)",
            "description": "Temporal evolution of circumstances and energetic momentum.",
            "category": "Comprehensive",
            "slots": [
                {
                    "slot_id": 0,
                    "title_en": "Past Influence",
                    "title_zh": "过去根基",
                    "meaning_prompt": "Root cause and foundational context leading up to now.",
                    "x": 0.2,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 1,
                    "title_en": "Present Reality",
                    "title_zh": "现在处境",
                    "meaning_prompt": "Current energetic climate and focal challenge.",
                    "x": 0.5,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 2,
                    "title_en": "Future Outcome",
                    "title_zh": "未来走向",
                    "meaning_prompt": "Natural trajectory if present course remains unchanged.",
                    "x": 0.8,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                }
            ],
            "edges": [
                {"source_slot_id": 0, "target_slot_id": 1, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 2, "relation": "FlowsTo", "weight": 1.0}
            ]
        },
        {
            "id": "holy_triangle",
            "name_en": "Situation, Obstacle, Advice (Holy Triangle)",
            "name_zh": "圣三角 (现状-障碍-建议)",
            "description": "Action-oriented decision analysis and obstacle diagnosis.",
            "category": "Decision",
            "slots": [
                {
                    "slot_id": 0,
                    "title_en": "Situation",
                    "title_zh": "现状全貌",
                    "meaning_prompt": "The underlying reality of the matter.",
                    "x": 0.3,
                    "y": 0.7,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 1,
                    "title_en": "Obstacle",
                    "title_zh": "核心阻碍",
                    "meaning_prompt": "Hidden friction or explicit challenge facing you.",
                    "x": 0.7,
                    "y": 0.7,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 2,
                    "title_en": "Advice",
                    "title_zh": "指引建议",
                    "meaning_prompt": "Optimal attitude and decisive action recommended.",
                    "x": 0.5,
                    "y": 0.3,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                }
            ],
            "edges": [
                {"source_slot_id": 0, "target_slot_id": 1, "relation": "Opposes", "weight": 1.0},
                {"source_slot_id": 0, "target_slot_id": 2, "relation": "Synthesizes", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 2, "relation": "Synthesizes", "weight": 1.0}
            ]
        },
        {
            "id": "four_elements",
            "name_en": "Four Elements Balance",
            "name_zh": "四要素平衡牌阵",
            "description": "Evaluating balance across Action, Emotion, Intellect, and Materiality.",
            "category": "Comprehensive",
            "slots": [
                {
                    "slot_id": 0,
                    "title_en": "Fire (Will / Action)",
                    "title_zh": "火之位 (意志与行动)",
                    "meaning_prompt": "Your passion, momentum, and creative drive.",
                    "x": 0.5,
                    "y": 0.2,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 1,
                    "title_en": "Water (Emotions / Relationships)",
                    "title_zh": "水之位 (情感与直觉)",
                    "meaning_prompt": "Your subconscious desires and emotional bonds.",
                    "x": 0.8,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 2,
                    "title_en": "Air (Intellect / Communication)",
                    "title_zh": "风之位 (心智与沟通)",
                    "meaning_prompt": "Your mental clarity, thoughts, and strategy.",
                    "x": 0.2,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 3,
                    "title_en": "Earth (Material / Body)",
                    "title_zh": "土之位 (物质与躯体)",
                    "meaning_prompt": "Your financial stability and physical health.",
                    "x": 0.5,
                    "y": 0.8,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                }
            ],
            "edges": [
                {"source_slot_id": 0, "target_slot_id": 2, "relation": "Illuminates", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 3, "relation": "Supports", "weight": 1.0},
                {"source_slot_id": 0, "target_slot_id": 1, "relation": "Opposes", "weight": 0.8},
                {"source_slot_id": 2, "target_slot_id": 3, "relation": "Opposes", "weight": 0.8}
            ]
        },
        {
            "id": "two_choices",
            "name_en": "Two Choices / Crossroads Spread",
            "name_zh": "二选一抉择牌阵",
            "description": "Comparing comparative trajectories of Choice A vs Choice B.",
            "category": "Decision",
            "slots": [
                {
                    "slot_id": 0,
                    "title_en": "Current State",
                    "title_zh": "抉择原点",
                    "meaning_prompt": "The nexus and dilemma facing you today.",
                    "x": 0.5,
                    "y": 0.8,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 1,
                    "title_en": "Choice A Process",
                    "title_zh": "选项 A 发展历程",
                    "meaning_prompt": "The experiences and effort required in Option A.",
                    "x": 0.3,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 2,
                    "title_en": "Choice A Result",
                    "title_zh": "选项 A 最终结果",
                    "meaning_prompt": "The eventual harvest and outcome of Option A.",
                    "x": 0.3,
                    "y": 0.2,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 3,
                    "title_en": "Choice B Process",
                    "title_zh": "选项 B 发展历程",
                    "meaning_prompt": "The experiences and effort required in Option B.",
                    "x": 0.7,
                    "y": 0.5,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                },
                {
                    "slot_id": 4,
                    "title_en": "Choice B Result",
                    "title_zh": "选项 B 最终结果",
                    "meaning_prompt": "The eventual harvest and outcome of Option B.",
                    "x": 0.7,
                    "y": 0.2,
                    "rotation_deg": 0.0,
                    "z_index": 0,
                    "constraint": "Any"
                }
            ],
            "edges": [
                {"source_slot_id": 0, "target_slot_id": 1, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 2, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 0, "target_slot_id": 3, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 3, "target_slot_id": 4, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 2, "target_slot_id": 4, "relation": "Opposes", "weight": 1.0}
            ]
        },
        {
            "id": "hexagram_7",
            "name_en": "Hexagram / Star of David Spread",
            "name_zh": "六芒星 / 大卫星牌阵",
            "description": "Deep holistic inquiry integrating internal motives and external forces.",
            "category": "Comprehensive",
            "slots": [
                {"slot_id": 0, "title_en": "Past", "title_zh": "过去原因", "meaning_prompt": "Past circumstances.", "x": 0.5, "y": 0.15, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 1, "title_en": "Present", "title_zh": "现在状况", "meaning_prompt": "Current focal dynamics.", "x": 0.8, "y": 0.65, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 2, "title_en": "Future", "title_zh": "未来趋势", "meaning_prompt": "Future developmental arc.", "x": 0.2, "y": 0.65, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 3, "title_en": "Solution", "title_zh": "应对方法", "meaning_prompt": "Effective strategies.", "x": 0.5, "y": 0.85, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 4, "title_en": "Surroundings", "title_zh": "周围环境", "meaning_prompt": "Attitudes of people around.", "x": 0.2, "y": 0.35, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 5, "title_en": "Hopes and Fears", "title_zh": "愿望与恐惧", "meaning_prompt": "Subconscious aspirations.", "x": 0.8, "y": 0.35, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 6, "title_en": "Outcome / Synthesis", "title_zh": "核心结论", "meaning_prompt": "Final holistic culmination.", "x": 0.5, "y": 0.5, "rotation_deg": 0.0, "z_index": 1, "constraint": "Any"}
            ],
            "edges": [
                {"source_slot_id": 0, "target_slot_id": 1, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 2, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 3, "target_slot_id": 6, "relation": "Synthesizes", "weight": 1.0},
                {"source_slot_id": 4, "target_slot_id": 5, "relation": "Reflects", "weight": 1.0},
                {"source_slot_id": 1, "target_slot_id": 6, "relation": "Supports", "weight": 1.0}
            ]
        },
        {
            "id": "celtic_cross",
            "name_en": "Celtic Cross",
            "name_zh": "凯尔特十字牌阵",
            "description": "The quintessential 10-card profound reading revealing conscious, subconscious, past, future, and outcome.",
            "category": "Comprehensive",
            "slots": [
                {"slot_id": 0, "title_en": "The Heart / Present", "title_zh": "现状核心", "meaning_prompt": "The primary theme.", "x": 0.35, "y": 0.5, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 1, "title_en": "The Crossing / Obstacle", "title_zh": "交叉阻碍", "meaning_prompt": "The immediate obstacle.", "x": 0.35, "y": 0.5, "rotation_deg": 90.0, "z_index": 1, "constraint": "Any"},
                {"slot_id": 2, "title_en": "The Root / Subconscious", "title_zh": "潜意识根基", "meaning_prompt": "Deep subconscious origins.", "x": 0.35, "y": 0.8, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 3, "title_en": "The Recent Past", "title_zh": "过去影响", "meaning_prompt": "Recent events.", "x": 0.15, "y": 0.5, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 4, "title_en": "The Crown / Conscious Goal", "title_zh": "显意识期望", "meaning_prompt": "Conscious aspirations.", "x": 0.35, "y": 0.2, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 5, "title_en": "The Near Future", "title_zh": "近期未来", "meaning_prompt": "Approaching events.", "x": 0.55, "y": 0.5, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 6, "title_en": "Yourself / Attitude", "title_zh": "自我心态", "meaning_prompt": "Self-perception.", "x": 0.8, "y": 0.8, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 7, "title_en": "External Environment", "title_zh": "外部环境", "meaning_prompt": "Environmental impact.", "x": 0.8, "y": 0.6, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 8, "title_en": "Hopes & Fears", "title_zh": "希望与忧虑", "meaning_prompt": "Secret desires and fears.", "x": 0.8, "y": 0.4, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"},
                {"slot_id": 9, "title_en": "Final Outcome", "title_zh": "最终结果", "meaning_prompt": "Ultimate resolution.", "x": 0.8, "y": 0.2, "rotation_deg": 0.0, "z_index": 0, "constraint": "Any"}
            ],
            "edges": [
                {"source_slot_id": 1, "target_slot_id": 0, "relation": "Crosses", "weight": 1.2},
                {"source_slot_id": 2, "target_slot_id": 0, "relation": "Supports", "weight": 1.0},
                {"source_slot_id": 3, "target_slot_id": 0, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 4, "target_slot_id": 0, "relation": "Illuminates", "weight": 1.0},
                {"source_slot_id": 0, "target_slot_id": 5, "relation": "FlowsTo", "weight": 1.0},
                {"source_slot_id": 6, "target_slot_id": 7, "relation": "Reflects", "weight": 1.0},
                {"source_slot_id": 8, "target_slot_id": 9, "relation": "Supports", "weight": 1.0},
                {"source_slot_id": 5, "target_slot_id": 9, "relation": "FlowsTo", "weight": 1.0}
            ]
        }
    ]

    out_dir = "apps/taroturn-app/src/data"
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "canonicalCatalog.json"), "w", encoding="utf-8") as f:
        json.dump({"cards": cards, "spreads": spreads}, f, ensure_ascii=False, indent=2)
    print("Exported canonicalCatalog.json successfully!")

if __name__ == "__main__":
    build_catalog()
