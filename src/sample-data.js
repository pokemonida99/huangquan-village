// 內建範例資料：data/*.js 還沒到的時候用這份頂著，格式照 docs/介面約定.md。
// 掛在 HQ_SAMPLE，不碰 window.HQ；src/data.js 會逐項補上缺的欄位。
window.HQ_SAMPLE = {
  traits: ["美味", "思念", "緣分", "儀容", "藝術", "娛樂", "安心", "香火", "秩序", "魔氣"],

  wishes: [
    { id: "eat", name: "想吃東西", icon: "🍖" },
    { id: "sweets", name: "想吃甜點", icon: "🍡" },
    { id: "dream", name: "想托夢", icon: "📷" },
    { id: "hair", name: "想整理儀容", icon: "✂️" },
    { id: "tattoo", name: "想求文印", icon: "❤️" },
    { id: "rest", name: "想休息", icon: "💤" },
    { id: "shop", name: "想買東西", icon: "🏮" },
    { id: "art", name: "想畫畫", icon: "🎨" },
    { id: "reincarnate", name: "想投胎", icon: "🌸" }
  ],

  buildings: [
    { id: "road", name: "石板路", cat: "road", size: [1, 1], cost: 10, upkeep: 0, price: 0, quality: 0, appeal: 0, maxLv: 1, traits: {}, serves: [], unlock: { start: true } },
    { id: "inn", name: "亡魂客棧", cat: "home", size: [2, 2], cost: 600, upkeep: 50, price: 30, quality: 8, appeal: 8, maxLv: 10, traits: { 安心: 3 }, serves: ["rest"], unlock: { start: true } },
    { id: "teahouse", name: "茶館", cat: "food", size: [2, 1], cost: 500, upkeep: 30, price: 20, quality: 6, appeal: 8, maxLv: 10, traits: { 美味: 2, 安心: 1 }, serves: ["eat"], unlock: { start: true } },
    { id: "flower", name: "彼岸花飾店", cat: "shop", size: [1, 1], cost: 400, upkeep: 20, price: 25, quality: 5, appeal: 10, maxLv: 10, traits: { 緣分: 2, 藝術: 1 }, serves: ["shop"], unlock: { start: true } },
    { id: "paper", name: "紙紮舖", cat: "shop", size: [2, 1], cost: 800, upkeep: 60, price: 45, quality: 8, appeal: 6, maxLv: 10, traits: { 思念: 2, 香火: 1 }, serves: ["shop"], unlock: { start: true } },
    { id: "incense", name: "香舖", cat: "shop", size: [1, 1], cost: 600, upkeep: 30, price: 30, quality: 6, appeal: 6, maxLv: 10, traits: { 香火: 3, 思念: 1 }, serves: ["shop"], unlock: { start: true } },
    { id: "ossuary", name: "靈骨塔公寓", cat: "home", size: [1, 2], cost: 1000, upkeep: 50, price: 0, quality: 0, appeal: 2, maxLv: 5, traits: { 安心: 1 }, serves: [], housing: 2, unlock: { start: true } },
    { id: "lantern", name: "燈籠路燈", cat: "deco", size: [1, 1], cost: 150, upkeep: 0, price: 0, quality: 0, appeal: 3, maxLv: 1, traits: { 安心: 1 }, serves: [], unlock: { start: true } },
    { id: "bench", name: "河邊躺椅", cat: "deco", size: [1, 1], cost: 200, upkeep: 0, price: 0, quality: 2, appeal: 4, maxLv: 1, traits: { 娛樂: 1 }, serves: ["rest"], unlock: { start: true } },
    { id: "garden", name: "彼岸花圃", cat: "deco", size: [2, 2], cost: 900, upkeep: 0, price: 0, quality: 0, appeal: 8, maxLv: 1, traits: { 思念: 2, 藝術: 2 }, serves: [], unlock: { rank: 1 } },
    { id: "plaza", name: "守宮廣場", cat: "special", size: [3, 2], cost: 1500, upkeep: 40, merit: 50, price: 15, quality: 10, appeal: 12, maxLv: 10, traits: { 藝術: 5, 娛樂: 2 }, serves: ["art"], unique: true, unlock: { rank: 1 } },
    { id: "tattoo", name: "月老紋身店", cat: "special", size: [2, 2], cost: 1000, upkeep: 40, price: 50, quality: 14, appeal: 14, maxLv: 10, traits: { 緣分: 6, 藝術: 2 }, serves: ["tattoo"], unique: true, unlock: { resident: "yuelao" } },
    { id: "yakiniku", name: "黃泉燒肉店", cat: "special", size: [2, 2], cost: 1200, upkeep: 60, price: 40, quality: 12, appeal: 14, maxLv: 10, traits: { 美味: 6, 安心: 2 }, serves: ["eat", "reincarnate"], unique: true, unlock: { resident: "lee" } },
    { id: "photo", name: "托夢照相館", cat: "special", size: [2, 2], cost: 1100, upkeep: 50, price: 35, quality: 12, appeal: 12, maxLv: 10, traits: { 思念: 6 }, serves: ["dream"], unique: true, unlock: { resident: "dabao" } },
    { id: "salon", name: "碧落髮廊", cat: "special", size: [2, 2], cost: 1000, upkeep: 45, price: 35, quality: 11, appeal: 12, maxLv: 10, traits: { 儀容: 6 }, serves: ["hair"], unique: true, unlock: { resident: "baimei" } },
    { id: "sweets", name: "孟婆甜食屋", cat: "special", size: [2, 2], cost: 1300, upkeep: 50, price: 30, quality: 12, appeal: 13, maxLv: 10, traits: { 美味: 4, 安心: 2 }, serves: ["sweets"], unique: true, unlock: { helped: 60 } }
  ],

  jobs: [
    { id: "newsoul", name: "新魂", line: "服務", growth: { 魂力: 2, 膽量: 2, 手藝: 2, 定力: 2, 靈力: 2, 福報: 2 }, from: [], cost: 0 },
    { id: "ferrycat", name: "引渡貓", line: "引導", growth: { 魂力: 2, 膽量: 2, 手藝: 4, 定力: 1, 靈力: 2, 福報: 3 }, from: ["新魂"], cost: 30 },
    { id: "spiritdog", name: "慰靈犬", line: "引導", growth: { 魂力: 3, 膽量: 3, 手藝: 2, 定力: 3, 靈力: 1, 福報: 2 }, from: ["新魂"], cost: 30 },
    { id: "sawyer", name: "刀鋸使", line: "巡守", growth: { 魂力: 4, 膽量: 5, 手藝: 2, 定力: 3, 靈力: 1, 福報: 1 }, from: ["新魂"], cost: 50 },
    { id: "clerk", name: "店員", line: "服務", growth: { 魂力: 2, 膽量: 1, 手藝: 3, 定力: 2, 靈力: 2, 福報: 3 }, from: ["新魂"], cost: 20 },
    { id: "intern", name: "實習月老", line: "特殊", growth: { 魂力: 3, 膽量: 2, 手藝: 3, 定力: 2, 靈力: 4, 福報: 3 }, from: [], cost: 0 },
    { id: "matchmaker", name: "月老", line: "特殊", growth: { 魂力: 4, 膽量: 4, 手藝: 3, 定力: 3, 靈力: 5, 福報: 3 }, from: [], cost: 0 },
    { id: "owner", name: "燒肉店店長", line: "特殊", growth: { 魂力: 5, 膽量: 6, 手藝: 3, 定力: 4, 靈力: 3, 福報: 2 }, from: [], cost: 0 }
  ],

  ranks: [
    { star: 1, popularity: 300 },
    { star: 2, popularity: 1000 },
    { star: 3, popularity: 2200 },
    { star: 4, popularity: 3500 },
    { star: 5, popularity: 6000 }
  ],
  titles: [
    { name: "實習月老", helped: 0, pairs: 3 },
    { name: "見習月老", helped: 80, pairs: 4 },
    { name: "月老", helped: 250, pairs: 5 }
  ],

  chars: [
    { id: "yutong", name: "語彤", job: "實習月老", start: true, lines: [["EP3-13", "我想你教我愛戀文印……"]] },
    { id: "yuelao", name: "月老", job: "月老", movein: { order: 1 }, brings: "tattoo", lines: [["EP3-13", "既然抽到第六十一籤，就跟著我學吧。"]] },
    { id: "mimi", name: "咪咪", job: "引渡貓", movein: { order: 2 }, lines: [["EP1-01", "下一班列車要進站囉——喵。"]] },
    { id: "heitang", name: "黑糖", job: "慰靈犬", movein: { order: 3 }, lines: [["EP1-02", "汪！"]] },
    { id: "lee", name: "業鏡羅漢", job: "燒肉店店長", movein: { order: 4 }, brings: "yakiniku", lines: [["EP1-01", "歡迎光臨黃泉燒肉店。"]] },
    { id: "xiaoyu", name: "小雨", job: "店員", movein: { order: 5 }, lines: [["EP1-03", "今天也要努力打工！"]] },
    { id: "dabao", name: "大寶", job: "店員", movein: { traits: { 思念: 10 }, popularity: 200 }, brings: "photo", lines: [["EP1-07", "想見誰，我幫你拍一張托夢照。"]] },
    { id: "baimei", name: "白妹", job: "店員", movein: { traits: { 儀容: 0 }, popularity: 300 }, brings: "salon", lines: [["EP2-01", "頭七要漂漂亮亮的回去喔。"]] },
    { id: "huji", name: "狐姬", job: "店員", movein: { request: "huji-shift" }, lines: [["EP2-05", "哪家店缺人？我都能補。"]] },
    { id: "jiuwei", name: "九尾", job: "刀鋸使", movein: { popularity: 1000 }, lines: [["EP2-08", "結界我來顧。"]] },
    { id: "guanyin", name: "觀音", job: "", reviewer: true, lines: [] }
  ],

  requests: [
    { id: "maoguai", char: "maoguai", name: "毛怪", ep: "EP1-01", title: "喜歡穿圍裙的人", need: [{ building: "teahouse" }, { trait: "安心", min: 5 }], reward: { merit: 40, helped: 1 }, lines: [["毛怪", "我……想再見一次穿圍裙的那個人。"], ["語彤", "我們一起想辦法吧。"]] },
    { id: "xiaole", char: "xiaole", name: "小樂", ep: "EP1-02", title: "討好型人格，要慰靈犬陪", need: [{ resident: "heitang" }], reward: { merit: 50, helped: 1 }, lines: [["小樂", "大家都喜歡我嗎？我是不是做錯了什麼……"], ["黑糖", "汪！"]] },
    { id: "daniu", char: "daniu", name: "大牛", ep: "EP1-04", title: "求業鏡羅漢原諒", need: [{ resident: "lee" }, { building: "yakiniku" }], reward: { merit: 80, helped: 1 }, lines: [["大牛", "羅漢大人，我知道錯了。"], ["業鏡羅漢", "先坐下來吃一盤吧。"]] },
    { id: "modi", char: "modi", name: "茉蒂", ep: "EP1-06", title: "想吃薯條", need: [{ trait: "美味", min: 10 }], reward: { merit: 40, helped: 1 }, lines: [["茉蒂", "好想吃薯條喔……"]] },
    { id: "abin-mom", char: "abinmom", name: "阿斌的媽媽", ep: "EP1-07", title: "托夢問兒子", need: [{ building: "photo" }, { action: "dream" }], reward: { merit: 100, helped: 1 }, lines: [["阿斌的媽媽", "我只想問他，有沒有好好吃飯。"]] },
    { id: "huji-shift", char: "huji", name: "狐姬", ep: "EP2-05", title: "找打工的地方", need: [{ trait: "娛樂", min: 3 }, { building: "inn" }], reward: { merit: 60, helped: 1, movein: true }, lines: [["狐姬", "這條街缺打工的嗎？"]] }
  ],

  events: [
    { id: "offering", when: { random: 0.06 }, title: "陽間燒來供品", lines: [["語彤", "陽間有人燒了一大疊紙錢過來！"]], effect: { money: 500 } },
    { id: "heartache", when: { random: 0.04 }, title: "掛念心悸", lines: [["月老", "有亡魂掛念陽間的人，心口發疼。"], ["語彤", "我去看看！"]], effect: { merit: -20, helped: 1 } },
    { id: "lazycat", when: { random: 0.04, resident: "mimi" }, title: "引渡貓偷懶", lines: [["咪咪", "今天的列車……讓牠自己開嘛——喵。"]], effect: { popularity: -10 } },
    { id: "snack", when: { random: 0.03, resident: "yuelao" }, title: "月老躲去偷吃零食", lines: [["語彤", "師父又不見了……"]], effect: { merit: 10 } }
  ],

  calendar: [
    { month: 1, title: "新年", lines: [["語彤", "新年快樂！今年也要幫更多人。"]], effect: { merit: 30 } },
    { month: 4, title: "清明", lines: [["月老", "清明時節，陽間香火特別旺。"]], effect: { merit: 60, traits: { 香火: 5 } } },
    { month: 7, title: "中元", lines: [["咪咪", "中元節到了，陽間海邊很危險——喵。"]], effect: { popularity: 30 } },
    { month: 9, title: "愛神祭", lines: [["月老", "愛神祭開始囉！"]], effect: { popularity: 80, traits: { 緣分: 5 } } }
  ],

  maps: [
    { id: "saw", name: "刀鋸地獄", stars: 3, lv: 3, open: { start: true }, desc: "辣雞在刀鋸地獄等著審判。", enemies: ["刀鋸獄卒", "怨靈"], boss: "辣雞", reward: { merit: 60, money: 400 } },
    { id: "gaoxiong", name: "庚寅地球・高熊市", stars: 2, lv: 5, open: { start: true }, desc: "白蛛會在碼頭走私，術士放出蜥蜴蠱作亂。", enemies: ["白蛛會幫眾", "術士", "蜥蜴蠱"], boss: "白老大", helpers: ["杜先生", "鐵蛋", "光頭小弟"], reward: { merit: 80, money: 600 } },
    { id: "xinjue", name: "心堀江", stars: 3, lv: 8, open: { rank: 1 }, desc: "黃雨衣在雨夜出沒。", enemies: ["黃雨衣"], boss: "八尺大人", reward: { merit: 120, money: 800 } },
    { id: "seaside", name: "陽間海邊", stars: 2, lv: 6, open: { month: 7 }, desc: "中元節，抓交替的冤魂上岸了。", enemies: ["抓交替冤魂"], boss: "海邊冤魂王", reward: { merit: 100, money: 300 } },
    { id: "ruins", name: "古神遺跡", stars: 4, lv: 12, open: { rank: 2 }, enemies: ["石像", "古神觸手"], boss: "古神之眼", reward: { merit: 200, money: 1200 } },
    { id: "demon2", name: "魔界第二王國", stars: 4, lv: 16, open: { rank: 3 }, enemies: ["鼠軍師"], boss: "利維坦", reward: { merit: 300, money: 1500 } },
    { id: "demon3", name: "魔界第三王國", stars: 5, lv: 22, open: { rank: 4 }, enemies: ["骷髏兵", "蝙蝠惡魔", "辜老師"], boss: "撒旦", reward: { merit: 500, money: 2500 } },
    { id: "north", name: "北境", stars: 5, lv: 30, open: { rank: 5 }, enemies: ["冰魂"], boss: "邪神帝", reward: { merit: 800, money: 4000 } }
  ],

  // 街區外圍遊蕩的怪（企劃書第 15 節）；lv 會再加上區塊深度
  mobs: [
    { id: "lost", name: "迷途魂", hp: 14, atk: 3, def: 1, exp: 4, toSoul: true },
    { id: "miasma", name: "魔氣團", hp: 20, atk: 5, def: 2, exp: 6 },
    { id: "lizard", name: "蜥蜴蠱", hp: 26, atk: 6, def: 3, exp: 8 },
    { id: "drowner", name: "抓交替冤魂", hp: 34, atk: 8, def: 3, exp: 11 }
  ]
};
