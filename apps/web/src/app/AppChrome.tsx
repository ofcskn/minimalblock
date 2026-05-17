import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardShell,
  type AdminBreadcrumb,
  type AdminHeaderAction,
  type AdminHeaderSelector,
  type AdminHeaderSelectorOption,
  type AdminSearchScope,
  type AdminSidebarLinkNode,
  type AdminSidebarSectionData,
  type NotificationItem,
  type ProfileMenuAction,
  type StoreContext,
  type UserProfile,
} from '@minimalblock/ui';

interface AppChromeProps {
  children: ReactNode;
  onSignOut: () => void;
}

const NAVIGATION: AdminSidebarSectionData[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        kind: 'group',
        id: 'catalog',
        label: 'Catalog',
        icon: 'box',
        defaultOpen: true,
        children: [
          { kind: 'link', id: 'gallery', label: 'Gallery', href: '/' },
          {
            kind: 'link',
            id: 'upload-assets',
            label: 'Upload assets',
            href: '/upload',
          },
        ],
      },
    ],
  },
];

const STORE_OPTIONS: AdminHeaderSelectorOption[] = [
  { value: 'minimal-main', label: 'Minimal Block US' },
  { value: 'minimal-eu', label: 'Minimal Block EU' },
  { value: 'minimal-wholesale', label: 'Wholesale showroom' },
];

const CURRENCY_OPTIONS: AdminHeaderSelectorOption[] = [
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const LANGUAGE_OPTIONS: AdminHeaderSelectorOption[] = [
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Turkish' },
  { value: 'de', label: 'German' },
];

const PRIMARY_ACTION: AdminHeaderAction = {
  id: 'add-product',
  label: 'Add product',
  icon: 'plus',
  variant: 'primary',
};

const OVERFLOW_ACTIONS: AdminHeaderAction[] = [
  {
    id: 'create-coupon',
    label: 'Create coupon',
    icon: 'ticket',
    variant: 'secondary',
  },
  { id: 'preview-store', label: 'Preview store', icon: 'store' },
  { id: 'help-docs', label: 'Help & docs', icon: 'help', shortcut: '?' },
];

const PROFILE_ACTIONS: ProfileMenuAction[] = [
  { id: 'profile', label: 'View profile', icon: 'user' },
  { id: 'account-settings', label: 'Account settings', icon: 'settings' },
  { id: 'help', label: 'Help & docs', icon: 'help' },
  { id: 'sign-out', label: 'Sign out', icon: 'logout', destructive: true },
];

const USER_PROFILE: UserProfile = {
  id: 'user-avery',
  name: 'Avery Chen',
  email: 'avery@minimalblock.com',
  role: 'Commerce administrator',
};

function getStoreContext(storeId: string): StoreContext {
  switch (storeId) {
    case 'minimal-eu':
      return {
        id: 'minimal-eu',
        name: 'Minimal Block EU',
        status: 'syncing',
        productCount: 118,
        planName: 'Growth plan',
        localeLabel: 'EUR · English',
      };
    case 'minimal-wholesale':
      return {
        id: 'minimal-wholesale',
        name: 'Wholesale showroom',
        status: 'offline',
        productCount: 42,
        planName: 'B2B pilot',
        localeLabel: 'USD · English',
      };
    default:
      return {
        id: 'minimal-main',
        name: 'Minimal Block US',
        status: 'online',
        productCount: 284,
        planName: 'Scale plan',
        localeLabel: 'USD · English',
      };
  }
}

function pageMetaForPathname(pathname: string): {
  pageTitle: string;
  breadcrumbs: AdminBreadcrumb[];
} {
  if (pathname.startsWith('/upload')) {
    return {
      pageTitle: 'Upload assets',
      breadcrumbs: [
        { id: 'catalog', label: 'Catalog', href: '/' },
        { id: 'upload', label: 'Upload assets' },
      ],
    };
  }

  if (pathname.startsWith('/dashboard')) {
    return {
      pageTitle: 'Analytics',
      breadcrumbs: [
        { id: 'reporting', label: 'Reporting' },
        { id: 'insights', label: 'Analytics' },
      ],
    };
  }

  if (pathname.startsWith('/orders')) {
    return {
      pageTitle: 'Orders',
      breadcrumbs: [
        { id: 'reporting', label: 'Reporting' },
        { id: 'orders', label: 'Orders' },
      ],
    };
  }

  if (pathname.startsWith('/product/')) {
    return {
      pageTitle: 'Product detail',
      breadcrumbs: [
        { id: 'catalog', label: 'Catalog', href: '/' },
        { id: 'gallery', label: 'Gallery', href: '/' },
        { id: 'detail', label: 'Product detail' },
      ],
    };
  }

  return {
    pageTitle: 'Gallery',
    breadcrumbs: [
      { id: 'catalog', label: 'Catalog', href: '/' },
      { id: 'gallery', label: 'Gallery' },
    ],
  };
}

function isCurrentPath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppChrome({ children, onSignOut }: AppChromeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [storeId, setStoreId] = useState('minimal-main');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'order-review',
      title: 'Order #1048 is ready for review',
      body: 'The customer added a custom engraving request before fulfillment.',
      ts: '5m ago',
      read: false,
    },
    {
      id: 'gallery-warning',
      title: 'Two photo uploads need better resolution',
      body: 'Images under 1800px may produce weak 3D geometry.',
      ts: '28m ago',
      read: false,
    },
    {
      id: 'sync-complete',
      title: 'Catalog sync completed',
      body: '284 products are now aligned across storefront and admin inventory.',
      ts: 'Yesterday',
      read: true,
    },
  ]);

  const store = useMemo(() => getStoreContext(storeId), [storeId]);
  const pageMeta = useMemo(
    () => pageMetaForPathname(location.pathname),
    [location.pathname],
  );

  const currencySelector: AdminHeaderSelector = {
    id: 'currency',
    ariaLabel: 'Display currency',
    value: currency,
    compactLabel: '$',
    options: CURRENCY_OPTIONS,
  };

  const languageSelector: AdminHeaderSelector = {
    id: 'language',
    ariaLabel: 'Interface language',
    value: language,
    options: LANGUAGE_OPTIONS,
  };

  const handleNavigate = (node: AdminSidebarLinkNode) => {
    navigate(node.href);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'add-product':
        navigate('/upload');
        break;
      case 'create-coupon':
        navigate('/dashboard');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleSearch = (query: string, scope: AdminSearchScope) => {
    if (!query.trim()) return;

    if (scope === 'orders') {
      navigate('/dashboard');
      return;
    }

    navigate('/');
  };

  return (
    <DashboardShell
      navigation={NAVIGATION}
      isActive={(href) => isCurrentPath(location.pathname, href)}
      brand={{ name: 'Minimal Block', tagline: 'Commerce control center' }}
      store={store}
      stores={STORE_OPTIONS}
      currency={currencySelector}
      language={languageSelector}
      pageTitle={pageMeta.pageTitle}
      breadcrumbs={pageMeta.breadcrumbs}
      primaryAction={PRIMARY_ACTION}
      overflowActions={OVERFLOW_ACTIONS}
      notifications={notifications}
      user={USER_PROFILE}
      profileActions={PROFILE_ACTIONS}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
      onQuickAction={handleQuickAction}
      onNotificationClick={(notificationId) => {
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification,
          ),
        );
        navigate('/dashboard');
      }}
      onProfileAction={(actionId) => {
        if (actionId === 'sign-out') {
          onSignOut();
        }
      }}
      onStoreChange={setStoreId}
      onCurrencyChange={setCurrency}
      onLanguageChange={setLanguage}
    >
      {children}
    </DashboardShell>
  );
}
