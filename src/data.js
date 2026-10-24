// 把 window.HQ（B、C 線的資料）和 HQ_SAMPLE 合成引擎用的 D。
// 每一項：HQ 有就用 HQ 的，沒有就用範例；欄位缺的補預設值。格式寬鬆接受。
window.D = {};

(function () {
  var DEFAULT_WISH_ICON = { eat: "🍖", sweets: "🍡", dream: "📷", hair: "✂️", tattoo: "❤️", rest: "💤", shop: "🏮", art: "🎨", reincarnate: "🌸", fun: "🎲", prayer: "🪔", pray: "🪔", heal: "💔", gear: "🗡️" };
  var CAT_COLOR = { special: "#a8242e", shop: "#c08a52", food: "#e2b65a", home: "#5f5a8a", deco: "#4f7a3a", road: "#8f86a6" };
  // 地圖 id：B 線（mapLevels）、E 線（worldmap.json）、範例 三套命名對照
  D.MAP_ALIAS = { daoju: "saw", gengyin: "gaoxiong", xinkujiang: "xinjue", relic: "ruins" };

  function arr(v) { return Array.isArray(v) ? v : v && typeof v === "object" ? Object.keys(v).map(function (k) { var o = v[k]; if (o && typeof o === "object" && !o.id) o.id = k; return o; }) : []; }
  function src(key) {
    var h = window.HQ && HQ[key];
    if (h && (Array.isArray(h) ? h.length : Object.keys(h).length)) return { v: h, from: "data" };
    return { v: HQ_SAMPLE[key], from: "sample" };
  }

  // 台詞：C 線格式 [集數|null, 句子, 說話者id?]；範例格式 [說話者, 句子]；也接受 {who, text, ep} 與字串
  function isEp(a) { return a === null || (typeof a === "string" && /^(EP|SP|外傳|月老外傳|番外)|^\S*\d+-\d+\??$/.test(a)); }
  D.normLine = function (l, defaultId) {
    var who = "", id = "", text = "", ep = "", cond = null;
    if (typeof l === "string") text = l;
    else if (Array.isArray(l)) {
      cond = l[3] && typeof l[3] === "object" ? l[3] : null;   // 第 4 欄：{ resident: id } 有入住才講、{ absent: id } 沒入住才講
      if (isEp(l[0])) { ep = l[0] || ""; text = l[1] || ""; id = l[2] || defaultId || ""; }
      else { id = l[0] || ""; text = l[1] || ""; ep = l[2] || ""; }
    } else if (l && typeof l === "object") { id = l.id || l.who || l.speaker || l.char || defaultId || ""; text = l.text || l.line || ""; ep = l.ep || ""; }
    var guess = /\?$/.test(ep);
    if (guess) ep = ep.replace(/\?$/, "");
    var c = D.charById && D.charById[id];
    who = c ? c.name : id;
    if (id === "字卡") who = "";
    return { who: who, id: c ? c.id : "", text: text, ep: ep, guess: guess, cond: cond };
  };
  D.normLines = function (lines, who) { return arr(lines).map(function (l) { return D.normLine(l, who); }); };

  D.init = function () {
    D.sources = {};
    function take(key) { var s = src(key); D.sources[key] = s.from; return s.v; }

    // ---- 經濟常數：HQ.balance 覆蓋 CFG ----
    var B = (window.HQ && HQ.balance) || {};
    D.balance = B;
    var map = { startMoney: "START_MONEY", startMerit: "START_MERIT", startHousing: "START_HOUSING", trainsPerWeek: "TRAINS_PER_WEEK", soulCap: "SOUL_CAP",
      visitsMax: "VISITS_MAX", peaceWish: "PEACE_WISH", peaceOther: "PEACE_OTHER", stayChance: "STAY_CHANCE", popPerVisit: "POP_PER_VISIT", popPerHelp: "POP_PER_HELP" };
    Object.keys(map).forEach(function (k) { if (B[k] != null) CFG[map[k]] = B[k]; });
    CFG.SOULS_BASE = B.soulsBase != null ? B.soulsBase : 0.7;
    CFG.SOULS_PER_POP = B.soulsPerPop || 700;
    CFG.SOULS_CAP_TRAIN = B.soulsCapPerTrain || 6;
    CFG.WALLET_BASE = B.walletBase || 100; CFG.WALLET_PER_POP = B.walletPerPop || 0.05;
    CFG.WISH_COUNT = B.wishCount || [0.4, 0.6];
    CFG.START_PEACE = B.startPeace != null ? B.startPeace : 15;
    CFG.QREF = B.qualityRef || 25; CFG.QF_MIN = B.qfMin || 0.5; CFG.QF_MAX = B.qfMax || 1.4;
    CFG.SENDOFF_MERIT = B.sendoffMerit != null ? B.sendoffMerit : CFG.REINCARNATE_MERIT;
    CFG.MACARON_MUL = B.macaronMul || CFG.REINCARNATE_MERIT_YAKINIKU;
    CFG.POP_UNHAPPY = B.popPerUnhappy != null ? B.popPerUnhappy : -0.3;
    CFG.POP_FROM_APPEAL = B.popFromAppeal != null ? B.popFromAppeal : 0;
    CFG.LV = Object.assign({ price: 0.22, quality: 0.12, appeal: 0.08, upkeep: 0.2, upgradeCost: 0.6, upgradeMerit: 0, traits: 0.15 }, B.lv || {});
    CFG.UNSTAFFED = B.unstaffedQualityMul || 1;
    CFG.EXP_MIN_GOLD = B.expeditionMinGold || 500;
    CFG.GENERIC_CAP = B.genericCapByStar || [99, 99, 99, 99, 99, 99];

    D.traits = arr(take("traits")).map(function (t) { return typeof t === "string" ? t : t.name || t.id; });

    D.wishes = arr(take("wishes")).map(function (w) {
      if (typeof w === "string") w = { id: w };
      return Object.assign({}, w, { id: w.id, name: w.name || w.id, icon: w.icon || DEFAULT_WISH_ICON[w.id] || "💭", weight: w.weight == null ? 1 : w.weight });
    });
    D.wishById = {};
    D.wishes.forEach(function (w) { D.wishById[w.id] = w; });

    D.buildings = arr(take("buildings")).map(function (b) {
      var size = Array.isArray(b.size) ? b.size : [1, 1];
      var sprite = b.sprite || "art/buildings/" + b.id + ".png";
      var tile = null;
      if (b.cat === "road") {
        var h = (sprite.split("#")[1] || b.id || "");
        tile = /red/.test(h) ? "redline" : /dirt/.test(h) ? "dirt" : "stone";
      }
      return Object.assign({
        cat: "shop", cost: 500, upkeep: 0, merit: 0, price: 0, quality: 5, appeal: 5, maxLv: 10,
        traits: {}, serves: [], unique: false, unlock: { start: true }, work: 0, extra: {}
      }, b, {
        size: [Math.max(1, size[0] | 0), Math.max(1, size[1] | 0)],
        serves: arr(b.serves), traits: b.traits || {}, extra: b.extra || {},
        color: b.color || CAT_COLOR[b.cat] || "#8a5a36",
        sprite: sprite.indexOf("#") >= 0 ? "" : sprite, tile: tile,
        fixed: !!b.fixed || b.cat === "fixed"
      });
    });
    // 車站一定要有（B 的資料有就用 B 的）；沒有道路就補一條
    if (!D.buildings.some(function (b) { return b.id === "station"; })) {
      D.buildings.push({ id: "station", name: "三途站", cat: "special", fixed: true, size: [3, 2], cost: 0, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 0, maxLv: 1, traits: {}, serves: [], unique: true, unlock: { start: true }, extra: {}, work: 0, color: "#3a355c", sprite: "art/buildings/station.png" });
    }
    if (!D.buildings.some(function (b) { return b.cat === "road"; })) {
      D.buildings.unshift({ id: "road-stone", name: "石板路", cat: "road", tile: "stone", size: [1, 1], cost: 10, upkeep: 0, merit: 0, price: 0, quality: 0, appeal: 0, maxLv: 1, traits: {}, serves: [], unlock: { start: true }, extra: {}, work: 0, color: "#8f86a6", sprite: "" });
    }
    // 美術索引的尺寸跟資料不一樣時，以資料為準，但記下來（E 線照 B 的 size 出圖）
    D.bById = {};
    D.buildings.forEach(function (b) { D.bById[b.id] = b; });
    var bidx = HQ.artIndex && HQ.artIndex.buildings;
    if (bidx) D.buildings.forEach(function (b) { var e = bidx[b.id]; if (e && e.damaged) b.damaged = e.damaged; });
    // 有人服務、沒人定義的心願也補進清單，泡泡才畫得出來
    D.buildings.forEach(function (b) { b.serves.forEach(function (s) { if (!D.wishById[s]) { var w = { id: s, name: s, icon: DEFAULT_WISH_ICON[s] || "💭", weight: 1 }; D.wishes.push(w); D.wishById[s] = w; } }); });

    D.combos = arr((window.HQ && HQ.combos) || []);

    D.baseStats = (window.HQ && HQ.baseStats) || { 魂力: 40, 膽量: 8, 手藝: 6, 定力: 5, 靈力: 4, 福報: 5 };
    D.expCurve = (window.HQ && HQ.expCurve) || { base: 12, pow: 1.45 };
    D.jobs = arr(take("jobs")).map(function (j) {
      var g = j.growth || {};
      return Object.assign({ line: "服務", from: [], cost: 0, req: {} }, j, { growth: { 魂力: g.魂力 || 6, 膽量: g.膽量 || 1.5, 手藝: g.手藝 || 1, 定力: g.定力 || 1.2, 靈力: g.靈力 || 1, 福報: g.福報 || 1 } });
    });
    D.jobByName = {};
    D.jobs.forEach(function (j) { D.jobByName[j.name] = j; D.jobByName[j.id] = j; });
    if (!D.jobByName["新魂"]) { var nj = { id: "newsoul", name: "新魂", line: "服務", growth: { 魂力: 7, 膽量: 1.6, 手藝: 0.8, 定力: 1.2, 靈力: 1, 福報: 1 }, from: [], cost: 0, req: {} }; D.jobs.unshift(nj); D.jobByName["新魂"] = nj; D.jobByName.newsoul = nj; }

    D.ranks = arr(take("ranks")).map(function (r, i) { return Object.assign({ star: i + 1, popularity: [300, 1000, 2200, 3500, 6000][i] || 9999 }, r); }).sort(function (a, b) { return a.star - b.star; });

    var titles = (window.HQ && HQ.titles && HQ.titles.length) ? HQ.titles : HQ_SAMPLE.titles;
    var req = (window.HQ && (HQ.titleReq || HQ.titleHelped)) || null;
    D.titles = titles.map(function (t, i) {
      var o = typeof t === "string" ? { name: t } : Object.assign({}, t);
      if (o.helped == null) o.helped = req ? (req[i] && req[i].helped != null ? req[i].helped : req[i]) : [0, 80, 250, 600][i];
      // 文印組數：B 用「每週」，範例用「每天」→ 一律換成每週
      if (o.wenyinPerWeek == null) o.wenyinPerWeek = (o.pairs || CFG.TITLE_PAIRS[i] || 3) * 7;
      return o;
    });

    // 角色先建索引（台詞要用名字）
    var rawChars = arr(take("chars"));
    D.charById = {};
    rawChars.forEach(function (c) { D.charById[c.id] = c; });
    D.chars = rawChars.map(function (c) {
      var o = Object.assign({}, c, {
        sprite: c.sprite || "art/chars/" + c.id + ".png",
        face: c.face || "art/chars/" + c.id + "-face.png"
      });
      return o;
    });
    D.charById = {};
    D.chars.forEach(function (c) { D.charById[c.id] = c; D.charById[c.name] = c; });
    D.chars.forEach(function (c) { c.lines = D.normLines(c.lines, c.id); c.arrive = D.normLines(c.arrive || [], c.id); });

    D.requests = arr(take("requests")).map(function (r) {
      var ch = D.charById[r.char];
      return Object.assign({}, r, {
        name: r.name || (ch && ch.name) || r.char || "",
        need: arr(r.need), reward: r.reward || {}, when: r.when || {},
        lines: D.normLines(r.lines, r.char), intro: D.normLines(r.intro || [], r.char)
      });
    });

    D.events = arr(take("events")).map(function (e) {
      return Object.assign({}, e, { when: e.when || {}, lines: D.normLines(e.lines), effect: e.effect || {},
        choice: arr(e.choice).map(function (c) { return Object.assign({}, c, { lines: D.normLines(c.lines || []) }); }) });
    });
    D.eventById = {};
    D.events.forEach(function (e) { D.eventById[e.id] = e; });

    // 行事曆：C 線是 [{month, events:[…]}]；範例是扁平 [{month, …}]
    var cal = take("calendar"), calList = [];
    arr(cal).forEach(function (m) {
      if (m && Array.isArray(m.events)) m.events.forEach(function (e) { calList.push(Object.assign({ month: m.month }, e)); });
      else if (m) calList.push(m);
    });
    D.calendar = calList.filter(function (e) { return !e.review; }).map(function (e, i) {
      return Object.assign({ id: e.id || "cal" + i }, e, { month: +(e.month || 1), week: +(e.week || 1), lines: D.normLines(e.lines), effect: e.effect || {}, when: e.when || {},
        choice: arr(e.choice).map(function (c) { return Object.assign({}, c, { lines: D.normLines(c.lines || []) }); }) });
    });

    // 出征地圖：敵人可以是 HQ.enemies 的 id
    var enemies = {};
    arr((window.HQ && HQ.enemies) || []).forEach(function (e) { enemies[e.id] = e; });
    D.enemyById = enemies;
    var lvTab = (window.HQ && HQ.mapLevels) || {}, costTab = (window.HQ && HQ.travelCost) || {};
    function lookup(tab, id) { if (tab[id] != null) return tab[id]; for (var k in D.MAP_ALIAS) if (D.MAP_ALIAS[k] === id && tab[k] != null) return tab[k]; return null; }
    D.maps = arr(take("maps")).map(function (m, i) {
      var lv = m.lv || m.level || m.recLv || lookup(lvTab, m.id) || (m.stars ? m.stars * 3 : 3 + i * 3);
      function mob(e) {
        if (typeof e === "string") return enemies[e] ? Object.assign({}, enemies[e]) : { name: e };
        if (e && e.id && enemies[e.id]) return Object.assign({}, enemies[e.id], e, { name: e.name || enemies[e.id].name });
        return Object.assign({}, e, { name: e.name || e.id });
      }
      var en = arr(m.enemies).map(mob);
      // 台詞可以是陣列（出發時播）或 { intro, mid, boss, clear, epilogue }
      var scenes = {};
      if (m.lines && !Array.isArray(m.lines)) Object.keys(m.lines).forEach(function (k) { scenes[k] = D.normLines(m.lines[k]); });
      else scenes.intro = D.normLines(m.lines || m.intro || []);
      var helpers = arr(m.helpers).map(function (h) { var id = typeof h === "string" ? h : h.id; var c = D.charById[id]; return { id: id, name: c ? c.name : (h.name || id), need: h.need || null }; });
      return Object.assign({}, m, { lv: lv, open: m.open || m.unlock || { start: true }, enemies: en, mid: m.mid ? mob(m.mid) : null, boss: m.boss ? mob(m.boss) : null, helpers: helpers,
        scenes: scenes, lines: scenes.intro || [], travel: m.travel || m.cost || lookup(costTab, m.id),
        reward: m.reward || {} });
    });

    D.defense = (window.HQ && HQ.defense) || null;
    D.mobs = arr((window.HQ && HQ.mobs && HQ.mobs.length) ? HQ.mobs : HQ_SAMPLE.mobs);
    D.zoneMul = (window.HQ && HQ.zoneMul) || [1, 1.6, 2.4, 3.4];

    D.tutorial = arr((window.HQ && HQ.tutorial) || []).map(function (t) { return Object.assign({}, t, { lines: D.normLines(t.lines) }); });
    D.review = (window.HQ && HQ.review) || null;
    D.reviewScenes = (window.HQ && HQ.reviewScenes) || null;
    D.reviewTasks = arr((window.HQ && HQ.reviewTasks) || []);
    D.activities = arr((window.HQ && HQ.activities) || []);
    D.honors = arr((window.HQ && HQ.honors) || []);
  };
})();
