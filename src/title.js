// 標題畫面：GPT 畫的主視覺＋標題字，點一下選存檔（三格）。選好才真的開始遊戲（HQGame.begin）。
window.Title = (function () {
  var T = {}, el, onPick;
  var $ = function (id) { return document.getElementById(id); };

  function fmtTime(ms) {
    if (!ms) return "";
    var d = new Date(ms), p = function (n) { return (n < 10 ? "0" : "") + n; };
    return (d.getMonth() + 1) + "/" + d.getDate() + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }
  function slotHTML(n) {
    var s = State.peek(n);
    if (!s) return "<button class='slot empty' data-slot='" + n + "'><b>存檔 " + n + "</b><span>空白　開始新遊戲</span></button>";
    var stars = ""; for (var i = 1; i <= 5; i++) stars += Icons.html(i <= s.star ? "star" : "starOff");
    var title = (D.titles[s.title] || {}).name || "";
    return "<div class='slot-row'><button class='slot' data-slot='" + n + "'><b>存檔 " + n + "</b>" +
      "<span>第" + s.year + "年 " + s.month + "月 第" + s.week + "週　" + U.esc(title) + "</span>" +
      "<span>" + Icons.html("heart") + " 已幫助 " + U.fmt(s.helped) + " 人　街坊 " + s.residents + " 人　" + stars + "</span>" +
      (s.savedAt ? "<small>上次存檔 " + fmtTime(s.savedAt) + "</small>" : "") + "</button>" +
      "<button class='slot-del' data-del='" + n + "' title='刪除'>刪除</button></div>";
  }
  function renderSlots() {
    var box = $("title-slots");
    box.innerHTML = "<h2>選擇存檔</h2>" + [1, 2, 3].map(slotHTML).join("") + "<button class='slot-back'>返回</button>";
    box.querySelectorAll("[data-slot]").forEach(function (b) {
      b.onclick = function () { SFX.play("place"); close(+b.dataset.slot); };
    });
    box.querySelectorAll("[data-del]").forEach(function (b) {
      b.onclick = function () {
        var n = +b.dataset.del;
        if (!confirm("確定要刪除存檔 " + n + "？刪掉就救不回來了。")) return;
        State.remove(n); SFX.play("close"); renderSlots();
      };
    });
    box.querySelector(".slot-back").onclick = function () { SFX.play("close"); box.hidden = true; $("title-tap").hidden = false; };
  }
  function close(slot) {
    el.classList.add("out");
    setTimeout(function () { el.hidden = true; }, 350);
    onPick(slot);
  }

  T.show = function (cb) {
    onPick = cb;
    el = $("title");
    el.hidden = false;
    // 點畫面任何地方 → 選存檔
    $("title-tap").onclick = function () {
      SFX.play("open");
      $("title-tap").hidden = true;
      $("title-slots").hidden = false;
      renderSlots();
    };
  };
  return T;
})();
