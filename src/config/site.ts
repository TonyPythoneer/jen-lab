// Plain, framework-free site config — single source of truth so values never
// drift. Imported by app components (Footer), vite.config.ts (fonts), and the
// WordPress API util + sync script (WP_BASE).

// Canonical site identity — single source for the domain so it never drifts
// across the WP API base (utils/wpApi.ts) and the contact link + email below.
const SITE_DOMAIN = "jenliu.com.au";
export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;
export const SITE_EMAIL = `jen@${SITE_DOMAIN}`;
export const WP_BASE = `${SITE_ORIGIN}/wp-json/wp/v2`;

// Font config — single source for the Google Fonts <link> built into index.html
// (see injectFonts plugin in vite.config.ts). Add a family here, not in the HTML.
export const fonts = [
  { family: "Bebas Neue", weights: "wght@400" },
  { family: "Crimson Pro", weights: "ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700" },
  { family: "DM Sans", weights: "wght@400;500;700" },
  { family: "Inter", weights: "wght@400;500;700" },
  { family: "Noto Sans TC", weights: "wght@400;500;700;900" },
  { family: "Noto Serif TC", weights: "wght@400;500;600;700" },
];

export const googleFontsHref = `https://fonts.googleapis.com/css2?${fonts
  .map((f) => `family=${f.family.replace(/ /g, "+")}:${f.weights}`)
  .join("&")}&display=swap`;

export const contacts = [
  {
    label: "Threads",
    url: "https://www.threads.com/@jenknowsau",
    icon: "i-simple-icons-threads",
    hoverClass: "hover:text-gray-800",
  },
  {
    label: "Facebook",
    url: "https://www.facebook.com/jenliuau/",
    icon: "i-simple-icons-facebook",
    hoverClass: "hover:text-blue-600",
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/jenknowsau/",
    icon: "i-simple-icons-instagram",
    hoverClass: "hover:text-pink-500",
  },
  {
    label: "Wordpress",
    url: `${SITE_ORIGIN}/`,
    icon: "i-simple-icons-wordpress",
    hoverClass: "hover:text-blue-700",
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/jenliuau/",
    icon: "i-simple-icons-linkedin",
    hoverClass: "hover:text-blue-700",
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@jenliuau",
    icon: "i-simple-icons-youtube",
    hoverClass: "hover:text-red-600",
  },
  {
    label: "Email",
    url: `mailto:${SITE_EMAIL}`,
    icon: "i-lucide-mail",
    hoverClass: "hover:text-blue-600",
  },
];
