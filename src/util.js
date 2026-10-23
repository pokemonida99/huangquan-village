// 小工具與可調參數。CFG 是引擎層的節奏常數；建築、職業數值以 HQ.* 資料為準。
window.U = {
  rand: function (a, b) { return a + Math.random() * (b - a); },
  randi: function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  pickWeighted: function (arr, w) {
    var t = 0, i;
    for (i = 0; i < arr.length; i++) t += Math.max(0, w(arr[i]));
    if (t <= 0) return arr.length ? U.pick(arr) : null;
    var r = Math.random() * t;
    for (i = 0; i < arr.length; i++) { r -= Math.max(0, w(arr[i])); if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  },
  clamp: function (v, a, b) { return v < a ? a : v > b ? b : v; },
  fmt: function (n) { return Math.round(n).toLocaleString("en-US"); },
  esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); },
  uid: (function () { var n = 1; return function () { return n++; }; })(),
  setUidFloor: function (v) { var cur = U.uid(); while (cur < v) cur = U.uid(); }
};

window.CFG = {
  TILE: 32,
  W: 32, H: 48,
  WEEK_SEC: 30,             // 一週幾秒（x1 速度）
  TRAINS_PER_WEEK: 14,      // 一天早晚兩班 × 7 天
  SOUL_CAP: 40,
  SOUL_SPEED: 2.2,          // 格／秒
  START_MONEY: 3000,
  START_MERIT: 50,
  START_HOUSING: 2,         // 語彤自己的小屋可住的街坊數（不含主要角色）
  PEACE_WISH: 38,           // 滿足心願加的安心度（再乘品質）
  PEACE_OTHER: 8,
  VISITS_MAX: 5,
  REINCARNATE_MERIT: 12,
  REINCARNATE_MERIT_YAKINIKU: 2,  // 有燒肉店（遺願馬卡龍）時的倍數
  PAIR_MERIT: 30,
  DREAM_MERIT_COST: 0,
  POP_PER_VISIT: 0.6,
  POP_PER_HELP: 4,
  STAY_CHANCE: 0.35,        // 安心滿的亡魂想留下的機率
  NOTICE_TIMEOUT: 25,       // 秒，沒回應就自動送行
  MOB_CAP: 14,
  TITLE_PAIRS: [3, 4, 5],
  EXPAND: [null, { star: 1, merit: 90 }, { star: 3, merit: 150 }, { star: 4, merit: 250 }],
  SAVE_KEY: "hq-village-save-v1"
};
