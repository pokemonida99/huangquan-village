#!/bin/zsh
# usage: tools/chars_gen.sh <id> sheet|face "<character description>" ref1 [ref2...]
# raw GPT output goes to tools/chars_src/<id>-sheet.png / <id>-face.png
cd "${0:A:h}/.."
id=$1; kind=$2; desc=$3; shift 3
GEN=~/claude-tools/tools/gpt-image/gen.sh
STYLE="Style reference: the attached pixel character sheet (Kairosoft-like 16-bit chibi, 2 heads tall, bold dark outline, flat colors)."
if [[ $kind == sheet ]]; then
P="A clean pixel-art walking sprite sheet of ONE chibi character for a top-down 3/4 view RPG village game (Kairosoft Dungeon Village style). Exactly 4 rows and 2 columns, 8 poses on an even grid with wide empty gaps between them: row 1 = walking toward the viewer (front view), row 2 = walking to the left (side view facing left), row 3 = walking to the right (side view facing right), row 4 = walking away (back view). In each row the 2 cells are the two walk steps (left foot forward / right foot forward). Identical character, identical size and proportions in all 8 cells, full body, feet on the same baseline in each row. VERY LOW RESOLUTION: each character is drawn on a tiny 32x32 pixel grid (about 28 pixels tall, 2 heads tall: head about 13 pixels, body about 15) and then scaled up about 10x with nearest-neighbor, so every pixel is a big crisp square block. Minimal detail like a real Kairosoft / SNES sprite: simple dot eyes, at most 3 shades per material, no gradients, no fine embroidery, 1-pixel dark outline around the silhouette, large readable color blocks. Flat solid pure magenta #FF00FF background everywhere, no ground shadow, no text, no labels, no grid lines, no frame. $STYLE Character: $desc"
else
P="A clean pixel-art dialogue portrait (bust: head and shoulders, front facing, slight smile) of ONE character for a retro 16-bit RPG, like a 64x64 pixel portrait scaled up: chunky pixels, bold dark outline, flat shading, cute chibi-anime proportions, the face fills most of the square. Square image. Flat solid pure magenta #FF00FF background, no text, no frame. $STYLE Character: $desc"
fi
$GEN tools/chars_src/$id-$kind.png "$P" concept/chars-pixel-v2.png "$@"
