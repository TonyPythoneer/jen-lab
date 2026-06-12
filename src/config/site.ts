// Framework-free site identity — the single source for the domain so it never
// drifts. Imported by the WP API util (wpApi.ts) and the WP sync script.
const SITE_DOMAIN = "jenliu.com.au";
export const SITE_ORIGIN = `https://${SITE_DOMAIN}`;
export const WP_BASE = `${SITE_ORIGIN}/wp-json/wp/v2`;
