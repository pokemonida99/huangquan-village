"""把 GPT 畫的等角建築大圖（洋紅底）切開、縮成遊戲尺寸，寫進 art/iso/。

用法：.venv/bin/python -I tools/iso_import.py art/_raw/iso/<sheet>.png id1 id2 ...
  - 物件依「由上到下、由左到右」對到 id（跟 iso_gen.sh 參考圖的排列一樣）
  - 寬度 = 佔地 (寬+高) × 24 px（等角菱形一格 48×24），高度照比例
  - 顏色：每張圖自己的 40 色（開羅風比較亮，不壓到舊的夜色調色盤）
  - id 寫成 train-loco / train-car 時寬度用列車的尺寸
更新 art/iso/index.json：{ id: { size: [w, h], px: [寬, 高] } }
"""
import json, os, re, sys
import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tiles_pixelize as P

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "art/iso")
TRAIN_W = round((2 + 0.8) * 24)


def sizes():
    """讀 data/buildings.js 的 size（簡單用正規式，不跑 JS）"""
    src = open(os.path.join(ROOT, "data/buildings.js"), encoding="utf-8").read()
    out = {}
    for m in re.finditer(r'id:\s*"([\w-]+)"[^{}]*?size:\s*\[(\d+),\s*(\d+)\]', src):
        out[m.group(1)] = (int(m.group(2)), int(m.group(3)))
    return out


def shrink(rgba, w):
    """等比縮到寬 w：先用 BOX 平均，再自適應 40 色、透明度二值化、加 1px 深色外框"""
    ys, xs = np.where(rgba[..., 3] > 0)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    H, W = rgba.shape[:2]
    inner = w - 2
    h = max(1, round(H * inner / W))
    a = rgba[..., 3:4].astype(np.float32) / 255
    pre = Image.fromarray(np.clip(rgba[..., :3] * a, 0, 255).astype(np.uint8)).resize((inner, h), Image.BOX)
    a_s = np.array(Image.fromarray((a[..., 0] * 255).astype(np.uint8)).resize((inner, h), Image.BOX), dtype=np.float32) / 255
    col = np.array(pre, dtype=np.float32) / np.maximum(a_s[..., None], 1e-3)
    col = Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).quantize(40, method=Image.MEDIANCUT).convert("RGB")
    out = np.zeros((h + 2, w, 4), np.uint8)
    out[1:-1, 1:-1, :3] = np.array(col)
    out[1:-1, 1:-1, 3] = (a_s >= 0.5) * 255
    m = out[..., 3] > 0
    ring = np.zeros_like(m)
    ring[1:, :] |= m[:-1, :]; ring[:-1, :] |= m[1:, :]; ring[:, 1:] |= m[:, :-1]; ring[:, :-1] |= m[:, 1:]
    ring &= ~m
    out[ring] = (*P.OUTLINE, 255)
    return Image.fromarray(np.ascontiguousarray(out[:-1]))   # 底邊不加外框，貼地


def main():
    raw, ids = sys.argv[1], sys.argv[2:]
    rgba = P.to_rgba(Image.open(raw))
    boxes = P.components(rgba[..., 3], 6000)
    # 依列分組：中心點 y 差不到物件平均高度一半的算同一列
    boxes = sorted(boxes, key=lambda b: (b[1] + b[3]) / 2)
    rows, avg = [], np.mean([b[3] - b[1] for b in boxes]) if boxes else 1
    for b in boxes:
        cy = (b[1] + b[3]) / 2
        if rows and abs(cy - rows[-1][0]) < avg / 2: rows[-1][1].append(b)
        else: rows.append([cy, [b]])
    order = [b for _, r in rows for b in sorted(r, key=lambda b: b[0])]
    if len(order) != len(ids):
        print("找到 %d 個物件，但給了 %d 個 id：" % (len(order), len(ids)), [b[:4] for b in order]); sys.exit(1)
    S = sizes()
    idx_path = os.path.join(OUT, "index.json")
    idx = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    os.makedirs(OUT, exist_ok=True)
    for b, i in zip(order, ids):
        crop = rgba[b[1]:b[3], b[0]:b[2]].copy()
        if i.startswith("train-"): w, size = TRAIN_W, None
        else:
            size = S.get(re.sub(r"-(damaged|r)$", "", i), (1, 1)); w = (size[0] + size[1]) * 24
        img = shrink(crop, w)
        img.save(os.path.join(OUT, i + ".png"))
        if i.startswith("train-"): idx["_train"] = True
        elif i.endswith("-r"):   # 轉向圖（iso_turn.sh）：只記版本，不動原本的資料
            e = idx.setdefault(i[:-2], {}); e["turn"] = e.get("turn", 0) + 1
        elif not i.endswith("-damaged"):
            idx[i] = {"size": list(size), "px": [img.width, img.height]}
        elif i.endswith("-damaged"):
            idx.setdefault(i[:-8], {})["damaged"] = True
        print(i, img.size)
    json.dump(idx, open(idx_path, "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
