# 線 D 進度：角色像素圖

## 做了什麼

- 角色走路圖 `art/chars/<id>.png`（64×128 透明 PNG：2 欄步伐 × 4 列 下／左／右／上，每格 32×32，腳底貼格子底邊），頭像 `art/chars/<id>-face.png`（64×64 透明）。全部量化到 `art/palette.json`（34 色）。
- 總覽圖：`art/chars/_preview.png`（草地色底，左邊走路圖 3 倍、右邊頭像 2 倍，按 id 字母排序）。
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

## 清單（全部完成，2026-10-24）

對照 `data/chars.js`、`data/jobs.js`（HQ.mobs / HQ.enemies）和 `docs/進度/C.md`：**沒有缺圖**。共 82 張走路圖、69 張頭像。

- 街坊 21：yutong yuelao mimi heitang lee xiaoyu dabao baimei huji jiuwei yangzi no7 du huatuo paofu xiaomi mi nova leviathan rat qianliyan（全有頭像）
- 外賓／援手／觀音 14：lvyi gongwan cat918 shencha hathor aphrodite aizen guanyin dulao tiedan guangtou gengyin lucifer zhurong（全有頭像）
- 委託人／陽間的人 15：maoguai xiaole daniu moti abinmom laoren waipo couple liangan yiman 有走路圖＋頭像；linbobo bohong afu xiaoqing akasaka 只有頭像（C 說只要頭像）
- 一般亡魂：soul-1～soul-8（白三角巾，附頭像）
- 外圍怪：mob-lost mob-ghost mob-miasma mob-lizard
- 出征敵人：en-sawghost en-sinner en-baizhu en-shushi en-gu en-raincoat en-drowned en-relic en-narwhal en-hamster en-rat en-skeleton en-bat en-reaper en-gu-teacher en-north
- 王：boss-laji boss-bailaoda boss-hasshaku boss-tide boss-eye boss-leviathan boss-plague boss-satan boss-evilgod（王＋en-reaper、en-gu-teacher 有頭像）
- 共用圖：en-gu = mob-lizard、en-drowned = mob-ghost、en-rat = rat（`tools/chars_alias.sh` 複製）

## 還缺什麼／注意

- 調色盤已加兩個藍（#3a5a9a、#7aa6e0，共 34 色），諾瓦、九尾、利維坦、小米、北境冰魂等已重轉成藍色。
- 膚色：調色盤中間膚色少，熟齡男性（業鏡羅漢、杜先生、杜老大、光頭小弟、大牛、爺爺、林伯伯、阿副、阿斌的媽媽）用 `--ban 燈籠金 --gamma 0.75` 避免變黃，結果偏小麥色。
- **沒有參考圖、只照劇情描述畫的**：光頭小弟 guangtou、杜老大 dulao（用杜先生的臉＋黑道裝，劇中若是別的演員要重畫）、一般敵人 en-sawghost / en-sinner / en-relic / en-narwhal（惡魔士兵）/ en-hamster / en-north、boss-tide（B 註明劇中沒有這角色）。
- 怪物沒有頭像；王（boss-*）和 en-reaper、en-gu-teacher 有頭像。
- 王的走路圖跟一般角色同尺寸 32×32；戰鬥時要大隻請引擎整數放大（例如 2 倍）。
- 黑糖、貢丸君、918 號是四腳動物，正面那格比較小（側面身體長，整張用同一比例）。

## 給 A（引擎）

- 走路動畫：每列 2 格交替即可（第 1 格、第 2 格是左右腳）。列順序 下=0、左=1、右=2、上=3。
- 草地上黑衣角色（業鏡羅漢、咪咪、杜先生）輪廓偏暗，若需要可以在引擎畫一圈 1px 半透明亮邊或腳底陰影。
