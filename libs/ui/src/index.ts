// Components
export { Button } from './lib/components/Button.js';
export type { ButtonProps } from './lib/components/Button.js';

export { Card, CardHeader, CardBody } from './lib/components/Card.js';
export type { CardProps } from './lib/components/Card.js';

export { Spinner } from './lib/components/Spinner.js';
export type { SpinnerProps } from './lib/components/Spinner.js';

export { FileUpload } from './lib/components/FileUpload.js';
export type { FileUploadProps } from './lib/components/FileUpload.js';

export { Modal } from './lib/components/Modal.js';
export type { ModalProps } from './lib/components/Modal.js';

export { StatusBadge } from './lib/components/StatusBadge.js';
export type { StatusBadgeProps } from './lib/components/StatusBadge.js';

export { WorkflowStatusBadge } from './lib/components/WorkflowStatusBadge.js';
export type { WorkflowStatusBadgeProps } from './lib/components/WorkflowStatusBadge.js';

export { AiDiagnosisPanel } from './lib/components/AiDiagnosisPanel.js';
export type { AiDiagnosisPanelProps } from './lib/components/AiDiagnosisPanel.js';

export { SourceImageReadinessCard } from './lib/components/SourceImageReadinessCard.js';
export type { SourceImageReadinessCardProps } from './lib/components/SourceImageReadinessCard.js';

export { ModelInfoCard } from './lib/components/ModelInfoCard.js';
export type { ModelInfoCardProps } from './lib/components/ModelInfoCard.js';

export { HotspotEditorPanel } from './lib/components/HotspotEditorPanel.js';
export type { HotspotEditorPanelProps } from './lib/components/HotspotEditorPanel.js';

// Layout
export { AppShell } from './lib/layout/AppShell.js';
export type { AppShellProps } from './lib/layout/AppShell.js';
export {
  Header,
  HeaderActions,
  HeaderBrand,
  HeaderBreadcrumbs,
  HeaderMobileMenu,
  HeaderNotifications,
  HeaderProfileMenu,
  HeaderRoot,
  HeaderSearch,
  HeaderStoreSelector,
} from './lib/layout/Header.js';
export type {
  HeaderActionItem,
  HeaderBrandConfig,
  HeaderBreadcrumb,
  HeaderNotification,
  HeaderProfileMenu as HeaderProfileMenuConfig,
  HeaderProps,
  HeaderSearchConfig,
  HeaderSearchResult,
  HeaderSearchScope,
  HeaderSelectorConfig,
  HeaderSelectorOption,
} from './lib/layout/header.types.js';

// Admin layout (e-commerce control panel)
export { DashboardShell } from './lib/layout/admin/DashboardShell.js';
export { AppHeader as AdminAppHeader } from './lib/layout/admin/AppHeader.js';
export { AppSidebar as AdminAppSidebar } from './lib/layout/admin/AppSidebar.js';
export { SidebarItem as AdminSidebarItem } from './lib/layout/admin/SidebarItem.js';
export { SidebarNestedItems as AdminSidebarNestedItems } from './lib/layout/admin/SidebarNestedItems.js';
export { SidebarSection as AdminSidebarSection } from './lib/layout/admin/sidebar/SidebarSection.js';
export { useAdminLayout } from './lib/layout/admin/useAdminLayout.js';
export { useSidebarState } from './lib/layout/admin/useSidebarState.js';
export { useResponsiveLayout } from './lib/layout/admin/useResponsiveLayout.js';
export { useDisclosure } from './lib/layout/admin/useDisclosure.js';
export { useHeaderMenus } from './lib/layout/admin/useHeaderMenus.js';
export { HeaderBrand as AdminHeaderBrand } from './lib/layout/admin/header/HeaderBrand.js';
export { HeaderSearch as AdminHeaderSearch } from './lib/layout/admin/header/HeaderSearch.js';
export { HeaderSelectors as AdminHeaderSelectors } from './lib/layout/admin/header/HeaderSelectors.js';
export { HeaderActions as AdminHeaderActions } from './lib/layout/admin/header/HeaderActions.js';
export { NotificationMenu as AdminNotificationMenu } from './lib/layout/admin/header/NotificationMenu.js';
export { ProfileMenu as AdminProfileMenu } from './lib/layout/admin/header/ProfileMenu.js';
export { MobileHeaderMenu as AdminMobileHeaderMenu } from './lib/layout/admin/header/MobileHeaderMenu.js';
export { MainContent as AdminMainContent } from './lib/layout/admin/MainContent.js';
export type {
  Breadcrumb as AdminBreadcrumb,
  DashboardShellCallbacks,
  DashboardShellProps,
  EmptyStateAction,
  GalleryModel,
  HeaderAction as AdminHeaderAction,
  HeaderSelector as AdminHeaderSelector,
  HeaderSelectorOption as AdminHeaderSelectorOption,
  IconName as AdminIconName,
  Metric,
  NotificationItem,
  OrderStatus,
  OrderSummary,
  ProfileMenuAction,
  RequirementItem,
  SearchScope as AdminSearchScope,
  SidebarDividerNode as AdminSidebarDividerNode,
  SidebarGroupNode as AdminSidebarGroupNode,
  SidebarLinkNode as AdminSidebarLinkNode,
  SidebarNode as AdminSidebarNode,
  SidebarSection as AdminSidebarSectionData,
  StoreContext,
  UserProfile,
} from './lib/layout/admin/admin.types.js';

// Navigation
export { Sidebar } from './lib/navigation/Sidebar.js';
export type {
  SidebarActionNode,
  SidebarDividerNode,
  SidebarNode,
  SidebarProps,
  SidebarSectionNode,
} from './lib/navigation/sidebar.types.js';

// 3D Viewer
export {
  ModelViewer,
  ModelViewerPlaceholder,
} from './lib/3d-viewer/ModelViewer.js';
export type { ModelViewerProps, ModelViewerHandle } from './lib/3d-viewer/ModelViewer.js';

// QR Code
export { QrCode } from './lib/components/QrCode.js';
export type { QrCodeProps } from './lib/components/QrCode.js';
