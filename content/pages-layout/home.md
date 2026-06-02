---
# ===== Homepage Layout Manager =====
# How to use:
#   - Remove a section block -> that section will not appear on the homepage
#   - Reorder the blocks -> homepage order follows
#   - Edit the text under each block to change what the homepage says
#   WARNING: Do NOT change the English names after "component:"

# Search-engine + social-share text (readers do not see this on the page)
seo:
  title: 榛知 — 職涯 × 旅遊，從雪梨出發
  description: 榛知 Jen：澳洲職涯顧問 × 旅遊作家。兩個身份，一個在雪梨的真實故事。
  ogTitle: 榛知 — 職涯 × 旅遊，從雪梨出發
  ogDescription: 澳洲職涯顧問 × 旅遊作家。探索 Jen Knows 職場資源，或跟著 Jen Liu 走訪澳洲。

sections:
  # Hero banner (recommended: keep at top)
  - component: section-hero
    headline: Two Worlds
    headlineAccent: One Jen
    subheadingLines:
      - 從澳洲職場到雪梨巷弄
      - 一個人，兩個身份
      - 用中文記錄走過的每一步
    marqueeItems:
      - Sydney-based
      - 職涯 × 旅遊
      - NextSteps Academy
      - 澳洲旅遊作家
      - Walk Like A Local
      - 中英雙語創作
      - Open for reading
    portraitKnowsSrc: /home/jen-knows.png
    portraitLiuSrc: /home/jen-liu.png

  # Dual-identity intro cards
  - component: section-directions
    heading: Jen is Jen.
    headingAccent: Jen is always me.
    cards:
      - title: Jen Knows
        subtitle: 職涯 × 職場
        description: 陪你找到在澳洲的下一步——求職、職場文化、職涯諮詢，以中文深入講清楚。
        ctaLabel: 訪問 Jen Knows
        ctaTo: /jen-knows
        imageSrc: /home/jen-knows-hero.webp
        imageAlt: Jen Knows — 榛知職涯身份
        colorKey: violet
      - title: Jen Liu
        subtitle: 旅遊 × 美食
        description: 雪梨在地視角，帶你探索澳洲旅遊、美食與自助旅行的大小事。
        ctaLabel: 訪問 Jen Liu
        ctaTo: /jen-liu
        imageSrc: /home/jen-liu-hero.webp
        imageAlt: Jen Liu — 榛知旅遊身份
        colorKey: orange

  # 3D rotating blog carousel
  - component: section-blog
    postCount: 10
    spinDuration: 90
    heading: My Stories
    ctaLabel: 閱讀全文

  # Email newsletter signup
  - component: section-newsletter
    headline: 這是一份邀請
    accentLines:
      - 走進個人
      - 真實思考空間
    subheading: 也寫給同樣正在努力向前的你
    buttonLabel: 訂閱電子報
    subscriptionUrl: https://jen-nextsteps.kit.com/60463af80d

  # Support the author
  - component: section-support
---
