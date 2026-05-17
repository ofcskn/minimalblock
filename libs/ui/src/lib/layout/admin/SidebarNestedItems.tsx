import { SidebarItem } from './SidebarItem.js';
import type { SidebarLinkNode, SidebarNode } from './admin.types.js';

interface SidebarNestedItemsProps {
  items: SidebarNode[];
  depth: number;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: (link: SidebarLinkNode) => void;
}

export function SidebarNestedItems({
  items,
  depth,
  collapsed,
  isActive,
  onNavigate,
}: SidebarNestedItemsProps) {
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((child) => (
        <SidebarItem
          key={child.kind === 'divider' ? `div-${child.id}` : child.id}
          node={child}
          depth={depth}
          collapsed={collapsed}
          isActive={isActive}
          onNavigate={onNavigate}
        />
      ))}
    </ul>
  );
}
