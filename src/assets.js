// 美術載入：有圖就畫圖，沒有就回傳 null，畫面那邊改畫色塊。
window.Assets = (function () {
  var imgs = {};   // path -> {img, ok, done}
  var PROPS = ["willow", "deadwillow", "graves", "rocks", "stump", "talismanpost", "brokentoro", "miasma", "brokenfence", "reeds", "brokenboat", "toro", "jizo", "noticeboard"];

  function load(path, onload) {
    if (!path) return null;
    var e = imgs[path];
    if (e) { if (onload) { if (e.ok) onload(e.img); else e.img.addEventListener("load", function () { onload(e.img); }); } return e; }
    e = imgs[path] = { img: new Image(), ok: false, done: false };
    e.img.onload = function () { e.ok = true; e.done = true; if (onload) onload(e.img); };
    e.img.onerror = function () { e.done = true; };
    e.img.src = path;
    return e;
  }
  function get(path) { var e = imgs[path]; return e && e.ok ? e.img : null; }

  function mobSprite(id) { return "art/chars/" + (/^mob-/.test(id) ? id : "mob-" + id) + ".png"; }

  function init() {
    var tidx = HQ.artIndex && HQ.artIndex.tiles;
    if (tidx) load(tidx.file || tidx.image || "art/tiles/ground.png", function (img) { MapGen.useTileset(img, tidx); });
    PROPS.forEach(function (p) { load("art/props/" + p + ".png", MapGen.redrawSoon); });
    var bidx = HQ.artIndex && HQ.artIndex.buildings;
    D.buildings.forEach(function (b) {
      if (!b.sprite) return;
      if (bidx && !bidx[b.id]) return; // 有索引就只載索引列出的，少一堆 404
      load(b.sprite);
      if (b.damaged) load(b.damaged);
    });
    var cidx = HQ.artIndex && HQ.artIndex.chars;
    function tryChar(path, id) { if (cidx && !cidx[id]) return; load(path); }
    D.chars.forEach(function (c) {
      if (c.draw == null || c.draw <= 2) tryChar(c.sprite, c.id);
      if (!cidx || cidx[c.id + "-face"] || (cidx[c.id] && cidx[c.id].face)) load(c.face);
    });
    for (var i = 1; i <= 8; i++) tryChar("art/chars/soul-" + i + ".png", "soul-" + i);
    D.mobs.forEach(function (m) { tryChar(mobSprite(m.id), /^mob-/.test(m.id) ? m.id : "mob-" + m.id); });
    load("art/tiles/worldmap.png");
  }

  // 頭像：art/chars/<id>-face.png → refs/<id>-normal.webp（語彤用 yutongh）→ null
  function face(id) {
    if (!id) return null;
    var c = D.charById[id];
    var p1 = c ? c.face : "art/chars/" + id + "-face.png";
    var a = load(p1);
    if (a.ok) return p1;
    if (a.done) {
      var p2 = "refs/" + (id === "yutong" ? "yutongh" : id) + "-normal.webp";
      var b = load(p2);
      if (b.ok) return p2;
    }
    return null;
  }

  return { load: load, get: get, init: init, face: face, mobSprite: mobSprite };
})();
