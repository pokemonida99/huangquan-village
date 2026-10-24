/* 三途川物語 ‧ 角色（線 C）
   ─────────────────────────────────────────────
   台詞格式（chars / requests / events / calendar / maps 共用）：
     [集數, 台詞]            角色自己的原句
     [集數, 台詞, 說話者]    說話者 = HQ.chars 的 id；找不到 id 時直接顯示這個字串（例：「阿姨」「字卡」）
     [null, 台詞, 說話者]    遊戲自己的旁白／說明，不是劇中原句，不顯示集數
   集數後面加「?」＝原資料標為推測（確定度 0），顯示時請在句尾加「？」或不顯示集數。
   原句一律照 huangquan-episodes/data/episodes.json，「　」是原字幕的斷句，保留。

   kind：
     resident 街坊（會入住、帶建築、可工作／出征）
     guest    外賓（出現、可當援軍或暫住，不佔街坊名額）
     helper   出征地點的在地援手
     npc      不入住的固定角色（觀音）
     client   委託人（亡魂，完成委託後投胎離開）
     living   陽間活人（只在托夢、月老廟、供品事件出現）
   draw：線 D 的優先度。1 = 走路圖＋頭像必做；2 = 走路圖＋頭像；3 = 頭像就好（走路可借 soul-N）

   movein（全部條件都成立才來訪）：
     order: n         固定入住序；要 order 比它小的都入住了才會輪到
     traits: {…}      街區特徵門檻
     popularity: n    人氣門檻
     rank: n          街區評價 ☆
     helped: n        幫助人數
     resident: id     某人已入住
     request: id      完成某委託（也可由委託 reward.movein 直接入住）
     map: id          打倒該出征地點的王
     flag: id         事件旗標
     building: id     某建築已蓋
     month: n         只在這個月份來訪（外賓）
   brings：入住時帶來的建築 id（null = 不帶建築，效果見 perk）；id 照 B 的 data/buildings.js
   cutin：劇中出現過的招式名，戰鬥演出可以拿來當字卡（真正的技能數值在 B 的 HQ.jobs）
*/
window.HQ = window.HQ || {};

HQ.chars = [
  /* ───────── 街坊 ───────── */
  { id: "yutong", name: "語彤", kind: "resident", draw: 1, job: "實習月老", start: true,
    desc: "被霸凌溺死後化魔，被業鏡羅漢收為乾女兒，拜月老為師。會畫素描、會唱歌，胎記點了亮片（赤戀星空）。",
    movein: { order: 0 }, brings: null,
    perk: "每天可做文印（實習 3 組，升階增加）",
    sprite: "art/chars/yutong.png", face: "art/chars/yutong-face.png",
    lines: [
      ["EP3-13", "我想你教我愛戀文印。"],
      ["EP3-13", "因為我想幫助相愛的人不分離。"],
      ["EP3-02", "雖然店裡的客人都不是回頭客，但我也想他們用餐愉快。"],
      ["EP4-03", "從喜歡的事情入手，是最容易維持熱情的。"],
      ["EP4-08", "承認自己脆弱，才能真的變強哦，這是我乾爹教我的。"],
      ["EP3-07", "你是最好的爸爸，是壞人不好。"]
    ] },

  { id: "yuelao", name: "月老", kind: "resident", draw: 1, job: "月下老人",
    desc: "台灣愛神，生前是楚墨宗主岳夏澤（大秦右庶長）。發明愛戀文印，愛吃甜食，常躲去髮廊偷吃零食。",
    movein: { order: 1 }, brings: "tattoo",
    perk: "教學角色；紋身店文印品質加成",
    cutin: "純愛砲擊",
    sprite: "art/chars/yuelao.png", face: "art/chars/yuelao-face.png",
    arrive: [
      [null, "【三途川・月老紋身店】實習月老語彤和師傅聊起拜師的事。", "字卡"],
      [null, "其他愛神也想收你當徒弟，為什麼選我？", "yuelao"],
      [null, "因為我想留在三途川，跟師傅學愛戀文印，幫助相愛的人不分離。", "yutong"]
    ],
    lines: [
      ["EP2-04", "用情至深的靈魂，可用300功德值，在我這求取愛戀文印。"],
      ["EP2-04", "文印可以跨越輪迴，即便過奈何橋也不會消散。"],
      ["EP3-13", "你知道神為什麼喜歡幫人類嗎？\n因為你們執著的樣子，會讓神想起還是人類時的可愛。"],
      ["EP3-17", "神明不可以違心，愛就要老實。"],
      ["EP5-07", "沒有人喜歡孤獨，只是害怕失望而已。"],
      ["月老外傳-02", "我喜歡看戀人幸福。"]
    ] },

  { id: "mimi", name: "咪咪", kind: "resident", draw: 1, job: "引渡貓",
    desc: "小雨生前養的貓，917 號引渡貓，人形是水手服少女。一天只上早晚兩班車，其他時間都在睡覺。",
    movein: { order: 3, popularity: 30 }, brings: "catstop",
    perk: "列車來客 +1",
    sprite: "art/chars/mimi.png", face: "art/chars/mimi-face.png",
    arrive: [
      [null, "【三途川・車站月台】一隻貓跑到語彤腳邊，坐了下來。", "字卡"],
      [null, "妳就是新來的實習月老？我是 917 號引渡貓，咪咪。下車的亡魂都是我帶路的。", "mimi"],
      [null, "我只上早晚兩班車，其他時間都在睡覺。", "mimi"],
      [null, "車站旁邊可以蓋個候車亭嗎？等車的時候，我想找個地方睡。", "mimi"],
      [null, "還有，妳下班要常來陪我玩喔。", "mimi"],
      [null, "好，一言為定！", "yutong"]
    ],
    lines: [
      ["EP1-13", "早上和下午各一班車，其他時間都在睡覺。"],
      ["EP1-13", "我已經聯合三花幫，明天圍毆它。"],
      ["EP2-02", "引渡貓和慰靈犬要合作，幫助靈魂適應地府。"],
      ["EP2-02", "來我家吃飯吧，先治好你的悲傷。"],
      ["EP6-10", "我好愛你和媽咪，但喵不太會表達愛。"]
    ] },

  { id: "heitang", name: "黑糖", kind: "resident", draw: 1, job: "慰靈犬",
    desc: "誤食老鼠藥死去的黑白狗，以少年模樣出現，在地府當慰靈犬安慰悲傷的靈魂。",
    movein: { order: 4, traits: { 安心: 10 } }, brings: "dogpark",
    perk: "悲傷亡魂安心度上升加快",
    sprite: "art/chars/heitang.png", face: "art/chars/heitang-face.png",
    arrive: [
      [null, "【三途川・車站月台】引渡貓咪咪帶著亡魂下車，一位安靜的少年陪在亡魂身邊。", "字卡"],
      ["EP2-02", "我叫黑糖。", "heitang"],
      [null, "我是慰靈犬。有人陪著，難過的亡魂會比較快安心。", "heitang"],
      ["EP2-02", "引渡貓和慰靈犬要合作，幫助靈魂適應地府。", "mimi"],
      [null, "那就住下來吧！我幫你蓋一間小屋。", "yutong"]
    ],
    lines: [
      ["EP2-01", "綠色的糖有毒……你別吃……"],
      ["EP2-01", "跟著人類有家住，有罐罐吃。"],
      ["EP2-01", "希望他沒事。"],
      ["EP2-15", "快來幫我，這一單超恐怖的！"],
      ["EP2-15", "他下車時散發的怨念，我從沒見過，完全不想靠近的氣息。"]
    ] },

  { id: "lee", name: "業鏡羅漢", kind: "resident", draw: 1, job: "燒肉店店長",
    desc: "生前是白李米店的李國志，偷賣米給窮人而被槍斃；當過刀鋸地獄的刀鋸使，後來奉觀音之命掌管黃泉燒肉店。穿清朝官服、戴禮帽。",
    movein: { order: 2, helped: 2, weeks: 1 }, brings: "yakiniku",   // 2026-10-24：提早到第一組文印之後（出征劇情、投胎都需要他）
    perk: "解鎖遺願馬卡龍（投胎）",
    cutin: "異界降臨・閉島繩束",
    sprite: "art/chars/lee.png", face: "art/chars/lee-face.png?v=4",
    arrive: [
      [null, "【三途川・河岸】觀音菩薩帶著李國志來了。他曾在刀鋸地獄當刀鋸使，如今將以業鏡羅漢的身分掌管黃泉燒肉店。", "字卡"],
      ["EP1-15", "刀鋸使李國志聽令！即日起命你掌管黃泉燒肉店。", "guanyin"],
      ["EP1-15", "刀鋸使李國志遵命，謝觀音菩薩賞賜！", "lee"],
      [null, "燒肉店就開在這條河岸上。讓亡魂上路之前，好好吃最後一頓。", "guanyin"],
      [null, "店裡的遺願馬卡龍，能讓亡魂看見自己完成心願的幻境。放下執念後，就能安心去投胎。", "lee"],
      [null, "業鏡羅漢，以後請多指教！", "yutong"]
    ],
    lines: [
      ["EP1-02", "如入火聚，得清涼門。"],
      ["EP1-02", "獻上遺願馬卡龍，祝你用餐愉快。"],
      ["EP1-10", "帶這塊木牌來，不用付錢，安啦！"],
      ["EP3-01", "胎記是神的印章哦。"],
      ["EP3-11", "不，要控制恨，就是要承認自己恨。"],
      ["EP3-11", "讓恨與你融合成一首動人的歌。"]
    ] },

  { id: "xiaoyu", name: "小雨", kind: "resident", draw: 1, job: "代理店長",
    desc: "黃泉燒肉店店員，後來當上代理店長，制服是粉紅韓服。生前是大寶的女友、咪咪的主人。",
    movein: { order: 5, resident: "lee", popularity: 180 }, brings: null,
    perk: "燒肉店可多接一桌客人",
    sprite: "art/chars/xiaoyu.png", face: "art/chars/xiaoyu-face.png",
    arrive: [
      [null, "【三途川・黃泉燒肉店】一位穿粉紅韓服的新店員來報到。", "字卡"],
      [null, "我是小雨，今天起在黃泉燒肉店幫忙。", "xiaoyu"],
      ["EP1-06", "我們可不是一家普通的燒肉店哦。", "xiaoyu"],
      [null, "那我可以當第一位客人嗎？", "yutong"],
      [null, "當然可以！先坐一下，我拿菜單給妳。", "xiaoyu"]
    ],
    lines: [
      ["EP1-01", "吃下遺願馬卡龍，你將完成心裡的執念。"],
      ["EP1-06", "我們可不是一家普通的燒肉店哦。"],
      ["EP1-06", "先吃遺願馬卡龍，再吃薯條，讓你幸福到飛天。"],
      ["EP1-07", "沒事沒事，這片土地上，我們不分國籍。"],
      ["EP6-03", "感恩的心。"]
    ] },

  { id: "dabao", name: "大寶", kind: "resident", draw: 1, job: "攝影師",
    desc: "金髮消防員，在山火中殉職，頭七之後在返魂坂的托夢照相館工作。命格天煞孤星。",
    movein: { order: 6, traits: { 思念: 15 } }, brings: "photo",
    perk: "托夢：頭七免費，其他要付功德",
    cutin: "給直升機元氣",
    sprite: "art/chars/dabao.png", face: "art/chars/dabao-face.png",
    arrive: [
      [null, "【三途川・車站前】金髮的亡魂大寶下了車，在空地前站了很久。", "字卡"],
      ["EP1-14", "今天是我的頭七。", "dabao"],
      [null, "我生前是消防員。頭七過了，我想留在這裡，幫亡魂托夢給陽間的人。", "dabao"],
      [null, "到時候，亡魂只要來照相館拍照，就能托夢給還活著的人，把想說的話帶過去。", "dabao"],
      [null, "那這條街就需要一間托夢照相館了！", "yutong"]
    ],
    lines: [
      ["EP2-01", "心裡想著你思念的對象，只要他沒死就可以。"],
      ["EP2-06", "不是頭七的話，要付十點功德。"],
      ["EP2-01", "只要你在地府做好慰靈犬的工作，等功德夠了，就能再來找我托夢。"],
      ["EP2-08", "如果有些事不方便跟人說，可以寫信燒給我，我有空會托夢跟你聊聊。"],
      ["EP1-12", "我們一起給直升機元氣！"]
    ] },

  { id: "baimei", name: "白妹", kind: "resident", draw: 1, job: "理髮師",
    desc: "業鏡羅漢生前的戀人，紫髮黑框眼鏡。活著時剪了五十年百元快剪，死後在碧落髮廊等了他幾十年。念書時愛演話劇。",
    movein: { order: 6, resident: "lee", traits: { 儀容: 10 } }, brings: "salon",
    perk: "頭七整理儀容；和照相館相鄰＝頭七套餐",
    sprite: "art/chars/baimei.png", face: "art/chars/baimei-face.png",
    arrive: [
      [null, "【三途川・黃泉燒肉店旁】紫髮、戴黑框眼鏡的理髮師白妹，正在看隔壁的空地。", "字卡"],
      [null, "我叫白妹，活著的時候剪了五十年的百元快剪喔。", "baimei"],
      [null, "我想在這裡開碧落髮廊。亡魂回去看思念的人之前，也能先打扮得漂漂亮亮。", "baimei"],
      [null, "好啊！就在這裡開一間髮廊吧！", "yutong"]
    ],
    lines: [
      ["EP1-14", "靈魂都想漂亮的回去，看自己思念的人，在碧落髮廊能讓靈魂變的美美的唷。"],
      ["EP1-14", "這杯飲料不能隨便批評，會被判官起訴哦。"],
      ["EP1-14", "我等了他幾十年。"],
      ["EP4-04", "你不要一直做好人，好嗎？"],
      ["EP4-06", "你應該多出來演戲的，待在甜點店感覺太委屈了。"]
    ] },

  { id: "huji", name: "狐姬", kind: "resident", draw: 1, job: "萬能打工王",
    desc: "戴粉紅貓耳、拖粉紅狐尾的狐妖。前世是被紅衣武士救下的白狐，等了赤坂三輩子。三途川的人氣打工王。",
    movein: { popularity: 400, traits: { 娛樂: 20 } }, brings: null,
    perk: "任何店都能補位；接待外賓",
    sprite: "art/chars/huji.png", face: "art/chars/huji-face.png",
    arrive: [
      [null, "【三途川・街口】一位戴粉紅貓耳、拖著粉紅狐尾的狐妖，正在發傳單。", "字卡"],
      [null, "我是狐姬，什麼工都打。這條街這麼熱鬧，一定缺人手吧？", "huji"],
      [null, "缺！非常缺！", "yutong"],
      [null, "那就說好了！哪間店需要幫忙，記得找我喔。", "huji"]
    ],
    lines: [
      ["EP2-06", "是我等了三輩子的人。"],
      ["EP2-06", "我只想要你寬心。"],
      ["EP3-06", "資質好的女生想漂亮，藏拙就好。"],
      ["EP4-04", "這次的任務……得加錢。"],
      ["EP4-10", "我只是導遊，不是伴遊。"],
      ["EP6-05", "我只是不想浪費功德買香，我想多存一點，這樣赤坂武士來到地府，就能帶他到處玩。"]
    ] },

  { id: "jiuwei", name: "九尾", kind: "resident", draw: 1, job: "結界師",
    desc: "狐姬的姐姐，藍色九尾狐，戴眼鏡、愛抽香、護妹狂魔。",
    movein: { resident: "huji", rank: 2, traits: { 安心: 60 } }, brings: "barrier",
    perk: "魔氣暴走、小型入侵時展開結界",
    cutin: "異界降臨・如墜五里霧",
    sprite: "art/chars/jiuwei.png", face: "art/chars/jiuwei-face.png",
    arrive: [
      [null, "【三途川・街口】狐姬的姐姐九尾找上門來。這位藍色九尾狐是結界師，一開口就問妹妹在哪裡。", "字卡"],
      [null, "妳找狐姬？她就在這裡。", "yuelao"],
      [null, "姐？妳怎麼來了？", "huji"],
      [null, "我來看看妳。月老，你可別欺負我妹。", "jiuwei"],
      [null, "我也留下來，在這條街設個結界。有我在，妳就放心吧。", "jiuwei"]
    ],
    lines: [
      ["EP6-04", "敢欺負我妹！"],
      ["EP6-04", "大你妹！"],
      ["EP6-05", "你竟然戒香！妖狐之恥……"],
      ["EP6-05", "戀愛腦。"],
      ["EP6-08", "來了！來吧，結界，開！"]
    ] },

  { id: "yangzi", name: "孟婆", kind: "resident", draw: 1, job: "甜點師",
    desc: "秦王之女陽滋公主陰曼。找不到岳夏澤，喝下自己發明的孟婆湯忘了他，在三途川經營孟婆甜食屋。發明了孟婆湯和遺願馬卡龍。",
    movein: { resident: "no7", traits: { 思念: 40 } }, brings: null,
    perk: "甜點回復安心度",
    sprite: "art/chars/yangzi.png", face: "art/chars/yangzi-face.png",
    arrive: [
      [null, "【三途川・孟婆甜食屋】經營甜食屋的孟婆來了，店員七號正在向月老介紹她。", "字卡"],
      ["EP4-06", "孟婆是很偉大的神，她不止發明孟婆湯和遺願馬卡龍，還研究出各種可以讓靈魂快樂的甜點心。", "no7"],
      [null, "有空來店裡坐坐。七號能感應客人的心情，幫你挑甜點。", "yangzi"],
      [null, "月老看著她的背影，很久都沒有說話。", "字卡"]
    ],
    lines: [
      ["EP4-03", "喜歡我就來找我說話啊，每次來一整個下午，就坐在那邊。"],
      ["EP4-03", "我以前很喜歡看你演戲，為什麼後來不演了？"],
      ["月老外傳-04", "叫我陰曼。"],
      ["角色短片-06", "岳將軍……你要凱旋歸來！"],
      ["EP4-19", "我管他什麼詛咒，我一定要把他找回來！"]
    ] },

  { id: "no7", name: "七號", kind: "resident", draw: 1, job: "甜點店員",
    desc: "辜老師設計的戲之魂偶，有機械手臂。曾是知名演員，因人類排斥魂偶而不再演戲，在孟婆甜食屋工作，能感應客人的情緒推薦甜點。",
    movein: { rank: 1, traits: { 美味: 45 } }, brings: "mengpo",
    perk: "甜食屋推薦最適合的甜點（安心度加成）",
    sprite: "art/chars/no7.png", face: "art/chars/no7-face.png",
    arrive: [
      [null, "【三途川・街上】有著機械手臂的魂偶七號，捧著一盤甜點來找語彤。", "字卡"],
      [null, "我是七號，在孟婆甜食屋工作。我想把店裡的甜點帶來，讓這條街的客人也嚐嚐。", "no7"],
      ["EP4-06", "搭配我感應情緒的能力，可以推薦給客人最適合的甜食。", "no7"],
      [null, "太好了！甜點也是很多亡魂的心願呢。", "yutong"]
    ],
    lines: [
      ["EP4-06", "我是最新型的魂偶，我的靈魂核心可以感受人的情緒。\n感到觀眾開始無聊的時候，我會加些動作，挑起觀眾的情緒。"],
      ["EP4-06", "搭配我感應情緒的能力，可以推薦給客人最適合的甜食。"],
      ["EP4-03", "很多人類說我們是沒有靈魂的魂偶，說我們會搶走人類靈魂的工作。"],
      ["EP4-06", "但謝謝你找我演戲，你讓我想起二號還在的時候，希望還能有下次。"],
      ["EP6-03", "你打烊後來我這邊，帶一些可以安神的甜點回去吧。"]
    ] },

  { id: "du", name: "杜先生", kind: "resident", draw: 1, job: "紋身師",
    desc: "求婚成功隔天被毒駕撞死的紋身師，生前得過幾次獎。被月老請去顧月老紋身三途川分店，想幫助相愛的人。",
    movein: { request: "du-door" }, brings: "tattoo2",
    perk: "分店也能做文印（一天一組）",
    sprite: "art/chars/du.png", face: "art/chars/du-face.png",
    arrive: [
      [null, "【三途川・月老紋身店】生前就是紋身師的杜先生，答應留下來，照顧三途川分店。", "字卡"],
      ["EP2-04", "我想幫助相愛的人。", "du"],
      [null, "有你幫忙，我們就能替更多相愛的人做文印了。", "yuelao"]
    ],
    lines: [
      ["EP2-02", "我不需要慰靈犬。"],
      ["EP2-03", "謝謝你們，我會努力走出來。"],
      ["EP2-04", "我想幫助相愛的人。"],
      ["EP2-13", "文印很累好不好？做一組感覺身體都要崩了。"],
      ["EP2-13", "改天你遇到筱晴，幫我把這朵鬱金香給她。"]
    ] },

  { id: "huatuo", name: "華佗", kind: "resident", draw: 1, job: "醫神",
    desc: "月老的好朋友，發明忘憂舞與忘憂耳機，在東京地下靈界夜店巡迴演出。三途川除咒協會的除咒師。",
    movein: { rank: 3, helped: 150, traits: { 娛樂: 50 } }, brings: "clinic",
    perk: "治療受傷街坊、除咒",
    cutin: "醫者令・鎮魂",
    sprite: "art/chars/huatuo.png", face: "art/chars/huatuo-face.png",
    arrive: [
      [null, "【三途川・街上】月老的好友、醫神華佗，從東京的巡迴演出回來了。他也是三途川除咒協會的除咒師。", "字卡"],
      [null, "好久不見。聽說你收了個徒弟？", "huatuo"],
      [null, "她叫語彤，剛拜我為師。街上要是有亡魂中了詛咒，還得請你幫忙。", "yuelao"],
      ["EP6-08", "在我面前，沒有詛咒可以帶走靈魂。", "huatuo"]
    ],
    lines: [
      ["EP5-21", "希望各位今晚，能享受忘憂舞的快樂。"],
      ["EP6-08", "在我面前，沒有詛咒可以帶走靈魂。"],
      ["EP6-01", "我想發明可以靠唱歌跳舞就治癒憂傷的符文。"],
      ["EP6-01", "兄弟亂我兄弟者…"],
      ["EP6-05", "我打不贏啊！"]
    ] },

  { id: "paofu", name: "泡芙", kind: "resident", draw: 1, job: "刀鋸使領班",
    desc: "刀鋸地獄的刀鋸使領班，業鏡羅漢以前的同事。",
    movein: { map: "daoju" }, brings: "sawhall",
    perk: "解鎖職業「刀鋸使」",
    sprite: "art/chars/paofu.png", face: "art/chars/paofu-face.png",
    arrive: [
      [null, "【三途川・街上】刀鋸地獄的刀鋸使領班泡芙，也來到三途川。", "字卡"],
      [null, "業鏡羅漢以前跟我是同事。你們這條街有需要幫忙的地方嗎？", "paofu"],
      [null, "我們想找個人陪街坊練功，可以拜託你嗎？", "yutong"],
      [null, "沒問題，交給我。", "paofu"]
    ],
    lines: [
      ["EP3-16", "這尊要怎麼處理？"],
      ["EP3-16", "no problem"],
      ["EP4-11", "地府怎麼闖入這麼多惡魔？"],
      ["EP1-15?", "晚點看我手起刀落。"]
    ] },

  { id: "xiaomi", name: "小米", kind: "resident", draw: 1, job: "市役所職員",
    desc: "三途川市役所櫃台人員，對付奧客的專家。",
    movein: { popularity: 200, traits: { 秩序: 15 } }, brings: null,
    perk: "市役所開放轉職窗口；奧客事件改為加分",
    sprite: "art/chars/xiaomi.png", face: "art/chars/xiaomi-face.png",
    arrive: [
      [null, "【三途川・市役所】櫃台人員小米來報到了。", "字卡"],
      [null, "我是小米。申請令旗、辦轉職，都到櫃台找我。", "xiaomi"],
      [null, "那櫃台就拜託妳了！聽說妳最會應付來鬧事的客人。", "yutong"]
    ],
    lines: [
      ["EP2-15", "你的情況還不能申請黑令旗。"],
      ["EP2-15", "你想幹嘛？"],
      ["EP2-15", "不用，小米可是對付奧客的專家喲。", "yuelao"]
    ] },

  { id: "lvyi", name: "綠衣女子", kind: "resident", draw: 2, job: "市役所職員",
    desc: "市役所的職員，會召喚微笑式神。劇中沒有提到名字。",
    movein: { resident: "xiaomi", traits: { 秩序: 30 } }, brings: null,
    perk: "微笑式神：街區防衛",
    cutin: "微笑式神",
    sprite: "art/chars/lvyi.png", face: "art/chars/lvyi-face.png",
    arrive: [
      [null, "【三途川・市役所】一位穿綠衣的職員也來報到了，臉上一直掛著微笑。", "字卡"],
      ["EP4-01?", "世間苦難，微笑面對。", "lvyi"]
    ],
    lines: [
      ["EP4-01?", "世間苦難，微笑面對。"],
      ["EP4-01?", "魔界第二王國的魔王，利維坦，闖入了三途川。"]
    ] },

  { id: "mi", name: "謎", kind: "resident", draw: 1, job: "守宮精靈",
    desc: "守宮廣場的守宮精靈，戴安全帽。因為近親繁殖天生走路不穩，想存功德吃遺願馬卡龍。",
    movein: { building: "gecko" }, brings: null,
    perk: "守宮廣場的工作功德加成",
    sprite: "art/chars/mi.png", face: "art/chars/mi-face.png",
    arrive: [
      [null, "【三途川・守宮廣場】廣場蓋好了，業鏡羅漢帶著大家認識這裡的守宮精靈。", "字卡"],
      ["EP3-03", "這裡由守宮精靈負責維護，是給擅長畫畫的靈魂賺功德的地方。", "lee"],
      ["EP3-03", "他是「謎」，因為近親繁殖而有走路不穩的基因缺陷。", "lee"],
      [null, "戴著安全帽的謎，搖搖晃晃地走了過來。", "字卡"],
      [null, "我想存功德去吃遺願馬卡龍，看看自己完成心願的樣子。", "mi"]
    ],
    lines: [
      ["EP3-08", "我想存功德去吃遺願馬卡龍。"],
      ["EP3-08", "我希望投胎成一隻健康的守宮，在主人面前正常的狩獵。"],
      ["EP3-17", "世界不再旋轉了。"],
      ["EP3-10?", "月老平常看起來懶懶的，沒想到還蠻會辦活動。"]
    ] },

  { id: "nova", name: "諾瓦", kind: "resident", draw: 1, job: "見習畫家",
    desc: "獨角鯨魔族唯一的遺孤，利維坦的養女，戴獨角鯨帽。不喜歡戰鬥，跟語彤學畫畫。",
    movein: { request: "nova-art" }, brings: "manga",
    perk: "語の漫畫：語彤把爸爸燒來的漫畫整理成店，讓諾瓦從喜歡的事入手學畫",
    sprite: "art/chars/nova.png", face: "art/chars/nova-face.png",
    arrive: [
      [null, "【三途川・街上】魔王利維坦的養女諾瓦，戴著獨角鯨帽，抱著畫本跑來找語彤。", "字卡"],
      [null, "大姐姐，我可以跟你學畫畫嗎？", "nova"],
      [null, "可以呀！妳想畫什麼？", "yutong"],
      [null, "我想畫陽間的房子。人類住的地方好漂亮，我想把它們畫下來。", "nova"],
      [null, "好，那我們就從房子開始，一起畫吧！", "yutong"]
    ],
    lines: [
      ["SP4-01", "大姐姐，那兩位神明打得贏我爸嗎？"],
      ["EP4-08", "人類的世界好漂亮哦！\n這麼脆弱的建築，在魔界撐不到三天就毀了。"],
      ["EP4-08", "我也想我媽媽，想念她帶我在海裡抓烏賊。"],
      ["EP4-19", "我這樣可以去你的學院念書嗎？"],
      ["EP4-07", "阿瑪特拉斯。"]
    ] },

  { id: "gongwan", name: "貢丸君", kind: "resident", draw: 2, job: "引渡貓",
    desc: "三途川車站的黑色引渡貓，295 號。",
    movein: { resident: "mimi", popularity: 300 }, brings: null,
    perk: "列車來客 +1",
    sprite: "art/chars/gongwan.png", face: "art/chars/gongwan-face.png",
    arrive: [
      [null, "【三途川・車站】引渡貓咪咪迎來了一位新夥伴，是一隻黑色的引渡貓。", "字卡"],
      [null, "牠是２９５號，貢丸君。以後可以一起幫亡魂帶路了！", "mimi"]
    ],
    lines: [
      ["EP1-03", "這是295號引渡貓「貢丸君」", "lee"],
      ["EP1-03", "老練的橘貓站長，是不會被逗貓棒輕易誘惑。", "lee"]
    ] },

  { id: "cat918", name: "918號", kind: "resident", draw: 2, job: "引渡貓",
    desc: "咪咪隔壁的灰色引渡貓，超吵。",
    movein: { resident: "gongwan", popularity: 600 }, brings: null,
    perk: "列車來客 +1；偶爾和咪咪吵架",
    sprite: "art/chars/cat918.png", face: "art/chars/cat918-face.png",
    arrive: [
      [null, "【三途川・車站】引渡貓咪咪發現，隔壁那隻灰色的９１８號也搬過來了。", "字卡"],
      [null, "怎麼又住隔壁！９１８號超吵，我還想好好睡覺耶。", "mimi"]
    ],
    lines: [
      ["EP1-13", "車站才不好，隔壁的918號超吵。", "mimi"]
    ] },

  /* ───────── 外賓 ───────── */
  { id: "leviathan", name: "利維坦", kind: "guest", draw: 1, job: "嫉妒魔王",
    desc: "魔界第二王國的魔王，七宗罪之嫉妒，藍白長髮。諾瓦的養父，追狐姬追得很勤。",
    movein: { map: "demon2" }, brings: null,
    perk: "出征與保衛戰的援軍（冰牆）",
    cutin: "剪刀　石頭　石頭　石頭",
    sprite: "art/chars/leviathan.png", face: "art/chars/leviathan-face.png",
    arrive: [
      [null, "【三途川・街上】魔界第二王國的嫉妒魔王利維坦，親自來找實習月老語彤。", "字卡"],
      [null, "妳就是會唱歌、也會畫畫的小月老吧？有件事想請教妳。", "leviathan"],
      [null, "……請說。", "yutong"]
    ],
    lines: [
      ["EP4-01", "神魔共體啊，歌畫雙絕的小月老，有事想請教。"],
      ["EP4-07", "我希望諾瓦能變成給魔界帶來美好的人。"],
      ["EP4-10", "你成功引起本王的注意。"],
      ["EP4-17", "是愛讓我變強，而且這裡的書，讓我明白無上戰技。"],
      ["EP4-17", "自古對轟左邊輸啦！"],
      ["EP6-04", "你不喜歡我什麼？跟我說，我可以改啊！"]
    ] },

  { id: "rat", name: "鼠軍師", kind: "guest", draw: 1, job: "第二王國總參謀",
    desc: "魔界第二王國的總參謀，一隻倉鼠，騎粉紅三輪車。喜歡觀音。",
    movein: { map: "demon2" }, brings: null,
    perk: "保衛戰援軍：麻將拳、召喚第二王國戰士",
    cutin: "麻將拳",
    sprite: "art/chars/rat.png", face: "art/chars/rat-face.png",
    arrive: [
      [null, "【三途川・街上】一隻騎著粉紅三輪車的倉鼠來了，正是魔界第二王國的總參謀鼠軍師。", "字卡"],
      [null, "本軍師代表利維坦大人，來跟各位打聲招呼。以後還請多多指教。", "rat"]
    ],
    lines: [
      ["EP4-13", "利維坦大人口才不好，派本軍師前來，跟你們解釋本次的襲擊事件。"],
      ["EP4-16", "看我的麻將拳！"],
      ["EP4-16", "讚啦！豆腐鴨血，冰水一壺。"],
      ["EP4-07", "得罪方丈還想跑？"],
      ["EP6-07", "難道只準魔王放火，不準軍師點燈？"]
    ] },

  { id: "qianliyan", name: "千里眼", kind: "guest", draw: 1, job: "千里眼將軍",
    desc: "媽祖部將，穿羽毛戰袍、胸前寫著「千里」。中元節後來三途川支援接待魔界外賓。",
    movein: { month: 7, rank: 1 }, brings: null,
    perk: "中元節陽間海邊的援手；保衛戰守車站",
    cutin: "silence！",
    sprite: "art/chars/qianliyan.png", face: "art/chars/qianliyan-face.png",
    arrive: [
      [null, "【三途川・街上】中元節過後，媽祖的部將千里眼來支援，幫忙接待魔界外賓。", "字卡"],
      ["EP4-11", "三途川現在這麼嗨哦！", "qianliyan"],
      [null, "歡迎！接待外賓的事，就麻煩千里眼將軍了。", "yutong"]
    ],
    lines: [
      ["EP4-09", "silence！"],
      ["EP4-09", "這是順風耳開發的靜音咒，用了就完全聽不到外界的聲音哦。"],
      ["EP4-09", "小惡魔，把左手伸出來。\n這是媽祖加持過的手串，可以驅散恐懼。"],
      ["EP4-11", "三途川現在這麼嗨哦！"],
      ["EP4-15", "我負責車站，你們兩個負責市中心。"]
    ] },

  { id: "shencha", name: "神差", kind: "guest", draw: 2, job: "埃及死神",
    desc: "柴犬頭的埃及死神阿努柴，哈索爾的部下，常被支開去排隊買和菓子。",
    movein: { month: 8 }, brings: null,
    sprite: "art/chars/shencha.png", face: "art/chars/shencha-face.png",
    arrive: [
      [null, "【三途川・街上】柴犬頭的埃及死神阿努柴，跟著埃及愛神哈索爾來了。大家稱他為神差。", "字卡"],
      [null, "我是神差，哈索爾大人的部下。請多指教。", "shencha"]
    ],
    lines: [
      ["EP2-15", "是魔氣！"],
      ["EP3-08", "不要打了，兩位愛神大人！"]
    ] },

  { id: "hathor", name: "哈索爾", kind: "guest", draw: 2, job: "埃及愛神",
    desc: "埃及愛神，看到魔就會一掌打死，黏著月老。愛神祭期間來訪。",
    movein: { month: 8 }, brings: null,
    sprite: "art/chars/hathor.png", face: "art/chars/hathor-face.png",
    arrive: [
      [null, "【三途川・街上】愛神祭快到了，埃及愛神哈索爾一來就朝月老打招呼。", "字卡"],
      ["EP3-03", "好久不見了，月下底迪。", "hathor"],
      [null, "月老默默躲到了語彤身後。", "字卡"]
    ],
    lines: [
      ["EP3-03", "好久不見了，月下底迪。"],
      ["EP3-10", "我可是有和奈特學過射箭哦。"],
      ["EP3-11", "他們的靈魂好純潔。"],
      ["EP3-12", "月老，離我近一點啦！"]
    ] },

  { id: "aphrodite", name: "阿芙羅黛蒂", kind: "guest", draw: 2, job: "希臘愛神",
    desc: "希臘愛神維納斯，戴月桂冠、拿豎琴，常迷路，和哈索爾互看不順眼。開了收惡魔的藝術學院。",
    movein: { month: 8 }, brings: null,
    sprite: "art/chars/aphrodite.png", face: "art/chars/aphrodite-face.png",
    arrive: [
      [null, "【三途川・車站前】希臘愛神阿芙羅黛蒂戴著月桂冠、抱著豎琴，在車站前迷了路。", "字卡"],
      [null, "我好像又迷路了。那個笨蛋月老，不是說要來接我嗎？", "aphrodite"],
      [null, "這裡是三途川車站喔……我帶您去找師傅吧。", "yutong"]
    ],
    lines: [
      ["EP3-05", "我好像又迷路了。那個笨蛋月老，不是說要來機場接我嗎？"],
      ["EP3-10", "丘比特的弓術還是我教的。"],
      ["EP3-11", "我們還沒比完射氣球。"],
      ["EP4-19", "勉強及格。"]
    ] },

  { id: "aizen", name: "愛染明王", kind: "guest", draw: 2, job: "日本愛神",
    desc: "日本愛神，畫浮世繪，想收語彤當徒弟，送她仿製甘露寶瓶。",
    movein: { month: 8 }, brings: null,
    sprite: "art/chars/aizen.png", face: "art/chars/aizen-face.png",
    arrive: [
      [null, "【三途川・街上】日本愛神愛染明王來了，一路走一路畫。", "字卡"],
      [null, "他在語彤的畫板前停了下來。", "字卡"],
      ["EP3-03", "小妹妹畫的真好！", "aizen"]
    ],
    lines: [
      ["EP3-03", "小妹妹畫的真好！"],
      ["EP3-03", "我想用浮世繪，跟你的素描比賽。"],
      ["EP3-04", "是無我境界啊！"],
      ["EP3-13", "真可惜啊，當我徒弟就不用掃地哦。"],
      ["EP3-13", "改天來日本玩，我教你三味線。"]
    ] },

  /* ───────── 固定角色 ───────── */
  { id: "guanyin", name: "觀音菩薩", kind: "npc", draw: 2, job: "觀音",
    desc: "白西裝、紫白髮。每季最後一週巡察三途川，評定街區；拳又快又狠。",
    sprite: "art/chars/guanyin.png", face: "art/chars/guanyin-face.png",
    lines: [
      ["EP1-05", "客氣什麼，陪我散步一下。"],
      ["EP2-08", "是掛念心悸，當你有特別想念的人，在陽間命懸一線，就會出現這種心悸。"],
      ["EP4-13", "那加上我呢？"],
      ["EP6-01", "你們可不可以成熟點？"],
      ["EP6-07", "兩位救了三途川的大英雄，不要吵架呀。"]
    ] },

  /* ───────── 庚寅地球・高熊市的援手 ───────── */
  { id: "dulao", name: "杜老大", kind: "helper", draw: 2, job: "黑龍堂老大",
    desc: "庚寅地球的杜先生，附身在黑龍興業的黑道老大身上，胸口紋著一條還沒點眼睛的龍。想帶兄弟走正路。",
    map: "gengyin",
    sprite: "art/chars/dulao.png", face: "art/chars/dulao-face.png",
    lines: [
      ["EP5-04", "開心個屁！我的小弟都在室內抽菸。"],
      ["EP5-08", "天使給我的考驗是引導迷途的人們向善，但又不給我像摩西分海的神力。"],
      ["EP5-14", "我們黑龍集團會陪全國人民，一起度過這末日般的疫情。"],
      ["EP5-18", "那就賣他吧，反正這次疫情快結束了。"]
    ] },

  { id: "tiedan", name: "鐵蛋", kind: "helper", draw: 2, job: "靈媒",
    desc: "樓下鐵頭的妹妹，女高中生靈媒，看得到鬼。在大廟學習，很喜歡跟神明相處。",
    map: "gengyin",
    sprite: "art/chars/tiedan.png", face: "art/chars/tiedan-face.png",
    lines: [
      ["EP5-04", "是驅邪！"],
      ["EP5-14", "一二三四，驚到沒代誌！"],
      ["EP5-12", "去心堀江，那裡被不事生產的惡房東亂漲租金，現已變成鬼城。"],
      ["EP5-13", "可以給我條件跟你一樣好的男生嗎？"],
      ["EP5-18", "我去你的哈密瓜！"]
    ] },

  { id: "guangtou", name: "光頭小弟", kind: "helper", draw: 2, job: "黑龍堂第一打手",
    desc: "黑龍興業的光頭小弟，扛球棒，自稱良好市民。",
    map: "gengyin",
    sprite: "art/chars/guangtou.png", face: "art/chars/guangtou-face.png",
    lines: [
      ["EP5-04", "老大以前一天三包，怎麼說戒就戒菸吶？"],
      ["EP5-09", "要不要載你回去休息？為了安置庫存，你這兩天沒怎麼睡。"],
      ["EP5-19", "我是良好市民。"],
      ["EP5-19", "對，司法是母的，有什麼事跟法官說。"]
    ] },

  { id: "gengyin", name: "庚寅月老", kind: "helper", draw: 2, job: "月老爺爺",
    desc: "庚寅時空的月下老人，白髮白鬚，喜歡吃蛋捲。",
    map: "xinkujiang",
    sprite: "art/chars/gengyin.png", face: "art/chars/gengyin-face.png",
    lines: [
      ["EP5-09", "你的神力跟我好像，可否陪老夫散步？"],
      ["EP5-09", "交換一下愛吃的甜食？"],
      ["EP5-13", "不管在哪個朝代，看年輕人談戀愛，都是一件快樂的事。"]
    ] },

  /* ───────── 北境（遠古戰場的記憶）───────── */
  { id: "lucifer", name: "路西法", kind: "helper", draw: 2, job: "第一帝國的傲慢魔王",
    desc: "天族最強戰士。和祝融合力殲滅邪神帝，身負天煞孤星詛咒，自願留在魔界。",
    map: "north",
    sprite: "art/chars/lucifer.png", face: "art/chars/lucifer-face.png",
    lines: [
      ["EP6-02", "我可是天族的最強戰士！"],
      ["EP6-03", "放棄吧，我身上的詛咒你治不好。"],
      ["EP6-03", "我現在已經不是路西法，請稱呼我：第一帝國的傲慢魔王。"]
    ] },

  { id: "zhurong", name: "祝融", kind: "helper", draw: 2, job: "半神隊長",
    desc: "遠古時期的半神隊長，赤帝。",
    map: "north",
    sprite: "art/chars/zhurong.png", face: "art/chars/zhurong-face.png",
    lines: [
      ["EP6-02", "可以跟大天使並肩作戰……\n是我身為半神隊長的光榮。"]
    ] },

  /* ───────── 委託人（亡魂） ───────── */
  { id: "maoguai", name: "毛怪", kind: "client", draw: 3,
    desc: "黑狗，在店裡是穿紫色和服的少女。走在路上被陌生人潑硫酸。",
    sprite: "art/chars/maoguai.png", face: "art/chars/maoguai-face.png",
    lines: [
      ["EP1-01", "我喜歡像你這樣穿圍裙的人，他們都對我好。"],
      ["EP1-01", "如果下輩子我還是狗，可不可以和你一起生活？"]
    ] },
  { id: "xiaole", name: "小樂", kind: "client", draw: 3,
    desc: "討好型人格的女孩，一直怕別人不開心。",
    sprite: "art/chars/xiaole.png", face: "art/chars/xiaole-face.png",
    lines: [
      ["EP1-02", "我只是怕你不開心。"],
      ["EP1-02", "我想吃壽司。"]
    ] },
  { id: "daniu", name: "大牛", kind: "client", draw: 3,
    desc: "光頭，業鏡羅漢生前的兄弟。動盪年代裡出賣了白李米店，想求老大原諒。",
    sprite: "art/chars/daniu.png", face: "art/chars/daniu-face.png",
    lines: [
      ["EP1-04", "我想直接吃遺願馬卡龍。"],
      ["EP1-05", "謝謝你，老大。"]
    ] },
  { id: "moti", name: "茉蒂", kind: "client", draw: 3,
    desc: "戴毛帽的龐克女孩，假裝了十幾年異性戀。不喜歡吃燒肉，只想吃薯條。",
    sprite: "art/chars/moti.png", face: "art/chars/moti-face.png",
    lines: [
      ["EP1-06", "為什麼投胎這麼麻煩啊？我又不喜歡吃燒肉。"],
      ["EP1-06", "超讚的，男生超臭。"]
    ] },
  { id: "abinmom", name: "阿斌的媽媽", kind: "client", draw: 3,
    desc: "菲律賓籍的媽媽，死於九二一地震，放不下兒子阿斌。",
    sprite: "art/chars/abinmom.png", face: "art/chars/abinmom-face.png",
    lines: [
      ["EP1-07", "對不起，我是外國人。"],
      ["EP1-07", "媽媽會等你。"]
    ] },
  { id: "laoren", name: "獨居的爺爺", kind: "client", draw: 3,
    desc: "獨居老人，手邊放著寫了「生日快樂」的紅包。",
    sprite: "art/chars/laoren.png", face: "art/chars/laoren-face.png",
    lines: [
      ["EP1-10", "很讚，不過這樣會很貴嗎？"],
      ["EP1-10", "乖孫長這麼大了，我很快樂。"]
    ] },
  { id: "waipo", name: "外婆", kind: "client", draw: 3,
    desc: "要去投胎了，走之前想托夢看看外孫。",
    sprite: "art/chars/waipo.png", face: "art/chars/waipo-face.png",
    lines: [
      ["EP1-11", "外婆要去投胎了，走之前來看看你。"],
      ["EP1-11", "你該玩就玩，愛做啥就做啥。"]
    ] },
  { id: "couple", name: "男同志情侶", kind: "client", draw: 3,
    desc: "來求愛戀文印的一對戀人。",
    sprite: "art/chars/couple.png", face: "art/chars/couple-face.png",
    lines: [
      ["EP2-04", "希望這次我們投胎到一個沒有歧視的地方。"]
    ] },
  { id: "liangan", name: "梁安恆", kind: "client", draw: 3, map: "gengyin",
    desc: "庚寅地球藍泉高中高二生，因成績壓力上吊，月老的靈魂進了他的身體。喜歡林怡曼。",
    sprite: "art/chars/liangan.png", face: "art/chars/liangan-face.png",
    lines: [
      ["EP5-01", "像我們這種窮家庭，沒有犯錯的資格。"],
      ["EP5-03", "我配不上她。"],
      ["EP5-10", "媽，我愛你，但以後我們能不能互相誠實？"]
    ] },
  { id: "yiman", name: "林怡曼", kind: "client", draw: 3, map: "gengyin",
    desc: "梁安恆身邊的女孩，長得和陰曼一樣。",
    sprite: "art/chars/yiman.png", face: "art/chars/yiman-face.png",
    lines: [
      ["EP5-07", "你太完美了，我喜歡有缺點的安恆。"],
      ["EP5-07", "神明不能說謊哦。"],
      ["EP5-20", "真的很白目，你回去要幸福哦。"]
    ] },

  /* ───────── 陽間的人 ───────── */
  { id: "linbobo", name: "林伯伯", kind: "living", draw: 3,
    desc: "語彤的爸爸，拄拐杖，做木雕。抽到羅漢殿第六十一籤，親手雕了女月老神像。",
    face: "art/chars/linbobo-face.png",
    lines: [
      ["EP3-14", "請業鏡羅漢保佑，保佑我家彤彤無病無痛。"],
      ["EP3-17", "語彤在那邊過得很好，我們就祝福她吧。"]
    ] },
  { id: "bohong", name: "王柏宏", kind: "living", draw: 3,
    desc: "語彤的男友，百米冠軍。",
    face: "art/chars/bohong-face.png",
    lines: [
      ["EP3-09", "大家都說我跑的很快，也無法追回有你的過去。"],
      ["EP3-17", "你還愛我嗎？"]
    ] },
  { id: "afu", name: "阿副", kind: "living", draw: 3,
    desc: "大寶的消防隊同事兼好友，大寶殉職後轉進科技業，得了憂鬱症。",
    face: "art/chars/afu-face.png",
    lines: [
      ["EP1-14", "大寶……任務結束了，好好休息。"],
      ["EP2-08", "大寶，不要走……"]
    ] },
  { id: "xiaoqing", name: "筱晴", kind: "living", draw: 3,
    desc: "杜先生的未婚妻，杜先生死後在醫院當志工。喜歡鬱金香。",
    face: "art/chars/xiaoqing-face.png",
    lines: [
      ["EP2-02", "鬱金香，我要漂亮的鬱金香！"],
      ["角色短片-03", "今天是你的頭七，你會不會回來兌現承諾？"]
    ] },
  { id: "akasaka", name: "赤坂", kind: "living", draw: 3,
    desc: "大寶和阿副的消防隊長，前世是紅衣武士。總在心情不好時夢到一隻小狐狸。",
    face: "art/chars/akasaka-face.png",
    lines: [
      ["EP2-06", "為什麼我每次心情不好，都會夢到你？"],
      ["EP2-14", "如果妳能收到這封信，我想跟妳說一聲：謝謝！"]
    ] }
];
