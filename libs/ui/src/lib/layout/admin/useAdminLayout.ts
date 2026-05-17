import { useSidebarState } from './useSidebarState.js';

interface UseAdminLayoutOptions {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/**
 * Desktop collapse state and mobile drawer state are intentionally separate.
 * Why: collapsing the icon rail on desktop should never open the mobile drawer.
 */
export function useAdminLayout(options: UseAdminLayoutOptions = {}) {
  return useSidebarState({
    collapsed: options.collapsed,
    defaultCollapsed: options.defaultCollapsed,
    onCollapsedChange: options.onCollapsedChange,
  });
}
