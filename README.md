# 三途川物語（暫名）

《黃泉燒肉店》（IG「棲渺拾光」）角色的經營小遊戲，玩法參考開羅遊戲《冒險村物語 2》。非官方粉絲作品。

- 試玩：https://pokemonida99.github.io/huangquan-village/
- 語彤剛當上實習月老，一個人從三途川岸邊開始；月老、業鏡羅漢、小雨、大寶……一位位入住，帶來自己的店。目標是幫助更多人，從實習月老升成正式月老。每季觀音來評定。
- 手機直式優先，存檔在瀏覽器 localStorage。

## 本機執行

```bash
python3 -m http.server 4210
```

開 http://localhost:4210/ 。測試用 console：`HQGame.fastForward(12)` 快轉 12 週、`State.wipe(); location.reload()` 重來。

## 結構

| 位置 | 內容 |
|---|---|
| `index.html` `style.css` `src/` | 遊戲引擎（Canvas，無建置步驟） |
| `data/` | 建築、職業、特徵、評價（數值）；角色、委託、事件、行事曆、出征地點（台詞皆標原劇集數） |
| `art/` | 像素圖：`chars/` 角色、`buildings/` 建築、`tiles/` 地面與世界地圖、`props/` 點綴；調色盤 `palette.json` |
| `balance/` | 經濟模擬器與結果 |
| `tools/` | 生圖提示詞與轉像素工具 |
| `docs/` | 企劃書、開羅機制參考、介面約定、各線進度 |
| `concept/` | 企劃階段的概念圖 |

角色與劇情版權屬原作；概念圖與像素素材為 AI 生成後處理。
