/* 三途川物語 — 職業、勳章、怪物數值（B 線）
   六項屬性（介面約定固定）：
     魂力＝HP、膽量＝攻擊、手藝＝攻擊次數（每 30 點多打 1 下）、定力＝防禦、靈力＝法術、福報＝寶箱／掉寶
   growth＝每升 1 級加的點數（小數累積，顯示取整數）。新魂 Lv1 基礎值見 HQ.baseStats。
   cost＝轉職花的功德；medals＝要的勳章（12 月年度評定頒）；req.lv＝目前職業要到幾級（DV2：Lv10 精通）。
   work：在店裡上班時的加成（qualityPct＝店品質 +%、pricePct＝售價 +%），guide＝每班列車亡魂期望值 +0.08×guide。
   guest: true＝外賓／援手（C 線 kind guest、helper），不佔街坊名額、不能轉職。 */
window.HQ = window.HQ || {};

HQ.attrs = ["魂力", "膽量", "手藝", "定力", "靈力", "福報"];
HQ.baseStats = { 魂力: 40, 膽量: 8, 手藝: 6, 定力: 5, 靈力: 4, 福報: 5 };
HQ.maxLv = 99;
// 升到下一級要的經驗：expToNext(lv) = round(12 × lv^1.45)
HQ.expCurve = { base: 12, pow: 1.45 };

HQ.jobs = [
  /* ── 起點 ── */
  { id: "newsoul", name: "新魂", line: "服務", tier: 0,
    growth: { 魂力: 7, 膽量: 1.6, 手藝: 0.8, 定力: 1.2, 靈力: 1.0, 福報: 1.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { qualityPct: 0 },
    effect: "剛下車的亡魂，什麼都還不會。" },

  /* ── 服務線：店裡上班 ── */
  { id: "clerk", name: "店員", line: "服務", tier: 1,
    growth: { 魂力: 7, 膽量: 1.4, 手藝: 1.2, 定力: 1.2, 靈力: 0.8, 福報: 1.4 },
    from: ["newsoul"], cost: 20, medals: 0, req: { lv: 5 }, work: { qualityPct: 10, pricePct: 5 },
    effect: "上班時店品質 +10%、售價 +5%。" },
  { id: "headclerk", name: "招牌店員", line: "服務", tier: 2,
    growth: { 魂力: 8, 膽量: 1.6, 手藝: 1.6, 定力: 1.4, 靈力: 1.0, 福報: 2.0 },
    from: ["clerk"], cost: 120, medals: 0, req: { lv: 10 }, work: { qualityPct: 20, pricePct: 10, appeal: 5 },
    effect: "上班時店品質 +20%、售價 +10%、魅力 +5。" },
  { id: "manager", name: "分店長", line: "服務", tier: 3,
    growth: { 魂力: 9, 膽量: 2.0, 手藝: 2.0, 定力: 1.8, 靈力: 1.2, 福報: 2.6 },
    from: ["headclerk"], cost: 300, medals: 1, req: { lv: 10 }, work: { qualityPct: 30, pricePct: 15, appeal: 10 },
    effect: "上班時店品質 +30%、售價 +15%；店的維持費 -20%。" },

  /* ── 引導線：引渡貓／慰靈犬 ── */
  { id: "cat", name: "引渡貓", line: "引導", tier: 1,
    growth: { 魂力: 6, 膽量: 1.6, 手藝: 2.2, 定力: 1.0, 靈力: 1.2, 福報: 1.6 },
    from: ["newsoul"], cost: 20, medals: 0, req: { lv: 5 }, work: { guide: 1 },
    effect: "在車站上班：每班列車亡魂期望值 +0.08（guide 1）。巡守敏捷，多打一下。" },
  { id: "seniorcat", name: "資深引渡貓", line: "引導", tier: 2,
    growth: { 魂力: 7, 膽量: 2.0, 手藝: 3.0, 定力: 1.2, 靈力: 1.4, 福報: 2.0 },
    from: ["cat"], cost: 120, medals: 0, req: { lv: 10 }, work: { guide: 2 },
    effect: "每班列車亡魂期望值 +0.16（guide 2）；新亡魂起始安心度 +10。" },
  { id: "dog", name: "慰靈犬", line: "引導", tier: 1,
    growth: { 魂力: 8, 膽量: 1.8, 手藝: 1.0, 定力: 1.8, 靈力: 1.0, 福報: 1.2 },
    from: ["newsoul"], cost: 20, medals: 0, req: { lv: 5 }, work: { anshinPct: 15 },
    effect: "在街上散步：附近亡魂安心度 +15%。巡守時嗅出怨靈（先制）。" },
  { id: "guidedog", name: "引路慰靈犬", line: "引導", tier: 2,
    growth: { 魂力: 10, 膽量: 2.2, 手藝: 1.2, 定力: 2.4, 靈力: 1.2, 福報: 1.6 },
    from: ["dog"], cost: 120, medals: 0, req: { lv: 10 }, work: { anshinPct: 30 },
    effect: "附近亡魂安心度 +30%；悲傷亡魂不會離開。" },

  /* ── 巡守線：刀鋸使 ── */
  { id: "sawtrainee", name: "刀鋸使見習", line: "巡守", tier: 1,
    growth: { 魂力: 9, 膽量: 2.6, 手藝: 1.0, 定力: 2.0, 靈力: 0.4, 福報: 0.8 },
    from: ["newsoul"], cost: 30, medals: 0, req: { lv: 5 },
    effect: "巡守主力入門。" },
  { id: "sawman", name: "刀鋸使", line: "巡守", tier: 2,
    growth: { 魂力: 11, 膽量: 3.4, 手藝: 1.4, 定力: 2.6, 靈力: 0.4, 福報: 1.0 },
    from: ["sawtrainee"], cost: 150, medals: 0, req: { lv: 10, expedition: { map: "daoju", times: 3 } },
    effect: "要在刀鋸地獄巡守 3 次。" },
  { id: "jailer", name: "刀鋸地獄獄卒", line: "巡守", tier: 3,
    growth: { 魂力: 13, 膽量: 4.2, 手藝: 1.8, 定力: 3.4, 靈力: 0.6, 福報: 1.0 },
    from: ["sawman"], cost: 400, medals: 1, req: { lv: 15 },
    effect: "辣雞的同行。對魔氣系敵人傷害 +30%。" },

  /* ── 技藝線：學一門手藝，到名店上班 ── */
  { id: "painter", name: "守宮畫師", line: "技藝", tier: 1,
    growth: { 魂力: 6, 膽量: 1.0, 手藝: 2.4, 定力: 1.0, 靈力: 1.6, 福報: 1.6 },
    from: ["newsoul"], cost: 20, medals: 0, req: { lv: 3 }, work: { qualityPct: 10, workSitePct: 50 },
    effect: "在守宮廣場畫畫功德 +50%。" },
  { id: "hairapp", name: "髮廊學徒", line: "技藝", tier: 1,
    growth: { 魂力: 6, 膽量: 1.2, 手藝: 2.6, 定力: 1.0, 靈力: 1.0, 福報: 1.4 },
    from: ["newsoul"], cost: 30, medals: 0, req: { lv: 5 }, work: { qualityPct: 15, onlyAt: ["salon"] },
    effect: "碧落髮廊上班品質 +15%。" },
  { id: "photoapp", name: "攝影助手", line: "技藝", tier: 1,
    growth: { 魂力: 7, 膽量: 1.4, 手藝: 2.2, 定力: 1.2, 靈力: 1.2, 福報: 1.4 },
    from: ["newsoul"], cost: 30, medals: 0, req: { lv: 5 }, work: { qualityPct: 15, onlyAt: ["photo"] },
    effect: "托夢照相館上班品質 +15%。" },
  { id: "tattooapp", name: "紋身學徒", line: "技藝", tier: 2,
    growth: { 魂力: 7, 膽量: 1.4, 手藝: 3.2, 定力: 1.2, 靈力: 1.8, 福報: 1.6 },
    from: ["painter", "hairapp"], cost: 150, medals: 0, req: { lv: 10 }, work: { qualityPct: 20, onlyAt: ["tattoo", "tattoo2"], wenyin: 1 },
    effect: "只有對紋身有強烈執念的人能在紋身店工作：每週文印 +1 組。" },

  /* ── 術法線 ── */
  { id: "shikigami", name: "式神見習", line: "術法", tier: 1,
    growth: { 魂力: 6, 膽量: 0.8, 手藝: 1.2, 定力: 1.0, 靈力: 3.0, 福報: 1.2 },
    from: ["newsoul"], cost: 30, medals: 0, req: { lv: 5 },
    effect: "市役所的微笑式神。巡守會放法術。" },
  { id: "barrierapp", name: "結界師學徒", line: "術法", tier: 2,
    growth: { 魂力: 7, 膽量: 1.0, 手藝: 1.4, 定力: 2.0, 靈力: 3.8, 福報: 1.2 },
    from: ["shikigami"], cost: 150, medals: 0, req: { lv: 10 }, work: { mokiPct: -20 },
    effect: "街區魔氣 -20%。保衛戰時全隊防禦 +10%。" },
  { id: "mediapp", name: "醫徒", line: "術法", tier: 2,
    growth: { 魂力: 7, 膽量: 0.8, 手藝: 1.4, 定力: 1.4, 靈力: 3.6, 福報: 2.0 },
    from: ["shikigami", "dog"], cost: 150, medals: 0, req: { lv: 10 }, work: { qualityPct: 20, onlyAt: ["clinic"] },
    effect: "巡守時每 3 回合補血；華佗醫館上班品質 +20%。" },
  { id: "onmyo", name: "陰陽官", line: "術法", tier: 3,
    growth: { 魂力: 8, 膽量: 1.2, 手藝: 1.8, 定力: 2.4, 靈力: 5.0, 福報: 1.6 },
    from: ["barrierapp", "mediapp"], cost: 400, medals: 1, req: { lv: 15 },
    effect: "全體法術。" },

  /* ── 特殊：主要角色專屬（入住時直接就是這個職業，不能轉出） ── */
  { id: "yuelao-intern", name: "實習月老", line: "特殊", tier: 9, chars: ["yutong"],
    growth: { 魂力: 8, 膽量: 1.8, 手藝: 2.4, 定力: 1.6, 靈力: 3.2, 福報: 3.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["tattoo"], qualityPct: 20 },
    skill: { id: "redline", name: "紅線束縛", desc: "敵人一回合不能動" },
    effect: "文印、結緣。位階升見習／月老時自動改名、成長提升（HQ.titles）。" },
  { id: "yuelao", name: "月下老人", line: "特殊", tier: 9, chars: ["yuelao"],
    growth: { 魂力: 10, 膽量: 2.6, 手藝: 3.0, 定力: 2.4, 靈力: 4.6, 福報: 4.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["tattoo", "temple"], qualityPct: 30, wenyin: 1 },
    skill: { id: "fate", name: "定婚簿", desc: "全隊福報 ×2（寶箱）" },
    effect: "常常躲去髮廊偷吃零食（事件）。" },
  { id: "yakiniku-master", name: "燒肉店店長", line: "特殊", tier: 9, chars: ["lee"],
    growth: { 魂力: 18, 膽量: 6.0, 手藝: 2.4, 定力: 4.0, 靈力: 3.0, 福報: 2.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["yakiniku"], qualityPct: 40, pricePct: 20 },
    skill: { id: "gouka", name: "業火斬擊", desc: "單體巨大傷害；危急時才出手" },
    effect: "業鏡羅漢。出征時街上燒肉店品質 -40%。" },
  { id: "acting-master", name: "代理店長", line: "特殊", tier: 9, chars: ["xiaoyu"],
    growth: { 魂力: 9, 膽量: 1.6, 手藝: 2.6, 定力: 1.8, 靈力: 1.6, 福報: 2.6 },
    from: [], cost: 0, medals: 0, req: {}, work: { qualityPct: 25, pricePct: 10 },
    skill: { id: "supply", name: "補給", desc: "戰後全隊回復 30%" },
    effect: "任何飲食店都能顧。" },
  { id: "photographer", name: "攝影師", line: "特殊", tier: 9, chars: ["dabao"],
    growth: { 魂力: 14, 膽量: 2.8, 手藝: 1.6, 定力: 4.2, 靈力: 1.2, 福報: 1.6 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["photo"], qualityPct: 35 },
    skill: { id: "waterwall", name: "水牆防護", desc: "消防救援：全隊一回合免傷（坦）" },
    effect: "大寶。托夢照相館。" },
  { id: "barber", name: "理髮師", line: "特殊", tier: 9, chars: ["baimei"],
    growth: { 魂力: 8, 膽量: 2.0, 手藝: 3.4, 定力: 1.6, 靈力: 1.6, 福報: 2.4 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["salon"], qualityPct: 35 },
    effect: "白妹。碧落髮廊。" },
  { id: "tattooist", name: "紋身師", line: "特殊", tier: 9, chars: ["du"],
    growth: { 魂力: 9, 膽量: 2.6, 手藝: 3.6, 定力: 1.8, 靈力: 2.0, 福報: 1.6 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["tattoo", "tattoo2"], qualityPct: 30, wenyin: 1 },
    effect: "杜先生。文印很累，連做 3 天以上可能掛念心痛。" },
  { id: "parttimer", name: "萬能打工王", line: "特殊", tier: 9, chars: ["huji"],
    growth: { 魂力: 9, 膽量: 2.8, 手藝: 3.0, 定力: 1.6, 靈力: 3.0, 福報: 3.2 },
    from: [], cost: 0, medals: 0, req: {}, work: { qualityPct: 25, pricePct: 10 },
    skill: { id: "kitsunebi", name: "狐火", desc: "全體火傷害" },
    effect: "狐姬。任何店都能補位。「得加錢」：出征旅費 +20%。" },
  { id: "barrier-master", name: "結界師", line: "特殊", tier: 9, chars: ["jiuwei"],
    growth: { 魂力: 11, 膽量: 2.4, 手藝: 1.6, 定力: 3.6, 靈力: 4.4, 福報: 1.8 },
    from: [], cost: 0, medals: 0, req: {}, work: { mokiPct: -40 },
    skill: { id: "kekkai", name: "結界", desc: "全隊防禦 +50%（3 回合）" },
    effect: "九尾。街區魔氣 -40%。" },
  { id: "saw-master", name: "刀鋸使領班", line: "特殊", tier: 9, chars: ["paofu"],
    growth: { 魂力: 14, 膽量: 4.6, 手藝: 2.2, 定力: 3.0, 靈力: 0.8, 福報: 1.2 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["sawhall"] },
    skill: { id: "saw", name: "刀鋸", desc: "連斬 3 下" },
    effect: "巡守主力。" },
  { id: "clerk-city", name: "市役所職員", line: "特殊", tier: 9, chars: ["xiaomi", "lvyi"],
    growth: { 魂力: 8, 膽量: 1.4, 手藝: 2.0, 定力: 1.8, 靈力: 3.0, 福報: 2.4 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["cityhall"], qualityPct: 30, jobChangeDiscount: 0.2 },
    skill: { id: "smile", name: "微笑式神", desc: "敵人攻擊 -20%" },
    effect: "小米、綠衣女子。轉職功德 -20%（兩人都在 -30%）。" },
  { id: "doctor", name: "醫神", line: "特殊", tier: 9, chars: ["huatuo"],
    growth: { 魂力: 10, 膽量: 1.6, 手藝: 2.4, 定力: 2.0, 靈力: 4.4, 福報: 2.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["clinic"], qualityPct: 35 },
    skill: { id: "heal", name: "治療", desc: "全隊回復 40%" },
    effect: "華佗。除咒。" },
  { id: "pastry", name: "甜點師", line: "特殊", tier: 9, chars: ["yangzi"],
    growth: { 魂力: 8, 膽量: 1.4, 手藝: 3.0, 定力: 1.6, 靈力: 2.2, 福報: 2.4 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["mengpo"], qualityPct: 35 },
    effect: "孟婆。孟婆甜食屋品質 +35%；甜點心願的安心度再 ×1.2。" },
  { id: "dessert-clerk", name: "甜點店員", line: "特殊", tier: 9, chars: ["no7"],
    growth: { 魂力: 8, 膽量: 1.6, 手藝: 2.8, 定力: 1.6, 靈力: 2.0, 福報: 2.2 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["mengpo"], qualityPct: 30 },
    effect: "七號。推薦最適合的甜點（孟婆甜食屋的 recommend 效果要她在班才有）。" },
  { id: "gecko-spirit", name: "守宮精靈", line: "特殊", tier: 9, chars: ["mi"],
    growth: { 魂力: 6, 膽量: 1.2, 手藝: 2.4, 定力: 1.2, 靈力: 2.6, 福報: 3.0 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["gecko"], workSitePct: 100 },
    effect: "謎。守宮廣場的畫畫功德 ×2。" },
  { id: "painter-nova", name: "見習畫家", line: "特殊", tier: 9, chars: ["nova"],
    growth: { 魂力: 12, 膽量: 3.0, 手藝: 2.4, 定力: 3.0, 靈力: 2.4, 福報: 1.8 },
    from: [], cost: 0, medals: 0, req: {}, work: { onlyAt: ["manga", "gecko"], qualityPct: 30 },
    effect: "諾瓦（獨角鯨族）。在語の漫畫學畫，藝術特徵 +10。" },
  /* ── 外賓與援手（kind guest／helper，不佔街坊名額；出征或保衛戰時當援軍） ── */
  { id: "g-leviathan", name: "嫉妒魔王", line: "特殊", tier: 9, guest: true, chars: ["leviathan"],
    growth: { 魂力: 20, 膽量: 5.0, 手藝: 1.6, 定力: 4.4, 靈力: 4.0, 福報: 1.0 }, from: [], cost: 0, medals: 0, req: {},
    skill: { id: "tide", name: "大海嘯", desc: "全體水傷害" }, effect: "利維坦。打倒（誤會戰）後可邀來當援軍。" },
  { id: "g-rat", name: "第二王國總參謀", line: "特殊", tier: 9, guest: true, chars: ["rat"],
    growth: { 魂力: 8, 膽量: 1.4, 手藝: 2.4, 定力: 1.6, 靈力: 4.2, 福報: 3.0 }, from: [], cost: 0, medals: 0, req: {},
    skill: { id: "plan", name: "軍師之計", desc: "全隊攻擊 +30%（3 回合）" }, effect: "鼠軍師。" },
  { id: "g-qianliyan", name: "千里眼將軍", line: "特殊", tier: 9, guest: true, chars: ["qianliyan"],
    growth: { 魂力: 12, 膽量: 3.6, 手藝: 3.0, 定力: 2.6, 靈力: 2.4, 福報: 2.0 }, from: [], cost: 0, medals: 0, req: {},
    skill: { id: "farsight", name: "千里眼", desc: "保衛戰每場一次：下一波敵人全部顯形、傷害 +50%" }, effect: "EP4-16 援軍。" },
  { id: "g-lovegod", name: "外國愛神", line: "特殊", tier: 9, guest: true, chars: ["hathor", "aphrodite", "aizen", "shencha"],
    growth: { 魂力: 9, 膽量: 2.0, 手藝: 2.0, 定力: 2.0, 靈力: 3.6, 福報: 3.0 }, from: [], cost: 0, medals: 0, req: {},
    effect: "愛神祭的外賓（埃及死神／埃及愛神／希臘愛神／日本愛神共用這組數值）。8 月在街上時，緣分 +20。" },
  { id: "h-dulao", name: "黑龍堂老大", line: "特殊", tier: 9, guest: true, chars: ["dulao"],
    growth: { 魂力: 14, 膽量: 4.0, 手藝: 2.0, 定力: 3.0, 靈力: 1.0, 福報: 1.6 }, from: [], cost: 0, medals: 0, req: {},
    effect: "庚寅地球・高熊市的援手。" },
  { id: "h-guangtou", name: "黑龍堂第一打手", line: "特殊", tier: 9, guest: true, chars: ["guangtou"],
    growth: { 魂力: 16, 膽量: 3.6, 手藝: 1.6, 定力: 3.4, 靈力: 0.6, 福報: 1.0 }, from: [], cost: 0, medals: 0, req: {},
    effect: "高熊市的援手（坦）。" },
  { id: "h-medium", name: "靈媒", line: "特殊", tier: 9, guest: true, chars: ["tiedan"],
    growth: { 魂力: 8, 膽量: 1.2, 手藝: 1.6, 定力: 1.6, 靈力: 4.0, 福報: 2.6 }, from: [], cost: 0, medals: 0, req: {},
    effect: "鐵蛋。陽間那頭的援手，看得見亡魂。" },
  { id: "h-gengyin", name: "月老爺爺", line: "特殊", tier: 9, guest: true, chars: ["gengyin"],
    growth: { 魂力: 10, 膽量: 2.0, 手藝: 2.6, 定力: 2.4, 靈力: 4.6, 福報: 3.6 }, from: [], cost: 0, medals: 0, req: {},
    effect: "庚寅月老。" }
];

// 勳章：12 月年度評定頒（DV2 是 12 月第 4 週）
HQ.medals = {
  annual: [ // 年度評定分數（HQ.review）到門檻各頒 1 枚
    { score: 400, medals: 1 }, { score: 900, medals: 1 }, { score: 1600, medals: 1 }
  ],
  bossFirstKill: 1,     // 每隻地圖王第一次打倒 +1
  titleUp: 1            // 位階升級 +1
};

/* ───────────── 怪物與敵人 ─────────────
   數值依敵人等級 L 產生：一般敵人 hp=20+10L+0.25L²、atk=4+2.3L+0.035L²、def=2+1.6L+0.02L²、mag=2+2L、spd=6+0.8L；
   王 hp×5、atk×1.25、def×1.15（balance/combat.js 檢查過：推薦等級 4 人隊伍打得過、低 3 級打不過王）。exp=4+2.2L（王 ×10）、merit＝擊殺功德、gold＝冥紙。
   kind：ghost 怨靈 / moki 魔氣 / beast 蠱獸 / human 人 / demon 魔族 / god 古神。
   外圍怪物 zone 1～4：越外圍（越靠三途川上游）越強，推薦等級 = lv × zoneMul。 */
(function () {
  function mk(id, name, kind, L, opt) {
    opt = opt || {};
    var boss = !!opt.boss;
    var e = {
      id: id, name: name, kind: kind, lv: L, boss: boss,
      hp: Math.round((20 + 10 * L + 0.25 * L * L) * (boss ? 5 : 1) * (opt.hpMul || 1)),
      atk: Math.round((4 + 2.3 * L + 0.035 * L * L) * (boss ? 1.25 : 1) * (opt.atkMul || 1)),
      def: Math.round((2 + 1.6 * L + 0.02 * L * L) * (boss ? 1.15 : 1) * (opt.defMul || 1)),
      mag: Math.round((2 + 2 * L) * (opt.magMul || 1)),
      spd: Math.round(6 + 0.8 * L),
      exp: Math.round((4 + 2.2 * L) * (boss ? 10 : 1)),
      merit: opt.merit != null ? opt.merit : (boss ? 50 + 5 * L : Math.max(1, Math.round(L / 4))),
      gold: Math.round((6 + 4 * L) * (boss ? 10 : 1)),
      drop: opt.drop || null
    };
    if (opt.note) e.note = opt.note;
    if (opt.become) e.become = opt.become;
    return e;
  }

  HQ.zoneMul = [1, 1.6, 2.4, 3.4];   // 外圍 zone 1～4 的等級倍率
  HQ.mobs = [
    mk("mob-lost",   "迷途魂",     "ghost", 2, { atkMul: 0.7, merit: 1, become: "soul", note: "打贏會變成新客人（下一班列車 +1 位）" }),
    mk("mob-ghost",  "抓交替冤魂", "ghost", 4, { magMul: 1.3, merit: 2, note: "7 月中元數量 ×3、會上岸" }),
    mk("mob-miasma", "魔氣團",     "moki",  5, { defMul: 0.6, magMul: 1.5, merit: 2, note: "街區魔氣越高越多；巡守線傷害 +30%" }),
    mk("mob-lizard", "蜥蜴蠱",     "beast", 6, { atkMul: 1.2, merit: 2, drop: "蠱鱗" })
  ];

  // 出征地圖敵人（id 給 C 線 data/maps.js 引用）。recLv＝推薦隊伍平均等級。
  HQ.enemies = [
    // 刀鋸地獄（開局）
    mk("en-sawghost",  "刀鋸亡者",   "ghost", 5),
    mk("en-sinner",    "受刑罪魂",   "ghost", 7, { hpMul: 1.3 }),
    mk("boss-laji",    "辣雞",       "human", 9, { boss: true, note: "刀鋸地獄的審判" }),
    // 庚寅地球・高熊市（開局）
    mk("en-baizhu",    "白蛛會幫眾", "human", 8),
    mk("en-shushi",    "術士",       "human", 9, { magMul: 1.6, defMul: 0.7 }),
    mk("en-gu",        "蜥蜴蠱",     "beast", 9, { atkMul: 1.2 }),
    mk("boss-bailaoda","白老大",     "human", 12, { boss: true }),
    // 心堀江（☆1）
    mk("en-raincoat",  "黃雨衣",     "ghost", 13, { magMul: 1.3 }),
    mk("boss-hasshaku","八尺大人",   "ghost", 17, { boss: true, hpMul: 1.1 }),
    // 陽間海邊（7 月）
    mk("en-drowned",   "抓交替冤魂", "ghost", 12, { magMul: 1.3 }),
    mk("boss-tide",    "海邊冤魂王", "ghost", 14, { boss: true, note: "劇中沒有這個角色，只當抓交替冤魂群的頭目，不講話" }),
    // 古神遺跡（☆2）
    mk("en-relic",     "遺跡守衛",   "god",   19, { defMul: 1.4 }),
    mk("boss-eye",     "古神之眼",   "god",   25, { boss: true, magMul: 1.5, hpMul: 1.3 }),
    // 魔界第二王國（☆3）
    mk("en-narwhal",   "惡魔士兵",   "demon", 26, { note: "id 沿用舊名；獨角鯨族劇中只剩諾瓦，這裡是第二王國的惡魔士兵（EP4-07）" }),
    mk("en-hamster",   "倉鼠小兵",   "demon", 24, { hpMul: 0.8, atkMul: 0.9, note: "EP4-13" }),
    mk("en-rat",       "鼠軍師",     "demon", 28, { magMul: 1.5, hpMul: 1.5, note: "打倒後可當外賓夥伴" }),
    mk("boss-leviathan","利維坦",    "demon", 32, { boss: true, hpMul: 1.2, note: "誤會戰：打到 30% 就結束" }),
    // 魔界第三王國（☆4）
    mk("en-skeleton",  "骷髏兵",     "demon", 34),
    mk("en-bat",       "蝙蝠惡魔",   "demon", 36, { atkMul: 1.1, defMul: 0.8 }),
    mk("en-reaper",    "第三王國惡魔", "demon", 36, { atkMul: 1.15, magMul: 1.2, note: "撒旦座下第五軍團百夫長（EP4-10/11），保衛戰第 2 波" }),
    mk("en-gu-teacher","辜老師",     "human", 39, { magMul: 1.6, hpMul: 2 }),
    mk("boss-plague",  "瘟疫",       "demon", 42, { boss: true, magMul: 1.4, hpMul: 1.4, atkMul: 1.1 }),
    mk("boss-satan",   "撒旦",       "demon", 46, { boss: true, hpMul: 1.6, atkMul: 1.2 }),
    // 北境（☆5，隱藏）
    mk("en-north",     "北境冰魂",   "ghost", 50),
    mk("boss-evilgod", "邪神帝",     "god",   60, { boss: true, hpMul: 1.7, atkMul: 1.15 })
  ];

  // 地圖推薦等級（C 線 maps.js 可直接引用 HQ.mapLevels[mapId]）
  HQ.mapLevels = { daoju: 8, gengyin: 11, xinkujiang: 16, seaside: 14, relic: 22, demon2: 30, demon3: 42, north: 58 };
  // 出征旅費（冥紙／人），資金低於 HQ.balance.expeditionMinGold 不能出征
  HQ.travelCost = { daoju: 100, gengyin: 150, xinkujiang: 250, seaside: 200, relic: 400, demon2: 600, demon3: 900, north: 1200 };
  // 北境船票：劇中一人 30 功德（EP 大寶／阿副篇）
  HQ.travelMerit = { north: 30 };
})();

/* 戰鬥公式（引擎參考）
   物理一擊 = max(1, 膽量×亂數(0.9～1.1) − 定力/2)；每回合打 1 + floor(手藝/30) 下
   法術 = 靈力×1.3 − 定力/4（靈力 > 膽量 的職業每 2 回合放一次，打全體 ×0.6）
   福報：寶箱機率 = 10% + 福報/5 %（上限 60%）
   敵人 spd 只決定先後手。 */
