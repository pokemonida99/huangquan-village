// 開機：依序試載 data/*.js（B、C 線的檔案，還沒做好就跳過），再讀美術索引，最後啟動遊戲。
(function () {
  window.HQ = window.HQ || {};
  var DATA_FILES = [
    "data/buildings.js", "data/jobs.js", "data/traits.js", "data/ranks.js",
    "data/chars.js", "data/requests.js", "data/events.js", "data/calendar.js", "data/maps.js"
  ];
  var loaded = [], missing = [];

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement("script");
      s.src = src + "?v=" + Date.now();
      s.onload = function () { loaded.push(src); resolve(); };
      s.onerror = function () { missing.push(src); s.remove(); resolve(); };
      document.body.appendChild(s);
    });
  }

  function loadJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  var chain = Promise.resolve();
  DATA_FILES.forEach(function (f) { chain = chain.then(function () { return loadScript(f); }); });
  chain.then(function () {
    return Promise.all([loadJSON("art/buildings/index.json"), loadJSON("art/tiles/index.json"), loadJSON("art/chars/index.json"), loadJSON("art/tiles/worldmap.json")]);
  }).then(function (idx) {
    HQ.artIndex = { buildings: idx[0], tiles: idx[1], chars: idx[2], worldmap: idx[3] };
    HQ.bootInfo = { loaded: loaded, missing: missing };
    if (missing.length) console.info("[三途川] 用內建範例補位：", missing.join(", "));
    HQGame.start();
  });
})();
