# 檢查走路表左右兩列：同一列兩格要面向同一邊（第二格不能是鏡像的反方向），左列跟右列要相反
# 用法：.venv/bin/python -I tools/sheet_check.py [--fix]
import glob, sys
import numpy as np
from PIL import Image
def cell(a, r, c): return a[r*32:(r+1)*32, c*32:(c+1)*32].astype(float)
def diff(x, y):
    m = (x[..., 3] > 0) | (y[..., 3] > 0)
    return np.abs(x - y)[m].mean() if m.any() else 0
def facing_flip(x, y):  # True = y 跟 x 面向相反（y 鏡像後比較像 x）
    return diff(x, y[:, ::-1]) + 4 < diff(x, y)
fix = '--fix' in sys.argv
for f in sorted(glob.glob('art/chars/*.png')):
    if f.endswith('-face.png') or '/_' in f: continue
    im = Image.open(f).convert('RGBA')
    if im.size != (64, 128): continue
    a = np.array(im)
    bad = []
    for r in (1, 2):
        if facing_flip(cell(a, r, 0), cell(a, r, 1)): bad.append(r)
    if bad:
        print('BAD', f, 'rows', bad)
        if fix and bad == [1, 2]:
            # 兩列的第二格互換（左列的第二格其實面向右，右列的面向左）
            b = a.copy(); b[32:64, 32:64] = a[64:96, 32:64]; b[64:96, 32:64] = a[32:64, 32:64]
            Image.fromarray(b).save(f); print('  fixed: swapped frame 2 of rows 2/3')
