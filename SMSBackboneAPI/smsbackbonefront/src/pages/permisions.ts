export type RoleName =
  | 'Root'
  | 'Mesa'
  | 'Administrador'
  | 'Supervisor'
  | 'Monitor';

export const PERMISSIONS = {
  ROOT_CLIENTS_MANAGE: 'root.clients.manage',
  ROOT_ROOMS_MANAGE: 'root.rooms.manage',
  ROOT_REPORTS_VIEW: 'root.reports.view',

  MESA_CLIENT_ROOM_PICKER: 'mesa.clientRoomPicker',

  ADMIN_USERS_MANAGE: 'admin.users.manage',
  ADMIN_ROOMS_MANAGE: 'admin.rooms.manage',
  ADMIN_ROOMS_VIEW: 'admin.rooms.view',

  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_EDIT: 'dashboard.edit',
  DASHBOARD_FILTER_NUMBER_TYPE: 'dashboard.filter.numberType',
  DASHBOARD_CAMPAIGNS_SHORTCUT: 'dashboard.campaigns.shortcut',
  DASHBOARD_QUICK_SEND: 'dashboard.quickSend',
  DASHBOARD_USAGE_FILTER: 'dashboard.usage.filter',
  DASHBOARD_USAGE_DOWNLOAD: 'dashboard.usage.download',

  SMS_CAMPAIGNS_VIEW: 'sms.campaigns.view',
  SMS_CAMPAIGNS_FILTER: 'sms.campaigns.filter',
  SMS_CAMPAIGNS_PIN: 'sms.campaigns.pin',
  SMS_CAMPAIGNS_DETAIL_EDIT: 'sms.campaigns.detail.edit',
  SMS_CAMPAIGNS_CREATE: 'sms.campaigns.create',
  SMS_CAMPAIGNS_START_STOP: 'sms.campaigns.startStop',
  SMS_CAMPAIGNS_RECORDS_MANAGE: 'sms.campaigns.records.manage',
  SMS_CAMPAIGNS_EDIT_CLONE_DELETE: 'sms.campaigns.editCloneDelete',

  SMS_TEST_SEND: 'sms.test.send',
  SMS_TEMPLATES_MANAGE: 'sms.templates.manage',
  SMS_BLACKLISTS_MANAGE: 'sms.blacklists.manage',

  REPORTS_VIEW: 'reports.view',
  REPORTS_DOWNLOAD: 'reports.download',

  BILLING_PAYMENT_METHODS_MANAGE: 'billing.paymentMethods.manage',
  BILLING_DATA_MANAGE: 'billing.data.manage',
  BILLING_HISTORY_VIEW: 'billing.history.view',
  BILLING_INVOICES_MANAGE: 'billing.invoices.manage',
  BILLING_PAYMENT_SETTINGS_MANAGE: 'billing.paymentSettings.manage',

  BALANCE_TRANSFER_MANAGE: 'balance.transfer.manage',
  BALANCE_RECHARGE: 'balance.recharge',
  BALANCE_NUMBERS_MANAGE: 'balance.numbers.manage',

  TOPBAR_SEARCH: 'topbar.search',
  TOPBAR_ROOM_CHANGE: 'topbar.roomChange',

  USER_ACCOUNT_EDIT: 'user.account.edit',
  USER_LANGUAGE_CHANGE: 'user.language.change',
  USER_TERMS_VIEW: 'user.terms.view',
  USER_PRIVACY_VIEW: 'user.privacy.view',

  HELP_VIEW: 'help.view',

  API_VIEW_DOWNLOAD: 'api.viewDownload',

  USAGE_VIEW: 'usage.view',
  COSTS_VIEW: 'costs.view',
  NUMBERS_DIDS_MANAGE: 'numbers.dids.manage',
} as const;

export type PermissionKey = typeof PERMISSIONS[keyof typeof PERMISSIONS];

const ADMIN_EXCLUDED_PERMISSIONS: PermissionKey[] = [
  PERMISSIONS.ROOT_CLIENTS_MANAGE,
  PERMISSIONS.ROOT_ROOMS_MANAGE,
  PERMISSIONS.ROOT_REPORTS_VIEW,
  PERMISSIONS.MESA_CLIENT_ROOM_PICKER,
];

const ADMIN_PERMISSIONS: PermissionKey[] = Object
  .values(PERMISSIONS)
  .filter(permission => !ADMIN_EXCLUDED_PERMISSIONS.includes(permission));

export const ROLE_PERMISSIONS: Record<RoleName, PermissionKey[]> = {
  Root: [
    PERMISSIONS.ROOT_CLIENTS_MANAGE,
    PERMISSIONS.ROOT_ROOMS_MANAGE,
    PERMISSIONS.ROOT_REPORTS_VIEW,
    PERMISSIONS.NUMBERS_DIDS_MANAGE,
  ],

  Mesa: [
    PERMISSIONS.MESA_CLIENT_ROOM_PICKER,
  ],

  Administrador: ADMIN_PERMISSIONS,

  Supervisor: [
    PERMISSIONS.ADMIN_ROOMS_VIEW,

    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.DASHBOARD_FILTER_NUMBER_TYPE,

    PERMISSIONS.SMS_CAMPAIGNS_VIEW,
    PERMISSIONS.SMS_CAMPAIGNS_FILTER,
    PERMISSIONS.SMS_CAMPAIGNS_PIN,

    PERMISSIONS.SMS_TEMPLATES_MANAGE,
    PERMISSIONS.SMS_BLACKLISTS_MANAGE,

    PERMISSIONS.REPORTS_VIEW,

    PERMISSIONS.TOPBAR_SEARCH,
    PERMISSIONS.TOPBAR_ROOM_CHANGE,
    PERMISSIONS.USER_LANGUAGE_CHANGE,
    PERMISSIONS.USER_TERMS_VIEW,
    PERMISSIONS.USER_PRIVACY_VIEW,
    PERMISSIONS.HELP_VIEW,
  ],

  Monitor: [
    PERMISSIONS.ADMIN_ROOMS_VIEW,

    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_EDIT,
    PERMISSIONS.DASHBOARD_FILTER_NUMBER_TYPE,

    PERMISSIONS.SMS_CAMPAIGNS_VIEW,
    PERMISSIONS.SMS_CAMPAIGNS_FILTER,
    PERMISSIONS.SMS_CAMPAIGNS_PIN,

    PERMISSIONS.REPORTS_VIEW,

    PERMISSIONS.TOPBAR_SEARCH,
    PERMISSIONS.TOPBAR_ROOM_CHANGE,
    PERMISSIONS.USER_LANGUAGE_CHANGE,
    PERMISSIONS.USER_TERMS_VIEW,
    PERMISSIONS.USER_PRIVACY_VIEW,
    PERMISSIONS.HELP_VIEW,
  ],
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    return {};
  }
};

export const getCurrentRole = (): RoleName | null => {
  const user = getCurrentUser();

  const role =
    user?.rol ??
    user?.role ??
    user?.Role ??
    user?.roleName ??
    null;

  if (!role) return null;

  return String(role).trim() as RoleName;
};

export const hasPermission = (
  permission: PermissionKey,
  roleName?: RoleName | string | null
): boolean => {
  const role = (roleName || getCurrentRole()) as RoleName | null;

  if (!role) return false;

  const permissions = ROLE_PERMISSIONS[role];

  if (!permissions) return false;

  return permissions.includes(permission);
};

export const hasAnyPermission = (
  permissions: PermissionKey[],
  roleName?: RoleName | string | null
): boolean => {
  return permissions.some(permission => hasPermission(permission, roleName));
};

export const isRoot = (): boolean => {
  return getCurrentRole() === 'Root';
};

export const isMesa = (): boolean => {
  return getCurrentRole() === 'Mesa';
};

export const isAdministrador = (): boolean => {
  return getCurrentRole() === 'Administrador';
};

export const isSupervisor = (): boolean => {
  return getCurrentRole() === 'Supervisor';
};

export const isMonitor = (): boolean => {
  return getCurrentRole() === 'Monitor';
};