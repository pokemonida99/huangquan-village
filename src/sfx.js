// 音效：WebAudio 即時合成（不用音檔），音量小。火車不出聲（班次很密會吵）。
// 配樂：art/audio/bgm.mp3（使用者提供的〈Harpstring Lullaby〉），循環播放、音量小。
// 音效、音樂各自在設定裡可以關掉，記在 localStorage。
window.SFX = (function () {
  var ac = null, master = null, off = false, musicOff = false, last = {};
  var BGM_VOL = 0.6, bgm = null;   // 檔案已壓到約 -24 dB 平均，這裡是桌機／Android 再乘的倍率
  try { off = localStorage.getItem("hq-sfx-off") === "1"; musicOff = localStorage.getItem("hq-bgm-off") === "1"; } catch (e) { /* 私密模式 */ }
  function ctx() {
    if (ac) return ac;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.22; master.connect(ac.destination);
    return ac;
  }
  // 配樂用一般的 <audio> 直接播（不接 WebAudio）：iPhone 靜音模式下 WebAudio 會被消音，<audio> 不會，
  // 而且有 <audio> 在播，WebAudio 的音效也跟著能出聲。iPhone 不能調 audio.volume，所以檔案本身已經壓小聲。
  function startMusic() {
    if (musicOff) return;
    if (!bgm) { bgm = new Audio("art/audio/bgm.mp3?v=2"); bgm.loop = true; bgm.preload = "auto"; bgm.setAttribute("playsinline", ""); }
    bgm.volume = BGM_VOL;
    var p = bgm.play(); if (p && p.catch) p.catch(function () { /* 還沒解鎖，下次點擊再試 */ });
  }
  function stopMusic() { if (bgm) bgm.pause(); }
  // 切到背景就停，回來再放
  document.addEventListener("visibilitychange", function () { if (document.hidden) stopMusic(); else if (unlocked) startMusic(); });
  // 解鎖聲音：手機上只有「手指放開」（touchend／pointerup／click）才算使用者操作，pointerdown 不算
  var unlocked = false;
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) { /* 舊版瀏覽器 */ }
    var a = ctx();
    if (a) {
      if (a.state !== "running") a.resume();
      // iOS：在使用者操作裡播一個極短的空白音，WebAudio 才算真的開了
      try { var b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch (e) { /* 忽略 */ }
    }
    if (!bgm || bgm.paused) startMusic();
    unlocked = true;
  }
  ["touchend", "pointerup", "click", "keydown"].forEach(function (ev) { window.addEventListener(ev, unlock, { capture: true, passive: true }); });

  function tone(freq, t0, dur, type, vol, slide) {
    var a = ac, o = a.createOscillator(), g = a.createGain();
    o.type = type || "square"; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol || 0.3, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, vol, lp) {
    var a = ac, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = "lowpass"; f.frequency.value = lp || 900; g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  }
  var N = { C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784, A5: 880, B5: 987.8, C6: 1046.5, E6: 1318.5, G6: 1568, C4: 261.6, G4: 392, E4: 329.6 };
  var SOUNDS = {
    click: function (t) { tone(1200, t, 0.04, "square", 0.12); },
    open: function (t) { tone(N.G5, t, 0.06, "square", 0.14); tone(N.C6, t + 0.05, 0.08, "square", 0.14); },
    close: function (t) { tone(N.C6, t, 0.05, "square", 0.12); tone(N.G5, t + 0.04, 0.07, "square", 0.12); },
    tick: function (t) { tone(1800, t, 0.025, "triangle", 0.12); },
    place: function (t) { noise(t, 0.12, 0.5, 500); tone(N.C5, t + 0.06, 0.1, "square", 0.16); tone(N.E5, t + 0.13, 0.1, "square", 0.16); tone(N.G5, t + 0.2, 0.18, "square", 0.16); },
    error: function (t) { tone(180, t, 0.09, "sawtooth", 0.18); tone(140, t + 0.1, 0.14, "sawtooth", 0.18); },
    coin: function (t) { tone(N.B5, t, 0.05, "square", 0.08); tone(N.E6, t + 0.05, 0.12, "square", 0.08); },
    bell: function (t) { tone(N.G5, t, 0.5, "triangle", 0.2); tone(N.C6, t, 0.6, "sine", 0.12); },
    love: function (t) { [N.C6, N.E6, N.G6, N.E6, N.G6].forEach(function (f, i) { tone(f, t + i * 0.07, 0.16, "triangle", 0.16); }); },
    jingle: function (t) { [N.C5, N.E5, N.G5, N.C6].forEach(function (f, i) { tone(f, t + i * 0.09, 0.14, "square", 0.14); }); tone(N.C6, t + 0.36, 0.3, "triangle", 0.18); },
    fanfare: function (t) { [N.G4, N.C5, N.E5, N.G5].forEach(function (f, i) { tone(f, t + i * 0.12, 0.16, "square", 0.15); }); tone(N.C6, t + 0.5, 0.5, "square", 0.15); tone(N.E5, t + 0.5, 0.5, "triangle", 0.12); },
    levelup: function (t) { tone(N.C5, t, 0.3, "square", 0.12, N.C6); tone(N.G5, t + 0.28, 0.2, "triangle", 0.14); },
    hit: function (t) { noise(t, 0.06, 0.25, 1500); }
  };
  // gap：同一種音效最短間隔（秒），避免高速時連發
  function play(name, gap) {
    if (off || !SOUNDS[name]) return;
    var a = ctx(); if (!a) return;
    if (a.state !== "running") { if (unlocked) a.resume(); return; }
    var now = a.currentTime;
    if (gap && last[name] && now - last[name] < gap) return;
    last[name] = now;
    SOUNDS[name](now + 0.01);
  }
  // 觀音評定的配樂：art/audio/review.mp3（之後放進來就會自動用），播的時候背景音樂暫停
  var rv = null, rvOk = null;
  function reviewMusic(good) {
    if (musicOff) { if (good) play("fanfare"); return; }
    if (rvOk === false) { play("fanfare"); return; }
    if (!rv) { rv = new Audio("art/audio/review.mp3"); rv.preload = "auto"; rv.onerror = function () { rvOk = false; }; rv.oncanplay = function () { rvOk = true; }; }
    if (bgm) bgm.pause();
    rv.currentTime = 0; rv.volume = BGM_VOL;
    var p = rv.play(); if (p && p.catch) p.catch(function () { rvOk = false; play("fanfare"); });
  }
  function reviewMusicEnd() { if (rv) rv.pause(); if (unlocked) startMusic(); }
  return {
    reviewMusic: reviewMusic, reviewMusicEnd: reviewMusicEnd,
    play: play,
    isOff: function () { return off; },
    musicOff: function () { return musicOff; },
    toggleMusic: function () { musicOff = !musicOff; try { localStorage.setItem("hq-bgm-off", musicOff ? "1" : ""); } catch (e) { /* 私密模式 */ } if (musicOff) stopMusic(); else startMusic(); return musicOff; },
    debug: function () { return { ctx: ac && ac.state, unlocked: unlocked, bgm: bgm ? (bgm.paused ? "paused" : "playing") + " " + bgm.currentTime.toFixed(1) : "none" }; },
    toggle: function () { off = !off; try { localStorage.setItem("hq-sfx-off", off ? "1" : ""); } catch (e) { /* 私密模式 */ } if (!off) play("click"); return off; }
  };
})();
