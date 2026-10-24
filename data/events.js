/* 三途川物語 ‧ 事件與教學（線 C）
   台詞格式見 data/chars.js 開頭。時間單位照 B：1 個月 4 週。

   when（全部成立才會發生）
     random: p        每週擲一次的機率（不寫 random ＝ 條件一成立就發生，例如 once 的劇情事件）
     month / week     限定月份、第幾週
     rank / helped / popularity
     resident: id 或 [id, …]   這些人都入住了
     guest: id        外賓在街上
     building: id     街上有這棟
     flag / noflag    有／沒有旗標
     chain: true      只會被別的事件的 effect.next 叫出來
     trigger: "…"     由引擎在特定時刻呼叫：
                        "moki"        B 的魔氣暴走判定成立時（HQ.balance.moki）
                        "expedition"  出征出發時（搭配 party: id 表示隊伍裡有這個人）
                        "built"       蓋好 when.building 那一刻
   once: true         一輪遊戲只發生一次
   lines              對話
   choice             [{ label, cost: { merit }, effect, lines }]，玩家選一個；沒有 choice 就直接套 effect
   effect
     merit / money / popularity / helped    增減
     traits: { 特徵: n }                    街區特徵增減
     flag: id                               立旗標
     spawn: [{ mob: id, n, at: "station"|"edge"|"river" }]   在街上或外圍生怪（id 照 B 的 HQ.mobs / HQ.enemies）
     close: { building: id, weeks: n }      這棟停業 n 週（weeks: "return" ＝出征回來為止）
     away: { chars: [id…], weeks: n }       這些人 n 週不能工作也不能出征
     trainMul: { mul: 0.5, weeks: 1 }       列車來客倍率
     block: { what: "reincarnate", weeks: n }  奈何橋封禁：不能送行投胎
     guest: id                              外賓出現在街上
     next: { event: id, inWeeks: n }        n 週後接著發生
     defense: { id: "invasion3", inWeeks: n }  n 週後開始街區保衛戰（data/maps.js 的 HQ.defense）
     ifResident: { id: 效果 }               某人在的話改用這個效果
*/
window.HQ = window.HQ || {};

HQ.events = [
  /* ───────── 陽間燒來供品 ───────── */
  { id: "offering", title: "陽間燒來供品",
    when: { random: 0.06 },
    lines: [
      [null, "活人的世界，也就是陽間，有人燒了供品下來；黃泉燒肉店的店員小雨正替亡魂分送。", "字卡"],
      ["EP3-02", "今天有你的貢品哦。", "xiaoyu"]
    ],
    effect: { money: 300, traits: { 思念: 2 } } },

  { id: "offering-roach", title: "誰拜蟑螂給我", once: true,
    when: { random: 0.04, resident: "xiaoyu" },
    lines: [
      [null, "黃泉燒肉店裡，掌管店面的業鏡羅漢把一包東西交給店員小雨。", "字卡"],
      ["SP1-01", "這是你的供品。", "lee"],
      ["SP1-01", "謝謝。", "xiaoyu"],
      ["SP1-01", "誰拜給我一堆蟑螂啊？", "xiaoyu"],
      [null, "原來是小雨生前養的貓、如今的引渡貓咪咪抓來的，不是陽間燒下來的供品。", "字卡"]
    ],
    effect: { popularity: 5, traits: { 思念: 3 } } },

  { id: "offering-manga", title: "最新的藍衣小偵探", once: true,
    when: { random: 0.04, resident: ["yutong", "xiaoyu"] },
    lines: [
      [null, "黃泉燒肉店的店員小雨，把陽間燒來的漫畫交給實習月老語彤。", "字卡"],
      ["EP3-02", "今天有你的貢品哦。", "xiaoyu"],
      [null, "最新的《藍衣小偵探》！", "yutong"],
      ["EP3-02", "太好看了吧！", "xiaoyu"]
    ],
    effect: { traits: { 思念: 3, 美味: 2 } } },

  { id: "offering-doll", title: "三年前沒拿下的娃娃", once: true,
    when: { random: 0.04, resident: "dabao" },
    lines: [
      [null, "消防員大寶在山火中殉職後，收到了陽間燒來的娃娃，上面附著紙條。", "字卡"],
      [null, "【讀紙條】這是大寶生前的消防隊同事兼好友阿副留給他的話。", "字卡"],
      ["EP1-14", "兄弟……三年前你沒拿下的娃娃，幫你拿下了。", "afu"],
      ["EP1-14", "大寶……任務結束了，好好休息。", "afu"]
    ],
    effect: { traits: { 思念: 4 } } },

  { id: "offering-letter", title: "給你的掛號信", once: true,
    when: { random: 0.04, resident: ["huji", "yuelao"] },
    lines: [
      [null, "陽間燒來一封給狐妖狐姬的信，月老拿來交給她。", "字卡"],
      ["EP2-14", "有你的供品，想看嗎？", "yuelao"],
      ["EP2-14", "我在陽間還有認識的人活著嗎？", "huji"],
      [null, "【讀信】寫信的是消防隊長赤坂；狐姬等了他三輩子。", "字卡"],
      ["EP2-14", "給神秘的小狐狸：那天我看到是妳替我擋住火勢。", "akasaka"],
      ["EP2-14", "不知道妳為何總在我無助的時候幫我。", "akasaka"],
      ["EP2-14", "聽說在心裡想著那個人，再把東西燒掉，就能把心意跨空間傳遞。", "akasaka"],
      ["EP2-14", "如果妳能收到這封信，我想跟妳說一聲：謝謝！", "akasaka"],
      ["EP2-14", "如果還有機會夢到妳，希望能當面跟妳說。", "akasaka"],
      [null, "【讀信結束】狐姬捧著信，輕聲說。", "字卡"],
      ["EP2-14", "你終於記得我了。", "huji"]
    ],
    effect: { flag: "letter", traits: { 緣分: 5, 思念: 3 } } },

  /* ───────── 掛念心悸 ───────── */
  { id: "shrine-gift", title: "天界通知", once: true,
    when: { random: 0.03, resident: "dabao", rank: 1 },
    lines: [
      [null, "大寶生前是消防員，在山火中殉職。這天，他收到了天界通知。", "字卡"],
      ["EP2-08", "恭喜大寶因生前英勇事蹟，入祀忠烈祠，贈予大寶功德值120。", "天界通知"],
      [null, "大寶生前在山火裡救人的事，天界記下了。", "字卡"]
    ],
    effect: { merit: 120, next: { event: "palpitation-afu", inWeeks: 0 } } },

  { id: "palpitation-afu", title: "掛念心悸", once: true,
    when: { chain: true },
    lines: [
      [null, "山火中殉職的消防員大寶突然按住胸口，生前的女友小雨連忙扶住他。", "字卡"],
      ["EP2-08", "你怎麼了？", "xiaoyu"],
      [null, "觀音菩薩查看後，告訴大寶：他掛念的消防隊好友阿副，在陽間有生命危險。", "字卡"],
      ["EP2-08", "是掛念心悸，當你有特別想念的人，在陽間命懸一線，就會出現這種心悸。", "guanyin"],
      ["EP2-08", "救他一命需消耗100功德，你要救嗎？", "guanyin"]
    ],
    choice: [
      { label: "救！", cost: { merit: 100 },
        lines: [
          ["EP2-08", "救！", "dabao"],
          ["EP2-08", "做人好難，不想工作，當顆海底的石頭好像不錯。", "afu"],
          ["EP2-08", "給我醒來！", "dabao"],
          ["EP2-08", "如果有些事不方便跟人說，可以寫信燒給我，我有空會托夢跟你聊聊。", "dabao"],
          ["EP2-08", "大寶，不要走……", "afu"]
        ],
        effect: { helped: 1, popularity: 20, traits: { 思念: 5 } } },
      { label: "功德不夠……", effect: { traits: { 安心: -5 } } }
    ] },

  { id: "palpitation-huji", title: "掛念心痛", once: true,
    when: { random: 0.03, resident: "huji", flag: "letter" },
    lines: [
      [null, "狐妖狐姬突然胸口一痛，擔心起自己等了三輩子的消防隊長赤坂。", "字卡"],
      ["EP2-13", "是掛念心痛！", "huji"],
      [null, "【陽間・赤坂身邊】赤坂遇險，狐姬趕來相助。", "字卡"],
      [null, "妳是？", "akasaka"],
      [null, "得快點想辦法，我的功德快沒了。", "huji"]
    ],
    choice: [
      { label: "替她付功德", cost: { merit: 100 },
        lines: [[null, "狐姬撐起防護罩，替赤坂擋住了火勢。", "字卡"]],
        effect: { helped: 1, traits: { 緣分: 5 } } },
      { label: "讓她自己想辦法", effect: { away: { chars: ["huji"], weeks: 2 } } }
    ] },

  { id: "palpitation", title: "掛念心悸",
    when: { random: 0.02, rank: 1 },
    lines: [
      [null, "一位街坊突然抓著胸口跪了下來。", "字卡"],
      [null, "觀音菩薩上前查看，向那位街坊解釋。", "字卡"],
      ["EP2-08", "是掛念心悸，當你有特別想念的人，在陽間命懸一線，就會出現這種心悸。", "guanyin"],
      ["EP2-08", "救他一命需消耗100功德，你要救嗎？", "guanyin"]
    ],
    choice: [
      { label: "救", cost: { merit: 100 }, effect: { helped: 1, popularity: 10 } },
      { label: "不救", effect: { traits: { 安心: -3 } } }
    ] },

  /* ───────── 市役所 ───────── */
  { id: "okyaku", title: "奧客到市役所抗議",
    when: { random: 0.04, building: "cityhall" },
    lines: [
      [null, "一位亡魂在市役所櫃台拍桌，要求馬上發令旗。", "字卡"],
      ["EP2-15", "你的情況還不能申請黑令旗。", "xiaomi"],
      [null, "師傅，要不要過去幫忙？", "yutong", {"resident": "xiaomi"}],
      ["EP2-15", "不用，小米可是對付奧客的專家喲。", "yuelao", {"resident": "xiaomi"}],
      [null, "請、請冷靜一點……", "yutong", {"absent": "xiaomi"}],
      [null, "那位亡魂罵了半天，才甩門走了。", "字卡", {"absent": "xiaomi"}]
    ],
    effect: { popularity: -10, ifResident: { xiaomi: { popularity: 5, traits: { 秩序: 2 } } } } },

  { id: "heitang-scary", title: "這一單超恐怖的",
    when: { random: 0.03, resident: "heitang", rank: 1 },
    lines: [
      [null, "慰靈犬黑糖負責安慰悲傷的靈魂；這回，他遇上了一位剛下列車的亡魂。", "字卡"],
      ["EP2-15", "快來幫我，這一單超恐怖的！", "heitang"],
      ["EP2-15", "他下車時散發的怨念，我從沒見過，完全不想靠近的氣息。", "heitang"]
    ],
    effect: { spawn: [{ mob: "mob-miasma", n: 2, at: "station" }], traits: { 魔氣: 3 } } },

  /* ───────── 魔氣暴走 ───────── */
  { id: "moki-burst", title: "魔氣暴走",
    when: { trigger: "moki" },
    lines: [
      [null, "街角冒出一團紫黑色的霧，路過的亡魂都繞開了。", "字卡"],
      [null, "柴犬頭的埃及死神阿努柴停下腳步，月老也看向那團霧。", "字卡"],
      ["EP2-15", "是魔氣！", "shencha"],
      ["EP2-15", "地府是不允許魔存在的哦。", "yuelao"]
    ],
    effect: { spawn: [{ mob: "mob-miasma", n: 4, at: "edge" }], popularity: -15,
      ifResident: { jiuwei: { spawn: [{ mob: "mob-miasma", n: 2, at: "edge" }], popularity: -5 } } },
    residentLines: { jiuwei: [["EP6-08", "來了！來吧，結界，開！", "jiuwei"]] } },

  /* ───────── 街坊日常 ───────── */
  { id: "yuelao-snack", title: "月老躲髮廊偷吃零食",
    when: { random: 0.04, resident: ["yuelao", "dabao"], building: "salon" },
    lines: [
      [null, "【碧落髮廊】台灣愛神月老又躲來偷吃零食，被在托夢照相館工作的大寶撞見。", "字卡"],
      ["EP3-06", "我櫃子的零食少了好多，你在吃什麼？\n是不是我的中元節貢品？", "dabao"],
      ["EP3-06", "這是我自己帶的。", "yuelao"],
      [null, "你屁，明明就是偷吃我的。", "dabao"],
      [null, "好啦，下次買一包還你。", "yuelao"]
    ],
    effect: { close: { building: "tattoo", weeks: 1 }, popularity: 5 } },

  { id: "cat-fight", title: "隔壁的 918 號超吵",
    when: { random: 0.04, resident: ["mimi", "cat918"] },
    lines: [
      [null, "黃泉燒肉店的店員小雨，問起生前養的貓咪咪；咪咪現在是車站的引渡貓。", "字卡"],
      [null, "咪咪，車站住得還習慣嗎？", "xiaoyu"],
      ["EP1-13", "車站才不好，隔壁的918號超吵。", "mimi"],
      [null, "咪咪說的，是住在隔壁的灰色引渡貓，９１８號。", "字卡"],
      ["EP1-13", "我已經聯合三花幫，明天圍毆它。", "mimi"],
      ["EP1-13", "貓貓要好好相處。", "xiaoyu"],
      ["EP1-13", "那可以趁它上廁所的時候，推翻它的貓砂盆嗎？", "mimi"],
      ["EP1-13", "不行！", "xiaoyu"]
    ],
    effect: { trainMul: { mul: 0.7, weeks: 1 } } },

  { id: "mimi-cook", title: "雞胸肉",
    when: { random: 0.03, resident: ["mimi", "xiaoyu"] },
    lines: [
      [null, "黃泉燒肉店的店員小雨煮了雞胸肉，端給生前養的貓、如今的引渡貓咪咪。", "字卡"],
      ["EP1-13", "試試看我煮的雞胸肉。", "xiaoyu"],
      ["EP1-13", "有人跟你說過你煮飯很好吃嗎？", "mimi"],
      ["EP1-13", "還沒有。", "xiaoyu"],
      ["EP1-13", "那你還煮？", "mimi"]
    ],
    effect: { traits: { 安心: 2 } } },

  { id: "yimin", title: "六萬功德的業鏡羅漢", once: true,
    when: { trigger: "built", building: "yimin" },
    lines: [
      [null, "【三途川・義民廟】廟蓋好了，受過李國志幫助的人前來上香；他如今是掌管黃泉燒肉店的業鏡羅漢。", "字卡"],
      [null, "【三途川】實習月老語彤聽到消息，向街坊道謝。", "字卡"],
      [null, "謝謝大家幫忙！", "yutong"],
      [null, "業鏡羅漢生前的戀人白妹，也替他高興。", "字卡"],
      [null, "不用客氣啦。大家一直記得阿志的幫忙，還替他蓋廟祭拜。他現在可是有六萬功德的業鏡羅漢喔！", "baimei"]
    ],
    effect: { merit: 60, traits: { 香火: 5 } } },

  { id: "jiuwei-smoke", title: "尼古狐狐",
    when: { random: 0.04, resident: ["jiuwei", "huji"] },
    lines: [
      [null, "藍色九尾狐九尾拿出香，問妹妹狐姬要不要一起抽；狐姬一心想替等了三輩子的赤坂存功德。", "字卡"],
      ["EP6-05", "要不要來一根？", "jiuwei"],
      ["EP6-05", "不要，戒了。", "huji"],
      ["EP6-05", "你竟然戒香！妖狐之恥……", "jiuwei"],
      ["EP6-05", "我只是不想浪費功德買香，我想多存一點，這樣赤坂武士來到地府，就能帶他到處玩。", "huji"],
      ["EP6-05", "戀愛腦。", "jiuwei"]
    ],
    effect: { merit: 30, traits: { 香火: -2 } } },

  { id: "jiuwei-protect", title: "護妹狂魔",
    when: { random: 0.05, resident: ["jiuwei", "huji"], guest: "leviathan" },
    lines: [
      [null, "魔界第二王國的魔王利維坦，一路跟著狐妖狐姬，讓她很不耐煩。", "字卡"],
      ["EP6-04", "你不要再跟著我了！", "huji"],
      ["EP6-04", "你不喜歡我什麼？跟我說，我可以改啊！", "leviathan"],
      ["EP6-04", "你喜歡我什麼？跟我說，我也可以改。", "huji"],
      ["EP6-04", "敢欺負我妹！", "jiuwei"],
      [null, "狐姬的姐姐、結界師九尾衝上前，朝利維坦出手。", "字卡"],
      ["EP6-04", "異界降臨，如墜五里霧！", "jiuwei"],
      ["EP6-04", "姐？", "huji"],
      ["EP6-04", "是大姨。", "leviathan"],
      ["EP6-04", "大你妹！", "jiuwei"],
      ["EP6-04", "竟然毫髮無傷，可惡……", "jiuwei"],
      [null, "醫神華佗見狀，出聲攔住九尾。", "字卡"],
      ["EP6-04", "你打不過他。", "huatuo"]
    ],
    effect: { popularity: 20, away: { chars: ["jiuwei"], weeks: 1 } } },

  { id: "hotpot", title: "頂王的鴛鴦鍋", once: true,
    when: { random: 0.05, building: "mala", guest: "rat" },
    lines: [
      [null, "觀音菩薩找上魔界第二王國的總參謀鼠軍師，請他幫忙守護三途川。", "字卡"],
      ["EP4-16", "軍師，你可以幫我守護三途川嗎？\n事情結束之後，我請你吃頂王。", "guanyin"],
      ["EP4-16", "就我和你one on one？", "rat"],
      ["EP4-16", "對，吃鴛鴦鍋，我吃素的，你吃葷的。", "guanyin"],
      [null, "【後來・火鍋店】觀音菩薩履行承諾，請鼠軍師吃鴛鴦鍋。", "字卡"],
      ["EP6-07", "快起來吃鴨血！", "guanyin"]
    ],
    effect: { money: 500, popularity: 15 } },

  /* ───────── 魔界來客 ───────── */
  { id: "leviathan-visit", title: "第二王國的魔王", once: true,
    when: { rank: 3, resident: "yuelao" },
    lines: [
      [null, "市役所職員綠衣女子趕來通報。", "字卡"],
      ["EP4-01?", "魔界第二王國的魔王，利維坦，闖入了三途川。", "lvyi"],
      [null, "實習月老語彤站在師傅月老身邊，利維坦朝她開口。", "字卡"],
      ["EP4-01", "神魔共體啊，歌畫雙絕的小月老，有事想請教。", "leviathan"],
      ["EP4-01", "師傅！", "yutong"],
      ["EP4-01", "先退下！", "yuelao"],
      [null, "月老擋在語彤前面，利維坦連忙放低姿態。", "字卡"],
      [null, "別急，本王只是有事想請實習月老幫忙。", "leviathan"]
    ],
    effect: { flag: "leviathan-visit", guest: "leviathan" } },

  { id: "leviathan-candy", title: "戀愛的味道", once: true,
    when: { flag: "leviathan-visit", resident: "huji", random: 0.2 },
    lines: [
      [null, "狐妖狐姬買了金平糖給愛吃甜食的月老，魔界第二王國的魔王利維坦也湊了過來。", "字卡"],
      ["EP4-02", "月老大人，順路給你買的金平糖。", "huji"],
      ["EP4-02", "可不可以也給我一罐？", "leviathan"],
      [null, "剩下兩罐都給你，一罐留給你的養女諾瓦。", "huji"],
      ["EP4-02", "怎麼有這麼溫柔的人？", "leviathan"],
      ["EP4-02", "她對所有人都很好，是我們三途川的人氣打工王。", "yuelao"],
      ["EP4-02", "這一定是戀愛的味道。", "leviathan"],
      ["EP4-02", "我聞到暈船的味道。", "yuelao"]
    ],
    effect: { popularity: 10, traits: { 緣分: 3 } } },

  { id: "huji-guide", title: "接待魔界外賓", once: true,
    when: { flag: "leviathan-visit", resident: "huji" },
    lines: [
      [null, "觀音菩薩找上三途川的人氣打工王、狐妖狐姬，請她接待魔界外賓。", "字卡"],
      ["EP4-04", "有接待過外賓經驗，同時又有一定功力的靈魂，除了你，我想不到別的人選。", "guanyin"],
      ["EP4-04", "這次的任務……得加錢。", "huji"],
      [null, "我會請掌管黃泉燒肉店的業鏡羅漢當保鏢，保護妳，給妳三倍功德。", "guanyin"],
      ["EP4-04", "謝觀音姐姐隆恩，小女子必定完成任務。", "huji"]
    ],
    effect: { merit: 90 } },

  { id: "baimei-worry", title: "能不能不要去",
    when: { trigger: "expedition", party: "lee", resident: "baimei", random: 0.5 },
    lines: [
      [null, "掌管黃泉燒肉店的業鏡羅漢接下護送魔界外賓的任務，生前的戀人白妹很擔心。", "字卡"],
      ["EP4-04", "這麼危險的任務，你也敢接，你有替我想過嗎？", "baimei"],
      ["EP4-04", "這次的事情沒那麼難處理，我去幾天就回來。", "lee"],
      ["EP4-04", "上次你也是這樣說，然後你就失蹤70多年。", "baimei"],
      ["EP4-04", "你不要一直做好人，好嗎？", "baimei"]
    ],
    effect: { close: { building: "salon", weeks: "return" } },
    residentLines: { no7: [["EP4-04", "沒事，她吃完一顆放鬆馬卡龍就睡著了。\n但她心底散發的恐懼和悲傷很濃烈，回去要陪她多聊聊。", "no7"]] } },

  { id: "invasion-sign", title: "屋頂上的視線", once: true,
    when: { rank: 3, resident: "huji", random: 0.08, noflag: "invasion-done" },
    lines: [
      [null, "夜裡，三途川的狐妖狐姬走過街角，屋頂上的惡魔正盯著她。", "字卡"],
      ["EP4-10", "剛來就遇到百年妖狐，真幸運。", "第三王國惡魔"],
      [null, "誰在那裡！", "huji"],
      [null, "人影一閃，就不見了。", "字卡"]
    ],
    effect: { defense: { id: "invasion3", inWeeks: 2 } } },

  /* ───────── 天煞孤星（☆4 之後，一輪一次） ───────── */
  { id: "nightmare", title: "沒由來的惡夢", once: true,
    when: { rank: 4, resident: ["dabao", "xiaoyu", "huatuo"], random: 0.05 },
    lines: [
      [null, "【夢境・大寶的夢裡】在山火中殉職的消防員大寶，夢見傲慢魔王路西法與邪神帝對峙。", "字卡"],
      [null, "邪神帝，你已經輸了。", "lucifer"],
      ["EP6-02", "你就不怕被我詛咒嗎？", "邪神帝"],
      [null, "【夢醒・三途川】大寶驚醒，仍心有餘悸。", "字卡"],
      ["EP6-02", "又是這個噩夢，小時候在大地震前也有夢到。", "dabao"],
      ["EP6-02", "好不安的感覺。", "dabao"],
      [null, "小雨，妳可不能再有事。", "dabao"],
      [null, "【稍後・黃泉燒肉店】醫神華佗來查看大寶生前的女友小雨。", "字卡"],
      ["EP6-03", "感覺小雨的靈氣好像變弱了一點。", "huatuo"]
    ],
    effect: { next: { event: "tianshagu", inWeeks: 2 } } },

  { id: "tianshagu", title: "查封黃泉燒肉店", once: true,
    when: { chain: true },
    lines: [
      [null, "醫神華佗來到黃泉燒肉店，向店員小雨和在托夢照相館工作的大寶宣布。", "字卡"],
      [null, "三途川混入了可怕的詛咒。為了防止擴散，我得先查封黃泉燒肉店。", "huatuo"],
      ["EP6-08", "不知道燒肉店要關多久。", "xiaoyu"],
      [null, "就當放假吧。我最近存了不少功德，等事情過了，再帶大家出去玩。", "dabao"],
      [null, "話還沒說完，小雨的狀況突然惡化，大寶慌了。", "字卡"],
      [null, "拜託，神也好、魔也好，誰來幫幫小雨……", "dabao"],
      ["EP6-08", "在我面前，沒有詛咒可以帶走靈魂。", "huatuo"],
      ["EP6-08", "醫者令・鎮魂！", "huatuo"],
      ["EP6-08", "九尾，給我結界！", "huatuo"],
      [null, "結界師九尾趕來，應聲張開結界。", "字卡"],
      ["EP6-08", "來了！來吧，結界，開！", "jiuwei"]
    ],
    effect: { close: { building: "yakiniku", weeks: 4 }, away: { chars: ["xiaoyu", "mimi", "heitang", "lee", "huji"], weeks: 4 },
      block: { what: "reincarnate", weeks: 4 }, next: { event: "naihe-briefing", inWeeks: 1 } } },

  { id: "naihe-briefing", title: "奈何橋封禁說明會", once: true,
    when: { chain: true },
    lines: [
      [null, "【奈何橋・封橋說明會】這座橋通往投胎的路；醫神華佗暫停亡魂通行，實習月老語彤也在場。", "字卡"],
      ["EP6-09", "為什麼要禁止投胎？\n我媽快生出我了，我再不過奈何橋就晚了！", "民眾"],
      ["EP6-09", "詛咒尚未釐清傳染方式前，我不能放靈魂離開。", "huatuo"],
      ["EP6-09", "我下輩子是富二代，害我投不了胎，我要你賠！", "西裝男子"],
      ["EP6-09", "沒看到華佗已經在努力解決了嗎？", "yutong"],
      ["EP6-09", "謝謝你，小月老，讓我跟百姓解釋。", "huatuo"],
      [null, "這個詛咒就像靈魂裡藏了火藥，平常看不出來。「愛」一旦成了火星，就可能讓它爆發。", "huatuo"],
      ["EP6-09", "目前我尚未找到治癒的方法，但能製造結界阻止詛咒增長。", "huatuo"]
    ],
    effect: { popularity: -20, next: { event: "tianshagu-end", inWeeks: 3 } } },

  { id: "tianshagu-end", title: "結界解除", once: true,
    when: { chain: true },
    lines: [
      [null, "引渡貓咪咪還在結界裡休養，惦記著大寶和小雨；小雨是牠生前的主人，牠也親暱地叫大寶爸爸。", "字卡"],
      ["EP6-10", "大寶爸爸呢？我要找爸爸！", "mimi"],
      [null, "大寶來到咪咪身邊，聽牠慢慢說。", "字卡"],
      ["EP6-10", "我好愛你和媽咪，但喵不太會表達愛。", "mimi"],
      [null, "咪咪又轉向一旁安慰亡魂的慰靈犬黑糖。", "字卡"],
      [null, "黑糖，等我好了，就一起去公園玩。", "mimi"],
      [null, "【之後・黃泉燒肉店】結界解除，燒肉店重新開門。", "字卡"]
    ],
    effect: { helped: 5, traits: { 安心: 10, 思念: 6 } } }
];

/* ───────── 教學（月老，第一位入住） ─────────
   step 依序進行；goal 達成才進下一步。goal 鍵：
     build: id         蓋好這棟
     wenyin: n         完成 n 組文印
     guests: n         有 n 位亡魂下車
     helped: n         幫助人數
     resident: id      某人入住
*/
HQ.tutorial = [
  // 開場：月老帶語彤到河岸，第一件事是蓋紋身店。台詞以遊戲自己的順序為主，劇中原句只放在接得上的地方。
  { id: "t1", title: "歡迎來到三途川",
    lines: [
      [null, "【三途川・車站前】列車每天早晚各一班，把剛過世的亡魂載到河岸。", "字卡"],
      [null, "車站前只有一間茶館，其他都還是空地。", "字卡"],
      [null, "啊，你來了！歡迎來到三途川！我是剛當上實習月老的語彤。", "yutong"],
      [null, "從今天起，這片河岸交給我們。……對吧，師傅？", "yutong"],
      [null, "對。我是語彤的師傅，月下老人。亡魂來到這裡，心裡常有放不下的事，我們就幫他們了卻心願。", "yuelao"],
      [null, "你當初說想學愛戀文印，就是替相愛的靈魂做的紋身。為什麼想學？", "yuelao"],
      ["EP3-13", "因為我想幫助相愛的人不分離。", "yutong"],
      ["EP3-13", "你知道神為什麼喜歡幫人類嗎？\n因為你們執著的樣子，會讓神想起還是人類時的可愛。", "yuelao"],
      [null, "我先跟你說這裡怎麼運作。亡魂頭上的泡泡，是他們還沒完成的心願。", "yutong"],
      [null, "蓋對的店，亡魂就會走進去，付冥紙給店家。心願完成了，他們就越來越安心。", "yutong"],
      [null, "冥紙拿來蓋店，每個月底也要付維持費。功德是做好事累積的，蓋名店、擴建都要用。", "yutong"],
      [null, "安心的亡魂，可以邀請他留下來當街坊，或送他去投胎。不管哪一種，都算幫助了一個人。", "yutong"],
      [null, "觀音菩薩每季會來巡察。幫助的人夠多，我就能從實習月老升上去！看不懂的時候，打開「選單 → 情報」。", "yutong"],
      [null, "那就從紋身店開始。我在店裡替人做文印，你們負責讓客人找得到這裡。", "yuelao"],
      [null, "按下面的「建設」，把「月老紋身店」蓋在車站附近吧！", "yutong"]
    ],
    join: ["yuelao"],
    goal: { build: "tattoo" } },

  { id: "t2", title: "第一班列車",
    lines: [
      [null, "【三途川・車站月台】第一班載著亡魂的列車進站了。", "字卡"],
      ["EP1-03", "列車進站，請引渡貓就位。", "車站廣播"],
      [null, "引渡貓會帶亡魂下車。看他們頭上的泡泡，那是他們現在最想做的事。", "yuelao"],
      [null, "想和戀人做愛戀文印的亡魂，會走進月老紋身店。等兩個人都到了，我們就替他們做紋身。", "yuelao"],
      [null, "其他心願也一樣：蓋了對的店，亡魂就會去。心願滿足了，他們就越來越安心。", "yuelao"]
    ],
    goal: { wenyin: 1 } },

  { id: "t3", title: "第一組文印",
    lines: [
      [null, "【三途川・月老紋身店】第一對戀人的愛戀文印完成了。", "字卡"],
      [null, "成功了！", "yutong"],
      ["EP2-04", "文印可以跨越輪迴，即便過奈何橋也不會消散。", "yuelao"],
      [null, "一組文印，就是幫助了兩個人。右下角的牌子記著你幫過多少人。", "yuelao"],
      [null, "安心的亡魂有時會想留下來。邀請他們當街坊，街上就多了幫手。", "yuelao"],
      [null, "街上熱鬧起來，地府的熟面孔也會搬來，各自帶著自己的店。", "yuelao"],
      [null, "我在紋身店裡。有事就來找我。", "yuelao"]
    ],
    goal: null }
];
