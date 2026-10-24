// 讀取畫面：開遊戲時等資料與圖載完（有真的進度），選好存檔進遊戲前再短暫出現一次。
// 語彤沿著紅線走，走到底就讀完；下方輪播遊戲小提示。
window.Loading = (function () {
  var L = {}, el, fill, walker, pct, tip, label, tipTimer, shownAt = 0, cur = 0;
  var TIPS = [
    "亡魂頭上的泡泡是心願，蓋對的店他們就會進去。",
    "文印一組 +30 功德，是最多的一種。",
    "送行投胎前先吃燒肉店的遺願馬卡龍，功德 +6。",
    "留下當街坊的亡魂會顧店、巡守打怪，還會自己蓋小屋。",
    "每月底會扣維持費，冥紙別一次花光。",
    "街區特徵夠高，劇中角色就會搬來，帶來自己的店。",
    "年底觀音會來評定，幫助的人數夠就升階。",
    "點一下日期可以切換速度。"
  ];
  var $ = function (id) { return document.getElementById(id); };

  function nextTip() { tip.textContent = "小提示　" + TIPS[Math.floor(Math.random() * TIPS.length)]; }

  L.init = function () {
    el = $("loading"); fill = $("ld-fill"); walker = $("ld-walker"); pct = $("ld-pct"); tip = $("ld-tip"); label = $("ld-label");
    shownAt = Date.now();
    nextTip();
    tipTimer = setInterval(nextTip, 3200);
  };
  // 進度 0～1，只會往前不會倒退
  L.set = function (p) {
    if (!el) return;
    cur = Math.max(cur, Math.min(1, p));
    var w = (cur * 100).toFixed(1) + "%";
    fill.style.width = w; walker.style.setProperty("--p", cur);
    pct.textContent = Math.round(cur * 100) + "%";
  };
  // 至少顯示 minMs，避免一閃而過看不清楚。cb 在開始淡出時呼叫，下面的畫面先準備好
  L.hide = function (minMs, cb) {
    L.set(1);
    var wait = Math.max(0, (minMs || 0) - (Date.now() - shownAt));
    setTimeout(function () {
      if (cb) cb();
      el.classList.add("out");
      setTimeout(function () { el.hidden = true; clearInterval(tipTimer); }, 450);
    }, wait + 250);
  };
  // 再顯示一次（選好存檔後）；圖多半已經載好，跑一段短動畫就收
  L.show = function (text) {
    cur = 0; L.set(0);
    label.textContent = text || "讀取中";
    el.hidden = false; el.classList.remove("out");
    shownAt = Date.now();
    nextTip(); clearInterval(tipTimer); tipTimer = setInterval(nextTip, 3200);
  };
  // 等 Assets 目前排隊的圖載完，邊等邊更新進度（from～to 這一段），最多等 maxMs。
  // minMs：進度條至少花這麼久跑完（圖早就載好時也有走動的感覺）
  L.waitAssets = function (from, to, maxMs, cb, minMs) {
    var t0 = Date.now();
    (function tick() {
      var p = Assets.progress(), r = p.total ? p.done / p.total : 1, el2 = Date.now() - t0;
      if (minMs) r = Math.min(r, el2 / minMs);
      L.set(from + (to - from) * r);
      if (r >= 1 || el2 > maxMs) cb(); else setTimeout(tick, 60);
    })();
  };
  return L;
})();
