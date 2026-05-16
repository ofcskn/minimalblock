import { useMemo } from 'react';
import { useControllableState } from '../hooks/useControllableState.js';
import type { SidebarProps } from './sidebar.types.js';
import {
  collectDefaultExpandedItemIds,
  findSidebarAncestorIds,
  flattenVisibleSidebarNodes,
} from './sidebar.utils.js';

type UseSidebarStateOptions = Pick<
  SidebarProps,
  | 'activeItemId'
  | 'collapsed'
  | 'defaultCollapsed'
  | 'defaultExpandedItemIds'
  | 'defaultMobileOpen'
  | 'expandedItemIds'
  | 'items'
  | 'mobileOpen'
  | 'onCollapsedChange'
  | 'onExpandedItemIdsChange'
  | 'onMobileOpenChange'
>;

export function useSidebarState({
  activeItemId,
  collapsed,
  defaultCollapsed = false,
  defaultExpandedItemIds,
  defaultMobileOpen = false,
  expandedItemIds,
  items,
  mobileOpen,
  onCollapsedChange,
  onExpandedItemIdsChange,
  onMobileOpenChange,
}: UseSidebarStateOptions) {
  const [isCollapsed, setIsCollapsed] = useControllableState({
    value: collapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange,
  });

  const [isMobileOpen, setIsMobileOpen] = useControllableState({
    value: mobileOpen,
    defaultValue: defaultMobileOpen,
    onChange: onMobileOpenChange,
  });

  const [expandedIds, setExpandedIds] = useControllableState({
    value: expandedItemIds,
    defaultValue:
      defaultExpandedItemIds ?? collectDefaultExpandedItemIds(items),
    onChange: onExpandedItemIdsChange,
  });

  const activeAncestorIds = useMemo(
    () =>
      findSidebarAncestorIds(items, item => item.id === activeItemId || !!item.isActive),
    [activeItemId, items],
  );

  const effectiveExpandedIds = useMemo(() => {
    const nextExpandedIds = new Set(expandedIds);

    for (const itemId of activeAncestorIds) {
      nextExpandedIds.add(itemId);
    }

    return nextExpandedIds;
  }, [activeAncestorIds, expandedIds]);

  const visibleItems = useMemo(
    () => flattenVisibleSidebarNodes(items, effectiveExpandedIds, isCollapsed),
    [effectiveExpandedIds, isCollapsed, items],
  );

  const toggleItem = (itemId: string) => {
    setExpandedIds(currentExpandedIds => {
      const expandedSet = new Set(currentExpandedIds);

      if (expandedSet.has(itemId)) {
        expandedSet.delete(itemId);
      } else {
        expandedSet.add(itemId);
      }

      return [...expandedSet];
    });
  };

  return {
    activeAncestorIds,
    expandedItemIds: effectiveExpandedIds,
    isCollapsed,
    isMobileOpen,
    setIsCollapsed,
    setIsMobileOpen,
    toggleItem,
    visibleItems,
  };
}
