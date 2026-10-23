"""E 線：從 art/_raw/ 的生圖大圖切出每棟建築，縮成 tiles×32 寬、量化到調色盤，
輸出 art/buildings/<id>.png、art/buildings/index.json、art/buildings/_preview.png，
以及 art/props/<id>.png、art/props/index.json。

執行：.venv/bin/python -I tools/tiles_buildings.py
建築 id 與佔地格數以 B 線 data/buildings.js 為準（size: [寬, 高]）。
每筆：id -> (原圖, 物件中心大約位置 (x, y) 佔原圖寬高的比例, 佔地 [寬, 高], 最高像素)
"""
import json, os, re, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tiles_pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "art/_raw")

# 預設最高 = 佔地高 × 32 + 64（屋頂最多往上超出兩格）
BUILDINGS = {
    # sheet1：燒肉、紋身、照相、髮廊
    "yakiniku": ("sheet1", (0.26, 0.26)),
    "tattoo":   ("sheet1", (0.74, 0.28)),
    "photo":    ("sheet1", (0.26, 0.71)),
    "salon":    ("sheet1", (0.73, 0.72)),
    # sheet2：孟婆甜食、漫畫、壽司、紙紮
    "mengpo":   ("sheet2", (0.25, 0.28)),
    "manga":    ("sheet2", (0.74, 0.28)),
    "sushi":    ("sheet2", (0.26, 0.72)),
    "paper":    ("sheet2", (0.74, 0.72)),
    # sheet3：（壽衣，不用）、香舖、花飾、茶館
    "incense":  ("sheet3", (0.73, 0.28)),
    "flower":   ("sheet3", (0.26, 0.72)),
    "teahouse": ("sheet3", (0.73, 0.72)),
    # sheet4：客棧、靈骨塔、紅線小攤
    "inn":        ("sheet4", (0.34, 0.56)),
    "tower":      ("sheet4", (0.82, 0.38)),
    "nightstall": ("sheet4", (0.84, 0.87)),
    # sheet5：市役所、月老廟、守宮廣場、愛神祭
    "cityhall": ("sheet5", (0.26, 0.26)),
    "temple":   ("sheet5", (0.74, 0.27)),
    "gecko":    ("sheet5", (0.25, 0.73)),
    "festival": ("sheet5", (0.74, 0.73)),
    # sheet6：車站
    "station":  ("sheet6b", (0.5, 0.5)),
    # sheet7：裝飾
    "higanbana": ("sheet7", (0.80, 0.49)),
    "swing":     ("sheet7", (0.49, 0.19)),
    "bench":     ("sheet7", (0.80, 0.23)),
    "garden":    ("sheet7", (0.22, 0.49)),
    "lantern":   ("sheet7", (0.18, 0.78)),
    # sheet8：醫館、戲服、杜氏紋身、麻辣鍋
    "clinic":   ("sheet8", (0.25, 0.25)),
    "costume":  ("sheet8", (0.75, 0.25)),
    "tattoo2":  ("sheet8", (0.25, 0.75)),
    "mala":     ("sheet8", (0.75, 0.75)),
    # sheet9：刀鋸道場、忠烈祠、義民廟、街坊小屋
    "sawhall":  ("sheet9", (0.25, 0.25)),
    "shrine":   ("sheet9", (0.75, 0.25)),
    "yimin":    ("sheet9", (0.27, 0.72)),
    "house":    ("sheet9", (0.75, 0.81)),
    # sheet10：犬屋、貓候車亭、結界石、薯條攤、紅線小橋、奈何橋
    "dogpark":   ("sheet10", (0.20, 0.25)),
    "catstop":   ("sheet10", (0.50, 0.25)),
    "barrier":   ("sheet10", (0.82, 0.26)),
    "fries":     ("sheet10", (0.20, 0.69)),
    "redbridge": ("sheet10", (0.48, 0.68)),
    "naihe":     ("sheet10", (0.78, 0.68)),
}

# 戰損版（保衛戰）：<id>-damaged.png，佔地同原建築
DAMAGED = {
    "yakiniku": ("damaged1", (0.26, 0.26)),
    "tattoo":   ("damaged1", (0.74, 0.28)),
    "photo":    ("damaged1", (0.26, 0.71)),
    "salon":    ("damaged1", (0.73, 0.72)),
    "station":  ("damaged2", (0.5, 0.5)),
}

# 道具（art/props/）：(原圖, 位置, 寬px, 最高px, 說明)
PROPS = {
    "toro":        ("sheet7", (0.19, 0.19), 26, 40, "石燈籠"),
    "jizo":        ("sheet7", (0.50, 0.50), 24, 40, "地藏像（紅圍兜）"),
    "willow":      ("sheet7", (0.49, 0.78), 40, 64, "垂柳（綠）"),
    "noticeboard": ("sheet7", (0.80, 0.78), 32, 40, "公告欄"),
}

SPECIAL_POS_FILE = os.path.join(RAW, "positions.json")  # 自動分配不到的，手動填中心點


def load_sizes():
    """讀 B 線 data/buildings.js 的 size。"""
    src = open(os.path.join(ROOT, "data/buildings.js"), encoding="utf-8").read()
    sizes = {}
    for m in re.finditer(r'id:\s*"([^"]+)"[^}]*?size:\s*\[(\d+),\s*(\d+)\]', src, re.S):
        sizes[m.group(1)] = (int(m.group(2)), int(m.group(3)))
    return sizes


_cache = {}
def objects(sheet):
    if sheet not in _cache:
        img = Image.open(os.path.join(RAW, sheet + ".png"))
        rgba = P.to_rgba(img)
        boxes = P.components(rgba[..., 3], 3000)
        _cache[sheet] = (rgba, boxes, img.size)
    return _cache[sheet]


CLIP_HALF = {"sheet9"}  # 物件互相黏在一起的 2×2 圖：先裁到 pos 所在的那一格


def pick(sheet, pos):
    rgba, boxes, (W, H) = objects(sheet)
    if pos is None:
        raise KeyError(sheet)
    if sheet in CLIP_HALF:
        cx, cy = int(pos[0] >= 0.5), int(pos[1] >= 0.5)
        cell = np.zeros_like(rgba)
        sl = (slice(cy * H // 2, (cy + 1) * H // 2), slice(cx * W // 2, (cx + 1) * W // 2))
        cell[sl] = rgba[sl]
        x0, y0, x1, y1, _ = max(P.components(cell[..., 3], 500), key=lambda b: b[4])
        return cell[y0:y1, x0:x1].copy()
    tx, ty = pos[0] * W, pos[1] * H
    best = min(boxes, key=lambda b: ((b[0] + b[2]) / 2 - tx) ** 2 + ((b[1] + b[3]) / 2 - ty) ** 2)
    x0, y0, x1, y1, _ = best
    return rgba[y0:y1, x0:x1].copy()


def fix_cityhall(rgba):
    """市役所的旗子：把旗面上的紅點塗成白色（不要出現國旗）。"""
    h, w = rgba.shape[:2]
    r, g, b = rgba[..., 0].astype(int), rgba[..., 1].astype(int), rgba[..., 2].astype(int)
    red = (r > 170) & (g < 90) & (b < 90)
    # 旗子在上半部、左右兩側 1/4～1/2 寬之間；燈籠在最外側，不碰
    mask = np.zeros_like(red)
    for cx in (0.29, 0.71):
        mask[int(h * 0.30):int(h * 0.62), int(w * (cx - 0.07)):int(w * (cx + 0.07))] = True
    sel = red & mask
    rgba[sel, 0], rgba[sel, 1], rgba[sel, 2] = 243, 235, 221
    return rgba


def render(rgba, w, max_h):
    out = P.pixelize(rgba, w, outline=False)
    if out.height > max_h:
        # 太高：改以高度為準縮，左右置中補透明
        ys, xs = np.where(rgba[..., 3] > 0)
        H0, W0 = ys.max() - ys.min() + 1, xs.max() - xs.min() + 1
        nw = max(8, round(W0 * max_h / H0))
        small = P.pixelize(rgba, nw, outline=False)
        out = Image.new("RGBA", (w, small.height), (0, 0, 0, 0))
        out.alpha_composite(small, ((w - nw) // 2, 0))
    return out


def main():
    sizes = load_sizes()
    manual = json.load(open(SPECIAL_POS_FILE)) if os.path.exists(SPECIAL_POS_FILE) else {}
    os.makedirs(os.path.join(ROOT, "art/buildings"), exist_ok=True)
    index = {}
    built = []
    missing = []
    for bid, (sheet, pos) in BUILDINGS.items():
        pos = tuple(manual.get(bid, pos) or ()) or None
        if not os.path.exists(os.path.join(RAW, sheet + ".png")) or pos is None:
            missing.append(bid); continue
        sz = sizes.get(bid)
        if not sz:
            print("B 線沒有這個 id：", bid); continue
        rgba = pick(sheet, pos)
        if bid == "cityhall":
            rgba = fix_cityhall(rgba)
        w = sz[0] * 32
        im = render(rgba, w, sz[1] * 32 + 64)
        im.save(os.path.join(ROOT, f"art/buildings/{bid}.png"))
        index[bid] = {"w": im.width, "h": im.height, "size": list(sz)}
        built.append(bid)
    for bid, (sheet, pos) in DAMAGED.items():
        pos = tuple(manual.get(bid + "-damaged", pos) or ()) or None
        if bid not in index or not os.path.exists(os.path.join(RAW, sheet + ".png")):
            missing.append(bid + "-damaged"); continue
        sz = index[bid]["size"]
        rgba = pick(sheet, pos)
        im = render(rgba, sz[0] * 32, sz[1] * 32 + 64)
        im.save(os.path.join(ROOT, f"art/buildings/{bid}-damaged.png"))
        index[bid]["damaged"] = f"art/buildings/{bid}-damaged.png"
        index[bid + "-damaged"] = {"w": im.width, "h": im.height, "size": list(sz), "of": bid}
    json.dump(index, open(os.path.join(ROOT, "art/buildings/index.json"), "w"), ensure_ascii=False, indent=1)

    # 道具
    os.makedirs(os.path.join(ROOT, "art/props"), exist_ok=True)
    pidx = {}
    props = dict(PROPS)
    extra = os.path.join(RAW, "props.json")
    if os.path.exists(extra):
        for k, v in json.load(open(extra)).items():
            props[k] = (v[0], tuple(v[1]), v[2], v[3], v[4])
    for pid, (sheet, pos, w, mh, note) in props.items():
        if not os.path.exists(os.path.join(RAW, sheet + ".png")):
            missing.append("prop:" + pid); continue
        im = render(pick(sheet, pos), w, mh)
        im.save(os.path.join(ROOT, f"art/props/{pid}.png"))
        pidx[pid] = {"w": im.width, "h": im.height, "note": note}
    json.dump(pidx, open(os.path.join(ROOT, "art/props/index.json"), "w"), ensure_ascii=False, indent=1)

    preview(index, pidx)
    print("建築", len(built), "道具", len(pidx))
    if missing:
        print("缺：", ", ".join(missing))
    nosprite = [k for k in sizes if k not in index and not k.startswith("road")]
    if nosprite:
        print("B 有但沒圖：", ", ".join(nosprite))


def preview(index, pidx):
    """聯絡表：每棟放在佔地格子上（深色格線），下方標 id，3 倍放大。"""
    from PIL import ImageDraw, ImageFont
    items = [(k, f"art/buildings/{k}.png", v.get("size")) for k, v in index.items()]
    items += [(k, f"art/props/{k}.png", None) for k in pidx]
    cols, cw, ch = 8, 112, 196
    rows = (len(items) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * cw, rows * ch), (22, 20, 43, 255))
    d = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/STHeiti Medium.ttc", 10)
    except Exception:
        font = ImageFont.load_default()
    for i, (k, path, size) in enumerate(items):
        x0, y0 = (i % cols) * cw, (i // cols) * ch
        im = Image.open(os.path.join(ROOT, path))
        base_y = y0 + ch - 18
        if size:
            fw, fh = size[0] * 32, size[1] * 32
            fx = x0 + (cw - fw) // 2
            for gx in range(size[0]):
                for gy in range(size[1]):
                    d.rectangle([fx + gx * 32, base_y - fh + gy * 32, fx + gx * 32 + 31, base_y - fh + gy * 32 + 31],
                                fill=(44, 40, 72, 255), outline=(74, 68, 112, 255))
        sheet.alpha_composite(im, (x0 + (cw - im.width) // 2, base_y - im.height))
        d.text((x0 + 4, base_y + 3), k + ("" if size else " (prop)"), fill=(201, 192, 214, 255), font=font)
    sheet = sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST)
    sheet.save(os.path.join(ROOT, "art/buildings/_preview.png"))


if __name__ == "__main__":
    main()
