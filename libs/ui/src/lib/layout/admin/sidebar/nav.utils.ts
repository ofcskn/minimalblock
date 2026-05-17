import type { SidebarNode } from '../admin.types.js';

/** Returns true if `node` is an active link, or any descendant link is active. */
export function isBranchActive(
  node: SidebarNode,
  isActive: (href: string) => boolean,
): boolean {
  switch (node.kind) {
    case 'link':
      return isActive(node.href);
    case 'group':
      return node.children.some((child) => isBranchActive(child, isActive));
    case 'divider':
      return false;
  }
}
