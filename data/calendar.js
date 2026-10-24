/* 三途川物語 ‧ 年度行事曆與觀音評定台詞（線 C）
   時間照 B：1 個月 4 週。HQ.calendar 是 12 個月的陣列，每個月的 events 在該週第一天觸發。
   事件欄位同 data/events.js（lines / effect / choice / when / once）。另外：
     week: 1～4            第幾週
     weeks: n              效果持續 n 週（例如清明整個月）
     mods                  持續期間的倍率（引擎套用）：
                             offeringMul  陽間供品事件機率倍率
                             incenseMul   香火功德倍率（B 的 incense.qingmingMul 同義）
                             mobMul: { id: 倍率 }  外圍怪物數量倍率
                             wishMul: { wish: 倍率 } 心願出現權重倍率
                             wenyinMul    文印功德倍率
   評定的分數與獎勵公式在 B 的 data/ranks.js（HQ.review）；這裡只放觀音的台詞與指派任務。
*/
window.HQ = window.HQ || {};

HQ.calendar = [
  { month: 1, name: "一月", events: [
    { id: "newyear", week: 1, title: "新年",
      lines: [[null, "新的一年。三途川岸邊掛滿了燈籠。", "字卡"]],
      effect: { popularity: 10, traits: { 娛樂: 3 } } }
  ] },
  { month: 2, name: "二月", events: [] },
  { month: 3, name: "三月", events: [
    { id: "qingming", week: 1, weeks: 4, title: "清明",
      lines: [
        [null, "清明到了。陽間燒下來的供品和香火都變多了。", "字卡"],
        ["EP3-02", "今天有你的貢品哦", "xiaoyu"]
      ],
      mods: { offeringMul: 2, incenseMul: 2, wishMul: { prayer: 2, dream: 1.5 } } },
    { id: "review-q1", week: 4, title: "觀音巡察", review: "quarter" }
  ] },
  { month: 4, name: "四月", events: [] },
  { month: 5, name: "五月", events: [] },
  { month: 6, name: "六月", events: [
    { id: "review-q2", week: 4, title: "觀音巡察", review: "quarter" }
  ] },
  { month: 7, name: "七月", events: [
    { id: "qixi", week: 1, title: "七夕",
      lines: [
        [null, "七夕到了，紋身店前排起了隊。", "字卡"],
        [null, "師傅，七夕對月老來說是大日子吧？", "yutong"],
        ["月老外傳-01", "七夕其實是我的忌日", "yuelao"],
        ["月老外傳-01", "死在七夕？　也太不浪漫了吧", "yutong"],
        ["月老外傳-06", "後來被我幫助過的戀人　會在七夕　以去月下慶祝為暗號　紀念岳夏澤　以男歡女愛的慶典緬懷我", "yuelao"]
      ],
      when: { resident: "yuelao" },
      weeks: 1, mods: { wenyinMul: 2, wishMul: { tattoo: 2 } } },
    { id: "ghostmonth", week: 2, weeks: 3, title: "中元・鬼門開",
      lines: [
        [null, "鬼門開了。陽間海邊的抓交替冤魂變多，連三途川外圍也看得到。", "字卡"],
        [null, "中元節陽間磁場很亂，大家出門小心。", "qianliyan"]
      ],
      mods: { mobMul: { "mob-ghost": 3 } },
      effect: { guest: "qianliyan", spawn: [{ mob: "mob-ghost", n: 3, at: "river" }] } },
    { id: "qianliyan-bracelet", week: 3, title: "千里眼的秘術", once: true,
      when: { resident: "nova" },
      lines: [
        [null, "中元節的晚上，大家到陽間海邊看煙火。", "字卡"],
        ["EP4-09", "等一下那邊會有煙火哦", "yutong"],
        ["EP4-09", "好香的魔氣　給我吃", "冤魂"],
        ["EP4-09", "抓交替的冤魂　被諾瓦的魔氣吸引過來了", "yutong"],
        ["EP4-09", "silence！", "qianliyan"],
        ["EP4-09", "對不起　我剛剛想到打仗的事情", "nova"],
        ["EP4-09", "小惡魔　把左手伸出來　這是媽祖加持過的手串　可以驅散恐懼", "qianliyan"]
      ],
      effect: { flag: "bracelet", traits: { 安心: 5 } } },
    { id: "pudu", week: 3, title: "中元普渡",
      lines: [
        [null, "陽間普渡，供品一箱一箱燒下來。", "字卡"],
        ["EP3-06", "我櫃子的零食少了好多　你在吃什麼？　是不是我的中元節貢品", "dabao", {"resident": "yuelao"}],
        ["EP3-06", "這是我自己帶的", "yuelao", {"resident": "dabao"}]
      ],
      effect: { money: 800, merit: 20 }, mods: { offeringMul: 3 }, weeks: 1 }
  ] },
  { month: 8, name: "八月", events: [
    { id: "nightmarket", week: 1, weeks: 2, title: "愛神大夜市",
      when: { rank: 1 },
      lines: [
        [null, "愛神祭快到了，會場周圍擺起了愛神大夜市，各國的愛神也來了。", "字卡"],
        ["EP3-08", "愛神祭前會場周圍有愛神大夜市　叫業鏡羅漢帶你去散散心", "yuelao"],
        ["EP3-10", "愛神祭每年都在不同城市舉辦　是愛神們傳遞愛意的活動", "xiaoyu"],
        ["EP3-10", "月老一定也很在意這個祭典", "xiaoyu"],
        ["EP3-10", "是手工雞蛋糕", "yutong"],
        [null, "射箭攤前，兩位女神較起勁來。", "字卡"],
        ["EP3-10", "我可是有和奈特學過射箭哦", "hathor"],
        ["EP3-10", "丘比特的弓術還是我教的", "aphrodite"]
      ],
      effect: { guest: ["hathor", "aphrodite", "shencha", "aizen"], popularity: 20 },
      mods: { wishMul: { fun: 2, eat: 1.3 } } },
    { id: "sketch-duel", week: 2, title: "素描對決浮世繪", once: true,
      when: { building: "gecko" },
      lines: [
        [null, "守宮廣場來了一位拿著畫筆的客人，站在語彤的畫前不走。", "字卡"],
        ["EP3-03", "小妹妹畫的真好", "aizen"],
        ["EP3-03", "我想用浮世繪　跟你的素描比賽", "aizen"],
        ["EP3-03", "我接受你的邀請！", "yutong"],
        ["EP3-04", "是無我境界啊！", "aizen"],
        ["EP3-04", "是明王大人贏了", "yutong"],
        ["EP3-04", "真是謙虛的好孩子　你願不願意當我的徒弟？", "aizen"],
        ["EP3-04", "我差點忘了　妳一定要來參加愛神祭選拔哦！", "aizen"]
      ],
      effect: { popularity: 30, traits: { 藝術: 8 } } },
    { id: "heartache-market", week: 2, title: "掛念心痛", once: true,
      when: { rank: 1, resident: ["yutong", "lee", "yuelao"] },
      lines: [
        [null, "夜市逛到一半，語彤突然按著胸口蹲了下來。", "字卡"],
        ["EP3-10", "辣雞……　放開我爸", "yutong"],
        ["EP3-10", "是掛念心痛……", "xiaoyu"],
        [null, "陽間，語彤的家人被纏上了。", "字卡"],
        ["EP3-10", "是魔氣", "aphrodite"],
        ["EP3-10", "誰敢動他", "lee"],
        ["EP3-10", "這邊交給我　語彤給你處理", "yuelao"],
        ["EP3-11", "他們的靈魂好純潔", "hathor"],
        ["EP3-11", "他們是因為人間的因果　而產生魔性", "yuelao"]
      ],
      effect: { traits: { 魔氣: 5 }, flag: "osiris" } },
    { id: "selection", week: 3, title: "愛神祭選拔",
      when: { building: "festival" },
      lines: [
        [null, "愛神祭選拔開始了，台下擠滿了人。", "字卡"],
        ["EP3-12", "月老　離我近一點啦", "hathor"],
        ["EP3-12", "愛染！　可以跟你換位置嗎？", "yuelao"],
        ["EP3-12", "不要", "aizen"],
        ["EP3-12", "月老原來這麼想靠近我", "aphrodite"],
        ["EP3-12", "語彤怎麼不是參加繪畫組選拔？", "dabao"],
        ["EP3-12", "因為她唱歌更厲害", "xiaoyu"]
      ],
      effect: { popularity: 40, traits: { 緣分: 5, 娛樂: 5 } } },
    { id: "ganlu", week: 4, title: "仿製甘露寶瓶", once: true,
      when: { building: "festival" },
      lines: [
        [null, "愛神祭結束，愛染明王臨走前又來找語彤。", "字卡"],
        ["EP3-13", "真可惜啊　當我徒弟就不用掃地哦", "aizen"],
        ["EP3-13", "這是我在這裡煉製的仿製甘露寶瓶　在瓶內放入喜歡的飲料並放置一天　就可以變成治癒靈魂的靈藥", "aizen"],
        ["EP3-13", "你畫圖的時候太認真　不小心流露出魔氣　但我相信你的靈魂是善良的", "aizen"],
        ["EP3-13", "改天來日本玩　我教你三味線", "aizen"]
      ],
      effect: { flag: "ganlu", traits: { 魔氣: -5 } } }
  ] },
  { month: 9, name: "九月", events: [
    { id: "review-q3", week: 4, title: "觀音巡察", review: "quarter" }
  ] },
  { month: 10, name: "十月", events: [] },
  { month: 11, name: "十一月", events: [] },
  { month: 12, name: "十二月", events: [
    { id: "review-year", week: 4, title: "觀音年度評定", review: "year" }
  ] }
];

/* 觀音評定的台詞。等第 S～D 對應 B 的 HQ.review.grades。
   arrive 每次巡察開場；grade 依等第；promote 是年度評定升階時（index＝升到 HQ.titles 的第幾階）；
   rankUp 是街區評價升星。 */
HQ.reviewScenes = {
  arrive: [
    [null, "觀音菩薩來巡察了。", "字卡"],
    [null, "觀音菩薩！您親自來了……", "yutong"],
    ["EP1-05", "客氣什麼　陪我散步一下", "guanyin"]
  ],
  grade: {
    S: [
      ["EP1-05?", "改善很多哦", "guanyin"],
      [null, "這條河岸，越來越像亡魂可以安心停留的地方了。", "guanyin"]
    ],
    A: [
      ["EP1-05?", "改善很多哦", "guanyin"]
    ],
    B: [
      [null, "還可以，但還有很多人在等。", "guanyin"]
    ],
    C: [
      [null, "還不夠喔。街上還有很多亡魂，放不下心裡的事。", "guanyin"]
    ],
    D: [
      [null, "這一季，幫到的人太少了。", "guanyin"],
      [null, "我交給你一件事。下一季做到了，功德給你三倍。", "guanyin"]
    ]
  },
  taskDone: [
    [null, "觀音菩薩交代的事，我做到了！", "yutong"],
    [null, "觀音交付的任務完成了，功德三倍。", "字卡"]
  ],
  promote: {
    1: [
      ["EP3-17", "雖然很細微　但這孩子竟然有了神性", "yuelao"],
      [null, "語彤升為見習月老。", "字卡"]
    ],
    2: [
      [null, "從今天起，你就是正式的月老了。", "yuelao"],
      [null, "師傅……謝謝你！", "yutong"],
      [null, "語彤成為正式的月老。", "字卡"]
    ]
  },
  rankUp: [
    [null, "三途川岸邊的街區評價提升了。", "字卡"]
  ]
};

/* 等第 D 時觀音指派的任務（隨機挑一個；need 鍵同委託，另外多一種計數）：
     { count: "sendoff"|"wenyin"|"dream"|"request"|"boss"|"rescue", n }  本季要做到的次數 */
HQ.reviewTasks = [
  { id: "task-sendoff", title: "送行", need: [{ count: "sendoff", n: 8 }],
    lines: [[null, "下一季，好好送八位亡魂過奈何橋。", "guanyin"]] },
  { id: "task-wenyin", title: "牽紅線", need: [{ count: "wenyin", n: 3 }],
    lines: [[null, "下一季，替三組戀人做愛戀文印。", "guanyin"]] },
  { id: "task-dream", title: "托夢", need: [{ count: "dream", n: 5 }],
    lines: [[null, "下一季，讓五個人見到陽間的家人。", "guanyin"]] },
  { id: "task-guest", title: "接待外賓", need: [{ resident: "huji" }, { count: "boss", n: 1 }],
    lines: [
      ["EP4-04", "有接待過外賓經驗　同時又有一定功力的靈魂　除了你我想不到別的人選", "guanyin"],
      ["EP4-04", "這次的任務……　得加錢", "huji"]
    ] }
];
