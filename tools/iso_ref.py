"""把現有建築像素圖放大拼成一張參考圖（給 iso_gen.sh 用）。
用法：.venv/bin/python -I tools/iso_ref.py <out.png> id1 id2 ...（依序排成每列 2 個）"""
import sys, os
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, ids = sys.argv[1], sys.argv[2:]
imgs = [Image.open(os.path.join(ROOT, "art/buildings", i + ".png")).convert("RGBA") for i in ids]
S, cell = 6, 640
cols = 2 if len(imgs) > 1 else 1
rows = (len(imgs) + cols - 1) // cols
can = Image.new("RGBA", (cols * cell, rows * cell), (255, 0, 255, 255))
for n, im in enumerate(imgs):
    k = min(S, (cell - 80) // max(im.width, im.height))
    im = im.resize((im.width * k, im.height * k), Image.NEAREST)
    x = (n % cols) * cell + (cell - im.width) // 2; y = (n // cols) * cell + (cell - im.height) // 2
    can.alpha_composite(im, (x, y))
can.convert("RGB").save(out)
print("ref", out, can.size)
