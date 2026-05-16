import type React from 'react';

export type HeaderTheme = 'light' | 'dark';
export type HeaderVisibility = 'all' | 'desktop' | 'tablet' | 'mobile';

export interface HeaderItemBase {
  id: string;
  type?: 'action' | 'icon' | 'selector' | 'profile-action' | 'notification';
  label: string;
  icon?: React.ReactNode;
  action?: string;
  route?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  badge?: React.ReactNode;
  tooltip?: string;
  children?: HeaderActionItem[];
  visibility?: HeaderVisibility;
}

export interface HeaderActionItem extends HeaderItemBase {
  type?: 'action' | 'icon' | 'profile-action';
  description?: string;
}

export interface HeaderBreadcrumb {
  id: string;
  label: string;
  route?: string;
}

export interface HeaderNotification extends HeaderItemBase {
  type?: 'notification';
  title: string;
  description?: string;
  timeLabel?: string;
  tone?: 'order' | 'warning' | 'danger' | 'info' | 'success';
  isRead?: boolean;
}

export interface HeaderSearchScope {
  id: string;
  label: string;
}

export interface HeaderSearchResult {
  id: string;
  label: string;
  description?: string;
  scopeId?: string;
  route?: string;
}

export interface HeaderSearchConfig {
  placeholder?: string;
  query?: string;
  defaultQuery?: string;
  scope?: string;
  defaultScope?: string;
  scopes?: HeaderSearchScope[];
  results?: HeaderSearchResult[];
  isLoading?: boolean;
  isDisabled?: boolean;
}

export interface HeaderProfileMenu {
  name: string;
  email?: string;
  avatar?: React.ReactNode;
  actions: HeaderActionItem[];
}

export interface HeaderSelectorOption {
  id: string;
  label: string;
  description?: string;
}

export interface HeaderSelectorConfig {
  id: string;
  label: string;
  options: HeaderSelectorOption[];
  value?: string;
  defaultValue?: string;
  isDisabled?: boolean;
}

export interface HeaderBrandConfig {
  title: string;
  subtitle?: string;
  logo?: React.ReactNode;
}

export interface HeaderProps {
  brand: HeaderBrandConfig;
  title: string;
  breadcrumbs?: HeaderBreadcrumb[];
  quickActions?: HeaderActionItem[];
  notifications?: HeaderNotification[];
  profile?: HeaderProfileMenu;
  selectors?: HeaderSelectorConfig[];
  search?: HeaderSearchConfig;
  className?: string;
  sticky?: boolean;
  fixed?: boolean;
  theme?: HeaderTheme;
  loading?: boolean;
  disabled?: boolean;
  mobileMenuOpen?: boolean;
  defaultMobileMenuOpen?: boolean;
  onMobileMenuOpenChange?: (open: boolean) => void;
  onSidebarToggle?: () => void;
  onSearch?: (query: string, scope: string) => void;
  onSearchSelect?: (result: HeaderSearchResult) => void;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onNotificationMarkRead?: (notificationId: string) => void;
  onProfileAction?: (actionId: string) => void;
  onQuickAction?: (actionId: string) => void;
  onStoreChange?: (storeId: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onLanguageChange?: (language: string) => void;
  onSelectorChange?: (selectorId: string, value: string) => void;
}
