// 音效：WebAudio 即時合成（不用音檔），音量小。火車不出聲（班次很密會吵）。
// 設定裡可以關掉，記在 localStorage。
window.SFX = (function () {
  var ac = null, master = null, off = false, last = {};
  try { off = localStorage.getItem("hq-sfx-off") === "1"; } catch (e) { /* 私密模式 */ }
  function ctx() {
    if (ac) return ac;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.22; master.connect(ac.destination);
    return ac;
  }
  // 第一次觸碰才開聲音（瀏覽器規定）
  function unlock() { var a = ctx(); if (a && a.state === "suspended") a.resume(); }
  window.addEventListener("pointerdown", unlock, { passive: true });

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
    var a = ctx(); if (!a || a.state !== "running") return;
    var now = a.currentTime;
    if (gap && last[name] && now - last[name] < gap) return;
    last[name] = now;
    SOUNDS[name](now + 0.01);
  }
  return {
    play: play,
    isOff: function () { return off; },
    toggle: function () { off = !off; try { localStorage.setItem("hq-sfx-off", off ? "1" : ""); } catch (e) { /* 私密模式 */ } if (!off) play("click"); return off; }
  };
})();
