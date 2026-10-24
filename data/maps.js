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
        [null, "【陽間】一名在車裡抽菸的男人，和機車騎士吵了起來。", "字卡"],
        ["EP3-16", "要抽，關上車窗抽啦！", "機車騎士"],
        ["EP3-16", "只能騎機車的窮鱉，叫屁叫！", "辣雞"],
        [null, "【刀鋸地獄】那名男人死後，來到了刀鋸地獄。", "字卡"],
        ["EP3-16", "這是哪裡呀？", "辣雞"]
      ],
      boss: [
        [null, "【刀鋸地獄】掌管黃泉燒肉店的業鏡羅漢，攔住了眼前的男人。", "字卡"],
        [null, "你以為到了這裡，還能仗勢欺人？", "lee"],
        ["EP3-16", "你知道我爸是誰嗎？", "辣雞"],
        ["EP3-16", "那你知道我乾女兒是誰嗎？就是被你推下水的語彤。", "lee"],
        ["EP3-16", "不……不可能！", "辣雞"]
      ],
      clear: [
        [null, "【刀鋸地獄】業鏡羅漢準備宣判，刀鋸使領班泡芙在一旁等候。", "字卡"],
        [null, "鄙人業鏡羅漢，宣判罪人陳樂基罪孽深重，打入刀鋸地獄三十六年。帶走！", "lee"],
        [null, "等一下！我願意跟語彤道歉！", "辣雞"],
        ["EP3-16", "這尊要怎麼處理？", "paofu"],
        [null, "帶下去。讓他在這裡，好好想想自己做過的事。", "lee"],
        [null, "沒問題。", "paofu"]
      ]
    },
    reward: { flag: "laji-judged" } },

  { id: "gengyin", name: "庚寅地球・高熊市", open: { start: true },
    desc: "另一個時空的高熊市。白蛛會想除掉南高熊的黑龍堂，請了術士下蠱。",
    enemies: ["en-baizhu", "en-shushi", "en-gu"], boss: "boss-bailaoda",
    helpers: [{ id: "dulao", need: null }, { id: "tiedan", need: null }, { id: "guangtou", need: null }],
    lines: {
      intro: [
        [null, "【庚寅地球・高熊市】月老來到黑龍堂。眼前的杜老大，是附身在黑道老大身上的紋身師杜先生。", "字卡"],
        ["EP5-04", "你穿越到黑道老大的身體？好開心的感覺。", "yuelao"],
        ["EP5-04", "開心個屁！我的小弟都在室內抽菸。", "dulao"],
        [null, "女高中生靈媒鐵蛋來找杜老大，黑龍堂的光頭小弟上前招呼。", "字卡"],
        ["EP5-04", "杜老大在嗎？", "tiedan"],
        ["EP5-04", "又來幫老大排毒。", "guangtou"],
        ["EP5-04", "是驅邪！", "tiedan"]
      ],
      mid: [
        [null, "【庚寅地球・高熊市】月老和黑龍堂的杜老大，正追查眼前這隻蜥蜴蠱的來處。", "字卡"],
        ["EP5-05", "這隻蜥蜴蠱一直想往北方逃，你在北邊有得罪什麼人嗎？", "yuelao"],
        ["EP5-05", "黑社會仇家太多。", "dulao"]
      ],
      boss: [
        [null, "【庚寅地球・高熊市】黑龍堂的第一打手光頭小弟，對上了白蛛會角頭。", "字卡"],
        ["EP5-08", "花這麼多錢還弄不死南高熊的黑龍堂。", "白蛛會角頭"],
        [null, "想找黑龍堂麻煩？先過我這關！", "guangtou"]
      ],
      clear: [
        [null, "【庚寅地球・高熊市】黑龍堂的第一打手光頭小弟報了警，白蛛會角頭被警方制伏。", "字卡"],
        ["EP5-19", "黑龍的第一打手不敢單挑，竟然報警！", "白蛛會角頭"],
        ["EP5-19", "我是良好市民。", "guangtou"],
        ["EP5-19", "司法不公！", "白蛛會角頭"],
        [null, "有什麼話，留著跟法官說吧。", "guangtou"],
        [null, "謝謝你們，幫我們破獲違禁品的源頭。", "警察"],
        ["EP5-19", "不客氣，改天來公司泡茶。", "guangtou"]
      ]
    },
    reward: { flag: "baizhu-done" } },

  { id: "xinkujiang", name: "心堀江", open: { rank: 1 },
    desc: "高熊市的商圈，被惡房東亂漲租金，滿街「旺舖出租」，變成鬼城。術士把八尺大人練成了蠱。",
    enemies: ["en-raincoat", "en-shushi"], boss: "boss-hasshaku",
    helpers: [{ id: "tiedan", need: null }, { id: "gengyin", need: null }],
    lines: {
      intro: [
        [null, "【庚寅地球・高熊市】為了應付八尺大人，月老找上女高中生靈媒鐵蛋，商量在哪裡迎戰。", "字卡"],
        ["EP5-12", "高熊市區有人煙稀少的地方嗎？八尺的魔音會影響民眾。", "yuelao"],
        ["EP5-12", "去心堀江，那裡被不事生產的惡房東亂漲租金，現已變成鬼城。", "tiedan"],
        [null, "【庚寅地球・心堀江】月老和鐵蛋來到冷清的街頭。", "字卡"],
        [null, "這裡人少，就在這裡等八尺大人吧。", "yuelao"]
      ],
      boss: [
        [null, "【庚寅地球・心堀江】八尺大人擋在月老面前，嘴裡斷斷續續地喊著。", "字卡"],
        [null, "杜……杜老大……", "八尺大人"],
        ["EP5-11", "能將八尺大人練成蠱，這降頭師是個人物。", "yuelao"],
        [null, "你是誰派來的？再不說，我可要動手了！", "yuelao"],
        ["EP5-12", "情網恢恢。", "yuelao"]
      ],
      clear: [
        [null, "【庚寅地球・心堀江】月老制伏了八尺大人，追問是誰派她來的。", "字卡"],
        ["EP5-12", "說出幕後主使，我就幫你回到故鄉。", "yuelao"],
        ["EP5-12", "是白……", "八尺大人"],
        [null, "八尺大人還沒說完，一名術士突然插手。", "字卡"],
        ["EP5-12", "笨蛋神明！", "術士"],
        ["EP5-12", "迷失幻境！", "術士"],
        [null, "【幻境：心堀江】月老眼前的景物一陣模糊，再看清時，術士已經不見了。", "字卡"],
        [null, "可惡，讓那個術士跑掉了！", "yuelao"]
      ],
      epilogue: {
        when: { flag: "baizhu-done" },
        lines: [
          ["EP5-19", "白老大破產了，沒有錢付頭期款。", "術士"],
          ["EP5-19", "我有把傘鬼救回來哦。", "術士"],
          ["EP5-19", "養你這麼久，還不知道你這麼有義氣。", "八尺大人"],
          ["EP5-19", "我想回故鄉，嚇小孩。", "八尺大人"],
          ["EP5-19", "好耶！", "術士"]
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
        [null, "【陽間・海邊】中元節，實習月老語彤和見習畫家諾瓦來看煙火；諾瓦是獨角鯨魔族。", "字卡"],
        ["EP4-09", "等一下那邊會有煙火哦。", "yutong"],
        ["EP4-09", "好香的魔氣，給我吃！", "冤魂"],
        ["EP4-09", "抓交替的冤魂，被諾瓦的魔氣吸引過來了。", "yutong"]
      ],
      boss: [
        [null, "【陽間・海邊】冤魂在岸邊叫嚷，媽祖部將千里眼將軍趕來應對。", "字卡"],
        [null, "靜音！", "qianliyan"],
        [null, "這是靜音咒。用了以後，就聽不到外面的聲音了。", "qianliyan"]
      ],
      clear: [
        [null, "【陽間・海邊】冤魂被擊退後，媽祖部將千里眼將軍查看四周。", "字卡"],
        [null, "中元節陽間磁場很亂，大家還是小心一點。", "qianliyan"],
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
        [null, "【古神遺跡】月老帶大家來到遺跡，說起三百年前的經歷。", "字卡"],
        ["月老外傳-07", "我到地府之後，就穿梭在各界尋找改寫姻緣的辦法。", "yuelao"],
        ["月老外傳-07", "三百年前我闖入古神遺跡，窺探到命運。", "yuelao"]
      ],
      boss: [
        [null, "【古神遺跡】月老一行人正要前進，古神的聲音突然響起。", "字卡"],
        ["月老外傳-07", "人間小神，也敢窺探古神！", "古神"]
      ],
      clear: [
        [null, "【回想：三百年前，古神遺跡】觀音菩薩找到闖入遺跡的月老。", "字卡"],
        ["月老外傳-07", "月老，單槍匹馬闖神魔禁地，我看你很勇哦。", "guanyin"],
        ["月老外傳-07", "可是我窺探到命運的規則，之後我就能看到，我牽的緣對這個人的影響。", "yuelao"]
      ]
    },
    reward: { flag: "lingtong" } },

  { id: "demon2", name: "魔界第二王國", open: { rank: 3 },
    desc: "嫉妒魔王利維坦的國度。總參謀是一隻騎粉紅三輪車的倉鼠。一場誤會戰。",
    enemies: ["en-narwhal"], mid: "en-rat", boss: "boss-leviathan",
    helpers: [{ id: "nova", need: { resident: "nova" } }],
    lines: {
      intro: [
        [null, "【魔界第二王國・軍營】第二王國的總參謀鼠軍師，是一隻倉鼠，正向士兵交代防務。", "字卡"],
        [null, "魔王利維坦大人不在，要守好南方戰線。", "rat"],
        [null, "是！我馬上去。", "惡魔士兵"]
      ],
      mid: [
        [null, "【魔界第二王國】騎著粉紅三輪車的鼠軍師停了下來，把車交給一旁的士兵看顧。", "字卡"],
        [null, "車幫我顧好，我去前面應戰。", "rat"],
        ["EP4-16", "看我的麻將拳！", "rat"]
      ],
      boss: [
        [null, "【魔界第二王國】第二王國的魔王利維坦，攔住了前來出征的一行人。", "字卡"],
        [null, "這麼多人一起來，看來不是聊幾句就能解決的吧？", "leviathan"]
      ],
      clear: [
        [null, "【魔界第二王國】戰鬥結束後，魔王利維坦談起養女諾瓦；她是個不喜歡戰鬥的見習畫家。", "字卡"],
        [null, "諾瓦喜歡畫畫，可惜我不太懂藝術。", "leviathan"],
        [null, "我希望她能多畫些喜歡的東西，替魔界帶來一點美好。", "leviathan"]
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
        [null, "【魔界第三王國】第二王國的總參謀鼠軍師，向大家說明這次要對付的敵人。", "字卡"],
        ["EP4-13", "發動攻擊的是憤怒王國的先遣部隊，他們專門抓靈魂回去獻祭。", "rat"],
        [null, "他們用靈魂獻祭，召喚骷髏兵。大家千萬別落到他們手上。", "rat"]
      ],
      mid: [
        [null, "【魔界第三王國】一名自稱「瘟疫」的敵人攔住去路。", "字卡"],
        ["EP4-16", "我是撒旦的軍師，奴家名叫「瘟疫」。\n在被我打死之前，能不能告訴奴家你的名字？", "瘟疫"],
        ["EP4-16", "乖乖變成我的骷髏兵吧！", "瘟疫"]
      ],
      boss: [
        [null, "【魔界第三王國】掌管黃泉燒肉店的業鏡羅漢，對上了敵人撒旦。", "字卡"],
        ["EP4-15", "真抱歉，平常我會束縛自己的魔力，不然我身邊的人會被我的魔力壓死。", "撒旦"],
        [null, "再強，也不能隨便傷害生靈。", "lee"],
        [null, "在我眼裡，你們都一樣不堪一擊。", "撒旦"],
        [null, "感受痛苦吧！", "撒旦"]
      ],
      clear: [
        [null, "【魔界第三王國】第二王國的魔王利維坦加入戰局，壓過了撒旦的攻勢。", "字卡"],
        [null, "到此為止，別再傷害其他靈魂了。", "leviathan"],
        ["EP4-17", "好強的魔力！", "撒旦"],
        [null, "竟然輸了……好不甘心！", "撒旦"]
      ]
    },
    reward: { flag: "satan-done" } },

  { id: "north", name: "北境", open: { rank: 5 }, hidden: true,
    desc: "船票一人三十功德。有菩提麻糬，去過的靈魂都說被淨化了。冰原深處，留著遠古戰場的詛咒。",
    enemies: ["en-north"], boss: "boss-evilgod",
    helpers: [{ id: "lucifer", need: { flag: "satan-done" }, once: true }, { id: "zhurong", need: { flag: "satan-done" }, once: true }],
    lines: {
      intro: [
        ["EP2-08", "吃過北境的菩提麻糬，看到一閃而過的北境風景，就好想去北境玩。", "dabao"],
        ["EP2-13", "很放鬆，感覺靈魂都會被淨化。", "huji"]
      [null, "【北境】搭上北境的船，冰原就在眼前。", "字卡"],
      ],
      boss: [
        [null, "【回想：遠古的北境】天族最強戰士路西法，正與邪神帝對峙。", "字卡"],
        [null, "邪神帝，你已經輸了。", "lucifer"],
        ["EP6-02", "你就不怕被我詛咒嗎？", "邪神帝"],
        ["EP6-02", "我可是天族的最強戰士！", "lucifer"],
        ["EP6-02", "狗屎！", "邪神帝"]
      ],
      clear: [
        [null, "【回想：遠古的北境】半神隊長祝融與天族最強戰士路西法合力殲滅邪神帝，戰鬥終於結束。", "字卡"],
        ["EP6-02", "可以跟大天使並肩作戰……\n是我身為半神隊長的光榮。", "zhurong"],
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
        ["EP4-11", "地府怎麼闖入這麼多惡魔？", "paofu"],
        ["EP4-11", "三途川現在這麼嗨哦！", "qianliyan"],
        ["EP4-11", "你又不會打架，出來幹嘛？", "yuelao"],
        ["EP4-11", "我跟鄉民進來看熱鬧的，想看你打架。", "yutong"]
      ] },
    { n: 2, title: "搜捕高品質靈魂", at: "station", target: "photo",
      enemies: [{ id: "en-skeleton", n: 4 }, { id: "en-reaper", n: 1 }],
      lines: [
        ["EP4-11", "擋住我的攻擊，不錯。", "第三王國惡魔"],
        ["EP4-11", "還有空關心別人？我先帶妖狐走，等等跟大部隊匯合，繼續搜捕高品質靈魂。", "第三王國惡魔"],
        ["EP4-11", "異界降臨！", "lee"],
        ["EP4-11", "閉島繩束！", "lee"]
      ],
      guestLines: { leviathan: [
        ["EP4-11", "第三王國的雜魚，誰准你用髒手碰她？", "leviathan"],
        ["EP4-11", "嫉妒魔王怎麼會在這？\n撒旦座下第五軍團百夫長，向你發起挑戰！", "第三王國惡魔"],
        ["EP4-11", "你已經死了。", "leviathan"]
      ] } },
    { n: 3, title: "拒神結界", at: "edge", target: "tattoo",
      enemies: [{ id: "en-skeleton", n: 6 }, { id: "en-bat", n: 3 }],
      lines: [
        ["EP4-15", "需趕快設下拒神結界，阻止她回防。", "撒旦"],
        ["EP4-15", "party time", "撒旦"],
        ["EP4-16", "看來是只針對神明的結界。", "guanyin"],
        ["EP4-16", "軍師，你可以幫我守護三途川嗎？\n事情結束之後，我請你吃頂王。", "guanyin"]
      ] },
    { n: 4, title: "車站", at: "station", target: "station",
      enemies: [{ id: "en-bat", n: 3 }, { id: "boss-plague", n: 1 }],
      lines: [
        ["EP4-15", "我負責車站，你們兩個負責市中心。", "qianliyan"],
        ["EP4-16", "乖乖變成我的骷髏兵吧！", "瘟疫"],
        ["EP4-16", "你們快逃！", "qianliyan"]
      ] },
    { n: 5, title: "市役所前", at: "cityhall", target: "cityhall",
      enemies: [{ id: "boss-satan", n: 1 }, { id: "en-gu-teacher", n: 1 }, { id: "en-skeleton", n: 4 }],
      lines: [
        ["EP4-15", "這裡聞起來充滿好欺負的靈魂，我先開動了。", "撒旦"],
        ["EP4-15", "兩股強大的魔氣分開了，在市中心的這隻更強。", "lee"],
        ["EP4-15", "好驚人的魔力！", "yuelao"],
        ["EP4-15", "我不是針對生靈，我是指在座的各位，都是垃圾。", "撒旦"],
        ["EP4-18", "靈魂核心吸收足夠的恐懼之力了。", "辜老師"]
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
        ["EP4-16", "讚啦！豆腐鴨血，冰水一壺。", "rat"],
        ["EP4-16", "看我的麻將拳！", "rat"],
        ["EP4-16", "利維坦大人的穿界門，現形！\n第二王國的戰士們，來幫本軍師抬轎啦！", "rat"]
      ],
      effect: "清掉一波一半的骷髏兵" },
    { char: "qianliyan", need: { guest: "qianliyan" }, wave: 4,
      lines: [["EP4-09", "silence！", "qianliyan"]],
      effect: "瘟疫 2 回合不能施法" },
    { char: "guanyin", need: null, wave: 5, blocked: true,
      lines: [["EP4-13", "那加上我呢？", "guanyin"]],
      note: "劇中觀音被拒神結界擋在外面（EP4-16）。第 5 波若有鼠軍師援軍，結界在戰後解除、觀音才進得來：只播台詞＋戰後回復，不參戰。" }
  ],
  win: {
    lines: [
      ["EP4-18", "憤怒魔王被打敗了！", "字卡"],
      ["EP4-17", "這就是愛的力量嗎？好不甘心。", "撒旦"],
      ["EP6-07", "兩位救了三途川的大英雄，不要吵架呀。", "guanyin"]
    ],
    effect: { flag: "invasion-done", popularity: 100, helped: 10, merit: 200 } },
  lose: {
    lines: [[null, "街區被打得七零八落。撒旦帶著抓到的靈魂回去了。", "字卡"]],
    effect: { popularity: -100, retryInWeeks: 8 } }
};
