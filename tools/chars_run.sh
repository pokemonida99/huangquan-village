#!/bin/zsh
# usage: tools/chars_run.sh [--face-only|--sheet-only|--px-only] <id> [<id>...]
# 依 tools/chars_prompts.md 生圖（一次 2 張並行）並轉成 art/chars/<id>.png、<id>-face.png
cd "${0:A:h}/.."
mode=all
[[ $1 == --* ]] && { mode=${1#--}; shift }
field() { awk -v id="$1" -v k="$2" '
  /^## /{cur=$2} cur==id && index($0, k": ")==1 {sub(k": ",""); print; exit}' tools/chars_prompts.md }
px() {
  local id=$1 opts=(${(z)$(field $id px)})
  [[ -f tools/chars_src/$id-sheet.png ]] && .venv/bin/python -I tools/pixelize.py sheet tools/chars_src/$id-sheet.png art/chars/$id.png $opts 2>&1 | grep -E "OK|找到|Error"
  [[ -f tools/chars_src/$id-face.png ]] && .venv/bin/python -I tools/pixelize.py face tools/chars_src/$id-face.png art/chars/$id-face.png ${opts:#--single} 2>&1 | grep -E "OK|Error"
}
for id in "$@"; do
  desc=$(field $id desc); refs=(${(z)$(field $id refs)})
  [[ -z $desc ]] && { echo "no prompt for $id"; continue }
  if [[ $mode != px-only ]]; then
    [[ $mode != face-only && $(field $id face) != only ]] && tools/chars_gen.sh $id sheet "$desc" $refs &
    fdesc=$(field $id facedesc); [[ -z $fdesc ]] && fdesc=$desc
    [[ $mode != sheet-only && $(field $id face) != no ]] && tools/chars_gen.sh $id face "$fdesc" $refs &
    wait
  fi
  px $id
done
