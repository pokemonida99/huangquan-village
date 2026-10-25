#!/bin/zsh
# 建築轉向圖：把等角原圖左右鏡像，再請 GPT 照鏡像重畫一次，招牌上的字改回正的（不能是反字）。
#   tools/iso_turn.sh s1 s4 ...   → art/_raw/iso/<s>-turn.png
# 切圖：iso_import.py 用 <id>-r 當名字（鏡像後同一列的左右順序會反過來）
cd "${0:A:h}/.."
GEN=~/claude-tools/tools/gpt-image/gen.sh
P="Attachment 1 is a sheet of isometric (2:1 dimetric) 16-bit pixel-art buildings in the style of Kairosoft's Dungeon Village 2. It was flipped horizontally (a mirror image), so every building now shows its entrance facade facing the LOWER-RIGHT and its side wall facing the lower-left. Redraw this whole sheet keeping EXACTLY the same buildings in the same positions, same sizes, same orientation (entrance facade toward the lower-right), same colors, roofs, lanterns, decorations and chunky pixel art style with bold dark outlines. The only thing to fix: because of the mirroring, any writing on signboards (Chinese characters, letters, numbers) now reads backwards. Attachment 2 is the original un-mirrored sheet: copy the text of every sign EXACTLY from attachment 2 (same Chinese characters, same meaning, the same shop type), written correctly, not mirrored. Never invent new words, never use Japanese kana, never change what kind of shop a building is. Do not add new objects. Perfectly flat solid magenta background #FF00FF everywhere, no ground tile, no grass, no cast shadow, no labels, no captions, no grid."
one() {
  local s=$1
  [[ -f art/_raw/iso/$s-turn.png ]] && return 0
  .venv/bin/python -I -c "from PIL import Image; Image.open('art/_raw/iso/$s.png').transpose(Image.FLIP_LEFT_RIGHT).save('art/_raw/iso/$s-m.png')"
  $GEN art/_raw/iso/$s-turn.png "$P" art/_raw/iso/$s-m.png art/_raw/iso/$s.png > art/_raw/iso/$s-turn.log 2>&1
}
n=0
for s in "$@"; do one $s & (( ++n % 2 == 0 )) && wait; done
wait
echo ALLDONE
