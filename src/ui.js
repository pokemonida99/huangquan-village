// DOM 介面：上方列、下方按鈕、各面板、擺放模式、對話框、評定、提示。
window.UI = (function () {
  var UI = {};
  var $ = function (id) { return document.getElementById(id); };
  var T = CFG.TILE;
  var SPEEDS = [1, 2, 4, 0];
  var place = null;          // {def}
  var dlgQ = [], dlgCur = null, dlgIdx = 0, typeT = null;
  var sheetKind = null, sheetArg = null;
  var ITEMS = {
    incense: { name: "安心香", icon: "🕯️", desc: "街上所有亡魂安心度 +25" },
    paper: { name: "紙錢捆", icon: "💴", desc: "冥紙 +300" },
    candy: { name: "遺願糖", icon: "🍬", desc: "一位亡魂安心度直接滿" }
  };
  UI.itemName = function (id) { return (ITEMS[id] || { name: id }).name; };

  UI.init = function () {
    document.querySelectorAll("[data-panel]").forEach(function (b) {
      b.addEventListener("click", function () { b.classList.remove("hl"); UI.toggleMenu(false); UI.openSheet(b.dataset.panel); });
    });
    $("bb-menu").onclick = function () { $("bb-menu").classList.remove("hl"); UI.toggleMenu(); };
    // 介面按鈕的點擊聲（對話框另外有翻頁聲）
    document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("button"); if (b && !b.closest("#dialog") && b.id !== "bb-menu" && !b.dataset.panel) SFX.play("click"); }, true);
    $("sheet-close").onclick = UI.closeSheet;
    $("tb-speed").onclick = UI.toggleSpeed;
    $("tb-date").onclick = UI.toggleSpeed;
    $("place-ok").onclick = confirmPlace;
    $("place-cancel").onclick = UI.cancelPlace;
    $("dialog").addEventListener("click", advanceDialog);
    setInterval(UI.refreshTop, 250);
    function setTop() { document.documentElement.style.setProperty("--top-h", $("topbar").offsetHeight + "px"); }
    setTop(); window.addEventListener("resize", setTop);
  };

  // ---------- 上方列 ----------
  UI.refreshTop = function () {
    var s = G.state; if (!s) return;
    $("tb-money").querySelector("b").textContent = U.fmt(s.money);
    $("tb-money").classList.toggle("neg", s.money < 0);
    $("tb-merit").querySelector("b").textContent = U.fmt(s.merit);
    $("tb-y").textContent = s.year; $("tb-m").textContent = s.month; $("tb-w").textContent = s.week;
    $("tb-helped").querySelector("b").textContent = U.fmt(s.helped);
    $("tb-speed").textContent = s.speed === 0 ? "Ⅱ" : s.speed === 1 ? "▶" : s.speed === 2 ? "▶▶" : "▶▶▶";
    $("tb-speed").classList.toggle("paused", s.speed === 0);
    $("weekbar").querySelector("i").style.width = (s.weekT * 100).toFixed(1) + "%";
    // 右下評價牌：星數＋往下一個位階的幫助人數
    var stars = ""; for (var i = 1; i <= 5; i++) stars += Icons.html(i <= s.star ? "star" : "starOff");
    if ($("g-stars")._v !== s.star) { $("g-stars").innerHTML = stars; $("g-stars")._v = s.star; }
    var cur = D.titles[s.title] || {}, nxt = D.titles[s.title + 1];
    $("g-rank").textContent = (cur.name || "") + (nxt ? "　" + U.fmt(s.helped) + "/" + U.fmt(nxt.helped) : "");
    $("g-bar").style.width = (nxt ? Math.min(100, (s.helped - (cur.helped || 0)) / Math.max(1, nxt.helped - (cur.helped || 0)) * 100) : 100).toFixed(1) + "%";
    var goal = Story.tutorialGoal();
    $("goal").hidden = !goal || UI.dialogOpen(); if (goal && $("goal")._v !== goal) { $("goal").innerHTML = "<em>目標</em>" + U.esc(goal); $("goal")._v = goal; }
    if (sheetKind && sheetKind !== "build" && sheetKind !== "patrol-party" && UI._refreshT++ % 8 === 0) UI.renderSheet(true);
  };
  UI._refreshT = 0;
  UI.toggleSpeed = function () {
    var s = G.state, i = SPEEDS.indexOf(s.speed);
    s.speed = SPEEDS[(i + 1) % SPEEDS.length];
    UI.refreshTop();
  };

  // 消息：開羅式，一次一行、從下方橫幅輪流跑，不擋畫面中間。排太多就跑快一點
  var ribbonQ = [], ribbonOn = false;
  UI.toast = function (msg) {
    ribbonQ.push(String(msg));
    if (ribbonQ.length > 8) ribbonQ.shift();
    if (!ribbonOn) nextRibbon();
  };
  function nextRibbon() {
    var r = $("ribbon"), msg = ribbonQ.shift();
    if (msg == null) { ribbonOn = false; r.classList.remove("on"); return; }
    ribbonOn = true;
    // 開頭的 emoji 拿掉，改成一顆小菱形
    var clean = msg.replace(/^[\u2600-\u27bf\ud83c-\udbff\udc00-\udfff\ufe0f\u200d]+\s*/, "");
    var d = document.createElement("div"); d.className = "rb"; d.innerHTML = "<i class='dot'></i><span>" + Icons.iconize(U.esc(clean)) + "</span>";
    r.innerHTML = ""; r.appendChild(d); r.classList.add("on");
    setTimeout(nextRibbon, ribbonQ.length > 2 ? 1400 : 2600);
  }
  UI.highlight = function (panel) {
    var b = document.querySelector('#bottombar [data-panel="' + panel + '"]') || document.querySelector('#menu [data-panel="' + panel + '"]');
    if (b) b.classList.add("hl");
    if (b && b.closest("#menu") && $("menu").hidden) $("bb-menu").classList.add("hl");
  };
  UI.badge = function (on) { var i = document.querySelector("#reqbtn em"); if (i) i.hidden = !on; };
  UI.toggleMenu = function (on) {
    var m = $("menu"); if (on == null) on = m.hidden;
    if (m.hidden === !on) return;
    m.hidden = !on; $("bb-menu").classList.toggle("on", on);
    SFX.play(on ? "open" : "close");
  };

  // ---------- 亡魂抉擇提示 ----------
  var notices = [];
  UI.noticeCount = function () { return notices.length; };
  UI.notice = function (soul) {
    var el = document.createElement("div");
    el.className = "notice";
    el.innerHTML = "<div><b>" + U.esc(soul.name) + "</b> 安心了，想留下來當街坊</div><div class='row'><button class='stay'>邀請留下</button><button class='go'>送去投胎</button></div>";
    el.querySelector(".stay").onclick = function () { UI.dropNotice(soul); soul.stayAsResident(); };
    el.querySelector(".go").onclick = function () { UI.dropNotice(soul); soul.toReincarnate(); };
    $("notices").appendChild(el);
    notices.push({ soul: soul, el: el });
  };
  UI.dropNotice = function (soul) {
    notices = notices.filter(function (n) { if (n.soul === soul) { n.el.remove(); return false; } return true; });
  };

  // ---------- 面板 ----------
  UI.openSheet = function (kind, arg) {
    UI.cancelPlace(true);
    if (!sheetKind) SFX.play("open");
    sheetKind = kind; sheetArg = arg;
    $("sheet").hidden = false;
    UI.renderSheet();
  };
  UI.closeSheet = function () { if (sheetKind) SFX.play("close"); $("sheet").hidden = true; sheetKind = null; Render.sel = null; };
  UI.sheetOpen = function () { return !!sheetKind; };

  UI.renderSheet = function (soft) {
    var body = $("sheet-body"), title = $("sheet-title");
    var scroll = body.scrollTop;
    var h = "", s = G.state;
    switch (sheetKind) {
      case "build": h = buildHTML(); title.textContent = "建設"; break;
      case "residents": h = residentsHTML(); title.textContent = "居民（街坊 " + G.residents.length + " 人・住處 " + State.plainResidents() + "/" + State.housing() + "）"; break;
      case "resident": h = residentHTML(sheetArg); title.textContent = "街坊"; break;
      case "patrol": h = patrolHTML(); title.textContent = "巡守"; break;
      case "patrol-party": h = partyHTML(sheetArg); title.textContent = "出征準備"; break;
      case "items": h = itemsHTML(); title.textContent = "道具"; break;
      case "settings": h = settingsHTML(); title.textContent = "設定"; break;
      case "info": h = infoHTML(); title.textContent = "情報"; break;
      case "requests": h = requestsHTML(); title.textContent = "委託簿"; UI.badge(false); break;
      case "building": h = buildingHTML(sheetArg); title.textContent = sheetArg.def.name; break;
      case "zone": h = zoneHTML(sheetArg); title.textContent = "擴建"; break;
      default: return;
    }
    if (soft && body._last === h) return;
    body._last = h;
    body.innerHTML = Icons.iconize(h);
    body.scrollTop = scroll;
    bindSheet(body);
    void s;
  };

  // --- 建設 ---
  var buildTab = "all";
  var CATS = [["all", "全部"], ["special", "名店"], ["shop", "商店"], ["food", "飲食"], ["home", "住宿"], ["deco", "裝飾"], ["road", "道路"]];
  // 心願的像素圖示（跟地圖上的泡泡同一套）
  UI.wishIcon = function (w) { var k = { tattoo: "heart", fun: "lantern", gear: "sword" }[w] || w; return Icons.img(k) || k in { eat: 1, rest: 1, shop: 1, prayer: 1, dream: 1, hair: 1, sweets: 1, art: 1, heal: 1, reincarnate: 1, heart: 1, lantern: 1, sword: 1 } ? Icons.html(k) : ((D.wishById[w] || {}).icon || ""); };
  function serveIcons(def) { return def.serves.map(UI.wishIcon).join(""); }
  function traitText(tr) { return Object.keys(tr || {}).map(function (k) { return k + "+" + tr[k]; }).join(" "); }
  // 縮圖用等角圖（美術或程式畫的方塊屋），道路用格子色
  var thumbCache = {};
  function thumb(def) {
    if (def.cat === "road") return "<span class='thumb ph' style='background:" + def.color + "'>" + U.esc(def.name.slice(0, 2)) + "</span>";
    var spr = Render.buildingSprite(def), key = def.id + (spr.art ? "@" : "");
    if (!thumbCache[key]) thumbCache[key] = spr.img.toDataURL ? spr.img.toDataURL() : spr.img.src;
    return "<img class='thumb' src='" + thumbCache[key] + "'>";
  }
  function buildHTML() {
    var h = "<p class='money-hint'>店的收入＝走進店裡的亡魂付的冥紙。心願對得上的店，客人才會進去。每月底會扣維持費。</p><div class='tabs'>" + CATS.map(function (c) { return "<button data-tab='" + c[0] + "' class='" + (buildTab === c[0] ? "on" : "") + "'>" + c[1] + "</button>"; }).join("") + "</div><div class='cards'>";
    var list = D.buildings.filter(function (b) { return !b.fixed && (buildTab === "all" || b.cat === buildTab); });
    var order = function (d) { if (G.state.gifts[d.id]) return 0; if (!Sim.isUnlocked(d)) return 4; if (d.unique && Sim.count(d.id)) return 3; return Sim.canBuild(d) ? 2 : 1; };
    list = list.map(function (d, i) { return { d: d, k: order(d) * 1000 + i }; }).sort(function (a, b) { return a.k - b.k; }).map(function (o) { return o.d; });
    list.forEach(function (def) {
      var why = Sim.canBuild(def), locked = !Sim.isUnlocked(def), gift = G.state.gifts[def.id];
      h += "<button class='card" + (why ? " dis" : "") + (gift ? " gift" : "") + "' data-build='" + def.id + "'>" + thumb(def) +
        "<div class='ci'><b>" + U.esc(locked ? "？？？ " + def.name : def.name) + (gift ? " <em>贈</em>" : "") + "</b>" +
        "<small>" + def.size[0] + "×" + def.size[1] + "　💴" + U.fmt(Sim.costOf(def)) + (def.merit ? "　🪷" + def.merit : "") + (def.upkeep ? "　月維持 " + def.upkeep : "") + "</small>" +
        "<small>" + (serveIcons(def) ? "滿足 " + serveIcons(def) + "　" : "") + (def.price ? "每位客人付 💴" + def.price + "　" : "") + (def.extra.capacity ? "住 " + def.extra.capacity + " 位街坊　" : "") + traitText(def.traits) + "</small>" +
        (why ? "<small class='why'>" + U.esc(why) + "</small>" : "") + "</div></button>";
    });
    return h + "</div><p class='hint'>點一下選建築，拖曳半透明的建築到想要的位置，按「建造」。道路可以連續點。</p>";
  }

  // --- 居民 ---
  function residentsHTML() {
    var h = "<div class='list'>";
    G.residents.forEach(function (r) {
      h += "<button class='row' data-res='" + r.uid + "'>" + faceHTML(r.charId, r.name) + "<div class='ci'><b>" + U.esc(r.name) + "</b> <small>" + U.esc(r.job) + " Lv" + r.lv + "</small>" +
        "<div class='bar'><i style='width:" + Math.round(r.hp / r.maxhp * 100) + "%'></i></div><small>" + stateText(r) + "　擊退 " + r.kills + "</small></div></button>";
    });
    h += "</div>";
    return h;
  }
  UI.rulesHTML = function () {
    return "<details class='rules'" + (G.state.helped < 20 ? " open" : "") + "><summary>遊戲說明</summary><ul>" +
      "<li><b>目標</b>：幫助更多亡魂。文印、托夢、送行投胎、留下當街坊、完成委託都算「幫助」。年底觀音評定，人數夠就升階。</li>" +
      "<li><b>亡魂</b>：搭列車來，頭上的泡泡是心願。蓋對的店，他們就會進去，心願完成就更安心。</li>" +
      "<li><b>冥紙</b> 💴：亡魂在店裡付的錢。用來蓋店、升級，每月底扣維持費。</li>" +
      "<li><b>功德</b> 🪷：做好事累積，蓋名店、擴建、托夢要用。送行投胎給最多。</li>" +
      "<li><b>安心度滿</b>：可以邀請留下當街坊（會自己蓋小屋、幫忙顧店、巡守），或送去投胎拿功德。</li>" +
      "<li><b>街區特徵</b>：每間店會加美味、思念、緣分……特徵夠高，劇中角色就會搬來，帶來自己的店。</li>" +
      "<li><b>評價 ☆</b>：人氣、店數、街坊夠了，觀音巡察時升星，解鎖新建築和擴建。</li></ul></details>";
  };
  function infoHTML() {
    var h = UI.rulesHTML(), tr = State.traits();
    h += "<h3>街區特徵</h3><div class='traits'>" + D.traits.map(function (k) { return "<span>" + k + " <b>" + (tr[k] || 0) + "</b></span>"; }).join("") + "</div>";
    var st = G.state.stats, miss = Story.rankMissing();
    h += "<h3>統計</h3><p class='stats'>人氣 " + U.fmt(State.pop()) + "・送行投胎 " + st.reincarnated + "・文印 " + st.pairs + " 組・托夢 " + st.dreams + "・委託 " + st.requests + "・擊退 " + st.kills + "・遺憾離開 " + st.leftUnhappy + "<br>街上亡魂 " + G.souls.length + "・每班列車約 " + Sim.soulsPerTrain().toFixed(2) + " 位<br>位階：" + (D.titles[G.state.title] || {}).name + "（每週文印 " + Sim.wenyinPerWeek() + " 組，本週已做 " + G.state.pairsWeek + "）" + (G.state.medals ? "・勳章 " + G.state.medals : "") + "<br>下一顆星：" + (miss.length ? miss.join("、") : "條件都達成了，等觀音評定") + "</p>";
    var cb = Sim.activeCombos();
    if (D.combos.length) h += "<h3>緣分組合</h3><div class='traits'>" + D.combos.map(function (c) { var on = cb.indexOf(c) >= 0; return "<span class='" + (on ? "on" : "") + "' title='" + U.esc(c.desc || "") + "'>" + (on ? "✅ " : "") + U.esc(c.name) + "：" + c.need.map(function (id) { return D.bById[id] ? D.bById[id].name : id; }).join("＋") + "</span>"; }).join("") + "</div>";
    return h;
  }
  function stateText(r) {
    if (r.away) return "🏮 出征中";
    return { idle: "閒晃", wander: "散步", toshop: "去逛街", inshop: "逛街中", towork: "去上工", work: "💼 顧店", hunt: "⚔️ 去巡守", fight: "⚔️ 戰鬥中", torest: "回客棧", resting: "💤 休息" }[r.st] || r.st;
  }
  function faceHTML(id, name) {
    var f = id && Assets.face(id);
    if (f) return "<img class='face' src='" + U.esc(f) + "'>";
    return "<span class='face ph'>" + U.esc((name || "?").slice(0, 1)) + "</span>";
  }
  function residentHTML(r) {
    if (!r || G.residents.indexOf(r) < 0) return "<p>這位街坊已經不在了。</p>";
    var h = "<div class='who'>" + faceHTML(r.charId, r.name) + "<div><b>" + U.esc(r.name) + "</b><br><small>" + U.esc(r.job) + "　Lv" + r.lv + "　EXP " + r.exp + "/" + r.expNeed() + "　💴" + r.money + "</small></div></div>";
    h += "<div class='stat6'>" + Resident.STATS.map(function (k) { return "<span>" + k + " <b>" + r.st6[k] + "</b></span>"; }).join("") + "</div>";
    h += "<p class='stats'>HP " + Math.round(r.hp) + "/" + r.maxhp + "・攻擊 " + Math.round(r.atk) + " ×" + r.hits + "・防禦 " + Math.round(r.defn) + "・" + stateText(r) + "</p>";
    var c = r.charId && D.charById[r.charId];
    if (c && c.lines.length) h += "<blockquote>「" + U.esc(c.lines[0].text) + "」<small>" + U.esc(c.lines[0].ep) + "</small></blockquote>";
    if (!r.charId) {
      var cur = r.jobDef();
      var opts = D.jobs.filter(function (j) { return j.name !== r.job && !j.guest && j.line !== "特殊" && j.from && j.from.length && (j.from.indexOf(cur.id) >= 0 || j.from.indexOf(cur.name) >= 0); });
      var hall = G.buildings.some(function (b) { return b.def.extra.jobChange; }) || !D.buildings.some(function (b) { return b.extra.jobChange; });
      h += "<h3>轉職（在市役所辦理，花功德）</h3><div class='cards'>";
      if (!opts.length) h += "<p class='hint'>目前沒有可以轉的職業。</p>";
      opts.forEach(function (j) {
        var why = jobWhy(r, j, hall);
        h += "<button class='card" + (why ? " dis" : "") + "' data-job='" + U.esc(j.name) + "' data-res='" + r.uid + "'><div class='ci'><b>" + U.esc(j.name) + "</b><small>" + U.esc(j.line) + "線　🪷" + (j.cost || 0) + (j.medals ? "　🎖️" + j.medals : "") + "　Lv" + ((j.req && j.req.lv) || 5) + "↑</small><small>" + U.esc(j.effect || "") + "</small>" + (why ? "<small class='why'>" + why + "</small>" : "") + "</div></button>";
      });
      h += "</div>";
    }
    h += "<div class='btns'><button data-act='focus' data-res='" + r.uid + "'>📍 看他在哪</button></div>";
    return h;
  }

  function jobWhy(r, j, hall) {
    var need = (j.req && j.req.lv) || 5;
    if (!hall) return "要先有市役所";
    if (r.lv < need) return "要 Lv" + need;
    if (G.state.merit < (j.cost || 0)) return "功德不夠";
    if ((j.medals || 0) > (G.state.medals || 0)) return "勳章不夠";
    return "";
  }
  // --- 巡守 ---
  function patrolHTML() {
    var s = G.state, h = "";
    if (s.expedition) {
      var m0 = D.maps.find(function (m) { return m.id === s.expedition.map; });
      h += "<p class='notice-in'>🏮 隊伍正在「" + U.esc(m0 ? m0.name : "") + "」，下週回來。</p>";
    }
    h += worldMapHTML();
    h += "<p class='hint'>街坊平常會自己去外圍（荒岸、還沒擴建的區塊）打怪。這裡可以組隊出征（最多 9 人、付旅費、去 " + Battle.WEEKS + " 週，期間來客變少；冥紙低於 " + U.fmt(CFG.EXP_MIN_GOLD) + " 不能出發）。</p><div class='cards maps'>";
    D.maps.forEach(function (m) {
      var open = Battle.mapOpen(m), cl = s.cleared && s.cleared[m.id];
      h += "<button class='card" + (open && !s.expedition ? "" : " dis") + "' data-map='" + m.id + "'><div class='ci'><b>" + U.esc(open ? m.name : "？？？") + (cl ? " ✅" : "") + "</b><small>" + "★".repeat(m.stars || Math.ceil(m.lv / 6)) + "　建議 Lv" + m.lv + (m.boss ? "　王：" + U.esc(open ? m.boss.name : "？") : "") + "</small><small>" + U.esc(open ? (m.desc || m.enemies.map(function (e) { return e.name; }).join("、")) : Battle.openText(m)) + "</small></div></button>";
    });
    h += "</div><h3>街區保衛戰</h3>";
    var canDef = s.star >= 3 || s.debug;
    h += "<p class='hint'>第三王國從車站側入侵，五波自動結算（試作版）。" + (canDef ? "" : "☆3 之後開放。") + "</p><div class='btns'><button data-act='defense' " + (canDef ? "" : "disabled") + ">🛡️ 迎戰</button></div>";
    h += "<h3>外圍</h3><p class='stats'>外圍怪物 " + G.mobs.length + " 隻・累計擊退 " + s.stats.kills + "</p>";
    return h;
  }
  // 世界地圖（E 線 art/tiles/worldmap.png＋worldmap.json；沒有圖就只列卡片）
  var WM = null;
  UI.setWorldmap = function (j) { WM = j; };
  function worldMapHTML() {
    if (!WM || !Assets.get(WM.file || "art/tiles/worldmap.png")) return "";
    var h = "<div class='wmap' style='aspect-ratio:" + WM.w + "/" + WM.h + "'><img src='" + U.esc(WM.file) + "'>";
    WM.places.forEach(function (p) {
      var m = D.maps.find(function (x) { return x.id === p.id || D.MAP_ALIAS[x.id] === p.id || x.name === p.name; });
      var open = p.home || (m && Battle.mapOpen(m));
      var cl = m && Sim.cleared(m.id);
      h += "<button class='pin" + (p.home ? " home" : "") + (open ? "" : " lock") + "' style='left:" + (p.x / WM.w * 100) + "%;top:" + (p.y / WM.h * 100) + "%'" + (m && open && !p.home ? " data-map='" + m.id + "'" : "") + ">" + (open ? "" : "🔒") + U.esc(open ? p.name : "？？？") + (cl ? " ✅" : "") + (m && open ? "<small>" + "★".repeat(m.stars || Math.min(5, Math.ceil(m.lv / 10))) + "</small>" : "") + "</button>";
    });
    return h + "</div>";
  }
  var party = [];
  function partyHTML(m) {
    var h = "<div class='mapban'><b>出征：" + U.esc(m.name) + "</b><br><small>" + U.esc(m.desc || "") + "</small><br><small>建議等級 Lv" + m.lv + "　隊伍 " + party.length + "/9　旅費 💴" + Battle.travelCost(m, party.length) + "</small></div><div class='pgrid'>";
    G.residents.forEach(function (r) {
      var on = party.indexOf(r.uid) >= 0;
      h += "<button class='pm" + (on ? " on" : "") + "' data-pick='" + r.uid + "'>" + faceHTML(r.charId, r.name) + "<b>" + U.esc(r.name) + "</b><small>" + U.esc(r.job) + " Lv" + r.lv + "</small></button>";
    });
    h += "</div><div class='btns'><button class='go' data-act='depart' data-map='" + m.id + "'>出發</button><button data-act='back'>返回</button></div>";
    return h;
  }

  // --- 道具 ---
  function itemsHTML() {
    var s = G.state, h = "<div class='cards'>", any = false;
    Object.keys(ITEMS).forEach(function (id) {
      var n = s.items[id] || 0; if (!n) return; any = true;
      var it = ITEMS[id];
      h += "<button class='card' data-item='" + id + "'><span class='thumb ph'>" + it.icon + "</span><div class='ci'><b>" + it.name + " ×" + n + "</b><small>" + it.desc + "</small></div></button>";
    });
    if (!any) h += "<p class='hint'>沒有道具。街坊在外圍打怪時偶爾會撿到寶箱（看福報）。</p>";
    h += "</div>";
    var acts = Story.activities();
    if (acts.length) {
      h += "<h3>辦活動（花功德，這季 " + (s.activitiesQ || 0) + "/" + ((window.HQ && HQ.activityPerQuarter) || 7) + " 次）</h3><div class='cards'>";
      acts.forEach(function (a) {
        var why = Story.canActivity(a);
        h += "<button class='card" + (why ? " dis" : "") + "' data-act-id='" + a.id + "'><span class='thumb ph'>🎉</span><div class='ci'><b>" + U.esc(a.name) + "</b><small>🪷" + a.merit + "　人氣 +" + (a.popularity || 0) + (a.money ? "　冥紙 +" + a.money : "") + (a.traits ? "　" + traitText(a.traits) : "") + "</small>" + (why ? "<small class='why'>" + U.esc(why) + "</small>" : "") + "</div></button>";
      });
      h += "</div>";
    }
    return h;
  }
  UI.useItem = function (id) {
    var s = G.state;
    if (!s.items[id]) return;
    if (id === "incense") G.souls.forEach(function (so) { so.peace = Math.min(100, so.peace + 25); });
    else if (id === "paper") s.money += 300;
    else if (id === "candy") { var c = G.souls.filter(function (so) { return so.peace < 100 && so.st !== "leave"; }); if (!c.length) return UI.toast("街上沒有需要的亡魂"); U.pick(c).peace = 100; }
    s.items[id]--;
    UI.toast("使用了 " + ITEMS[id].name);
  };

  // --- 設定 ---
  function settingsHTML() {
    var s = G.state, src = D.sources;
    var h = "<div class='btns'>" + SPEEDS.map(function (v) { return "<button data-speed='" + v + "' class='" + (s.speed === v ? "on" : "") + "'>" + (v ? "速度 ×" + v : "暫停") + "</button>"; }).join("") + "</div>";
    h += "<div class='btns'><button data-act='zin'>放大</button><button data-act='zout'>縮小</button><button data-act='home'>回車站</button></div>";
    h += "<div class='btns'><button data-act='names' class='" + (Render.showNames ? "on" : "") + "'>顯示建築名稱</button><button data-act='sfx' class='" + (SFX.isOff() ? "" : "on") + "'>音效 " + (SFX.isOff() ? "關" : "開") + "</button></div>";
    h += "<div class='btns'><button data-act='save'>立即存檔</button><button data-act='reset' class='danger'>重新開始</button></div>";
    h += "<h3>資料來源</h3><p class='stats'>" + Object.keys(src).map(function (k) { return k + "：" + (src[k] === "data" ? "✅ data" : "範例"); }).join("・") + "</p>";
    h += "<h3>說明</h3><p class='hint'>拖曳移動地圖、雙指或滾輪縮放。點亡魂看心願，點建築升級或拆除，點霧裡的牌子擴建。空白鍵暫停。</p>";
    h += "<p class='credit'>非官方粉絲作品。角色與故事出自 IG 劇《黃泉燒肉店》；玩法向開羅《冒險村物語 2》致敬。</p>";
    return h;
  }

  // --- 委託簿 ---
  function requestsHTML() {
    var s = G.state, h = "<div class='list'>";
    var rank = function (r) { var st = (s.requests[r.id] || {}).st; return st === "done" ? 3 : st === "new" ? 1 : Story.requestReady(r) ? 0 : 2; };
    var list = Story.visibleRequests().slice().sort(function (a, b) { return rank(a) - rank(b); });
    var nDone = list.filter(function (r) { return rank(r) === 3; }).length;
    if (nDone > 3) list = list.filter(function (r) { return rank(r) < 3; }).concat(list.filter(function (r) { return rank(r) === 3; }).slice(-3));
    if (nDone) h += "<p class='hint'>已完成 " + nDone + " 件委託。</p>";
    if (!list.length) h += "<p class='hint'>目前沒有委託。</p>";
    list.forEach(function (r) {
      var rs = s.requests[r.id] || {}, done = rs.st === "done", fresh = rs.st === "new", ready = !done && !fresh && Story.requestReady(r);
      h += "<div class='req" + (done ? " done" : "") + "'>" + faceHTML(r.char, r.name) + "<div class='ci'><b>" + U.esc(r.name) + "：" + U.esc(r.title) + "</b> <small>" + U.esc(r.ep || "") + "</small>";
      if (!done) h += "<ul>" + r.need.map(function (n) { return "<li class='" + (Story.needMet(r, n) ? "ok" : "") + "'>" + U.esc(Story.needText(n)) + "</li>"; }).join("") + "</ul>";
      var rw = r.reward || {};
      var mvc = typeof rw.movein === "string" ? D.charById[rw.movein] : null;
      h += "<small>報酬：" + [rw.merit ? "功德 " + rw.merit : "", rw.money ? "冥紙 " + rw.money : "", "幫助 +" + (rw.helped != null ? rw.helped : 1), rw.movein ? (mvc ? mvc.name : "委託人") + " 入住" : "", rw.unlock ? "解鎖建築" : ""].filter(Boolean).join("、") + "</small>";
      if (r.desc && !done) h += "<small>" + U.esc(r.desc) + "</small>";
      if (fresh) h += "<button class='go' data-accept='" + r.id + "'>接受委託</button>";
      if (ready) h += "<button class='go' data-req='" + r.id + "'>完成委託</button>";
      if (done) h += "<small class='ok'>✅ 已完成</small>";
      h += "</div></div>";
    });
    return h + "</div>";
  }

  // --- 建築資訊 ---
  function buildingHTML(b) {
    if (G.buildings.indexOf(b) < 0) return "<p>已經拆掉了。</p>";
    var d = b.def;
    if (d.extra.arrivals) return "<p>" + U.esc(d.desc || "亡魂每天早晚搭列車到這裡。") + "</p><p class='stats'>Lv" + b.lv + "/" + d.maxLv + "・一週 " + Sim.trainsPerWeek() + " 班・每班約 " + Sim.soulsPerTrain().toFixed(2) + " 位・街上亡魂 " + G.souls.length + " 位</p>" + (b.lv < d.maxLv ? "<div class='btns'><button data-act='upgrade'>⬆️ 升級（💴" + U.fmt(Sim.upgradeCost(b)) + "）</button></div>" : "");
    var h = "<div class='who'>" + thumb(d) + "<div><b>" + U.esc(d.name) + "</b> Lv" + b.lv + "/" + d.maxLv + "<br><small>" + ({ special: "名店", shop: "商店", food: "飲食", home: "住宿", deco: "裝飾" }[d.cat] || d.cat) + "　" + d.size[0] + "×" + d.size[1] + "</small></div></div>";
    if (d.desc) h += "<p class='hint'>" + U.esc(d.desc) + "</p>";
    h += "<p class='stats'>售價 " + Math.round(Sim.priceOf(b)) + "・月維持 " + Math.round(Sim.upkeepOf(b)) + "・品質 " + Math.round(Sim.qualityOf(b)) + "・魅力 " + Math.round(Sim.appealOf(b)) +
      (d.work > 0 ? "<br>" + (Sim.staffed(b) ? "💼 有人上班（" + U.esc(b.staffer ? b.staffer.name : "") + "）" : "⚠️ 沒人上班，品質 ×" + CFG.UNSTAFFED) : "") +
      "<br>來客 " + b.visits + "・累計收入 " + U.fmt(b.income) + (serveIcons(d) ? "<br>滿足心願 " + serveIcons(d) : "") + (traitText(d.traits) ? "<br>特徵 " + traitText(d.traits) : "") +
      (b.combos && b.combos.length ? "<br>緣分組合：" + U.esc(b.combos.join("、")) : "") + (b.aura ? "<br>周圍裝飾 品質 +" + b.aura : "") +
      (d.serves.indexOf("tattoo") >= 0 ? "<br>等待文印 " + (b.queue ? b.queue.length : 0) + " 位・本週 " + G.state.pairsWeek + "/" + Sim.wenyinPerWeek() + " 組" : "") +
      (b.closedUntil > State.absWeek() ? "<br>⛔ 暫停營業中" : "") + "</p>";
    h += "<div class='btns'>";
    if (b.lv < d.maxLv) h += "<button data-act='upgrade'>⬆️ 升級（💴" + U.fmt(Sim.upgradeCost(b)) + (Sim.upgradeMerit(b) ? "・🪷" + Sim.upgradeMerit(b) : "") + "）</button>";
    if (b.broken) h += "<button data-act='repair'>🔧 修理（💴" + Math.round(d.cost * 0.3) + "）</button>";
    if (!d.fixed) h += "<button data-act='remove' class='danger'>拆除</button>";
    h += "</div>";
    return h;
  }
  function zoneHTML(z) {
    var r = Sim.expandReq(z), nz = Sim.nextZone();
    if (!nz || nz.id !== z.id) return "<p>要先擴建前面的區塊。</p>";
    return "<p>擴建「" + U.esc(z.name) + "」：需要街區 ☆" + r.star + "、功德 " + r.merit + "。<br>開放後可以蓋建築，原本在那裡的怪會往更外圍退。</p><div class='btns'><button class='go' data-act='expand'>🗺️ 擴建</button></div>";
  }

  function bindSheet(body) {
    body.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { buildTab = b.dataset.tab; UI.renderSheet(); }; });
    body.querySelectorAll("[data-build]").forEach(function (b) {
      b.onclick = function () {
        var def = D.bById[b.dataset.build], why = Sim.canBuild(def);
        if (why) return UI.toast(why);
        UI.startPlace(def);
      };
    });
    body.querySelectorAll("button.row[data-res]").forEach(function (b) { b.onclick = function () { UI.openSheet("resident", resById(+b.dataset.res)); }; });
    body.querySelectorAll("[data-job]").forEach(function (b) {
      b.onclick = function () {
        var r = resById(+b.dataset.res), j = D.jobByName[b.dataset.job];
        if (!r || !j) return;
        var hall = G.buildings.some(function (x) { return x.def.extra.jobChange; }) || !D.buildings.some(function (x) { return x.extra.jobChange; });
        var why = jobWhy(r, j, hall);
        if (why) return UI.toast(why);
        G.state.merit -= j.cost || 0; G.state.medals = (G.state.medals || 0) - (j.medals || 0);
        r.job = j.name; r.lv = Math.max(1, Math.floor(r.lv / 2)); r.exp = 0; r.calc(); r.hp = r.maxhp;
        UI.toast("🎓 " + r.name + " 轉職為「" + j.name + "」"); UI.renderSheet();
      };
    });
    body.querySelectorAll("[data-map]:not([data-act])").forEach(function (b) {
      b.onclick = function () {
        var m = D.maps.find(function (x) { return x.id === b.dataset.map; });
        if (G.state.expedition) return UI.toast("已經有隊伍在外面了");
        if (!Battle.mapOpen(m)) return UI.toast(Battle.openText(m));
        party = G.residents.filter(function (r) { return !r.away; }).sort(function (a, b) { return b.lv - a.lv; }).slice(0, 4).map(function (r) { return r.uid; });
        UI.openSheet("patrol-party", m);
      };
    });
    body.querySelectorAll("[data-pick]").forEach(function (b) {
      b.onclick = function () {
        var id = +b.dataset.pick, i = party.indexOf(id);
        if (i >= 0) party.splice(i, 1); else if (party.length < 9) party.push(id);
        UI.renderSheet();
      };
    });
    body.querySelectorAll("[data-item]").forEach(function (b) { b.onclick = function () { UI.useItem(b.dataset.item); UI.renderSheet(); }; });
    body.querySelectorAll("[data-speed]").forEach(function (b) { b.onclick = function () { G.state.speed = +b.dataset.speed; UI.renderSheet(); }; });
    body.querySelectorAll("[data-accept]").forEach(function (b) { b.onclick = function () { var r = D.requests.find(function (x) { return x.id === b.dataset.accept; }); UI.closeSheet(); Story.acceptRequest(r); UI.renderSheet(); }; });
    body.querySelectorAll("[data-act-id]").forEach(function (b) { b.onclick = function () { var a = D.activities.find(function (x) { return x.id === b.dataset.actId; }); var why = Story.doActivity(a); if (why) UI.toast(why); UI.renderSheet(); }; });
    body.querySelectorAll("[data-req]").forEach(function (b) { b.onclick = function () { var r = D.requests.find(function (x) { return x.id === b.dataset.req; }); UI.closeSheet(); Story.completeRequest(r); }; });
    body.querySelectorAll("[data-act]").forEach(function (b) {
      b.onclick = function () {
        var a = b.dataset.act, why = "";
        if (a === "upgrade") why = Sim.upgrade(sheetArg);
        else if (a === "repair") why = Sim.repair(sheetArg);
        else if (a === "remove") { if (confirm("拆除「" + sheetArg.def.name + "」？不會退錢。")) { Sim.remove(sheetArg); UI.closeSheet(); return; } }
        else if (a === "expand") { why = Sim.expand(sheetArg); if (!why) { UI.closeSheet(); return; } }
        else if (a === "depart") { var m = D.maps.find(function (x) { return x.id === b.dataset.map; }); why = Battle.depart(m, G.residents.filter(function (r) { return party.indexOf(r.uid) >= 0; })); if (!why) { UI.closeSheet(); return; } }
        else if (a === "back") { UI.openSheet("patrol"); return; }
        else if (a === "defense") { UI.closeSheet(); Battle.defense(); return; }
        else if (a === "focus") { var r = resById(+b.dataset.res); if (r && !r.away) { UI.closeSheet(); Render.centerOn(r.px, r.py); } return; }
        else if (a === "zin") Render.zoomAt(Render.cam.z + 1, innerWidth / 2, innerHeight / 2);
        else if (a === "zout") Render.zoomAt(Render.cam.z - 1, innerWidth / 2, innerHeight / 2);
        else if (a === "sfx") { SFX.toggle(); }
        else if (a === "names") { Render.showNames = !Render.showNames; try { localStorage.setItem("hq-village-names", Render.showNames ? "1" : ""); } catch (e) { /* 私密模式 */ } }
        else if (a === "home") { Render.centerOn(15 * T, 6 * T); UI.closeSheet(); return; }
        else if (a === "save") { UI.toast(State.save() ? "💾 已存檔" : "存檔失敗（瀏覽器不讓存）"); return; }
        else if (a === "reset") { if (confirm("確定要從頭開始？目前進度會刪掉。")) { State.wipe(); location.reload(); } return; }
        if (why) UI.toast(why);
        UI.renderSheet();
      };
    });
  }
  function resById(id) { return G.residents.find(function (r) { return r.uid === id; }); }

  // ---------- 擺放模式 ----------
  UI.placing = function () { return !!place; };
  UI.startPlace = function (def) {
    $("sheet").hidden = true; sheetKind = null;
    var c = Render.toWorld(innerWidth / 2, innerHeight / 2);
    place = { def: def };
    Render.ghost = { def: def, x: Math.floor(c.x / T) - Math.floor((def.size[0] - 1) / 2), y: Math.floor(c.y / T) - Math.floor((def.size[1] - 1) / 2) };
    $("placebar").hidden = false;
    $("place-label").innerHTML = U.esc(def.name) + "　" + Icons.html("coin") + " " + U.fmt(Sim.costOf(def)) + "<small>按住建築拖曳，換到想要的位置</small>";
    $("place-ok").hidden = def.cat === "road";
  };
  UI.moveGhost = function (wx, wy) {
    if (!place) return;
    Render.ghost.x = Math.floor(wx / T) - Math.floor((place.def.size[0] - 1) / 2);
    Render.ghost.y = Math.floor(wy / T) - Math.floor((place.def.size[1] - 1) / 2);
  };
  UI.ghostHit = function (w) { var g = Render.ghost; if (!g || !place) return false; var tx = Math.floor(w.x / T), ty = Math.floor(w.y / T); return tx >= g.x && ty >= g.y && tx < g.x + place.def.size[0] && ty < g.y + place.def.size[1]; };
  function confirmPlace() {
    if (!place) return;
    var g = Render.ghost, why = Sim.place(place.def, g.x, g.y);
    if (why) { SFX.play("error"); return UI.toast(why); }
    SFX.play("place");
    var def = place.def;
    if (def.cat !== "road" || Sim.canBuild(def)) UI.cancelPlace();
    else $("place-label").innerHTML = U.esc(def.name) + "　" + Icons.html("coin") + " " + U.fmt(Sim.costOf(def)) + "<small>點地圖繼續鋪，按「取消」結束</small>";
  }
  UI.cancelPlace = function (silent) {
    place = null; Render.ghost = null; $("placebar").hidden = true;
    if (!silent && false) UI.openSheet("build");
  };

  // ---------- 點地圖 ----------
  // 點螢幕：先問 Render 點到哪個人物或建築的圖（等角的屋頂、頭都在格子上方），沒點到才看地面格子
  UI.tapScreen = function (sx, sy) {
    var w = Render.toWorld(sx, sy);
    UI.tapWorld(w.x, w.y, place ? null : Render.pick(sx, sy));
  };
  UI.tapWorld = function (wx, wy, hit) {
    if (UI.blocking()) return;
    UI.toggleMenu(false);
    var tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    if (place) {
      UI.moveGhost(wx, wy);
      if (place.def.cat === "road") confirmPlace();
      return;
    }
    var he = hit && hit.e;
    // 等待抉擇的亡魂
    var soul = he && he.kind === "soul" ? he : null;
    if (soul && soul.st === "decide") { soulChoice(soul); return; }
    var res = he && he.kind !== "soul" && he.kind !== "mob" ? he : null;
    if (res) { UI.openSheet("resident", res); return; }
    if (hit && hit.b) { Render.sel = hit.b; UI.openSheet("building", hit.b); return; }
    if (soul) { var w = soul.wish(); UI.toast("👻 " + soul.name + "　安心度 " + Math.round(soul.peace) + "　" + (w ? "心願：" + soul.wishes.map(function (x) { return (D.wishById[x] || { icon: "", name: x }).icon + (D.wishById[x] || { name: x }).name; }).join("、") : "心願都完成了") + "　💴" + soul.money); return; }
    if (MapGen.inb(tx, ty)) {
      var uid = MapGen.occ[MapGen.idx(tx, ty)];
      var b = uid && G.buildings.find(function (x) { return x.uid === uid; });
      if (b) { Render.sel = b; UI.openSheet("building", b); return; }
      var z = MapGen.zones[MapGen.zone[MapGen.idx(tx, ty)]];
      if (z && !z.wild && !MapGen.zoneOpen(z.id)) { UI.openSheet("zone", z); return; }
    }
    UI.closeSheet();
  };
  function soulChoice(soul) {
    UI.modal("<div class='mbox'><h3>✨ " + U.esc(soul.name) + "</h3><p>安心度滿了。要邀請這位亡魂留下來當街坊，還是送去投胎？</p><p class='hint'>留下：多一位會工作、巡守的街坊（住處 " + State.plainResidents() + "/" + State.housing() + "）。投胎：得到功德。兩種都算幫助一人。</p><div class='btns'><button class='go' id='m-stay'>邀請留下</button><button id='m-go'>送去投胎</button></div></div>", function (m) {
      m.querySelector("#m-stay").onclick = function () { UI.closeModal(); if (soul.st !== "decide") return; UI.dropNotice(soul); soul.stayAsResident(); };
      m.querySelector("#m-go").onclick = function () { UI.closeModal(); if (soul.st !== "decide") return; UI.dropNotice(soul); soul.toReincarnate(); };
    });
  }

  // ---------- 對話框（開羅式：頭像＋名字＋逐字） ----------
  UI.dialog = function (d, cb) { d = Object.assign({}, d, { lines: Story.filterLines(d.lines || []) }); dlgQ.push({ d: d, cb: cb }); if (!dlgCur) nextDialog(); };
  UI.dialogOpen = function () { return !!dlgCur; };
  function nextDialog() {
    dlgCur = dlgQ.shift() || null;
    if (dlgCur && !dlgCur.d.lines.length) { var cb0 = dlgCur.cb; dlgCur = null; if (cb0) cb0(); if (!dlgCur) nextDialog(); return; }
    if (!dlgCur) { $("dialog").hidden = true; return; }
    dlgIdx = 0;
    var t = dlgCur.d.title;
    $("dlg-title").hidden = !t; $("dlg-title").textContent = t || "";
    $("dialog").hidden = false;
    showLine();
  }
  function showLine() {
    var l = dlgCur.d.lines[dlgIdx] || { who: "", text: "" };
    var id = l.id || Story.charIdByName(l.who);
    $("dlg-face").innerHTML = faceHTML(id, l.who || "…");
    $("dlg-face").dataset.id = id || "";
    $("dlg-name").textContent = l.who ? l.who + "：" : "";
    $("dlg-ep").textContent = "";   // 獨立遊戲：不在對話裡標集數（資料裡還留著出處）
    $("dialog").classList.toggle("narr", !l.who);
    var el = $("dlg-line"), full = l.text || "", i = 0;
    clearInterval(typeT);
    el.textContent = ""; el.dataset.full = full;
    typeT = setInterval(function () { i++; el.textContent = full.slice(0, i); if (i >= full.length) clearInterval(typeT); }, 28);
    // 頭像可能晚一點才載入
    setTimeout(function () { if (dlgCur && $("dlg-face").dataset.id === (id || "") && id && Assets.face(id)) $("dlg-face").innerHTML = faceHTML(id, l.who); }, 400);
  }
  function advanceDialog() {
    if (!dlgCur) return;
    SFX.play("tick");
    var el = $("dlg-line");
    if (el.textContent.length < (el.dataset.full || "").length) { clearInterval(typeT); el.textContent = el.dataset.full; return; }
    dlgIdx++;
    if (dlgIdx >= dlgCur.d.lines.length) { var cb = dlgCur.cb; dlgCur = null; $("dialog").hidden = true; if (cb) cb(); if (!dlgCur) nextDialog(); }
    else showLine();
  }

  // ---------- 彈窗：評定、戰果 ----------
  var modalQ = [];
  UI.modal = function (html, onShow) {
    var m = $("modal");
    if (!m.hidden) { modalQ.push([html, onShow]); return; }
    m.innerHTML = html; m.hidden = false;
    m.querySelectorAll("[data-close]").forEach(function (b) { b.onclick = UI.closeModal; });
    if (onShow) onShow(m);
  };
  UI.closeModal = function () { var m = $("modal"); m.hidden = true; m.innerHTML = ""; if (modalQ.length) { var q = modalQ.shift(); UI.modal(q[0], q[1]); } };
  // 測試用：把排隊中的對話、彈窗全部按掉（選第一個選項）
  UI.skipAll = function () {
    for (var guard = 0; guard < 500; guard++) {
      if (dlgCur) { clearInterval(typeT); $("dlg-line").textContent = $("dlg-line").dataset.full || ""; dlgIdx = dlgCur.d.lines.length - 1; advanceDialog(); continue; }
      var m = $("modal");
      if (!m.hidden) { var b = m.querySelector("[data-ch]:not([disabled]), [data-close], #m-go"); if (b) b.click(); else UI.closeModal(); continue; }
      break;
    }
  };
  UI.blocking = function () { return !!dlgCur || !$("modal").hidden; };

  UI.review = function (r, cb) {
    SFX.play("fanfare");
    var gface = Assets.face("guanyin");
    var h = "<div class='review'><div class='gy'>" + (gface ? "<img src='" + gface + "'>" : "<span>🪷</span>") + "</div><div class='scroll'><h2>" + U.esc(r.title) + "</h2><table>" +
      r.rows.map(function (x) { return "<tr><td>" + x[0] + "</td><td>" + x[1] + "</td><td>" + x[2] + "</td></tr>"; }).join("") + "</table>" +
      "<p class='tr'>街區特徵：" + U.esc(r.traits) + "</p>" +
      (r.grade ? "<div class='grade'>評等 <b>" + U.esc(r.grade) + "</b><small>" + U.esc(r.score) + "</small></div>" : "") +
      (r.starUp ? "<div class='up'>評價 " + "★".repeat(r.starUp) + " 升級！</div>" : "") +
      (r.titleUp ? "<div class='up'>升階：" + U.esc(r.titleUp) + "！</div>" : "") +
      "<p class='rw'>🎁 獎勵：" + U.esc(r.reward) + "</p>" +
      r.notes.map(function (n) { return "<p class='note'>" + U.esc(n) + "</p>"; }).join("") +
      "<p class='gq'>觀音：「" + U.esc(r.comment) + "」</p><div class='btns'><button class='go' data-close>謝謝觀音</button></div></div></div>";
    UI.modal(h, function (m) { m.querySelector("[data-close]").onclick = function () { UI.closeModal(); if (cb) cb(); }; });
  };
  UI.battleResult = function (r, cb) {
    UI.modal("<div class='mbox battle'><h3>" + U.esc(r.title) + "</h3><div class='log'>" + r.log.map(function (l) { return "<div>" + U.esc(l) + "</div>"; }).join("") + "</div>" + (r.reward ? "<p class='rw'>🎁 " + U.esc(r.reward) + "</p>" : "") + "<div class='btns'><button class='go' data-close>好</button></div></div>", function (m) { m.querySelector("[data-close]").onclick = function () { UI.closeModal(); if (cb) cb(); }; });
  };
  return UI;
})();
