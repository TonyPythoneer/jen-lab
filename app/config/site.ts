// Plain, framework-free site config.
// Imported directly by the app's components (Footer, ContactLinks) AND by
// Storybook's theme config — single source of truth so the two never drift.

// Canonical site identity — single source for the domain so it never drifts
// across the WP API base (utils/wpApi.ts) and the contact link + email below.
const SITE_DOMAIN = "jenliu.com.au";
export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;
export const SITE_EMAIL = `jen@${SITE_DOMAIN}`;
export const WP_BASE = `${SITE_ORIGIN}/wp-json/wp/v2`;

export const uiConfig = {
  colors: {
    primary: "digital-orange",
    secondary: "cyber-violet",
    neutral: "abyssal-ink",
  },
  button: {
    compoundVariants: [
      // Caldera ghost: neutral outline -> full fill reverse on hover
      {
        color: "neutral",
        variant: "outline",
        class:
          "shadow-[inset_0_0_0_1.5px_var(--color-abyssal-ink)] ring-0 hover:bg-abyssal-ink hover:text-pure-white hover:shadow-none",
      },
    ],
  },
};

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
