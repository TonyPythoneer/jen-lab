// Plain, framework-free site config.
// Imported by app.config.ts (Nuxt runtime) AND by Storybook (no app.config there).
// Single source of truth so the @nuxt/ui theme never drifts between the two.
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

export const blogConfig = {
  title: "榛知部落格",
  brief: "深入淺出的中文澳洲知識庫",
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
    url: "https://jenliu.com.au/",
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
    url: "mailto:jen@jenliu.com.au",
    icon: "i-lucide-mail",
    hoverClass: "hover:text-blue-600",
  },
];
