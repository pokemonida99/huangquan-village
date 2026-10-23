/* 三途川物語 ‧ 委託簿（線 C）
   劇中角色帶著心願來街上，條件湊齊就能完成。順序不限，也不照原劇章節。
   台詞格式見 data/chars.js 開頭。

   char      委託人（HQ.chars 的 id）
   ep        出處集數
   when      委託什麼時候出現在委託簿（全部成立）：同 chars 的 movein 鍵（resident / building / rank / helped / month / map / flag / request）
   need      完成條件（全部成立）：
               { building: id }               街上有這棟建築（id 照 B 的 data/buildings.js）
               { combo: id }                  緣分組合成立（B 的 HQ.combos）
               { trait: "安心", min: 50 }     街區特徵
               { resident: id }               某人已入住
               { action: "dream" }            在托夢照相館托夢一次
               { action: "tattoo" }           做一組愛戀文印
               { action: "macaron" }          在燒肉店吃遺願馬卡龍（委託人投胎離開）
               { action: "comfort" }          派慰靈犬／引渡貓去陪（街坊一週）
               { pay: n }                     付 n 功德
               { map: id }                    打倒該出征地點的王（id 照 B 的 HQ.mapLevels）
               { flag: id }                   事件旗標
               { helped: n }                  幫助人數
   reward    merit 功德、helped 幫助人數、money 冥紙、popularity 人氣、traits 特徵點、
             movein 讓某角色入住（id）、unlock 解鎖建築（id）、flag 立旗標、job 解鎖職業（B 的 HQ.jobs id）
   lines     完成時播的對話（開場 intro 在接委託時播）
*/
window.HQ = window.HQ || {};

HQ.requests = [
  /* ───────── 燒肉店的客人 ───────── */
  { id: "maoguai", char: "maoguai", ep: "EP1-01", title: "下輩子還要當你的狗",
    desc: "黑狗毛怪想念照顧她的阿姨。阿姨答應隔天給她雞腿，她沒等到。",
    when: { resident: "lee" },
    need: [{ building: "yakiniku" }, { resident: "xiaoyu" }, { action: "macaron" }],
    reward: { merit: 30, helped: 1, traits: { 思念: 3 } },
    intro: [
      ["EP1-01", "所以你脖子上的傷　是被硫酸弄的", "xiaoyu"],
      ["EP1-01", "嗯　我只是走在路上　一個陌生人忽然攻擊我"],
      ["EP1-01", "我喜歡像你這樣穿圍裙的人　他們都對我好"]
    ],
    lines: [
      ["EP1-01", "阿姨說隔天要給我吃雞腿　但是我沒等到"],
      ["EP1-01", "吃下遺願馬卡龍　你將完成心裡的執念", "xiaoyu"],
      ["EP1-01", "毛怪　我好想你", "阿姨"],
      ["EP1-01", "如果下輩子我還是狗　可不可以和你一起生活"],
      ["EP1-01", "當然好啊", "阿姨"]
    ] },

  { id: "xiaole", char: "xiaole", ep: "EP1-02", title: "聽不見的求救",
    desc: "小樂總是怕別人不開心。她需要有人陪著，才說得出自己真正想吃什麼。",
    when: { resident: "lee" },
    need: [{ building: "yakiniku" }, { combo: "dogtea" }, { action: "macaron" }],
    reward: { merit: 30, helped: 1, traits: { 安心: 3 } },
    intro: [
      ["EP1-02", "你好　我想用餐　這是我的許可"],
      ["EP1-02", "小樂小姐　請稍等", "lee"],
      ["EP1-02", "你們不是燒肉店嗎"]
    ],
    lines: [
      ["EP1-02", "如入火聚　得清涼門", "lee"],
      ["EP1-02", "獻上遺願馬卡龍　祝你用餐愉快", "lee"],
      ["EP1-02", "你沒有錯　你委屈了", "小樂的男友"],
      ["EP1-02", "我只是怕你不開心"],
      ["EP1-02", "其實我一直都不喜歡吃燒肉"],
      ["EP1-02", "我想吃壽司"],
      ["EP1-02", "好　我們吃壽司", "小樂的男友"]
    ] },

  { id: "daniu", char: "daniu", ep: "EP1-04", title: "我原諒你了",
    desc: "大牛是業鏡羅漢生前的兄弟。那個年代，他出賣了白李米店。他只想吃完馬卡龍、求老大原諒。",
    when: { resident: "lee", helped: 5 },
    need: [{ building: "yakiniku" }, { building: "swing" }, { action: "macaron" }],
    reward: { merit: 60, helped: 1, traits: { 安心: 4 } },
    intro: [
      ["EP1-04", "我可不可以進去"],
      ["EP1-04", "請", "lee"],
      ["EP1-04", "我想直接吃遺願馬卡龍"],
      ["EP1-04", "拜託你原諒我"]
    ],
    lines: [
      ["EP1-05", "阿嫂　阿嫂　你在哪裡"],
      ["EP1-05", "所以你沒找到白妹　卻被倒塌的米莊壓死了", "lee"],
      ["EP1-05", "老大　你不生氣嗎"],
      ["EP1-05", "傻兄弟　在那時候　誰都有可能出賣誰", "lee"],
      ["EP1-05", "安心投胎吧　祝你下輩子自由平安", "lee"],
      ["EP1-05", "謝謝你老大"]
    ] },

  { id: "moti", char: "moti", ep: "EP1-06", title: "盛開一次吧！勇敢的百合花",
    desc: "茉蒂嫌投胎麻煩，又不喜歡吃燒肉。先吃馬卡龍，再吃薯條。",
    when: { resident: "lee" },
    need: [{ building: "yakiniku" }, { building: "fries" }, { action: "macaron" }],
    reward: { merit: 30, helped: 1, traits: { 緣分: 3 } },
    intro: [
      ["EP1-06", "為什麼投胎這麼麻煩啊　我又不喜歡吃燒肉"],
      ["EP1-06", "我們可不是一家普通的燒肉店哦", "xiaoyu"],
      ["EP1-06", "燒肉店　端薯條給我"]
    ],
    lines: [
      ["EP1-06", "先吃遺願馬卡龍　再吃薯條　讓你幸福到飛天", "xiaoyu"],
      ["EP1-06", "最好是"],
      ["EP1-06", "薯條這種東西　永遠是別人手裡的好吃", "茉蒂的同學"],
      ["EP1-06", "我夢到自己偽裝十幾年的異性戀　最後痛苦的結婚生子　然後嗝屁"],
      ["EP1-06", "我知道你是同性戀　我還知道你喜歡我　想不想勇敢一次", "茉蒂的同學"],
      ["EP1-06", "跟男生接吻比起來如何", "茉蒂的同學"],
      ["EP1-06", "超讚的　男生超臭"]
    ] },

  { id: "abinmom", char: "abinmom", ep: "EP1-07", title: "歸不了根的落葉",
    desc: "九二一地震那天，媽媽沒能從瓦礫堆裡出來。她想托夢看看長大的阿斌。",
    when: { resident: "dabao" },
    need: [{ building: "yakiniku" }, { building: "photo" }, { action: "dream" }],
    reward: { merit: 40, helped: 1, traits: { 思念: 4 } },
    intro: [
      ["EP1-07", "對不起　我是外國人"],
      ["EP1-07", "沒事沒事　這片土地上　我們不分國籍", "xiaoyu"],
      ["EP1-07", "這是菲律賓朋友很喜歡的鴨仔蛋　請慢用", "xiaoyu"],
      ["EP1-07", "謝謝　好久沒吃了"]
    ],
    lines: [
      ["EP1-07", "阿斌"],
      ["EP1-07", "你走之後　爸爸一直喝酒　同學都欺負我", "阿斌"],
      ["EP1-07", "對不起　媽媽沒有保護你"],
      ["EP1-07", "媽媽要去天主那邊了　看到你平安長大　我很開心"],
      ["EP1-07", "在天堂還能遇到你嗎", "阿斌"],
      ["EP1-07", "媽媽會等你"]
    ] },

  { id: "laoren", char: "laoren", ep: "EP1-10", title: "爺爺祝你生日快樂",
    desc: "獨居的爺爺手邊放著一個寫著「生日快樂」的紅包，還沒送出去。",
    when: { resident: "lee" },
    need: [{ building: "yakiniku" }, { trait: "思念", min: 20 }, { action: "macaron" }],
    reward: { merit: 40, helped: 1, traits: { 思念: 4 } },
    intro: [
      ["EP1-10", "有好吃嗎？", "lee"],
      ["EP1-10", "很讚　不過這樣會很貴嗎？"],
      ["EP1-10", "帶這塊木牌來　不用付錢　安啦", "lee"]
    ],
    lines: [
      ["EP1-10", "「遺願馬卡龍」可以圓滿靈魂生前未了的遺憾", "字卡"],
      ["EP1-10", "怎麼是公車"],
      ["EP1-10", "沒啦　你跟我過世的阿公很像", "年輕人"],
      ["EP1-10", "你爺爺如果看到　一定會很開心的"],
      ["EP1-10", "這個紅包給你　爺爺要下車了"],
      ["EP1-10", "阿公", "年輕人"],
      ["EP1-10", "乖孫長這麼大了　我很快樂"]
    ] },

  { id: "waipo", char: "waipo", ep: "EP1-11", title: "終於夢到您",
    desc: "外婆要去投胎了，走之前想托夢看看一個人吃便當的外孫。",
    when: { resident: "dabao" },
    need: [{ building: "photo" }, { action: "dream" }],
    reward: { merit: 30, helped: 1, traits: { 思念: 3 } },
    lines: [
      ["EP1-11", "這個飯放太久了　不要再吃了"],
      ["EP1-11", "外婆要去投胎了　走之前來看看你"],
      ["EP1-11", "你該玩就玩　愛做啥就做啥"],
      ["EP1-11", "這樣哪天再相遇　可以和她分享後來遇到什麼有趣的事情"]
    ] },

  /* ───────── 返魂坂 ───────── */
  { id: "touqi", char: "baimei", ep: "EP1-14", title: "頭七套餐",
    desc: "頭七的靈魂有一次托夢的機會。先在碧落髮廊整理儀容，再去隔壁拍照。",
    when: { resident: "baimei" },
    need: [{ combo: "touqi" }, { action: "dream" }],
    reward: { merit: 50, helped: 1, traits: { 儀容: 5 } },
    intro: [
      [null, "返魂坂的托夢照相館：讓頭七的靈魂有一次托夢的機會", "字卡"],
      ["EP1-14", "今天是我的頭七", "dabao"]
    ],
    lines: [
      ["EP1-14", "給你喝　這是蓬萊仙島最暢銷的飲料", "髮廊女店員"],
      ["EP1-14", "這不就水嗎？　也沒料啊", "dabao"],
      ["EP1-14", "這杯飲料不能隨便批評　會被判官起訴哦"],
      ["EP1-14", "靈魂都想漂亮的回去　看自己思念的人　在碧落髮廊能讓靈魂變的美美的唷"],
      ["EP1-14", "好啦　快去隔壁拍照吧"]
    ] },

  { id: "baimei-wait", char: "baimei", ep: "EP1-15", title: "你終於來了",
    desc: "髮廊的紫髮理髮師說，她等一個人等了幾十年。",
    when: { resident: "baimei" },
    need: [{ resident: "lee" }, { resident: "dabao" }, { trait: "思念", min: 30 }],
    reward: { merit: 100, helped: 1, traits: { 緣分: 6, 思念: 4 } },
    intro: [
      ["EP1-14", "我等了他幾十年"]
    ],
    lines: [
      ["EP1-15", "幫我剪頭髮的理髮師也很慘　等不到他思念的人", "dabao"],
      ["EP1-15", "不是彩花　是一個紫色頭髮的漂亮女生　戴黑框眼鏡", "dabao"],
      ["EP1-15", "紫頭髮戴眼鏡", "lee"],
      ["EP1-15", "小雨你顧一下店", "lee"],
      ["EP1-15", "難道是你　拜託是你", "lee"],
      ["EP1-15", "你終於來了", "lee"],
      ["EP1-15", "抱我啊"]
    ] },

  { id: "baimei-portrait", char: "baimei", ep: "EP3-04", title: "沒拍成的婚紗照",
    desc: "地府沒有能留下影像的相機。活著的時候沒拍婚紗照，那就請人畫一張。",
    when: { request: "baimei-wait" },
    need: [{ building: "gecko" }, { trait: "藝術", min: 30 }, { resident: "yutong" }],
    reward: { merit: 60, helped: 1, popularity: 30, traits: { 藝術: 5, 緣分: 3 } },
    intro: [
      ["EP3-03", "地府沒有能夠留下影像的相機　想留下紀念只能靠畫畫", "lee"]
    ],
    lines: [
      ["EP3-04", "活著的時候　沒跟你拍婚紗照　現在有神明幫我們畫", "lee"],
      ["EP3-04", "老夫老妻了　說這些幹嘛"],
      ["EP3-04", "我畫完了！", "yutong"],
      ["EP3-04", "兩張都好漂亮哦"],
      ["EP3-04", "還真難分出輸贏", "lee"]
    ] },

  { id: "heitang-orange", char: "heitang", ep: "EP2-01", title: "對彼此都放心不下",
    desc: "黑糖倒在雨裡之前，一直叫身旁的橘貓別吃毒糖。牠想知道橘子現在好不好。",
    when: { resident: "heitang" },
    need: [{ building: "photo" }, { action: "dream" }],
    reward: { merit: 30, helped: 1, job: "dog", traits: { 安心: 4 } },
    intro: [
      ["EP2-01", "綠色的糖有毒……　你別吃……"],
      ["EP2-01", "有車……快跑……"]
    ],
    lines: [
      ["EP2-01", "心裡想著你思念的對象　只要他沒死就可以", "dabao"],
      ["EP2-01", "托夢嗎？"],
      ["EP2-01", "希望他沒事"],
      ["EP2-01", "我們來幫你們", "救援的女子"],
      ["EP2-01", "跟他們走"],
      ["EP2-01", "（真的）不能一起嗎？", "橘子"],
      ["EP2-01", "跟著人類有家住　有罐罐吃"],
      ["EP2-01", "只要你在地府做好慰靈犬的工作　等功德夠了　就能再來找我托夢", "dabao"]
    ] },

  /* ───────── 紋身店 ───────── */
  { id: "du-door", char: "du", ep: "EP2-02", title: "杜先生與慰靈犬",
    desc: "求婚成功隔天被毒駕撞死的杜先生，到地府後足不出戶。引渡貓和慰靈犬要合作。",
    when: { resident: "heitang" },
    need: [{ resident: "mimi" }, { resident: "heitang" }, { building: "bench" }, { action: "comfort" }],
    reward: { merit: 40, helped: 1, movein: "du", traits: { 安心: 5 } },
    intro: [
      ["EP2-02", "求婚成功　隔天被毒駕撞死的杜先生　到地府後足不出戶　該怎麼幫他走出來呢", "heitang"],
      ["EP2-02", "杜先生在家嗎？", "heitang"],
      ["EP2-02", "我不需要慰靈犬"]
    ],
    lines: [
      ["EP2-02", "引渡貓和慰靈犬要合作　幫助靈魂適應地府", "mimi"],
      ["EP2-02", "杜先生從下車那瞬間　就散發濃鬱的悲傷氣感　這一單不好處理哦", "mimi"],
      ["EP2-03", "不是說我不需要！"],
      ["EP2-03", "啊等一下　太快了啦"],
      ["EP2-03", "謝謝你們　我會努力走出來"]
    ] },

  { id: "du-interview", char: "du", ep: "EP2-04", title: "月老紋身的新人",
    desc: "只有對紋身有強烈執念的人，才能在月老紋身工作。",
    when: { resident: "du" },
    need: [{ resident: "yuelao" }, { building: "tattoo" }, { trait: "緣分", min: 30 }],
    reward: { merit: 40, helped: 1, job: "tattooapp", traits: { 緣分: 5 } },
    lines: [
      ["EP2-04", "你好　我是受邀前來面試的"],
      ["EP2-04", "懂紋身嗎？", "yuelao"],
      ["EP2-04", "在世時候得過幾次獎"],
      ["EP2-04", "要對紋身有強烈執念的人　才可以在這工作　你有膽接嗎？", "yuelao"],
      ["EP2-04", "我想幫助相愛的人"],
      ["EP2-04", "你還沒有神格　一天只能做一次文印　超過一次你會魂飛魄散", "yuelao"],
      ["EP2-04", "三途川分店就交給你了", "yuelao"]
    ] },

  { id: "couple", char: "couple", ep: "EP2-04", title: "情比金堅的月老紋身",
    desc: "一對戀人預約了愛戀文印，想一起過奈何橋。",
    when: { building: "tattoo" },
    need: [{ building: "tattoo" }, { action: "tattoo" }],
    reward: { merit: 60, helped: 2, traits: { 緣分: 6 } },
    lines: [
      ["EP2-04", "用情至深的靈魂　可用300功德值　在我這求取愛戀文印", "yuelao"],
      ["EP2-04", "希望這次我們投胎到一個沒有歧視的地方"],
      ["EP2-04", "文印可以跨越輪迴　即便過奈何橋也不會消散", "yuelao"]
    ] },

  { id: "du-tulip", char: "du", ep: "EP2-13", title: "給筱晴的鬱金香",
    desc: "鑽戒太貴，筱晴想要一對定情紋身，圖案是漂亮的鬱金香。杜先生想把一朵鬱金香送到她夢裡。",
    when: { resident: "du" },
    need: [{ building: "flower" }, { resident: "huji" }, { action: "dream" }],
    reward: { merit: 50, helped: 1, traits: { 思念: 5, 緣分: 3 } },
    intro: [
      ["EP2-02", "結婚鑽戒你要幾克拉"],
      ["EP2-02", "鑽戒那麼貴　你幫我們設計一對定情紋身好不好", "xiaoqing"],
      ["EP2-02", "鬱金香　我要漂亮的鬱金香", "xiaoqing"]
    ],
    lines: [
      ["EP2-13", "改天你遇到筱晴　幫我把這朵鬱金香給她"],
      ["角色短片-03", "今天是你的頭七　你會不會回來兌現承諾", "xiaoqing"],
      ["EP2-10", "我昨天夢到杜哥　他說他在地府經營紋身店", "xiaoqing"],
      ["EP2-10", "不知道　他只說紋身可以跟戀人跨越輪迴　讓戀人白頭偕老　還能延長生死簿的壽命", "xiaoqing"]
    ] },

  { id: "huji-dream", char: "huji", ep: "EP2-06", title: "我等你三輩子",
    desc: "狐姬付了三倍的功德，要三倍的托夢時間。",
    when: { resident: "huji" },
    need: [{ building: "photo" }, { pay: 30 }, { action: "dream" }],
    reward: { helped: 1, traits: { 緣分: 5, 思念: 3 } },
    intro: [
      ["EP2-06", "我要托夢"],
      ["EP2-06", "不是頭七的話　要付十點功德", "dabao"],
      ["EP2-06", "我要三倍托夢時間"]
    ],
    lines: [
      ["EP2-06", "三十功德　正常人要存一年", "dabao"],
      ["EP2-06", "是什麼人　值得你這樣去見他", "dabao"],
      ["EP2-06", "是我等了三輩子的人"],
      ["EP2-06", "為什麼我每次心情不好　都會夢到你", "akasaka"],
      ["EP2-06", "因為我感受得到你傷心"],
      ["EP2-06", "老樣子　來支忘憂舞吧"],
      ["EP2-06", "我只想要你寬心"]
    ] },

  { id: "heitang-mimi", char: "yutong", ep: "EP4-01", title: "幫黑糖跟小咪牽紅線",
    desc: "語彤剛到地府時，是黑糖和小咪安慰她的。",
    when: { resident: "heitang", request: "du-door" },
    need: [{ building: "tattoo" }, { resident: "mimi" }, { trait: "緣分", min: 50 }, { action: "tattoo" }],
    reward: { merit: 50, helped: 2, traits: { 緣分: 6, 安心: 3 } },
    intro: [
      ["EP2-03", "咪咪跟黑糖很好　是不是談戀愛了", "dabao"],
      ["EP2-03", "什麼戀愛", "xiaoyu"]
    ],
    lines: [
      ["EP4-01", "黑糖　謝謝你和小咪當初安慰我　幫你跟小咪牽紅線好不？"],
      ["EP2-02", "散個步吧　我們聊聊", "mimi"]
    ] },

  /* ───────── 燒肉店的人 ───────── */
  { id: "xiaoyu-flag", char: "xiaoyu", ep: "SP1-01", title: "誰拜蟑螂給我",
    desc: "小雨收到一盒供品，打開是一整盒蟑螂。她想請假回陽間看看是誰拜的。",
    when: { resident: "xiaoyu" },
    need: [{ building: "cityhall" }, { resident: "xiaomi" }, { pay: 10 }],
    reward: { merit: 20, helped: 1, popularity: 10, flag: "lingqi", traits: { 思念: 3 } },
    intro: [
      ["SP1-01", "這是你的供品", "lee"],
      ["SP1-01", "誰拜給我一堆蟑螂啊"],
      ["SP1-01", "明天我想請假　我要去看是誰拜蟑螂給我"],
      ["SP1-01", "記得跟使者申請令旗", "lee"]
    ],
    lines: [
      ["SP1-01", "記得盯咪咪多喝水　它腎不好"],
      ["SP1-01", "咪咪"]
    ] },

  { id: "lee-hate", char: "yutong", ep: "EP3-11", title: "讓恨融合成一首歌",
    desc: "街上的魔氣讓語彤心裡的恨又浮上來。業鏡羅漢也有魔性。",
    when: { resident: "lee" },
    need: [{ resident: "lee" }, { trait: "魔氣", min: 30 }, { trait: "安心", min: 40 }],
    reward: { merit: 150, helped: 1, traits: { 安心: 6, 魔氣: -10 } },
    lines: [
      ["EP3-11", "原來你也有魔性"],
      ["EP3-11", "那你怕我嗎？", "lee"],
      ["EP3-11", "70多年前　我無法看著村裡的百姓餓死　偷賣米給窮人　結果卻被徵糧的外省人槍斃", "lee"],
      ["EP3-11", "我跟你一樣　到地府第一天就去要黑令旗　我至今仍無法原諒", "lee"],
      ["EP3-11", "對不起　我會試著放下仇恨"],
      ["EP3-11", "不　要控制恨　就是要承認自己恨", "lee"],
      ["EP3-11", "讓恨與你融合成一首動人的歌", "lee"],
      ["EP3-11", "裡面有一些功德　拿去見想見的人吧", "lee"]
    ] },

  { id: "dabao-north", char: "dabao", ep: "EP2-08", title: "一家人去北境玩",
    desc: "吃過北境的菩提麻糬，大寶就好想去北境玩。船票一人三十功德，四個人。",
    when: { resident: "dabao", rank: 5 },
    need: [{ resident: "xiaoyu" }, { resident: "mimi" }, { resident: "heitang" }, { map: "north" }, { pay: 120 }],
    reward: { helped: 1, popularity: 80, traits: { 安心: 10, 思念: 5 } },
    intro: [
      ["EP2-08", "吃過北境的菩提麻糬　看到一閃而過的北境風景　就好想去北境玩"],
      ["EP2-08", "我們四個加起來　只有十一點功德", "xiaoyu"],
      ["EP2-08", "但是去北境的船票　一人要三十", "xiaoyu"]
    ],
    lines: [
      ["EP2-11", "等我和白妹回來　你們一家也去北境玩吧", "lee"],
      ["EP2-11", "這樣就可以去北境了"],
      ["EP2-13", "很放鬆　感覺靈魂都會被淨化", "huji"],
      ["EP2-13", "跟心愛之人一起去會更開心", "huji"]
    ] },

  /* ───────── 語彤與陽間 ───────── */
  { id: "yutong-dream", char: "yutong", ep: "EP3-07", title: "你要記得量血壓",
    desc: "語彤想托夢回家。狐姬說，資質好的女生想漂亮，藏拙就好。",
    when: { resident: "huji" },
    need: [{ building: "salon" }, { resident: "huji" }, { building: "photo" }, { action: "dream" }],
    reward: { merit: 40, helped: 1, traits: { 儀容: 4, 思念: 4 } },
    intro: [
      ["EP3-06", "我想托夢"],
      ["EP3-06", "小妹妹　想要什麼樣的造型", "huji"],
      ["EP3-06", "方便托夢和參加愛神祭就好　我對妝造沒什麼研究"],
      ["EP3-06", "改一下髮色　再換隱形眼鏡　尤其這塊胎記　有種不對稱的美　再換個穿搭", "huji"],
      ["EP3-06", "這是我嗎"],
      ["EP3-06", "我給這身妝容取名為「赤戀星空」", "huji"]
    ],
    lines: [
      ["EP3-07", "彤彤　今天怎麼穿便服哦　還畫這麼好看　要跟柏宏約會哦？", "linbobo"],
      ["EP3-07", "你早上有沒有記得量血壓"],
      ["EP3-07", "爸爸沒用　不該讓你成為那麼有正義感的人", "linbobo"],
      ["EP3-07", "你是最好的爸爸　是壞人不好"],
      ["EP3-07", "有空再回來看你　你不能因為我受傷哦"],
      ["EP3-07", "彤彤！", "linbobo"]
    ] },

  { id: "linbobo-61", char: "linbobo", ep: "EP3-14", title: "第六十一籤",
    desc: "美濃的業鏡羅漢殿只有六十支籤。林伯伯抽到了第六十一籤。",
    when: { resident: "yuelao", helped: 20 },
    need: [{ helped: 20 }, { trait: "香火", min: 15 }],
    reward: { merit: 100, helped: 1, unlock: "temple", traits: { 香火: 10 } },
    lines: [
      ["EP3-14", "這就是業鏡羅漢殿"],
      ["EP3-14", "要幫你解籤嗎？", "廟公"],
      ["EP3-14", "第六十一籤！", "廟公"],
      ["EP3-14", "上個月神明跟我說　要幫他做一間月老廟", "廟公"],
      ["EP3-14", "他說金身呢　會有一個師傅帶著六十一籤來做", "廟公"],
      ["EP3-14", "拿到六十一籤的人不多嗎"],
      ["EP3-14", "沒　我們只有六十籤", "廟公"],
      ["EP3-14", "請業鏡羅漢保佑　保佑我家彤彤無病無痛"],
      ["EP3-14", "為師送你的入門禮　一座月老廟", "yuelao"],
      ["EP3-14", "你可以拿神牌穿梭陰陽界　也可以受生靈的香火　更快累積功德", "yuelao"],
      ["EP3-14", "我抱不到爸爸　借我抱一下啦", "yutong"]
    ] },

  { id: "bohong-radar", char: "bohong", ep: "EP3-15", title: "暈船雷達",
    desc: "上任店長的筆記，把文印和孟婆的遺忘咒結合在一起。語彤想做一枚戒指給柏宏。",
    when: { building: "temple" },
    need: [{ building: "tattoo" }, { resident: "du" }, { resident: "yangzi" }, { action: "dream" }],
    reward: { merit: 60, helped: 1, flag: "radar", traits: { 緣分: 5 } },
    intro: [
      ["EP3-15", "上任店長竟然想到　將文印和孟婆的遺忘咒做結合　真是太厲害了", "yuelao"],
      ["EP3-15", "這樣就可以幫筱晴找對象　同時把我忘掉", "du"],
      ["EP3-15", "遺忘有比記住更好嗎", "yuelao"],
      ["EP3-15", "你沒聽過　最好的前任　就要像死了一樣嗎", "yutong"]
    ],
    lines: [
      ["EP3-15", "你在跟我求婚嗎　我不排斥跟你冥婚哦"],
      ["EP3-15", "這是我發明的暈船雷達", "yutong"],
      ["EP3-15", "這個戒指可以讓你　遇到有共鳴靈魂時　聞到特別的香味", "yutong"],
      ["EP3-15", "但兩人若分隔太遠太久　也會因為這個雷達　忘記對方的一切", "yutong"],
      ["EP3-15", "生死簿上　你的陽壽還很多", "yutong"],
      ["EP3-15", "你憑什麼替我做決定"]
    ] },

  { id: "bohong-love", char: "bohong", ep: "EP3-17", title: "神明不能違心",
    desc: "月老廟裡供著林伯伯雕的女月老。柏宏在神像前問了一句話。",
    when: { request: "bohong-radar" },
    need: [{ building: "temple" }, { trait: "香火", min: 40 }],
    reward: { merit: 80, helped: 1, traits: { 香火: 6, 緣分: 4 } },
    lines: [
      ["EP3-17", "林伯伯　你把語彤雕的好漂亮"],
      ["EP3-17", "語彤在那邊過得很好　我們就祝福她吧", "linbobo"],
      ["EP3-17", "你還愛我嗎？"],
      ["EP3-17", "神明不可以違心　愛就要老實", "yuelao"],
      ["EP3-17", "況且你現在是實習月老　如果他頻繁吵你　你也可以挑優秀的信徒跟他配對", "yuelao"],
      ["EP3-17", "好啦", "yutong"],
      ["EP3-17", "是你嗎　林語彤"]
    ] },

  { id: "mi-health", char: "mi", ep: "EP3-17", title: "想成為健康的守宮",
    desc: "謎天生走路不穩，從來沒有一次就吃到食物。愛染明王送的仿製甘露寶瓶只能用一次。",
    when: { resident: "mi" },
    need: [{ flag: "ganlu" }, { building: "photo" }, { action: "dream" }],
    reward: { merit: 50, helped: 1, traits: { 藝術: 4, 安心: 4 } },
    intro: [
      ["EP3-08", "我想存功德去吃遺願馬卡龍"],
      ["EP3-08", "在投胎時間到前　沒有吃的話就會隨機投胎"],
      ["EP3-08", "我希望投胎成一隻健康的守宮　在主人面前正常的狩獵"],
      ["EP3-08", "動物也是有很多煩惱呀", "yutong"]
    ],
    lines: [
      ["EP3-17", "怎樣　感覺有變好嗎", "yutong"],
      ["EP3-17", "世界不再旋轉了"],
      ["EP3-17", "我從來沒有一次就吃到食物　我要趕快給主人托夢"],
      ["EP3-17", "跟明王說的一樣　仿製的只能用一次", "yutong"]
    ] },

  /* ───────── 孟婆甜食屋 ───────── */
  { id: "no7-stage", char: "baimei", ep: "EP4-06", title: "艾絲梅拉達",
    desc: "白妹念書時很愛演話劇，可是沒有人陪她演。七號以前是知名演員。",
    when: { resident: "no7" },
    need: [{ building: "costume" }, { resident: "no7" }, { trait: "娛樂", min: 30 }],
    reward: { merit: 60, helped: 1, popularity: 40, traits: { 藝術: 5, 娛樂: 5 } },
    intro: [
      ["EP4-05", "就要這套　可是沒有人陪我演話劇"],
      ["EP4-05", "是說為什麼七號會從知名演員變成甜點店員工"],
      ["EP4-03", "很多人類說我們是沒有靈魂的魂偶　說我們會搶走人類靈魂的工作", "no7"]
    ],
    lines: [
      ["EP4-06", "如今我再向聖母祈禱　又有什麼用？"],
      ["EP4-06", "噢　路西法　只要一次就好　請讓我……　將手指滑過她的秀髮　艾絲梅拉達", "no7"],
      ["EP4-06", "演戲開心嗎", "no7"],
      ["EP4-06", "你也太強了吧　而且你是不是有改動作"],
      ["EP4-06", "你應該多出來演戲的　待在甜點店感覺太委屈了"],
      ["EP4-06", "但謝謝你找我演戲　你讓我想起二號還在的時候　希望還能有下次", "no7"],
      ["EP4-06", "沒問題"]
    ] },

  { id: "yuelao-mochi", char: "yuelao", ep: "月老外傳-05", title: "忘不了的糯米糍",
    desc: "月老每次去孟婆甜食屋，都一個人坐一整個下午。",
    when: { resident: "yangzi" },
    need: [{ building: "mengpo" }, { resident: "yangzi" }, { trait: "思念", min: 50 }],
    reward: { merit: 50, helped: 1, traits: { 思念: 6 } },
    intro: [
      ["EP4-03", "7號你看　他又偷瞄我了", "yangzi"],
      ["EP4-03", "喜歡我就來找我說話啊　每次來一整個下午　就坐在那邊", "yangzi"],
      ["EP4-03", "我感應得到　他的心情很複雜", "no7"],
      ["EP4-03", "這個嘛　討厭是沒有感受到", "no7"]
    ],
    lines: [
      ["月老外傳-05", "打完魏國之後　你們有在一起嗎？", "yutong"],
      ["月老外傳-05", "秦王怕我失敗　在我打仗的時候　仍將陰曼嫁去楚國"],
      ["月老外傳-05", "我要在你腳上寫個慘字", "yutong"],
      ["月老外傳-05", "後來……我就再也沒見到過她　但我仍忘不了　她為我做的糯米糍"],
      ["月老外傳-05", "糯米糍做法已交與廚娘　待你凱旋可食　勿念　陰曼", "字卡"],
      ["月老外傳-07", "今天還剩一包糯米糍"],
      ["月老外傳-07", "不過能這樣遠遠看著她開心　我已經很滿足了"]
    ] },

  /* ───────── 魔界的外賓 ───────── */
  { id: "nova-art", char: "leviathan", ep: "EP4-02", title: "望女成龍",
    desc: "利維坦想讓養女諾瓦學一項才藝，才能進維納斯的藝術學院。",
    when: { flag: "leviathan-visit" },
    need: [{ building: "gecko" }, { trait: "藝術", min: 40 }],
    reward: { merit: 80, helped: 1, movein: "nova", traits: { 藝術: 6 } },
    intro: [
      ["EP4-02", "諾瓦是獨角鯨魔族的遺孤　他們原有五百隻鯨魚　是我國北方海域　在百鯨落最彪悍的戰鬥民族　長久保護第二王國不被侵擾"],
      ["EP4-02", "諾瓦不喜歡戰鬥　但她已到了要上學的年紀　我怕她在魔界的戰爭學校被欺負"],
      ["EP4-02", "維納斯的藝術學院接受惡魔　但前提是諾瓦要學會一項才藝"]
    ],
    lines: [
      ["EP4-03", "我把爸爸燒給我的漫畫　整理起來開了一家店", "yutong"],
      ["EP4-03", "從喜歡的事情入手　是最容易維持熱情的", "yutong"],
      ["EP4-07", "阿瑪特拉斯", "nova"],
      ["EP4-07", "這個畫技不太ok耶　讓他走法蘭西斯·培根的黑暗抽象風　或許有機會", "yutong"],
      ["EP4-07", "不行　望女成龍感覺還是很難辦", "yutong"],
      ["EP4-07", "難辦啊　那就別辦了"]
    ] },

  { id: "nova-yangjian", char: "nova", ep: "EP4-08", title: "去陽間走走",
    desc: "語彤帶諾瓦去陽間看人類的畫展。中元節陽間磁場很亂。",
    when: { resident: "nova", building: "temple" },
    need: [{ building: "temple" }, { map: "seaside" }],
    reward: { merit: 60, helped: 1, traits: { 藝術: 5, 思念: 4 } },
    lines: [
      ["EP4-08", "人類的世界好漂亮哦　這麼脆弱的建築　在魔界撐不到三天就毀了"],
      ["EP4-08", "正是因為我們脆弱　才會把希望和心情寄託在藝術裡", "yutong"],
      ["EP4-08", "我也想我媽媽　想念她帶我在海裡抓烏賊"],
      ["EP4-08", "那我媽媽和族人死去的戰場　能不能叫五百份"],
      ["EP4-08", "開玩笑的啦　我們惡魔才不會懷念逝去的同胞"],
      ["EP4-08", "承認自己脆弱　才能真的變強哦　這是我乾爹教我的", "yutong"]
    ] },

  { id: "nova-exhibit", char: "nova", ep: "EP4-19", title: "諾瓦的畫展",
    desc: "把厭戰的心情畫下來，傳遞給魔界諸國。",
    when: { request: "nova-yangjian" },
    need: [{ combo: "artzone" }, { trait: "藝術", min: 80 }, { map: "demon2" }],
    reward: { merit: 200, helped: 3, popularity: 80, traits: { 藝術: 10 } },
    lines: [
      ["EP4-19", "我看了這幅「鯨落」　就不想再打仗了", "魔族觀眾"],
      ["EP4-19", "我這樣可以去你的學院念書嗎"],
      ["EP4-19", "勉強及格", "aphrodite"],
      ["EP4-19", "抱歉　第一次辦畫展", "leviathan"],
      ["EP4-19", "在嫉妒王國辦藝術活動　真有創意", "aphrodite"],
      ["EP4-19", "是小月老提議的　她說這樣可以把厭戰的心情　傳遞給魔界諸國", "leviathan"]
    ] },

  { id: "leviathan-sushi", char: "leviathan", ep: "EP4-10", title: "葬壽司的扭蛋",
    desc: "今天葬壽司和愛神祭聯名，五個空盤可以玩一次扭蛋，裡面有狐姬的徽章。",
    when: { building: "sushi", resident: "huji", guest: "leviathan" },
    need: [{ building: "sushi" }, { resident: "huji" }, { resident: "yuelao" }],
    reward: { merit: 30, helped: 1, money: 800, popularity: 30, traits: { 娛樂: 5 } },
    lines: [
      ["EP4-10", "5個空盤可以玩一次扭蛋　今天本店跟愛神祭聯名　裡面有狐姬的徽章", "壽司師傅"],
      ["EP4-10", "那還等什麼　我all in"],
      ["EP4-10", "維納斯　埃及神　老頭　這誰　怎麼還有你"],
      ["EP4-10", "你這個詐騙集團"],
      ["EP4-10", "我抽到狐姬了", "yuelao"],
      ["EP4-10", "可不可以交換"],
      ["EP4-10", "不要", "yuelao"]
    ] },

  /* ───────── 華佗 ───────── */
  { id: "huatuo-dance", char: "huatuo", ep: "EP5-21", title: "華佗的忘憂舞",
    desc: "只要在心裡默念忘憂舞的咒語，誠心希望對方快樂，就能為對方緩解憂愁。",
    when: { resident: "huatuo" },
    need: [{ building: "festival" }, { trait: "娛樂", min: 60 }],
    reward: { merit: 100, helped: 3, popularity: 60, traits: { 安心: 10, 娛樂: 6 } },
    lines: [
      ["EP5-21", "各位觀眾　大家晚安　我是華佗"],
      ["EP5-21", "希望各位今晚　能享受忘憂舞的快樂"],
      ["EP5-21", "華佗加油！", "觀眾"],
      ["EP5-21", "make noise"],
      ["EP5-21", "把會場炸翻吧"],
      ["EP5-15", "只要在心裡默念忘憂舞的咒語　並誠心希望對方快樂　就能為對方緩解憂愁", "字卡"]
    ] },

  /* ───────── 庚寅地球・高熊市（出征時接） ───────── */
  { id: "dulao-masks", char: "dulao", ep: "EP5-14", title: "口罩方舟計畫",
    desc: "天使給杜老大的考驗，是引導迷途的人們向善。他想讓兄弟走正路。",
    when: { map: "gengyin" },
    need: [{ map: "gengyin" }, { trait: "秩序", min: 40 }, { resident: "yuelao" }],
    reward: { merit: 100, helped: 5, money: 2000, traits: { 秩序: 8 } },
    intro: [
      ["EP5-08", "天使給我的考驗是引導迷途的人們向善　但又不給我像摩西分海的神力"],
      ["EP5-08", "我想讓兄弟走正路　但我開飲料店和便當店都一直虧錢　我又只會紋身　而紋身是太難的技術　很難讓兄弟短時間學到賺錢的技術"]
    ],
    lines: [
      ["EP5-08", "讓兄弟把錢都拿出來買口罩　等疫情爆發　再拿出來以原價賣", "yuelao"],
      ["EP5-08", "兄弟就能靠做善事賺錢而獲得成就感　就能讓兄弟有從良的本錢", "yuelao"],
      ["EP5-14", "這次的口罩方舟計畫　會以各行政區的大廟為中心發放　並以身分證尾數為發送口罩的基準　降低群聚風險"],
      ["EP5-14", "我們黑龍集團會陪全國人民　一起度過這末日般的疫情"]
    ] },

  { id: "liangan-tattoo", char: "liangan", ep: "EP5-20", title: "三層文印",
    desc: "梁安恆覺得自己配不上林怡曼。月老答應過，離開這個世界前一定幫他們弄一組愛戀文印。",
    when: { map: "gengyin" },
    need: [{ map: "gengyin" }, { resident: "yuelao" }, { building: "tattoo" }, { action: "tattoo" }],
    reward: { merit: 150, helped: 2, traits: { 緣分: 8 } },
    intro: [
      ["EP5-01", "像我們這種窮家庭　沒有犯錯的資格"],
      ["EP5-01", "難過就哭　累了就休息　害怕就找人幫忙　人又不是樹木　為什麼非要一個人撐著", "yuelao"],
      ["EP5-03", "我配不上她"],
      ["EP5-03", "你替她決定你不值得　對她的喜歡才最不公平", "yuelao"]
    ],
    lines: [
      ["EP5-07", "你太完美了　我喜歡有缺點的安恆", "yiman"],
      ["EP5-20", "會不會痛？　我有點怕", "yiman"],
      ["EP5-20", "文印是直接刺在靈魂　不會痛哦", "yuelao"],
      ["EP5-20", "文印不只能讓人更愛彼此　還能跨越輪迴不消散", "dulao"],
      ["EP5-20", "真的很白目　你回去要幸福哦", "yiman"]
    ] },

  { id: "tiedan-fate", char: "tiedan", ep: "EP5-18", title: "鐵蛋的姻緣",
    desc: "小靈媒想要一個條件跟大廟帥哥一樣好的男生。",
    when: { map: "gengyin" },
    need: [{ map: "xinkujiang" }, { building: "temple" }, { trait: "緣分", min: 60 }],
    reward: { merit: 60, helped: 1, popularity: 20, traits: { 緣分: 4 } },
    intro: [
      ["EP5-13", "可以給我條件跟你一樣好的男生嗎"],
      ["EP5-13", "你還是孤獨終老吧", "yuelao"]
    ],
    lines: [
      ["EP5-18", "你還沒幫我算姻緣　你也沒幫我買冰淇淋　神明有這麼小氣的嗎"],
      ["EP5-18", "這感情線不太妙呀　你在25歲前可能都沒有戀愛運", "yuelao"],
      ["EP5-18", "25歲之後就有機會嗎"],
      ["EP5-18", "25歲之後你就習慣了", "yuelao"],
      ["EP5-18", "我去你的哈密瓜"],
      ["EP5-20", "鐵蛋妹　我和這的月老　在北部的鳳息宮找到一名單身的帥乩童　跟你配對", "yuelao"],
      ["EP5-20", "北部好遠哦"]
    ] },

  { id: "liangan-mom", char: "liangan", ep: "EP5-10", title: "我們能不能彼此誠實",
    desc: "安恆什麼都不說，媽媽也什麼都不說。",
    when: { request: "liangan-tattoo" },
    need: [{ map: "gengyin" }, { trait: "安心", min: 60 }],
    reward: { merit: 80, helped: 2, traits: { 安心: 6 } },
    lines: [
      ["EP5-03", "我們不要提前恐懼　麻煩的事情總會以意想不到的方式解決", "yuelao"],
      ["EP5-10", "阿恆你終於回來啦　是媽媽給你太多壓力", "梁安恆的媽媽"],
      ["EP5-10", "我好想念你黏著媽媽的時候　而且媽媽只想你平安長大", "梁安恆的媽媽"],
      ["EP5-10", "你去年動手術切腫瘤　為什麼騙我跟朋友出國玩"],
      ["EP5-10", "媽我愛你　但以後我們能不能互相誠實"],
      ["EP5-10", "媽媽答應你", "梁安恆的媽媽"]
    ] }
];
