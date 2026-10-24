# 配角頭像對照表：像素化後的頭像排成一張，方便一次看
import glob, sys
from PIL import Image, ImageDraw, ImageFont
fs = sorted(glob.glob('art/chars/npc-*-face.png'))
ref = ['art/chars/yutong-face.png', 'art/chars/yuelao-face.png']
fs = ref + fs
S = 160; cols = 6; rows = (len(fs) + cols - 1) // cols
c = Image.new('RGB', (cols * S, rows * (S + 22)), (240, 236, 228)); d = ImageDraw.Draw(c)
try: font = ImageFont.truetype('/System/Library/Fonts/PingFang.ttc', 14)
except Exception: font = None
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGBA').resize((S, S), Image.NEAREST)
    bg = Image.new('RGBA', im.size, (60, 50, 70, 255)); bg.alpha_composite(im)
    x, y = (i % cols) * S, (i // cols) * (S + 22)
    c.paste(bg.convert('RGB'), (x, y)); d.text((x + 4, y + S + 3), f.split('/')[-1].replace('-face.png', ''), fill=(30, 20, 10), font=font)
c.save(sys.argv[1])
