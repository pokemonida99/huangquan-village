// 觸控／滑鼠：單指拖曳平移、雙指捏合或滾輪縮放（整數倍）、點一下選東西。
window.Input = (function () {
  var I = {};
  var pts = {}, down = null, pinch = null, wheelAcc = 0;

  I.init = function () {
    var cv = document.getElementById("view");
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("wheel", function (e) {
      e.preventDefault();
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 60) { Render.zoomAt(Render.cam.z + (wheelAcc < 0 ? 1 : -1), e.clientX, e.clientY); wheelAcc = 0; }
    }, { passive: false });
    window.addEventListener("keydown", function (e) {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "Escape") { UI.cancelPlace(); UI.closeSheet(); }
      if (e.key === " ") { UI.toggleSpeed(); e.preventDefault(); }
    });
  };

  function onDown(e) {
    e.target.setPointerCapture(e.pointerId);
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (ids.length === 1) {
      down = { x: e.clientX, y: e.clientY, cx: Render.cam.x, cy: Render.cam.y, t: performance.now(), moved: false };
      if (UI.placing() && UI.ghostHit(Render.toWorld(e.clientX, e.clientY))) down.onGhost = true;
    }
    else if (ids.length === 2) {
      var a = pts[ids[0]], b = pts[ids[1]];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: Render.cam.z };
      down = null;
    }
  }
  function onMove(e) {
    if (!pts[e.pointerId]) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (pinch && ids.length >= 2) {
      var a = pts[ids[0]], b = pts[ids[1]];
      var d = Math.hypot(a.x - b.x, a.y - b.y), ratio = d / pinch.d;
      var steps = Math.round(Math.log(ratio) / Math.log(1.35));
      Render.zoomAt(pinch.z + steps, (a.x + b.x) / 2, (a.y + b.y) / 2);
      return;
    }
    if (!down) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (!down.moved && Math.abs(dx) + Math.abs(dy) > 8) down.moved = true;
    if (down.moved) {
      if (UI.placing() && down.onGhost) { var w = Render.toWorld(e.clientX, e.clientY); UI.moveGhost(w.x, w.y); return; }
      Render.cam.x = down.cx - dx * Render.dpr / Render.cam.z;
      Render.cam.y = down.cy - dy * Render.dpr / Render.cam.z;
      Render.clamp();
    }
  }
  function onUp(e) {
    delete pts[e.pointerId];
    if (Object.keys(pts).length < 2) pinch = null;
    if (down && !down.moved && performance.now() - down.t < 500) {
      UI.tapScreen(e.clientX, e.clientY);
    }
    if (!Object.keys(pts).length) down = null;
  }

  return I;
})();
