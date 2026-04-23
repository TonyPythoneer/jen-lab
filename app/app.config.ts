export default defineAppConfig({
  pages: {
    home: {
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
