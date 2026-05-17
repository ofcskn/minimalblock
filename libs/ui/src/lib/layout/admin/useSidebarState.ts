import { useCallback, useEffect, useState } from 'react';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useResponsiveLayout } from './useResponsiveLayout.js';

interface UseSidebarStateOptions {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function useSidebarState(options: UseSidebarStateOptions = {}) {
  const [isCollapsed, setCollapsed] = useControllableState<boolean>({
    value: options.collapsed,
    defaultValue: options.defaultCollapsed ?? false,
    onChange: options.onCollapsedChange,
  });
  const [isMobileOpen, setMobileOpen] = useState(false);
  const responsive = useResponsiveLayout();

  useEffect(() => {
    if (!responsive.isMobile && isMobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobileOpen, responsive.isMobile]);

  const toggleCollapsed = useCallback(
    () => setCollapsed((current) => !current),
    [setCollapsed],
  );
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(
    () => setMobileOpen((current) => !current),
    [],
  );

  return {
    ...responsive,
    isCollapsed,
    setCollapsed,
    toggleCollapsed,
    isMobileOpen,
    setMobileOpen,
    openMobile,
    closeMobile,
    toggleMobile,
  };
}
