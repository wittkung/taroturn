#!/usr/bin/env python3
"""
Taroturn Universal Asset Downloader
Downloads all 78 authentic 1909 Pamela Colman Smith Rider-Waite Tarot card artworks
and creates the Kintsugi Gold card back.
"""

import json
import os
import urllib.request
import time

BASE_URL = "https://raw.githubusercontent.com/metabismuth/tarot-json/master/"
INDEX_URL = BASE_URL + "tarot-images.json"
CARDS_URL = BASE_URL + "cards/"

PUBLIC_CARDS_DIR = os.path.join(os.path.dirname(__file__), "..", "apps", "taroturn-app", "public", "cards")
ASSETS_CARDS_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "cards", "images")

os.makedirs(PUBLIC_CARDS_DIR, exist_ok=True)
os.makedirs(ASSETS_CARDS_DIR, exist_ok=True)

# Key mappings
KEY_TO_ID = {
    "m00.jpg": 0, "m01.jpg": 1, "m02.jpg": 2, "m03.jpg": 3, "m04.jpg": 4,
    "m05.jpg": 5, "m06.jpg": 6, "m07.jpg": 7, "m08.jpg": 8, "m09.jpg": 9,
    "m10.jpg": 10, "m11.jpg": 11, "m12.jpg": 12, "m13.jpg": 13, "m14.jpg": 14,
    "m15.jpg": 15, "m16.jpg": 16, "m17.jpg": 17, "m18.jpg": 18, "m19.jpg": 19,
    "m20.jpg": 20, "m21.jpg": 21,
    "w01.jpg": 22, "w02.jpg": 23, "w03.jpg": 24, "w04.jpg": 25, "w05.jpg": 26,
    "w06.jpg": 27, "w07.jpg": 28, "w08.jpg": 29, "w09.jpg": 30, "w10.jpg": 31,
    "w11.jpg": 32, "w12.jpg": 33, "w13.jpg": 34, "w14.jpg": 35,
    "c01.jpg": 36, "c02.jpg": 37, "c03.jpg": 38, "c04.jpg": 39, "c05.jpg": 40,
    "c06.jpg": 41, "c07.jpg": 42, "c08.jpg": 43, "c09.jpg": 44, "c10.jpg": 45,
    "c11.jpg": 46, "c12.jpg": 47, "c13.jpg": 48, "c14.jpg": 49,
    "s01.jpg": 50, "s02.jpg": 51, "s03.jpg": 52, "s04.jpg": 53, "s05.jpg": 54,
    "s06.jpg": 55, "s07.jpg": 56, "s08.jpg": 57, "s09.jpg": 58, "s10.jpg": 59,
    "s11.jpg": 60, "s12.jpg": 61, "s13.jpg": 62, "s14.jpg": 63,
    "p01.jpg": 64, "p02.jpg": 65, "p03.jpg": 66, "p04.jpg": 67, "p05.jpg": 68,
    "p06.jpg": 69, "p07.jpg": 70, "p08.jpg": 71, "p09.jpg": 72, "p10.jpg": 73,
    "p11.jpg": 74, "p12.jpg": 75, "p13.jpg": 76, "p14.jpg": 77,
}

def download_dataset():
    print("==> Fetching tarot metadata...")
    req = urllib.request.Request(INDEX_URL, headers={"User-Agent": "Taroturn/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        meta = json.loads(resp.read().decode())

    cards = meta.get("cards", [])
    print(f"==> Found {len(cards)} card records. Starting download to {PUBLIC_CARDS_DIR} ...")

    success_count = 0
    for idx, card in enumerate(cards):
        img_name = card["img"]
        card_id = KEY_TO_ID.get(img_name, idx)
        file_url = CARDS_URL + img_name

        dest_app_name = os.path.join(PUBLIC_CARDS_DIR, img_name)
        dest_app_id = os.path.join(PUBLIC_CARDS_DIR, f"{card_id}.jpg")
        dest_asset = os.path.join(ASSETS_CARDS_DIR, img_name)

        try:
            r = urllib.request.Request(file_url, headers={"User-Agent": "Taroturn/1.0"})
            with urllib.request.urlopen(r, timeout=10) as res:
                data = res.read()
                with open(dest_app_name, "wb") as f:
                    f.write(data)
                with open(dest_app_id, "wb") as f:
                    f.write(data)
                with open(dest_asset, "wb") as f:
                    f.write(data)
                success_count += 1
                print(f"[{success_count}/78] Downloaded #{card_id} {card['name']} ({img_name})")
        except Exception as e:
            print(f"❌ Failed to download {img_name}: {e}")

    # Generate Zen Kintsugi Gold Card Back SVG
    card_back_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B0B0C"/>
      <stop offset="50%" stop-color="#1C1C1E"/>
      <stop offset="100%" stop-color="#0B0B0C"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#F3E5AB"/>
      <stop offset="100%" stop-color="#AA771C"/>
    </linearGradient>
  </defs>
  <rect width="300" height="500" rx="16" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="3"/>
  <rect x="12" y="12" width="276" height="476" rx="10" fill="none" stroke="#D4AF37" stroke-width="1" stroke-dasharray="4,4" opacity="0.6"/>
  <!-- Kintsugi Sacred Geometry -->
  <circle cx="150" cy="250" r="70" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.8"/>
  <circle cx="150" cy="250" r="50" fill="none" stroke="#D4AF37" stroke-width="1" opacity="0.5"/>
  <polygon points="150,185 206,282 94,282" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.7"/>
  <polygon points="150,315 206,218 94,218" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" opacity="0.7"/>
  <circle cx="150" cy="250" r="8" fill="url(#goldGrad)"/>
  <text x="150" y="440" font-family="Georgia, serif" font-size="11" letter-spacing="4" fill="#D4AF37" text-anchor="middle" opacity="0.85">TAROTURN</text>
</svg>"""
    
    with open(os.path.join(PUBLIC_CARDS_DIR, "card_back.svg"), "w", encoding="utf-8") as f:
        f.write(card_back_svg)

    print(f"\n✨ Successfully downloaded {success_count}/78 cards + generated card_back.svg!")

if __name__ == "__main__":
    download_dataset()
