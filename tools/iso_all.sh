#!/bin/zsh
# 一次重畫全部等角建築＋列車（GPT 一次最多跑 2 張），畫完自動切圖進 art/iso/。
#   tools/iso_all.sh            全部
#   tools/iso_all.sh s3 train   只跑某幾張
# 已經有原圖（art/_raw/iso/<sheet>.png）的會跳過生圖、只重切；要重畫就先刪原圖。
cd "${0:A:h}/.."
typeset -A IDS DESC
IDS[s1]="yakiniku tattoo photo manga";      DESC[s1]="Four 2x2-tile shops in a 2x2 grid: a yakiniku barbecue restaurant with a red 肉 sign and a smoking chimney; a tattoo shop with a heart sign; a photo studio with a big camera on the roof; a manga cafe with a manga poster"
IDS[s2]="sushi temple sawhall shrine";      DESC[s2]="Four 2x2-tile buildings in a 2x2 grid: a conveyor-belt sushi shop with a fish sign; a small red Taoist Yue Lao matchmaker temple with curved swallowtail roof ridges; a wooden kendo dojo; a martyrs' shrine with red pillars"
IDS[s3]="yimin inn mala tower";             DESC[s3]="Four 2x2-tile buildings in a 2x2 grid: a Hakka Yimin folk temple; a two-storey ghost inn with lanterns; a spicy mala hotpot restaurant with a red 辣 sign and steam; a tall multi-storey columbarium pagoda apartment"
IDS[s4]="salon mengpo clinic tattoo2";      DESC[s4]="Four 2x1-tile shops (long front facade facing lower-left, short side) in a 2x2 grid: a hair salon with scissors sign and barber pole; a sweets shop of Meng Po with pastel awning; a traditional Chinese medicine clinic with a 醫 sign; a second tattoo shop branch with a red 紋 sign"
IDS[s5]="paper costume teahouse garden";    DESC[s5]="Four objects in a 2x2 grid: a paper-offering craft shop (2x1); a theatre costume shop with a 戲 sign (2x1); an old tea house with a green 茶 sign (2x1); a small Japanese garden with a pond, red arched bridge and pine tree on a 2x2 lot (no building)"
IDS[s6]="flower incense fries nightstall";  DESC[s6]="Four tiny 1x1-tile shops in a 2x2 grid: a red spider lily accessory stall; an incense shop; a french fries food stall; a night market food cart with red lantern"
IDS[s7]="house dogpark catstop barrier";    DESC[s7]="Four tiny 1x1-tile objects in a 2x2 grid: a small wooden resident house; a dog house; a little cat-themed bus stop shelter; a sacred nine-tailed fox barrier stone with talisman rope"
IDS[s8]="cityhall gecko";                   DESC[s8]="Two 3x2-tile buildings side by side: an old Japanese-era two-storey city hall with a clock; a gecko plaza: a stone square with a big golden gecko fountain statue and painting easels (mostly open plaza, low)"
IDS[s9]="station festival";                 DESC[s9]="Two large buildings side by side: a 3x2-tile old wooden Japanese-style railway station building with a clock and platform canopy on its back side; a 3x3-tile love festival stage venue with a red stage, heart decorations and lantern strings"
IDS[s10]="naihe redbridge";                 DESC[s10]="Two objects side by side: the Naihe bridge gate, a grand stone-and-gold arched gateway bridge with lantern pillars (2x3 tiles, its long axis runs toward the lower-right); a small red wooden arched footbridge (1x2 tiles, long axis toward the lower-right)"
IDS[s11]="lantern higanbana swing bench";   DESC[s11]="Four tiny 1x1-tile decorations in a 2x2 grid: a red paper lantern street lamp post; a clump of red spider lilies (higanbana); a wooden swing; a wooden riverside bench"

want=(${@:-s1 s2 s3 s4 s5 s6 s7 s8 s9 s10 s11 train})
gen() {
  local s=$1
  [[ -f art/_raw/iso/$s.png ]] && return 0
  if [[ $s == train ]]; then
    ~/claude-tools/tools/gpt-image/gen.sh art/_raw/iso/train.png "$(cat tools/iso_train_prompt.txt)" art/buildings/station.png
  else
    tools/iso_gen.sh $s "${DESC[$s]}" ${=IDS[$s]}
  fi
}
# 兩張一組並行
for ((i = 1; i <= ${#want}; i += 2)); do
  gen ${want[i]} & [[ -n ${want[i+1]} ]] && gen ${want[i+1]} &
  wait
done
for s in $want; do
  [[ -f art/_raw/iso/$s.png ]] || { echo "缺 $s（生圖失敗，看 art/_raw/iso/$s.log）"; continue; }
  if [[ $s == train ]]; then .venv/bin/python -I tools/iso_import.py art/_raw/iso/train.png train-loco train-car
  else .venv/bin/python -I tools/iso_import.py art/_raw/iso/$s.png ${=IDS[$s]}; fi
done
