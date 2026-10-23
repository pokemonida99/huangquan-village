"""把 GPT 生的洋紅底像素圖轉成遊戲素材。

  走路圖：.venv/bin/python -I tools/pixelize.py sheet tools/chars_src/<id>-sheet.png art/chars/<id>.png [選項]
  頭像  ：.venv/bin/python -I tools/pixelize.py face  tools/chars_src/<id>-face.png  art/chars/<id>-face.png
  總覽  ：.venv/bin/python -I tools/pixelize.py preview art/chars art/chars/_preview.png [id ...]

走路圖：去背 → 找出 4 列 × 2 欄共 8 個角色 → 同一比例縮到 32×32（腳底貼底邊）→ 量化到 art/palette.json → 拼成 64×128。
選項：
  --height N     角色最高那格縮到 N px（預設 31；怪物、亡魂可設小一點）
  --mirror-lr    右向列改用左向列鏡像（GPT 左右畫反或畫壞時用）
  --mirror-rl    左向列改用右向列鏡像
  --swap-lr      左右兩列對調
  --rows a,b,c,d 原圖第幾列（0 起算）當 下,左,右,上，例如 0,2,1,3
  --gamma G      量化前先調暗（>1 變暗，黑髮被量成棕色時用 1.3～1.6）
  --allow a,b    放回預設禁用的顏色（#1e4a55,#2e6b73）
  --ban a,b      這張圖不准用的顏色
  --single       原圖只有一隻（怪物）：8 格都用同一張，第 2 步往上跳 1px
"""
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PALETTE = [tuple(int(c[i:i + 2], 16) for i in (1, 3, 5))
           for c in json.load(open(os.path.join(ROOT, "art/palette.json")))["colors"]]


def _lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


PAL = np.array(PALETTE, float)
PAL_LAB = _lab(PAL)


def quantize(rgb):
    """rgb: (...,3) float → 最近的調色盤顏色（Lab 距離）"""
    lab = _lab(rgb)
    d = ((lab[..., None, :] - PAL_LAB) ** 2).sum(-1)
    return PAL[d.argmin(-1)]


GAMMA = 1.0
# 角色預設不用深青（河水色），不然黑髮的灰色反光會變青綠；--allow 可以放回來
BANNED = []
# 色相權重高一點：灰色寧可變紫灰，不要變成青綠
LAB_W = np.array([1.0, 1.5, 1.5])
# 描邊與深色多給一點票，縮小後輪廓才留得住
VOTE_W = np.where(PAL.sum(1) < 200, 1.6, 1.0)


def quantize_idx(rgb):
    """rgb: (h,w,3) → 調色盤索引，分塊算省記憶體"""
    c = 255 * (np.clip(rgb, 0, 255) / 255) ** GAMMA
    out = np.empty(c.shape[:2], np.int64)
    for y in range(0, c.shape[0], 64):
        lab = _lab(c[y:y + 64])
        # 黑髮、黑衣常是偏暖的深灰，直接比會變棕色；低彩度的深色改用調色盤夜色的藍黑色相
        neutral = (lab[..., 0] < 45) & (np.hypot(lab[..., 1], lab[..., 2]) < 14)
        lab[neutral, 1] = 6
        lab[neutral, 2] = -14
        d = (((lab[..., None, :] - PAL_LAB) * LAB_W) ** 2).sum(-1)
        d[..., BANNED] = np.inf
        out[y:y + 64] = d.argmin(-1)
    return out


def remove_bg(img):
    """回傳 RGBA float 陣列，洋紅底變透明。"""
    a = np.asarray(img.convert("RGB")).astype(float)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.minimum(r, b) - g          # 洋紅程度
    bg = (mag > 90) & (r > 140) & (b > 140)
    # 邊緣的粉紅混色也去掉
    edge = (mag > 60) & (np.abs(r - b) < 70) & ndimage.binary_dilation(bg, iterations=2)
    fg = ~(bg | edge)
    fg = ndimage.binary_opening(fg, iterations=1)
    return a, fg


def find_sprites(fg, expect=8):
    """找 8 隻：先用連通塊（逐步減少膨脹），都不對就把整張平均切成 4 列 × 2 欄。"""
    for it in (max(4, fg.shape[1] // 120), 3, 1):
        try:
            return _find_sprites(fg, expect, it)
        except ValueError:
            pass
    if expect == 1:
        ys, xs = np.nonzero(fg)
        return [[(slice(ys.min(), ys.max() + 1), slice(xs.min(), xs.max() + 1))]]
    h, w = fg.shape
    rows = []
    for r in range(4):
        row = []
        for c in range(2):
            ys, xs = np.nonzero(fg[r * h // 4:(r + 1) * h // 4, c * w // 2:(c + 1) * w // 2])
            row.append((slice(r * h // 4 + ys.min(), r * h // 4 + ys.max() + 1),
                        slice(c * w // 2 + xs.min(), c * w // 2 + xs.max() + 1)))
        rows.append(row)
    print("（改用平均切格）")
    return rows


def _find_sprites(fg, expect, iters):
    h, w = fg.shape
    grow = ndimage.binary_dilation(fg, iterations=iters)
    lab, n = ndimage.label(grow)
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(fg, lab, range(1, n + 1))
    big = [i for i in range(n) if sizes[i] > sizes.max() * 0.15]
    boxes = [objs[i] for i in big]
    # 小碎片併到最近的大塊
    for i in range(n):
        if i in big or sizes[i] == 0:
            continue
        cy = (objs[i][0].start + objs[i][0].stop) / 2
        cx = (objs[i][1].start + objs[i][1].stop) / 2
        j = min(range(len(boxes)), key=lambda k: (cy - (boxes[k][0].start + boxes[k][0].stop) / 2) ** 2
                + (cx - (boxes[k][1].start + boxes[k][1].stop) / 2) ** 2)
        bj = boxes[j]
        boxes[j] = (slice(min(bj[0].start, objs[i][0].start), max(bj[0].stop, objs[i][0].stop)),
                    slice(min(bj[1].start, objs[i][1].start), max(bj[1].stop, objs[i][1].stop)))
    if len(boxes) != expect:
        raise ValueError(f"找到 {len(boxes)} 隻，不是 {expect} 隻")
    boxes.sort(key=lambda s: (s[0].start + s[0].stop) / 2)
    rows = [sorted(boxes[i:i + 2], key=lambda s: s[1].start) for i in range(0, expect, 2)]
    return rows


def vote_down(idx, m, nh, nw):
    """每個輸出格取票數最多的調色盤索引；透明是 -1。"""
    h, w = m.shape
    ey = np.linspace(0, h, nh + 1).round().astype(int)
    ex = np.linspace(0, w, nw + 1).round().astype(int)
    out = np.full((nh, nw), -1)
    for y in range(nh):
        for x in range(nw):
            bm = m[ey[y]:ey[y + 1], ex[x]:ex[x + 1]]
            if bm.size == 0 or bm.mean() < 0.45:
                continue
            votes = np.bincount(idx[ey[y]:ey[y + 1], ex[x]:ex[x + 1]][bm], minlength=len(PALETTE)) * VOTE_W
            out[y, x] = votes.argmax()
    return out


def carve(g, nh, nw):
    """2 倍圖縮回 1 倍：每兩列（欄）留一條，留「跟上下鄰居不一樣的像素」比較多的那條。
    比例不變，但眼睛、嘴巴、描邊這種只有一條細線的細節比較不會被丟掉。"""
    def pick(a, n):
        keep = []
        for i in range(n):
            cand = [r for r in (2 * i, 2 * i + 1) if r < len(a)]
            def score(r):
                up = a[r - 1] if r > 0 else np.full_like(a[r], -2)
                dn = a[r + 1] if r + 1 < len(a) else np.full_like(a[r], -2)
                uniq = (a[r] != up) & (a[r] != dn)
                return uniq.sum() + 0.5 * ((a[r] >= 0) & (PAL_LAB[np.maximum(a[r], 0), 0] < 35)).sum()
            keep.append(max(cand, key=score))
        return a[keep]
    g = pick(g, nh)
    return pick(g.T, nw).T


def despeckle(g):
    """孤立的亮色雜點（上下左右至少 3 格是同一個別的顏色）改成那個顏色；深色點（眼睛）不動。"""
    out = g.copy()
    h, w = g.shape
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            c = g[y, x]
            if c < 0 or PAL_LAB[c, 0] < 35:
                continue
            nb = [g[y - 1, x], g[y + 1, x], g[y, x - 1], g[y, x + 1]]
            for v in set(nb):
                if v != c and v >= 0 and nb.count(v) >= 3:
                    out[y, x] = v
    return out


def shrink(rgb, mask, box, scale, cell=32, foot=31, cx=None):
    """把一塊縮到 cell×cell，回傳 RGBA uint8。
    先在原解析度量化成調色盤索引，投票縮到 2 倍大小（不混色），再用 carve 刪掉多餘的列和欄。"""
    ys, xs = box
    m = mask[ys, xs]
    h, w = m.shape
    nh, nw = max(1, round(h * scale)), max(1, round(w * scale))
    idx = quantize_idx(rgb[ys, xs])
    g = despeckle(carve(vote_down(idx, m, nh * 2, nw * 2), nh, nw))
    alpha = g >= 0
    q = PAL[np.maximum(g, 0)]
    out = np.zeros((cell, cell, 4), np.uint8)
    top = foot + 1 - nh
    if cx is None:
        cx = nw / 2
    left = int(round(cell / 2 - cx))
    for y in range(nh):
        for x in range(nw):
            ty, tx = top + y, left + x
            if alpha[y, x] and 0 <= ty < cell and 0 <= tx < cell:
                out[ty, tx, :3] = q[y, x]
                out[ty, tx, 3] = 255
    return out


def outline_fix(cell):
    """透明邊上若是很亮的顏色，補一圈最深色描邊（只補在角色內部那一格）。"""
    a = cell[..., 3] > 0
    inner_edge = a & ~ndimage.binary_erosion(a)
    out = cell.copy()
    dark = np.array(PALETTE[0])
    for y, x in zip(*np.nonzero(inner_edge)):
        if cell[y, x, :3].astype(int).sum() > 330:
            out[y, x, :3] = dark if cell[y, x, :3].astype(int).sum() < 600 else PALETTE[2]
    return out


def do_sheet(src, dst, opts):
    rgb, fg = remove_bg(Image.open(src))
    single = "--single" in opts
    target = int(opts.get("--height", 31))
    if single:
        rows = [[b, b] for b in find_sprites(fg, expect=1)[0]] * 4
        rows = [[rows[0][0], rows[0][0]]] * 4
    else:
        rows = find_sprites(fg)
        order = [int(x) for x in opts.get("--rows", "0,1,2,3").split(",")]
        rows = [rows[i] for i in order]
        if "--swap-lr" in opts:
            rows[1], rows[2] = rows[2], rows[1]
    hs = [b[0].stop - b[0].start for r in rows for b in r]
    ws = [b[1].stop - b[1].start for r in rows for b in r]
    scale = min(target / max(hs), 31 / max(ws))
    sheet = np.zeros((128, 64, 4), np.uint8)
    for ri, r in enumerate(rows):
        for ci, b in enumerate(r):
            ys, xs = b
            # 每格用身體（下半部）的重心置中，走路時才不會左右晃
            mm = fg[ys, xs]
            yy, xx = np.nonzero(mm[mm.shape[0] // 2:])
            cx = (xx.mean() if len(xx) else mm.shape[1] / 2) * scale
            foot = 31 if not (single and ci == 1) else 30
            cell = shrink(rgb, fg, b, scale, foot=foot, cx=cx)
            sheet[ri * 32:(ri + 1) * 32, ci * 32:(ci + 1) * 32] = cell
    if "--mirror-lr" in opts:
        sheet[64:96] = sheet[32:64, ::-1]
        sheet[64:96] = np.concatenate([sheet[64:96, 32:], sheet[64:96, :32]], 1)  # 保持步伐順序
    if "--mirror-rl" in opts:
        sheet[32:64] = sheet[64:96, ::-1]
        sheet[32:64] = np.concatenate([sheet[32:64, 32:], sheet[32:64, :32]], 1)
    Image.fromarray(sheet).save(dst)
    print("OK", dst, f"scale={scale:.4f}")


def do_face(src, dst, opts):
    rgb, fg = remove_bg(Image.open(src))
    ys, xs = np.nonzero(fg)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    side = max(y1 - y0, x1 - x0)
    cx = (x0 + x1) // 2
    # 正方形：上緣貼頭頂，左右以角色中心對齊，下緣超出就裁掉（胸口）
    bx0 = cx - side // 2
    box = (slice(y0, y0 + side), slice(max(0, bx0), bx0 + side))
    pad = np.zeros((side, side, 3))
    pm = np.zeros((side, side), bool)
    sy = rgb[box]
    off = max(0, -bx0)
    pad[:sy.shape[0], off:off + sy.shape[1]] = sy
    pm[:sy.shape[0], off:off + sy.shape[1]] = fg[box]
    cell = shrink(pad, pm, (slice(0, side), slice(0, side)), 64 / side, cell=64, foot=63, cx=32)
    Image.fromarray(cell).save(dst)
    print("OK", dst)


def do_preview(folder, dst, only=None):
    if only:
        only = [n for n in only if os.path.exists(os.path.join(folder, n + ".png"))]
    names = only or sorted(f[:-4] for f in os.listdir(folder)
                   if f.endswith(".png") and not f.endswith("-face.png") and not f.startswith("_"))
    S = 3
    cw, ch = 64 * S + 64 * 2 + 30, 128 * S + 40
    cols = 6
    rows = (len(names) + cols - 1) // cols
    im = Image.new("RGBA", (cols * cw, rows * ch), (79, 122, 58, 255))
    from PIL import ImageDraw, ImageFont
    d = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 18)
    except OSError:
        font = None
    for i, n in enumerate(names):
        x, y = (i % cols) * cw + 10, (i // cols) * ch + 8
        sp = Image.open(os.path.join(folder, n + ".png")).resize((64 * S, 128 * S), Image.NEAREST)
        im.alpha_composite(sp, (x, y + 24))
        fp = os.path.join(folder, n + "-face.png")
        if os.path.exists(fp):
            im.alpha_composite(Image.open(fp).convert("RGBA").resize((128, 128), Image.NEAREST), (x + 64 * S + 10, y + 24))
        d.text((x, y), n, fill=(243, 235, 221), font=font)
    im.save(dst)
    print("OK", dst, len(names))


def main():
    mode, src, dst, *rest = sys.argv[1:]
    opts = {}
    it = iter(rest)
    for a in it:
        opts[a] = next(it) if a in ("--height", "--rows", "--gamma", "--allow", "--ban") else True
    global GAMMA
    GAMMA = float(opts.get("--gamma", 1.0))
    hexes = ["#%02x%02x%02x" % c for c in PALETTE]
    ban = {"#1e4a55", "#2e6b73"} - set(opts.get("--allow", "").split(","))
    ban |= set(x for x in opts.get("--ban", "").split(",") if x)
    BANNED[:] = [hexes.index(h) for h in ban]
    if mode == "preview":
        return do_preview(src, dst, rest or None)
    {"sheet": do_sheet, "face": do_face}[mode](src, dst, opts)


if __name__ == "__main__":
    main()
