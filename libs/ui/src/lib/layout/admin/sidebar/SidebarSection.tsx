import { SidebarItem } from '../SidebarItem.js';
import type {
  SidebarLinkNode,
  SidebarSection as SectionData,
} from '../admin.types.js';

interface SidebarSectionProps {
  section: SectionData;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: (link: SidebarLinkNode) => void;
}

export function SidebarSection({
  section,
  collapsed,
  isActive,
  onNavigate,
}: SidebarSectionProps) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <h3 className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {section.label}
        </h3>
      )}
      {collapsed && (
        <div className="mx-2 mb-1 mt-2 h-px bg-slate-100" aria-hidden="true" />
      )}
      <ul className="space-y-0.5" aria-label={section.label}>
        {section.items.map((item) => (
          <SidebarItem
            key={item.kind === 'divider' ? `div-${item.id}` : item.id}
            node={item}
            depth={0}
            collapsed={collapsed}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
