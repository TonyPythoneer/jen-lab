export const categories = [
  { "id": "steakhouse", "name": "牛排館", "color": "#A52A2A" },
  { "id": "fine_dining", "name": "精緻料理", "color": "#800080" },
  { "id": "thai", "name": "泰餐", "color": "#20B2AA" },
  { "id": "korean", "name": "韓餐", "color": "#FFA500" },
  { "id": "japanese", "name": "日餐", "color": "#4682B4" },
  { "id": "chinese", "name": "中餐", "color": "#B22222" },
  { "id": "taiwanese", "name": "台灣餐廳", "color": "#FA8072" },
  { "id": "malaysian", "name": "馬來餐", "color": "#6B8E23" },
  { "id": "french", "name": "法餐", "color": "#FF8C00" },
  { "id": "italian", "name": "義餐", "color": "#4B0082" },
  { "id": "spanish", "name": "西班牙餐", "color": "#E9967A" },
  { "id": "middle_eastern", "name": "中東餐", "color": "#D2691E" },
  { "id": "dessert", "name": "甜點", "color": "#DB7093" },
  { "id": "coffee", "name": "咖啡", "color": "#8B4513" },
  { "id": "bar", "name": "酒吧", "color": "#2F4F4F" },
  { "id": "bubble_tea", "name": "泡泡飲", "color": "#00CED1" }
] as const

export const restaurants = [
  {
    "id": "steak-1",
    "name": "Meat and Wine Co",
    "categoryId": "steakhouse",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8642,
      "lng": 151.2023
    },
    "summary": "景色最美的話要選Barangaroo靠窗邊的位子。",
    "description": "很多分店，但是景色最美的話要選Barangaroo靠窗邊的位子。袋鼠肉的烤肉串蠻出名的味道也不錯，可以嘗試。牛排最喜歡Rib Eye但是個人認為不需要點到wagyu等級, oconnor mb3+就很不錯了，如果要嘗試的話可以試試看。強烈推薦把配菜換成mash potato 或者 sweet potato chips，真的好吃! 甜點一般，建議留下肚子去吃隔壁的冰淇淋。",
    "priceRange": "$$$",
    "recommendations": [
      "Rib Eye",
      "豬肋排串",
      "Mash Potato"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/hfVxy39JgX7HYqHJ8",
    "photoUrl": "https://picsum.photos/seed/nsteak1/800/600"
  },
  {
    "id": "steak-2",
    "name": "Gidley",
    "categoryId": "steakhouse",
    "area": "CBD",
    "coordinates": {
      "lat": -33.866,
      "lng": 151.207
    },
    "summary": "入口隱蔽在地下室的神秘牛排館，袋鼠肉令人驚艷。",
    "description": "會沒收手機的神奇餐廳，入口頗隱蔽在一個地下室。牛排點rib eye 300gm那個中間部位的最好吃。除了牛排之外，最驚豔的居然是袋鼠肉，處理得很好! Medium Rare熟度剛好，很嫩也有足夠的咬勁。配菜烤南瓜很讚，甜點推薦buttermilk ice cream，有切碎的蜂巢，口感層次豐富。",
    "priceRange": "$$$",
    "recommendations": [
      "Rib Eye 300gm",
      "豬肋排",
      "Buttermilk Ice Cream"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/KiYB1M5cjGUUUh8z9",
    "photoUrl": "https://picsum.photos/seed/nsteak2/800/600"
  },
  {
    "id": "steak-3",
    "name": "Rockpool Bar & Grill",
    "categoryId": "steakhouse",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8655,
      "lng": 151.2105
    },
    "summary": "必點嫩滑的安格斯牛與絕配的松露牛骨髓義大利麵。",
    "description": "一定要點牛排，推薦安格斯牛medium rare，最能吃到很嫩的口感。豬排其實也很好吃，醬是微甜的! 肉份量都巨無霸。推薦松露牛骨髓義大利麵，骨髓的油脂感搭配松露香氣是絕配!!",
    "priceRange": "$$$$",
    "recommendations": [
      "頂級木炭烤 Medium Rare",
      "裸骨義大利麵"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/85pbeYwbFAziAJG16",
    "photoUrl": "https://picsum.photos/seed/nsteak3/800/600"
  },
  {
    "id": "fine-1",
    "name": "Aria Restaurant Sydney",
    "categoryId": "fine_dining",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8587,
      "lng": 151.214
    },
    "summary": "正對歌劇院的絕佳視野，創意調酒與季節菜單。",
    "description": "超近距離正對歌劇院的fine dining。Lamington口味的調酒超好喝，爆米花+玉米泥口味的前菜很特別。每季度都會換菜單。",
    "priceRange": "$$$$",
    "recommendations": [
      "Lamington 甜點",
      "牛肉主菜"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/qAFiHk8rtCetQB9F6",
    "photoUrl": "https://picsum.photos/seed/nfine1/800/600"
  },
  {
    "id": "fine-2",
    "name": "Cafe Sydney",
    "categoryId": "fine_dining",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8615,
      "lng": 151.211
    },
    "summary": "坐擁雪梨港絕美景色，氛圍大於餐點。",
    "description": "主打一個美景，餐點就是還不錯沒什麼記憶點(但雪梨港的景真的是，絕!)。",
    "priceRange": "$$$$",
    "recommendations": [
      "精緻料理",
      "海鮮"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/ab4F4dSWNLD7kDbGA",
    "photoUrl": "https://picsum.photos/seed/nfine2/800/600"
  },
  {
    "id": "fine-3",
    "name": "Kuro Bar & Dining",
    "categoryId": "fine_dining",
    "area": "CBD",
    "coordinates": {
      "lat": -33.868,
      "lng": 151.206
    },
    "summary": "每季驚艷的日式 Fine Dining，價格精緻值得慢品。",
    "description": "日料Fine Dining，每季有不同的菜單。每道菜都很驚豔，但價格也很精艷XD 需要慢慢品嘗!",
    "priceRange": "$$$$",
    "recommendations": [
      "每季套餐"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/t4cqmd7emEyzKSDC6",
    "photoUrl": "https://picsum.photos/seed/nfine3/800/600"
  },
  {
    "id": "thai-1",
    "name": "Mango Coco",
    "categoryId": "thai",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8798,
      "lng": 151.2055
    },
    "summary": "甜點才是本體的泰餐店，招牌鹹蛋黃球必吃。",
    "description": "主餐個人覺得還好，重點甜點好吃種類又很多，推薦下午茶的時段去不用排隊。甜點招牌流心鹹蛋黃球、泰奶Bingsu。",
    "priceRange": "$$",
    "recommendations": [
      "流沙鹹蛋黃",
      "泰奶 Bingsu"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/mgbWHp9jcdgm9nDQ7",
    "photoUrl": "https://picsum.photos/seed/nthai1/800/600"
  },
  {
    "id": "thai-2",
    "name": "Chat Thai",
    "categoryId": "thai",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.2052
    },
    "summary": "雪梨最有名的泰餐連鎖，CP值高且辣度十足。",
    "description": "雪梨最有名的泰餐連鎖，CP值很高基本上點什麼都不會雷。要注意辣度，有辣的菜是真的很辣。有些分店不能預約要現場排隊建議事先打電話問。",
    "priceRange": "$$",
    "recommendations": [
      "Pad Thai",
      "Som Tum"
    ],
    "googleMapsLink": "https://www.chatthai.com.au/",
    "photoUrl": "https://picsum.photos/seed/nthai2/800/600"
  },
  {
    "id": "thai-3",
    "name": "Show Neua Thai Street Food",
    "categoryId": "thai",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8805,
      "lng": 151.205
    },
    "summary": "生醃蝦超級無敵好吃的人氣泰式小吃。",
    "description": "這家的生醃蝦超級無敵好吃!! 其他的泰式小吃也很棒，缺點是座位比較小一點，有點擁擠。",
    "priceRange": "$$",
    "recommendations": [
      "酸辣蝦"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/p4Tci71CQkbkixX36",
    "photoUrl": "https://picsum.photos/seed/nthai3/800/600"
  },
  {
    "id": "thai-4",
    "name": "Thanon Khaosan",
    "categoryId": "thai",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.206
    },
    "summary": "海鮮沙拉配生醃蝦，還有中藥味濃郁的台式感湯頭。",
    "description": "這家有生醃蝦+木瓜沙拉+生魚片的套餐。沙拉很辣，要跟店員說mild。有一種湯Guay Jub喝起來有台式牛肉麵的感覺，濃濃的中藥感，超愛。",
    "priceRange": "$$",
    "recommendations": [
      "酸辣蝦套餐",
      "Guay Jub 湯"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/LXQAUUXh4a3S59vc6",
    "photoUrl": "https://picsum.photos/seed/nthai4/800/600"
  },
  {
    "id": "thai-5",
    "name": "Khao Kang Maruay",
    "categoryId": "thai",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8802,
      "lng": 151.2048
    },
    "summary": "嗆辣過癮的生醃蝦與必淋醬汁的酸甜蒸魚。",
    "description": "生醃蝦有蒜瓣+芥末，很嗆很過癮。打拋豬要挑掉綠辣椒不然很辣。蒸魚酸甜微辣的調味蠻好吃的，記得把醬汁淋上去讓魚肉多沾點醬味。",
    "priceRange": "$$",
    "recommendations": [
      "酸辣蝦",
      "烤柳橙",
      "烤鴨腿"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/vVq8R5X4EM3C15Kr5",
    "photoUrl": "https://picsum.photos/seed/nthai5/800/600"
  },
  {
    "id": "kor-1",
    "name": "Hansang",
    "categoryId": "korean",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8765,
      "lng": 151.2035
    },
    "summary": "暖心牛骨湯首選，生牛肉石鍋拌飯表現出色。",
    "description": "專門喝湯的，只要湯類都很好，個人推薦牛骨湯。生牛肉石鍋拌飯不錯。續小菜現在要加錢了，要注意。",
    "priceRange": "$$",
    "recommendations": [
      "牛骨湯",
      "牛骨涮涮鍋"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/RNadaFQGrtFJvE6J7",
    "photoUrl": "https://picsum.photos/seed/nkor1/800/600"
  },
  {
    "id": "kor-2",
    "name": "Butchers Buffet",
    "categoryId": "korean",
    "area": "CBD",
    "coordinates": {
      "lat": -33.877,
      "lng": 151.204
    },
    "summary": "肉質不錯的韓燒吃到飽，適合多人聚餐。",
    "description": "韓燒吃到飽，肉質都算不錯，想大口吃肉的時候可以去吃!",
    "priceRange": "$$",
    "recommendations": [
      "韓式烤肉吃到飽"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/hGM6ieTCf2gizvuXA",
    "photoUrl": "https://picsum.photos/seed/nkor2/800/600"
  },
  {
    "id": "kor-3",
    "name": "Park Poon Sook City",
    "categoryId": "korean",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8785,
      "lng": 151.2045
    },
    "summary": "便宜大碗的朋友聚餐首選，炸排骨必點。",
    "description": "每道料理都便宜又大碗，無論是辣醬炒豬肉，還是豬骨湯、海鮮煎餅、炸雞，樣樣都口味正宗不踩雷。最推薦的菜色是炸排骨。",
    "priceRange": "$$",
    "recommendations": [
      "烤五花",
      "辣炒豬頸肉",
      "豬骨湯"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/bNbcvBLSDKKZwQdv8",
    "photoUrl": "https://picsum.photos/seed/nkor3/800/600"
  },
  {
    "id": "jap-1",
    "name": "Kobe Wagyu Yakiniku",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8745,
      "lng": 151.2055
    },
    "summary": "市區最知名的頂級日燒，肉質保證且提供吃到飽。",
    "description": "雪梨市區日燒應該算最有名的了，肉質沒話說! 食量不錯的朋友也可以直接選吃到飽，有包含生魚片跟壽司~",
    "priceRange": "$$$",
    "recommendations": [
      "吃到飽",
      "牛魚子",
      "壽司"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/UpVxuCzvJ5R5pcJM6",
    "photoUrl": "https://picsum.photos/seed/njap1/800/600"
  },
  {
    "id": "jap-2",
    "name": "Daruma",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8725,
      "lng": 151.2065
    },
    "summary": "味道正宗的日式居酒屋，山藥明太子與烤鯖魚。",
    "description": "居酒屋，客人多數是日本人味道很正宗，好吃的有山藥明太子、生魚片、烤鯖魚、炸茄子等等。",
    "priceRange": "$$",
    "recommendations": [
      "山葵鮭太子",
      "牛魚子",
      "定食魚魚"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/mwtEoqoX4ZcqxVuE7",
    "photoUrl": "https://picsum.photos/seed/njap2/800/600"
  },
  {
    "id": "jap-3",
    "name": "Goryon San",
    "categoryId": "japanese",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.8845,
      "lng": 151.212
    },
    "summary": "位於 Surry Hills 的正宗日式串燒店。",
    "description": "在Surry Hills，但離Central火車站不遠的居酒屋。串燒好吃。",
    "priceRange": "$$",
    "recommendations": [
      "串燒"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/ZWWBBta8ZAjthD2f9",
    "photoUrl": "https://picsum.photos/seed/njap3/800/600"
  },
  {
    "id": "jap-4",
    "name": "Gojima",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8692,
      "lng": 151.1942
    },
    "summary": "如摩斯漢堡般的驚艷米漢堡，西式餡料完美結合。",
    "description": "會有點摩斯漢堡感覺的米漢堡，只是形狀不一樣，餡料也是西式的漢堡肉排起司餡，但是超級好吃!",
    "priceRange": "$$",
    "recommendations": [
      "米漢堡"
    ],
    "googleMapsLink": "https://g.co/kgs/nQeSGHX",
    "photoUrl": "https://picsum.photos/seed/njap4/800/600"
  },
  {
    "id": "jap-5",
    "name": "Mensho Tokyo Sydney",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8675,
      "lng": 151.21
    },
    "summary": "湯頭甜香的排隊拉麵店，限量鴨肉拉麵是重點。",
    "description": "拉麵湯頭又甜又香，可以選有三種不同的肉那款，裡面有鴨肉，很好吃。要在中午12點前去，排隊超過10分鐘就完全不值得了。",
    "priceRange": "$$",
    "recommendations": [
      "鰻魚拉麵"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/TWJ8Xf2pAt4uTSZZA",
    "photoUrl": "https://picsum.photos/seed/njap5/800/600"
  },
  {
    "id": "jap-6",
    "name": "Gold Class Daruma",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8722,
      "lng": 151.2062
    },
    "summary": "彷彿置身日本的高CP值午間便當。",
    "description": "店面、服務生跟顧客都會讓人有種到了日本的感覺! 中午的便當可以吃到很豐富的菜品，非常划算又好吃。",
    "priceRange": "$$",
    "recommendations": [
      "中午便當"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/DYFvuwGbEiW2Yt4Y6",
    "photoUrl": "https://picsum.photos/seed/njap6/800/600"
  },
  {
    "id": "jap-7",
    "name": "Ito Restaurant",
    "categoryId": "japanese",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.8855,
      "lng": 151.2125
    },
    "summary": "Surry Hills 必吃炸豬排，Kingfish 配菜特別。",
    "description": "在Surry Hills，炸豬排真的超級好吃! Kingfish的醬汁跟配菜蠻特別的。。價格偏貴，要慎重。",
    "priceRange": "$$$",
    "recommendations": [
      "炸豬排",
      "Kingfish"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/uXJBqdtStD1WZAnDA",
    "photoUrl": "https://picsum.photos/seed/njap7/800/600"
  },
  {
    "id": "jap-8",
    "name": "Mikazuki",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8715,
      "lng": 151.2115
    },
    "summary": "黑蒜汁拉麵香濃好味，生魚片新鮮划算。",
    "description": "特別口味的黑蒜汁拉麵很好吃，生魚片新鮮也不貴。",
    "priceRange": "$$",
    "recommendations": [
      "黑蒜汁湯麵",
      "牛魚子"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/woqhemVSSgg1HfDW7",
    "photoUrl": "https://picsum.photos/seed/njap8/800/600"
  },
  {
    "id": "jap-9",
    "name": "Nichi Getsu Dō",
    "categoryId": "japanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.876,
      "lng": 151.205
    },
    "summary": "濃郁湯頭與有咬勁的粗麵，週一加送溫泉蛋。",
    "description": "麵體較粗有咬勁、湯頭味道很濃。每週一招牌口味送一顆溫泉蛋!",
    "priceRange": "$$",
    "recommendations": [
      "特製炒麵"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/qc5Sfsvw2LiYSzKs7",
    "photoUrl": "https://picsum.photos/seed/njap9/800/600"
  },
  {
    "id": "chi-1",
    "name": "The Dolar Shop",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8788,
      "lng": 151.2038
    },
    "summary": "單人火鍋界天花板，頂級銀湯與飯後冰淇淋。",
    "description": "單人火鍋界天花板，推薦銀湯。蝦滑跟飛餅都超讚。要留一點點胃因為飯後有免費冰淇淋。",
    "priceRange": "$$$",
    "recommendations": [
      "火鍋",
      "花卷",
      "白飯"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/BKeaQyHQQ6YgAs4B8",
    "photoUrl": "https://picsum.photos/seed/nchi1/800/600"
  },
  {
    "id": "chi-2",
    "name": "辛香匯",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.2045
    },
    "summary": "雪梨川菜十年不倒常勝軍，口味穩定且道道下飯。",
    "description": "雪梨川菜十年不倒常勝軍。麻婆豆腐、酸湯肥牛、乾鍋花菜、口水雞、魚香茄子… 啊實在太多了，總之每一道都好吃!",
    "priceRange": "$$",
    "recommendations": [
      "麻婆豆腐",
      "酸湯肥牛",
      "乾鍋花菜"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/NVvafCVsZGnd18Rs7",
    "photoUrl": "https://picsum.photos/seed/nchi2/800/600"
  },
  {
    "id": "chi-3",
    "name": "小湖南",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8785,
      "lng": 151.204
    },
    "summary": "正宗香辣湘菜，嗜辣者的天堂。",
    "description": "愛吃辣的請進，怎麼辣怎麼點就行。",
    "priceRange": "$$",
    "recommendations": [
      "辣味湘菜"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/bMaM3ijcUZwwbJuY6",
    "photoUrl": "https://picsum.photos/seed/nchi3/800/600"
  },
  {
    "id": "chi-4",
    "name": "桂林米粉",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.879,
      "lng": 151.203
    },
    "summary": "雪梨最強螺獅粉，豬腳口味更是一絕。",
    "description": "螺獅粉超級無敵好吃的! 大推豬腳口味，一定要加炸蛋，吸飽了湯汁又辣又香~",
    "priceRange": "$",
    "recommendations": [
      "螺獅粉",
      "豬腳口味",
      "炸蛋"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/qC7gGndz6cdsaEueA",
    "photoUrl": "https://picsum.photos/seed/nchi4/800/600"
  },
  {
    "id": "chi-5",
    "name": "杏園酒家",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8645,
      "lng": 151.2075
    },
    "summary": "商業區口碑極佳的港式飲茶。",
    "description": "港式飲茶，商業區算比較好吃的了，亞裔上班族中午聚餐好選擇。",
    "priceRange": "$$$",
    "recommendations": [
      "港式飲茶"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/91k1222vfuMQNcX39",
    "photoUrl": "https://picsum.photos/seed/nchi5/800/600"
  },
  {
    "id": "chi-6",
    "name": "皇庭海鮮舫",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8792,
      "lng": 151.2048
    },
    "summary": "唐人街飲茶新貴，鳳爪入味、舂風得意好吃。",
    "description": "唐人街比較新的港式飲茶。推薦鳳爪，醬很入味膠質感很夠。舂風得意這道菜上最快的一家。",
    "priceRange": "$$$",
    "recommendations": [
      "鳳爪",
      "舂風得意"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/LJ6sWkUgeVZnowNo9",
    "photoUrl": "https://picsum.photos/seed/nchi6/800/600"
  },
  {
    "id": "chi-7",
    "name": "八樂居",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8782,
      "lng": 151.2045
    },
    "summary": "雪梨老字號港式飲茶，牛雜是必點招牌。",
    "description": "雪梨老字號港式飲茶了，牛雜一絕!",
    "priceRange": "$$$",
    "recommendations": [
      "港式飲茶",
      "牛雜"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/RP3JnzrBvKcnB326",
    "photoUrl": "https://picsum.photos/seed/nchi7/800/600"
  },
  {
    "id": "chi-8",
    "name": "無Ta·川菜 Wuta Bistro",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8665,
      "lng": 151.2085
    },
    "summary": "市區最強川菜熱炒，份量十足適合多人聚餐。",
    "description": "市區川菜熱炒最強了吧，菜單覆蓋面超廣基本上想得到的川菜都點的到。推麻辣豆腐肥腸。",
    "priceRange": "$$",
    "recommendations": [
      "麻辣豆腐肥腸",
      "川菜熱炒"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/o3QxbmfVV9An3Y6NA",
    "photoUrl": "https://picsum.photos/seed/nchi8/800/600"
  },
  {
    "id": "chi-9",
    "name": "福記 FuJi",
    "categoryId": "chinese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8775,
      "lng": 151.2042
    },
    "summary": "復刻台灣味的豬腳飯與沙茶粿條，生醃螯蝦鮮美。",
    "description": "懷念台灣口味的可以來這家福記，豬腳飯口味跟台灣有87分像。沙茶牛肉粿條也很像。生醃螯蝦非常有味。",
    "priceRange": "$$",
    "recommendations": [
      "豬肉飯",
      "沙茶炒肉粿條",
      "牛肉湯"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/TmvYvrLRG3xvvBkL7",
    "photoUrl": "https://picsum.photos/seed/nchi9/800/600"
  },
  {
    "id": "tai-1",
    "name": "Sunflower (台灣食堂)",
    "categoryId": "taiwanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8785,
      "lng": 151.2032
    },
    "summary": "市區最愛的復刻鐵路便當。",
    "description": "Sunflower (台灣食堂) 的鐵路便當。市區最愛。",
    "priceRange": "$$",
    "recommendations": [
      "鐵路便當"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/ntai1/800/600"
  },
  {
    "id": "tai-2",
    "name": "一合鍋",
    "categoryId": "taiwanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.878,
      "lng": 151.204
    },
    "summary": "溫暖沙茶小火鍋，如三媽臭臭鍋般的回憶。",
    "description": "一合鍋的沙茶鍋，很像三媽臭臭鍋的感覺。",
    "priceRange": "$$",
    "recommendations": [
      "沙茶鍋"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/ntai2/800/600"
  },
  {
    "id": "tai-3",
    "name": "小零煎餅",
    "categoryId": "taiwanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.2038
    },
    "summary": "香濃順口的玉米起司蛋餅。",
    "description": "小零煎餅的玉米起司蛋餅。",
    "priceRange": "$",
    "recommendations": [
      "玉米起司蛋餅"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/ntai3/800/600"
  },
  {
    "id": "tai-4",
    "name": "禚家",
    "categoryId": "taiwanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.879,
      "lng": 151.205
    },
    "summary": "滷肉飯與麻辣鴨珍是靈魂，便當與滷味皆美味。",
    "description": "禚家的滷肉飯、滷味(尤其是麻辣鴨珍)、炒米粉跟便當隨便選菜都好吃。",
    "priceRange": "$$",
    "recommendations": [
      "滷肉飯",
      "麻辣鴨珍",
      "炒米粉"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/ntai4/800/600"
  },
  {
    "id": "tai-5",
    "name": "Chef n Wok",
    "categoryId": "taiwanese",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8788,
      "lng": 151.2042
    },
    "summary": "隨便點都不踩雷的經典台灣熱炒。",
    "description": "老闆夫妻一位是台灣人一位東南亞，所以菜系比較廣，但是隨便點都好吃，尤其是沙茶羊肉，真的很有鍋氣，秒回台灣的熱炒感! 滷肉則是入口即化，都很下飯。",
    "priceRange": "$$",
    "recommendations": [
      "滷蛋",
      "沙茶空心菜"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/ntai5/800/600"
  },
  {
    "id": "mal-1",
    "name": "Mamak",
    "categoryId": "malaysian",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8778,
      "lng": 151.2045
    },
    "summary": "Roti Canai皮酥香脆。",
    "description": "Roti真的很好吃! 皮很讚，注意尖峰時段人很多。其他主菜隨便點都好吃。",
    "priceRange": "$$",
    "recommendations": [
      "Roti Canai",
      "Satay Chicken"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/9Pnnjqnuux4f4mLi9",
    "photoUrl": "https://picsum.photos/seed/nmal1/800/600"
  },
  {
    "id": "mal-2",
    "name": "Ho Jiak (Haymarket)",
    "categoryId": "malaysian",
    "area": "CBD",
    "coordinates": {
      "lat": -33.879,
      "lng": 151.204
    },
    "summary": "唐人街精緻馬來熱炒，超讚辣味與質感喇沙。",
    "description": "唐人街的是熱炒類。喇沙很精緻，有附一片檸檬。辣菜很辣！！但味道真的很讚。",
    "priceRange": "$$",
    "recommendations": [
      "Laksa",
      "辣咖哩"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/fCt4nZ6sUUT9LvTM7",
    "photoUrl": "https://picsum.photos/seed/nmal2/800/600"
  },
  {
    "id": "mal-3",
    "name": "Malay Chinese Noodle Bar",
    "categoryId": "malaysian",
    "area": "CBD",
    "coordinates": {
      "lat": -33.864,
      "lng": 151.206
    },
    "summary": "上班族最愛的滑嫩雞肉喇沙，中午必排隊。",
    "description": "超級好吃的喇沙，上班族最愛! 雞肉選腿肉最嫩。中午超過十二點去一定大排長龍。",
    "priceRange": "$$",
    "recommendations": [
      "Laksa"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/yJCaFbHjvpqS56Gj8",
    "photoUrl": "https://picsum.photos/seed/nmal3/800/600"
  },
  {
    "id": "mal-4",
    "name": "David's Kitchen",
    "categoryId": "malaysian",
    "area": "CBD",
    "coordinates": {
      "lat": -33.868,
      "lng": 151.2052
    },
    "summary": "充滿油蔥酥香氣的香辣喇沙，還有豐富蔬菜。",
    "description": "喇沙是香辣口味辣度十足，配上超多的油蔥酥口感也很豐富。是少數有放蔬菜的喇沙。",
    "priceRange": "$$",
    "recommendations": [
      "香辣 Laksa"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/GPWohfBUuBRjw1AQ8",
    "photoUrl": "https://picsum.photos/seed/nmal4/800/600"
  },
  {
    "id": "fre-1",
    "name": "The Little Snail",
    "categoryId": "french",
    "area": "CBD",
    "coordinates": {
      "lat": -33.872,
      "lng": 151.199
    },
    "summary": "實惠的三合一法餐，靠窗眺望情人港夜景。",
    "description": "通常網路上都有Groupon可以買，three course menu是很划算的。座位選靠窗看Darling Harbour。推前菜招牌蝸牛跟鴉胸。",
    "priceRange": "$$$",
    "recommendations": [
      "蒜香蝸牛",
      "鴨肉"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/o3u1WUz7mGKwuzLU7",
    "photoUrl": "https://picsum.photos/seed/nfre1/800/600"
  },
  {
    "id": "fre-2",
    "name": "Hubert",
    "categoryId": "french",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8655,
      "lng": 151.2105
    },
    "summary": "地下室爵士樂浪漫氛圍，推薦鴨胸與鮮美魚類。",
    "description": "地下室的氛圍感適合情侶約會。麵包可以無限續的很好吃。大推blue eye cod魚很新鮮。",
    "priceRange": "$$$$",
    "recommendations": [
      "蝸牛",
      "麵包",
      "大腸",
      "Blue Eye Cod"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/63SJvxERCrtgSPZs6",
    "photoUrl": "https://picsum.photos/seed/nfre2/800/600"
  },
  {
    "id": "fre-3",
    "name": "Felix",
    "categoryId": "french",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8652,
      "lng": 151.2078
    },
    "summary": "交通便利的優雅法餐廳，必試特製生牛肉塔塔。",
    "description": "交通最方便的地方。生牛肉(tartare)好吃。布雷愛好者衝。",
    "priceRange": "$$$$",
    "recommendations": [
      "韃靼牛肉 Tartare",
      "Kingfish 刺身",
      "鵝肝"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/ogKAAhcYhNkMNNAH8",
    "photoUrl": "https://picsum.photos/seed/nfre3/800/600"
  },
  {
    "id": "ita-1",
    "name": "Bar Totti’s",
    "categoryId": "italian",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8635,
      "lng": 151.2085
    },
    "summary": "現烤澎鬆麵包配起司，Wynyard 站旁的聚餐首選。",
    "description": "就在Wynard火車站跟輕軌站旁很方便。最有名的是現烤的麵包。記得要提前訂位喔!",
    "priceRange": "$$$",
    "recommendations": [
      "現烤麵包",
      "Burrata cheese",
      "Kingfish"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/og2eRhGEokankZSj7",
    "photoUrl": "https://picsum.photos/seed/nita1/800/600"
  },
  {
    "id": "spa-1",
    "name": "Bar Topa",
    "categoryId": "spanish",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8645,
      "lng": 151.209
    },
    "summary": "基本不踩雷的 Tapas 店，極推鮮甜大蝦與蝦油。",
    "description": "Tapas店，空間很小所以建議早點到，基本怎麼點都不雷。最愛King Prawn，超大超鮮甜，蝦油很香。",
    "priceRange": "$$",
    "recommendations": [
      "King Prawn",
      "Tapas"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/MovzzUj6xAav4T729",
    "photoUrl": "https://picsum.photos/seed/nspa1/800/600"
  },
  {
    "id": "spa-2",
    "name": "Deux Frères",
    "categoryId": "spanish",
    "area": "CBD",
    "coordinates": {
      "lat": -33.864,
      "lng": 151.208
    },
    "summary": "氣氛滿點的西班牙小酒館。",
    "description": "Tapas店，氣氛很好，香腸上點火觀賞效果極佳也好吃。配酒好地方。",
    "priceRange": "$$",
    "recommendations": [
      "老酒蝸牛"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/3cbMbexsPh9BodNW7",
    "photoUrl": "https://picsum.photos/seed/nspa2/800/600"
  },
  {
    "id": "mid-1",
    "name": "Babylon",
    "categoryId": "middle_eastern",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8685,
      "lng": 151.2095
    },
    "summary": "Westfield樓頂的高級餐廳，爆汁烤雞必點。",
    "description": "適合慶生或特殊節日吃的類fine dining。中東人最擅長的烤雞必點，一咬下去直接爆汁不誇張。魚有Murray Cod也是經典。",
    "priceRange": "$$$$",
    "recommendations": [
      "烤肉花椰菜",
      "中東拼盤"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/fHVXcJjLTw5KMLT38",
    "photoUrl": "https://picsum.photos/seed/nmid1/800/600"
  },
  {
    "id": "mid-2",
    "name": "Mezepotamia",
    "categoryId": "middle_eastern",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.834,
      "lng": 151.213
    },
    "summary": "入口即化的極嫩羊肩，驚艷的開心果味調飲。",
    "description": "羊肩超級、超級嫩! 醬汁微酸，配上酸黃瓜很解膩。開心果冰淇淋的開心果味很濃。",
    "priceRange": "$$$",
    "recommendations": [
      "羊肩",
      "烤茄子配烤蝦",
      "開心果冰淇淋"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/S5ueiLgrKDcBRLS38",
    "photoUrl": "https://picsum.photos/seed/nmid2/800/600"
  },
  {
    "id": "des-1",
    "name": "Messina",
    "categoryId": "dessert",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.8852,
      "lng": 151.2125
    },
    "summary": "雪梨第一 Gelato 名店，口感層次豐富。",
    "description": "雪梨人的最愛，裡面都是有原料的所以吃起來層次感很豐富。招牌開心果吃幾次都不膩。",
    "priceRange": "$",
    "recommendations": [
      "Italian Nougat",
      "Honey Pockey",
      "開心果"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/EnKqMopBQjZ3c8cb7",
    "photoUrl": "https://picsum.photos/seed/ndes1/800/600"
  },
  {
    "id": "des-2",
    "name": "Anita",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8835,
      "lng": 151.2005
    },
    "summary": "必吃開心果與椰子荔枝口味，可同時選擇兩種。",
    "description": "開心果口味跟椰子荔枝口味好吃。小份也可以裝兩個口味喔!",
    "priceRange": "$$",
    "recommendations": [
      "蛋糕",
      "蛋黃酥"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/z2G6z7jmo7dFGrT88",
    "photoUrl": "https://picsum.photos/seed/ndes2/800/600"
  },
  {
    "id": "des-3",
    "name": "Ice Kirin Bar",
    "categoryId": "dessert",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.832,
      "lng": 151.21
    },
    "summary": "台灣人開的特色茶味冰淇淋店，大福激推。",
    "description": "台灣人開的茶味冰淇淋店，很好吃! 強烈推薦升級大福。",
    "priceRange": "$$",
    "recommendations": [
      "茶味冰淇淋"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/Tjbb4fqFD6NpmJjv7",
    "photoUrl": "https://picsum.photos/seed/ndes4/800/600"
  },
  {
    "id": "des-4",
    "name": "Blackstar",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.871,
      "lng": 151.2085
    },
    "summary": "全球知名的草莓西瓜蛋糕，清爽不甜膩。",
    "description": "草莓西瓜蛋糕，冰涼的西瓜配上草莓跟軟餅乾底，不會太甜膩，味道完美！",
    "priceRange": "$$",
    "recommendations": [
      "英式西洋蛋糕"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/fSMarFRRQmJXX547A",
    "photoUrl": "https://picsum.photos/seed/ndes5/800/600"
  },
  {
    "id": "des-5",
    "name": "Dulcet",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.2045
    },
    "summary": "精緻美味的蛋糕首選，女孩們生日的心頭好。",
    "description": "大部分口味都不錯，可以放心點，適合作為朋友的生日蛋糕。",
    "priceRange": "$$",
    "recommendations": [
      "季節蛋糕"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/ok9ztXVKK9kqpzAY7",
    "photoUrl": "https://picsum.photos/seed/ndes6/800/600"
  },
  {
    "id": "des-6",
    "name": "Top Impressions",
    "categoryId": "dessert",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.8825,
      "lng": 151.1925
    },
    "summary": "驚艷的抹茶爆漿可頌與醇香烘焙茶。",
    "description": "抹茶餡的爆漿可頌超好吃。hojicha不太膩。",
    "priceRange": "$$",
    "recommendations": [
      "抹茶爆漿可頌",
      "hojicha"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/gU8Uj8uMCQfSe25e8",
    "photoUrl": "https://picsum.photos/seed/ndes7/800/600"
  },
  {
    "id": "des-7",
    "name": "Flour and Stone",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8732,
      "lng": 151.2165
    },
    "summary": "想要最澳洲的體驗必吃 Panna Cotta Lamington。",
    "description": "Panna Cotta Lamington真的是一絕，想要很澳洲，必吃!但強烈推薦不要一個人吃，因為很甜。",
    "priceRange": "$$",
    "recommendations": [
      "Panna Cotta Lamington"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/8FU5hyTiQhpVLyWN8",
    "photoUrl": "https://picsum.photos/seed/ndes8/800/600"
  },
  {
    "id": "des-8",
    "name": "Banksia Bakehouse",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.864,
      "lng": 151.2115
    },
    "summary": "幸福感滿滿的烤布雷丹麥。",
    "description": "巴斯克蛋糕很好吃，但最有名的還是他們家的Danish。個人最愛烤布雷口味。",
    "priceRange": "$$",
    "recommendations": [
      "巴斯克蛋糕",
      "可頌 Danish"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/N7uZxR8qTqXyVS7m9",
    "photoUrl": "https://picsum.photos/seed/ndes9/800/600"
  },
  {
    "id": "des-9",
    "name": "KOI Dessert Bar",
    "categoryId": "dessert",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8838,
      "lng": 151.1998
    },
    "summary": "甜點王主理的光影美學美型蛋糕。",
    "description": "主廚有參加過兩屆澳洲版廚神當道第四名。奶酪跟蛋糕又美又好吃。",
    "priceRange": "$$$",
    "recommendations": [
      "奶酪",
      "蛋糕"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/kcQg3DjJ4MYhveJU9",
    "photoUrl": "https://picsum.photos/seed/ndes10/800/600"
  },
  {
    "id": "des-10",
    "name": "AP Bakery",
    "categoryId": "dessert",
    "area": "Suburbs",
    "coordinates": {
      "lat": -33.8842,
      "lng": 151.2118
    },
    "summary": "鹹甜層次分明的開心果塔與夏季芒果丹麥塔。",
    "description": "開心果鹹塔很有趣。夏季限定芒果椰子丹麥塔超好吃！三明治系列整體都不錯。",
    "priceRange": "$$",
    "recommendations": [
      "開心果鹹塔",
      "夏季限定芒果椰子丹麥塔",
      "三明治"
    ],
    "googleMapsLink": "https://www.apbakery.com.au/",
    "photoUrl": "https://picsum.photos/seed/ndes11/800/600"
  },
  {
    "id": "cof-1",
    "name": "Skittle Lane",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.865,
      "lng": 151.2055
    },
    "summary": "巷弄裡的簡約質感店，手沖與濾掛職人精神。",
    "description": "隱藏在小路上的簡約風格店，有手沖、濾掛等豐富選項。現在在Circular Quay也有分店了!",
    "priceRange": "$",
    "recommendations": [
      "手沖咖啡"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/Tx5NDqkvPcytiDZ77",
    "photoUrl": "https://picsum.photos/seed/ncof1/800/600"
  },
  {
    "id": "cof-2",
    "name": "Gumption",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8685,
      "lng": 151.2085
    },
    "summary": "獨特豆香氣味，藏身老建築裡的品味時刻。",
    "description": "他們家咖啡豆有獨特的香氣，店面在Strand Arcade裡，可以一邊感受老建築的魅力。",
    "priceRange": "$",
    "recommendations": [
      "咖啡豆"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/6ufUamWgm1Cu3F776",
    "photoUrl": "https://picsum.photos/seed/ncof2/800/600"
  },
  {
    "id": "cof-3",
    "name": "Two Penny Blue",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8633,
      "lng": 151.2058
    },
    "summary": "上班族早晨通勤路線的豐富早餐與優質咖啡。",
    "description": "咖啡口味多樣，買咖啡豆還送一杯現煮。早餐品項也豐富。是我早上通勤的必買路線。",
    "priceRange": "$",
    "recommendations": [
      "咖啡豆",
      "沙拉",
      "雞蛋卷",
      "法式吐司"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/PjF8bmJyhPC54xTv9",
    "photoUrl": "https://picsum.photos/seed/ncof3/800/600"
  },
  {
    "id": "cof-4",
    "name": "Dutch Smuggler",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8655,
      "lng": 151.2075
    },
    "summary": "穩定高品質的上班族愛店。",
    "description": "這家咖啡品質一直都不錯，除了傳統咖啡外也有冷萃。",
    "priceRange": "$",
    "recommendations": [
      "甜點"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/VMsD32cYT15oiFbb7",
    "photoUrl": "https://picsum.photos/seed/ncof4/800/600"
  },
  {
    "id": "cof-5",
    "name": "Stitch Coffee",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8652,
      "lng": 151.2105
    },
    "summary": "夏日救星柚子冷萃，酸甜苦韻完美平衡。",
    "description": "推薦招牌柚子冷粹(Yuzu Cold Brew)，酸甜與咖啡苦韻完美平衡，夏天的最愛。大白兔口味也好喝，上面是一層甜甜的奶蓋。",
    "priceRange": "$",
    "recommendations": [
      "拿鐵",
      "大白咖啡"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/DpixSoZ8NfCz81PaA",
    "photoUrl": "https://picsum.photos/seed/ncof5/800/600"
  },
  {
    "id": "cof-6",
    "name": "Cafe One",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8645,
      "lng": 151.21
    },
    "summary": "空間明亮的二樓秘境，只有上班族知道的工作聚會點。",
    "description": "隱藏在二樓，是只有上班族會去的店。空間超大、環境超好，適合職場Coffee Chat或聊工作。",
    "priceRange": "$",
    "recommendations": [
      "Coffee Chat"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/FDfsGpRBLKzDgPD47",
    "photoUrl": "https://picsum.photos/seed/ncof6/800/600"
  },
  {
    "id": "cof-7",
    "name": "Benzin Coffee x Cupra",
    "categoryId": "coffee",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8735,
      "lng": 151.211
    },
    "summary": "汽車展銷中心裡的真皮沙發隱藏咖啡館。",
    "description": "隱藏在汽車展銷中心裡的咖啡店。真皮沙發座位超舒適，沒人知道所以一定有位置。",
    "priceRange": "$",
    "recommendations": [
      "Coffee Chat"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/M93hoCi9hptGGXD46",
    "photoUrl": "https://picsum.photos/seed/ncof7/800/600"
  },
  {
    "id": "bar-1",
    "name": "The Baxter Inn",
    "categoryId": "bar",
    "area": "CBD",
    "coordinates": {
      "lat": -33.868,
      "lng": 151.205
    },
    "summary": "超隱密地下威士忌酒吧，蝴蝶脆餅無限上癮。",
    "description": "入口很隱蔽，但進去之後別有洞天。免費的蝴蝶脆餅(pretzels) 很讓人上癮。cider很好喝。",
    "priceRange": "$$$",
    "recommendations": [
      "Cider",
      "Pretzels"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/wgECg37vG7nJyofbA",
    "photoUrl": "https://picsum.photos/seed/nbar1/800/600"
  },
  {
    "id": "bar-2",
    "name": "Bar Luca",
    "categoryId": "bar",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8638,
      "lng": 151.2115
    },
    "summary": "絕讚漢堡搭配 Poutine，大口吃肉喝酒的好地方。",
    "description": "漢堡很好吃(重點誤)。吃素的朋友可以點Poutine。分量很大要慎重。",
    "priceRange": "$$",
    "recommendations": [
      "漢堡",
      "Poutine",
      "Loaded Fries"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/ZjDqCCGPrjG7FNBTA",
    "photoUrl": "https://picsum.photos/seed/nbar2/800/600"
  },
  {
    "id": "bar-3",
    "name": "O Bar and Dining",
    "categoryId": "bar",
    "area": "CBD",
    "coordinates": {
      "lat": -33.867,
      "lng": 151.207
    },
    "summary": "全雪梨唯一旋轉景觀吧，俯角夜景極致浪漫。",
    "description": "雪梨唯一360度旋轉酒吧，非常適合約會看夜景的地方! 記得選Lounge Bar樓層。",
    "priceRange": "$$$",
    "recommendations": [
      "高空美景"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/PAhX3hADqZu5hvaj8",
    "photoUrl": "https://picsum.photos/seed/nbar3/800/600"
  },
  {
    "id": "bar-4",
    "name": "Uncle Mings",
    "categoryId": "bar",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8672,
      "lng": 151.2062
    },
    "summary": "迷幻紅光中的西式中國風。",
    "description": "地下室，主打一個奇妙西式中國風。港點水餃不錯。聽說有酒精版的珍奶。",
    "priceRange": "$$$",
    "recommendations": [
      "雞尾酒",
      "水果",
      "生奶酒"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/XSxvGfz4wwZi7Nz96",
    "photoUrl": "https://picsum.photos/seed/nbar4/800/600"
  },
  {
    "id": "bar-5",
    "name": "Centrol 86",
    "categoryId": "bar",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8665,
      "lng": 151.2058
    },
    "summary": "復刻復古地窖氛圍，大推泰奶調酒與辣味爆米花。",
    "description": "在地下室，復古裝潢，專門做瑪格莉特調酒。泰奶椰子調酒超好喝。點酒送辣味爆米花。",
    "priceRange": "$$$",
    "recommendations": [
      "格子雞尾酒",
      "泰奶椰子雞尾酒",
      "辣味爆米花"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/bSf4zVpJSknXPaj7",
    "photoUrl": "https://picsum.photos/seed/nbar5/800/600"
  },
  {
    "id": "bbt-1",
    "name": "Top Tea",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8782,
      "lng": 151.2035
    },
    "summary": "使用澳洲本地水果的質感手搖飲。",
    "description": "菜單每季會跟著水果換，秋天的龍眼椰子冰，跟冬天的橘子冰都很好喝!",
    "priceRange": "$",
    "recommendations": [
      "當季水果茶",
      "龍珠椰子凍",
      "橘子凍"
    ],
    "googleMapsLink": "https://maps.app.goo.gl/mWNaUHxyfnDjQQA26",
    "photoUrl": "https://picsum.photos/seed/nbbt1/800/600"
  },
  {
    "id": "bbt-2",
    "name": "吃茶三千",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8795,
      "lng": 151.2035
    },
    "summary": "高品質茶飲",
    "description": "纖玉菓子跟珍珠配料好吃。",
    "priceRange": "$",
    "recommendations": [
      "纖玉菓子"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/nbbt2/800/600"
  },
  {
    "id": "bbt-3",
    "name": "Tea Shop Express",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8645,
      "lng": 151.2085
    },
    "summary": "隱藏在Town Hall火車站的超強手搖，價格親民、茶類品質穩定。",
    "description": "資深雪梨人必買的手搖飲店，茶類非常豐富可以選自己喜歡的",
    "priceRange": "$",
    "recommendations": [
      "茶類"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/nbbt3/800/600"
  },
  {
    "id": "bbt-4",
    "name": "Hey Tea 喜茶",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8798,
      "lng": 151.2038
    },
    "summary": "滿滿果肉的芒果西米椰子，喝一杯就飽。",
    "description": "滿滿果肉的芒果西米椰子，喝一杯就飽。",
    "priceRange": "$",
    "recommendations": [
      "茶藝椰子西米"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/nbbt4/800/600"
  },
  {
    "id": "bbt-5",
    "name": "Woo Tea 五桐號",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.8788,
      "lng": 151.2045
    },
    "summary": "嚼感派首推，特製的各種配料都超好吃，尤其是黑糖粉粿是必點。",
    "description": "嚼感派首推，特製的各種配料都超好吃，尤其是黑糖粉粿是必點。記得小料本來就都是甜的，所以點的時候半糖/少糖就好，例如紅茶拿鐵+黑糖粉粿、芭樂檸檬綠茶+白珍珠",
    "priceRange": "$",
    "recommendations": [
      "紅茶拿鐵+黑糖粉粿",
      "芭樂綠茶+白珍珠"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/nbbt5/800/600"
  },
  {
    "id": "bbt-6",
    "name": "King Tea 皇茶",
    "categoryId": "bubble_tea",
    "area": "CBD",
    "coordinates": {
      "lat": -33.879,
      "lng": 151.2048
    },
    "summary": "醇厚奶蓋愛好者必買，推薦桃香烏龍。",
    "description": "奶蓋濃郁，最愛桃香烏龍配奶蓋。",
    "priceRange": "$",
    "recommendations": [
      "桃香烏龍配奶蓋"
    ],
    "googleMapsLink": "",
    "photoUrl": "https://picsum.photos/seed/nbbt6/800/600"
  }
] as const
