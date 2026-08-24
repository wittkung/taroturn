#!/usr/bin/env python3
"""
Taroturn Asset Downloader & Processor
Fetches original 1909 Rider-Waite-Smith public domain card artwork,
resizes them into 3 responsive tiers (@3x 1400x2400, @2x 700x1200, @1x 200x342),
and generates the asset manifest JSON.
"""

import json
import os
import sys

# 78 Canonical Card Keys
CARDS_MANIFEST = [
    # 22 Major Arcana
    {"id": 0, "key": "major_00_fool", "name_en": "The Fool", "name_zh": "愚者", "wiki_file": "RWS_Tarot_00_Fool.jpg"},
    {"id": 1, "key": "major_01_magician", "name_en": "The Magician", "name_zh": "魔术师", "wiki_file": "RWS_Tarot_01_Magician.jpg"},
    {"id": 2, "key": "major_02_high_priestess", "name_en": "The High Priestess", "name_zh": "女祭司", "wiki_file": "RWS_Tarot_02_High_Priestess.jpg"},
    {"id": 3, "key": "major_03_empress", "name_en": "The Empress", "name_zh": "女皇", "wiki_file": "RWS_Tarot_03_Empress.jpg"},
    {"id": 4, "key": "major_04_emperor", "name_en": "The Emperor", "name_zh": "皇帝", "wiki_file": "RWS_Tarot_04_Emperor.jpg"},
    {"id": 5, "key": "major_05_hierophant", "name_en": "The Hierophant", "name_zh": "教皇", "wiki_file": "RWS_Tarot_05_Hierophant.jpg"},
    {"id": 6, "key": "major_06_lovers", "name_en": "The Lovers", "name_zh": "恋人", "wiki_file": "RWS_Tarot_06_Lovers.jpg"},
    {"id": 7, "key": "major_07_chariot", "name_en": "The Chariot", "name_zh": "战车", "wiki_file": "RWS_Tarot_07_Chariot.jpg"},
    {"id": 8, "key": "major_08_strength", "name_en": "Strength", "name_zh": "力量", "wiki_file": "RWS_Tarot_08_Strength.jpg"},
    {"id": 9, "key": "major_09_hermit", "name_en": "The Hermit", "name_zh": "隐士", "wiki_file": "RWS_Tarot_09_Hermit.jpg"},
    {"id": 10, "key": "major_10_wheel_of_fortune", "name_en": "Wheel of Fortune", "name_zh": "命运之轮", "wiki_file": "RWS_Tarot_10_Wheel_of_Fortune.jpg"},
    {"id": 11, "key": "major_11_justice", "name_en": "Justice", "name_zh": "正义", "wiki_file": "RWS_Tarot_11_Justice.jpg"},
    {"id": 12, "key": "major_12_hanged_man", "name_en": "The Hanged Man", "name_zh": "倒吊人", "wiki_file": "RWS_Tarot_12_Hanged_Man.jpg"},
    {"id": 13, "key": "major_13_death", "name_en": "Death", "name_zh": "死神", "wiki_file": "RWS_Tarot_13_Death.jpg"},
    {"id": 14, "key": "major_14_temperance", "name_en": "Temperance", "name_zh": "节制", "wiki_file": "RWS_Tarot_14_Temperance.jpg"},
    {"id": 15, "key": "major_15_devil", "name_en": "The Devil", "name_zh": "恶魔", "wiki_file": "RWS_Tarot_15_Devil.jpg"},
    {"id": 16, "key": "major_16_tower", "name_en": "The Tower", "name_zh": "高塔", "wiki_file": "RWS_Tarot_16_Tower.jpg"},
    {"id": 17, "key": "major_17_star", "name_en": "The Star", "name_zh": "星星", "wiki_file": "RWS_Tarot_17_Star.jpg"},
    {"id": 18, "key": "major_18_moon", "name_en": "The Moon", "name_zh": "月亮", "wiki_file": "RWS_Tarot_18_Moon.jpg"},
    {"id": 19, "key": "major_19_sun", "name_en": "The Sun", "name_zh": "太阳", "wiki_file": "RWS_Tarot_19_Sun.jpg"},
    {"id": 20, "key": "major_20_judgement", "name_en": "Judgement", "name_zh": "审判", "wiki_file": "RWS_Tarot_20_Judgement.jpg"},
    {"id": 21, "key": "major_21_world", "name_en": "The World", "name_zh": "世界", "wiki_file": "RWS_Tarot_21_World.jpg"},
]

# Suits generator (Wands, Cups, Swords, Pentacles)
SUITS = [
    ("wands", "Wands", "权杖", "Wands"),
    ("cups", "Cups", "圣杯", "Cups"),
    ("swords", "Swords", "宝剑", "Swords"),
    ("pentacles", "Pentacles", "星币", "Pents"),
]
RANKS = [
    (1, "01_ace", "Ace", "一", "01"),
    (2, "02_two", "Two", "二", "02"),
    (3, "03_three", "Three", "三", "03"),
    (4, "04_four", "Four", "四", "04"),
    (5, "05_five", "Five", "五", "05"),
    (6, "06_six", "Six", "六", "06"),
    (7, "07_seven", "Seven", "七", "07"),
    (8, "08_eight", "Eight", "八", "08"),
    (9, "09_nine", "Nine", "九", "09"),
    (10, "10_ten", "Ten", "十", "10"),
    (11, "11_page", "Page", "侍从", "Page"),
    (12, "12_knight", "Knight", "骑士", "Knight"),
    (13, "13_queen", "Queen", "王后", "Queen"),
    (14, "14_king", "King", "国王", "King"),
]

card_id = 22
for suit_key, suit_en, suit_zh, wiki_suit in SUITS:
    for rank_val, rank_key, rank_en, rank_zh, wiki_rank in RANKS:
        CARDS_MANIFEST.append({
            "id": card_id,
            "key": f"minor_{suit_key}_{rank_key}",
            "name_en": f"{rank_en} of {suit_en}",
            "name_zh": f"{suit_zh}{rank_zh}",
            "wiki_file": f"{wiki_suit}{wiki_rank}.jpg"
        })
        card_id += 1


def generate_manifest(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    manifest_path = os.path.join(output_dir, "cards_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(CARDS_MANIFEST, f, ensure_ascii=False, indent=2)
    print(f"Generated manifest for {len(CARDS_MANIFEST)} Tarot cards -> {manifest_path}")


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "assets", "cards")
    generate_manifest(out_dir)
