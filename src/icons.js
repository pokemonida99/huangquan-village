// 介面用的像素小圖示（程式畫，不用 emoji）。產生 CSS：<i class="ic coin"></i>
window.Icons = (function () {
  var PAL = {
    k: "#3a2418", Y: "#e0a92e", y: "#ffd65a", O: "#b07a1e", R: "#c0302a", r: "#ee5a48", P: "#f3e2b8", p: "#d9c08e",
    L: "#e86a9a", l: "#ffb3cc", G: "#4f963f", g: "#b8b4c8", W: "#f4ead2", B: "#3f5490", b: "#7f9be0", w: "#ffffff", d: "#8a5a32"
  };
  var ART = {
    // 冥紙：黃紙＋紅印
    coin: ["kkkkkkkkkkkk", "kYYYYYYYYYYk", "kYyyyyyyyyYk", "kYyRRRRyyyYk", "kYyRrrRyOyYk", "kYyRrrRyyyYk", "kYyRRRRyOyYk", "kYyyyyyyyyYk", "kYYYYYYYYYYk", "kkkkkkkkkkkk"],
    // 功德：蓮花
    lotus: [".....kk.....", "....kLLk....", "...kLllLk...", ".kk.kLlLk.kk", "kLLkkLlLkkLLk", "kLlLkLllkLlLk", ".kLlLLllLLlk.", "..kLLLLLLLk..", "...kkGGGkk...", "..kGGGGGGGk..", "...kkkkkkk..."],
    // 幫助：紅線愛心
    heart: [".kkk...kkk.", "kRrRk.kRRRk", "kRrRRkRRRRk", "kRRRRRRRRRk", "kRRRRRRRRRk", ".kRRRRRRRk.", "..kRRRRRk..", "...kRRRk...", "....kRk....", ".....k....."],
    star: ["....k....", "...kyk...", "...kyk...", "kkkkykkkk", "kyyyyyyyk", ".kyyyyyk.", "..kyyyk..", ".kyykyyk.", ".kyk.kyk.", ".kk...kk."],
    starOff: ["....k....", "...kgk...", "...kgk...", "kkkkgkkkk", "kgggggggk", ".kgggggk.", "..kgggk..", ".kggkggk.", ".kgk.kgk.", ".kk...kk."],
    house: ["....kkkk....", "...kRRRRk...", "..kRrrrrRk..", ".kRRRRRRRRk.", "kkkkkkkkkkkk", ".kWWWWWWWWk.", ".kWkkWWyyWk.", ".kWkdkWyyWk.", ".kWkdkWWWWk.", ".kkkkkkkkkk."],
    scroll: ["kkkkkkkkkkkk", "kPPPPPPPPPPk", ".kPPPPPPPPk.", ".kPkkkkkPPk.", ".kPPPPPPPPk.", ".kPkkkkPPPk.", ".kPPPPPPPPk.", ".kPkkkkkPPk.", "kPPPPPPPPPPk", "kkkkkkkkkkkk"],
    menu: ["kkkkkkkkkkk", "kWWWWWWWWWk", "kkkkkkkkkkk", "...........", "kkkkkkkkkkk", "kWWWWWWWWWk", "kkkkkkkkkkk", "...........", "kkkkkkkkkkk", "kWWWWWWWWWk", "kkkkkkkkkkk"],
    gear: ["....kkk....", "..k.kgk.k..", ".kgkkgkkgk.", "..kgggggk..", "kkkgkkkgkkk", "kgggk.kgggk", "kkkgkkkgkkk", "..kgggggk..", ".kgkkgkkgk.", "..k.kgk.k..", "....kkk...."],
    lantern: ["....kk....", "...kkkk...", "..kRRRRk..", ".kRryyrRk.", ".kRryyrRk.", ".kRryyrRk.", "..kRRRRk..", "...kkkk...", "....kk....", "....yy...."],
    sword: [".........kk", "........kgk", ".......kgk.", "......kgk..", ".....kgk...", "..k.kgk....", "...kgk.....", "..kdk......", ".kdk.k.....", "kdk........", "kk........."],
    info: ["..kkkkkkk..", ".kBBBBBBBk.", "kBBBwwBBBBk", "kBBBBBBBBBk", "kBBBwwwBBBk", "kBBBBwwBBBk", "kBBBBwwBBBk", "kBBBwwwwBBk", ".kBBBBBBBk.", "..kkkkkkk.."],
    up: ["....k....", "...kGk...", "..kGGGk..", ".kGGGGGk.", "kkkGGGkkk", "..kGGGk..", "..kGGGk..", "..kkkkk.."],
    // 亡魂心願泡泡
    eat: ["...kkkk...", "..kRrRrk..", ".kRrRrRrk.", "kkkkkkkkkk", "kWWWWWWWWk", ".kWWWWWWk.", "..kWWWWk..", "...kkkk..."],
    rest: ["kk........", "kWk.......", "kWkkkkkkkk", "kWkBBBBBBk", "kWkBbbbbBk", "kkkkkkkkkk", "kdk....kdk", "kk......kk"],
    shop: ["...kkkk...", "..k....k..", ".kkkkkkkk.", ".kYYYYYYk.", ".kYyRRyYk.", ".kYyyyyYk.", ".kYYYYYYk.", ".kkkkkkkk."],
    prayer: ["..g..g..g.", ".g..g..g..", "..k..k..k.", "..k..k..k.", "..R..R..R.", ".kkkkkkkk.", ".kYYYYYYk.", "..kkkkkk.."],
    dream: ["..kkk.....", "kkkkkkkkkk", "kggkkkkggk", "kgkbbbkggk", "kgkbwbkggk", "kgkbbbkggk", "kggkkkkggk", "kkkkkkkkkk"],
    hair: ["kk....kk", "kgk..kgk", ".kgkkgk.", "..kggk..", "..kRRk..", ".kRkkRk.", "kRk..kRk", ".kk..kk."],
    sweets: ["...kkk...", "..kOOOk..", ".kyyyyyk.", ".kyyyyyk.", "kyyyyyyyk", "kkkkkkkkk", ".kWWWWWk.", "..kkkkk.."],
    art: [".kkkkkk...", "kWRWWWWk..", "kWWWWBWWk.", "kWYWWkkkk.", "kWWWWk....", "kWGWWWk...", ".kWWWWWk..", "..kkkkk..."],
    heal: [".kkk...kkk.", "kRrRk.kRRRk", "kRrRRk.RRRk", "kRRRRk.RRRk", ".kRRRk.RRk.", "..kRRk.Rk..", "...kRk.k...", "....k......"],
    reincarnate: ["..kkkkk..", ".kLlLlLk.", "kLLLLLLLk", "kkkkkkkkk", "kWWWWWWWk", "kkkkkkkkk", ".kLlLlLk.", "..kkkkk.."]
  };
  function svg(rows) {
    var w = Math.max.apply(null, rows.map(function (r) { return r.length; })), h = rows.length, s = "";
    rows.forEach(function (r, y) { for (var x = 0; x < r.length; x++) { var c = PAL[r[x]]; if (c) s += "<rect x='" + x + "' y='" + y + "' width='1' height='1' fill='" + c + "'/>"; } });
    var data = "data:image/svg+xml," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "' viewBox='0 0 " + w + " " + h + "' shape-rendering='crispEdges'>" + s + "</svg>");
    return { w: w, h: h, data: data, url: "url(\"" + data + "\")" };
  }
  var css = ".ic{display:inline-block;vertical-align:-0.18em;background:center/contain no-repeat;image-rendering:pixelated;flex:none}";
  Object.keys(ART).forEach(function (k) { var o = svg(ART[k]); css += ".ic." + k + "{width:" + (o.w / o.h).toFixed(3) + "em;height:1em;background-image:" + o.url + "}"; });
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // 把文字裡常見的 emoji 換成像素圖示（面板、提示用；輸入要先 escape 過）
  var MAP = { "💴": "coin", "🪷": "lotus", "🙏": "heart", "⬆️": "up", "🏮": "lantern", "⚔️": "sword", "📜": "scroll", "⚙️": "gear" };
  var re = new RegExp(Object.keys(MAP).join("|"), "g");
  function iconize(html) { return String(html).replace(re, function (m) { return "<i class='ic " + MAP[m] + "'></i>"; }); }
  // 畫在 canvas 上用的圖（泡泡圖示）：Image，原尺寸 = 像素格數
  var imgs = {};
  function img(k) {
    if (!ART[k]) return null;
    if (!imgs[k]) { var im = new Image(); im.src = svg(ART[k]).data; imgs[k] = im; }
    return imgs[k].complete && imgs[k].naturalWidth ? imgs[k] : null;
  }
  return { iconize: iconize, img: img, html: function (k) { return "<i class='ic " + k + "'></i>"; } };
})();
