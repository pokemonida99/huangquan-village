# 三途川物語 建築／地圖美術 生圖提示詞（E 線）

生圖：`~/claude-tools/tools/gpt-image/gen.sh art/_raw/<name>.png "<prompt>"`，原圖放 `art/_raw/`（不進遊戲），
再用 `tools/tiles_pixelize.py` 切圖、縮成 tiles×32 寬、量化到 `art/palette.json`。

## 共用風格句（STYLE）

> 16-bit pixel art game sprite sheet in the style of Kairosoft games (Dungeon Village 2), orthogonal 3/4 top-down view:
> the camera looks straight at the front wall from slightly above, so we see the front facade and the top of the roof;
> the building footprint is a rectangle aligned to the screen, NOT isometric, NOT diagonal, no perspective.
> Chunky readable pixels, dark outlines, night lighting with warm lantern glow, Taiwanese/Japanese old-street underworld town.
> Each object stands alone, centered in its own cell, with generous empty space between objects. Perfectly flat solid
> magenta background (#FF00FF) everywhere, no ground shadow, no floor tiles, no text labels, no captions, no grid lines.

