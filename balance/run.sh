#!/bin/sh
# 找一個能用的 node 跑模擬器（這台 Mac 沒裝 node，借 ChatGPT／codex 內建的）
#   balance/run.sh [sim 參數]        經濟模擬
#   balance/run.sh combat            戰鬥數值檢查
cd "$(dirname "$0")/.."
script=balance/sim.js
if [ "$1" = "combat" ]; then script=balance/combat.js; shift; fi
for n in node "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" /Applications/ChatGPT.app/Contents/Resources/cua_node/bin/node; do
  if command -v "$n" >/dev/null 2>&1 || [ -x "$n" ]; then exec "$n" "$script" "$@"; fi
done
echo "找不到 node" >&2; exit 1
