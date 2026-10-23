"""E 線：把 GPT 生成的大圖（洋紅底）切成單張像素圖，縮到指定寬度並量化到 art/palette.json。

用法：
  .venv/bin/python -I tools/tiles_pixelize.py cut  <raw.png> <out_dir> --min-area 4000
      → 依洋紅底找出各物件，存成 out_dir/obj_<n>.png（原解析度、透明底），並印出 bbox，方便目檢對號。
  .venv/bin/python -I tools/tiles_pixelize.py px   <obj.png> <out.png> --w 64 [--outline]
      → 裁掉透明邊、等比縮到寬 w（高度依比例）、量化到調色盤、可加 1px 深色外框。
"""
import json, sys, argparse, os
from PIL import Image, ImageFilter
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAL = np.array([[int(c[i:i + 2], 16) for i in (1, 3, 5)]
                for c in json.load(open(os.path.join(ROOT, "art/palette.json")))["colors"]], dtype=np.float32)
OUTLINE = (13, 11, 26)


def magenta_mask(rgb):
    """True = 背景。洋紅：R、B 高、G 低。"""
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    return (r > 185) & (b > 185) & (g < 100) & (abs(r - b) < 60)


def to_rgba(img):
    rgb = np.array(img.convert("RGB"))
    bg = magenta_mask(rgb)
    # 去掉洋紅溢色：邊緣像素中 R、B 遠大於 G 的偏紫色，往暗處壓
    a = np.where(bg, 0, 255).astype(np.uint8)
    return np.dstack([rgb, a])


def components(alpha, min_area):
    """簡單的連通區塊（4 連通），回傳 bbox 清單。"""
    from collections import deque
    h, w = alpha.shape
    seen = np.zeros_like(alpha, dtype=bool)
    fg = alpha > 0
    boxes = []
    # 先把前景膨脹一點，讓同一棟建築的零碎部分（煙、燈籠）連在一起
    fgimg = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))
    fg2 = np.array(fgimg) > 0
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            if fg2[y, x] and not seen[y, x]:
                q = deque([(y, x)]); seen[y, x] = True
                x0 = x1 = x; y0 = y1 = y; n = 0
                while q:
                    cy, cx = q.popleft(); n += 1
                    x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                        if 0 <= ny < h and 0 <= nx < w and fg2[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True; q.append((ny, nx))
                if n >= min_area:
                    boxes.append((x0, y0, x1 + 1, y1 + 1, n))
    boxes.sort(key=lambda b: (round(b[1] / 200), b[0]))
    return boxes


def quantize(rgb):
    flat = rgb.reshape(-1, 3).astype(np.float32)
    # 加權距離（人眼對綠較敏感）
    wts = np.array([0.30, 0.59, 0.11], dtype=np.float32) * 3
    d = (((flat[:, None, :] - PAL[None, :, :]) ** 2) * wts).sum(-1)
    return PAL[d.argmin(1)].reshape(rgb.shape).astype(np.uint8)


def pixelize(rgba, w, outline=False, alpha_cut=0.5, sat=1.0):
    ys, xs = np.where(rgba[..., 3] > 0)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    H, W = rgba.shape[:2]
    inner = w - 2 if outline else w
    h = max(1, round(H * inner / W))
    a = rgba[..., 3:4].astype(np.float32) / 255
    pre = rgba[..., :3].astype(np.float32) * a
    pre_s = np.array(Image.fromarray(np.clip(pre, 0, 255).astype(np.uint8)).resize((inner, h), Image.BOX), dtype=np.float32)
    a_s = np.array(Image.fromarray((a[..., 0] * 255).astype(np.uint8)).resize((inner, h), Image.BOX), dtype=np.float32) / 255
    col = pre_s / np.maximum(a_s[..., None], 1e-3)
    if sat != 1.0:
        g = col.mean(-1, keepdims=True); col = g + (col - g) * sat
    col = np.clip(col, 0, 255)
    q = quantize(col)
    alpha = (a_s >= alpha_cut)
    out = np.zeros((h, inner, 4), np.uint8)
    out[..., :3] = q; out[..., 3] = alpha * 255
    if outline:
        big = np.zeros((h + 2, w, 4), np.uint8)
        big[1:-1, 1:-1] = out
        m = big[..., 3] > 0
        ring = np.zeros_like(m)
        ring[1:, :] |= m[:-1, :]; ring[:-1, :] |= m[1:, :]; ring[:, 1:] |= m[:, :-1]; ring[:, :-1] |= m[:, 1:]
        ring &= ~m
        big[ring] = (*OUTLINE, 255)
        # 底邊不加外框，貼齊地面
        out = big[:-1]
    return Image.fromarray(out, "RGBA")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd"); ap.add_argument("src"); ap.add_argument("dst")
    ap.add_argument("--min-area", type=int, default=4000)
    ap.add_argument("--w", type=int, default=64)
    ap.add_argument("--outline", action="store_true")
    a = ap.parse_args()
    if a.cmd == "cut":
        rgba = to_rgba(Image.open(a.src))
        os.makedirs(a.dst, exist_ok=True)
        for i, (x0, y0, x1, y1, n) in enumerate(components(rgba[..., 3], a.min_area)):
            Image.fromarray(rgba[y0:y1, x0:x1], "RGBA").save(f"{a.dst}/obj_{i}.png")
            print(i, (x0, y0, x1, y1), n)
    elif a.cmd == "px":
        pixelize(np.array(Image.open(a.src).convert("RGBA")), a.w, a.outline).save(a.dst)


if __name__ == "__main__":
    main()
