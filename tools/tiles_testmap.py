"""E 線：用 ground.png＋建築拼一張測試地圖，檢查河岸接縫與比例。輸出 art/tiles/_testmap.png（3 倍）。"""
import json, os, random
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
idx = json.load(open(f"{ROOT}/art/tiles/index.json"))
sheet = Image.open(f"{ROOT}/art/tiles/ground.png")
T = 32
def tile(n):
    t = idx["tiles"][n]; return sheet.crop((t["x"], t["y"], t["x"] + T, t["y"] + T))
# 地圖字元：g 草 s 石 d 土 w 水 b 荒岸 f 霧 | 橋
M = [
 "ggggggggggggbbbb",
 "ggssssssssssbbbb",
 "ggsggggggggsbbbb",
 "ggsggggggggsdddd",
 "ggsggggggggsgfff",
 "ggssssssssssgfff",
 "gggggggsgggggfff",
 "gggggggsgggggggg",
 "wwwwwwwVwwwwwwww",
 "wwwwwwwVwwwwwwww",
 "wwwwwwwVwwwwwwww",
 "gggwwgggggggwwgg",
 "gggggggsgggggggg",
]
H, W = len(M), len(M[0])
def at(x, y):
    if 0 <= y < H and 0 <= x < W: return M[y][x]
    return "g"
water = lambda x, y: at(x, y) in "wV"
img = Image.new("RGBA", (W * T, H * T))
rng = random.Random(1)
for y in range(H):
    for x in range(W):
        ch = M[y][x]
        if ch in "wV":
            img.paste(tile("water_0"), (x * T, y * T)); 
            if ch == "V":
                part = "a" if not water(x, y - 1) else ("b" if not water(x, y + 1) else "m")
                img.alpha_composite(tile(f"bridge_v_{part}"), (x * T, y * T))
            continue
        base = {"g": f"grass_{rng.randrange(3)}", "s": f"stone_{rng.randrange(2)}", "d": f"dirt_{rng.randrange(2)}",
                "b": f"barren_{rng.randrange(2)}", "f": "grass_0"}[ch]
        n, s_, w_, e = water(x, y - 1), water(x, y + 1), water(x - 1, y), water(x + 1, y)
        if ch == "g" and (n or s_ or w_ or e or water(x-1,y-1) or water(x+1,y-1) or water(x-1,y+1) or water(x+1,y+1)):
            img.paste(tile("water_0"), (x * T, y * T))
            if n and w_: k = "nw"
            elif n and e: k = "ne"
            elif s_ and w_: k = "sw"
            elif s_ and e: k = "se"
            elif n: k = "n"
            elif s_: k = "s"
            elif w_: k = "w"
            elif e: k = "e"
            elif water(x-1,y-1): k = "inw"
            elif water(x+1,y-1): k = "ine"
            elif water(x-1,y+1): k = "isw"
            else: k = "ise"
            img.alpha_composite(tile(f"bank_{k}"), (x * T, y * T))
        else:
            img.paste(tile(base), (x * T, y * T))
        if ch == "g" and rng.random() < 0.12: img.alpha_composite(tile(rng.choice(["lily_a", "lily_b"])), (x * T, y * T))
for y in range(H):
    for x in range(W):
        if M[y][x] == "f":
            img.alpha_composite(tile("fog_0" if (x + y) % 2 else "fog_1"), (x * T, y * T))
        elif at(x+1,y) == "f": img.alpha_composite(tile("fog_edge_e"), (x * T, y * T))
        elif at(x,y+1) == "f": img.alpha_composite(tile("fog_edge_s"), (x * T, y * T))
# 建築：(id, 左上格 x, 佔地底列 y)
bi = f"{ROOT}/art/buildings/index.json"
if os.path.exists(bi):
    B = json.load(open(bi))
    for bid, gx, gy in [("yakiniku", 3, 4), ("tattoo", 6, 4), ("photo", 9, 4), ("salon", 3, 7), ("naihe", 7, 10), ("inn", 9, 7), ("higanbana", 12, 7), ("lantern", 2, 6),
                        ("temple", 0, 2), ("station", 12, 2), ("tower", 13, 0)]:
        if bid in B:
            im = Image.open(f"{ROOT}/art/buildings/{bid}.png")
            img.alpha_composite(im, (gx * T, (gy + 1) * T - im.height))
img.resize((img.width * 2, img.height * 2), Image.NEAREST).save(f"{ROOT}/art/tiles/_testmap.png")
