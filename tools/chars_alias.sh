#!/bin/zsh
# B 的 HQ.enemies 裡和別的 id 同一個角色的，直接複製圖（同一隻怪不要畫兩種樣子）
cd "${0:A:h}/.."
for pair in en-gu:mob-lizard en-drowned:mob-ghost en-rat:rat; do
  dst=${pair%%:*}; src=${pair##*:}
  [[ -f art/chars/$src.png ]] && cp art/chars/$src.png art/chars/$dst.png && echo "art/chars/$dst.png ← $src"
done
