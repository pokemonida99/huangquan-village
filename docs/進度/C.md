# 線 C 進度：角色、委託、事件、行事曆、出征地點

## 2026-10-24 台詞順序重寫

使用者覺得開場很怪：原句硬塞、前後接不上。改成「遊戲自己的劇情順序為主，原句只放在接得上的地方」。
- 開場教學 `HQ.tutorial` 重寫成 3 段：月老帶語彤到河岸（`join` 讓月老直接加入）→ 蓋紋身店 → 第一班列車 → 第一組文印。
- 所有角色的 `arrive` 重寫成一小段入住戲（先一句旁白交代場景，再讓角色自己說）。外賓標題是「外賓來訪」。
- 觀音巡察台詞換掉沒前因的原句；第一次巡察不派任務；只派做得到的任務。
- 事件：補一句旁白當開頭、調整順序、拿掉只有在原劇才看得懂的句子。
- 引擎：**還沒入住的街坊不會在任何對話裡開口**；台詞第 4 欄可寫條件 `{ resident: id }`／`{ absent: id }`（例：奧客事件有沒有小米兩種版本）。對話框不再顯示集數，資料裡的出處照留。
- 遊戲自己寫的句子第一欄一律 `null`；沿用的原句保留原本的集數（去掉開頭語助詞的也保留）。


## 做了什麼

| 檔案 | 內容 |
|---|---|
| `data/chars.js` | `HQ.chars` 50 位：街坊 21、外賓 7、觀音、出征援手 6、委託人 10、陽間的人 5 |
| `data/requests.js` | `HQ.requests` 36 件委託（EP1 毛怪、小樂、大牛、茉蒂、阿斌的媽媽……到 S5 庚寅地球） |
| `data/events.js` | `HQ.events` 28 個隨機／觸發事件；`HQ.tutorial` 月老教學 7 步 |
| `data/calendar.js` | `HQ.calendar` 12 個月（清明、七夕、中元、愛神大夜市、愛神祭選拔、季評定、年度評定）；`HQ.reviewScenes` 觀音台詞；`HQ.reviewTasks` D 等指派任務 |
| `data/maps.js` | `HQ.maps` 8 個出征地點；`HQ.outskirts` 外圍 4 區；`HQ.defense` 第三王國入侵 5 波 |

- 所有 id 都照 B 的檔案：建築、緣分組合、地圖（daoju / gengyin / xinkujiang / seaside / relic / demon2 / demon3 / north）、敵人、職業、心願。用 osascript 把九個 data 檔一起載入，交叉檢查過，只差一個 `en-reaper`（已請 B 補）。
- **台詞**：804 句原句，每句都和 `huangquan-episodes/data/episodes.json` 逐字比對過（集數、說話者、確定度）。推測台詞（確定度 0）只用了 8 處，集數都加了「?」。遊戲自己寫的旁白第一欄是 `null`，只描述劇中有的東西。
- **「老闆」**：所有遊戲文字都沒有這兩個字。原句裡有「老闆」的我都避開，或只截取不含它的部分（例：大牛「拜託你原諒我」、哈索爾「那就別怪我不客氣了」）。業鏡羅漢的 id 是 `lee`，顯示名「業鏡羅漢」。

## 給 A（引擎）的格式重點

**台詞** `[集數, 句子, 說話者?]`
- 說話者是 HQ.chars 的 id 時，顯示角色名和頭像；不是 id 時直接顯示這個字串（「字卡」「阿姨」「撒旦」「術士」……）。chars 裡沒寫說話者的就是該角色自己。
- 集數是 `null` 表示遊戲旁白，不顯示集數；集數結尾有 `?` 表示推測台詞。
- 說話者是還沒入住的街坊時，那句可以跳過不播。

**角色** `movein` 的鍵：`order`（固定入住序）、`traits`、`popularity`、`rank`、`helped`、`resident`、`request`、`map`、`flag`、`building`、`month`。入住順序照企劃書 11 節：語彤 → 月老 → 咪咪 → 黑糖 → 業鏡羅漢 → 小雨 → 大寶、白妹；之後不排序，靠條件。`arrive` 是入住時播的台詞。`cutin` 是劇中招式名，可當戰鬥字卡用。

**委託** `need`：`building`、`combo`、`trait`+`min`、`resident`、`action`（dream / tattoo / macaron / comfort）、`pay`、`map`、`flag`、`helped`。`reward`：`merit`、`helped`、`money`、`popularity`、`traits`、`movein`、`unlock`、`flag`、`job`。`intro` 在接委託時播，`lines` 在完成時播。

**事件** `when`：`random`（每週機率）、`month`、`week`、`rank`、`resident`（可以是陣列）、`guest`、`building`、`flag`、`noflag`、`chain`（只會被 next 叫出來）、`trigger`（`"moki"` 魔氣暴走判定、`"expedition"` 搭配 `party`、`"built"`）、`once`。`effect`：`merit`、`money`、`popularity`、`helped`、`traits`、`flag`、`spawn`、`close`、`away`、`trainMul`、`block`、`guest`、`next`、`defense`、`ifResident`。另外 `choice` 是選項，`residentLines` 是某人在場時多播的台詞。

**行事曆**：`week` 1～4；`weeks` 是持續週數；`mods` 是持續期間的倍率（`offeringMul`、`incenseMul`、`mobMul`、`wishMul`、`wenyinMul`）；`review: "quarter" | "year"` 交給 B 的 `HQ.review` 算分，台詞用 `HQ.reviewScenes`。

**旗標**（事件、委託、地圖之間的連動）：`leviathan-visit`、`ganlu`（愛染明王的甘露寶瓶，謎的委託要用）、`letter`、`radar`、`lingqi`、`osiris`、`bracelet`、`laji-judged`、`baizhu-done`、`bachi-done`、`seaside-done`、`lingtong`、`satan-done`、`north-done`、`invasion-done`。

**保衛戰** `HQ.defense`：從車站那一側進攻，共 5 波（先遣骷髏兵 → 百夫長擄狐姬 → 拒神結界 → 瘟疫攻車站 → 撒旦和辜老師打到市役所前）。觀音照劇情被拒神結界擋在外面，改由她託付的鼠軍師當援軍；千里眼守車站。

## 線 D 要畫的角色（`art/chars/<id>.png` 走路圖＋`<id>-face.png` 頭像）

**draw 1：街坊，走路圖和頭像都要（21 位）**
yutong 語彤、yuelao 月老、mimi 咪咪、heitang 黑糖、lee 業鏡羅漢、xiaoyu 小雨、dabao 大寶、baimei 白妹、huji 狐姬、jiuwei 九尾、yangzi 孟婆、no7 七號、du 杜先生、huatuo 華佗、paofu 泡芙、xiaomi 小米、mi 謎、nova 諾瓦、leviathan 利維坦、rat 鼠軍師、qianliyan 千里眼

**draw 2：外賓、援手、觀音，走路圖和頭像都要（14 位）**
lvyi 綠衣女子、gongwan 貢丸君、cat918 918號、shencha 神差、hathor 哈索爾、aphrodite 阿芙羅黛蒂、aizen 愛染明王、guanyin 觀音菩薩、dulao 杜老大、tiedan 鐵蛋、guangtou 光頭小弟、gengyin 庚寅月老、lucifer 路西法、zhurong 祝融

**draw 3：只要頭像（走路可借 soul-N）（15 位）**
maoguai 毛怪、xiaole 小樂、daniu 大牛、moti 茉蒂、abinmom 阿斌的媽媽、laoren 獨居的爺爺、waipo 外婆、couple 男同志情侶、liangan 梁安恆、yiman 林怡曼、linbobo 林伯伯、bohong 王柏宏、afu 阿副、xiaoqing 筱晴、akasaka 赤坂

**怪物與敵人**（`art/chars/mob-<id>.png`；id 是 B 的 HQ.mobs / HQ.enemies）
外圍：mob-lost 迷途魂、mob-ghost 抓交替冤魂、mob-miasma 魔氣團、mob-lizard 蜥蜴蠱。
出征與保衛戰會用到：en-sawghost、en-sinner、boss-laji 辣雞、en-baizhu 白蛛會幫眾、en-shushi 術士、en-gu 蜥蜴蠱、boss-bailaoda 白老大、en-raincoat 黃雨衣、boss-hasshaku 八尺大人、en-drowned、boss-tide、en-relic、boss-eye 古神之眼、en-narwhal、en-rat 鼠軍師（可共用 rat）、boss-leviathan（可共用 leviathan）、en-skeleton 骷髏兵、en-bat 蝙蝠惡魔、en-reaper 第三王國惡魔、en-gu-teacher 辜老師、boss-plague 瘟疫、boss-satan 撒旦、en-north、boss-evilgod 邪神帝。轉珠遊戲 `huangquan-puzzle/art/enemy-*.webp` 大多有參考圖（laji2、baizhu、shushi、lizard、raincoat、bachi、godeye、skeleton、bat、reaper、gu、plague、satan、xieshen、ghost、moqi）。

## 還缺什麼／對別人的需求

- **B**：補 `en-reaper`；`en-narwhal`「獨角鯨族衛兵」和劇情衝突（獨角鯨族只剩諾瓦），建議改成「惡魔士兵」或「倉鼠小兵」。細節在共用筆記 `C-ids.md`。B 建議下修的四個入住門檻已經照改（大寶 思念 15、白妹 儀容 10、狐姬 娛樂 20、七號 美味 45）。
- **A**：九個 data 檔的載入順序：traits → buildings → jobs → ranks → chars → requests → events → calendar → maps（我是照這個順序測的，彼此沒有執行期相依，順序其實不影響）。
- 一般亡魂的名字和對話沒寫，因為劇中沒有；泡泡和安心度交給 A 和 B。
- 委託和事件裡有幾段劇情比較沉重（天煞孤星、奈何橋封禁、掛念心悸），都放在 ☆1／☆4 之後，而且一輪只發生一次。
