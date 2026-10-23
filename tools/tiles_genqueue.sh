#!/bin/zsh
# E 線：依序生圖，同時最多 2 張（再多會 HTTP 429）。用法：tools/tiles_genqueue.sh <jobs.tsv>
# jobs.tsv 每行：<out.png>\t<prompt>\t[ref1 ref2 ...]（已存在的 out 會跳過）
GEN=~/claude-tools/tools/gpt-image/gen.sh
pids=()
while IFS=$'\t' read -r out prompt refs; do
  [[ -z $out || $out == \#* ]] && continue
  [[ -f $out ]] && { echo "SKIP $out"; continue; }
  while true; do
    alive=(); for p in $pids; do kill -0 $p 2>/dev/null && alive+=$p; done; pids=($alive)
    (( ${#pids} < 2 )) && break; sleep 3
  done
  $GEN "$out" "$prompt" ${=refs} &
  pids+=$!
  sleep 5
done < "$1"
wait
echo ALLDONE
