/* 三途川物語 — 街區評價、位階、觀音評定、經濟常數（B 線）
   時間單位跟引擎一致：1 個月 4 週，1 年 12 個月（DV2）。
   這裡的公式就是 balance/sim.js 用的模型；引擎照這份實作，模擬結果才準。 */
window.HQ = window.HQ || {};

/* 街區評價 ☆1～5（DV2 草原地圖：人氣 300／1000／2200／3500／6000 ＋其他條件）
   每季觀音評定時檢查，條件全部達成升 1 星（一次最多升 1 星）。
   monthlyIncome＝上個月冥紙營業額（不扣維持費）；buildings＝店＋特殊建築數（不含道路、裝飾、住宅）；
   homes＝住宅棟數；residents＝街坊人數（含主要角色）；helped＝累計幫助人數；bosses＝打倒過的地圖王數。
   reward：升星當下給的東西；unlocks 只是方便顯示，真正的解鎖寫在各建築的 unlock。 */
HQ.ranks = [
  { star: 1, popularity: 300,  buildings: 6,  residents: 3,  helped: 25,   monthlyIncome: 2000,
    reward: { merit: 50, money: 1000 }, expand: 1, unlocks: ["mala", "nightstall", "garden", "fun"],
    desc: "河岸開始有人氣了。開放第一次擴地、心堀江。" },
  { star: 2, popularity: 1000, buildings: 14, residents: 7,  helped: 250,  homes: 3,
    reward: { merit: 100, money: 3000 }, unlocks: ["festival", "tower", "sushi"],
    desc: "開放古神遺跡、語の漫畫、愛神祭會場。" },
  { star: 3, popularity: 2200, buildings: 22, residents: 12, helped: 900,  monthlyIncome: 10000, bosses: 3,
    reward: { merit: 200, money: 6000 }, expand: 2,
    desc: "開放魔界第二王國、葬壽司；第三王國可能入侵。" },
  { star: 4, popularity: 3500, buildings: 30, residents: 18, helped: 2200, homes: 8,  bosses: 5,
    reward: { merit: 300, money: 10000 }, expand: 3,
    desc: "開放魔界第三王國。" },
  { star: 5, popularity: 6000, buildings: 38, residents: 26, helped: 4000, monthlyIncome: 30000, bosses: 6,
    reward: { merit: 500, money: 20000, medals: 2 },
    desc: "彼岸街。北境的船票寄來了。" }
];

/* 位階：每年 12 月觀音年度評定看累計幫助人數，一次最多升一階。
   wenyinPerWeek＝語彤每週能做的文印組數（企劃書「一天 3 組」換算成週的節奏）。 */
HQ.titles = [
  { name: "實習月老", helped: 0,   wenyinPerWeek: 1, growthMul: 1.0 },
  { name: "見習月老", helped: 120, wenyinPerWeek: 2, growthMul: 1.2, reward: { merit: 100, medals: 1 } },
  { name: "月老",     helped: 3000, wenyinPerWeek: 3, growthMul: 1.4, reward: { merit: 300, medals: 1 } }
];
HQ.titleReq = HQ.titles.map(function (t) { return { helped: t.helped }; });

/* 觀音評定：3、6、9、12 月最後一週。只看「這一季做了什麼」，不看累積值，避免後期分數爆掉。
   score = 本季人氣增加×0.15 + 街坊×3 + 本季送行投胎×0.5 + 本季文印組×5 + 本季托夢×2 + 本季完成委託×15
         + 特徵總點數（不含魔氣）×0.02 + 本季打倒王×30 + 本季救人×10 − 本季不滿離開×0.2
   target（及格分）= targetByStar[目前☆]；12 月 target ×1.3、獎勵 ×2。一般玩家落在 B～A，用心經營才拿 S。
   等第看 score/target。功德獎勵 = round(score × 0.2) + gradeBonus。
   D：觀音指派任務（task），完成給三倍功德（EP4-04），沒完成下季 target 不變。 */
HQ.review = {
  months: [3, 6, 9, 12],
  weights: { popGain: 0.15, residents: 3, sendoffs: 0.5, wenyin: 5, dreams: 2, requests: 15, traitSum: 0.02, bosses: 30, rescues: 10, leftUnhappy: -0.2 },
  target: { byStar: [45, 110, 240, 380, 520, 680], decemberMul: 1.3 },
  grades: [
    { grade: "S", ratio: 2.0, bonus: 150, popularity: 40, line: "做得很好。這條街，亡魂願意停下來了。" },
    { grade: "A", ratio: 1.4, bonus: 80,  popularity: 20, line: "不錯。繼續保持。" },
    { grade: "B", ratio: 1.0, bonus: 40,  popularity: 10, line: "還可以，但還有很多人在等。" },
    { grade: "C", ratio: 0.6, bonus: 10,  popularity: 0,  line: "再加把勁吧，小月老。" },
    { grade: "D", ratio: -1e9, bonus: 0,  popularity: -20, task: true, line: "這一季……我替你安排一件事。完成了，功德三倍。" }
  ],
  meritPerScore: 0.2,
  decemberRewardMul: 2,
  taskMeritMul: 3,
  taskBaseMerit: 40
};

/* 主動活動（DV2 花街P辦活動：清掃 20P 人氣+5、祭典 150P 人氣+30）。每季最多 7 次（市役所升級可減費）。 */
HQ.activities = [
  { id: "clean",    name: "河岸清掃",     merit: 20,  popularity: 5,  traits: { 秩序: 2 } },
  { id: "lantern",  name: "放水燈",       merit: 40,  popularity: 12, traits: { 思念: 3 } },
  { id: "market",   name: "愛神大夜市",   merit: 80,  popularity: 22, need: { rank: 1 }, traits: { 娛樂: 4 } },
  { id: "selection",name: "愛神祭選拔",   merit: 150, popularity: 40, need: { building: "festival" }, traits: { 緣分: 5, 娛樂: 5 } },
  { id: "offering", name: "陽間供品大放送", merit: 60, money: 1500, popularity: 0, need: { building: "temple" } },
  { id: "expand1",  name: "街區擴張 1",   merit: 90,  popularity: 0, need: { rank: 1 }, expand: 1, once: true },
  { id: "expand2",  name: "街區擴張 2",   merit: 150, popularity: 0, need: { rank: 3 }, expand: 2, once: true },
  { id: "expand3",  name: "街區擴張 3",   merit: 250, popularity: 0, need: { rank: 4 }, expand: 3, once: true }
];
HQ.activityPerQuarter = 7;

/* 劇中的功德行情（原作數字，給委託／事件／引擎共用）
   托夢 10（一般行情；三倍時間 30＝一般人存一年）、救一命 100（掛念心悸）、
   愛戀文印 300／組（客人付），紋身師一組賺 30、北境船票一人 30、大寶入祀忠烈祠 120。 */
HQ.meritPrices = {
  dream: 10, dreamTriple: 30, rescue: 100, wenyinPrice: 300, wenyinArtistCut: 30,
  northTicket: 30, shrineGift: 120, yearSavings: 30
};

/* 經濟與節奏常數（引擎可用來覆蓋 CFG 的同名值；sim.js 全部照這份算） */
HQ.balance = {
  weeksPerMonth: 4,
  startMoney: 4000,
  startMerit: 50,
  startHousing: 2,

  // 來客：每班列車亡魂數期望值 = soulsBase + 人氣 / soulsPerPop + 加成（候車亭 +0.15、每隻王牌引渡貓 +0.08、引渡貓職業 guide×0.08），小數部分當機率
  trainsPerWeek: 14,
  soulsBase: 0.2,
  soulsPerPop: 1600,
  soulsCapPerTrain: 6,
  soulCap: 40,

  // 亡魂：錢包 = walletBase + 人氣 × walletPerPop，±30% 亂數；心願 1～3 個（權重 wishCount）
  walletBase: 70,
  walletPerPop: 0.06,
  wishCount: [0.35, 0.45, 0.2],
  visitsMax: 5,
  startPeace: 15,
  peaceWish: 27,          // 滿足一個心願 + peaceWish × 品質係數
  peaceOther: 6,          // 逛其他店 + peaceOther × 品質係數
  qualityRef: 25,         // 品質係數 = clamp(品質(Lv) / qualityRef, qfMin, qfMax)
  qfMin: 0.5, qfMax: 1.4,
  // 離開前判定：心願全部滿足，且 亂數(0～100) < 安心度 → 「安心了」，可送行或邀請留下；否則帶著遺憾離開
  peaceFull: 100,
  stayChance: 0.3,        // 安心了的亡魂想留下的機率（有空房、且一般街坊數 < genericCapByStar[☆] 才留得下）
  genericCapByStar: [4, 8, 14, 20, 28, 36],

  // 功德
  sendoffMerit: 1,        // 送行投胎（奈何橋）；有燒肉店的遺願馬卡龍 ×macaronMul
  macaronMul: 2,
  patrolMeritPerWeek: 1,  // 每位閒置街坊在外圍巡守每週功德（期望）
  patrolGoldPerWeek: 30,

  // 人氣（只累積不衰退；建築另外給靜態魅力分）
  popPerVisit: 0.06,      // 每次光顧 × 品質係數
  popPerHelp: 0.4,        // 每幫助 1 人
  popPerUnhappy: -0.3,    // 心願沒滿足就離開
  popFromAppeal: 0.5,     // 人氣 = 累積人氣 + Σ建築魅力(Lv) × popFromAppeal

  // 等級成長（店與飲食最高 Lv10，價格約 3 倍）
  lv: {
    price: 0.22,          // price(Lv) = price × (1 + 0.22×(Lv−1))
    quality: 0.12,
    appeal: 0.08,
    upkeep: 0.15,
    upgradeCost: 0.5,     // Lv → Lv+1 花 cost × 0.5 × Lv（若建築有 upgradeCost 陣列以陣列為準）
    upgradeMerit: 15,     // 劇中名店（cat special）升級另花 功德 15 × Lv
    traits: 0.1           // 特徵點數 × (1 + 0.1×(Lv−1))
  },
  unstaffedQualityMul: 0.7,
  taxMonth: 4,
  upkeepWhen: "monthEnd",
  expeditionMinGold: 2000,
  expeditionIncomeMul: 0.6,   // 出征期間（2 週）街上營收倍率
  moki: { perPop: 0.02, burstRatio: 0.5, burstChance: 0.25 } // 魔氣 = 人氣×0.02 + Σ魔氣特徵；> (秩序+安心)×0.5 時每月 25% 暴走
};
