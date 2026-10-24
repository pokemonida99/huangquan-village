"""檢查 GPT 潤飾結果並寫回 data/*.js。用法：python3 apply.py <W> <repo> [--dry]"""
import json, sys, os, re
W, REPO = sys.argv[1], sys.argv[2]; DRY = '--dry' in sys.argv
FILES = {'events': 'data/events.js', 'chars': 'data/chars.js', 'requests': 'data/requests.js', 'calendar': 'data/calendar.js', 'maps': 'data/maps.js'}
SIMP = set('这说们个时间对么来为会过还进开关后发样没让应该觉现实见边头东车话谁请认识爱钱亲兴妈爷奶钟饭医岁梦带')
def match_close(s, i, o, c):
    d = 0; q = None; k = i
    while k < len(s):
        ch = s[k]
        if q:
            if ch == '\\': k += 1
            elif ch == q: q = None
        elif ch in '"\'': q = ch
        elif ch == o: d += 1
        elif ch == c:
            d -= 1
            if d == 0: return k
        k += 1
    raise Exception('unbalanced')
def set_field(s, bid, field, lines):
    i = s.index('id: "%s"' % bid); b0 = s.rfind('{', 0, i); b1 = match_close(s, b0, '{', '}')
    j = s.index(field + ': [', b0)
    if j > b1: raise Exception('field not in block %s %s' % (bid, field))
    a = j + len(field) + 2; e = match_close(s, a, '[', ']')
    ls = s.rfind('\n', 0, j) + 1; ind = s[ls:j]
    body = ',\n'.join(ind + '  ' + json.dumps(l, ensure_ascii=False).replace('","', '", "').replace('[null,"', '[null, "') for l in lines)
    return s[:a] + '[\n' + body + '\n' + ind + ']' + s[e + 1:]
report = []; edits = {}
allorig = {}
for g in 'abcd':
    inp = json.load(open(os.path.join(W, 'in-%s.json' % g)))
    gl = {c['id'] for c in inp['glossary']}
    for k, v in inp['scenes'].items():
        for l in v['lines']: allorig.setdefault(l[1], set()).add(l[0])
for g in 'abcd':
    inp = json.load(open(os.path.join(W, 'in-%s.json' % g)))
    gl = {c['id'] for c in inp['glossary']}
    try: out = json.load(open(os.path.join(W, 'out-%s.json' % g)))
    except Exception as ex: report.append(('ERROR', g, 'out 讀不到：%s' % ex)); continue
    notes = out.get('notes', {})
    for k, v in inp['scenes'].items():
        new = out.get('scenes', {}).get(k)
        if new is None: report.append(('MISSING', k, '')); continue
        orig = v['lines']; prob = []
        speakers0 = {l[2] for l in orig}
        fixed = []
        for l in new:
            if not isinstance(l, list) or len(l) != 3: prob.append('格式錯 %r' % (l,)); continue
            ep, t, who = l
            if '老闆' in t: prob.append('有「老闆」：' + t)
            bad = [c for c in t if c in SIMP]
            if bad: prob.append('簡體字 %s：%s' % (''.join(bad), t))
            if who not in gl and who != '字卡' and who not in speakers0: prob.append('新說話者「%s」：%s' % (who, t))
            if ep is not None and ep not in allorig.get(t, set()): ep = None   # 改過字的原句：拿掉集數
            fixed.append([ep, t, who])
        if len(fixed) > len(orig) * 1.5 + 3: prob.append('太長 %d→%d' % (len(orig), len(fixed)))
        changed = [x[1:] for x in fixed] != [x[1:] for x in orig]
        report.append(('PROB' if prob else ('EDIT' if changed else 'SAME'), k, notes.get(k, ''), prob, orig, fixed))
        if changed and not prob: edits[k] = fixed
json.dump(report, open(os.path.join(W, 'report.json'), 'w'), ensure_ascii=False, indent=1)
from collections import Counter
print(Counter(r[0] for r in report))
for r in report:
    if r[0] in ('PROB', 'ERROR', 'MISSING'): print(r[0], r[1], r[2] if r[0] != 'PROB' else '', r[3] if r[0] == 'PROB' else '')
if not DRY:
    by = {}
    for k, lines in edits.items():
        f, bid, field = k.split('|'); by.setdefault(f, []).append((bid, field, lines))
    for f, items in by.items():
        p = os.path.join(REPO, FILES[f]); s = open(p, encoding='utf-8').read()
        for bid, field, lines in items: s = set_field(s, bid, field, lines)
        open(p, 'w', encoding='utf-8').write(s)
    print('applied', len(edits))
