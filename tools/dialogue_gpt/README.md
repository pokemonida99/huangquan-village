# 用 GPT 潤飾劇情台詞

1. `node tools/dialogue_gpt/export.js <工作資料夾>`：匯出所有劇情段落（in-a～d.json，附角色表）。有條件句（第 4 欄）的段落不匯出。
2. 每批跑一次 codex：`codex exec --skip-git-repo-check -C <工作資料夾> -s workspace-write "請讀 rules.md 與 in-a.json……寫成 out-a.json"`（rules.md 先複製進工作資料夾）。
3. `python3 tools/dialogue_gpt/apply.py <工作資料夾> . --dry` 先檢查（老闆、簡體字、新說話者、長度；改過字的原句自動拿掉集數），沒問題再拿掉 `--dry` 寫回 data/*.js。
