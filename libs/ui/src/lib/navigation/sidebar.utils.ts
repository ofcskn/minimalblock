import type { SidebarActionNode, SidebarNode } from './sidebar.types.js';

export interface SidebarVisibleNode {
  item: SidebarActionNode;
  depth: number;
  parentId?: string;
}

export function isSidebarActionNode(item: SidebarNode): item is SidebarActionNode {
  return item.kind !== 'divider' && item.kind !== 'section';
}

export function hasSidebarChildren(item: SidebarActionNode) {
  return (item.children?.length ?? 0) > 0;
}

export function collectDefaultExpandedItemIds(items: SidebarNode[]) {
  const expandedItemIds = new Set<string>();

  const visit = (nodes: SidebarNode[]) => {
    for (const node of nodes) {
      if (!isSidebarActionNode(node)) {
        continue;
      }

      if (node.defaultExpanded && hasSidebarChildren(node)) {
        expandedItemIds.add(node.id);
      }

      if (node.children) {
        visit(node.children);
      }
    }
  };

  visit(items);

  return [...expandedItemIds];
}

export function findSidebarItem(items: SidebarNode[], itemId: string): SidebarActionNode | undefined {
  for (const item of items) {
    if (!isSidebarActionNode(item)) {
      continue;
    }

    if (item.id === itemId) {
      return item;
    }

    if (item.children) {
      const childItem = findSidebarItem(item.children, itemId);

      if (childItem) {
        return childItem;
      }
    }
  }

  return undefined;
}

export function findSidebarAncestorIds(
  items: SidebarNode[],
  matcher: (item: SidebarActionNode) => boolean,
) {
  const walk = (nodes: SidebarNode[], ancestors: string[]): string[] | undefined => {
    for (const node of nodes) {
      if (!isSidebarActionNode(node)) {
        continue;
      }

      if (matcher(node)) {
        return ancestors;
      }

      if (node.children) {
        const match = walk(node.children, [...ancestors, node.id]);

        if (match) {
          return match;
        }
      }
    }

    return undefined;
  };

  return walk(items, []) ?? [];
}

export function flattenVisibleSidebarNodes(
  items: SidebarNode[],
  expandedItemIds: Set<string>,
  collapsed: boolean,
) {
  const visibleItems: SidebarVisibleNode[] = [];

  const visit = (nodes: SidebarNode[], depth: number, parentId?: string) => {
    for (const node of nodes) {
      if (!isSidebarActionNode(node)) {
        continue;
      }

      visibleItems.push({ item: node, depth, parentId });

      if (collapsed) {
        continue;
      }

      if (hasSidebarChildren(node) && expandedItemIds.has(node.id)) {
        visit(node.children ?? [], depth + 1, node.id);
      }
    }
  };

  visit(items, 0);

  return visibleItems;
}

export function itemHasActiveDescendant(
  item: SidebarActionNode,
  activeItemId: string | undefined,
) {
  if (!activeItemId || !hasSidebarChildren(item)) {
    return false;
  }

  const walk = (nodes: SidebarNode[]): boolean => {
    for (const node of nodes) {
      if (!isSidebarActionNode(node)) {
        continue;
      }

      if (node.id === activeItemId || node.isActive) {
        return true;
      }

      if (node.children && walk(node.children)) {
        return true;
      }
    }

    return false;
  };

  return walk(item.children ?? []);
}
