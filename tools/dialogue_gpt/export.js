// 匯出所有劇情台詞給 GPT 潤飾。key = 檔案|id|欄位
global.window = global;
["buildings","jobs","traits","ranks","chars","requests","events","calendar","maps"].forEach(f => require(process.cwd() + "/data/" + f + ".js"));
const out = { glossary: [], scenes: {} };
HQ.chars.forEach(c => out.glossary.push({ id: c.id, name: c.name, kind: c.kind, job: c.job, desc: c.desc }));
const hasCond = a => a.some(l => !Array.isArray(l) || l.length > 3);
function add(key, arr, ctx) { if (!Array.isArray(arr) || !arr.length || hasCond(arr)) return; out.scenes[key] = { context: ctx, lines: arr.map(l => [l[0] === undefined ? null : l[0], l[1], l[2] || null]) }; }
HQ.tutorial.forEach(t => add("events|" + t.id + "|lines", t.lines, "開場教學：" + t.title));
HQ.chars.forEach(c => add("chars|" + c.id + "|arrive", (c.arrive || []).map(l => [l[0], l[1], l[2] || c.id]), "角色入住戲：" + c.name));
HQ.requests.forEach(r => { const who = r.char; ["intro", "lines"].forEach(k => add("requests|" + r.id + "|" + k, (r[k] || []).map(l => [l[0], l[1], l[2] || who]), "委託「" + r.title + "」的" + (k === "intro" ? "開頭（接下委託時）" : "完成後的劇情"))); });
HQ.events.forEach(e => add("events|" + e.id + "|lines", e.lines, "事件「" + e.title + "」"));
HQ.calendar.forEach(m => (m.events || []).forEach(e => add("calendar|" + e.id + "|lines", e.lines, m.month + " 月行事曆「" + e.title + "」")));
(HQ.reviewTasks || []).forEach(t => add("calendar|" + t.id + "|lines", t.lines, "觀音指派的任務「" + t.title + "」"));
HQ.maps.forEach(m => Object.keys(m.lines || {}).forEach(k => add("maps|" + m.id + "|" + k, m.lines[k], "出征地圖「" + m.name + "」的" + ({ intro: "出發時", mid: "途中", boss: "遇到王", clear: "打倒王之後" }[k] || k))));
const keys = Object.keys(out.scenes), n = keys.length;
console.log("scenes", n, "lines", keys.reduce((a, k) => a + out.scenes[k].lines.length, 0));
// 分 4 批
const groups = { a: k => /^(events\|t\d|chars)/.test(k), b: k => /^requests/.test(k), c: k => /^(events|calendar)/.test(k) && !/^events\|t\d/.test(k), d: k => /^maps/.test(k) };
const fs = require("fs");
Object.keys(groups).forEach(g => { const sc = {}; keys.filter(groups[g]).forEach(k => sc[k] = out.scenes[k]); fs.writeFileSync(process.argv[2] + "/in-" + g + ".json", JSON.stringify({ glossary: out.glossary, scenes: sc }, null, 1)); console.log(g, Object.keys(sc).length); });
