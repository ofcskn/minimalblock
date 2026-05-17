import { useDisclosure } from './useDisclosure.js';

export function useHeaderMenus() {
  const search = useDisclosure();
  const mobileMenu = useDisclosure();

  return {
    isSearchOpen: search.isOpen,
    openSearch: search.open,
    closeSearch: search.close,
    toggleSearch: search.toggle,
    isMobileMenuOpen: mobileMenu.isOpen,
    openMobileMenu: mobileMenu.open,
    closeMobileMenu: mobileMenu.close,
    toggleMobileMenu: mobileMenu.toggle,
  };
}
