import { useId, useState, type MouseEvent } from 'react';
import { Icon } from './icons.js';
import { isBranchActive } from './sidebar/nav.utils.js';
import { SidebarNestedItems } from './SidebarNestedItems.js';
import type { SidebarLinkNode, SidebarNode } from './admin.types.js';

interface SidebarItemProps {
  node: SidebarNode;
  depth: number;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: (link: SidebarLinkNode) => void;
}

export function SidebarItem({
  node,
  depth,
  collapsed,
  isActive,
  onNavigate,
}: SidebarItemProps) {
  if (node.kind === 'divider') {
    return (
      <li role="separator" aria-hidden="true" className="my-2">
        <div className="mx-3 h-px bg-slate-100" />
      </li>
    );
  }

  if (node.kind === 'link') {
    return (
      <SidebarLink
        node={node}
        depth={depth}
        collapsed={collapsed}
        active={isActive(node.href)}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <SidebarGroup
      node={node}
      depth={depth}
      collapsed={collapsed}
      isActive={isActive}
      onNavigate={onNavigate}
    />
  );
}

interface SidebarLinkProps {
  node: SidebarLinkNode;
  depth: number;
  collapsed: boolean;
  active: boolean;
  onNavigate?: (link: SidebarLinkNode) => void;
}

function SidebarLink({
  node,
  depth,
  collapsed,
  active,
  onNavigate,
}: SidebarLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      if (!node.disabled) onNavigate(node);
    }
  };

  // Top-level items get icons + bigger hit target; nested items are calmer.
  const isTopLevel = depth === 0;

  const baseClasses =
    'group relative flex w-full items-center gap-2.5 rounded-xl text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500';
  const sizeClasses = isTopLevel ? 'min-h-11 px-3' : 'min-h-9 pl-2.5 pr-3';
  const stateClasses = node.disabled
    ? 'cursor-not-allowed text-slate-400'
    : active
      ? 'bg-indigo-50 text-slate-900 ring-1 ring-inset ring-indigo-100'
      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

  return (
    <li>
      <a
        href={node.href}
        onClick={handleClick}
        aria-current={active ? 'page' : undefined}
        aria-disabled={node.disabled || undefined}
        title={collapsed ? node.label : undefined}
        className={[baseClasses, sizeClasses, stateClasses].join(' ')}
        style={
          !collapsed && !isTopLevel
            ? { paddingLeft: 8 + depth * 16 }
            : undefined
        }
      >
        {/* Active rail */}
        {active && (
          <span
            aria-hidden="true"
            className="absolute left-1 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-indigo-600"
          />
        )}
        {isTopLevel && node.icon && (
          <Icon
            name={node.icon}
            className={
              'h-[18px] w-[18px] shrink-0 ' +
              (active
                ? 'text-indigo-600'
                : 'text-slate-400 group-hover:text-slate-600')
            }
          />
        )}
        {!isTopLevel && (
          <span
            aria-hidden="true"
            className={
              'h-1 w-1 shrink-0 rounded-full ' +
              (active ? 'bg-indigo-600' : 'bg-slate-300')
            }
          />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{node.label}</span>
            {node.badge !== undefined && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                {node.badge}
              </span>
            )}
          </>
        )}
      </a>
    </li>
  );
}

interface SidebarGroupProps {
  node: Extract<SidebarNode, { kind: 'group' }>;
  depth: number;
  collapsed: boolean;
  isActive: (href: string) => boolean;
  onNavigate?: (link: SidebarLinkNode) => void;
}

function SidebarGroup({
  node,
  depth,
  collapsed,
  isActive,
  onNavigate,
}: SidebarGroupProps) {
  const hasActiveDescendant = isBranchActive(node, isActive);
  const [open, setOpen] = useState(node.defaultOpen ?? hasActiveDescendant);
  const id = useId();

  // In collapsed mode, render the group label as a header item and skip children.
  // (Children become reachable by expanding the sidebar; tooltip carries the label.)
  if (collapsed) {
    return (
      <li>
        <button
          type="button"
          aria-label={node.label}
          aria-expanded={false}
          title={node.label}
          disabled={node.disabled}
          className={
            'group flex min-h-11 w-full items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
            (hasActiveDescendant ? 'bg-indigo-50 text-indigo-600' : '')
          }
        >
          {node.icon && <Icon name={node.icon} className="h-[18px] w-[18px]" />}
        </button>
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-current={hasActiveDescendant ? 'location' : undefined}
        disabled={node.disabled}
        onClick={() => setOpen((v) => !v)}
        className={
          'group flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ' +
          (hasActiveDescendant
            ? 'bg-slate-50 text-slate-900'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900')
        }
      >
        {node.icon && (
          <Icon
            name={node.icon}
            className={
              'h-[18px] w-[18px] shrink-0 ' +
              (hasActiveDescendant
                ? 'text-indigo-600'
                : 'text-slate-400 group-hover:text-slate-600')
            }
          />
        )}
        <span className="flex-1 truncate text-left">{node.label}</span>
        <Icon
          name="chevron-down"
          className={
            'h-3.5 w-3.5 text-slate-400 transition-transform ' +
            (open ? '' : '-rotate-90')
          }
        />
      </button>
      {open && (
        <div id={id} className="mt-1 border-l border-slate-200/80 pl-2">
          <SidebarNestedItems
            items={node.children}
            depth={depth + 1}
            collapsed={false}
            isActive={isActive}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </li>
  );
}
