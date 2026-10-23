# 線 D 進度：角色像素圖

## 做了什麼

- 角色走路圖 `art/chars/<id>.png`（64×128 透明 PNG：2 欄步伐 × 4 列 下／左／右／上，每格 32×32，腳底貼格子底邊），頭像 `art/chars/<id>-face.png`（64×64 透明）。全部量化到 `art/palette.json` 32 色。
- 總覽圖：`art/chars/_preview.png`（草地色底，左邊走路圖 3 倍、右邊頭像 2 倍）。
- id 照線 C `data/chars.js` 與線 B `data/jobs.js`（HQ.mobs / HQ.enemies）的 sprite 路徑。完成清單見下方「清單」。

## 流程（重做某一隻）

1. 提示詞在 `tools/chars_prompts.md`（每段 `## id`、`refs:` 參考圖、`px:` 轉檔參數、`desc:` 描述、`facedesc:` 頭像另寫、`face: no|only`）。版型與風格句在 `tools/chars_gen.sh`。
2. `tools/chars_run.sh <id>…`：每個 id 並行生 2 張（走路表＋頭像，各約 40 秒～2 分鐘），原圖存 `tools/chars_src/`，再自動轉檔。
   - 只重轉不重生：`tools/chars_run.sh --px-only <id>`；只重生頭像：`--face-only`；只重生走路表：`--sheet-only`。
3. `tools/pixelize.py`（Pillow + numpy + scipy，`.venv/bin/python -I`）：去洋紅底 → 找 8 隻（連通塊，失敗就平均切 4×2）→ 全部同一比例 → 在原解析度量化成調色盤索引 → 投票縮到 2 倍 → 每兩列留細節多的一列（眼睛不會被吃掉）→ 去雜點 → 拼圖。
   常用參數：`--gamma 0.75`（膚色太暗／黑衣角色提亮）、`--ban #e2b65a`（膚色被量成燈籠金時禁用）、`--allow #1e4a55,#2e6b73`（預設禁用深青，避免黑髮反光變青綠）、`--height N`（小孩、小動物、怪物縮小）、`--mirror-lr` / `--swap-lr`（左右畫反時）。
4. `tools/chars_alias.sh`：同一隻怪在 B 的表裡有兩個 id 時直接複製（en-gu = mob-lizard、en-drowned = mob-ghost、en-rat = rat）。
5. 總覽：`.venv/bin/python -I tools/pixelize.py preview art/chars art/chars/_preview.png`。

## 造型確認

- 語彤：黑色鮑伯頭、無眼鏡、腮紅、金花髮簪＋綠流蘇、白綠漢服（參考 `refs/yutongh-normal.webp`）。
- 業鏡羅漢（id `lee`）：黑高帽、三件式黑西裝、灰髮。
- 其他角色都用轉珠遊戲 `art/vn/<id>-normal.webp` 或卡圖、劇照當參考生成，沒有自創角色。例外見下。

## 還缺什麼／注意

- **調色盤沒有藍色**：諾瓦的獨角鯨帽、九尾的藍尾巴、利維坦藍髮、小米藏青滾邊會變紫灰。已在共用筆記 `D-palette-request.md` 建議加兩色；調色盤若改，`--px-only` 重轉即可，不必重生圖。
- **沒有參考圖、只照劇情描述畫的**：光頭小弟 guangtou、杜老大 dulao（用杜先生的臉＋黑道裝，劇中若是別的演員要重畫）、一般敵人 en-sawghost / en-sinner / en-relic / en-narwhal（惡魔士兵）/ en-hamster / en-north、boss-tide（B 註明劇中沒有這角色）。
- 怪物沒有頭像；王（boss-*）和 en-reaper、en-gu-teacher 有頭像。
- 王的走路圖跟一般角色同尺寸 32×32；戰鬥時要大隻請引擎整數放大（例如 2 倍）。
- 黑糖、貢丸君、918 號是四腳動物，正面那格比較小（側面身體長，整張用同一比例）。

## 給 A（引擎）

- 走路動畫：每列 2 格交替即可（第 1 格、第 2 格是左右腳）。列順序 下=0、左=1、右=2、上=3。
- 草地上黑衣角色（業鏡羅漢、咪咪、杜先生）輪廓偏暗，若需要可以在引擎畫一圈 1px 半透明亮邊或腳底陰影。
