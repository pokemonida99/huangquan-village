# E 線進度：建築、地面、地圖美術

## 做好的

### 建築 `art/buildings/`
- **38 棟，id 與佔地完全照 B 線 `data/buildings.js`**（station、cityhall、naihe、tattoo、yakiniku、photo、salon、mengpo、temple、gecko、manga、sushi、festival、clinic、dogpark、catstop、barrier、tattoo2、sawhall、shrine、yimin、paper、costume、flower、incense、inn、teahouse、fries、mala、nightstall、house、tower、lantern、higanbana、swing、bench、garden、redbridge）。道路三種在 tileset 裡（見下）。
- 寬 = 格數 × 32，高往上超出（最多比佔地高 64 px），**底邊對齊佔地最後一列**。太高的（tower）會等比縮小、左右置中。
- 戰損版（保衛戰）：`yakiniku-damaged`、`tattoo-damaged`、`photo-damaged`、`salon-damaged`、`station-damaged`。`index.json` 的原建築帶 `"damaged": "<路徑>"`。
- `art/buildings/index.json`：`{ id: { w, h, size: [寬, 高], damaged? } }`。
- 聯絡表：`art/buildings/_preview.png`（每棟畫在佔地格線上，2 倍）。
- 1×1 的店（flower、incense、house…）只有 32 px 寬，細節會少，是格數決定的。

### 道具 `art/props/`（不佔建築格的點綴，A 可以隨機撒在外圍/街上）
toro 石燈籠、jizo 地藏、willow 垂柳、noticeboard 公告欄；荒岸用：deadwillow 枯柳、stump 樹樁烏鴉、brokenboat 破船、brokenfence 斷柵、graves 墓碑、rocks 亂石、lily_s / lily_l 彼岸花叢、reeds 蘆葦、brokentoro 倒燈籠、talismanpost 符咒木樁、miasma 魔氣結晶。`art/props/index.json` 有 w、h、說明。

### 地面 `art/tiles/ground.png` + `index.json`
- 程式畫的（`tools/tiles_ground.py`），保證無縫、全在調色盤內。8 欄，每格 32×32，`index.json` 的 `tiles[name] = {x, y, i, note}`。
- 有：grass_0~2、grass_flower、stone_0/1、dirt_0/1、redline_0/1（紅線步道）、barren_0/1（荒岸）、water_0/1（`anim` 每 500 ms 交替）、lily_a/b、grass_tuft、pebbles（透明疊圖）、bank_*（12 片河岸）、bridge_v_a/m/b、bridge_h_a/m/b、fog_0/1、fog_edge_n/s/w/e。
- `alias`：`dirt / stone / redline / grass / water / barren` → B 的 `ground.png#dirt` 這種寫法直接查 alias。
- **河岸畫法**：水格先畫 water，草地格若鄰接水，先畫 water 再疊 bank_*（透明處露水）。規則（只看鄰格是不是水）：
  北+西→`nw`、北+東→`ne`、南+西→`sw`、南+東→`se`；只有北→`n`、南→`s`、西→`w`、東→`e`；四鄰都不是水但斜角是→`inw/ine/isw/ise`。`tools/tiles_testmap.py` 就是照這規則拼的，A 可以直接抄。
- 測試拼圖：`art/tiles/_testmap.png`。

### 世界地圖 `art/tiles/worldmap.png` + `worldmap.json`
- 360×540（直式，遊戲內 2 倍 = 720×1080），**圖上沒有字**，地名、星數、鎖頭請引擎疊。
- `worldmap.json` 的 `places`：九個地點 id、名稱、開放條件（照企劃書 §15）、座標 x/y（圖示中心）。id：`sanzu saw gaoxiong xinjue seaside ruins demon2 demon3 north`。預覽：`art/tiles/_worldmap_preview.png`。

## 工具
- `tools/tiles_pixelize.py`：洋紅底切圖、縮放、量化到 `art/palette.json`。
- `tools/tiles_buildings.py`：從 `art/_raw/` 生圖切出所有建築／道具，寫 index.json 與聯絡表。改 B 的 size 後重跑即可。
- `tools/tiles_genqueue.sh`：生圖佇列（同時 2 張）。提示詞在 `tools/tiles_prompts.md`、`art/_raw/jobs*.tsv`。
- 原始大圖在 `art/_raw/`（不進遊戲，可不部署）。

## 對別人的需求
- **A**：建築用 `index.json` 的 w/h，畫在 `(左上格x*32, (底列+1)*32 - h)`。水 2 格動畫。霧疊最上層。
- **B**：B 的清單已全部有圖。沒在 B 清單、我多做的：props（裝飾點綴），不用進 buildings.js。
- **C**：`data/maps.js` 的地點 id 請對 `worldmap.json`（或告訴我改名）。
