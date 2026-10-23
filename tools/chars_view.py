"""放大檢查用：.venv/bin/python -I tools/chars_view.py <id> <out.png>"""
import sys
from PIL import Image
i, out = sys.argv[1:]
a = Image.open(f'art/chars/{i}.png').resize((384, 768), Image.NEAREST)
im = Image.new('RGBA', (800, 768), (60, 55, 92, 255))
im.alpha_composite(a, (0, 0))
try:
    im.alpha_composite(Image.open(f'art/chars/{i}-face.png').resize((384, 384), Image.NEAREST), (410, 0))
except FileNotFoundError:
    pass
im.save(out)
