import type { ReactNode } from 'react';
import type { ConversionStatusValue } from '@minimalblock/core';

export type IconName =
  | 'home'
  | 'box'
  | 'tag'
  | 'upload'
  | 'shopping-cart'
  | 'chart'
  | 'pie'
  | 'ticket'
  | 'bolt'
  | 'settings'
  | 'store'
  | 'bell'
  | 'search'
  | 'plus'
  | 'menu'
  | 'chevron-right'
  | 'chevron-down'
  | 'more'
  | 'globe'
  | 'currency'
  | 'logout'
  | 'user'
  | 'help';

export type SidebarNode =
  | SidebarLinkNode
  | SidebarGroupNode
  | SidebarDividerNode;

export interface SidebarLinkNode {
  kind: 'link';
  id: string;
  label: string;
  href: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
}

export interface SidebarGroupNode {
  kind: 'group';
  id: string;
  label: string;
  icon?: IconName;
  children: SidebarNode[];
  defaultOpen?: boolean;
  disabled?: boolean;
}

export interface SidebarDividerNode {
  kind: 'divider';
  id: string;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: SidebarNode[];
}

export interface Breadcrumb {
  id: string;
  label: string;
  href?: string;
}

export interface HeaderAction {
  id: string;
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'ghost';
  shortcut?: string;
  disabled?: boolean;
}

export interface HeaderSelectorOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

export interface HeaderSelector<T extends string = string> {
  id: 'store' | 'currency' | 'language' | (string & {});
  ariaLabel: string;
  value: T;
  options: HeaderSelectorOption<T>[];
  /** Priority decides which selectors stay visible vs. move to overflow. Higher = more important. */
  priority?: number;
  compactLabel?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  ts: string;
  read: boolean;
  href?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials?: string;
}

export interface ProfileMenuAction {
  id: string;
  label: string;
  icon?: IconName;
  destructive?: boolean;
}

export interface StoreContext {
  id: string;
  name: string;
  status: 'online' | 'syncing' | 'offline';
  productCount: number;
  planName?: string;
  localeLabel?: string;
}

export interface GalleryModel {
  id: string;
  productId: string;
  name: string;
  category?: string;
  status: ConversionStatusValue;
  previewUrl?: string;
  modelUrl?: string;
  hotspotCount: number;
  errorMessage?: string;
  qaScore?: number;
}

export interface EmptyStateAction {
  id: string;
  label: string;
  tone?: 'primary' | 'secondary' | 'ghost';
}

export interface RequirementItem {
  id: string;
  label: string;
  description?: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Metric {
  id: string;
  label: string;
  value: string;
  delta?: number;
  deltaDirection?: 'up' | 'down' | 'flat';
  helpText?: string;
}

export interface OrderSummary {
  id: string;
  placedAt: string;
  customer: string;
  total: number;
  currency: string;
  status: OrderStatus;
}

export type SearchScope = 'all' | 'products' | 'orders' | 'customers';

export interface DashboardShellCallbacks {
  onNavigate?: (node: SidebarLinkNode) => void;
  onSearch?: (query: string, scope: SearchScope) => void;
  onQuickAction?: (actionId: string) => void;
  onNotificationClick?: (notificationId: string) => void;
  onProfileAction?: (actionId: string) => void;
  onStoreChange?: (storeId: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onLanguageChange?: (language: string) => void;
  onSidebarCollapseChange?: (isCollapsed: boolean) => void;
}

export interface DashboardShellProps extends DashboardShellCallbacks {
  /** Navigation grouped by section. Sidebar renders sections in order. */
  navigation: SidebarSection[];
  /** Used to mark the active sidebar item. Receives the link href. */
  isActive?: (href: string) => boolean;

  brand: { name: string; tagline?: string };
  store: StoreContext;
  stores?: HeaderSelectorOption[];
  currency: HeaderSelector;
  language: HeaderSelector;

  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  primaryAction?: HeaderAction;
  overflowActions?: HeaderAction[];
  notifications: NotificationItem[];
  user: UserProfile;
  profileActions: ProfileMenuAction[];

  /** Controlled collapse state (optional). */
  collapsed?: boolean;
  defaultCollapsed?: boolean;

  children?: ReactNode;
}
