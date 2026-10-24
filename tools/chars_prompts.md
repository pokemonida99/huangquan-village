# 角色像素圖提示詞（D 線）

流程：`tools/chars_run.sh <id> [<id>...]` 讀這份檔案，每個 id 用 `tools/chars_gen.sh` 生兩張（走路表 sheet、頭像 face），
原圖放 `tools/chars_src/`，再用 `tools/pixelize.py` 轉成 `art/chars/<id>.png`、`<id>-face.png`。
共同的版型、風格句子寫在 `tools/chars_gen.sh` 裡（4 列×2 欄走路表、洋紅底、32×32 低解析、粗描邊）；
每張都另外附上 `concept/chars-pixel-v2.png` 當風格參考。下面每段 `refs:` 是角色參考圖（路徑相對 huangquan-village/），`px:` 是轉檔額外參數。

格式：`## id` 一行，接著 `refs:`、`px:`（可省）、`face: no`（不要頭像）、`desc:` 一行。

## yutong
refs: refs/yutongh-normal.webp
px: 
desc: 語彤 (Yutong), a young woman intern matchmaker god: JET-BLACK straight short bob haircut with blunt bangs (pure black hair, not brown), NO glasses, rosy pink blush on cheeks with tiny sparkle dots, a gold flower hairpin with a green tassel hanging on one side, white hanfu robe with sage-green panels and wide sleeves, sage-green sash bow at the waist, a little gold trim. Match the photo reference.

## yuelao
refs: ../huangquan-puzzle/art/vn/yuelao-normal.webp
desc: 月老 (Yue Lao, the matchmaker god), a handsome young man with fluffy layered light-brown hair with blond streaks, red eyes, wearing a white-and-red striped long hanfu robe with wide sleeves, red sash with gold knot ornament and red tassels, holding a red string between his hands. Match the photo reference.

## lee
refs: ../huangquan-puzzle/art/vn/lee-normal.webp
px: --ban #e2b65a,#f3d58c --gamma 0.75
facedesc: 業鏡羅漢, a slender middle-aged East Asian man with a long thin face, short black hair with a little grey at the temples, calm gentle kind expression, relaxed eyebrows, soft eyes, small polite smile (NOT frowning, NOT stern), tall black top hat, black three-piece suit, white shirt, black tie, white pocket square. 2026-10-24 使用者說原本的臉太兇，頭像改用 tools/chars_src/lee-face-v1.png。
desc: 業鏡羅漢 (Karma-Mirror Arhat), a calm composed middle-aged East Asian man with short grey-black hair, gentle face, wearing a tall black top hat, black three-piece suit, white shirt, black tie, white pocket square, black shoes. Match the photo reference.

## guanyin
refs: ../huangquan-puzzle/art/vn/guanyin-normal.webp
desc: 觀音菩薩 (Guanyin), an elegant woman with long wavy hair half silver-white (her right side) and half purple (her left side), round gold-rim glasses, wearing a long white coat-robe with gold embroidery over a black dress with gold patterns, purple tassels. Match the photo reference.

## mimi
refs: ../huangquan-puzzle/art/vn/mimi-normal.webp
px: --gamma 0.8
desc: 咪咪 (Mimi), a ferryman-cat girl in human form: long black hair tied in a low ponytail with loose side strands, cool expression, wearing a black sheer cardigan with white flower prints over a black crop top, short black pleated skirt, black boots. Match the photo reference.

## heitang
refs: ../huangquan-puzzle/art/heitang.webp
desc: 黑糖 (Heitang), a friendly spirit-comforting dog: medium-large black-and-white border-collie-like dog, black body and ears, white muzzle stripe, white chest and white paws, pink tongue out. A four-legged dog walking (not a human), seen from front, left side, right side and back.
facedesc: 黑糖 (Heitang), a friendly black-and-white border-collie-like dog: ONLY ONE dog head and chest, front view, black fur and floppy black ears, white stripe down the muzzle, white chest, brown eyes, happy open mouth with pink tongue.

## xiaoyu
refs: ../huangquan-puzzle/art/vn/xiaoyu-normal.webp
desc: 小雨 (Xiaoyu), a sweet young woman with very long straight dark-brown hair and straight bangs, wearing an oversized cream-white sweatshirt as a short dress, bare legs, white sneakers. Match the photo reference.

## dabao
refs: ../huangquan-puzzle/art/vn/dabao-normal.webp
desc: 大寶 (Dabao), a young man photographer: messy two-tone hair (blond on top, dark underneath), wearing a loose black oversized t-shirt, light grey sweatpants, white sneakers. Match the photo reference.

## baimei
refs: ../huangquan-puzzle/art/baimei.webp
px: --gamma 0.8
desc: 白妹 (Baimei), a barber woman with long straight purple-magenta hair, big black thick-rimmed glasses, wearing a black kimono-style robe with a white inner collar and black sash, holding silver scissors and a comb. Match the photo reference. (Her hair is purple, not pink.)

## huji
refs: ../huangquan-puzzle/art/vn/huji-normal.webp
desc: 狐姬 (Huji), a fox-girl part-timer: long brown hair in a high ponytail, pink fox ears on a headband, fluffy pink-and-white pompom earrings, wearing a frilly ruffled pink chiffon dress with long sheer sleeves, and a big fluffy pink fox tail. Match the photo reference.

## jiuwei
refs: ../huangquan-puzzle/art/vn/jiuwei-normal.webp
px: --allow #1e4a55,#2e6b73
desc: 九尾 (Jiuwei), a nine-tailed fox barrier-mage girl: short lavender-purple bob hair, thin glasses, wearing a fluffy white fur coat with blue tassels over a white-and-blue dress, with several big fluffy blue fox tails fanning behind her (keep tails compact so she fits the cell). Match the photo reference.

## du
refs: ../huangquan-puzzle/art/vn/du-normal.webp
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 杜先生 (Mr. Du), a tattoo master, middle-aged man with swept-back salt-and-pepper grey hair, short grey beard stubble, thin glasses, black suit jacket, white open-collar shirt, black trousers, black shoes. Match the photo reference.

## yangzi
refs: ../huangquan-puzzle/art/vn/yangzi-normal.webp
desc: 孟婆 (Meng Po, named Yangzi), a beautiful young woman with long black hair with two long front locks, ornate silver crown headdress, wearing a white hanfu with pale blue patterns, wide sleeves, navy-blue waist band with silver ornaments and long navy ribbons. Match the photo reference.

## no7
refs: ../huangquan-puzzle/art/vn/no7-normal.webp
desc: 七號 (No.7), a handsome dessert-chef young man with dark purple hair tied in a top bun, a blue gem pendant necklace, wearing a white double-breasted chef jacket and white chef trousers, a metallic mechanical left arm. Match the photo reference.

## huatuo
refs: ../huangquan-puzzle/art/vn/huatuo-normal.webp
desc: 華佗 (Hua Tuo, the god of medicine) in hip-hop style: brown knit beanie, small round dark-green sunglasses, thin beard and mustache, black headphones around the neck, big gold chain medallion, dark brown zip hoodie over a dark tee, baggy dark grey cargo pants, sneakers. Match the photo reference.

## xiaomi
refs: ../huangquan-puzzle/art/vn/xiaomi-normal.webp
desc: 小米 (Xiaomi), a city-office clerk girl: black short bob with bangs, round glasses, a small call-center headset microphone, wearing a grey school-uniform-like blazer with navy trim, white shirt with navy bow tie, grey pleated skirt, black shoes. Match the photo reference.

## paofu
refs: ../huangquan-puzzle/art/paofu.webp
desc: 泡芙 (Paofu), a big strong Black man with very short black hair, wearing a red Chinese-style mandarin jacket with black frog buttons, black trousers, black shoes; cheerful expression. Match the photo reference.

## nova
refs: ../huangquan-puzzle/art/vn/nova-normal.webp
px: --height 28
desc: 諾瓦 (Nova), a little narwhal girl: short black bob hair, heterochromia (one blue eye), wearing a plush blue narwhal hat with a white horn and little fins, sleeveless sky-blue dress, white shoes. Match the photo reference.

## leviathan
refs: ../huangquan-puzzle/art/vn/leviathan-normal.webp
desc: 利維坦 (Leviathan), a demon-king young man with long silver hair with pale blue streaks, blue scale marks near the eye, headphones around his neck, wearing a dark navy velvet suit jacket with ornate black-silver trim, dark navy trousers. Match the photo reference.

# 一般亡魂（街坊填充，劇中亡魂額頭綁白色三角巾）

## soul-1
refs: 
desc: a generic newly-dead soul villager: a kind old man with bald head and white side hair, pale bluish-white skin, white triangle-shaped headband (Japanese ghost tenkan) on the forehead, wearing a beige cardigan and brown trousers, slippers. Cute and friendly, not scary.

## soul-2
refs: 
desc: a generic newly-dead soul villager: a chubby middle-aged auntie with short permed dark hair, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, wearing a flowery purple blouse and black pants, with an apron. Cute and friendly, not scary.

## soul-3
refs: 
desc: a generic newly-dead soul villager: a tired young office worker man with neat black hair, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, white shirt, loose navy tie, grey trousers, holding a briefcase. Cute and friendly, not scary.

## soul-4
refs: 
desc: a generic newly-dead soul villager: a high-school girl with black twin ponytails, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, white sailor uniform with a red scarf and navy skirt. Cute and friendly, not scary.

## soul-5
refs: 
px: --height 25
desc: a generic newly-dead soul villager: a small boy child with short brown hair, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, yellow t-shirt, blue shorts, red sneakers. Cute and friendly, not scary.

## soul-6
refs: 
desc: a generic newly-dead soul villager: a sturdy construction worker man with a buzz cut and mustache, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, orange work vest over a grey tee, khaki work pants, boots. Cute and friendly, not scary.

## soul-7
refs: 
desc: a generic newly-dead soul villager: an old granny with a grey hair bun, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, wearing a traditional dark-green Chinese qipao-style top and black pants, walking with a wooden cane. Cute and friendly, not scary.

## soul-8
refs: 
desc: a generic newly-dead soul villager: a young man with dyed red-brown messy hair, pale bluish-white skin, white triangle-shaped ghost headband on the forehead, wearing a white plain burial robe (simple white kimono-like shroud) and straw sandals. Cute and friendly, not scary.

# 外圍怪物（face: no）

## mob-ghost
refs: ../huangquan-puzzle/art/enemy-ghost.webp
face: no
desc: 抓交替冤魂, a drowned vengeful ghost monster from the sea: skinny rotting skeletal body with tattered seaweed-covered grey-brown rags, long stringy black wet hair, glowing green eyes, clawed hands reaching forward, dripping water. Chibi game-monster proportions, creepy but cute enough for a cozy game.

## mob-miasma
refs: ../huangquan-puzzle/art/enemy-moqi.webp
px: --height 26
face: no
desc: 魔氣團, a floating blob of purple demonic miasma smoke: a round swirling cloud of violet and dark purple smoke with two small glowing angry eyes, wispy tendrils, floating above the ground (no legs). For the walking frames, bob up and down / swirl slightly.

## mob-lizard
refs: ../huangquan-puzzle/art/enemy-lizard.webp
px: --height 22
face: no
desc: 蜥蜴蠱, a cursed gu-poison lizard monster: black scaly lizard with gold vein patterns, glowing red eyes, open mouth with fangs, long curled tail, crawling on four legs. Chibi game-monster proportions.

## mob-lost
refs: 
face: no
desc: 迷途魂, a lost wandering soul monster: a hunched faceless grey-lavender ghost wrapped in a ragged hooded grey shroud, hollow dark face with two small pale glowing eyes, wisps of mist trailing at the bottom instead of feet, lonely and confused. Chibi, cozy-game spooky.

# 王（大地圖頭目，也做頭像）

## boss-laji
refs: ../huangquan-puzzle/art/enemy-laji.webp ../huangquan-puzzle/art/enemy-laji2.webp
desc: 辣雞 (Laji), a punk young man villain: black bowl-cut hair, sneering angry face, navy-black tracksuit with white side stripes, thick gold chain necklace, white sneakers, red petals swirling around his hand. Match the photo reference.

## boss-bailaoda
refs: ../huangquan-puzzle/art/baizhu.webp ../huangquan-episodes/characters/白蛛會角頭.jpg
desc: 白老大 (Boss Bai of the White Spider gang), a menacing middle-aged gangster boss: slicked-back black hair, a black spider-web tattoo covering one cheek and a scar, wearing a white suit jacket and white trousers over a black open-collar shirt, black shoes. Match the photo references.

## boss-hasshaku
refs: ../huangquan-puzzle/art/bachi.webp ../huangquan-puzzle/art/enemy-bachi.webp
desc: 八尺大人 (Hasshaku-sama), a very tall eerie woman ghost: extremely long straight black hair hanging over and hiding her whole face, a tattered long white-beige robe stained at the hem, holding a red Japanese paper parasol with red tassels over her head, faint purple aura. Make her tall and thin (taller than normal characters) but still fit the cell.

## boss-leviathan
refs: ../huangquan-puzzle/art/enemy-leviathan.webp ../huangquan-puzzle/art/vn/leviathan-normal.webp
desc: 利維坦 (Leviathan) in battle mode, the demon king of the second realm: long silver hair with pale blue streaks, blue scale marks near the eye, black open jacket and black trousers, surrounded by swirling icy-blue water currents and small blue lightning sparks around his body. Match the photo references.

## boss-satan
refs: ../huangquan-puzzle/art/enemy-satan.webp ../huangquan-episodes/characters/撒旦.jpg
desc: 撒旦 (Satan), demon king of the third kingdom: a black goat-headed demon with big curved dark-red horns and a golden spiked crown, yellow eyes, wearing ornate crimson-and-gold dragon-scale armor with a red cape, large red bat wings (folded compact), goat hooves. Chibi but imposing. Match the photo references.

# 線 C 名單追加：街坊（draw 1）

## mi
refs: ../huangquan-puzzle/art/mi.webp
desc: 謎 (Mi), a cute pale cream-white leopard-gecko (守宮) person-sized critter standing upright on two legs, big round red eyes, bumpy cream skin, thick tail, wearing a yellow construction hard hat. An animal, not a human.

## rat
refs: ../huangquan-puzzle/art/vn/rat-normal.webp ../huangquan-puzzle/art/rat.webp
desc: 鼠軍師 (Rat Strategist), a chubby golden hamster standing upright like a person, wearing a tall black-and-white Chinese scholar-official hat with a yin-yang emblem, a white-and-black Chinese strategist robe with gold embroidery and a yin-yang belt buckle, white tassel. An animal, not a human.

## qianliyan
refs: ../huangquan-puzzle/art/vn/qianliyan-normal.webp ../huangquan-puzzle/art/qianliyan.webp
desc: 千里眼 (Qianliyan, the far-seeing guardian god), a tall young man wearing a green-and-gold feathered bird mask over his eyes, spiky green feather hair, a big green-yellow-and-dark-teal feather cloak, white fluffy chest feathers, bronze armor belt and bracers. Match the photo reference.

# 外賓、援手（draw 2）

## lvyi
refs: ../huangquan-puzzle/art/lvyi.webp
desc: 綠衣女子 (the Lady in Green), a city-office clerk woman with a black short bob with bangs and a small hair ornament, wearing a pale mint-green hanfu with wide sleeves and a light sash, a small white smiling ghost mask spirit (shikigami) floating beside her. Match the photo reference.

## gongwan
refs: ../huangquan-puzzle/art/vn/gongwan-normal.webp ../huangquan-puzzle/art/gongwan.webp
desc: 貢丸君 (Gongwan-kun), a plump dark-brown/black ferryman cat with an orange collar and a round gold name tag, smug squinting eyes. A real four-legged cat walking (not a human), seen from front, left side, right side and back.
facedesc: 貢丸君 (Gongwan-kun), a plump dark-brown/black cat with an orange collar and round gold tag, smug squinting eyes. ONLY ONE cat head and chest, front view.
px: --gamma 0.8

## cat918
refs: ../huangquan-puzzle/art/cat918.webp
desc: 918號引渡貓 (Ferry Cat No.918), a chubby grey British-shorthair cat with round amber eyes, wearing a cord necklace with a small square wooden tag. A real four-legged cat walking (not a human), seen from front, left side, right side and back.
facedesc: 918號引渡貓, a chubby grey British-shorthair cat with round amber eyes and a cord necklace with a small square wooden tag. ONLY ONE cat head and chest, front view.

## shencha
refs: ../huangquan-puzzle/art/shencha.webp
desc: 神差 (Shencha, a divine messenger), a shiba-inu dog head on a humanoid body, wearing an Egyptian black-and-gold nemes headdress and black-gold Egyptian armor robe with a turquoise collar, holding a curved khopesh sword, happy tongue out. Match the reference.

## hathor
refs: ../huangquan-puzzle/art/hathor.webp
desc: 哈索爾 (Hathor, Egyptian goddess), a woman with long dark-brown hair and bangs, a black-and-gold horned headdress holding a gold sun disk, gold-and-turquoise Egyptian collar, black dress, holding golden balance scales. Match the reference.

## aphrodite
refs: ../huangquan-puzzle/art/aphrodite.webp
desc: 阿芙羅黛蒂 (Aphrodite), a woman with a short dark-auburn bob and a flower crown of white and pink roses, wearing a flowing white Greek one-shoulder dress, holding a small golden harp. Match the reference.

## aizen
refs: ../huangquan-puzzle/art/aizen.webp
desc: 愛染明王 (Aizen Myo-o), a fierce young man with spiky blond hair, a golden-red crown with a small red demon face, a long pearl necklace, bare-chested with a red-and-gold draped robe and gold armlets, holding a big calligraphy brush, red flames around him. Match the reference.

## dulao
refs: ../huangquan-episodes/characters/gallery/杜先生/1.jpg ../huangquan-episodes/characters/gallery/杜先生/3.jpg
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 杜老大 (Boss Du of the Black Dragon gang, Mr. Du's counterpart on Gengyin Earth), the same face as the reference man: middle-aged East Asian man, swept-back salt-and-pepper grey hair, round thin glasses, grey goatee, a small gold earring; dressed as a gangster boss: black open-collar shirt with the edge of a dragon tattoo visible on the chest, black trousers, black shoes.

## tiedan
refs: ../huangquan-puzzle/art/vn/tiedan-normal.webp ../huangquan-puzzle/art/tiedan.webp
desc: 鐵蛋 (Tiedan), a high-school girl spirit medium: long straight black hair, white school shirt with a black bow ribbon, cream knit cardigan, short black pleated skirt, white socks, loafers. Match the photo reference.

## guangtou
refs: 
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 光頭小弟 (the bald henchman of the Black Dragon gang), a stocky young man with a shaved bald head, thick eyebrows, wearing a black tank top under an open short-sleeve shirt, black trousers, sneakers, carrying a wooden baseball bat on his shoulder; tough but goofy expression.

## gengyin
refs: ../huangquan-puzzle/art/vn/gengyin-normal.webp ../huangquan-puzzle/art/gengyin.webp
desc: 庚寅月老 (Old Yue Lao of Gengyin Earth), an old man with white hair in a top bun with a small gold crown, a very long white beard and mustache, wearing a red Chinese robe with heavy gold embroidery, holding red strings and a red book of marriages. Match the photo reference.

## lucifer
refs: ../huangquan-puzzle/art/vn/lucifer-normal.webp ../huangquan-puzzle/art/lucifer.webp
desc: 路西法 (Lucifer), a fallen-angel man with very long straight platinum-white hair, pale face, large white feathered wings (folded compact), ornate black-and-gold spiked armor with a long black cape. Match the photo reference.

## zhurong
refs: ../huangquan-puzzle/art/vn/zhurong-normal.webp ../huangquan-puzzle/art/zhurong.webp
desc: 祝融 (Zhurong, god of fire), a young man with long wild blond-and-black hair, glowing orange-red eyes, wearing ornate red-and-gold dragon armor with a flowing crimson cape. Match the photo reference.

# 委託人、陽間的人（draw 3；有走路圖的也畫）

## maoguai
refs: ../huangquan-puzzle/art/maoguai.webp
desc: 毛怪 (Maoguai), a young woman with a short black bob, wearing a purple wrap kimono-style top over a dark skirt, holding chopsticks, gentle sleepy smile. Match the photo reference.

## xiaole
refs: ../huangquan-puzzle/art/xiaole.webp
desc: 小樂 (Xiaole), a young woman with a chin-length brown bob, a cream beret, a beige knit cardigan over a white camisole, light jeans; shy, slightly teary expression. Match the photo reference.

## daniu
refs: ../huangquan-puzzle/art/daniu.webp
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 大牛 (Daniu), a muscular bald man with a small goatee, white tank top, dark trousers, holding a wooden ancestral tablet with both hands; remorseful expression. Match the photo reference.

## moti
refs: ../huangquan-puzzle/art/moti.webp
desc: 茉蒂 (Moti), a punk young woman with a black bob under a cream knit beanie, a cross necklace, black crop tank top, black jacket hanging off her shoulders, black jeans. Match the photo reference.

## abinmom
refs: ../huangquan-puzzle/art/abinmom.webp
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 阿斌的媽媽 (Abin's mom), a middle-aged woman with curly shoulder-length black hair, a pink t-shirt with a cute white bunny face, blue jeans; kind, teary smile. Match the photo reference.

## laoren
refs: ../huangquan-episodes/characters/gallery/老人/1.jpg ../huangquan-episodes/characters/gallery/老人/2.jpg
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 獨居的爺爺 (the old man living alone), a skinny elderly East Asian man, bald with short white hair on the sides, gentle smile, wearing a white-and-blue striped polo shirt and grey slacks, holding a small red envelope. Match the photo reference.

## waipo
refs: ../huangquan-puzzle/art/waipo.webp
desc: 外婆 (Grandma), an elderly woman with white-grey short wavy hair, wearing a pink-and-white floral short-sleeve blouse and dark trousers, gentle loving smile. Match the photo reference.

## couple
refs: ../huangquan-episodes/characters/gallery/男同志情侶/1.jpg
desc: 男同志情侶 (a gay couple), TWO young East Asian men standing side by side holding hands, both slim with short black hair: one in a white t-shirt and jeans, one in a navy shirt and dark trousers. Draw both small enough to fit together in one 32x32 cell.
facedesc: 男同志情侶 (a gay couple), TWO young East Asian men with short black hair, shoulder to shoulder, smiling softly, one in a white t-shirt, one in a navy shirt; both busts in one square portrait.
px: --height 27

## liangan
refs: ../huangquan-puzzle/art/vn/liangan-normal.webp ../huangquan-puzzle/art/liangan.webp
desc: 梁安恆 (Liang Anheng), a handsome high-school boy with brown hair, white short-sleeve school shirt, black school trousers. Match the photo reference.

## yiman
refs: ../huangquan-puzzle/art/vn/yiman-normal.webp ../huangquan-puzzle/art/yiman.webp
desc: 林怡曼 (Lin Yiman), a high-school girl with long black hair and a small hair clip, white short-sleeve school shirt with a red embroidered name, navy pleated skirt, white socks. Match the photo reference.

## linbobo
refs: ../huangquan-puzzle/art/vn/linbobo-normal.webp
face: only
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 林伯伯 (Uncle Lin), a weathered middle-aged East Asian man with short black hair, navy polo shirt, dark trousers. Match the photo reference.

## bohong
refs: ../huangquan-puzzle/art/vn/bohong-normal.webp
face: only
desc: 王柏宏 (Wang Bohong), a young man with short black hair, black track jacket with white stripes. Match the photo reference.

## afu
refs: ../huangquan-puzzle/art/afu.webp
face: only
px: --ban #e2b65a,#f3d58c --gamma 0.75
desc: 阿副 (Afu), a firefighter with long wet black hair and stubble, soot on his face, wearing a red-and-black firefighter turnout coat with yellow reflective stripes. Match the photo reference.

## xiaoqing
refs: ../huangquan-puzzle/art/xiaoqing.webp
face: only
desc: 筱晴 (Xiaoqing), a cheerful young woman with light-brown hair under a straw hat, white blouse with a navy vest-apron, holding a carton of milk. Match the photo reference.

## akasaka
refs: ../huangquan-puzzle/art/akasaka.webp
face: only
desc: 赤坂 (Akasaka), a man with long dark hair with red highlights, black rectangular glasses, white polo shirt. Match the photo reference.

# 出征與保衛戰敵人（B 的 HQ.enemies；face: no，王有頭像）

## en-sawghost
refs: 
face: no
desc: 刀鋸亡者 (saw-hell dead), a grey-skinned sinner ghost in torn prisoner rags with old saw-cut scars, chains on wrists, hollow glowing eyes, hunched; creepy but cozy-game cute.

## en-sinner
refs: 
face: no
desc: 受刑罪魂 (punished sinner soul), a pale bluish ghost man wearing a wooden cangue (square wooden pillory board) around his neck and grey prisoner clothes, iron shackles, gloomy face.

## en-baizhu
refs: ../huangquan-puzzle/art/enemy-spidergang.webp
face: no
desc: 白蛛會幫眾 (White Spider gang thug), a tough man with short black hair, black short-sleeve shirt, black trousers and boots, tattooed arms, clenched fists. Match the reference.

## en-shushi
refs: ../huangquan-puzzle/art/vn/shushi-normal.webp ../huangquan-puzzle/art/shushi.webp
face: no
desc: 術士 (the sorcerer), a lean old man with white hair and a red blindfold over his eyes, bare chest with bead necklaces, red-and-black tribal sash and skirt with charms, holding a tall carved staff with a skull. Match the reference.

## en-raincoat
refs: ../huangquan-puzzle/art/vn/raincoat-normal.webp ../huangquan-puzzle/art/raincoat.webp
face: no
desc: 黃雨衣 (Yellow Raincoat), a young man in a long translucent yellow hooded raincoat, holding a dark purple sniper rifle, glowing purple sigil on his raised palm. Match the reference.

## boss-tide
refs: ../huangquan-puzzle/art/enemy-ghost.webp
desc: 海邊冤魂王 (leader of the drowned ghosts at the seaside), a big hulking drowned ghost: rotting grey-green body covered in seaweed and barnacles, long wet black hair, glowing green eyes, a rusty anchor chain over the shoulder, dripping water. Larger and more imposing than a normal ghost.

## en-relic
refs: 
face: no
desc: 遺跡守衛 (ancient relic guardian), a small stone golem made of dark carved temple stone blocks with glowing amber runes and one glowing eye, moss on its shoulders, heavy fists.

## boss-eye
refs: ../huangquan-puzzle/art/enemy-godeye.webp
desc: 古神之眼 (Eye of the Old God), a giant floating eyeball with a golden-orange slit pupil, surrounded by a ring of black writhing tentacles, dark mist, floating above the ground (no legs). For the walking frames, float and wiggle tentacles.
px: --height 28

## en-narwhal
refs: ../huangquan-puzzle/art/enemy-suit.webp
face: no
desc: 惡魔士兵 (demon soldier of the second demon kingdom), a grunt demon with small curved horns, dark blue-grey skin, wearing simple navy armor and holding a spear.

## en-hamster
refs: ../huangquan-puzzle/art/rat.webp
face: no
desc: 倉鼠小兵 (hamster foot soldier), a small golden hamster standing upright wearing a tiny black helmet and a little round shield and a short spear, determined face. An animal.
px: --height 24

## en-rat
refs: ../huangquan-puzzle/art/vn/rat-normal.webp ../huangquan-puzzle/art/rat.webp
face: no
desc: 鼠軍師 (Rat Strategist), a chubby golden hamster standing upright like a person, wearing a tall black-and-white Chinese scholar-official hat with a yin-yang emblem, a white-and-black Chinese strategist robe with gold embroidery. An animal, not a human.

## en-skeleton
refs: ../huangquan-puzzle/art/enemy-skeleton.webp
face: no
desc: 骷髏兵 (skeleton soldier of the third kingdom), a skeleton warrior in rusty black spiked armor, glowing purple eyes in the skull, holding a jagged purple-glowing sword.

## en-bat
refs: ../huangquan-puzzle/art/enemy-bat.webp
face: no
desc: 蝙蝠惡魔 (bat demon), a red demonic bat with big spread leathery wings, small horns, glowing eyes, little claws, flying (no walking legs on the ground). For the walking frames, flap the wings up and down.

## en-reaper
refs: ../huangquan-puzzle/art/enemy-reaper.webp
desc: 第三王國惡魔 (Centurion of Satan's Fifth Legion), a dark armored demon knight in black spiked armor with a hooded cloak, a skull face with glowing red eyes, blue lightning wisps, holding a glowing red greatsword.

## en-gu-teacher
refs: ../huangquan-puzzle/art/gu.webp ../huangquan-puzzle/art/enemy-gu.webp
desc: 辜老師 (Teacher Gu), a sinister middle-aged man with a black top hat, black sunglasses, grey goatee and mustache, wearing a dark crimson velvet suit, holding glowing purple-and-orange magic orbs. Match the reference.

## boss-plague
refs: ../huangquan-puzzle/art/enemy-plague.webp ../huangquan-episodes/characters/瘟疫.jpg
desc: 瘟疫 (Plague, a demon lord), a tall figure in a hooded tattered crimson-and-dark-purple robe, a black goat face hidden in the hood's shadow, curved dark purple horns, a purple crystal pendant, sickly green miasma swirling around. Match the references.

## en-north
refs: 
face: no
desc: 北境冰魂 (ice soul of the North), a translucent pale-blue icy ghost with frost crystals on its shoulders, long white wispy hair, cold glowing white eyes, misty lower body fading into snow.

## boss-evilgod
refs: ../huangquan-puzzle/art/enemy-xieshen.webp
desc: 邪神帝 (the Evil God Emperor), a huge dark tentacled god: a dark sphere body covered in glowing crimson eyes and runes, crowned with a red glowing sigil halo, many black-and-crimson tentacles below, floating. For the walking frames, float and wiggle tentacles.
px: --height 30
