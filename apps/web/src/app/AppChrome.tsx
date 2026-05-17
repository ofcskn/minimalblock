import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardShell,
  type AdminBreadcrumb,
  type AdminHeaderSelector,
  type AdminHeaderSelectorOption,
  type AdminSidebarLinkNode,
  type NotificationItem,
  type StoreContext,
  type UserProfile,
} from '@minimalblock/ui';

interface AppChromeProps {
  children: ReactNode;
  onSignOut: () => void;
}

const LANGUAGE_OPTIONS: AdminHeaderSelectorOption[] = [
  { value: 'tr', label: 'Türkçe' },
  { value: 'en', label: 'English' },
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
        localeLabel: 'EUR · Türkçe',
      };
    default:
      return {
        id: 'minimal-main',
        name: 'Minimal Block TR',
        status: 'online',
        productCount: 284,
        planName: 'Scale plan',
        localeLabel: 'TRY · Türkçe',
      };
  }
}

function pageMetaForPathname(pathname: string): {
  pageTitle: string;
  breadcrumbs: AdminBreadcrumb[];
} {
  if (pathname.startsWith('/upload')) {
    return {
      pageTitle: 'Upload for QA Review',
      breadcrumbs: [
        { id: 'qa', label: 'Product QA', href: '/' },
        { id: 'upload', label: 'Upload' },
      ],
    };
  }

  if (pathname.startsWith('/product/')) {
    return {
      pageTitle: 'QA Review',
      breadcrumbs: [
        { id: 'qa', label: 'Product QA', href: '/' },
        { id: 'queue', label: 'QA Queue', href: '/' },
        { id: 'detail', label: 'QA Review' },
      ],
    };
  }

  return {
    pageTitle: 'QA Queue',
    breadcrumbs: [
      { id: 'qa', label: 'Product QA', href: '/' },
      { id: 'queue', label: 'QA Queue' },
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
  const { t, i18n } = useTranslation();
  const [storeId, setStoreId] = useState('minimal-main');
  const [language, setLanguage] = useState('tr');
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'qa-blocked',
      title: 'Product blocked — QA failed',
      body: 'Laptop model scored 18/100. Publish gated until issues are resolved.',
      ts: '2h ago',
      read: false,
    },
    {
      id: 'qa-approved',
      title: 'Product approved — ready to publish',
      body: 'Chair model passed QA with 87/100. Export package is ready.',
      ts: 'Yesterday',
      read: true,
    },
  ]);

  const navigation = [
    {
      id: 'main',
      label: '',
      items: [
        { kind: 'link' as const, id: 'home', label: 'QA Queue', href: '/', icon: 'home' as const },
        { kind: 'link' as const, id: 'upload', label: 'Upload Product', href: '/upload', icon: 'bolt' as const },
        { kind: 'link' as const, id: 'brand', label: 'Brand Settings', href: '/brand', icon: 'tag' as const },
      ],
    },
  ];

  const profileActions = [
    { id: 'help', label: t('profile.help'), icon: 'help' as const },
    { id: 'sign-out', label: t('profile.signOut'), icon: 'logout' as const, destructive: true },
  ];

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    void i18n.changeLanguage(lang);
  }

  const store = useMemo(() => getStoreContext(storeId), [storeId]);
  const pageMeta = useMemo(() => pageMetaForPathname(location.pathname), [location.pathname]);

  const languageSelector: AdminHeaderSelector = {
    id: 'language',
    ariaLabel: 'Interface language',
    value: language,
    options: LANGUAGE_OPTIONS,
  };

  const handleNavigate = (node: AdminSidebarLinkNode) => {
    navigate(node.href);
  };

  return (
    <DashboardShell
      navigation={navigation}
      isActive={(href) => isCurrentPath(location.pathname, href)}
      brand={{ name: 'Minimal Block', tagline: 'AI Visual Commerce QA' }}
      store={store}
      currency={{ id: 'currency', ariaLabel: 'Currency', value: 'TRY', options: [] }}
      language={languageSelector}
      pageTitle={pageMeta.pageTitle}
      breadcrumbs={pageMeta.breadcrumbs}
      notifications={notifications}
      user={USER_PROFILE}
      profileActions={profileActions}
      onNavigate={handleNavigate}
      onNotificationClick={(notificationId) => {
        setNotifications((current) =>
          current.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          ),
        );
      }}
      onProfileAction={(actionId) => {
        if (actionId === 'sign-out') {
          onSignOut();
        }
      }}
      onStoreChange={setStoreId}
      onLanguageChange={handleLanguageChange}
    >
      {children}
    </DashboardShell>
  );
}
