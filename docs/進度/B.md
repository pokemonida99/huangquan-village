# B 線（數值與核心資料）進度

狀態：**完成第一版**，模擬器跑過、數值調過。沒有 git commit。

## 檔案

| 檔案 | 內容 |
|---|---|
| `data/buildings.js` | `HQ.buildings` 41 種（劇中名店 21：車站、市役所、奈何橋、紋身店、燒肉店、照相館、髮廊、孟婆甜食屋、月老廟、守宮廣場、語の漫畫、葬壽司、愛神祭會場、華佗醫館、慰靈犬小屋、引渡貓候車亭、九尾結界石、杜氏分店、刀鋸道場、忠烈祠、義民廟；一般店 9；住宅 2；裝飾 6；道路 3）＋`HQ.combos` 8 組緣分組合（頭七套餐、飯後甜點、紅線大街、藝術區、最後一餐、愛神大夜市、陪伴下午茶、地府辦事處）。檔尾有 `extra` 欄位說明。 |
| `data/jobs.js` | 六屬性、`HQ.baseStats`、經驗曲線；`HQ.jobs` 43 個（服務／引導／巡守／技藝／術法 5 線 18 個＋主要角色專屬＋外賓援手），轉職功德、勳章、上班效果、技能；`HQ.medals`；外圍怪 `HQ.mobs`（mob-ghost／mob-miasma／mob-lizard／mob-lost）、`HQ.zoneMul`；出征敵人 `HQ.enemies` 25 隻；`HQ.mapLevels`、`HQ.travelCost`、`HQ.travelMerit`（北境船票 30）。檔尾有戰鬥公式。 |
| `data/traits.js` | `HQ.traits`（約定的 10 種）、`HQ.traitInfo`、`HQ.wishes` 13 種心願、`HQ.honors` 稱號。 |
| `data/ranks.js` | `HQ.ranks` ☆1～5、`HQ.titles` 實習→見習→月老（幫助 0／120／3000，每週文印 1／2／3 組）、`HQ.review` 觀音評定公式、`HQ.activities` 主動活動與擴地、`HQ.meritPrices` 劇中功德行情、**`HQ.balance` 全部經濟常數**。 |
| `balance/sim.js` | 經濟模擬器（讀 data/*.js，含 C 的 chars／requests）。 |
| `balance/combat.js` | 出征戰鬥檢查。 |
| `balance/run.sh` | 這台沒 node，借 codex 內建的 node 跑。 |
| `balance/README.md` | 模型說明、結果表、已知問題。`result-*.txt` 是最新輸出。 |

## 結果（20 局中位數）

- 不破產：0/20，最低冥紙約 800（第 2 個月）。
- ☆1 **Y1-09**、☆2 Y2-06、☆3 **Y3-06**、☆4 Y3-12、☆5 約 Y5-12。
- 見習月老 Y1-12、月老 Y4-12。
- 每張出征地圖：推薦等級打得過王，低 3 級打不過。

## 給 A（引擎）

- 建議引擎的經濟常數改讀 `HQ.balance`（名稱對應 CFG：startMoney 4000、trainsPerWeek 14、visitsMax 5、peaceWish、peaceOther、stayChance、popPerVisit、popPerHelp…）。公式寫在 ranks.js 註解，跟 sim.js 完全一致。
- 安心判定：心願全滿足後 `亂數×100 < 安心度` 才算安心（機率式，不是門檻）。
- 文印是**每週**組數：`HQ.titles[i].wenyinPerWeek`＋紋身店 Lv4/7/10、杜氏分店、紅線大街、紋身學徒各 +1。你的 `CFG.TITLE_PAIRS` 可以不用了。
- 托夢：每次街區付 10 功德（`HQ.meritPrices.dream`），功德不夠就只拍照、不算幫助。
- ☆ 在每季觀音評定時檢查（一次升 1 星）；位階在 12 月檢查。評定及格分看目前 ☆（`HQ.review.target.byStar`）。
- 升級：價格 +22%/級（Lv10 約 3 倍）、名店升級另花功德 15×Lv（`HQ.balance.lv`）。
- 冥紙負值：建議允許短暫負值，但不能蓋、不能出征；連續 2 個月負值觸發觀音提醒。
- `fixed: true`＝開局預先擺好（station、cityhall、naihe），不放建造選單。道路 id 是 `road-dirt`／`road-stone`／`road-red`。

## 給 C（已在共用筆記資料夾 `B-ids-and-balance.md` 說明）

- 已對齊 C 的角色 id（yangzi、cat918、mi、nova、lvyi）與職業中文名；補了 `en-reaper`、`en-hamster`，`en-narwhal` 改名惡魔士兵。
- **建議下修入住特徵門檻**：大寶 思念 25→15、白妹 儀容 20→10、狐姬 娛樂 30→20、七號 美味 60→45。原值下大寶要等照相館以外的思念來源，模擬玩家第一年得蓋十幾盞燈籠。

## 給 E（建築美術）

- 建築 id 與尺寸以 `data/buildings.js` 為準。比企劃書多出來的小建築：`dogpark` 慰靈犬小屋 1×1、`catstop` 引渡貓候車亭 1×1、`barrier` 九尾結界石 1×1、`tattoo2` 杜氏紋身分店 2×1、`sawhall` 刀鋸道場 2×2、`shrine` 忠烈祠 2×2、`yimin` 義民廟 2×2、`naihe` 奈何橋 2×3、`clinic` 華佗醫館 2×1、`costume` 戲服店 2×1、`fries` 薯條攤 1×1、`mala` 麻辣鍋店 2×2、`nightstall` 愛神夜市攤 1×1、`house` 街坊小屋 1×1、`tower` 靈骨塔公寓 2×2、`redbridge` 紅線小橋 1×2、`garden` 日式庭園 2×2。

## 還缺／之後可做

- C 的 `data/maps.js` 還沒出來；地圖 id 先假設 daoju／gengyin／xinkujiang／seaside／relic／demon2／demon3／north，敵人 id 已給 C。
- 模擬沒有擺位置（裝飾光環、組合距離、慰靈犬範圍用平均值估），也沒模擬事件（魔氣暴走、保衛戰、救人）。
- 後期功德會累積到幾千；如果實際玩起來太多，先調低 `HQ.review.meritPerScore`。
