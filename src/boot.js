// 開機：依序試載 data/*.js（B、C 線的檔案，還沒做好就跳過），再讀美術索引，最後啟動遊戲。
(function () {
  window.HQ = window.HQ || {};
  var DATA_FILES = [
    "data/buildings.js", "data/jobs.js", "data/traits.js", "data/ranks.js",
    "data/chars.js", "data/requests.js", "data/events.js", "data/calendar.js", "data/maps.js"
  ];
  var loaded = [], missing = [];
  Loading.init();

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = src + "?v=" + Date.now();
      s.onload = function () { loaded.push(src); step(); resolve(); };
      s.onerror = function () { missing.push(src); s.remove(); step(); resolve(); };
      document.body.appendChild(s);
    });
  }

  function loadJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  // 讀取畫面進度：資料檔占前 30%，美術索引 35%，其餘是圖
  function step() { Loading.set(0.3 * (loaded.length + missing.length) / DATA_FILES.length); }
  var chain = Promise.resolve();
  DATA_FILES.forEach(function (f) { chain = chain.then(function () { return loadScript(f); }); });
  chain.then(function () {
    return Promise.all([loadJSON("art/buildings/index.json"), loadJSON("art/iso/index.json"), loadJSON("art/tiles/worldmap.json")]);
  }).then(function (idx) {
    HQ.artIndex = { buildings: idx[0], iso: idx[1] || {}, chars: null, worldmap: idx[2] };
    HQ.bootInfo = { loaded: loaded, missing: missing };
    Loading.set(0.35);
    if (missing.length) console.info("[三途川] 用內建範例補位：", missing.join(", "));
    HQGame.start();
  });
})();
