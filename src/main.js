// 進入點：boot.js 載完資料後呼叫 HQGame.start()。
window.HQGame = (function () {
  var last = 0, promoT = 0;

  function frame(now) {
    var real = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    var s = G.state;
    if (!UI.blocking() && s.speed > 0) {
      // 高速時拆成小步，走路與戰鬥才不會跳格
      var dt = real * s.speed, n = Math.ceil(dt / 0.05);
      for (var i = 0; i < n; i++) Sim.update(dt / n);
    }
    // 評價、位階：條件一到就升（每秒檢查一次）
    promoT += real;
    if (promoT > 1) { promoT = 0; if (s.speed > 0) Story.checkPromotions(); }
    Sim.tickBuild();
    FX.update(real);
    Render.draw();
    ExpStrip.update(real);
    requestAnimationFrame(frame);
  }

  function start() {
    D.init();
    Assets.init();
    Render.init();
    Input.init();
    UI.init();
    ExpStrip.init();
    // 「重新開始」會直接回到同一格開新局，其他情況先顯示標題畫面
    var auto = null;
    try { auto = sessionStorage.getItem("hq-autoslot"); sessionStorage.removeItem("hq-autoslot"); } catch (e) { /* 私密模式 */ }
    // 等圖載完（最多 12 秒，網路太慢就先進去，晚到的圖之後自己補上）
    Loading.waitAssets(0.35, 1, 12000, function () {
      Loading.hide(600, function () { if (auto) begin(+auto); else Title.show(enter); });
    }, 1400);
  }
  // 從標題選好存檔：再跑一次讀取畫面才進街區
  function enter(slot) {
    Loading.show(State.peek(slot) ? "讀取存檔 " + slot : "前往三途川");
    Loading.waitAssets(0, 1, 6000, function () { Loading.hide(0, function () { begin(slot); }); }, 1100);
  }

  var begun = false;
  function begin(slot) {
    if (begun) return;
    begun = true;
    State.setSlot(slot);
    var saved = State.load();
    G.state = saved || State.fresh();
    Sim.setup(!!saved);
    if (HQ.artIndex && HQ.artIndex.worldmap) UI.setWorldmap(HQ.artIndex.worldmap);
    Render.cam.z = Render.defaultZoom();
    Render.centerOn(16 * CFG.TILE, 7 * CFG.TILE);
    if (!saved) { G.state.seenRules2 = 1; setTimeout(Story.tutorialTick, 600); }
    else if (!G.state.seenRules2) { G.state.seenRules2 = 1; setTimeout(Story.welcomeBack, 800); }
    else UI.toast("💾 讀取存檔：第" + G.state.year + "年 " + G.state.month + "月");
    Story.visibleRequests();
    document.addEventListener("visibilitychange", function () { if (document.hidden) State.save(); });
    window.addEventListener("pagehide", State.save);
    requestAnimationFrame(function (t) { last = t; frame(t); });
    // 測試用：在 console 用 HQGame.debug 快轉
    window.__hq = { G: G, Sim: Sim, Story: Story, Battle: Battle, State: State };
  }

  // 測試用快轉：跑 n 週模擬，對話與彈窗自動按掉
  function fastForward(weeks, opts) {
    var step = 0.05, per = CFG.WEEK_SEC;
    for (var w = 0; w < weeks; w++) {
      for (var t = 0; t < per; t += step) { Sim.update(step); if (UI.blocking()) UI.skipAll(); }
      if (opts && opts.onWeek) opts.onWeek(w);
    }
    UI.skipAll();
  }

  return { start: start, begin: begin, fastForward: fastForward };
})();
