// 美術載入：有圖就畫圖，沒有就回傳 null，畫面那邊改畫色塊。
window.Assets = (function () {
  var imgs = {};   // path -> {img, ok, done}
  var PROPS = ["willow", "deadwillow", "graves", "rocks", "stump", "talismanpost", "brokentoro", "miasma", "brokenfence", "reeds", "brokenboat", "toro", "jizo", "noticeboard"];

  var TITLE_ART = "art/title.png?v=3";   // 跟 style.css 的 .title-art 同一個網址，先載好標題畫面才不會空白
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
  // 等角建築圖的路徑（index.json 有 v 就加版本號，換圖後手機才不會用舊快取）
  function isoPath(id) { var e = HQ.artIndex && HQ.artIndex.iso && HQ.artIndex.iso[id]; return "art/iso/" + id + ".png" + (e && e.v ? "?v=" + e.v : ""); }
  // 轉向圖（GPT 照鏡像重畫、招牌字是正的）：沒有就由 Render 直接鏡像
  function isoTurnPath(id) { var e = HQ.artIndex && HQ.artIndex.iso && HQ.artIndex.iso[id]; return e && e.turn ? "art/iso/" + id + "-r.png?v=" + e.turn : null; }
  // 讀取畫面用：目前排隊的圖載完幾張（失敗也算完成）
  function progress() { var t = 0, d = 0; for (var k in imgs) { t++; if (imgs[k].done) d++; } return { done: d, total: t }; }
  function get(path) { var e = imgs[path]; return e && e.ok ? e.img : null; }

  function mobSprite(id) { return "art/chars/" + (/^mob-/.test(id) ? id : "mob-" + id) + ".png"; }

  function init() {
    PROPS.forEach(function (p) { load("art/props/" + p + ".png"); });
    // 等角建築圖（art/iso/index.json 列出的才有；沒有的建築由 Render 程式畫方塊屋）
    var iidx = (HQ.artIndex && HQ.artIndex.iso) || {};
    Object.keys(iidx).forEach(function (id) { if (id[0] !== "_") { load(isoPath(id)); if (iidx[id].turn) load(isoTurnPath(id)); if (iidx[id].damaged) load("art/iso/" + id + "-damaged.png"); } });
    if (iidx._train) { load("art/iso/train-loco.png"); load("art/iso/train-car.png"); }
    var cidx = HQ.artIndex && HQ.artIndex.chars;
    function tryChar(path, id) { if (cidx && !cidx[id]) return; load(path); }
    D.chars.forEach(function (c) {
      if (c.draw == null || c.draw <= 2) tryChar(c.sprite, c.id);
      if (!cidx || cidx[c.id + "-face"] || (cidx[c.id] && cidx[c.id].face)) load(c.face);
    });
    for (var i = 1; i <= 8; i++) tryChar("art/chars/soul-" + i + ".png", "soul-" + i);
    D.mobs.forEach(function (m) { tryChar(mobSprite(m.id), /^mob-/.test(m.id) ? m.id : "mob-" + m.id); });
    load("art/tiles/worldmap.png");
    load(TITLE_ART);
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

  return { load: load, get: get, progress: progress, isoPath: isoPath, isoTurnPath: isoTurnPath, init: init, face: face, mobSprite: mobSprite };
})();
