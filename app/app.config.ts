export default defineAppConfig({
  pages: {
    home: {
      profile: {
        avatarLink: '/home/avatar.webp',
        name: '榛知',
        tabs: [
          {
            label: 'NextSteps Academy',
            bio: `陪你找到職涯的下一步
🇦🇺 澳洲求職培訓 | 資源 | 職場人脈
✍️ 澳洲企業商模分析系列，每週四於 Facebook, IG, Instragram 更新
📅 預約職涯諮詢 📒購買澳洲職場指南`,
          },
          {
            label: 'Jen Knows',
            bio: `Hi 我是Jen，一個15歲隻身來到澳洲求學，之後走過技術移民、求職、轉職道路，跌跌撞撞也沒放棄的女子

因為知道路途的艱辛，在職涯穩定後，開始分享澳洲知識、職場經驗，致力於幫助更多人在澳洲順利求職、快速融入澳洲生活。`,
          },
        ],
      },
      items: [
      {
        to: 'https://diamond-earth-bf6.notion.site/NextSteps-25200d494c4980609687da8989482715',
        icon: 'i-lucide-calendar',
        title: 'NextSteps 職涯諮詢預約',
        description: '一對一職涯規劃，找到在求職方向',
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
        to: 'https://jen-nextsteps.kit.com/60463af80d',
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
    { label: 'WordPress', url: 'https://jenliu.com.au/', icon: 'i-simple-icons-wordpress', hoverClass: 'hover:text-blue-500' },
    { label: 'Crossing', url: 'https://crossing.cw.com.tw/author/1204', icon: 'i-lucide-newspaper', hoverClass: 'hover:text-orange-500' },
    { label: 'Email', url: 'mailto:jen@jenliu.com.au', icon: 'i-lucide-mail', hoverClass: 'hover:text-blue-600' },
  ],
})
