// Shared open/close flag so the header icon and the global modal stay in sync.
export function useBlogSearch() {
  const open = useState("blog-search-open", () => false);
  return {
    open,
    openSearch: () => {
      open.value = true;
    },
    closeSearch: () => {
      open.value = false;
    },
  };
}
