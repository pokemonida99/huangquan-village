/* 三途川物語 ‧ 出征地點、外圍、街區保衛戰（線 C）
   地點 id、敵人 id、推薦等級、旅費都照 B 的 data/jobs.js（HQ.enemies、HQ.mapLevels、HQ.travelCost、HQ.travelMerit）。
   台詞格式見 data/chars.js 開頭。說話者是「還沒入住的街坊」的那句，引擎可以跳過不播。

   open      開放條件：{ start: true } | { rank: ☆ } | { month: 7 }（只在該月開放）| 可再加 flag / building
   enemies   一般敵人 id（隨機組隊）
   mid       中頭目（打倒後才出王）
   boss      王 id
   helpers   在地援手（HQ.chars id）。出征時自動加入隊伍、不佔 9 人名額；need 寫加入條件
   lines     intro 出發抵達、mid 中頭目、boss 王登場、clear 打倒王、epilogue 另一個條件成立後補播
   reward    第一次打倒王：flag、guest（外賓加入）；入住由 chars.movein.map 判斷
*/
window.HQ = window.HQ || {};

HQ.maps = [
  { id: "daoju", name: "刀鋸地獄", open: { start: true },
    desc: "業鏡羅漢和泡芙以前工作的地方。罪人在這裡受刑。",
    enemies: ["en-sawghost", "en-sinner"], boss: "boss-laji",
    helpers: [{ id: "paofu", need: null }],
    lines: {
      intro: [
      [null, "陽間，一個在車裡抽菸的男人，跟騎機車的人吵了起來……", "字卡"],
        ["EP3-16", "要抽關上車窗抽啦", "機車騎士"],
        ["EP3-16", "只能騎機車的窮鱉　叫屁叫", "辣雞"],
      [null, "後來，他來到了刀鋸地獄。", "字卡"],
        ["EP3-16", "這是哪裡呀", "辣雞"]
      ],
      boss: [
        ["EP3-16", "他們是我的微笑式神　雖然只是低階召喚術　但用來對付你這種人渣足矣", "lee"],
        ["EP3-16", "你知道我爸是誰嗎", "辣雞"],
        ["EP3-16", "那你知道我乾女兒是誰嗎　就是被你推下水的語彤", "lee"],
        ["EP3-16", "不……不可能", "辣雞"]
      ],
      clear: [
        ["EP3-16", "鄙人業鏡羅漢　宣判罪人陳樂基罪孽深重　打入刀鋸地獄36年　帶走", "lee"],
        ["EP3-16", "等一下　我願意跟他道歉", "辣雞"],
        ["EP3-16", "這尊要怎麼處理", "paofu"],
        [null, "帶下去。讓他在這裡，好好想想自己做過的事。", "lee"],
        ["EP3-16", "no problem", "paofu"]
      ]
    },
    reward: { flag: "laji-judged" } },

  { id: "gengyin", name: "庚寅地球・高熊市", open: { start: true },
    desc: "另一個時空的高熊市。白蛛會想除掉南高熊的黑龍堂，請了術士下蠱。",
    enemies: ["en-baizhu", "en-shushi", "en-gu"], boss: "boss-bailaoda",
    helpers: [{ id: "dulao", need: null }, { id: "tiedan", need: null }, { id: "guangtou", need: null }],
    lines: {
      intro: [
      [null, "庚寅地球・高熊市。黑龍堂的杜老大，最近好像換了一個人。", "字卡"],
        ["EP5-04", "你穿越到黑道老大的身體？　好開心的感覺", "yuelao"],
        ["EP5-04", "開心個屁　我的小弟都在室內抽菸", "dulao"],
        ["EP5-04", "杜老大在嗎？", "tiedan"],
        ["EP5-04", "又來幫老大排毒", "guangtou"],
        ["EP5-04", "是驅邪！", "tiedan"]
      ],
      mid: [
        ["EP5-05", "這隻蜥蜴蠱一直想往北方逃　你在北邊有得罪什麼人嗎？", "yuelao"],
        ["EP5-05", "黑社會仇家太多", "dulao"]
      ],
      boss: [
        ["EP5-08", "花這麼多錢還弄不死南高熊的黑龍堂", "白蛛會角頭"],
        ["EP5-19", "作者　大反派要被殲滅了　給我一首適合光頭的BGM吧", "guangtou"]
      ],
      clear: [
        ["EP5-19", "黑龍的第一打手不敢單挑　竟然報警", "白蛛會角頭"],
        ["EP5-19", "我是良好市民", "guangtou"],
        ["EP5-19", "司法不公", "白蛛會角頭"],
        ["EP5-19", "對　司法是母的　有什麼事跟法官說", "guangtou"],
        ["EP5-19", "謝謝你們　不但捐口罩給警隊　還幫我們破獲違禁品源頭", "警察"],
        ["EP5-19", "不客氣　改天來公司泡茶", "guangtou"]
      ]
    },
    reward: { flag: "baizhu-done" } },

  { id: "xinkujiang", name: "心堀江", open: { rank: 1 },
    desc: "高熊市的商圈，被惡房東亂漲租金，滿街「旺舖出租」，變成鬼城。術士把八尺大人練成了蠱。",
    enemies: ["en-raincoat", "en-shushi"], boss: "boss-hasshaku",
    helpers: [{ id: "tiedan", need: null }, { id: "gengyin", need: null }],
    lines: {
      intro: [
      [null, "高熊市出現了八尺大人的傳聞。月老帶大家去找鐵蛋商量。", "字卡"],
        ["EP5-12", "高熊市區有人煙稀少的地方嗎　八尺的魔音會影響民眾", "yuelao"],
        ["EP5-12", "去心堀江　那裡被不事生產的惡房東亂漲租金　現已變成鬼城", "tiedan"],
        ["EP5-12", "那個字不是念「堀」？", "yuelao"],
        ["EP5-12", "在地人都念堀啦", "tiedan"]
      ],
      boss: [
        ["EP5-11", "杜……鋒……", "八尺大人"],
        ["EP5-11", "能將八尺大人練成蠱　這降頭師是個人物", "yuelao"],
        ["EP5-11", "你是誰派來的？　如果不說　就打的你魂飛魄散", "yuelao"],
        ["EP5-12", "情網恢恢", "yuelao"]
      ],
      clear: [
        ["EP5-12", "說出幕後主使　我就幫你回到故鄉", "yuelao"],
        ["EP5-12", "是白……", "八尺大人"],
        ["EP5-12", "笨蛋神明", "術士"],
        ["EP5-12", "迷失幻境", "術士"],
        ["EP5-12", "可惡　跑掉了", "yuelao"]
      ],
      epilogue: {
        when: { flag: "baizhu-done" },
        lines: [
          ["EP5-19", "白老大破產了　沒有錢付頭期款", "術士"],
          ["EP5-19", "我有把傘鬼救回來哦", "術士"],
          ["EP5-19", "養你這麼久　還不知道你這麼有義氣", "八尺大人"],
          ["EP5-19", "我想回故鄉　嚇小孩", "八尺大人"],
          ["EP5-19", "好耶", "術士"]
        ]
      }
    },
    reward: { flag: "bachi-done" } },

  { id: "seaside", name: "陽間海邊", open: { month: 7 },
    desc: "中元節陽間磁場很亂。抓交替的冤魂聞到魔氣就會圍上來。",
    enemies: ["en-drowned"], boss: "boss-tide",
    helpers: [{ id: "qianliyan", need: { rank: 1 } }],
    lines: {
      intro: [
      [null, "中元節，大家到陽間海邊看煙火。", "字卡"],
        ["EP4-09", "等一下那邊會有煙火哦", "yutong"],
        ["EP4-09", "好香的魔氣　給我吃", "冤魂"],
        ["EP4-09", "抓交替的冤魂　被諾瓦的魔氣吸引過來了", "yutong"]
      ],
      boss: [
        ["EP4-09", "silence！", "qianliyan"],
        ["EP4-09", "這是順風耳開發的靜音咒　用了就完全聽不到外界的聲音哦", "qianliyan"],
        ["EP4-09", "那傢伙聽力太好常失眠　所以發明這種奇怪的咒語", "qianliyan"]
      ],
      clear: [
        ["EP4-09", "沒事　不過中元節陽間磁場很亂", "qianliyan"],
        [null, "海邊的煙火放起來了。", "字卡"]
      ]
    },
    reward: { flag: "seaside-done" } },

  { id: "relic", name: "古神遺跡", open: { rank: 2 },
    desc: "上古神祇的禁地。三百年前月老單槍匹馬闖進來窺探命運，被古神之眼打成重傷。",
    enemies: ["en-relic"], boss: "boss-eye",
    helpers: [{ id: "guanyin", need: { resident: "yuelao" }, once: true }],
    lines: {
      intro: [
      [null, "月老帶大家來到古神遺跡。這裡，他三百年前來過一次。", "字卡"],
        ["月老外傳-07", "我到地府之後　就穿梭在各界尋找改寫姻緣的辦法", "yuelao"],
        ["月老外傳-07", "三百年前我闖入古神遺跡　窺探到命運", "yuelao"]
      ],
      boss: [
        ["月老外傳-07", "人間小神　也敢窺探古神", "古神"]
      ],
      clear: [
        ["月老外傳-07", "月老　單槍匹馬闖神魔禁地　我看你很勇哦", "guanyin"],
        ["月老外傳-07", "可是我窺探到命運的規則　之後我就能看到　我牽的緣對這個人的影響", "yuelao"]
      ]
    },
    reward: { flag: "lingtong" } },

  { id: "demon2", name: "魔界第二王國", open: { rank: 3 },
    desc: "嫉妒魔王利維坦的國度。總參謀是一隻騎粉紅三輪車的倉鼠。一場誤會戰。",
    enemies: ["en-narwhal"], mid: "en-rat", boss: "boss-leviathan",
    helpers: [{ id: "nova", need: { resident: "nova" } }],
    lines: {
      intro: [
      [null, "穿過穿界門，就是魔界第二王國的南方戰線。", "字卡"],
        ["EP4-07", "利維坦大人不在　要注意鞏固南方戰線的防備", "rat"],
        ["EP4-07", "是　抱歉　我馬上去拿一罐新的", "惡魔士兵"],
        ["EP4-07", "得罪方丈還想跑", "rat"]
      ],
      mid: [
        ["EP4-13", "車顧好　不然把你腿打斷", "rat"],
        ["EP4-16", "看我的麻將拳", "rat"]
      ],
      boss: [
        ["EP4-01", "兩位殿堂級的主神　一起迎接我　已經不是用言語可以解決的吧", "leviathan"]
      ],
      clear: [
        ["EP4-07", "抱歉　我們惡魔不太了解藝術", "leviathan"],
        ["EP4-07", "我們誕生之時　便是沒有情緒的生物　魔界的學校只會教戰爭", "leviathan"],
        ["EP4-07", "來到這裡　我更感受到擁有情緒能帶來的溫暖　我希望諾瓦能變成給魔界帶來美好的人", "leviathan"]
      ]
    },
    reward: { flag: "leviathan-visit", guest: ["leviathan", "rat"] } },

  { id: "demon3", name: "魔界第三王國", open: { rank: 4 },
    desc: "憤怒魔王撒旦的國度。他們抓靈魂回去獻祭，一個靈魂可以召喚一支骷髏兵。",
    enemies: ["en-skeleton", "en-bat"], mid: "boss-plague", boss: "boss-satan",
    extra: ["en-gu-teacher"],
    helpers: [
      { id: "leviathan", need: { guest: "leviathan" } },
      { id: "rat", need: { guest: "rat" } },
      { id: "qianliyan", need: { guest: "qianliyan" } }
    ],
    lines: {
      intro: [
      [null, "魔界第三王國。抓靈魂回去獻祭的，就是這裡的部隊。", "字卡"],
        ["EP4-13", "發動攻擊的是憤怒王國的先遣部隊　他們專門抓靈魂回去獻祭", "rat"],
        ["EP4-13", "一個被獻祭的靈魂　可以召喚一支骷髏兵　品質越高的靈魂　召喚的兵越強", "rat"],
        ["EP4-12", "我只讓你們來破壞這個世界　沒說保障你們不被破壞", "辜老師"]
      ],
      mid: [
        ["EP4-16", "乖乖變成我的骷髏兵吧", "瘟疫"],
        ["EP4-16", "我是撒旦的軍師　奴家名叫「瘟疫」　在被我打死之前　能不能告訴奴家你的名字", "瘟疫"]
      ],
      boss: [
        ["EP4-15", "真抱歉　平常我會束縛自己的魔力　不然我身邊的人會被我的魔力壓死", "撒旦"],
        ["EP4-15", "再強也不能把生靈當做垃圾", "lee"],
        ["EP4-15", "我不是針對生靈　我是指在座的各位　都是垃圾", "撒旦"],
        ["EP4-17", "感受痛苦吧　辛辣天塞", "撒旦"]
      ],
      clear: [
        ["EP4-17", "自古對轟左邊輸啦", "leviathan"],
        ["EP4-17", "剪刀　石頭　石頭　石頭", "leviathan"],
        ["EP4-17", "好強的魔力", "撒旦"],
        ["EP4-17", "這就是愛的力量嗎　好不甘心", "撒旦"]
      ]
    },
    reward: { flag: "satan-done" } },

  { id: "north", name: "北境", open: { rank: 5 }, hidden: true,
    desc: "船票一人三十功德。有菩提麻糬，去過的靈魂都說被淨化了。冰原深處，留著遠古戰場的詛咒。",
    enemies: ["en-north"], boss: "boss-evilgod",
    helpers: [{ id: "lucifer", need: { flag: "satan-done" }, once: true }, { id: "zhurong", need: { flag: "satan-done" }, once: true }],
    lines: {
      intro: [
      [null, "搭上北境的船，冰原就在眼前。", "字卡"],
        ["EP2-08", "吃過北境的菩提麻糬　看到一閃而過的北境風景　就好想去北境玩", "dabao"],
        ["EP2-13", "很放鬆　感覺靈魂都會被淨化", "huji"]
      ],
      boss: [
        ["EP6-02", "邪神帝……　克蘇魯已經輸了", "lucifer"],
        ["EP6-02", "你就不怕被我詛咒嗎？", "邪神帝"],
        ["EP6-02", "我可是天族的最強戰士！", "lucifer"],
        ["EP6-02", "狗屎！", "邪神帝"]
      ],
      clear: [
        ["EP6-02", "可以跟大天使並肩作戰……　是我身為半神隊長的光榮", "zhurong"],
        [null, "冰原安靜下來了。", "字卡"]
      ]
    },
    reward: { flag: "north-done" } }
];

/* ───────── 街區外圍（荒岸）─────────
   zone 1～4 對應 B 的 HQ.zoneMul。越往上游越強。閒置街坊自己出去打。 */
HQ.outskirts = [
  { zone: 1, name: "彼岸花河堤", mobs: ["mob-lost"],
    desc: "迷途魂在花叢裡打轉。打贏了，他們會跟著走進街上。" },
  { zone: 2, name: "荒岸", mobs: ["mob-lost", "mob-ghost"],
    desc: "抓交替的冤魂在岸邊游蕩。中元節會變很多。" },
  { zone: 3, name: "三途川中游", mobs: ["mob-ghost", "mob-miasma"],
    desc: "街上的魔氣散出來，在這裡結成魔氣團。" },
  { zone: 4, name: "三途川上游", mobs: ["mob-miasma", "mob-lizard"],
    desc: "最危險的地方。有人在這裡放了蜥蜴蠱。" }
];

/* ───────── 街區保衛戰：第三王國入侵 ─────────
   ☆3 之後可能發生（data/events.js 的 invasion-sign 先預告，2 週後開戰）。辜老師用靈魂核心打開穿界門，敵人從車站那一側進來。
   waves 依序出；每波 at 是出現位置，target 是他們想打的建築。被打到的建築停業，戰後花冥紙修（B 定價）。
   skills：玩家可按的技能（每場次數 uses）；reinforce：每場一次的援軍。
   打贏：flag "invasion-done"，☆4 時大地圖開放第三王國。 */
HQ.defense = {
  id: "invasion3", name: "第三王國入侵",
  when: { rank: 3, noflag: "invasion-done" },
  entry: "station",
  waves: [
    { n: 1, title: "先遣部隊", at: "station", target: "station",
      enemies: [{ id: "en-skeleton", n: 6 }],
      lines: [
        ["EP4-11", "地府怎麼闖入這麼多惡魔", "paofu"],
        ["EP4-11", "三途川現在這麼嗨哦", "qianliyan"],
        ["EP4-11", "你又不會打架　出來幹嘛", "yuelao"],
        ["EP4-11", "我跟鄉民進來看熱鬧的　想看你打架", "yutong"]
      ] },
    { n: 2, title: "搜捕高品質靈魂", at: "station", target: "photo",
      enemies: [{ id: "en-skeleton", n: 4 }, { id: "en-reaper", n: 1 }],
      lines: [
        ["EP4-11", "擋住我的攻擊　不錯", "第三王國惡魔"],
        ["EP4-11", "還有空關心別人　我先帶妖狐走　等等跟大部隊匯合　繼續搜捕高品質靈魂", "第三王國惡魔"],
        ["EP4-11", "異界降臨", "lee"],
        ["EP4-11", "閉島繩束", "lee"]
      ],
      guestLines: { leviathan: [
        ["EP4-11", "第三王國的雜魚　誰准你用髒手碰她", "leviathan"],
        ["EP4-11", "嫉妒魔王怎麼會在這　撒旦座下第五軍團百夫長　向你發起挑戰", "第三王國惡魔"],
        ["EP4-11", "你已經死了", "leviathan"]
      ] } },
    { n: 3, title: "拒神結界", at: "edge", target: "tattoo",
      enemies: [{ id: "en-skeleton", n: 6 }, { id: "en-bat", n: 3 }],
      lines: [
        ["EP4-15", "需趕快設下拒神結界　阻止她回防", "撒旦"],
        ["EP4-15", "party time", "撒旦"],
        ["EP4-16", "看來是只針對神明的結界", "guanyin"],
        ["EP4-16", "軍師　你可以幫我守護三途川嗎　事情結束之後　我請你吃頂王", "guanyin"]
      ] },
    { n: 4, title: "車站", at: "station", target: "station",
      enemies: [{ id: "en-bat", n: 3 }, { id: "boss-plague", n: 1 }],
      lines: [
        ["EP4-15", "我負責車站　你們兩個負責市中心", "qianliyan"],
        ["EP4-16", "乖乖變成我的骷髏兵吧", "瘟疫"],
        ["EP4-16", "你們快逃", "qianliyan"]
      ] },
    { n: 5, title: "市役所前", at: "cityhall", target: "cityhall",
      enemies: [{ id: "boss-satan", n: 1 }, { id: "en-gu-teacher", n: 1 }, { id: "en-skeleton", n: 4 }],
      lines: [
        ["EP4-15", "這裡聞起來充滿好欺負的靈魂　我先開動了", "撒旦"],
        ["EP4-15", "兩股強大的魔氣分開了　在市中心的這隻更強", "lee"],
        ["EP4-15", "好驚人的魔力", "yuelao"],
        ["EP4-15", "我不是針對生靈　我是指在座的各位　都是垃圾", "撒旦"],
        ["EP4-18", "靈魂核心吸收足夠的恐懼之力了", "辜老師"]
      ] }
  ],
  skills: [
    { char: "yutong",    name: "紅線縛魂", uses: 2, effect: "一隻敵人 1 回合不能動", note: "企劃書命名；劇中是月老用紅線綑住辜老師（EP4-18）" },
    { char: "lee",       name: "異界降臨・閉島繩束", uses: 1, effect: "一個區塊的敵人全部定住 2 回合", ep: "EP4-11" },
    { char: "yuelao",    name: "純愛砲擊", uses: 1, effect: "直線大傷害", ep: "EP4-01" },
    { char: "jiuwei",    name: "異界降臨・如墜五里霧", uses: 1, effect: "濃霧：我方被打中機率減半 3 回合", ep: "EP6-04" },
    { char: "huatuo",    name: "醫者令・鎮魂", uses: 1, effect: "全體回復、解除詛咒", ep: "EP6-08" },
    { char: "dabao",     name: "水牆防護", uses: 1, effect: "一棟建築這波不會被打到", note: "企劃書命名（消防員）" },
    { char: "huji",      name: "狐火", uses: 2, effect: "範圍火傷害", note: "企劃書命名" },
    { char: "leviathan", name: "冰牆", uses: 1, effect: "擋下一次王的攻擊", ep: "EP4-17" }
  ],
  reinforce: [
    { char: "rat", need: { guest: "rat" }, wave: 3,
      lines: [
        ["EP4-16", "就我和你one on one？", "rat"],
        ["EP4-16", "讚啦　豆腐鴨血　冰水一壺", "rat"],
        ["EP4-16", "看我的麻將拳", "rat"],
        ["EP4-16", "利維坦大人的穿界門　現形！　第二王國的戰士們　來幫本軍師抬轎啦", "rat"]
      ],
      effect: "清掉一波一半的骷髏兵" },
    { char: "qianliyan", need: { guest: "qianliyan" }, wave: 4,
      lines: [["EP4-09", "silence！", "qianliyan"]],
      effect: "瘟疫 2 回合不能施法" },
    { char: "guanyin", need: null, wave: 5, blocked: true,
      lines: [["EP4-13", "那加上我呢", "guanyin"]],
      note: "劇中觀音被拒神結界擋在外面（EP4-16）。第 5 波若有鼠軍師援軍，結界在戰後解除、觀音才進得來：只播台詞＋戰後回復，不參戰。" }
  ],
  win: {
    lines: [
      ["EP4-18", "憤怒魔王被打敗了", "字卡"],
      ["EP4-17", "這就是愛的力量嗎　好不甘心", "撒旦"],
      ["EP6-07", "兩位救了三途川的大英雄　不要吵架呀", "guanyin"]
    ],
    effect: { flag: "invasion-done", popularity: 100, helped: 10, merit: 200 } },
  lose: {
    lines: [[null, "街區被打得七零八落。撒旦帶著抓到的靈魂回去了。", "字卡"]],
    effect: { popularity: -100, retryInWeeks: 8 } }
};
