"""E 線：用程式畫地面 tileset（32×32 一格），保證無縫、只用 art/palette.json 的顏色。

輸出 art/tiles/ground.png 與 art/tiles/index.json。
執行：.venv/bin/python -I tools/tiles_ground.py

圖層建議（A 線引擎）：
  1. 底層：grass / stone / dirt / barren / water（水用 water_0、water_1 每 0.5 秒交替）
  2. 河岸層：bank_*（透明處露出底下的水；水格底下一律先畫 water）
  3. 橋：bridge_*（畫在水上）
  4. 點綴：lily_*、grass_tuft、pebbles（透明疊圖）
  5. 未開放土地：fog_*（半透明，疊在最上面）
"""
import json, os, random
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COL = json.load(open(os.path.join(ROOT, "art/palette.json")))["colors"]
def c(i, a=255):
    h = COL[i]; return (int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16), a)

# 調色盤索引
NIGHT0, NIGHT1, NIGHT2, NIGHT3, NIGHT4, NIGHT5, NIGHT6 = range(7)
GREY, PALE, CREAM, WHITE = 7, 8, 9, 10
W0, W1, W2, W3 = 11, 12, 13, 14
G0, G1, G2 = 15, 16, 17
WOOD0, WOOD1, WOOD2, GOLD, GOLD2 = 18, 19, 20, 21, 22
RED0, RED1, RED2, RED3, SKIN = 23, 24, 25, 26, 27
PUR0, PUR1, HAN0, HAN1 = 28, 29, 30, 31

T = 32
tiles = []   # (name, Image, note)


def new(fill=None):
    return Image.new("RGBA", (T, T), c(fill) if fill is not None else (0, 0, 0, 0))


def speckle(im, rng, colors, n, wrap=True):
    px = im.load()
    for _ in range(n):
        x, y = rng.randrange(T), rng.randrange(T)
        px[x, y] = c(rng.choice(colors))


def grass(seed, flowers=False):
    rng = random.Random(seed)
    im = new(G1); px = im.load()
    # 夜色：大塊略暗的斑
    for _ in range(9):
        cx, cy, r = rng.randrange(T), rng.randrange(T), rng.randrange(3, 7)
        for y in range(-r, r + 1):
            for x in range(-r, r + 1):
                if x * x + y * y <= r * r and rng.random() < 0.7:
                    px[(cx + x) % T, (cy + y) % T] = c(G0)
    # 草葉：短豎線
    for _ in range(14):
        x, y = rng.randrange(T), rng.randrange(T)
        px[x, y] = c(G2); px[x, (y + 1) % T] = c(G1)
    for _ in range(10):
        x, y = rng.randrange(T), rng.randrange(T)
        px[x, y] = c(HAN0)
    if flowers:
        for _ in range(4):
            x, y = rng.randrange(1, T - 1), rng.randrange(1, T - 1)
            px[x, y] = c(RED2); px[x + 1, y] = c(RED1); px[x, y - 1] = c(RED3)
    return im


def stone(seed, red=False):
    """石板路：不規則圓石（Voronoi，可無縫重複）。"""
    rng = random.Random(seed)
    pts = []
    for gy in range(4):
        for gx in range(4):
            pts.append((gx * 8 + rng.randrange(1, 7), gy * 8 + rng.randrange(1, 7), rng.choice([NIGHT5, NIGHT6, NIGHT6, PUR0] if red else [NIGHT5, NIGHT6, NIGHT6, GREY])))
    def near(x, y):
        best = []
        for px_, py_, col in pts:
            for ox in (-T, 0, T):
                for oy in (-T, 0, T):
                    d = (x - px_ - ox) ** 2 + (y - py_ - oy) ** 2
                    best.append((d, col, px_ + ox, py_ + oy))
        best.sort()
        return best[0], best[1]
    im = new(NIGHT3); px = im.load()
    for y in range(T):
        for x in range(T):
            (d0, col, cx, cy), (d1, *_ ) = near(x, y)
            if d1 ** 0.5 - d0 ** 0.5 < 1.3:
                px[x, y] = c(NIGHT2)
            else:
                # 左上受光、右下陰影
                if x - cx < -1 and y - cy < -1 and d0 > 4: px[x, y] = c((RED2 if col == RED1 else RED1) if red and col in (RED0, RED1) else (GREY if col != GREY else PALE))
                elif x - cx > 1 and y - cy > 1 and d0 > 4: px[x, y] = c(NIGHT4)
                else: px[x, y] = c(col)
    speckle(im, rng, [NIGHT4], 8)
    if red:
        # 紅線：一條金紅細線斜穿過，四邊中點進出，任何方向接起來都連續
        for i in range(T):
            y = 16 + round(3 * __import__("math").sin(i / T * 2 * 3.14159))
            px[i, y] = c(RED2); px[i, y + 1] = c(RED0)
        for i in range(T):
            x = 16 + round(3 * __import__("math").sin(i / T * 2 * 3.14159))
            px[x, i] = c(RED2); px[x + 1, i] = c(RED0)
        px[16, 16] = c(GOLD2); px[17, 16] = c(GOLD); px[16, 17] = c(GOLD)
    return im


def dirt(seed, barren=False):
    rng = random.Random(seed)
    base, dark, light = (WOOD0, NIGHT3, WOOD1) if barren else (WOOD1, WOOD0, WOOD2)
    im = new(base); px = im.load()
    for _ in range(5):
        cx, cy, r = rng.randrange(T), rng.randrange(T), rng.randrange(3, 6)
        for y in range(-r, r + 1):
            for x in range(-r, r + 1):
                if x * x + y * y <= r * r and rng.random() < 0.5:
                    px[(cx + x) % T, (cy + y) % T] = c(dark)
    speckle(im, rng, [light], 22)
    speckle(im, rng, [dark], 18)
    if barren:
        # 枯草、裂痕
        for _ in range(8):
            x, y = rng.randrange(T), rng.randrange(T)
            px[x, y] = c(GREY); px[x, (y + 1) % T] = c(NIGHT5)
        for _ in range(1):
            x, y = rng.randrange(T), rng.randrange(T)
            for k in range(rng.randrange(4, 7)):
                px[(x + k) % T, (y + (k // 2)) % T] = c(NIGHT1)
    return im


def water(frame):
    rng = random.Random(77)
    im = new(W1); px = im.load()
    for y in range(T):
        for x in range(T):
            if (x * 3 + y * 5) % 23 < 6 and rng.random() < 0.6:
                px[x, y] = c(W0)
    # 波紋：短橫線，第二格往右下移 4 px
    rng = random.Random(5)
    for _ in range(9):
        x, y, L = rng.randrange(T), rng.randrange(T), rng.randrange(3, 6)
        dx = 4 * frame; dy = 2 * frame
        for k in range(L):
            px[(x + k + dx) % T, (y + dy) % T] = c(W2)
        px[(x + 1 + dx) % T, (y + dy) % T] = c(W3)
    for _ in range(3):
        x, y = rng.randrange(T), rng.randrange(T)
        px[(x + 4 * frame) % T, (y + 2 * frame) % T] = c(W3)
    # 漂在水上的彼岸花瓣
    x, y = (7 + 5 * frame) % T, (21 + frame) % T
    px[x, y] = c(RED2)
    return im


# ---------- 河岸：草地壓在水上，透明處露出水 ----------
def bank_mask(kind):
    """回傳 32×32 的「陸地」布林遮罩。
    n/s/w/e：水在那一側（直岸）。
    nw/ne/sw/se：水在兩側（陸地凸角，例如 nw＝北和西都是水，陸地只剩東南）。
    inw/ine/isw/ise：只有那個斜角是水（陸地凹角）。"""
    A, B, R = 14, 18, 6   # 岸線位置（西/北側 14，東/南側 18），轉角半徑
    def wob(i):  # 岸線輕微起伏，靠近格邊歸零確保接得起來
        return 0 if i < 4 or i > T - 5 else [0, 1, 1, 0, -1, -1, 0, 1][(i // 3) % 8]
    m = [[True] * T for _ in range(T)]
    for y in range(T):
        for x in range(T):
            if kind == "n": land = y >= A + wob(x)
            elif kind == "s": land = y < B + wob(x)
            elif kind == "w": land = x >= A + wob(y)
            elif kind == "e": land = x < B + wob(y)
            else:
                k = kind.lstrip("i")
                bx = A if "w" in k else B          # 轉角的 x 界線
                by = A if "n" in k else B
                sx = -1 if "w" in k else 1         # 水所在的方向
                sy = -1 if "n" in k else 1
                inx = (x - bx) * sx >= 0 if sx > 0 else x < bx
                iny = (y - by) * sy >= 0 if sy > 0 else y < by
                if kind.startswith("i"):
                    water = inx and iny
                    # 水角圓弧：圓心在水區內 R 處
                    cx, cy = bx + sx * R, by + sy * R
                    if water and (x - cx) * sx < 0 and (y - cy) * sy < 0 and (x - cx) ** 2 + (y - cy) ** 2 > R * R:
                        water = False
                    land = not water
                else:
                    land = (not inx) and (not iny)
                    cx, cy = bx - sx * R, by - sy * R
                    if land and (x - cx) * sx > 0 and (y - cy) * sy > 0 and (x - cx) ** 2 + (y - cy) ** 2 > R * R:
                        land = False
            m[y][x] = land
    return m


def bank(kind, seed):
    g = grass(seed)
    m = bank_mask(kind)
    im = new(); px = im.load(); gp = g.load()
    for y in range(T):
        for x in range(T):
            if m[y][x]:
                px[x, y] = gp[x, y]
    # 岸邊石塊：陸地邊緣 2 px 灰石，面向水的那面加深
    out = new(); op = out.load()
    for y in range(T):
        for x in range(T):
            if not m[y][x]:
                continue
            near = [(x + dx, y + dy) for dx in (-3, -2, -1, 0, 1, 2, 3) for dy in (-3, -2, -1, 0, 1, 2, 3)
                    if 0 <= x + dx < T and 0 <= y + dy < T and not m[y + dy][x + dx]]
            if near:
                dist = min(abs(nx - x) + abs(ny - y) for nx, ny in near)
                op[x, y] = c(NIGHT3 if dist == 1 else (NIGHT6 if dist == 2 else (GREY if (x // 3 + y // 2) % 4 else PALE)))
            else:
                op[x, y] = px[x, y]
    # 3/4 視角：陸地在上、水在下時，岸下露出 3 px 石壁
    for y in range(T):
        for x in range(T):
            if m[y][x]:
                continue
            for k, col in ((1, NIGHT5), (2, NIGHT5), (3, NIGHT4), (4, NIGHT3), (5, W0)):
                if y - k >= 0 and m[y - k][x] and all(not m[y - j][x] for j in range(0, k)):
                    op[x, y] = c(col if (x // 5 + k) % 4 else NIGHT2)
                    break
    return out


def bridge(kind):
    """木橋：v=南北向（跨東西流的河），h=東西向。_a=起點端、_m=中段、_b=終點端。"""
    im = new(); d = ImageDraw.Draw(im)
    vertical = kind.startswith("v")
    part = kind[-1]
    for i in range(T):
        # 橋板
        for j in range(4, 28):
            col = WOOD1 if (i // 4) % 2 == 0 else WOOD2
            if i % 4 == 3: col = WOOD0
            xy = (j, i) if vertical else (i, j)
            im.putpixel(xy, c(col))
        # 欄杆
        for j in (2, 3, 28, 29):
            col = RED1 if j in (2, 28) else RED0
            xy = (j, i) if vertical else (i, j)
            im.putpixel(xy, c(col))
    # 欄杆柱＋燈籠在兩端
    if part in "ab":
        at = 1 if part == "a" else T - 6
        for j in (1, 26):
            for k in range(5):
                for l in range(5):
                    xy = (j + l, at + k) if vertical else (at + k, j + l)
                    im.putpixel(xy, c(RED0 if (k in (0, 4) or l in (0, 4)) else RED1))
            xy = (j + 2, at + 2) if vertical else (at + 2, j + 2)
            im.putpixel(xy, c(GOLD2))
    return im


def lily(seed, n):
    """彼岸花叢（透明疊圖）。"""
    rng = random.Random(seed)
    im = new(); px = im.load()
    for _ in range(n):
        x, y = rng.randrange(4, T - 4), rng.randrange(8, T - 2)
        # 莖
        for k in range(1, 5):
            px[x, y - k + 4 if y - k + 4 < T else T - 1] = c(G0 if k % 2 else HAN0)
        # 花：放射狀紅色細瓣
        cx, cy = x, y - 1
        for dx, dy, col in [(0, 0, RED3), (-1, 0, RED2), (1, 0, RED2), (0, -1, RED2), (-2, -1, RED1), (2, -1, RED1),
                            (-1, -2, RED2), (1, -2, RED2), (-2, 1, RED1), (2, 1, RED1), (0, -2, RED1)]:
            if 0 <= cx + dx < T and 0 <= cy + dy < T:
                px[cx + dx, cy + dy] = c(col)
    return im


def tuft(seed):
    rng = random.Random(seed)
    im = new(); px = im.load()
    for _ in range(5):
        x, y = rng.randrange(6, 26), rng.randrange(14, 28)
        for k in range(3):
            px[x - 1 + k, y - (1 if k == 1 else 0) - 1] = c(G2)
            px[x - 1 + k, y] = c(G0)
    return im


def pebbles(seed):
    rng = random.Random(seed)
    im = new(); px = im.load()
    for _ in range(5):
        x, y = rng.randrange(3, 28), rng.randrange(3, 28)
        px[x, y] = c(PALE); px[x + 1, y] = c(GREY); px[x, y + 1] = c(NIGHT4); px[x + 1, y + 1] = c(NIGHT4)
    return im


def fog(variant):
    """未開放土地的霧：半透明紫灰，渦紋。variant 0/1 交替避免重複感。"""
    rng = random.Random(900 + variant)
    im = new(); px = im.load()
    for y in range(T):
        for x in range(T):
            px[x, y] = c(NIGHT2, 205)
    for _ in range(7):
        cx, cy, r = rng.randrange(T), rng.randrange(T), rng.randrange(4, 9)
        for y in range(-r, r + 1):
            for x in range(-r, r + 1):
                d2 = x * x + y * y
                if d2 <= r * r:
                    px[(cx + x) % T, (cy + y) % T] = c(NIGHT4 if d2 > (r - 2) ** 2 else NIGHT3, 215)
    for _ in range(4):
        cx, cy = rng.randrange(T), rng.randrange(T)
        for k in range(6):
            px[(cx + k) % T, cy] = c(GREY, 150)
    return im


def fog_edge(side):
    """霧的邊緣（霧在格子的 side 那一半，往外漸淡），讓鎖住的區塊邊界柔和。"""
    base = fog(0); im = new(); bp = base.load(); px = im.load()
    for y in range(T):
        for x in range(T):
            t = {"n": 1 - y / T, "s": y / T, "w": 1 - x / T, "e": x / T}[side]
            # 鋸齒狀抖動：用 Bayer 4×4 決定這格保留與否
            bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][y % 4][x % 4] / 16
            if t * 1.4 - 0.2 > bayer:
                px[x, y] = bp[x, y]
    return im


def build():
    for i in range(3):
        tiles.append((f"grass_{i}", grass(10 + i), "草地（三種隨機交替）"))
    tiles.append(("grass_flower", grass(20, True), "草地＋零星彼岸花"))
    tiles.append(("stone_0", stone(1), "石板路"))
    tiles.append(("stone_1", stone(2), "石板路（變化）"))
    tiles.append(("dirt_0", dirt(3), "土路"))
    tiles.append(("dirt_1", dirt(4), "土路（變化）"))

    tiles.append(("water_0", water(0), "三途川水 第 1 格（動畫）"))
    tiles.append(("water_1", water(1), "三途川水 第 2 格（動畫，每 0.5 秒交替）"))
    tiles.append(("barren_0", dirt(30, True), "荒岸（街外荒地）"))
    tiles.append(("barren_1", dirt(31, True), "荒岸（變化）"))
    for i, k in enumerate(["lily_a", "lily_b"]):
        tiles.append((k, lily(40 + i, 4 + i * 2), "彼岸花叢（透明疊圖）"))
    tiles.append(("grass_tuft", tuft(50), "草叢（透明疊圖）"))
    tiles.append(("pebbles", pebbles(51), "碎石（透明疊圖）"))

    for i, k in enumerate(["n", "s", "w", "e", "nw", "ne", "sw", "se"]):
        tiles.append((f"bank_{k}", bank(k, 60 + i),
                      f"河岸：水在{dict(n='北', s='南', w='西', e='東', nw='北與西（陸地凸角在東南）', ne='北與東', sw='南與西', se='南與東')[k]}（透明處＝水，底下先畫 water）"))
    for i, k in enumerate(["inw", "ine", "isw", "ise"]):
        tiles.append((f"bank_{k}", bank(k, 70 + i),
                      f"河岸凹角：只有{dict(inw='西北', ine='東北', isw='西南', ise='東南')[k]}斜角是水（透明處＝水）"))
    for k in ["v_a", "v_m", "v_b", "h_a", "h_m", "h_b"]:
        tiles.append((f"bridge_{k}", bridge(k),
                      ("南北向" if k[0] == "v" else "東西向") + "木橋：" + dict(a="北端/西端（含燈柱）", m="中段", b="南端/東端（含燈柱）")[k[-1]]))
    tiles.append(("redline_0", stone(5, red=True), "紅線步道（B 的 road-red）"))
    tiles.append(("redline_1", stone(6, red=True), "紅線步道（變化）"))
    tiles.append(("fog_0", fog(0), "未開放土地的霧（半透明，疊最上層）"))
    tiles.append(("fog_1", fog(1), "霧（變化）"))
    for k in "nswe":
        tiles.append((f"fog_edge_{k}", fog_edge(k), f"霧的邊緣：霧在{dict(n='北', s='南', w='西', e='東')[k]}側，往外漸淡"))


def main():
    build()
    cols = 8
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * T, rows * T), (0, 0, 0, 0))
    index = {"tile": T, "cols": cols, "file": "art/tiles/ground.png", "anim": {"water": ["water_0", "water_1"], "ms": 500}, "tiles": {}}
    for i, (name, im, note) in enumerate(tiles):
        x, y = (i % cols) * T, (i // cols) * T
        sheet.paste(im, (x, y))
        index["tiles"][name] = {"x": x, "y": y, "i": i, "note": note}
    # 別名：data/buildings.js 的道路用 ground.png#dirt / #stone / #redline
    index["alias"] = {"dirt": "dirt_0", "stone": "stone_0", "redline": "redline_0", "grass": "grass_0", "water": "water_0", "barren": "barren_0"}
    os.makedirs(os.path.join(ROOT, "art/tiles"), exist_ok=True)
    sheet.save(os.path.join(ROOT, "art/tiles/ground.png"))
    json.dump(index, open(os.path.join(ROOT, "art/tiles/index.json"), "w"), ensure_ascii=False, indent=1)
    # 放大預覽
    sheet.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(os.path.join(ROOT, "art/tiles/_ground_preview.png"))
    print(len(tiles), "tiles")


if __name__ == "__main__":
    main()
