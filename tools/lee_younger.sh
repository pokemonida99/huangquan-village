#!/bin/zsh
# 業鏡羅漢：以 v1 頭像（使用者認可的畫風）為底，只改年紀，參考原著卡圖的長相
cd "${0:A:h}/.."
BASE="Edit attachment 1, a pixel-art dialogue portrait. Keep EXACTLY the same pixel art style, resolution, outline, shading, colors, framing, pose, tall black top hat, black three-piece suit, white shirt, black tie and white pocket square. Keep his likeness to the man in attachment 2 (slim long face, high cheekbones, calm dignified look). Flat solid pure magenta #FF00FF background, no text, no frame."
gen() { ~/claude-tools/tools/gpt-image/gen.sh tools/chars_src/lee-face-y$1.png "$BASE $2" tools/chars_src/lee-face-v1.png tools/chars_src/ref-lee-card-tophat.png; }
gen 1 "Change ONLY his age: make him look about 35 years old — smoother skin, no deep lines, hair at the temples mostly black with just a little grey. Calm gentle expression, small smile." &
gen 2 "Change ONLY his age: make him look about 30 years old — smooth youthful skin, short black hair with no grey. Calm gentle expression, small smile." &
wait
gen 3 "Change ONLY his age: make him look about 35 years old, smoother skin, black hair with a few silver strands at the temples; slightly warmer friendly smile, soft eyes." &
gen 4 "Change ONLY his age: make him look about 40 years old (younger than now, still mature), fewer lines, salt-and-pepper temples; calm composed expression, faint smile." &
wait
