# A 線進度：遊戲引擎

純 HTML＋Canvas＋原生 JS，沒有建置步驟。手機直式優先，桌機也能玩。

## 2026-10-24 改版：等角畫面＋開羅式介面

- 畫面改成 2:1 等角（`src/iso.js` 投影；`src/map.js` 程式畫菱形地磚、河岸、地圖邊緣土台；`src/render.js` 依佔地前後排序、點選看圖的不透明像素）。
- 列車：有乘客才開、進站減速、停穩（1.9 秒）才下客、加速開出地圖（6.2 秒）。班次很密，乘客先累積到 `state.pendingSouls`。
- 介面：上方日期＋長條冥紙、第二列功德／幫助／速度；下方紅磚列「建設／委託簿／選單」；選單是左側藍色直排分頁；消息改成磚列上方一次一行的橫幅；右下評價牌（星數＋到下一位階的幫助人數）；新「情報」面板。圖示是 `src/icons.js` 程式畫的像素圖，不用 emoji。
- 美術：`tools/iso_all.sh` 一次重畫全部建築與列車（GPT 額度用完時會失敗，等重置再跑）。

### 同日第二輪（使用者回饋）
- 擺放：建築半透明浮起來閃、佔地綠色虛線框、四個黃色箭頭；選取中的建築發亮＋頭上跳動箭頭。
- 開場第一段改成語彤先跟玩家打招呼、講規則；「選單 → 情報」最上面有「遊戲說明」。舊存檔第一次進新版會看到「歡迎回到三途川」。
- 街坊小屋：開局兩間；亡魂留下來當街坊、住處不夠時，自己在路邊蓋一間（免費，`Sim.autoHouse`）。小屋 400 冥紙、不收維持費（B 的 data 改了，startHousing 改 0）。
- 建設面板上方說明收入怎麼來；卡片寫「每位客人付 X」。
- 音效 `src/sfx.js`（WebAudio 合成，音量 0.22）：按鈕、開關面板、對話翻頁、蓋好、錯誤、收錢、送行、文印、入住、評定、升級。火車不出聲。設定裡可關。

### 出征小動畫、業鏡羅漢提早
- `src/expstrip.js`：出征期間磚列上方一條橫幅，隊伍往右走、遇怪開打（閃白、扣血數字），最後一段遇到王；依地圖換背景。只是畫面，輸贏仍在回來時結算。點橫幅開巡守面板。
- 業鏡羅漢 movein 改 `{ order: 2, helped: 2, weeks: 1 }`，開局第一個月就來（刀鋸地獄劇情、投胎都需要他）；咪咪、黑糖順延。
- 出征劇情裡「打完會搬來的人、在地援手」算在場（`Story.filterLines(lines, present)`，`UI.dialog({ present })`），泡芙的台詞不會被濾掉。各地圖開頭補一句旁白交代場景。

### 標題畫面、三格存檔
- `src/title.js`：開機先顯示標題（`art/title.png`，GPT 生成，原圖 `art/_raw/title/`，提示詞 `tools/title_prompt.txt`），點一下選存檔，選好才 `HQGame.begin(slot)`。
- 三格存檔：第 1 格沿用舊 key `hq-village-save-v1`（舊存檔自動變存檔 1），2、3 格加 `-2`、`-3`。存檔記 `savedAt`，標題畫面顯示年月、幫助人數、街坊、星數、上次存檔時間，可刪除。
- 設定：「回標題畫面」；「重新開始」只清目前這格，重整後直接進同一格（sessionStorage `hq-autoslot`）。

## 怎麼跑

preview 工具的伺服器讀不到 `~/Documents`，所以 `launch.json` 的 `huangquan-village`（port 4210）是「接上已經在跑的伺服器」。先在終端機起伺服器，再用 preview 開：

```bash
cd /Users/sh/Documents/CLAUDE/0702/huangquan-village && python3 -m http.server 4210
```

然後 `preview_start name: huangquan-village`（或直接開 http://localhost:4210/）。

測試小工具（瀏覽器 console）：
- `HQGame.fastForward(12)`：快轉 12 週，對話、彈窗自動按掉（選第一個選項）
- `UI.skipAll()`：把排隊中的對話、彈窗全部按掉
- `State.wipe(); location.reload()`：重新開始（設定裡也有按鈕）
- `__hq.G.state`：整份存檔狀態

存檔：`localStorage["hq-village-save-v1"]`，每週自動存、切到背景或關頁時也會存。

## 檔案

| 檔案 | 內容 |
|---|---|
| `index.html`、`style.css` | 版面：上方列（冥紙／功德／日期／☆／已幫助 N 人／速度）、下方五鍵（建設・居民・巡守・道具・設定）、委託簿浮動鈕、面板、對話框、彈窗 |
| `src/boot.js` | 依序試載 `data/*.js`（缺的跳過），讀 `art/buildings/index.json`、`art/tiles/index.json`、`art/tiles/worldmap.json`、`art/chars/index.json`，然後開機 |
| `src/sample-data.js` | 內建範例資料（`HQ_SAMPLE`），`data/*.js` 缺哪一項就用這份補 |
| `src/data.js` | 把 `HQ.*` 正規化成引擎用的 `D.*`；`HQ.balance` 覆蓋 `CFG` |
| `src/util.js` | 小工具、`CFG` 節奏常數 |
| `src/map.js` | 32×48 格地圖、三途川、區塊（起始＋3 塊擴建＋荒岸）、BFS 尋路、地面圖層（E 的 tileset：河岸 12 片、木橋、荒地、點綴、水 2 格動畫；沒有就畫色塊） |
| `src/state.js` | 狀態、存讀檔、特徵／人氣／住處計算、行事曆持續效果（mods） |
| `src/entities.js` | 亡魂、街坊、外圍怪 |
| `src/sim.js` | 時間、列車、建造／升級／拆除、緣分組合、裝飾光環、文印、外圍怪、月結、擴建、共用條件判斷 `Sim.cond` |
| `src/story.js` | 角色入住、委託簿、事件（含選項）、行事曆、教學、觀音評定、主動活動 |
| `src/battle.js` | 出征自動戰鬥、街區保衛戰（自動結算版） |
| `src/render.js` | 鏡頭（整數倍放大、pixelated）、建築與人物依腳底排序、泡泡、霧、特效、擺放預覽 |
| `src/input.js` | 單指拖曳、雙指捏合／滾輪縮放、點選 |
| `src/ui.js` | 所有面板、擺放模式、對話框（逐字、頭像、集數）、評定卷軸、戰果 |

## 做好的

- **地圖**：三途川從上往下蜿蜒，上方鐵軌＋車站（列車進站動畫），五條橫街與木橋。開局固定建築照 B 的 `fixed: true` 擺好：車站 (13,2)、市役所 (5,8)、奈何橋 (19,14)（＝投胎出口）。下方三塊擴建區蓋著霧，點牌子花功德擴建（條件照 B 的 `HQ.activities` expand1～3）；最下方荒岸永遠是外圍。
- **建造**：分頁（名店／商店／飲食／住宿／裝飾／道路），點卡片 → 點地圖移動預覽（可拖）→ ✔ 建造。道路三種（土路、石板、紅線）可連續鋪。不能把別間的門口堵死。點建築看數值、升級（`upgradeCost` 陣列或 `cost×0.5×Lv`；名店另花功德）、修理、拆除。角色帶來的店第一間免費（卡片標「贈」）。
- **數值照 B**：價格／品質／魅力／維持費／特徵的等級係數、品質係數 qf、上班加成（沒人上班品質 ×0.7）、緣分組合（切比雪夫距離）、裝飾 `qualityAura`、人氣＝累積＋Σ魅力×0.5、亡魂錢包、心願數量權重、送行功德與馬卡龍、托夢扣 10 功德、`wenyinPerWeek`、香火月功德、住宅容量與 4 月稅、`genericCapByStar`、車站 `trainsPerWeekByLv`、候車亭／引渡貓的來客加成。
- **時間**：年／月／週（一月 4 週），x1 一週 30 秒，速度 ▶／▶▶／⏩／⏸（點日期或速度鍵，空白鍵也行）。月底結算維持費。
- **亡魂**：一週 14 班車，下車帶 1～3 個心願泡泡（`HQ.wishes` 的圖示、unlock、`final`／`residentOnly` 都有處理），BFS 走到店門口、進店、付冥紙、加安心度。離開前照 B 的判定：心願全滿足且亂數 < 安心度 →「安心了」；否則帶著遺憾離開（人氣 −0.3）。安心了的會想留下（右下角卡片：邀請留下／送去投胎，25 秒沒選就送行），或去燒肉店吃遺願馬卡龍再走到奈何橋投胎。文印：兩位求文印的亡魂在紋身店湊一組＝幫助 2 人。
- **街坊**：六屬性照 B（`HQ.baseStats`＋growth×(Lv−1)，魂力＝HP、膽量攻擊、手藝次數、定力防禦、靈力法術、福報寶箱），自動上班（主要角色顧自己帶來的店、其他人找缺人的店）、去外圍打怪（打迷途魂會變新客人）、受傷回客棧、逛街花錢。居民面板可轉職（要市役所、等級、功德、勳章）。
- **角色入住**：照 C 的 `movein` 全部條件（order 依序＋上一位住滿 2 週、traits、popularity、rank、helped、resident、building、map、month、flag），播 `arrive` 台詞，帶來的店解鎖。委託完成時 `reward.movein` 或 `movein.request` 也會入住。
- **委託簿**：左下浮動鈕，有新委託會亮紅點。`when` 成立才出現（同時最多 4 件），按「接受」播 `intro`，條件逐條打勾（building／combo／trait／resident／action dream・tattoo・macaron・comfort／pay／map／flag／helped…），完成播 `lines` 給獎勵。
- **事件**：`HQ.events` 的 random／month／week／once／flag／noflag／chain（`next`）／trigger（built、expedition）／choice（彈窗選項，可花功德）；effect 支援 merit/money/popularity/helped/traits/flag/unlock/spawn/close/away/trainMul/block/next/defense/ifResident/guest/movein。行事曆照 C 的月份陣列，`mods` 持續效果（offeringMul、incenseMul、wishMul、wenyinMul、mobMul）有接。
- **教學**：照 C 的 `HQ.tutorial` 依序播，左上角顯示目前目標（🎯）。
- **觀音評定**：3／6／9／12 月第 4 週。B 的分數公式與等第、12 月 ×1.3 與獎勵 ×2、升星條件（人氣、店家數、街坊、幫助、月營業額、住宅、打倒王，一次升 1 星）、年度升階、勳章、D 等第指派 `HQ.reviewTasks`（下季完成功德 ×3）。前後播 C 的 `HQ.reviewScenes` 台詞。卷軸彈窗仿 `review-mockup`。居民面板會列出「下一顆星還差什麼」。
- **巡守**：E 的 `worldmap.png` 上疊地名牌（地點對 C 的 maps，id 不同時用對照表 daoju↔saw 等）。選地點 → 選最多 9 人 → 付旅費（`HQ.travelCost`×人數、北境船票功德）→ 2 週後回來自動結算（B 的敵人數值、援手、中頭目、王），勝利播 C 的 boss／clear 台詞、給王的功德冥紙、勳章、旗標。冥紙低於 2,000 不能出征，出征期間來客 ×0.6。
- **街區保衛戰**：自動結算版，照 C 的 `HQ.defense` 五波（敵人 id、數量、目標建築），守不住的波次目標建築受損（有 E 的戰損圖就換圖），要花冥紙修；勝敗套 C 的 win／lose 效果與台詞（lose 的 `retryInWeeks` 會排程再來）。☆3 後巡守面板可迎戰，事件 `effect.defense` 也會排程開戰。
- **道具**：安心香、紙錢捆、遺願糖（打怪寶箱掉）；同頁可辦 B 的主動活動（每季 7 次）。
- **設定**：速度、縮放、回車站、顯示建築名稱、存檔、重新開始、資料來源（哪些是 data、哪些是範例）、說明、非官方粉絲作品聲明。
- **驗證**：手機 375×812 與桌機 1024×768 都看過；console 快轉 60 週（測試腳本每週多給 1,500 冥紙、自動蓋店接委託；跑出出征、擴建、22 件委託、☆1、升見習月老）與保衛戰都沒有 JS 錯誤。

## 已知缺口

- 保衛戰是自動結算，沒有地圖上的即時波次與技能按鈕（C 的 `skills`、`reinforce` 只讀了敵人與台詞）。
- 出征沒有「出發→抵達→戰鬥」的地圖動畫，結果用文字戰報；`mid` 台詞沒播。
- 外賓（guest）只記在狀態裡，不會在街上走；`HQ.honors` 稱號、`HQ.outskirts` 的各區名稱還沒用；魔氣暴走（`balance.moki`）沒做；`extra` 裡的 `workSite`、`training`、`comfortRadius`、`gacha`、`sellsGear`（裝備）、`annualFestival` 沒實作。
- 道具系統很小（三種），沒有裝備欄。
- 街坊不會自己蓋房子；一般亡魂的長相全靠 `soul-1～8`（還沒有圖時畫小幽靈）。
- 角色缺圖時會 404（每次載入一輪）；D 若出 `art/chars/index.json`（`{ "<id>": {...}, "<id>-face": {...}, "soul-1": {...} }`）引擎就只載列出的。
- 早期節奏：照 B 的參數，前 4 週一週只來 3～4 位亡魂、六成帶著遺憾離開（求文印的一週只能做 1 組），畫面偏空；功德到中期累積很快（15 個月約 4,000）。數值都在 `HQ.balance`，給 B 調。

## 對其他線的需求

- **B**：看上面「早期節奏」那條。另外 `upgradeCost`、`extra` 的實作範圍見已知缺口，要加哪個告訴我。
- **C**：maps 的 id 跟 E 的 worldmap.json 不同（daoju／saw、gengyin／gaoxiong、xinkujiang／xinjue、relic／ruins），引擎有對照表，統一更好。`HQ.defense.skills` 要有即時保衛戰才用得到。
- **D**：缺圖的角色見 404 清單（yiman、xiaoqing、xiaole、waipo、tiedan、shencha、rat、qianliyan、moti、mi、maoguai、lvyi、linbobo、liangan、laoren、hathor、guangtou、gongwan、gengyin、dulao、daniu…）與 `soul-1～8`、`mob-*`；建議出 `art/chars/index.json`。
- **E**：都接上了。鐵軌是程式畫的（tileset 沒有軌道格），要的話可以補 `rail_*`。
