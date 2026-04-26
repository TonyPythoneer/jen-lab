export default defineAppConfig({
  pages: {
    home: {
      videos: [
        { id: 'J7AWXUoq9ck', title: 'Breaking Into the Australian Tech Industry: What No One Tells You' },
        { id: 'b2k3oprSEOI', title: '華人在澳洲職場如何升職加薪？實用職涯規劃經驗分享' },
        { id: 'qCT8OUpRO6k', title: '【榛知】澳洲第二大科技公司 Canva 總部開箱 | 超浮誇早午餐 | 調酒啤酒喝到飽 | 紀念品隨便拿... 拜託現在就收下我的履歷吧！' },
        { id: 'VEG9qwcEvco', title: '【榛知】澳洲最大科技公司 Atlassian 福利有多好?! 雪梨總部開箱+員工訪問' },
      ],
      profile: {
        avatarLink: '/home/avatar.webp',
        name: '榛知',
        tabs: [
          {
            label: 'NextSteps Academy',
            bio: `陪你找到職涯的下一步
🇦🇺 澳洲求職培訓 | 資源 | 職場人脈
✍️ 澳洲企業商模分析系列，每週四於 FB, IG, Threads 更新
📅 預約職涯諮詢
📒 購買澳洲職場指南`,
          },
          {
            label: 'Jen Knows',
            bio: `Hi 我是Jen，一個15歲隻身來到澳洲求學，之後走過技術移民、求職、轉職道路，跌跌撞撞也沒放棄的女子

因為知道路途的艱辛，在職涯穩定後，開始分享澳洲知識、職場經驗，致力於幫助更多人在澳洲順利求職、快速融入澳洲生活。`,
          },
        ],
      },
      product: {
        bannerImage: '/home/aus-workplace-guide.webp',
        title: '澳洲職場指南 2.0',
        brief: '從面試、入職到升職，系統性掌握澳洲職場文化',
        description: `* **基礎知識篇** - 稅務、Super、勞工權益等基本制度
* **求職篇** - 英文履歷、面試準備
* **入職篇** - 澳洲職場文化適應（請假、離職禮儀等）
* **職涯規劃篇** - 跟主管 1:1聊什麼、如何準備升遷與績效考核
* **留學生專區** - Grad Program 如何申請、面試官主要考核什麼？
* **科技業專區** - 科技業小眾職位、薪資組成、求職管道
* **模板專區** - 談薪對話範本、履歷範本

2.0版本新增職涯探索及技能證據庫模板，專為澳洲求職者打造的工具包，可直接套用在履歷、面試準備中
---
使用澳幣付款，請至以下連結 https://buy.stripe.com/4gM3cvbMO5Nx73026sbwk03`,
        purchaseUrl: 'https://portaly.cc/jenknowsau/product/MPD8CttocCqWRkBvNPp8',
        purchaseLabel: '真棒，我要這個！',
      },
      productTaiwanTravelProduct: {
        bannerImage: '/home/taiwan-travel-guide.webp',
        title: '海外遊子回台手冊',
        brief: '給「熟悉又陌生」的你，重新連上台灣的一份生活指南。',
        description: `📘這本手冊包含：
* 回台前需準備事項（恢復戶籍、申辦自然人憑證等）
* 美食景點依地區整理、實用伴手禮清單
* 雙重國籍注意事項
* 遠距工作辦公地點推薦
---
購買這份 Notion 手冊，你將獲得:
✓ 完整16章節中英雙語手冊
✓ 終身免費更新
✓ 可參與「共創章節」補充推薦地點
---
使用澳幣付款，請至以下連結
https://buy.stripe.com/aFa5kD3gidfZ8743awbwk00`,
        purchaseUrl: 'https://portaly.cc/jenknowsau/product/MPD8CttocCqWRkBvNPp8',
        purchaseLabel: '立刻下單',
      },
      items: [
        {
          to: 'https://diamond-earth-bf6.notion.site/NextSteps-25200d494c4980609687da8989482715',
          icon: 'i-lucide-calendar',
          title: 'NextSteps 職涯諮詢預約',
          description: '一對一職涯規劃，找到求職方向',
        },
        {
          to: 'https://app--next-steps-careers-9b4e7067.base44.app/landing',
          icon: 'i-lucide-sparkles',
          title: 'NextSteps 一站式職涯探索與管理工具',
          description: '解析職缺、找出技能缺口，獲得具體職涯建議',
        },
        {
          to: '/my-best-restaurants-search-in-sydney',
          icon: 'i-lucide-map-pin',
          title: '榛知雪梨美食地圖',
          description: '精選私藏雪梨餐廳，找到你的下一頓好飯',
        },
        {
          to: 'https://jenliu.com.au/',
          icon: 'i-simple-icons-wordpress',
          title: '榛知部落格',
          description: '深入淺出的中文澳洲知識庫',
        },
        {
          to: 'https://crossing.cw.com.tw/author/1204',
          icon: 'i-tdesign-copyright-filled',
          title: '榛知專欄',
          description: '澳洲觀點專欄，刊載於《Crossing》',
        },
        {
          to: 'https://portaly.cc/jenknowsau/support',
          icon: 'i-lucide-heart',
          title: '買杯奶茶，支持我繼續創造',
          description: '有你的支持，創作才能長長久久',
        },
      ],
    },
  },
  contacts: [
    { label: 'Threads', url: 'https://www.threads.com/@jenknowsau', icon: 'i-simple-icons-threads', hoverClass: 'hover:text-gray-800' },
    { label: 'Facebook', url: 'https://www.facebook.com/jenliuau/', icon: 'i-simple-icons-facebook', hoverClass: 'hover:text-blue-600' },
    { label: 'Instagram', url: 'https://www.instagram.com/jenknowsau/', icon: 'i-simple-icons-instagram', hoverClass: 'hover:text-pink-500' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/jenliuau/', icon: 'i-simple-icons-linkedin', hoverClass: 'hover:text-blue-700' },
    { label: 'YouTube', url: 'https://www.youtube.com/@jenliuau', icon: 'i-simple-icons-youtube', hoverClass: 'hover:text-red-600' },
    { label: 'Email', url: 'mailto:jen@jenliu.com.au', icon: 'i-lucide-mail', hoverClass: 'hover:text-blue-600' },
  ],
})
