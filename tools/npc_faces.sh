#!/bin/zsh
# 沒有頭像的配角／系統聲音：用 GPT 生原創像素頭像（有原作圖的附上當參考），兩張並行
cd "${0:A:h}/.."
GEN=~/claude-tools/tools/gpt-image/gen.sh
gen() {
  local id=$1 ref=$2 desc=$3
  local P="A clean pixel-art dialogue portrait (bust: head and shoulders, front facing, body and face pointing the same way) for a retro 16-bit RPG, like a 64x64 pixel portrait scaled up: chunky pixels, bold dark outline, flat shading, cute chibi-anime proportions, the face fills most of the square. EXACTLY the same pixel art style, outline weight, resolution and shading as the portraits in attachment 1. Square image. Flat solid pure magenta #FF00FF background, no text, no frame. Character: $desc"
  [[ -f tools/chars_src/npc-$id-face.png ]] && return
  if [[ -n $ref ]]; then $GEN tools/chars_src/npc-$id-face.png "$P" tools/chars_src/ref-style-trio.png $ref
  else $GEN tools/chars_src/npc-$id-face.png "$P" tools/chars_src/ref-style-trio.png; fi
  .venv/bin/python -I tools/pixelize.py face tools/chars_src/npc-$id-face.png art/chars/npc-$id-face.png --ban '#e2b65a,#f3d58c' 2>&1 | grep -E "OK|Error"
}
n=0
while IFS='|' read -r id ref desc; do
  [[ -z $id ]] && continue
  gen $id "$ref" "$desc" &
  (( ++n % 2 == 0 )) && wait
done < tools/npc_faces.txt
wait
echo ALLDONE
