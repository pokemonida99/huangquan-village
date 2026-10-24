"""主畫面圖示：用遊戲現有美術合成（不另外生圖），外加金屬框。
輸出 art/_raw/icons/icon-<n>.png（1024）與 _preview.png。"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
bright = lambda im, k=1.35: ImageEnhance.Brightness(im.convert('RGB')).enhance(k).convert('RGBA')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = lambda p: os.path.join(ROOT, p)
S = 1024; R = 230; RING = 46

def rmask(size, r, inset=0):
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).rounded_rectangle([inset, inset, size - 1 - inset, size - 1 - inset], r, fill=255); return m

def frame(content, metal='gold'):
    """content：1024 方圖。外圈金屬框＋內緣深線＋亮線＋內陰影"""
    if metal == 'gold': stops = [(255, 243, 196), (226, 182, 90), (138, 90, 30), (243, 213, 140), (180, 128, 48)]
    else: stops = [(250, 250, 255), (190, 196, 210), (110, 116, 132), (220, 224, 236), (150, 156, 170)]
    ring = Image.new('RGB', (S, S))
    d = ImageDraw.Draw(ring)
    for y in range(S):   # 由上到下的金屬漸層（五段）
        t = y / (S - 1) * (len(stops) - 1); i = min(int(t), len(stops) - 2); f = t - i
        c = tuple(int(stops[i][k] * (1 - f) + stops[i + 1][k] * f) for k in range(3)); d.line([(0, y), (S, y)], fill=c)
    out = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    out.paste(ring, (0, 0), rmask(S, R))
    inner = content.convert('RGBA').resize((S - 2 * RING, S - 2 * RING), Image.LANCZOS)
    # 內陰影
    sh = Image.new('RGBA', inner.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle([0, 0, inner.size[0] - 1, inner.size[1] - 1], R - RING, outline=(0, 0, 0, 150), width=14)
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    inner.alpha_composite(sh)
    out.paste(inner, (RING, RING), rmask(S - 2 * RING, R - RING))
    d2 = ImageDraw.Draw(out)
    d2.rounded_rectangle([RING - 4, RING - 4, S - RING + 3, S - RING + 3], R - RING + 4, outline=(40, 22, 10, 255), width=5)   # 內緣深線
    d2.rounded_rectangle([10, 10, S - 11, S - 11], R - 10, outline=(255, 250, 225, 170), width=3)                              # 外圈亮線
    return out

def nearest(im, scale): return im.resize((im.width * scale, im.height * scale), Image.NEAREST)
def crop_sq(im, cx, cy, side):
    return im.crop((int(cx - side / 2), int(cy - side / 2), int(cx + side / 2), int(cy + side / 2))).resize((S, S), Image.LANCZOS)

title = Image.open(A('art/_raw/title/title-v2.png')).convert('RGBA')        # 1024×1536
review = Image.open(A('art/_raw/review/bg.png')).convert('RGBA')
face = lambda i: Image.open(A('art/chars/%s-face.png' % i)).convert('RGBA')
sheet = lambda i: Image.open(A('art/chars/%s.png' % i)).convert('RGBA')
icons = []

# 1. 三人揮手（標題主視覺裁切，拉近到上半身）
icons.append(('三人揮手', frame(bright(crop_sq(title, 512, 1195, 520), 1.2), 'gold')))

# 2. 語彤＋月老：GPT 照遊戲頭像畫的 3/4 側身版（art/_raw/icons/*-34.png），兩人面對面、放大
import sys; sys.path.insert(0, os.path.join(ROOT, 'tools')); import tiles_pixelize as TP, numpy as np
def cutout(path, size):
    im = Image.open(path).convert('RGB'); rgba = TP.to_rgba(im)
    a = Image.fromarray(rgba[..., 3]).filter(ImageFilter.MinFilter(5))   # 去掉洋紅邊
    out = Image.fromarray(rgba[..., :3]).convert('RGBA'); out.putalpha(a)
    bb = out.getbbox(); out = out.crop(bb)
    k = size / out.height; return out.resize((int(out.width * k), size), Image.LANCZOS)
c = bright(crop_sq(title, 300, 760, 520).filter(ImageFilter.GaussianBlur(3)), 1.5)
yl = cutout(A('art/_raw/icons/yuelao-34.png'), 700); yt = cutout(A('art/_raw/icons/yutong-34.png'), 700)
c.alpha_composite(yl, (-90, S - yl.height)); c.alpha_composite(yt, (S - yt.width + 90, S - yt.height))
icons.append(('語彤＋月老', frame(c, 'gold')))

# 3. 三人頭像（語彤在中間最大），提亮的黃昏天空、銀框
c = bright(crop_sq(title, 512, 330, 640), 1.4)
for (cid, x, y, k) in [('yuelao', -60, 512, 8), ('lee', 572, 512, 8), ('yutong', 224, 448, 9)]:
    c.alpha_composite(nearest(face(cid), k), (x, y))
icons.append(('三人頭像', frame(c, 'silver')))

# 4. 開羅風：三個大一點的走路小人站在燒肉店前
c = Image.new('RGBA', (256, 256), (122, 196, 96, 255))
dd = ImageDraw.Draw(c); dd.rectangle([0, 0, 256, 44], fill=(150, 196, 236, 255)); dd.rectangle([0, 206, 256, 256], fill=(232, 200, 136, 255))
shop = nearest(Image.open(A('art/iso/yakiniku.png')).convert('RGBA'), 2)
c.alpha_composite(shop, ((256 - shop.width) // 2, 150 - shop.height))
for n, cid in enumerate(['yuelao', 'yutong', 'lee']):
    sp = nearest(sheet(cid).crop((0, 0, 32, 32)), 3); c.alpha_composite(sp, (-6 + n * 84, 156))
icons.append(('燒肉店前', frame(nearest(c, 4), 'gold')))

os.makedirs(A('art/_raw/icons'), exist_ok=True)
prev = Image.new('RGB', (4 * 290 + 30, 330), (240, 236, 228)); pd = ImageDraw.Draw(prev)
for n, (name, im) in enumerate(icons):
    im.save(A('art/_raw/icons/icon-%d.png' % (n + 1)))
    prev.paste(im.resize((260, 260), Image.LANCZOS), (20 + n * 290, 20), im.resize((260, 260), Image.LANCZOS))
    pd.text((20 + n * 290 + 110, 295), str(n + 1), fill=(60, 40, 30))
prev.save(A('art/_raw/icons/_preview.png')); print('ok')
