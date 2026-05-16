import React, { useId, useRef } from 'react';
import { cn } from '../utils/cn.js';
import type { SidebarActionNode, SidebarNode, SidebarProps, SidebarSectionNode } from './sidebar.types.js';
import {
  findSidebarItem,
  hasSidebarChildren,
  itemHasActiveDescendant,
  isSidebarActionNode,
} from './sidebar.utils.js';
import { useSidebarState } from './useSidebarState.js';

function PanelToggleIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

interface SidebarTreeProps {
  activeItemId?: string;
  collapsed: boolean;
  depth: number;
  expandedItemIds: Set<string>;
  items: SidebarNode[];
  itemButtonIds: Record<string, string>;
  itemRefs: React.MutableRefObject<Map<string, HTMLButtonElement | null>>;
  onItemKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, item: SidebarActionNode) => void;
  onItemSelect?: (item: SidebarActionNode) => void;
  onToggleNestedItem?: (itemId: string) => void;
  selectOrToggleItem: (item: SidebarActionNode) => void;
  toggleItem: (item: SidebarActionNode) => void;
}

function SidebarTree({
  activeItemId,
  collapsed,
  depth,
  expandedItemIds,
  items,
  itemButtonIds,
  itemRefs,
  onItemKeyDown,
  onItemSelect,
  onToggleNestedItem,
  selectOrToggleItem,
  toggleItem,
}: SidebarTreeProps) {
  return (
    <ul className={cn('space-y-1', depth > 0 && 'mt-1 border-l border-slate-200/80 pl-3')}>
      {items.map(item => {
        if (!isSidebarActionNode(item)) {
          if (item.kind === 'divider') {
            return <li key={item.id} className="my-3 border-t border-slate-200/80" aria-hidden="true" />;
          }

          return (
            <SidebarSection
              key={item.id}
              item={item}
              collapsed={collapsed}
              depth={depth}
            />
          );
        }

        const hasChildren = hasSidebarChildren(item);
        const isExpanded = expandedItemIds.has(item.id);
        const hasActiveDescendant = itemHasActiveDescendant(item, activeItemId);
        const isActive = item.id === activeItemId || !!item.isActive;
        const rowTitle = collapsed && depth === 0 ? item.tooltip ?? item.label : item.tooltip;
        const labelId = itemButtonIds[item.id];
        const paddingLeft = collapsed ? undefined : `${0.75 + depth * 0.875}rem`;
        const shouldRenderChildren = !collapsed && hasChildren && isExpanded;

        return (
          <li key={item.id} className={cn('relative', item.className)}>
            <div
              className={cn(
                'group flex items-center gap-2 rounded-2xl px-2 py-1.5 transition-all',
                isActive && 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20',
                !isActive && hasActiveDescendant && 'bg-indigo-50 text-indigo-700',
                !isActive && !hasActiveDescendant && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                item.isDisabled && 'cursor-not-allowed opacity-50',
              )}
            >
              <button
                ref={element => {
                  itemRefs.current.set(item.id, element);
                }}
                type="button"
                id={labelId}
                title={rowTitle}
                disabled={item.isDisabled}
                aria-current={isActive ? 'page' : undefined}
                aria-expanded={hasChildren ? isExpanded && !collapsed : undefined}
                aria-disabled={item.isDisabled || undefined}
                className={cn(
                  'flex min-h-11 flex-1 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium outline-none transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                  collapsed && depth === 0 ? 'justify-center px-2' : 'justify-start',
                )}
                style={{ paddingLeft }}
                onClick={() => selectOrToggleItem(item)}
                onKeyDown={event => onItemKeyDown(event, item)}
              >
                {item.icon && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      isActive
                        ? 'bg-white/14 text-white'
                        : hasActiveDescendant
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white',
                    )}
                  >
                    {item.icon}
                  </span>
                )}

                {!collapsed || depth > 0 ? (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          'inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          isActive
                            ? 'bg-white/16 text-white'
                            : 'bg-slate-100 text-slate-500',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="sr-only">{item.label}</span>
                )}
              </button>

              {hasChildren && (
                <button
                  type="button"
                  title={isExpanded ? 'Collapse section' : 'Expand section'}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${item.label}`}
                  aria-expanded={isExpanded && !collapsed}
                  aria-controls={item.children ? `${item.id}-children` : undefined}
                  disabled={item.isDisabled}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-current outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
                    collapsed && depth === 0 && 'hidden',
                  )}
                  onClick={() => toggleItem(item)}
                >
                  <ChevronIcon expanded={isExpanded} />
                </button>
              )}
            </div>

            {shouldRenderChildren && (
              <div id={`${item.id}-children`} className="overflow-hidden pt-1">
                <SidebarTree
                  activeItemId={activeItemId}
                  collapsed={collapsed}
                  depth={depth + 1}
                  expandedItemIds={expandedItemIds}
                  items={item.children ?? []}
                  itemButtonIds={itemButtonIds}
                  itemRefs={itemRefs}
                  onItemKeyDown={onItemKeyDown}
                  onItemSelect={onItemSelect}
                  onToggleNestedItem={onToggleNestedItem}
                  selectOrToggleItem={selectOrToggleItem}
                  toggleItem={toggleItem}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function SidebarSection({
  collapsed,
  depth,
  item,
}: {
  collapsed: boolean;
  depth: number;
  item: SidebarSectionNode;
}) {
  if (collapsed && depth === 0) {
    return <li className="my-3 border-t border-slate-200/80" aria-hidden="true" />;
  }

  return (
    <li className="px-3 pt-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {item.label}
      </span>
    </li>
  );
}

export function Sidebar({
  activeItemId,
  ariaLabel = 'Sidebar navigation',
  className,
  collapseLabel = 'Collapse sidebar',
  defaultCollapsed = false,
  defaultExpandedItemIds,
  defaultMobileOpen = false,
  expandedItemIds,
  expandLabel = 'Expand sidebar',
  footer,
  header,
  items,
  mobileOpen,
  onCollapsedChange,
  onExpandedItemIdsChange,
  onItemSelect,
  onMobileOpenChange,
  onToggleCollapse,
  onToggleNestedItem,
  collapsed,
  showMobileTrigger = false,
}: SidebarProps) {
  const {
    isCollapsed,
    isMobileOpen,
    expandedItemIds: effectiveExpandedItemIds,
    setIsCollapsed,
    setIsMobileOpen,
    toggleItem: toggleItemById,
    visibleItems,
  } = useSidebarState({
    activeItemId,
    collapsed,
    defaultCollapsed,
    defaultExpandedItemIds,
    defaultMobileOpen,
    expandedItemIds,
    items,
    mobileOpen,
    onCollapsedChange,
    onExpandedItemIdsChange,
    onMobileOpenChange,
  });

  const itemRefs = useRef(new Map<string, HTMLButtonElement | null>());
  const reactId = useId();
  const itemButtonIds = items.reduce<Record<string, string>>((accumulator, item) => {
    const visit = (node: SidebarNode) => {
      if (!isSidebarActionNode(node)) {
        return;
      }

      accumulator[node.id] = `${reactId}-${node.id}`;
      node.children?.forEach(visit);
    };

    visit(item);

    return accumulator;
  }, {});

  const focusItem = (itemId: string | undefined) => {
    if (!itemId) {
      return;
    }

    itemRefs.current.get(itemId)?.focus();
  };

  const toggleItem = (item: SidebarActionNode) => {
    if (item.isDisabled || !hasSidebarChildren(item)) {
      return;
    }

    if (isCollapsed) {
      setIsCollapsed(false);
      onToggleCollapse?.();
    }

    toggleItemById(item.id);
    onToggleNestedItem?.(item.id);
  };

  const selectOrToggleItem = (item: SidebarActionNode) => {
    if (item.isDisabled) {
      return;
    }

    if (hasSidebarChildren(item) && !item.route && !item.action) {
      toggleItem(item);
      return;
    }

    onItemSelect?.(item);
    setIsMobileOpen(false);
  };

  const onItemKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    item: SidebarActionNode,
  ) => {
    const visibleIndex = visibleItems.findIndex(visibleItem => visibleItem.item.id === item.id);

    if (visibleIndex === -1) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        focusItem(visibleItems[visibleIndex + 1]?.item.id);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        focusItem(visibleItems[visibleIndex - 1]?.item.id);
        break;
      }
      case 'ArrowRight': {
        if (hasSidebarChildren(item) && !effectiveExpandedItemIds.has(item.id)) {
          event.preventDefault();
          toggleItem(item);
          break;
        }

        if (!isCollapsed) {
          event.preventDefault();
          focusItem(visibleItems[visibleIndex + 1]?.item.id);
        }
        break;
      }
      case 'ArrowLeft': {
        if (hasSidebarChildren(item) && effectiveExpandedItemIds.has(item.id) && !isCollapsed) {
          event.preventDefault();
          toggleItem(item);
          break;
        }

        const parentItem = visibleItems[visibleIndex].parentId
          ? findSidebarItem(items, visibleItems[visibleIndex].parentId)
          : undefined;

        if (parentItem) {
          event.preventDefault();
          focusItem(parentItem.id);
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        focusItem(visibleItems[0]?.item.id);
        break;
      }
      case 'End': {
        event.preventDefault();
        focusItem(visibleItems[visibleItems.length - 1]?.item.id);
        break;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        selectOrToggleItem(item);
        break;
      }
      default:
        break;
    }
  };

  const renderPanel = (mobile = false) => (
    <nav
      aria-label={ariaLabel}
      className={cn(
        'flex h-full flex-col border-r border-slate-200 bg-white/95 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur',
        mobile ? 'w-[min(20rem,88vw)] rounded-r-3xl' : isCollapsed ? 'w-20' : 'w-80',
        className,
      )}
    >
      <div className={cn('flex items-center justify-between border-b border-slate-200 px-4 py-4', isCollapsed && !mobile && 'justify-center px-3')}>
        {!isCollapsed || mobile ? (
          <div className="min-w-0 flex-1">{header}</div>
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">MB</span>
        )}

        {!mobile && (
          <button
            type="button"
            aria-label={isCollapsed ? expandLabel : collapseLabel}
            title={isCollapsed ? expandLabel : collapseLabel}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:flex"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              onToggleCollapse?.();
            }}
          >
            <PanelToggleIcon collapsed={isCollapsed} />
          </button>
        )}

        {mobile && (
          <button
            type="button"
            aria-label="Close navigation"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarTree
          activeItemId={activeItemId}
          collapsed={mobile ? false : isCollapsed}
          depth={0}
          expandedItemIds={effectiveExpandedItemIds}
          items={items}
          itemButtonIds={itemButtonIds}
          itemRefs={itemRefs}
          onItemKeyDown={onItemKeyDown}
          onItemSelect={onItemSelect}
          onToggleNestedItem={onToggleNestedItem}
          selectOrToggleItem={selectOrToggleItem}
          toggleItem={toggleItem}
        />
      </div>

      <div className="border-t border-slate-200 px-3 py-3">
        {footer}

        {!mobile && isCollapsed && footer === undefined && (
          <p className="px-2 text-center text-[11px] font-medium text-slate-400">
            Toggle to view labels
          </p>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {showMobileTrigger && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
            onClick={() => setIsMobileOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      )}

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative z-10 h-full">{renderPanel(true)}</div>
        </div>
      )}

      <div className="hidden h-full shrink-0 lg:flex">{renderPanel(false)}</div>
    </>
  );
}
