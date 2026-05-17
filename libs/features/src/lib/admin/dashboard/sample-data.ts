import type {
  AdminBreadcrumb as Breadcrumb,
  AdminHeaderAction as HeaderAction,
  AdminHeaderSelector as HeaderSelector,
  AdminHeaderSelectorOption as HeaderSelectorOption,
  AdminSidebarSectionData as SidebarSection,
  Metric,
  NotificationItem,
  OrderSummary,
  ProfileMenuAction,
  StoreContext,
  UserProfile,
} from '@minimalblock/ui';

export const SAMPLE_NAV: SidebarSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      { kind: 'link', id: 'overview', label: 'Overview', href: '/admin', icon: 'home' },
      { kind: 'link', id: 'inbox', label: 'Inbox', href: '/admin/inbox', icon: 'bell', badge: 3 },
    ],
  },
  {
    id: 'commerce',
    label: 'Commerce',
    items: [
      {
        kind: 'group',
        id: 'catalog',
        label: 'Catalog',
        icon: 'box',
        children: [
          { kind: 'link', id: 'products', label: 'Products', href: '/admin/products', badge: 42 },
          { kind: 'link', id: 'categories', label: 'Categories', href: '/admin/categories' },
          { kind: 'link', id: 'uploads', label: 'Uploads & assets', href: '/admin/uploads' },
        ],
      },
      { kind: 'link', id: 'orders', label: 'Orders', href: '/admin/orders', icon: 'shopping-cart', badge: 12 },
      { kind: 'link', id: 'coupons', label: 'Coupons', href: '/admin/coupons', icon: 'ticket' },
      { kind: 'link', id: 'automation', label: 'Automation', href: '/admin/automation', icon: 'bolt' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    items: [
      { kind: 'link', id: 'analytics', label: 'Analytics', href: '/admin/analytics', icon: 'chart' },
      { kind: 'link', id: 'reports', label: 'Reports', href: '/admin/reports', icon: 'pie' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    items: [
      { kind: 'link', id: 'store-settings', label: 'Store settings', href: '/admin/settings', icon: 'settings' },
      { kind: 'link', id: 'team', label: 'Team', href: '/admin/team', icon: 'user', disabled: true },
    ],
  },
];

export const SAMPLE_STORE: StoreContext = {
  id: 'store-main',
  name: 'Main store',
  status: 'online',
  productCount: 42,
};

const STORE_OPTIONS: HeaderSelectorOption[] = [
  { value: 'store-main', label: 'Main store' },
  { value: 'store-eu', label: 'EU store' },
  { value: 'store-wholesale', label: 'Wholesale' },
];

export const SAMPLE_CURRENCY: HeaderSelector = {
  id: 'currency',
  ariaLabel: 'Display currency',
  value: 'USD',
  priority: 2,
  options: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'TRY', label: 'TRY' },
  ],
};

export const SAMPLE_LANGUAGE: HeaderSelector = {
  id: 'language',
  ariaLabel: 'Interface language',
  value: 'en',
  priority: 1,
  options: [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'tr', label: 'Türkçe' },
  ],
};

export const SAMPLE_STORES = STORE_OPTIONS;

export const SAMPLE_BREADCRUMBS: Breadcrumb[] = [
  { id: 'home', label: 'Admin', href: '/admin' },
  { id: 'analytics', label: 'Analytics' },
];

export const SAMPLE_PRIMARY_ACTION: HeaderAction = {
  id: 'add-product',
  label: 'Add product',
  icon: 'plus',
  variant: 'primary',
};

export const SAMPLE_OVERFLOW_ACTIONS: HeaderAction[] = [
  { id: 'import', label: 'Import products', icon: 'upload' },
  { id: 'export-orders', label: 'Export orders', icon: 'box' },
  { id: 'invite-team', label: 'Invite team member', icon: 'user' },
  { id: 'docs', label: 'Documentation', icon: 'help', shortcut: '?' },
];

export const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Order #ORD-1042 needs review',
    body: 'Customer added a custom note about shipping.',
    ts: '5m ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Low stock: Walnut credenza',
    body: 'Only 2 units remaining across all warehouses.',
    ts: '1h ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Stripe payout completed',
    body: '$3,481.20 transferred to your account.',
    ts: 'Yesterday',
    read: true,
  },
];

export const SAMPLE_USER: UserProfile = {
  id: 'u1',
  name: 'Avery Chen',
  email: 'avery@minimalblock.com',
  role: 'Store administrator',
};

export const SAMPLE_PROFILE_ACTIONS: ProfileMenuAction[] = [
  { id: 'profile', label: 'View profile', icon: 'user' },
  { id: 'settings', label: 'Account settings', icon: 'settings' },
  { id: 'help', label: 'Help & docs', icon: 'help' },
  { id: 'logout', label: 'Sign out', icon: 'logout', destructive: true },
];

export const SAMPLE_METRICS: Metric[] = [
  { id: 'rev', label: 'Total revenue', value: '$45,231', delta: 12.5, deltaDirection: 'up', helpText: 'vs last 30 days' },
  { id: 'ord', label: 'Orders', value: '356', delta: 2.4, deltaDirection: 'down', helpText: 'vs last 30 days' },
  { id: 'conv', label: 'Conversion rate', value: '3.24%', delta: 0.5, deltaDirection: 'up', helpText: 'vs last 30 days' },
  { id: 'aov', label: 'Avg. order value', value: '$127', delta: 1.2, deltaDirection: 'up', helpText: 'vs last 30 days' },
];

export const SAMPLE_ORDERS: OrderSummary[] = [
  { id: 'ORD-1042', placedAt: '2026-05-16 09:14', customer: 'Alice Smith',     total: 129.99, currency: 'USD', status: 'processing' },
  { id: 'ORD-1041', placedAt: '2026-05-16 08:02', customer: 'Bob Johnson',     total:  45.00, currency: 'USD', status: 'shipped'    },
  { id: 'ORD-1040', placedAt: '2026-05-15 22:31', customer: 'Charlie Davis',   total: 890.50, currency: 'USD', status: 'delivered'  },
  { id: 'ORD-1039', placedAt: '2026-05-15 18:47', customer: 'Devon Park',      total:  64.00, currency: 'EUR', status: 'pending'    },
  { id: 'ORD-1038', placedAt: '2026-05-15 14:12', customer: 'Emma Whitlock',   total: 312.25, currency: 'USD', status: 'cancelled'  },
];
