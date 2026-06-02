// Chainable stub for @nuxt/content's queryCollection. Returns empty data
// so content-driven components render their empty/loading branch safely.
export const queryCollection = () => {
  const chain = {
    where: () => chain,
    order: () => chain,
    limit: () => chain,
    path: () => chain,
    select: () => chain,
    all: async () => [] as unknown[],
    first: async () => null,
  };
  return chain;
};
