/* 三途川物語 — 建築與緣分組合（B 線）
   數值以《冒險村物語 2》為底（道路 10G、旅館 600G、武器店 800G、燒肉 3000G、壽司 5500G……），
   冥紙 ≈ G。升級、等級係數的公式在 HQ.balance（data/ranks.js）。
   cat: special 劇中名店（unique）、shop 商店、food 飲食、home 住宅、deco 裝飾、road 道路
   unlock 寫法：{ start: true } | { resident: "<char id>" } | { rank: ☆ } | { helped: N } | { title: 1 }，
   多個鍵同時寫＝全部都要達成。
   work：這間店要不要街坊上班（staff 人數）。沒人上班的店照常營業，但品質 -30%。
   extra：特殊效果，引擎依 key 實作（見檔尾說明）。 */
window.HQ = window.HQ || {};

HQ.buildings = [
  /* ───────────── 劇中名店（每種限一間） ───────────── */
  { id: "station", name: "三途川車站", cat: "special", size: [3, 2],
    cost: 0, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 20, maxLv: 5,
    traits: { 思念: 3, 秩序: 2 }, serves: [], unique: true, fixed: true,
    unlock: { start: true }, work: 0,
    extra: { arrivals: true, trainsPerWeekByLv: [14, 14, 18, 21, 28] },
    upgradeCost: [0, 3000, 8000, 15000, 30000],
    desc: "引渡貓一天早晚兩班列車，亡魂從這裡下車。升級增加班次。",
    sprite: "art/buildings/station.png" },

  { id: "cityhall", name: "三途川市役所", cat: "special", size: [3, 2],
    cost: 0, upkeep: 30, merit: 0, price: 0, quality: 10, appeal: 15, maxLv: 5,
    traits: { 秩序: 8 }, serves: [], unique: true, fixed: true,
    unlock: { start: true }, work: 1,
    extra: { jobChange: true, eventDiscountPerLv: 0.04 },
    desc: "轉職窗口、申請令旗、受理奧客抗議。小米入住後品質提升。",
    sprite: "art/buildings/cityhall.png" },

  { id: "naihe", name: "奈何橋", cat: "special", size: [3, 2],   // 2026-10-24：橫跨在三途川上
    cost: 0, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 25, maxLv: 1,
    traits: { 思念: 4, 安心: 2 }, serves: [], unique: true, fixed: true,
    unlock: { start: true }, work: 0,
    extra: { exit: true },
    desc: "送別投胎的亡魂從這裡離開。",
    sprite: "art/buildings/naihe.png" },

  { id: "tattoo", name: "月老紋身店", cat: "special", size: [2, 2],
    cost: 1500, upkeep: 60, merit: 0, price: 60, quality: 25, appeal: 22, maxLv: 10,
    traits: { 緣分: 10, 藝術: 3 }, serves: ["tattoo"], unique: true,
    unlock: { resident: "yuelao" }, work: 1,
    extra: { wenyin: { meritPerSet: 30, helpedPerSet: 2, extraSetsAtLv: [4, 7, 10] } },
    desc: "愛戀文印：兩位想求文印的亡魂各付冥紙，結成一組＝幫助 2 人、功德 +30（紋身師的那一份）。每週組數看位階（HQ.titles.wenyinPerWeek）與店等級。",
    sprite: "art/buildings/tattoo.png" },

  { id: "yakiniku", name: "黃泉燒肉店", cat: "special", size: [2, 2],
    cost: 3000, upkeep: 120, merit: 0, price: 40, quality: 32, appeal: 35, maxLv: 10,
    traits: { 美味: 12, 安心: 3 }, serves: ["eat", "reincarnate"], unique: true,
    unlock: { resident: "lee" }, work: 2,
    extra: { macaron: { meritPerSoul: 6, helpedPerSoul: 1 }, freeForPermit: true },
    desc: "業鏡羅漢的店。持輪迴許可的客人免費；遺願馬卡龍讓安心度滿的亡魂投胎。",
    sprite: "art/buildings/yakiniku.png" },

  { id: "photo", name: "托夢照相館", cat: "special", size: [2, 2],
    cost: 2200, upkeep: 80, merit: 0, price: 50, quality: 30, appeal: 25, maxLv: 10,
    traits: { 思念: 12 }, serves: ["dream"], unique: true,
    unlock: { resident: "dabao" }, work: 1,
    extra: { dream: { meritCost: 10, helped: 1, anshin: 40 } },
    desc: "托夢：亡魂付冥紙拍照，街區代付 10 功德（劇中行情），換來與陽間親人見面——幫助 +1、安心度大增。功德不足時只拍照不托夢。",
    sprite: "art/buildings/photo.png" },

  { id: "salon", name: "碧落髮廊", cat: "special", size: [2, 1],
    cost: 1600, upkeep: 50, merit: 0, price: 30, quality: 26, appeal: 20, maxLv: 10,
    traits: { 儀容: 12 }, serves: ["hair"], unique: true,
    unlock: { resident: "baimei" }, work: 1,
    desc: "白妹的髮廊。頭七前整理儀容；和托夢照相館相鄰＝頭七套餐。",
    sprite: "art/buildings/salon.png" },

  { id: "mengpo", name: "孟婆甜食屋", cat: "special", size: [2, 1],
    cost: 2400, upkeep: 70, merit: 0, price: 25, quality: 30, appeal: 28, maxLv: 10,
    traits: { 美味: 8, 安心: 4 }, serves: ["sweets"], unique: true,
    unlock: { resident: "no7" }, work: 1,
    extra: { recommend: true },
    desc: "七號會推薦最適合的甜點：甜點心願一次滿足、安心度加倍。",
    sprite: "art/buildings/mengpo.png" },

  { id: "temple", name: "月老廟（陽間）", cat: "special", size: [2, 2],
    cost: 2000, upkeep: 40, merit: 100, price: 10, quality: 20, appeal: 20, maxLv: 10,
    traits: { 香火: 15, 緣分: 5, 思念: 3 }, serves: ["prayer"], unique: true,
    unlock: { resident: "yuelao", helped: 20 }, work: 0,
    extra: { incense: { meritPerMonth: 20, meritPerLv: 6, qingmingMul: 2 } },
    desc: "陽間的月老廟，柏宏當志工。每月固定香火功德，清明加倍。",
    sprite: "art/buildings/temple.png" },

  { id: "gecko", name: "守宮廣場", cat: "special", size: [3, 2],
    cost: 1200, upkeep: 30, merit: 0, price: 0, quality: 18, appeal: 18, maxLv: 10,
    traits: { 藝術: 10, 安心: 2 }, serves: ["art"], unique: true,
    unlock: { helped: 15 }, work: 0,
    extra: { workSite: { meritPerWeekPerWorker: 2, maxWorkers: 3 } },
    desc: "畫畫賺功德的工作場（謎的故事）。閒著的街坊會來畫畫。",
    sprite: "art/buildings/gecko.png" },

  { id: "manga", name: "語の漫畫", cat: "special", size: [2, 2],
    cost: 3500, upkeep: 110, merit: 50, price: 45, quality: 34, appeal: 30, maxLv: 10,
    traits: { 藝術: 10, 娛樂: 6 }, serves: ["art", "rest"], unique: true,
    unlock: { resident: "nova" }, work: 1,
    extra: { stay: true },
    desc: "語彤開的留宿型漫畫店。諾瓦在這裡學畫。",
    sprite: "art/buildings/manga.png" },

  { id: "sushi", name: "葬壽司", cat: "special", size: [2, 2],
    cost: 5500, upkeep: 180, merit: 0, price: 80, quality: 40, appeal: 38, maxLv: 10,
    traits: { 美味: 14, 娛樂: 4 }, serves: ["eat", "fun"], unique: true,
    unlock: { rank: 2 }, work: 2,
    extra: { gacha: { platesPerSpin: 5, itemChance: 0.2 } },
    desc: "五盤轉一次扭蛋，偶爾掉道具。",
    sprite: "art/buildings/sushi.png" },

  { id: "festival", name: "愛神祭會場", cat: "special", size: [3, 3],
    cost: 8000, upkeep: 200, merit: 300, price: 30, quality: 35, appeal: 60, maxLv: 5,
    traits: { 娛樂: 15, 緣分: 10 }, serves: ["fun"], unique: true,
    unlock: { rank: 2 }, work: 0,
    extra: { annualFestival: { month: 8, popularity: 120, merit: 150 } },
    desc: "每年 8 月愛神祭（選拔＋愛神大夜市），人氣大增。",
    sprite: "art/buildings/festival.png" },

  { id: "clinic", name: "華佗醫館", cat: "special", size: [2, 1],
    cost: 2600, upkeep: 90, merit: 0, price: 40, quality: 30, appeal: 15, maxLv: 10,
    traits: { 安心: 8, 秩序: 2 }, serves: ["heal"], unique: true,
    unlock: { resident: "huatuo" }, work: 1,
    extra: { heal: true, curseCure: true, rescueDiscount: 0.3 },
    desc: "除咒、治療掛念心痛；巡守受傷的街坊回復加快。掛念心悸救人所需功德 -30%。",
    sprite: "art/buildings/clinic.png" },

  { id: "dogpark", name: "慰靈犬小屋", cat: "special", size: [1, 1],
    cost: 800, upkeep: 20, merit: 0, price: 0, quality: 15, appeal: 14, maxLv: 5,
    traits: { 安心: 10 }, serves: ["rest"], unique: true,
    unlock: { resident: "heitang" }, work: 0,
    extra: { comfortRadius: 4, anshinMul: 1.25 },
    desc: "黑糖的窩。周圍 4 格內的亡魂安心度上升 ×1.25。",
    sprite: "art/buildings/dogpark.png" },

  { id: "catstop", name: "引渡貓候車亭", cat: "special", size: [1, 1],
    cost: 900, upkeep: 20, merit: 0, price: 0, quality: 10, appeal: 16, maxLv: 5,
    traits: { 思念: 3, 秩序: 3 }, serves: [], unique: true,
    unlock: { resident: "mimi" }, work: 0,
    extra: { arrivalsPerTrain: 0.15, perTwoLv: 0.05 },
    desc: "咪咪的候車亭。每班列車亡魂期望值 +0.15（每升 2 級再 +0.05）。",
    sprite: "art/buildings/catstop.png" },

  { id: "barrier", name: "九尾結界石", cat: "special", size: [1, 1],
    cost: 1800, upkeep: 30, merit: 80, price: 0, quality: 0, appeal: 12, maxLv: 5,
    traits: { 安心: 6, 秩序: 8, 魔氣: -15 }, serves: [], unique: true,
    unlock: { resident: "jiuwei" }, work: 0,
    extra: { defense: true },
    desc: "壓住魔氣暴走；保衛戰時防禦提升。",
    sprite: "art/buildings/barrier.png" },

  { id: "tattoo2", name: "杜氏紋身（分店）", cat: "special", size: [2, 1],
    cost: 2800, upkeep: 90, merit: 100, price: 70, quality: 30, appeal: 22, maxLv: 10,
    traits: { 緣分: 8, 藝術: 6 }, serves: ["tattoo"], unique: true,
    unlock: { resident: "du" }, work: 1,
    extra: { wenyin: { meritPerSet: 30, helpedPerSet: 2, setsPerWeek: 1 } },
    desc: "杜先生的分店，每週多 1 組文印。做太多會掛念心痛（事件）。",
    sprite: "art/buildings/tattoo2.png" },

  { id: "sawhall", name: "刀鋸道場", cat: "special", size: [2, 2],
    cost: 4500, upkeep: 120, merit: 0, price: 0, quality: 20, appeal: 18, maxLv: 10,
    traits: { 秩序: 10, 魔氣: -5 }, serves: ["gear"], unique: true,
    unlock: { resident: "paofu" }, work: 0,
    extra: { training: { expPerWeek: 25 } },
    desc: "泡芙的道場（劍道場）。閒著的街坊來練功拿經驗。",
    sprite: "art/buildings/sawhall.png" },

  { id: "shrine", name: "忠烈祠", cat: "special", size: [2, 2],
    cost: 3000, upkeep: 50, merit: 120, price: 0, quality: 25, appeal: 30, maxLv: 5,
    traits: { 香火: 12, 秩序: 4 }, serves: ["prayer"], unique: true,
    unlock: { helped: 120 }, work: 0,
    extra: { incense: { meritPerMonth: 15, meritPerLv: 5, qingmingMul: 2 } },
    desc: "大寶因生前英勇入祀之處（功德值 120）。",
    sprite: "art/buildings/shrine.png" },

  { id: "yimin", name: "義民廟", cat: "special", size: [2, 2],
    cost: 6000, upkeep: 60, merit: 200, price: 0, quality: 30, appeal: 40, maxLv: 5,
    traits: { 香火: 18, 安心: 4 }, serves: ["prayer"], unique: true,
    unlock: { helped: 300 }, work: 0,
    extra: { incense: { meritPerMonth: 40, meritPerLv: 10, qingmingMul: 2 } },
    desc: "村民替阿志蓋的廟，累積了六萬功德。",
    sprite: "art/buildings/yimin.png" },

  /* ───────────── 一般商店 ───────────── */
  { id: "paper", name: "紙紮舖", cat: "shop", size: [2, 1],
    cost: 800, upkeep: 70, merit: 0, price: 35, quality: 15, appeal: 12, maxLv: 10,
    traits: { 思念: 3, 秩序: 1 }, serves: ["shop", "gear"],
    unlock: { start: true }, work: 1,
    extra: { sellsGear: "weapon" },
    desc: "陽間燒來的紙紮刀劍。街坊的武器。",
    sprite: "art/buildings/paper.png" },

  { id: "costume", name: "戲服店", cat: "shop", size: [2, 1],
    cost: 1100, upkeep: 70, merit: 0, price: 40, quality: 16, appeal: 14, maxLv: 10,
    traits: { 儀容: 6, 娛樂: 2 }, serves: ["shop", "gear"],
    unlock: { start: true }, work: 1,
    extra: { sellsGear: "armor" },
    desc: "什麼衣服都有，也有能擋刀鋸的。街坊的防具。",
    sprite: "art/buildings/costume.png" },

  { id: "flower", name: "彼岸花飾店", cat: "shop", size: [1, 1],
    cost: 1400, upkeep: 60, merit: 0, price: 30, quality: 18, appeal: 18, maxLv: 10,
    traits: { 緣分: 4, 儀容: 3 }, serves: ["shop"],
    unlock: { start: true }, work: 1,
    extra: { sellsGear: "accessory" },
    desc: "彼岸花做的飾品。",
    sprite: "art/buildings/flower.png" },

  { id: "incense", name: "香舖", cat: "shop", size: [1, 1],
    cost: 1000, upkeep: 40, merit: 0, price: 15, quality: 14, appeal: 12, maxLv: 10,
    traits: { 香火: 4, 思念: 3 }, serves: ["prayer", "shop"],
    unlock: { start: true }, work: 0,
    desc: "白妹拿功德買香、想多存一點。",
    sprite: "art/buildings/incense.png" },

  { id: "inn", name: "亡魂客棧", cat: "shop", size: [2, 2],
    cost: 600, upkeep: 120, merit: 0, price: 25, quality: 14, appeal: 10, maxLv: 10,
    traits: { 安心: 5 }, serves: ["rest"],
    unlock: { start: true }, work: 1,
    extra: { recover: true },
    desc: "巡守受傷的街坊在這裡休息。",
    sprite: "art/buildings/inn.png" },

  { id: "teahouse", name: "茶館", cat: "food", size: [2, 1],
    cost: 900, upkeep: 50, merit: 0, price: 15, quality: 15, appeal: 14, maxLv: 10,
    traits: { 安心: 3, 美味: 3 }, serves: ["rest", "eat"],
    unlock: { start: true }, work: 1,
    desc: "等列車、等投胎都在這裡坐。",
    sprite: "art/buildings/teahouse.png" },

  { id: "fries", name: "薯條攤", cat: "food", size: [1, 1],
    cost: 600, upkeep: 30, merit: 0, price: 12, quality: 12, appeal: 16, maxLv: 10,
    traits: { 美味: 5 }, serves: ["eat"],
    unlock: { start: true }, work: 0,
    desc: "茉蒂最想吃的薯條。",
    sprite: "art/buildings/fries.png" },

  { id: "mala", name: "麻辣鍋店", cat: "food", size: [2, 2],
    cost: 2200, upkeep: 90, merit: 0, price: 45, quality: 26, appeal: 22, maxLv: 10,
    traits: { 美味: 8, 娛樂: 2 }, serves: ["eat"],
    unlock: { rank: 1 }, work: 1,
    desc: "地府也有人嗜辣。",
    sprite: "art/buildings/mala.png" },

  { id: "nightstall", name: "愛神夜市攤", cat: "food", size: [1, 1],
    cost: 1200, upkeep: 40, merit: 0, price: 20, quality: 18, appeal: 24, maxLv: 10,
    traits: { 娛樂: 7, 美味: 2 }, serves: ["fun", "eat"],
    unlock: { rank: 1 }, work: 0,
    desc: "愛神大夜市的小攤，一年四季都開。",
    sprite: "art/buildings/nightstall.png" },

  /* ───────────── 住宅 ───────────── */
  { id: "house", name: "街坊小屋", cat: "home", size: [1, 1],
    cost: 400, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 2, maxLv: 1,
    traits: { 安心: 1 }, serves: [],
    unlock: { start: true }, work: 0,
    extra: { capacity: 1, taxPerYear: 300 },
    desc: "一位街坊住一間（DV2 空き家）。每年 4 月繳稅。",
    sprite: "art/buildings/house.png" },

  { id: "tower", name: "靈骨塔公寓", cat: "home", size: [2, 2],
    cost: 1600, upkeep: 20, merit: 0, price: 0, quality: 0, appeal: 4, maxLv: 1,
    traits: { 安心: 3, 秩序: 2 }, serves: [],
    unlock: { rank: 2 }, work: 0,
    extra: { capacity: 4, taxPerYear: 300 },
    desc: "四戶一棟，省地。",
    sprite: "art/buildings/tower.png" },

  /* ───────────── 裝飾（周圍 1 格的店品質 +qualityAura） ───────────── */
  { id: "lantern", name: "燈籠路燈", cat: "deco", size: [1, 1],
    cost: 200, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 3, maxLv: 1,
    traits: { 安心: 1, 秩序: 1, 思念: 1 }, serves: [], unlock: { start: true }, work: 0,
    extra: { qualityAura: 2 }, desc: "夜色三途川的紅燈籠。", sprite: "art/buildings/lantern.png" },

  { id: "higanbana", name: "彼岸花叢", cat: "deco", size: [1, 1],
    cost: 400, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 5, maxLv: 1,
    traits: { 思念: 1, 緣分: 1 }, serves: [], unlock: { start: true }, work: 0,
    extra: { qualityAura: 3 }, desc: "開在河岸的紅花。", sprite: "art/buildings/higanbana.png" },

  { id: "swing", name: "鞦韆", cat: "deco", size: [1, 1],
    cost: 600, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 6, maxLv: 1,
    traits: { 娛樂: 3, 思念: 1 }, serves: [], unlock: { start: true }, work: 0,
    extra: { qualityAura: 3 }, desc: "", sprite: "art/buildings/swing.png" },

  { id: "bench", name: "河邊躺椅", cat: "deco", size: [1, 1],
    cost: 500, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 5, maxLv: 1,
    traits: { 安心: 2, 思念: 1 }, serves: [], unlock: { start: true }, work: 0,
    extra: { qualityAura: 3 }, desc: "看著河水等列車。", sprite: "art/buildings/bench.png" },

  { id: "garden", name: "日式庭園", cat: "deco", size: [2, 2],
    cost: 2000, upkeep: 10, merit: 0, price: 0, quality: 0, appeal: 16, maxLv: 1,
    traits: { 安心: 3, 藝術: 3 }, serves: [], unlock: { rank: 1 }, work: 0,
    extra: { qualityAura: 6 }, desc: "", sprite: "art/buildings/garden.png" },

  { id: "redbridge", name: "紅線小橋", cat: "deco", size: [1, 2],
    cost: 1500, upkeep: 0, merit: 30, price: 0, quality: 0, appeal: 14, maxLv: 1,
    traits: { 緣分: 4 }, serves: [], unlock: { title: 1 }, work: 0,
    extra: { qualityAura: 4, crossRiver: true }, desc: "見習月老才能搭的小橋，可跨小支流。", sprite: "art/buildings/redbridge.png" },

  /* ───────────── 道路（草地也算路，道路只加一點點魅力） ───────────── */
  { id: "road-dirt",  name: "土路",     cat: "road", size: [1, 1], cost: 5,  upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 0, maxLv: 1,
    traits: {}, serves: [], unlock: { start: true }, work: 0, sprite: "art/tiles/ground.png#dirt" },
  { id: "road-stone", name: "石板路",   cat: "road", size: [1, 1], cost: 10, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 0, maxLv: 1,
    traits: { 秩序: 0.2 }, serves: [], unlock: { start: true }, work: 0, sprite: "art/tiles/ground.png#stone" },
  { id: "road-red",   name: "紅線步道", cat: "road", size: [1, 1], cost: 30, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 0.5, maxLv: 1,
    traits: { 緣分: 0.3 }, serves: [], unlock: { title: 1 }, work: 0, sprite: "art/tiles/ground.png#redline" }
];

/* 緣分組合：need 裡的建築彼此距離（佔地外框之間的切比雪夫距離）都 ≤ range 就成立。
   range ＝兩間中間最多隔幾格（前後左右、斜角都算）；1 ＝貼著或隔一條路。效果套在組合內每一間：quality ×(1+qualityPct/100)、appeal +appeal，
   traits 是整個組合額外加一次的特徵點數。同一間可以屬於多個組合。 */
HQ.combos = [
  { id: "touqi",    name: "頭七套餐",   need: ["salon", "photo"],              range: 1,
    effect: { qualityPct: 25, appeal: 8, traits: { 思念: 6, 儀容: 6 } },
    desc: "先整理儀容，再去托夢見家人。" },
  { id: "dessert",  name: "飯後甜點",   need: ["yakiniku", "mengpo"],          range: 1,
    effect: { qualityPct: 20, appeal: 8, traits: { 美味: 8 } },
    desc: "吃完燒肉來一份孟婆甜點。" },
  { id: "redline",  name: "紅線大街",   need: ["tattoo", "temple", "flower"],  range: 3,
    effect: { qualityPct: 20, appeal: 10, traits: { 緣分: 15 }, wenyinPerWeek: 1 },
    desc: "紋身店、月老廟、花飾店一條街，每週文印 +1 組。" },
  { id: "artzone",  name: "藝術區",     need: ["gecko", "manga"],              range: 2,
    effect: { qualityPct: 20, appeal: 10, traits: { 藝術: 12 } },
    desc: "守宮廣場和語の漫畫，畫畫的人都聚在這。" },
  { id: "lastmeal", name: "最後一餐",   need: ["yakiniku", "naihe"],           range: 3,
    effect: { qualityPct: 10, appeal: 5, traits: { 安心: 6 }, macaronMeritPct: 30 },
    desc: "燒肉店靠近奈何橋，投胎送行功德 +30%。" },
  { id: "nightmkt", name: "愛神大夜市", need: ["nightstall", "fries", "festival"], range: 3,
    effect: { qualityPct: 15, appeal: 12, traits: { 娛樂: 10 } },
    desc: "夜市攤圍著祭典會場。" },
  { id: "dogtea",   name: "陪伴下午茶", need: ["dogpark", "teahouse"],         range: 1,
    effect: { qualityPct: 15, appeal: 5, traits: { 安心: 8 } },
    desc: "小樂想要的：有慰靈犬陪著喝茶。" },
  { id: "office",   name: "地府辦事處", need: ["cityhall", "clinic"],          range: 2,
    effect: { qualityPct: 10, appeal: 4, traits: { 秩序: 8 } },
    desc: "掛念心痛的手續，一次辦好。" }
];

/* extra 欄位說明（引擎實作用）
   arrivals / trainsPerWeekByLv 車站：每週列車班次（早晚兩班×7 天＝14）
   arrivalsPerTrain / perTwoLv  每班列車亡魂期望值加成（小數當機率）
   wenyin                       文印：meritPerSet、helpedPerSet；extraSetsAtLv＝店到這些等級各 +1 組/週；setsPerWeek＝分店固定組數
   macaron                      燒肉店的遺願馬卡龍：投胎送行功德與幫助人數
   dream                        托夢：街區付 meritCost 功德 → helped、anshin
   incense                      每月香火功德＝meritPerMonth + meritPerLv×(Lv-1)，3 月 ×qingmingMul
   workSite                     閒置街坊在此工作，每人每週功德
   training                     閒置街坊每週經驗
   comfortRadius / anshinMul    周圍格內安心度上升倍率
   qualityAura                  裝飾：周圍 1 格內店家品質 +N
   capacity / taxPerYear        住宅：住幾人、每人每年 4 月繳稅
   annualFestival               指定月份自動辦祭典
   sellsGear                    weapon / armor / accessory，裝備品質＝店的 quality(Lv)
   jobChange                    轉職窗口（沒有市役所不能轉職）
   rescueDiscount               掛念心悸救人功德折扣 */
