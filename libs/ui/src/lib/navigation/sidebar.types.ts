import type React from 'react';

export type SidebarNodeKind = 'item' | 'action' | 'section' | 'divider';

export interface SidebarNodeBase {
  id: string;
  kind?: SidebarNodeKind;
  isDisabled?: boolean;
  tooltip?: string;
  className?: string;
}

export interface SidebarActionNode extends SidebarNodeBase {
  kind?: 'item' | 'action';
  label: string;
  icon?: React.ReactNode;
  route?: string;
  action?: string;
  isActive?: boolean;
  badge?: React.ReactNode;
  children?: SidebarNode[];
  defaultExpanded?: boolean;
}

export interface SidebarSectionNode extends SidebarNodeBase {
  kind: 'section';
  label: string;
}

export interface SidebarDividerNode extends SidebarNodeBase {
  kind: 'divider';
}

export type SidebarNode = SidebarActionNode | SidebarSectionNode | SidebarDividerNode;

export interface SidebarRenderContext {
  collapsed: boolean;
  depth: number;
  hasActiveDescendant: boolean;
  isExpanded: boolean;
}

export interface SidebarProps {
  items: SidebarNode[];
  ariaLabel?: string;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  expandedItemIds?: string[];
  defaultExpandedItemIds?: string[];
  onExpandedItemIdsChange?: (itemIds: string[]) => void;
  mobileOpen?: boolean;
  defaultMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  activeItemId?: string;
  collapseLabel?: string;
  expandLabel?: string;
  showMobileTrigger?: boolean;
  onItemSelect?: (item: SidebarActionNode) => void;
  onToggleCollapse?: () => void;
  onToggleNestedItem?: (itemId: string) => void;
}
