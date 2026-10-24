#!/bin/zsh
# 等角（開羅 DV2 角度）建築重繪：拿現有正面像素圖當參考，請 GPT 畫成 2:1 等角。
#   tools/iso_gen.sh <sheet名> "<這張的建築說明>" id1 id2 ...
# 原圖：art/_raw/iso/<sheet>.png；參考拼圖：art/_raw/iso/<sheet>-ref.png
cd "${0:A:h}/.."
sheet=$1; desc=$2; shift 2
.venv/bin/python -I tools/iso_ref.py art/_raw/iso/$sheet-ref.png "$@" || exit 1
STYLE="16-bit pixel art building sprites in the exact style of Kairosoft's Dungeon Village 2: true 2:1 isometric (dimetric) view, every building footprint is a diamond seen from above at about 30 degrees, so we see the roof from above plus TWO walls: the long front facade faces the LOWER-LEFT and carries the entrance and signboard, the side wall faces the LOWER-RIGHT. Chunky clean pixels, bold dark outlines, bright saturated cheerful colors, simple cel shading with light from the upper left, cute toy-like chunky proportions, slightly exaggerated roofs. Theme: old Taiwanese/Japanese street shops in an afterlife town with red paper lanterns. Redraw each building from the attached reference image (same order, same signboard symbol, same main colors and roof style) but in this isometric view, a little brighter and more colorful than the reference. Each building stands alone in its own cell with lots of empty space around it. Perfectly flat solid magenta background #FF00FF everywhere, no ground tile, no grass base, no cast shadow, no labels, no captions, no grid"
~/claude-tools/tools/gpt-image/gen.sh art/_raw/iso/$sheet.png "$STYLE. $desc" art/_raw/iso/$sheet-ref.png
