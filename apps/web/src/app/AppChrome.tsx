import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppShell,
  Header,
  Sidebar,
  type HeaderActionItem,
  type HeaderBreadcrumb,
  type HeaderNotification,
  type HeaderSearchResult,
  type SidebarNode,
} from '@minimalblock/ui';

interface AppChromeProps {
  children: ReactNode;
  onSignOut: () => void;
}

function ChromeIcon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      {children}
    </svg>
  );
}

function DashboardIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 13.5h7V20H4v-6.5ZM13 4h7v9h-7V4ZM13 16h7v4h-7v-4ZM4 4h7v6.5H4V4Z" />
    </ChromeIcon>
  );
}

function CatalogIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.75h15m-15 5.25h15m-15 5.25h9" />
    </ChromeIcon>
  );
}

function CubeIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 3 7 4-7 4-7-4 7-4Zm7 4v8l-7 4-7-4V7m7 4v8" />
    </ChromeIcon>
  );
}

function UploadIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" />
    </ChromeIcon>
  );
}

function ReportIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 18V9m5 9V6m5 12v-4M5 20h14" />
    </ChromeIcon>
  );
}

function SparklesIcon() {
  return (
    <ChromeIcon>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3L12 3Zm6 12 1 2.5L21.5 19 19 20l-1 2.5L17 20l-2.5-1 2.5-1.5L18 15Zm-12 .5.8 1.9L8.5 18l-1.7.6L6 20.5l-.8-1.9L3.5 18l1.7-.6L6 15.5Z" />
    </ChromeIcon>
  );
}

function pageMetaForPathname(pathname: string): {
  activeItemId: string;
  breadcrumbs: HeaderBreadcrumb[];
  title: string;
} {
  if (pathname.startsWith('/upload')) {
    return {
      activeItemId: 'upload-assets',
      breadcrumbs: [
        { id: 'catalog', label: 'Catalog' },
        { id: 'upload', label: 'Upload pipeline' },
      ],
      title: 'Upload pipeline',
    };
  }

  if (pathname.startsWith('/dashboard')) {
    return {
      activeItemId: 'orders-dashboard',
      breadcrumbs: [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'orders', label: 'Orders' },
      ],
      title: 'Orders',
    };
  }

  if (pathname.startsWith('/product/')) {
    return {
      activeItemId: 'product-gallery',
      breadcrumbs: [
        { id: 'catalog', label: 'Catalog' },
        { id: 'products', label: 'Products' },
        { id: 'detail', label: 'Product detail' },
      ],
      title: 'Product detail',
    };
  }

  return {
    activeItemId: 'product-gallery',
    breadcrumbs: [
      { id: 'catalog', label: 'Catalog' },
      { id: 'gallery', label: 'Gallery' },
    ],
    title: 'Gallery',
  };
}

const sidebarItems: SidebarNode[] = [
  { id: 'workspace', kind: 'section', label: 'Workspace' },
  {
    id: 'catalog-group',
    label: 'Catalog',
    icon: <CatalogIcon />,
    defaultExpanded: true,
    children: [
      {
        id: 'products-group',
        label: 'Products',
        icon: <CubeIcon />,
        defaultExpanded: true,
        children: [
          {
            id: 'product-gallery',
            label: 'Gallery',
            route: '/',
            icon: <CubeIcon />,
            tooltip: 'Browse product models',
          },
          {
            id: 'upload-assets',
            label: 'Upload assets',
            route: '/upload',
            icon: <UploadIcon />,
            badge: '2',
            tooltip: 'Create or update product assets',
          },
        ],
      },
    ],
  },
  {
    id: 'insights-group',
    label: 'Insights',
    icon: <DashboardIcon />,
    defaultExpanded: true,
    children: [
      {
        id: 'reporting-group',
        label: 'Reporting',
        icon: <ReportIcon />,
        defaultExpanded: true,
        children: [
          {
            id: 'orders-dashboard',
            label: 'Orders',
            route: '/dashboard',
            icon: <ReportIcon />,
            tooltip: 'Review order and engagement analytics',
          },
        ],
      },
    ],
  },
  { id: 'automation-divider', kind: 'divider' },
  {
    id: 'automation-group',
    label: 'Automation',
    icon: <SparklesIcon />,
    isDisabled: true,
    tooltip: 'Automations are coming soon',
  },
];

const quickActions: HeaderActionItem[] = [
  { id: 'add-product', label: 'Add product', icon: <UploadIcon /> },
  { id: 'create-coupon', label: 'Create coupon', icon: <SparklesIcon /> },
  { id: 'export-orders', label: 'Export orders', icon: <ReportIcon /> },
  { id: 'preview-store', label: 'Preview store', icon: <CubeIcon /> },
];

const searchResults: HeaderSearchResult[] = [
  {
    id: 'product-chair',
    label: 'Premium Oak Chair',
    description: 'Product inventory is healthy and ready to publish',
    scopeId: 'products',
    route: '/',
  },
  {
    id: 'order-1048',
    label: 'Order #1048',
    description: 'Payment captured and awaiting fulfillment',
    scopeId: 'orders',
    route: '/dashboard',
  },
  {
    id: 'customer-maya',
    label: 'Maya Patel',
    description: 'Customer account with two open support requests',
    scopeId: 'customers',
    route: '/dashboard',
  },
  {
    id: 'coupon-spring',
    label: 'Spring Launch Coupon',
    description: 'Campaign discount active across the main storefront',
    scopeId: 'coupons',
    route: '/dashboard',
  },
];

export function AppChrome({ children, onSignOut }: AppChromeProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [storeId, setStoreId] = useState('main-store');
  const [currencyId, setCurrencyId] = useState('usd');
  const [languageId, setLanguageId] = useState('en');
  const [channelId, setChannelId] = useState('online');
  const [notifications, setNotifications] = useState<HeaderNotification[]>([
    {
      id: 'new-order',
      label: 'New order received',
      title: 'New order received',
      description: 'Order #1048 just moved into packing.',
      timeLabel: '2 min ago',
      tone: 'order',
      isRead: false,
    },
    {
      id: 'low-stock',
      label: 'Product stock is low',
      title: 'Product stock is low',
      description: 'Premium Oak Chair has only 6 units remaining.',
      timeLabel: '12 min ago',
      tone: 'warning',
      isRead: false,
    },
    {
      id: 'refund-request',
      label: 'Refund request pending',
      title: 'Refund request pending',
      description: 'Order #1032 needs a refund decision before noon.',
      timeLabel: '35 min ago',
      tone: 'danger',
      isRead: false,
    },
  ]);

  const pageMeta = useMemo(
    () => pageMetaForPathname(location.pathname),
    [location.pathname],
  );

  return (
    <AppShell
      header={
        <Header
          brand={{
            title: 'Minimal Block',
            subtitle: 'Commerce control center',
          }}
          breadcrumbs={pageMeta.breadcrumbs}
          notifications={notifications}
          onCurrencyChange={setCurrencyId}
          onLanguageChange={setLanguageId}
          onNotificationClick={notification => {
            setNotifications(currentNotifications =>
              currentNotifications.map(currentNotification =>
                currentNotification.id === notification.id
                  ? { ...currentNotification, isRead: true }
                  : currentNotification,
              ),
            );
            navigate('/dashboard');
          }}
          onNotificationMarkRead={notificationId => {
            setNotifications(currentNotifications =>
              currentNotifications.map(currentNotification =>
                currentNotification.id === notificationId
                  ? { ...currentNotification, isRead: true }
                  : currentNotification,
              ),
            );
          }}
          onProfileAction={actionId => {
            if (actionId === 'sign-out') {
              onSignOut();
            }
          }}
          onQuickAction={actionId => {
            if (actionId === 'add-product') {
              navigate('/upload');
              return;
            }

            navigate('/dashboard');
          }}
          onSearch={(query, scope) => {
            if (query.trim() && (scope === 'orders' || scope === 'customers' || scope === 'all')) {
              navigate('/dashboard');
              return;
            }

            navigate('/');
          }}
          onSearchSelect={result => {
            if (result.route) {
              navigate(result.route);
            }
          }}
          onSelectorChange={(selectorId, value) => {
            if (selectorId === 'channel') {
              setChannelId(value);
            }
          }}
          onSidebarToggle={() => setSidebarMobileOpen(true)}
          onStoreChange={setStoreId}
          profile={{
            name: 'Avery Chen',
            email: 'avery@minimalblock.com',
            actions: [
              { id: 'account-settings', label: 'Account settings' },
              { id: 'billing', label: 'Billing' },
              { id: 'team-members', label: 'Team members' },
              { id: 'sign-out', label: 'Sign out' },
            ],
          }}
          quickActions={quickActions}
          search={{
            placeholder: 'Search products, orders, customers...',
            scopes: [
              { id: 'all', label: 'All' },
              { id: 'products', label: 'Products' },
              { id: 'orders', label: 'Orders' },
              { id: 'customers', label: 'Customers' },
              { id: 'coupons', label: 'Coupons' },
              { id: 'inventory', label: 'Inventory' },
            ],
            results: searchResults,
          }}
          selectors={[
            {
              id: 'store',
              label: 'Store',
              value: storeId,
              options: [
                { id: 'main-store', label: 'Main Store' },
                { id: 'outlet-store', label: 'Outlet Store' },
                { id: 'international-store', label: 'International Store' },
              ],
            },
            {
              id: 'currency',
              label: 'Currency',
              value: currencyId,
              options: [
                { id: 'usd', label: 'USD' },
                { id: 'eur', label: 'EUR' },
                { id: 'gbp', label: 'GBP' },
              ],
            },
            {
              id: 'language',
              label: 'Language',
              value: languageId,
              options: [
                { id: 'en', label: 'English' },
                { id: 'tr', label: 'Turkish' },
                { id: 'de', label: 'German' },
              ],
            },
            {
              id: 'channel',
              label: 'Channel',
              value: channelId,
              options: [
                { id: 'online', label: 'Online Store' },
                { id: 'retail', label: 'Retail' },
                { id: 'marketplaces', label: 'Marketplaces' },
              ],
            },
          ]}
          title={pageMeta.title}
        />
      }
      mainClassName="mx-auto w-full max-w-7xl"
      sidebar={
        <Sidebar
          activeItemId={pageMeta.activeItemId}
          collapsed={sidebarCollapsed}
          footer={
            <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Store status
              </p>
              <p className="text-sm font-medium text-slate-900">International Store</p>
              <p className="text-xs text-slate-500">42 products synced across web and retail channels.</p>
            </div>
          }
          header={
            <div>
              <p className="text-sm font-semibold text-slate-900">Navigation</p>
              <p className="text-xs text-slate-500">Browse catalog, reporting, and admin tools</p>
            </div>
          }
          items={sidebarItems}
          mobileOpen={sidebarMobileOpen}
          onCollapsedChange={setSidebarCollapsed}
          onItemSelect={item => {
            if (item.route) {
              navigate(item.route);
            }
          }}
          onMobileOpenChange={setSidebarMobileOpen}
          onToggleCollapse={() => setSidebarCollapsed(currentState => !currentState)}
        />
      }
    >
      {children}
    </AppShell>
  );
}
