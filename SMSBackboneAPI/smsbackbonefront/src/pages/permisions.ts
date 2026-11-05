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
  ROLES_MANAGE: 'roles.manage',
  CLIENTS_MANAGE: 'clients.manage',
  REPORTS_ADMIN_MANAGE: 'reportsAdmin.manage',

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

// Códigos guardados por el catálogo de permisos de roles.
export const ROLE_PERMISSION_CODES = {
  USERS_MANAGE: 'users.manage',
  USERS_CREATE_EDIT: 'users.create_edit',
  USERS_DELETE: 'users.delete',
  ROOMS_MANAGE: 'rooms.manage',
  ROOMS_CREATE_EDIT: 'rooms.create_edit',
  ROOMS_DELETE: 'rooms.delete',
  ROLES_MANAGE: 'roles.manage',
  ROLES_CREATE_EDIT: 'roles.create_edit',
  ROLES_DELETE: 'roles.delete',
  ROLES_ASSIGN: 'roles.assign',
  CAMPAIGNS_MANAGE: 'campaigns.manage',
  CAMPAIGNS_START_STOP: 'campaigns.start_stop',
  CAMPAIGNS_CREATE_DELETE: 'campaigns.create_delete',
  CAMPAIGNS_DUPLICATE: 'campaigns.duplicate',
  TEMPLATES_MANAGE: 'templates.manage',
  TEMPLATES_CREATE_EDIT: 'templates.create_edit',
  TEMPLATES_DELETE: 'templates.delete',
  SMS_TEST_MANAGE: 'smsTest.manage',
  SMS_TEST_SHORT: 'smsTest.short',
  SMS_TEST_LONG: 'smsTest.long',
  SMS_TEST_TEMPLATE: 'smsTest.template',
  BLACKLISTS_MANAGE: 'blacklists.manage',
  BLACKLISTS_CREATE_EDIT: 'blacklists.create_edit',
  BLACKLISTS_DELETE: 'blacklists.delete',
  BLACKLISTS_RECORDS_MANAGE: 'blacklists.records.manage',
  REPORTS_MANAGE: 'reports.manage',
  BILLING_MANAGE: 'billing.manage',
  BILLING_HISTORY_MANAGE: 'billing.history.manage',
  BILLING_INVOICES_MANAGE: 'billing.invoices.manage',
  BILLING_PAYMENT_METHODS_MANAGE: 'billing.paymentMethods.manage',
  BILLING_PAYMENT_SETTINGS_MANAGE: 'billing.paymentSettings.manage',
  BILLING_DATA_MANAGE: 'billing.data.manage',
  API_DOWNLOAD: 'api.download',
  SMS_CREDITS_MANAGE: 'smsCredits.manage',
  SMS_CREDITS_RECHARGE: 'smsCredits.recharge',
} as const;

type RolePermissionCode = typeof ROLE_PERMISSION_CODES[keyof typeof ROLE_PERMISSION_CODES];

const FRONT_PERMISSION_CODES: Partial<Record<PermissionKey, RolePermissionCode[]>> = {
  [PERMISSIONS.ROOT_CLIENTS_MANAGE]: [ROLE_PERMISSION_CODES.CLIENTS_MANAGE],
  [PERMISSIONS.ROOT_REPORTS_VIEW]: [ROLE_PERMISSION_CODES.REPORTS_ADMIN_MANAGE],
  [PERMISSIONS.ADMIN_USERS_MANAGE]: [ROLE_PERMISSION_CODES.USERS_MANAGE, ROLE_PERMISSION_CODES.USERS_CREATE_EDIT, ROLE_PERMISSION_CODES.USERS_DELETE],
  [PERMISSIONS.ADMIN_ROOMS_MANAGE]: [ROLE_PERMISSION_CODES.ROOMS_MANAGE, ROLE_PERMISSION_CODES.ROOMS_CREATE_EDIT, ROLE_PERMISSION_CODES.ROOMS_DELETE],
  [PERMISSIONS.ADMIN_ROOMS_VIEW]: [ROLE_PERMISSION_CODES.ROOMS_MANAGE, ROLE_PERMISSION_CODES.ROOMS_CREATE_EDIT, ROLE_PERMISSION_CODES.ROOMS_DELETE],
  [PERMISSIONS.ROLES_MANAGE]: [ROLE_PERMISSION_CODES.ROLES_MANAGE, ROLE_PERMISSION_CODES.ROLES_CREATE_EDIT, ROLE_PERMISSION_CODES.ROLES_DELETE, ROLE_PERMISSION_CODES.ROLES_ASSIGN],
  [PERMISSIONS.SMS_CAMPAIGNS_VIEW]: [ROLE_PERMISSION_CODES.CAMPAIGNS_MANAGE, ROLE_PERMISSION_CODES.CAMPAIGNS_START_STOP, ROLE_PERMISSION_CODES.CAMPAIGNS_CREATE_DELETE, ROLE_PERMISSION_CODES.CAMPAIGNS_DUPLICATE],
  [PERMISSIONS.SMS_CAMPAIGNS_CREATE]: [ROLE_PERMISSION_CODES.CAMPAIGNS_CREATE_DELETE],
  [PERMISSIONS.SMS_CAMPAIGNS_START_STOP]: [ROLE_PERMISSION_CODES.CAMPAIGNS_START_STOP],
  [PERMISSIONS.SMS_CAMPAIGNS_RECORDS_MANAGE]: [ROLE_PERMISSION_CODES.CAMPAIGNS_MANAGE],
  [PERMISSIONS.SMS_CAMPAIGNS_EDIT_CLONE_DELETE]: [ROLE_PERMISSION_CODES.CAMPAIGNS_CREATE_DELETE, ROLE_PERMISSION_CODES.CAMPAIGNS_DUPLICATE],
  [PERMISSIONS.SMS_TEST_SEND]: [ROLE_PERMISSION_CODES.SMS_TEST_MANAGE, ROLE_PERMISSION_CODES.SMS_TEST_SHORT, ROLE_PERMISSION_CODES.SMS_TEST_LONG, ROLE_PERMISSION_CODES.SMS_TEST_TEMPLATE],
  [PERMISSIONS.SMS_TEMPLATES_MANAGE]: [ROLE_PERMISSION_CODES.TEMPLATES_MANAGE, ROLE_PERMISSION_CODES.TEMPLATES_CREATE_EDIT, ROLE_PERMISSION_CODES.TEMPLATES_DELETE],
  [PERMISSIONS.SMS_BLACKLISTS_MANAGE]: [ROLE_PERMISSION_CODES.BLACKLISTS_MANAGE, ROLE_PERMISSION_CODES.BLACKLISTS_CREATE_EDIT, ROLE_PERMISSION_CODES.BLACKLISTS_DELETE, ROLE_PERMISSION_CODES.BLACKLISTS_RECORDS_MANAGE],
  [PERMISSIONS.REPORTS_VIEW]: [ROLE_PERMISSION_CODES.REPORTS_MANAGE],
  [PERMISSIONS.REPORTS_DOWNLOAD]: [ROLE_PERMISSION_CODES.REPORTS_MANAGE],
  [PERMISSIONS.BILLING_PAYMENT_METHODS_MANAGE]: [ROLE_PERMISSION_CODES.BILLING_MANAGE, ROLE_PERMISSION_CODES.BILLING_PAYMENT_METHODS_MANAGE],
  [PERMISSIONS.BILLING_DATA_MANAGE]: [ROLE_PERMISSION_CODES.BILLING_MANAGE, ROLE_PERMISSION_CODES.BILLING_DATA_MANAGE],
  [PERMISSIONS.BILLING_HISTORY_VIEW]: [ROLE_PERMISSION_CODES.BILLING_MANAGE, ROLE_PERMISSION_CODES.BILLING_HISTORY_MANAGE],
  [PERMISSIONS.BILLING_PAYMENT_SETTINGS_MANAGE]: [ROLE_PERMISSION_CODES.BILLING_MANAGE, ROLE_PERMISSION_CODES.BILLING_PAYMENT_SETTINGS_MANAGE],
  [PERMISSIONS.BALANCE_TRANSFER_MANAGE]: [ROLE_PERMISSION_CODES.SMS_CREDITS_MANAGE],
  [PERMISSIONS.BALANCE_RECHARGE]: [ROLE_PERMISSION_CODES.SMS_CREDITS_MANAGE, ROLE_PERMISSION_CODES.SMS_CREDITS_RECHARGE],
  [PERMISSIONS.API_VIEW_DOWNLOAD]: [ROLE_PERMISSION_CODES.API_DOWNLOAD],
};

const LEGACY_PERMISSION_BY_ROLE_CODE: Partial<Record<RolePermissionCode, PermissionKey>> = {
  [ROLE_PERMISSION_CODES.CLIENTS_MANAGE]: PERMISSIONS.ROOT_CLIENTS_MANAGE,
  [ROLE_PERMISSION_CODES.REPORTS_ADMIN_MANAGE]: PERMISSIONS.ROOT_REPORTS_VIEW,
  [ROLE_PERMISSION_CODES.USERS_MANAGE]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.USERS_CREATE_EDIT]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.USERS_DELETE]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.ROOMS_MANAGE]: PERMISSIONS.ADMIN_ROOMS_MANAGE,
  [ROLE_PERMISSION_CODES.ROOMS_CREATE_EDIT]: PERMISSIONS.ADMIN_ROOMS_MANAGE,
  [ROLE_PERMISSION_CODES.ROOMS_DELETE]: PERMISSIONS.ADMIN_ROOMS_MANAGE,
  [ROLE_PERMISSION_CODES.ROLES_MANAGE]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.ROLES_CREATE_EDIT]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.ROLES_DELETE]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.ROLES_ASSIGN]: PERMISSIONS.ADMIN_USERS_MANAGE,
  [ROLE_PERMISSION_CODES.CAMPAIGNS_MANAGE]: PERMISSIONS.SMS_CAMPAIGNS_VIEW,
  [ROLE_PERMISSION_CODES.CAMPAIGNS_START_STOP]: PERMISSIONS.SMS_CAMPAIGNS_START_STOP,
  [ROLE_PERMISSION_CODES.CAMPAIGNS_CREATE_DELETE]: PERMISSIONS.SMS_CAMPAIGNS_CREATE,
  [ROLE_PERMISSION_CODES.CAMPAIGNS_DUPLICATE]: PERMISSIONS.SMS_CAMPAIGNS_EDIT_CLONE_DELETE,
  [ROLE_PERMISSION_CODES.TEMPLATES_MANAGE]: PERMISSIONS.SMS_TEMPLATES_MANAGE,
  [ROLE_PERMISSION_CODES.TEMPLATES_CREATE_EDIT]: PERMISSIONS.SMS_TEMPLATES_MANAGE,
  [ROLE_PERMISSION_CODES.TEMPLATES_DELETE]: PERMISSIONS.SMS_TEMPLATES_MANAGE,
  [ROLE_PERMISSION_CODES.SMS_TEST_MANAGE]: PERMISSIONS.SMS_TEST_SEND,
  [ROLE_PERMISSION_CODES.SMS_TEST_SHORT]: PERMISSIONS.SMS_TEST_SEND,
  [ROLE_PERMISSION_CODES.SMS_TEST_LONG]: PERMISSIONS.SMS_TEST_SEND,
  [ROLE_PERMISSION_CODES.SMS_TEST_TEMPLATE]: PERMISSIONS.SMS_TEST_SEND,
  [ROLE_PERMISSION_CODES.BLACKLISTS_MANAGE]: PERMISSIONS.SMS_BLACKLISTS_MANAGE,
  [ROLE_PERMISSION_CODES.BLACKLISTS_CREATE_EDIT]: PERMISSIONS.SMS_BLACKLISTS_MANAGE,
  [ROLE_PERMISSION_CODES.BLACKLISTS_DELETE]: PERMISSIONS.SMS_BLACKLISTS_MANAGE,
  [ROLE_PERMISSION_CODES.BLACKLISTS_RECORDS_MANAGE]: PERMISSIONS.SMS_BLACKLISTS_MANAGE,
  [ROLE_PERMISSION_CODES.REPORTS_MANAGE]: PERMISSIONS.REPORTS_VIEW,
  [ROLE_PERMISSION_CODES.BILLING_MANAGE]: PERMISSIONS.BILLING_DATA_MANAGE,
  [ROLE_PERMISSION_CODES.BILLING_HISTORY_MANAGE]: PERMISSIONS.BILLING_HISTORY_VIEW,
  [ROLE_PERMISSION_CODES.BILLING_PAYMENT_METHODS_MANAGE]: PERMISSIONS.BILLING_PAYMENT_METHODS_MANAGE,
  [ROLE_PERMISSION_CODES.BILLING_PAYMENT_SETTINGS_MANAGE]: PERMISSIONS.BILLING_PAYMENT_SETTINGS_MANAGE,
  [ROLE_PERMISSION_CODES.BILLING_DATA_MANAGE]: PERMISSIONS.BILLING_DATA_MANAGE,
  [ROLE_PERMISSION_CODES.API_DOWNLOAD]: PERMISSIONS.API_VIEW_DOWNLOAD,
  [ROLE_PERMISSION_CODES.SMS_CREDITS_MANAGE]: PERMISSIONS.BALANCE_TRANSFER_MANAGE,
  [ROLE_PERMISSION_CODES.SMS_CREDITS_RECHARGE]: PERMISSIONS.BALANCE_RECHARGE,
};

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
  // Root solo administra clientes y consulta reportes administrativos.
  Root: [
    PERMISSIONS.ROOT_CLIENTS_MANAGE,
    PERMISSIONS.ROOT_REPORTS_VIEW,
  ],

  // Mesa tiene acceso irrestricto a la interfaz; incluye el selector de cliente/sala.
  Mesa: Object.values(PERMISSIONS),

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

  // Mesa es un perfil de soporte sin restricciones en el front.
  if (role === 'Mesa') return true;

  // Root queda limitado a Clientes y Reportes de administración aunque haya
  // permisos antiguos o incompletos en la respuesta de login.
  if (role === 'Root') return ROLE_PERMISSIONS.Root.includes(permission);

  const user = getCurrentUser();
  const assignedPermissions = user?.permissions ?? user?.Permissions;

  if (Array.isArray(assignedPermissions) && assignedPermissions.length > 0) {
    const granted = new Set(assignedPermissions.map((code: unknown) => String(code).trim().toLocaleLowerCase('en-US')));
    const matchingCodes = FRONT_PERMISSION_CODES[permission];
    if (matchingCodes) {
      return matchingCodes.some(code => granted.has(code.toLocaleLowerCase('en-US')));
    }
    // Las claves antiguas que no existen en el catálogo nuevo conservan
    // temporalmente la regla por rol; evita bloquear rutas existentes.
  }

  // Los perfiles legacy siguen funcionando mientras se inicializa su
  // relación RolePermission en la base.
  if (!role) return false;
  return Boolean(ROLE_PERMISSIONS[role]?.includes(permission));
};

export const hasAssignedPermission = (permissionCode: RolePermissionCode): boolean => {
  const role = getCurrentRole();
  if (role === 'Mesa') return true;

  const user = getCurrentUser();
  const assignedPermissions = user?.permissions ?? user?.Permissions;

  if (Array.isArray(assignedPermissions) && assignedPermissions.length > 0) {
    return assignedPermissions.some((code: unknown) =>
      String(code).trim().toLocaleLowerCase('en-US') === permissionCode.toLocaleLowerCase('en-US')
    );
  }

  // Compatibilidad para perfiles legacy sin relaciones cargadas aún.
  const legacyPermission = LEGACY_PERMISSION_BY_ROLE_CODE[permissionCode];
  if (!legacyPermission || !role) return false;
  return Boolean(ROLE_PERMISSIONS[role]?.includes(legacyPermission));
};

export const hasAnyAssignedPermission = (permissionCodes: RolePermissionCode[]): boolean =>
  permissionCodes.some(hasAssignedPermission);

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
