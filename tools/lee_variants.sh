#!/bin/zsh
# 業鏡羅漢頭像 4 款：參考轉珠遊戲的原著卡圖（外型）＋語彤／月老／白妹頭像（畫風）
cd "${0:A:h}/.."
BASE="A clean pixel-art dialogue portrait (bust: head and shoulders, front facing) of ONE character for a retro 16-bit Kairosoft-style RPG, like a 64x64 pixel portrait scaled up. ART STYLE: exactly the same cute anime pixel-art style, proportions, big expressive anime eyes, outline and flat shading as the three portraits in attachment 2 (a girl, a young man, and a purple-haired woman with glasses — he must look like he belongs with her as a couple). LIKENESS: the character is the man in attachment 1 — keep his slim long face, high cheekbones, short black hair, calm dignified bearing — but drawn as a handsome anime character, not a realistic or old man. Square image, flat solid pure magenta #FF00FF background, no text, no frame."
gen() { ~/claude-tools/tools/gpt-image/gen.sh tools/chars_src/lee-face-c$1.png "$BASE $2" $3 tools/chars_src/ref-style-trio.png; }
gen 1 "Outfit: tall black top hat, black three-piece suit, white shirt, black tie, white pocket square. Expression: calm and gentle, relaxed eyebrows, soft eyes." tools/chars_src/ref-lee-card-tophat.png &
gen 2 "Outfit: tall black top hat, black three-piece suit, white shirt, black tie, white pocket square. Expression: a warm kind smile, eyes slightly narrowed with warmth." tools/chars_src/ref-lee-card-tophat.png &
wait
gen 3 "Outfit: the Qing-dynasty official cap (black with a red-gold top button) and dark navy official robe with gold embroidery from attachment 1, his 業鏡羅漢 form. Expression: serene and gentle, a faint smile." tools/chars_src/ref-lee-card-robe.png &
gen 4 "Outfit: tall black top hat, black three-piece suit, white shirt, black tie, white pocket square. Looks a little more mature (late thirties) but still handsome and anime-styled, composed and reliable, a slight smile." tools/chars_src/ref-lee-card-tophat.png &
wait
