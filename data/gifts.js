/* 三途川物語 — 送給街坊的禮物
   shop：在哪一間店買（要先蓋那間店、店有開）；沒有 shop 的只能在巡守打怪、撿路上的寶物拿到。
   joy：送出去滿足加多少；fav：最喜歡這個的角色（滿足加倍）。月老金平糖、引渡貓雞胸肉、黑糖罐罐有劇中出處；白妹彼岸花束是自己配的。
   drop：掉落權重（打怪、出征、路上寶物共用），越大越常見。 */
window.HQ = window.HQ || {};
HQ.gifts = [
  { id: "candy",    name: "金平糖",     shop: "mengpo",     cost: 60,  joy: 8,  drop: 10, fav: ["yuelao"] },
  { id: "tangyuan", name: "孟婆湯圓",   shop: "mengpo",     cost: 120, joy: 12, drop: 5 },
  { id: "chicken",  name: "雞胸肉",     shop: "catstop",    cost: 80,  joy: 10, drop: 8,  fav: ["mimi", "cat918", "gongwan"] },
  { id: "can",      name: "罐罐",       shop: "dogpark",    cost: 80,  joy: 10, drop: 8,  fav: ["heitang"] },
  { id: "fries",    name: "薯條",       shop: "fries",      cost: 70,  joy: 8,  drop: 10 },
  { id: "cutlet",   name: "夜市雞排",   shop: "nightstall", cost: 90,  joy: 10, drop: 8 },
  { id: "bento",    name: "燒肉便當",   shop: "yakiniku",   cost: 150, joy: 15, drop: 5 },
  { id: "hotpot",   name: "麻辣鍋外帶", shop: "mala",       cost: 160, joy: 15, drop: 4 },
  { id: "sushi",    name: "鮭魚握壽司", shop: "sushi",      cost: 140, joy: 13, drop: 5 },
  { id: "tea",      name: "高山茶葉罐", shop: "teahouse",   cost: 160, joy: 15, drop: 4 },
  { id: "sachet",   name: "平安香包",   shop: "incense",    cost: 120, joy: 12, drop: 6 },
  { id: "paperphone", name: "紙紮手機", shop: "paper",      cost: 200, joy: 18, drop: 3 },
  { id: "manga",    name: "漫畫單行本", shop: "manga",      cost: 180, joy: 16, drop: 3 },
  { id: "frame",    name: "合照相框",   shop: "photo",      cost: 220, joy: 20, drop: 3 },
  { id: "hairpin",  name: "花飾髮簪",   shop: "flower",     cost: 260, joy: 22, drop: 2 },
  { id: "flower",   name: "彼岸花束",   shop: "flower",     cost: 300, joy: 25, drop: 2, fav: ["baimei"] },
  { id: "charm",    name: "紅線御守",   shop: "temple",     cost: 600, joy: 40, drop: 1 },
  // 只會掉落、買不到的稀有禮物
  { id: "moonshell", name: "月光貝殼",  joy: 30, drop: 1.2, rare: true },
  { id: "demoncandy", name: "魔界糖果", joy: 28, drop: 1.2, rare: true },
  { id: "goldbell", name: "金色鈴鐺",   joy: 45, drop: 0.6, rare: true }
];
