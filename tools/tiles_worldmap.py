"""E 線：世界地圖背景。把生圖 art/tiles/_worldmap_raw.png 縮成 360×540、量化到調色盤，
輸出 art/tiles/worldmap.png（遊戲內 2 倍顯示＝720×1080）與 art/tiles/worldmap.json（各地點座標）。
圖上不畫字，地名、星數、鎖頭由引擎疊上去。
執行：.venv/bin/python -I tools/tiles_worldmap.py
"""
import json, os, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tiles_pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 360, 540

# x, y 是 worldmap.png 上的像素座標（360×540），指地點圖示的中心；label 是建議放地名牌的位置（圖示正下方）。
# open 照企劃書第 15 節：開局＝刀鋸地獄、高熊市；☆1 心堀江；7 月陽間海邊；☆2 古神遺跡；☆3 第二王國；☆4 第三王國；☆5 北境。
PLACES = [
    {"id": "sanzu",    "name": "三途川",       "home": True},
    {"id": "saw",      "name": "刀鋸地獄",     "open": {"start": True}},
    {"id": "gaoxiong", "name": "庚寅地球・高熊市", "open": {"start": True}, "region": "gengyin"},
    {"id": "xinjue",   "name": "庚寅地球・心堀江", "open": {"rank": 1}, "region": "gengyin"},
    {"id": "seaside",  "name": "陽間海邊",     "open": {"month": 7}},
    {"id": "ruins",    "name": "古神遺跡",     "open": {"rank": 2}},
    {"id": "demon2",   "name": "魔界第二王國", "open": {"rank": 3}},
    {"id": "demon3",   "name": "魔界第三王國", "open": {"rank": 4}},
    {"id": "north",    "name": "北境",         "open": {"rank": 5}, "hidden": True},
]
POS = {  # 依生成的圖目測（360×540 座標）
    "sanzu": (134, 243), "saw": (60, 60), "ruins": (190, 60), "seaside": (42, 197),
    "demon2": (211, 190), "demon3": (200, 373), "north": (81, 404),
    "gaoxiong": (309, 183), "xinjue": (299, 369),
}


def main():
    raw = Image.open(os.path.join(ROOT, "art/tiles/_worldmap_raw.png")).convert("RGB")
    # 裁成 2:3
    rw, rh = raw.size
    if rw / rh > W / H:
        nw = round(rh * W / H); raw = raw.crop(((rw - nw) // 2, 0, (rw - nw) // 2 + nw, rh))
    else:
        nh = round(rw * H / W); raw = raw.crop((0, (rh - nh) // 2, rw, (rh - nh) // 2 + nh))
    small = np.array(raw.resize((W, H), Image.BOX), dtype=np.float32)
    q = P.quantize(small)
    Image.fromarray(q).save(os.path.join(ROOT, "art/tiles/worldmap.png"))
    out = {"file": "art/tiles/worldmap.png", "w": W, "h": H, "scale": 2,
           "note": "x, y＝地點圖示中心（worldmap.png 原尺寸像素）；地名牌建議畫在 (x, y + 22)。id 給 C 線 data/maps.js 對應用。",
           "places": []}
    for p in PLACES:
        x, y = POS[p["id"]]
        out["places"].append({**p, "x": x, "y": y})
    json.dump(out, open(os.path.join(ROOT, "art/tiles/worldmap.json"), "w"), ensure_ascii=False, indent=1)
    # 預覽：放大 2 倍並標點
    from PIL import ImageDraw, ImageFont
    pv = Image.open(os.path.join(ROOT, "art/tiles/worldmap.png")).convert("RGBA").resize((W * 2, H * 2), Image.NEAREST)
    d = ImageDraw.Draw(pv)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 20)
    except Exception:
        font = ImageFont.load_default()
    for p in out["places"]:
        x, y = p["x"] * 2, p["y"] * 2
        d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 255, 255, 255), width=3)
        tw = d.textlength(p["name"], font=font)
        d.rectangle([x - tw / 2 - 6, y + 34, x + tw / 2 + 6, y + 62], fill=(22, 20, 43, 220), outline=(226, 182, 90, 255))
        d.text((x - tw / 2, y + 36), p["name"], fill=(243, 213, 140, 255), font=font)
    pv.save(os.path.join(ROOT, "art/tiles/_worldmap_preview.png"))
    print("ok")


if __name__ == "__main__":
    main()
