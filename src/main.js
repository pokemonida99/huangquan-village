// 進入點：boot.js 載完資料後呼叫 HQGame.start()。
window.HQGame = (function () {
  var last = 0;

  function frame(now) {
    var real = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    var s = G.state;
    if (!UI.blocking() && s.speed > 0) {
      // 高速時拆成小步，走路與戰鬥才不會跳格
      var dt = real * s.speed, n = Math.ceil(dt / 0.05);
      for (var i = 0; i < n; i++) Sim.update(dt / n);
    }
    FX.update(real);
    Render.draw();
    requestAnimationFrame(frame);
  }

  function start() {
    D.init();
    Assets.init();
    var saved = State.load();
    G.state = saved || State.fresh();
    Render.init();
    Sim.setup(!!saved);
    Input.init();
    UI.init();
    if (HQ.artIndex && HQ.artIndex.worldmap) UI.setWorldmap(HQ.artIndex.worldmap);
    Render.cam.z = Render.defaultZoom();
    Render.centerOn(15 * CFG.TILE, 8 * CFG.TILE);
    if (!saved) setTimeout(Story.tutorialTick, 600);
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

  return { start: start, fastForward: fastForward };
})();
