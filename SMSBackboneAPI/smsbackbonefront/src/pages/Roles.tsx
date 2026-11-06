import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { hasAssignedPermission, ROLE_PERMISSION_CODES } from './permisions';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Drawer,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router-dom';
import NoResult from '../assets/NoResultados.svg';
import axios from "../components/commons/AxiosInstance";
import { isAxiosError } from 'axios';
import backarrow from '../assets/MoveTable.svg';
import ModalError from '../components/commons/ModalError';
import SnackBar from '../components/commons/ChipBar';
import '../components/commons/CSS/Roles.css';
import IconEditTwo from "../assets/IconEditTwo.svg";
import IconEditOne from "../assets/IconEditOne.svg";
import IconInspecTwo from "../assets/IconInspecTwo.svg";
import IconInspecOne from "../assets/IconInspecOne.svg";
import IconDeleteTwo from "../assets/IconDeleteTwo.svg";
import IconDeleteOne from "../assets/IconDeleteOne.svg";
import CheckboxUnselect from "../assets/CheckboxUnselect.svg";
import CheckboxSelect from "../assets/CheckboxSelect.svg";
import CheckboxDefault from "../assets/CheckboxDefault.svg";
import Iconseachred from "../assets/Iconseachred.svg";
import seachicon from '../assets/icon-lupa.svg';
import iconclose from "../assets/icon-close.svg";
import MainModal from "../components/commons/MainModal";
import CheckboxMinusOne from "../assets/CheckboxMinusOne.svg";
import MainIcon from '../components/commons/MainButtonIcon';
import infoicon from '../assets/Icon-info.svg';
import IconCloseModal from "../assets/IconCloseModal.svg";
import SecondaryButton from '../components/commons/SecondaryButton';
import MainButton from '../components/commons/MainButton';
import IconUserOff from '../assets/IconUserOff.svg';
import IconUserOn from '../assets/IconUserOn.svg';


type Role = {
    id: string;
    name: string;
    createdAt: string;
    isSystem: boolean;
    permissions: string[];
    assignedUsers: number;
};

type ApiRole = {
    id: number;
    role: string;
    idCliente: number | null;
    permissions: string[];
    createdAt?: string | null;
    CreatedAt?: string | null;
};


type ApiRolePage = {
    items: ApiRole[];
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
};

type ApiAssignmentUser = {
    id?: number;
    Id?: number;
    idUsuario?: number;
    IdUsuario?: number;
    name?: string;
    Name?: string;
    firstName?: string;
    FirstName?: string;
    userName?: string;
    UserName?: string;
    email?: string;
    Email?: string;
    idRole?: number | null;
    IdRole?: number | null;
    roleId?: number | null;
    RoleId?: number | null;
    role?: string;
    Role?: string;
    profile?: string;
    Profile?: string;
};

type AssignmentUser = {
    id: number;
    name: string;
    email: string;
    roleId: number | null;
    roleName: string;
};

type PermissionOption = { code: string; label: string };
type PermissionGroup = { code: string; label: string; permissions: PermissionOption[] };

const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        code: 'users.manage', label: 'Gestionar módulo de usuarios', permissions: [
            { code: 'users.create_edit', label: 'Crear/editar usuarios' },
            { code: 'users.delete', label: 'Eliminar usuarios' },
        ]
    },
    {
        code: 'rooms.manage', label: 'Gestionar módulo de salas', permissions: [
            { code: 'rooms.create_edit', label: 'Crear/editar salas' },
            { code: 'rooms.delete', label: 'Eliminar salas' },
        ]
    },
    {
        code: 'roles.manage', label: 'Gestionar módulo de roles de usuario', permissions: [
            { code: 'roles.create_edit', label: 'Crear/editar roles' },
            { code: 'roles.delete', label: 'Eliminar roles' },
            { code: 'roles.assign', label: 'Asignar roles de usuario' },
        ]
    },
    {
        code: 'campaigns.manage', label: 'Gestionar módulo de campañas', permissions: [
            { code: 'campaigns.start_stop', label: 'Iniciar/detener campañas' },
            { code: 'campaigns.create_delete', label: 'Crear/eliminar campañas' },
            { code: 'campaigns.duplicate', label: 'Duplicar campañas' },
        ]
    },
    {
        code: 'templates.manage', label: 'Gestionar módulo de plantillas', permissions: [
            { code: 'templates.create_edit', label: 'Crear/editar plantillas' },
            { code: 'templates.delete', label: 'Eliminar plantillas' },
        ]
    },
    {
        code: 'smsTest.manage', label: 'Gestionar módulo de prueba SMS', permissions: [
            { code: 'smsTest.short', label: 'Enviar prueba con número corto' },
            { code: 'smsTest.long', label: 'Enviar prueba con número largo' },
            { code: 'smsTest.template', label: 'Enviar prueba con plantilla' },
        ]
    },
    {
        code: 'blacklists.manage', label: 'Gestionar módulo de listas negras', permissions: [
            { code: 'blacklists.create_edit', label: 'Crear/editar listas negras' },
            { code: 'blacklists.delete', label: 'Eliminar listas negras' },
            { code: 'blacklists.records.manage', label: 'Gestionar registros' },
        ]
    },
    { code: 'reports.manage', label: 'Gestionar módulo de reportes', permissions: [] },
    {
        code: 'billing.manage', label: 'Gestionar módulo de facturación', permissions: [
            { code: 'billing.history.manage', label: 'Gestionar módulo de historial de pagos' },
            { code: 'billing.paymentMethods.manage', label: 'Gestionar módulo de métodos de pago' },
            { code: 'billing.paymentSettings.manage', label: 'Gestionar módulo de ajustes de pago' },
            { code: 'billing.data.manage', label: 'Gestionar módulo de datos de facturación' },
        ]
    },
    { code: 'api.download', label: 'Descargar API', permissions: [] },
    {
        code: 'smsCredits.manage', label: 'Gestionar créditos totales de SMS', permissions: [
            { code: 'smsCredits.recharge', label: 'Recargar créditos totales de SMS' },
        ]
    },
];

const ALL_PERMISSION_OPTIONS: PermissionOption[] = PERMISSION_GROUPS.flatMap(group => [
    { code: group.code, label: group.label },
    ...group.permissions,
]);

const SYSTEM_ROLE_PERMISSIONS: Record<string, string[]> = {
    Monitor: ['campaigns.start_stop', 'reports.manage'],
    Supervisor: ['campaigns.start_stop', 'reports.manage', 'campaigns.create_delete', 'blacklists.create_edit', 'blacklists.delete'],
    Administrador: [
        'campaigns.start_stop',
        'reports.manage',
        'campaigns.create_delete',
        'blacklists.create_edit',
        'blacklists.delete',
        'smsCredits.manage',
        'smsCredits.recharge',
        'users.create_edit',
    ],
};

const getSystemRoleDescription = (roleName: string) => {
    const codes = SYSTEM_ROLE_PERMISSIONS[roleName];
    if (!codes) return 'Rol predeterminado del sistema.';
    return codes
        .map(code => ALL_PERMISSION_OPTIONS.find(permission => permission.code === code)?.label)
        .filter(Boolean)
        .join(', ');
};

const filterPermissionGroups = (searchTerm: string): PermissionGroup[] => {
    const term = searchTerm.trim().toLocaleLowerCase('es-MX');
    if (!term) return PERMISSION_GROUPS;

    return PERMISSION_GROUPS.flatMap(group => {
        const groupMatches = group.label.toLocaleLowerCase('es-MX').includes(term);
        const permissions = groupMatches
            ? group.permissions
            : group.permissions.filter(permission => permission.label.toLocaleLowerCase('es-MX').includes(term));
        if (groupMatches || permissions.length > 0) return [{ ...group, permissions }];
        return [];
    });
};

const getFirstAccessDate = () => {
    const userData = (() => {
        try {
            return JSON.parse(localStorage.getItem('userData') || '{}');
        } catch {
            return {};
        }
    })();
    const storageKey = `quantum-roles-first-access-${userData.idCliente ?? userData.id ?? 'current'}`;
    const savedDate = localStorage.getItem(storageKey);
    if (savedDate) return savedDate;

    const firstAccessDate = new Intl.DateTimeFormat('es-MX').format(new Date());
    localStorage.setItem(storageKey, firstAccessDate);
    return firstAccessDate;
};

const Roles: React.FC = () => {
    const navigate = useNavigate();
    const canCreateEditRole = hasAssignedPermission(ROLE_PERMISSION_CODES.ROLES_CREATE_EDIT);
    const canDeleteRole = hasAssignedPermission(ROLE_PERMISSION_CODES.ROLES_DELETE);
    const canAssignRoles = hasAssignedPermission(ROLE_PERMISSION_CODES.ROLES_ASSIGN);
    const firstAccessDate = useMemo(getFirstAccessDate, []);
    const [roles, setRoles] = useState<Role[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [assignmentUserSearch, setAssignmentUserSearch] = useState('');
    const [assignmentRoleSearch, setAssignmentRoleSearch] = useState('');
    const [showAssignmentUserSearch, setShowAssignmentUserSearch] = useState(false);
    const [showAssignmentRoleSearch, setShowAssignmentRoleSearch] = useState(false);
    const [assignmentUsers, setAssignmentUsers] = useState<AssignmentUser[]>([]);
    const [isLoadingAssignmentUsers, setIsLoadingAssignmentUsers] = useState(false);
    const [assignmentUsersError, setAssignmentUsersError] = useState('');
    const [selectedAssignmentUserId, setSelectedAssignmentUserId] = useState<number | null>(null);
    const [assignmentRoles, setAssignmentRoles] = useState<Role[]>([]);
    const [isLoadingAssignmentRoles, setIsLoadingAssignmentRoles] = useState(false);
    const [assignmentRolesError, setAssignmentRolesError] = useState('');
    const [assignmentRoleReload, setAssignmentRoleReload] = useState(0);
    const [selectedAssignmentRoleId, setSelectedAssignmentRoleId] = useState<number | null>(null);
    const [savedAssignmentRoleId, setSavedAssignmentRoleId] = useState<number | null>(null);
    const [selectedAssignmentRoleIsSystem, setSelectedAssignmentRoleIsSystem] = useState(false);
    const [savedAssignmentRoleIsSystem, setSavedAssignmentRoleIsSystem] = useState(false);
    const [assignmentRoleCatalog, setAssignmentRoleCatalog] = useState<Role[]>([]);
    const [isSavingAssignment, setIsSavingAssignment] = useState(false);
    const [cancelAssignmentConfirmOpen, setCancelAssignmentConfirmOpen] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [inspectedRole, setInspectedRole] = useState<Role | null>(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [permissionSearch, setPermissionSearch] = useState('');
    const [formError, setFormError] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [titleErrorModal, setTitleErrorModal] = useState('');
    const [messageErrorModal, setMessageErrorModal] = useState('');

    const [showSuccessSnack, setShowSuccessSnack] = useState(false);
    const [messageSuccessSnack, setMessageSuccessSnack] = useState('');

    const PAGE_SIZE = 25;
    const handleFirstPage = () => setPage(1);
    const handlePreviousPage = () =>
        setPage(current => Math.max(current - 1, 1));
    const handleNextPage = () =>
        setPage(current => Math.min(current + 1, totalPages));
    const handleLastPage = () => setPage(Math.max(totalPages, 1));

    const isFirstPage = page <= 1;
    const isLastPage = totalPages === 0 || page >= totalPages;

    const loadRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            setPageError('');

            const response = await axios.get<ApiRolePage>(
                import.meta.env.VITE_API_GET_ROLES,
                { params: { page, search: searchTerm } }
            );

            setRoles(response.data.items.map(role => ({
                id: String(role.id),
                name: role.role,
                isSystem: role.idCliente == null,
                permissions: role.permissions ?? [],
                assignedUsers: 0,
                createdAt: role.idCliente == null
                    ? '—'
                    : formatRoleDate(role.createdAt ?? role.CreatedAt),
            })));

            setTotalRecords(response.data.totalRecords);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error al cargar roles:', error);
            setPageError('No se pudieron cargar los roles.');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm]);

    useEffect(() => {
        void loadRoles();
    }, [loadRoles]);

    useEffect(() => {
        if (activeTab !== 1) return;

        let cancelled = false;

        const loadAssignmentUsers = async () => {
            try {
                setIsLoadingAssignmentUsers(true);
                setAssignmentUsersError('');

                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                const clientId = userData.idCliente ?? userData.IdCliente;

                if (!clientId) {
                    throw new Error('No se encontró el cliente de la sesión.');
                }

                const response = await axios.get<ApiAssignmentUser[]>(
                    `${import.meta.env.VITE_API_GETBYCLIENT_USERS}?Client=${clientId}`
                );
                const responseUsers = Array.isArray(response.data) ? response.data : [];

                const normalizedUsers = responseUsers
                    .map(user => {
                        const id = Number(user.id ?? user.Id ?? user.idUsuario ?? user.IdUsuario);
                        const name = user.name ?? user.Name ?? user.firstName ?? user.FirstName ?? user.userName ?? user.UserName ?? '';
                        const email = user.email ?? user.Email ?? '';
                        const rawRoleId = user.idRole ?? user.IdRole ?? user.roleId ?? user.RoleId;
                        const roleName = String(user.role ?? user.Role ?? user.profile ?? user.Profile ?? '').trim();

                        return {
                            id,
                            name: String(name).trim(),
                            email: String(email).trim(),
                            roleId: rawRoleId == null ? null : Number(rawRoleId),
                            roleName,
                        };
                    })
                    .filter(user => Number.isFinite(user.id) && user.id > 0);

                if (!cancelled) setAssignmentUsers(normalizedUsers);
            } catch (error) {
                console.error('Error al cargar usuarios para asignación de roles:', error);
                if (!cancelled) {
                    setAssignmentUsers([]);
                    setAssignmentUsersError('No se pudieron cargar los usuarios. Inténtalo de nuevo.');
                }
            } finally {
                if (!cancelled) setIsLoadingAssignmentUsers(false);
            }
        };

        void loadAssignmentUsers();
        return () => { cancelled = true; };
    }, [activeTab]);

    useEffect(() => {
        if (activeTab !== 1) return;

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            try {
                setIsLoadingAssignmentRoles(true);
                setAssignmentRolesError('');

                const firstPageResponse = await axios.get<ApiRolePage>(
                    import.meta.env.VITE_API_GET_ROLES,
                    { params: { page: 1, search: assignmentRoleSearch.trim() } }
                );
                const firstPage = firstPageResponse.data;
                const rolePages = [firstPage];

                if (firstPage.totalPages > 1) {
                    const remainingPages = await Promise.all(
                        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
                            axios.get<ApiRolePage>(
                                import.meta.env.VITE_API_GET_ROLES,
                                { params: { page: index + 2, search: assignmentRoleSearch.trim() } }
                            )
                        )
                    );
                    rolePages.push(...remainingPages.map(response => response.data));
                }

                const allMatchingRoles = rolePages.flatMap(rolePage => rolePage.items ?? []).map(role => ({
                    id: String(role.id),
                    name: role.role,
                    isSystem: role.idCliente == null,
                    permissions: role.permissions ?? [],
                    assignedUsers: 0,
                    createdAt: role.idCliente == null ? '—' : '',
                }));

                if (!cancelled) {
                    setAssignmentRoles(allMatchingRoles);
                    if (!assignmentRoleSearch.trim()) setAssignmentRoleCatalog(allMatchingRoles);
                }
            } catch (error) {
                console.error('Error al buscar roles para asignación:', error);
                if (!cancelled) {
                    setAssignmentRoles([]);
                    setAssignmentRolesError('No se pudieron cargar los roles. Inténtalo de nuevo.');
                }
            } finally {
                if (!cancelled) setIsLoadingAssignmentRoles(false);
            }
        }, assignmentRoleSearch.trim() ? 250 : 0);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [activeTab, assignmentRoleSearch, assignmentRoleReload]);

    useEffect(() => {
        if (assignmentRoles.length === 0) return;

        setAssignmentUsers(current => current.map(user => {
            if (user.roleId !== null || !user.roleName) return user;
            const matchingRole = assignmentRoles.find(role =>
                role.name.toLocaleLowerCase('es-MX') === user.roleName.toLocaleLowerCase('es-MX')
            );
            return matchingRole ? { ...user, roleId: Number(matchingRole.id) } : user;
        }));
    }, [assignmentRoles]);

    const firstRecord = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const lastRecord = Math.min(page * PAGE_SIZE, totalRecords);

    const filteredRoles = roles;
    const assignmentVisibleRoles = assignmentRoles;
    const assignmentVisibleUsers = assignmentUsers.filter(user => {
        const term = assignmentUserSearch.trim().toLocaleLowerCase('es-MX');
        return `${user.name} ${user.email}`.toLocaleLowerCase('es-MX').includes(term);
    });
    const selectedAssignmentUser = assignmentUsers.find(user => user.id === selectedAssignmentUserId) ?? null;
    const selectedAssignmentRole = assignmentRoles.find(role => Number(role.id) === selectedAssignmentRoleId) ?? null;
    const selectedRoleIsSystem = selectedAssignmentRoleIsSystem;
    const assignmentHasChanges = selectedAssignmentUserId !== null &&
        selectedAssignmentRoleId !== savedAssignmentRoleId;
    const canSaveAssignment = Boolean(
        selectedAssignmentUserId !== null &&
        selectedAssignmentRoleId !== null &&
        assignmentHasChanges &&
        !isSavingAssignment
    );

    const handleAssignmentUserSelection = (user: AssignmentUser, checked: boolean) => {
        if (!checked) {
            if (selectedAssignmentUserId === user.id) {
                setSelectedAssignmentUserId(null);
                setSelectedAssignmentRoleId(null);
                setSavedAssignmentRoleId(null);
                setSelectedAssignmentRoleIsSystem(false);
                setSavedAssignmentRoleIsSystem(false);
            }
            return;
        }

        const roleByName = user.roleName
            ? assignmentRoleCatalog.find(role => role.name.toLocaleLowerCase('es-MX') === user.roleName.toLocaleLowerCase('es-MX'))
            ?? assignmentRoles.find(role => role.name.toLocaleLowerCase('es-MX') === user.roleName.toLocaleLowerCase('es-MX'))
            : undefined;
        const currentRoleId = user.roleId ?? (roleByName ? Number(roleByName.id) : null);
        const currentRole = assignmentRoleCatalog.find(role => Number(role.id) === currentRoleId)
            ?? assignmentRoles.find(role => Number(role.id) === currentRoleId)
            ?? roleByName;
        const currentRoleIsKnownSystem = Object.keys(SYSTEM_ROLE_PERMISSIONS)
            .some(name => name.toLocaleLowerCase('es-MX') === user.roleName.toLocaleLowerCase('es-MX'));

        setSelectedAssignmentUserId(user.id);
        setSelectedAssignmentRoleId(currentRoleId);
        setSavedAssignmentRoleId(currentRoleId);
        setSelectedAssignmentRoleIsSystem(currentRole?.isSystem ?? currentRoleIsKnownSystem);
        setSavedAssignmentRoleIsSystem(currentRole?.isSystem ?? currentRoleIsKnownSystem);
    };

    const handleAssignmentRoleSelection = (role: Role, checked: boolean) => {
        if (selectedAssignmentUserId === null) return;
        setSelectedAssignmentRoleId(checked ? Number(role.id) : null);
        setSelectedAssignmentRoleIsSystem(checked && role.isSystem);
    };

    const handleSaveAssignment = async () => {
        if (!canAssignRoles || !selectedAssignmentUser || selectedAssignmentRoleId === null || !canSaveAssignment) return;

        setIsSavingAssignment(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_GET_ROLES}/assignment`, {
                userId: selectedAssignmentUser.id,
                roleId: selectedAssignmentRoleId,
            });

            setAssignmentUsers(current => current.map(user => user.id === selectedAssignmentUser.id
                ? { ...user, roleId: selectedAssignmentRoleId, roleName: selectedAssignmentRole?.name ?? user.roleName }
                : user));
            setSavedAssignmentRoleId(selectedAssignmentRoleId);
            setSavedAssignmentRoleIsSystem(selectedAssignmentRoleIsSystem);
            setMessageSuccessSnack('La asignación del rol se guardó correctamente.');
            setShowSuccessSnack(true);
        } catch (error) {
            const responseData = isAxiosError(error) ? error.response?.data : undefined;
            const apiMessage = typeof responseData === 'string' ? responseData : responseData?.message;
            showRoleError('Error al asignar rol', apiMessage || 'No se pudo guardar la asignación. Inténtalo de nuevo.');
        } finally {
            setIsSavingAssignment(false);
        }
    };

    const discardAssignmentChanges = () => {
        setSelectedAssignmentRoleId(savedAssignmentRoleId);
        setSelectedAssignmentRoleIsSystem(savedAssignmentRoleIsSystem);
        setCancelAssignmentConfirmOpen(false);
    };

    const toggleRoleSelection = (role: Role) => {
        if (role.isSystem) return;
        setSelectedRoles(current => current.includes(role.id)
            ? current.filter(id => id !== role.id)
            : [...current, role.id]);
    };

    const toggleAllCustomRoles = () => {
        const visibleCustomIds = filteredRoles.filter(role => !role.isSystem).map(role => role.id);
        const allSelected = visibleCustomIds.length > 0 && visibleCustomIds.every(id => selectedRoles.includes(id));
        setSelectedRoles(current => allSelected
            ? current.filter(id => !visibleCustomIds.includes(id))
            : Array.from(new Set([...current, ...visibleCustomIds])));
    };

    const openCreateRole = () => {
        if (!canCreateEditRole) return;
        setEditingRoleId(null);
        setRoleName('');
        setSelectedPermissions([]);
        setPermissionSearch('');
        setFormError('');
        setRoleDialogOpen(true);
    };

    const openEditRole = (role: Role) => {
        if (role.isSystem || !canCreateEditRole) return;
        setEditingRoleId(role.id);
        setRoleName(role.name);
        setSelectedPermissions(role.permissions);
        setPermissionSearch('');
        setFormError('');
        setRoleDialogOpen(true);
    };

    const closeRoleDialog = () => setRoleDialogOpen(false);

    const showRoleError = (title: string, message: string) => {
        setTitleErrorModal(title);
        setMessageErrorModal(message);
        setIsErrorModalOpen(true);
    };

    const visiblePermissionGroups = useMemo(() => filterPermissionGroups(permissionSearch), [permissionSearch]);
    const visiblePermissionCodes = visiblePermissionGroups.flatMap(group => [group.code, ...group.permissions.map(permission => permission.code)]);
    const allVisiblePermissionsSelected = visiblePermissionCodes.length > 0 && visiblePermissionCodes.every(code => selectedPermissions.includes(code));
    const toggleVisiblePermissions = () => {
        setSelectedPermissions(current => allVisiblePermissionsSelected
            ? current.filter(code => !visiblePermissionCodes.includes(code))
            : Array.from(new Set([...current, ...visiblePermissionCodes])));
        setFormError('');
    };

    const togglePermission = (permissionCode: string, checked: boolean) => {
        const parentGroup = PERMISSION_GROUPS.find(
            group => group.code === permissionCode
        );

        const childGroup = PERMISSION_GROUPS.find(
            group => group.permissions.some(permission => permission.code === permissionCode)
        );

        setSelectedPermissions(current => {
            const next = new Set(current);

            if (parentGroup) {
                // Seleccionar o quitar el padre y todos sus hijos.
                const codes = [
                    parentGroup.code,
                    ...parentGroup.permissions.map(permission => permission.code),
                ];

                codes.forEach(code => checked ? next.add(code) : next.delete(code));
            } else if (childGroup) {
                // Al quitar un hijo, el padre deja de estar seleccionado.
                if (checked) {
                    next.add(permissionCode);

                    const allChildrenSelected = childGroup.permissions.every(
                        permission => next.has(permission.code)
                    );

                    if (allChildrenSelected) next.add(childGroup.code);
                } else {
                    next.delete(permissionCode);
                    next.delete(childGroup.code);
                }
            }

            return [...next];
        });

        setFormError('');
    };

    const updateRoleName = (value: string) => {
        const alphanumericValue = value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/g, '').slice(0, 40);
        setRoleName(alphanumericValue);
        setFormError('');
    };

    const handleDeleteSelected = () => {
        if (!canDeleteRole) return;
        const selected = roles.filter(role => selectedRoles.includes(role.id));
        if (selected.some(role => role.assignedUsers > 0)) {
            setDeleteErrorOpen(true);
            return;
        }
        setRoleToDelete(null);
        setDeleteConfirmOpen(true);
    };

    const requestDeleteRole = (role: Role) => {
        if (role.isSystem || !canDeleteRole) return;

        if (role.assignedUsers > 0) {
            setDeleteErrorOpen(true);
            return;
        }

        setRoleToDelete(role);
        setDeleteConfirmOpen(true);
    };

    const closeDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setRoleToDelete(null);
    };

    const confirmDelete = async () => {
        if (!canDeleteRole) return;
        const idsToDelete = roleToDelete
            ? [roleToDelete.id]
            : [...selectedRoles];

        if (idsToDelete.length === 0) return;

        setDeleteConfirmOpen(false);
        const deletedIds: string[] = [];

        try {
            // Conserva la opción de eliminación múltiple existente y conecta
            // cada eliminación con el endpoint DELETE api/Roles/{idRole}.
            for (const id of idsToDelete) {
                await axios.delete(
                    `${import.meta.env.VITE_API_GET_ROLES}/${id}`
                );
                deletedIds.push(id);
            }

            setSelectedRoles(current =>
                current.filter(id => !deletedIds.includes(id))
            );
            setRoleToDelete(null);

            const currentPageWasEmptied = roles.length > 0 &&
                roles.every(role => deletedIds.includes(role.id));

            if (page > 1 && currentPageWasEmptied) {
                setPage(current => Math.max(current - 1, 1));
            } else {
                await loadRoles();
            }

            setMessageSuccessSnack(
                deletedIds.length === 1
                    ? 'Rol eliminado correctamente.'
                    : `${deletedIds.length} roles eliminados correctamente.`
            );
            setShowSuccessSnack(true);
        } catch (error) {
            setRoleToDelete(null);

            // Si una eliminación múltiple fue parcial, sincroniza la tabla
            // con el servidor y quita de la selección lo que sí se eliminó.
            if (deletedIds.length > 0) {
                setSelectedRoles(current =>
                    current.filter(id => !deletedIds.includes(id))
                );
                await loadRoles();
            }

            const responseData = isAxiosError(error)
                ? error.response?.data
                : undefined;
            const apiMessage = typeof responseData === 'string'
                ? responseData
                : responseData?.message;

            showRoleError(
                deletedIds.length === 1 && idsToDelete.length === 1
                    ? 'Error al eliminar rol'
                    : 'Error al eliminar roles',
                apiMessage || 'No se pudo eliminar el rol. Inténtalo de nuevo.'
            );
        }
    };

    const allVisibleCustomSelected = filteredRoles.filter(role => !role.isSystem).length > 0
        && filteredRoles.filter(role => !role.isSystem).every(role => selectedRoles.includes(role.id));

    const someVisibleCustomSelected = filteredRoles.some(
        role => !role.isSystem && selectedRoles.includes(role.id)
    );

    const handleSaveRole = async () => {
        if (!canCreateEditRole) return;
        const normalizedName = roleName.trim();

        if (!normalizedName || !/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]{1,40}$/.test(normalizedName)) {
            setFormError('Ingresa un nombre alfanumérico de hasta 40 caracteres.');
            return;
        }

        // Comprobación rápida para los roles cargados en esta página.
        // El backend también debe validar contra todos los roles del cliente.
        if (roles.some(role =>
            role.id !== editingRoleId &&
            role.name.toLocaleLowerCase('es-MX') === normalizedName.toLocaleLowerCase('es-MX')
        )) {
            showRoleError(
                editingRoleId ? 'Error al actualizar rol' : 'Error al crear rol',
                'Ya existe un rol con ese nombre. Ingresa otro nombre para continuar.'
            );
            return;
        }

        if (selectedPermissions.length === 0) {
            setFormError('Selecciona al menos un permiso.');
            return;
        }

        const payload = {
            role: normalizedName,
            permissions: selectedPermissions,
        };

        const wasCreating = !editingRoleId;

        try {
            if (editingRoleId) {
                await axios.put(
                    `${import.meta.env.VITE_API_GET_ROLES}/${editingRoleId}`,
                    payload
                );
            } else {
                await axios.post(
                    import.meta.env.VITE_API_CREATE_ROLE,
                    payload
                );
            }

            await loadRoles();
            setAssignmentRoleReload(current => current + 1);

            // Solo cerramos y limpiamos el formulario cuando el guardado tuvo éxito.
            closeRoleDialog();
            setEditingRoleId(null);
            setRoleName('');
            setSelectedPermissions([]);
            setPermissionSearch('');
            setFormError('');

            if (wasCreating) {
                setMessageSuccessSnack('El rol se creó correctamente.');
                setShowSuccessSnack(true);
            }
        } catch (error) {
            const responseData = isAxiosError(error)
                ? error.response?.data
                : undefined;

            const apiMessage =
                typeof responseData === 'string'
                    ? responseData
                    : responseData?.message;

            setTitleErrorModal(
                wasCreating ? 'Error al crear rol' : 'Error al actualizar rol'
            );
            setMessageErrorModal(
                apiMessage || 'No se pudo guardar el rol. Inténtalo de nuevo.'
            );
            setIsErrorModalOpen(true);
        }
    };

    const formatRoleDate = (value?: string | null) => {
        if (!value) return '—';

        const date = new Date(value);
        return Number.isNaN(date.getTime())
            ? '—'
            : new Intl.DateTimeFormat('es-MX').format(date);
    };

    const toggleGroupPermissions = (
        group: PermissionGroup,
        checked: boolean
    ) => {
        const childCodes = group.permissions.map(permission => permission.code);

        setSelectedPermissions(current =>
            checked
                ? Array.from(new Set([...current, ...childCodes]))
                : current.filter(code => !childCodes.includes(code))
        );

        setFormError('');
    };



    return (
        //<Box sx={{ height: 'calc(100vh - 140px)', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: '#F4F3F4', p: { xs: 2, md: 3 }, fontFamily: 'Poppins, sans-serif' }}>
        <Box p={3}
            sx={{
                width: "100%",

                mx: "auto",

                px: {
                    sm: 2,
                    md: 3,
                    lg: 3,
                },

                pt: {
                    sm: 2,
                    md: 3,
                },

                minHeight: "calc(100vh - 64px)",

                overflowX: "hidden",
                marginTop: 0
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, }}>
                <IconButton
                    onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img
                        src={ArrowBackIosNewIcon}
                        alt="Regresar"
                        style={{
                            width: 24,
                            height: 24,
                            transform: 'rotate(270deg)',
                            display: 'block'
                        }}
                    />
                </IconButton>
                <Typography variant="h5" className="roles-title" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: { xs: 21, md: 24 } }}>
                    Roles de usuario
                </Typography>
            </Box>
            <Divider sx={{ marginBottom: '17px', marginTop: '16px' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', px: { xs: 0, md: 1 }, pb: 1.5, ml: 2 }}>
                {activeTab === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <Typography variant="body2" sx={{ color: '#574B4F', mr: 0.5, fontFamily: 'Poppins', fontWeight: 400, fontSize: '14px' }}>
                            {firstRecord}–{lastRecord} | Página {page} de {totalPages}
                        </Typography>

                        <IconButton size="small" aria-label="Primera página"
                            onClick={handleFirstPage} disabled={isFirstPage}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src={backarrow} alt="" />
                                <img src={backarrow} alt="" style={{ marginLeft: '-14px' }} />
                            </Box>
                        </IconButton>

                        <IconButton size="small" aria-label="Página anterior"
                            onClick={handlePreviousPage} disabled={isFirstPage}>
                            <img src={backarrow} alt="" />
                        </IconButton>

                        <IconButton size="small" aria-label="Página siguiente"
                            onClick={handleNextPage} disabled={isLastPage}>
                            <img src={backarrow} alt="" style={{ transform: 'scaleX(-1)' }} />
                        </IconButton>

                        <IconButton size="small" aria-label="Última página"
                            onClick={handleLastPage} disabled={isLastPage}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <img src={backarrow} alt="" style={{ transform: 'scaleX(-1)' }} />
                                <img src={backarrow} alt=""
                                    style={{ transform: 'scaleX(-1)', marginLeft: '-12px' }} />
                            </Box>
                        </IconButton>
                    </Box>
                ) : <Box />}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', ml: 'auto' }}>
                    <MainIcon
                        text="Añadir rol"
                        onClick={openCreateRole}
                        width="156px"
                    >
                        <span className="flex items-center">
                            <span className="mr-2">+</span> Add Card
                        </span>
                    </MainIcon>
                    {activeTab === 0 && (
                        <TextField
                            size="small"
                            value={searchTerm}
                            onChange={event => {
                                setSearchTerm(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Buscar"
                            inputProps={{ 'aria-label': 'Buscar roles', className: 'roles-search-text' }}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start">
                                    <img
                                        src={searchTerm ? Iconseachred : seachicon}
                                        alt="Buscar"
                                        style={{ marginRight: 8, width: 24 }} />
                                </InputAdornment>),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <img src={iconclose} alt="Limpiar búsqueda"
                                            onClick={() => {
                                                setSearchTerm('');
                                                setPage(1);
                                            }}
                                            style={{ width: 24, height: 24, cursor: 'pointer' }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                width: { xs: '100%', sm: 210 },
                                '& .MuiOutlinedInput-root': {
                                    height: 40,
                                    borderRadius: 1,
                                    bgcolor: '#FFFFFF',

                                    '& fieldset': {
                                        borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                        borderWidth: '1px',
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: '#6F1E3A',
                                    },
                                    '& .MuiOutlinedInput-input::placeholder': {
                                        color: '#9B9295',
                                        opacity: 1,
                                    },
                                },
                            }}
                        />
                    )}
                </Box>
            </Box>
            <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, md: 2 }, bgcolor: '#F2F2F2', overflow: 'hidden' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, value: number) => setActiveTab(value)}
                    aria-label="Secciones de roles"
                    className="roles-tabs"
                    sx={{
                        borderBottom: '1px solid #D9D4D6', bgcolor: '#FFFFFF', borderRadius: '8px 8px 0px 0px', '& .MuiTab-root': { minHeight: 42, px: 3 },
                        '& .MuiTabs-indicator': {
                            height: '3px',
                            backgroundColor: '#833A53'
                        },
                    }}
                >
                    <Tab sx={{ padding: '18px 34px', width: '183px' }} label={<span className={activeTab === 0 ? 'roles-subtitle-select' : 'roles-subtitle-unselect'}>Lista de roles</span>} />
                    <Tab sx={{ padding: '18px 34px', width: '240px' }} label={<span className={activeTab === 1 ? 'roles-subtitle-select' : 'roles-subtitle-unselect'}>Asignación de roles</span>} />
                </Tabs>

                {activeTab === 0 ? (
                    <TableContainer sx={{ flex: 1, minHeight: '524px', maxHeight: '600px', overflow: 'auto', bgcolor: '#FFF', borderRadius: '0px 0px 8px 8px' }}>
                        <Table
                            stickyHeader
                            aria-label="Lista de roles"
                            size="small"
                            sx={{
                                tableLayout: 'fixed',
                                width: '100%'
                            }}
                        >
                            <colgroup>
                                <col style={{ width: '34px' }} />
                                <col style={{ width: '184px', }} />
                                <col />
                                <col style={{ width: '94px' }} />
                            </colgroup>
                            {filteredRoles.length > 0 && (
                                <TableHead>
                                    <TableRow sx={{ height: '52px' }}>
                                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #D9D4D6', width: 34 }}>
                                            <Checkbox
                                                size="small"
                                                checked={allVisibleCustomSelected}
                                                indeterminate={someVisibleCustomSelected && !allVisibleCustomSelected}
                                                disabled={!filteredRoles.some(role => !role.isSystem)}
                                                onChange={toggleAllCustomRoles}
                                                inputProps={{ 'aria-label': 'Seleccionar roles personalizados' }}
                                                icon={
                                                    <img src={CheckboxDefault} alt="UnChecked" style={{ width: 18, height: 18, marginRight: '2px' }} />
                                                }
                                                checkedIcon={
                                                    <img src={CheckboxSelect} alt="Checked" style={{ width: 22, height: 21, marginRight: '-2px', marginLeft: '-2px' }} />
                                                }
                                                indeterminateIcon={
                                                    <img src={CheckboxMinusOne} alt="Checked" style={{ width: 18, height: 18 }} />
                                                }
                                                sx={{
                                                    color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell className='roles-text' sx={{ color: '#51464B', fontWeight: 600, borderBottom: '1px solid #D9D4D6' }}
                                        >
                                            {selectedRoles.length > 0 ? (
                                                <Tooltip title="Eliminar" arrow placement="top"
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: {
                                                                backgroundColor: "#312D2E",
                                                                color: "#DEDADA",
                                                                fontFamily: "Poppins",
                                                                fontWeight: 500,
                                                                fontSize: "12px",
                                                                padding: '8px 16px',
                                                                borderRadius: '5px 5px 8px 8px',
                                                                boxShadow: "0px 8px 16px 0px #00131F7A",
                                                                border: '1px #312D2E'
                                                            }
                                                        },
                                                        arrow: {
                                                            sx: {
                                                                color: "#312D2E"
                                                            }
                                                        }
                                                    }}
                                                    PopperProps={{
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, -10]
                                                                }
                                                            }
                                                        ]
                                                    }}
                                                >
                                                    <IconButton onClick={handleDeleteSelected}>
                                                        <img src={IconDeleteTwo} alt="Eliminar" style={{ width: 16, height: 20, marginLeft: '-5px' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                'Nombre'
                                            )}
                                        </TableCell>
                                        <TableCell className='roles-text' sx={{ color: '#51464B', fontWeight: 600, borderBottom: '1px solid #D9D4D6' }}>Fecha de creación</TableCell>
                                        <TableCell align="right" sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #D9D4D6' }} />
                                    </TableRow>
                                </TableHead>
                            )}
                            <TableBody sx={{ bgcolor: '#FFFFFF' }}>
                                {filteredRoles.map(role => (
                                    <TableRow key={role.id} sx={{ height: 45, backgroundColor: selectedRoles.includes(role.id) ? 'rgba(143, 77, 99, 0.18)' : '#FFFFFF' }}>
                                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #C6BFC2' }}>
                                            <Checkbox
                                                size="small"
                                                checked={selectedRoles.includes(role.id)}
                                                disabled={role.isSystem || !canDeleteRole}
                                                onChange={() => toggleRoleSelection(role)}
                                                inputProps={{ 'aria-label': `Seleccionar ${role.name}` }}
                                                icon={
                                                    <img src={role.isSystem ? CheckboxUnselect : CheckboxDefault} alt="UnChecked" style={{ width: 18, height: 18, marginRight: '2px' }} />
                                                }
                                                checkedIcon={
                                                    <img src={role.isSystem ? CheckboxUnselect : CheckboxSelect} style={{ width: 22, height: 21, marginRight: '-2px', marginLeft: '-2px' }} />
                                                }
                                                sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' }, '&.Mui-disabled': { color: '#C7C3C5' } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #C6BFC2', }}>
                                            <Tooltip title={role.name.length > 18 ? role.name : ''}
                                                arrow placement="top"
                                                componentsProps={{
                                                    tooltip: {
                                                        sx: {
                                                            backgroundColor: "#312D2E",
                                                            color: "#DEDADA",
                                                            fontFamily: "Poppins",
                                                            fontWeight: 500,
                                                            fontSize: "12px",
                                                            padding: '8px 16px',
                                                            borderRadius: '5px 5px 8px 8px',
                                                            boxShadow: "0px 8px 16px 0px #00131F7A",
                                                            border: '1px #312D2E'
                                                        }
                                                    },
                                                    arrow: {
                                                        sx: {
                                                            color: "#312D2E"
                                                        }
                                                    }
                                                }}
                                                PopperProps={{
                                                    modifiers: [
                                                        {
                                                            name: 'offset',
                                                            options: {
                                                                offset: [0, -10]
                                                            }
                                                        }
                                                    ]
                                                }}
                                            >
                                                <Typography className='roles-secondary-text' noWrap
                                                    sx={{ color: role.isSystem ? '#BEB9BC' : selectedRoles.includes(role.id) ? '#8F4D63' : '#574B4F', maxWidth: 240, fontSize: 14 }}>
                                                    {role.name}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell className='roles-secondary-text' sx={{ borderBottom: '1px solid #C6BFC2', color: role.isSystem ? '#BEB9BC' : selectedRoles.includes(role.id) ? '#8F4D63' : '#574B4F', fontSize: 14, width: 180 }}>
                                            {role.createdAt}
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: '1px solid #C6BFC2', p: 0.5 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    gap: '4px',
                                                }}
                                            >
                                                <Tooltip title="Inspeccionar" arrow placement="top"
                                                    componentsProps={{
                                                        tooltip: {
                                                            sx: {
                                                                backgroundColor: "#312D2E",
                                                                color: "#DEDADA",
                                                                fontFamily: "Poppins",
                                                                fontWeight: 500,
                                                                fontSize: "12px",
                                                                padding: '8px 16px',
                                                                borderRadius: '5px 5px 8px 8px',
                                                                boxShadow: "0px 8px 16px 0px #00131F7A",
                                                                border: '1px #312D2E'
                                                            }
                                                        },
                                                        arrow: {
                                                            sx: {
                                                                color: "#312D2E"
                                                            }
                                                        }
                                                    }}
                                                    PopperProps={{
                                                        modifiers: [
                                                            {
                                                                name: 'offset',
                                                                options: {
                                                                    offset: [0, -10]
                                                                }
                                                            }
                                                        ]
                                                    }}
                                                >
                                                    <IconButton aria-label={`Inspeccionar permisos de ${role.name}`} onClick={() => setInspectedRole(role)} size="small" sx={{ color: '#382039' }}>
                                                        <img src={selectedRoles.includes(role.id) ? IconInspecOne : IconInspecTwo} alt="Inspeccionar" style={{ width: 20, height: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                                {!role.isSystem && (
                                                    <Tooltip title="Editar" arrow placement="top"
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: "#312D2E",
                                                                    color: "#DEDADA",
                                                                    fontFamily: "Poppins",
                                                                    fontWeight: 500,
                                                                    fontSize: "12px",
                                                                    padding: '8px 16px',
                                                                    borderRadius: '5px 5px 8px 8px',
                                                                    boxShadow: "0px 8px 16px 0px #00131F7A",
                                                                    border: '1px #312D2E'
                                                                }
                                                            },
                                                            arrow: {
                                                                sx: {
                                                                    color: "#312D2E"
                                                                }
                                                            }
                                                        }}
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [0, -10]
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <IconButton aria-label={`Editar rol ${role.name}`} onClick={() => openEditRole(role)} size="small">
                                                            <img src={selectedRoles.includes(role.id) ? IconEditOne : IconEditTwo} alt="Editar" style={{ width: 18, height: 18 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {!role.isSystem && (
                                                    <Tooltip title="Eliminar" arrow placement="top"
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: "#312D2E",
                                                                    color: "#DEDADA",
                                                                    fontFamily: "Poppins",
                                                                    fontWeight: 500,
                                                                    fontSize: "12px",
                                                                    padding: '8px 16px',
                                                                    borderRadius: '5px 5px 8px 8px',
                                                                    boxShadow: "0px 8px 16px 0px #00131F7A",
                                                                    border: '1px #312D2E'
                                                                }
                                                            },
                                                            arrow: {
                                                                sx: {
                                                                    color: "#312D2E"
                                                                }
                                                            }
                                                        }}
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [0, -10]
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <IconButton aria-label={`Eliminar rol ${role.name}`} onClick={() => requestDeleteRole(role)} size="small" sx={{ color: '#382039' }}>
                                                            <img src={selectedRoles.includes(role.id) ? IconDeleteOne : IconDeleteTwo} alt="Eliminar" style={{ width: 16, height: 20 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRoles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ border: 0 }}>
                                            <Box sx={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: '#746B70', marginTop: 8 }}>
                                                <Box component="img" src={NoResult} alt="No se encontraron resultados" sx={{ width: 176, height: 149, objectFit: 'contain' }} />
                                                <Typography sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#8F4D63', fontSize: '16px' }}>No hay información para mostrar.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ mt: 0, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', border: '1px solid #D9D4D6', borderTop: 0, borderRadius: '0 0 6px 6px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                        <Box sx={{ flex: 1, minHeight: '534px', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gridTemplateRows: { xs: '1fr 1fr', md: '1fr' }, overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, borderRight: { xs: 0, md: '1px solid #D9D4D6' }, borderBottom: { xs: '1px solid #D9D4D6', md: 0 } }}>
                                <Box sx={{ height: '65px', padding: '8px 16px 8px 11px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #D9D4D6' }}>
                                    {showAssignmentUserSearch ? (
                                        <TextField
                                            autoFocus
                                            size="small"
                                            value={assignmentUserSearch}
                                            onChange={event => setAssignmentUserSearch(event.target.value)}
                                            placeholder="Buscar usuario"
                                            inputProps={{ 'aria-label': 'Buscar usuarios para asignar' }}
                                            sx={{ flex: 1, mr: 1, '& .MuiOutlinedInput-root': { height: 34 } }}
                                        />
                                    ) : (
                                        <Typography className='roles-generic-subtitles' sx={{ color: '#330F1B', fontSize: '14px', fontWeight: 500 }}>Usuarios</Typography>
                                    )}
                                    <IconButton
                                        size="small"
                                        aria-label={showAssignmentUserSearch ? 'Cerrar búsqueda de usuarios' : 'Buscar usuarios'}
                                        onClick={() => {
                                            setShowAssignmentUserSearch(open => !open);
                                            setAssignmentUserSearch('');
                                        }}
                                        sx={{ color: '#8D858A' }}
                                    >
                                        <SearchIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                                    {isLoadingAssignmentUsers ? (
                                        <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CircularProgress size={26} sx={{ color: '#833A53' }} />
                                        </Box>
                                    ) : assignmentUsersError ? (
                                        <Alert severity="error" sx={{ m: 2 }}>{assignmentUsersError}</Alert>
                                    ) : assignmentUsers.length === 0 ? (
                                        <Box sx={{ minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 3, textAlign: 'center' }}>
                                            <Typography sx={{ color: '#A4516A', fontSize: 13, mb: 1.2 }}>
                                                Añade un usuario para comenzar la asignación de roles.
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate('/UserAdministration')}
                                                sx={{ borderColor: '#D9D4D6', color: '#833A53', fontSize: 11, fontWeight: 600, px: 2, '&:hover': { borderColor: '#833A53', bgcolor: '#FBF8F9' } }}
                                            >
                                                Ir a crear usuario
                                            </Button>
                                        </Box>
                                    ) : assignmentVisibleUsers.length === 0 ? (
                                        <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, textAlign: 'center' }}>
                                            <Typography sx={{ color: '#8D858A', fontSize: 13 }}>No se encontraron usuarios.</Typography>
                                        </Box>
                                    ) : assignmentVisibleUsers.map(user => (
                                        <Box
                                            key={user.id}
                                            onClick={() => handleAssignmentUserSelection(
                                                user,
                                                selectedAssignmentUserId !== user.id
                                            )}
                                            sx={{
                                                height: '48px',
                                                padding: '8px 16px 8px 11px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                borderBottom: '1px solid #C6BFC2',
                                                cursor: isLoadingAssignmentRoles ? 'default' : 'pointer',
                                                backgroundColor: selectedAssignmentUserId === user.id
                                                    ? 'rgba(143, 77, 99, 0.12)'
                                                    : '#FFFFFF',
                                                '&:hover': {
                                                    backgroundColor: isLoadingAssignmentRoles
                                                        ? undefined
                                                        : '#F8F3F5'
                                                }
                                            }}
                                        >
                                            <img
                                                src={selectedAssignmentUserId === user.id ? IconUserOn : IconUserOff}
                                                alt="User"
                                                style={{ width: 34, height: 34 }}
                                            />

                                            <Typography
                                                noWrap
                                                className='roles-generic-text-two'
                                                sx={{
                                                    color: selectedAssignmentUserId === user.id
                                                        ? '#8F4D63'
                                                        : '#51464B',
                                                    fontSize: 13,
                                                    fontWeight: 500
                                                }}
                                            >
                                                {user.name || user.email || `Usuario ${user.id}`}
                                            </Typography>
                                        </Box>
                                    ))
                                    }
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
                                <Box sx={{ height: '65px', padding: '8px 16px 8px 11px', display: 'flex', alignItems: 'center', gap: 0.75, borderBottom: '1px solid #D9D4D6' }}>
                                    <Checkbox
                                        size="small"
                                        disabled
                                        inputProps={{ 'aria-label': 'Seleccionar todos los roles' }}
                                        icon={
                                            <img src={CheckboxUnselect} alt="UnChecked" style={{ width: 18, height: 18, marginRight: '2px' }} />
                                        }
                                        checkedIcon={
                                            <img src={CheckboxSelect} style={{ width: 22, height: 21, marginLeft: '-2px' }} />
                                        }
                                        sx={{ p: 0.5, color: '#B9B5B7' }}
                                    />
                                    {showAssignmentRoleSearch ? (
                                        <TextField
                                            autoFocus
                                            size="small"
                                            value={assignmentRoleSearch}
                                            onChange={event => setAssignmentRoleSearch(event.target.value)}
                                            placeholder="Buscar rol"
                                            inputProps={{ 'aria-label': 'Buscar roles para asignar' }}
                                            sx={{ flex: 1, '& .MuiOutlinedInput-root': { height: 34 } }}
                                        />
                                    ) : (
                                        <Typography className='roles-generic-subtitles' sx={{ color: '#330F1B', fontSize: '14px', fontWeight: 500, flex: 1 }}>Roles</Typography>
                                    )}
                                    <IconButton
                                        size="small"
                                        aria-label={showAssignmentRoleSearch ? 'Cerrar búsqueda de roles' : 'Buscar roles'}
                                        onClick={() => {
                                            setShowAssignmentRoleSearch(open => !open);
                                            setAssignmentRoleSearch('');
                                        }}
                                        sx={{ color: '#8D858A' }}
                                    >
                                        <SearchIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                                {selectedRoleIsSystem && (
                                    <Alert severity="info" icon={<InfoOutlinedIcon />} sx={{ mx: 1.25, mt: 1, py: 0, fontSize: 11 }}>
                                        Los roles personalizados están deshabilitados porque seleccionaste un rol predeterminado. Desmarca ese rol para elegir uno personalizado.
                                    </Alert>
                                )}
                                <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                                    {isLoadingAssignmentRoles ? (
                                        <Box sx={{ minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CircularProgress size={26} sx={{ color: '#833A53' }} />
                                        </Box>
                                    ) : assignmentRolesError ? (
                                        <Alert severity="error" sx={{ m: 2 }}>{assignmentRolesError}</Alert>
                                    ) : assignmentVisibleRoles.map(role => (
                                        <Box key={role.id} sx={{ height: '48px', padding: '8px 16px 8px 11px', display: 'flex', alignItems: 'center', gap: 0.75, borderBottom: '1px solid #C6BFC2' }}>
                                            <Checkbox
                                                size="small"
                                                checked={selectedAssignmentRoleId === Number(role.id)}
                                                disabled={
                                                    selectedAssignmentUserId === null ||
                                                    (!role.isSystem && selectedRoleIsSystem)
                                                }
                                                onChange={event => handleAssignmentRoleSelection(role, event.target.checked)}
                                                inputProps={{ 'aria-label': `Asignar rol ${role.name}` }}
                                                icon={
                                                    <img src={selectedAssignmentUserId === null || (!role.isSystem && selectedRoleIsSystem) ? CheckboxUnselect : CheckboxDefault}
                                                        alt="UnChecked"
                                                        style={{ width: 18, height: 18, marginRight: '2px' }} />
                                                }
                                                checkedIcon={
                                                    <img src={CheckboxSelect} style={{ width: 22, height: 21, marginLeft: '-2px' }} />
                                                }
                                                sx={{ p: 0.5, color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' }, '&.Mui-disabled': { color: '#C7C3C5' } }}
                                            />
                                            <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <Typography noWrap className='roles-generic-text-two' sx={{ color: selectedAssignmentRoleId === Number(role.id) ? '#574B4F' : '#B8B8B8', fontSize: 13 }}>
                                                    {role.name}
                                                </Typography>
                                                {/*  
                                                {role.isSystem && (
                                                    <Tooltip title={getSystemRoleDescription(role.name)}>
                                                        <InfoOutlinedIcon sx={{ color: '#9A9296', fontSize: 15, flexShrink: 0 }} />
                                                    </Tooltip>
                                                )}
*/}
                                            </Box>
                                            <Box sx={{ borderRadius: 10, bgcolor: '#F2EBED', px: 1, py: 0.25, mr: 0.2 }}>
                                                <Typography sx={{ color: '#786E71', fontSize: '9px', lineHeight: 1.5, fontWeight: 400, fontFamily: 'Poppins' }}>
                                                    {role.isSystem ? 'Predeterminado' : 'Personalizado'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                    {!isLoadingAssignmentRoles && !assignmentRolesError && assignmentVisibleRoles.length === 0 && (
                                        <Box sx={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                                            <Typography sx={{ color: '#8D858A', fontSize: 13 }}>No se encontraron roles.</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                        <Box sx={{ minHeight: 69, flexShrink: 0, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #D9D4D6' }}>
                            <SecondaryButton
                                text="Cancelar"
                                onClick={() => setCancelAssignmentConfirmOpen(true)}
                            />

                            <MainButton
                                text={isSavingAssignment ? 'Guardando…' : 'Guardar cambios'}
                                onClick={() => void handleSaveAssignment()}
                                disabled={!canAssignRoles || !canSaveAssignment}
                                width="180px"
                            />
                        </Box>
                    </Box>
                )}
            </Paper>

            <Drawer
                anchor="right"
                open={Boolean(inspectedRole)}
                onClose={() => setInspectedRole(null)}
                sx={{
                    '& .MuiDrawer-paper': {
                        display: 'flex',
                        width: '260px',
                        height: '672px',
                        padding: '0 10px 24px 10px',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        boxSizing: 'border-box',
                        borderRadius: '8px',
                        background: '#FFF',
                        top: '12%',
                        right: '1.5%',
                    }
                }}
            >
                <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', color: '#3A1724' }}>
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>Permisos del rol</Typography>
                            <Typography sx={{ color: '#746B70', fontSize: 14 }}>{inspectedRole?.name}</Typography>
                        </Box>
                        <IconButton aria-label="Cerrar" onClick={() => setInspectedRole(null)}><CloseIcon /></IconButton>
                    </Box>
                    <Divider />
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Typography sx={{ color: '#746B70', fontSize: 14, mb: 1 }}>Permisos asignados</Typography>
                        <Typography sx={{ fontSize: 28, fontWeight: 600, color: '#833A53' }}>{inspectedRole?.permissions.length ?? 0}</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
                        {inspectedRole?.permissions.map(permission => (
                            <Box key={permission} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, py: 1.25, borderBottom: '1px solid #EEE9EB' }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#833A53', flexShrink: 0 }} />
                                <Typography sx={{ color: '#51464B', fontSize: 14 }}>{ALL_PERMISSION_OPTIONS.find(option => option.code === permission)?.label ?? permission}</Typography>
                            </Box>
                        ))}
                    </Box>
                    <Divider />
                    <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
                        <SecondaryButton
                            text="Cerrar"
                            onClick={() => setInspectedRole(null)}
                        />
                    </Box>
                </Box>
            </Drawer>

            <Dialog open={roleDialogOpen} onClose={closeRoleDialog} fullWidth maxWidth="sm">
                <DialogTitle className='roles-generic-titles' sx={{ fontWeight: 600, fontSize: '20px', pr: 6, fontFamily: 'Poppins' }}>
                    {editingRoleId ? 'Editar rol' : 'Añadir rol'}
                    <IconButton aria-label="Cerrar" onClick={closeRoleDialog} sx={{ position: 'absolute', right: 12, top: 12 }}>
                        <img
                            src={IconCloseModal}
                            alt="x"
                            width="24"
                            height="24"
                        />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography className='roles-generic-subtitles' >Nombre<span style={{ color: "#D01247" }}>*</span></Typography>
                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            autoFocus
                            required
                            fullWidth
                            value={roleName}
                            onChange={event => updateRoleName(event.target.value)}
                            inputProps={{ maxLength: 40, 'aria-label': 'Nombre del rol' }}
                            sx={{
                                mb: 2.5, '& input': {
                                    fontFamily: 'Poppins', color: '#574B4F', fontSize: '16px',
                                }
                            }}
                        />
                        <Tooltip
                            title={
                                <Box
                                    sx={{
                                        backgroundColor: "#FFFFFF",
                                        borderRadius: "8px",
                                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                        padding: "8px 12px",
                                        fontFamily: "Poppins",
                                        fontSize: "14px",
                                        color: "#574B4F",
                                        whiteSpace: "pre-line",
                                        transform: "translate(-10px, -22px)",
                                        borderColor: "#00131F3D",
                                        borderStyle: "solid",
                                        borderWidth: "1px"
                                    }}
                                >
                                    <>
                                        • Caracteres alfabéticos<br />
                                        • Longitud máxima de 40<br />
                                        caracteres
                                    </>
                                </Box>
                            }
                            placement="bottom-end"
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        backgroundColor: "transparent",
                                        padding: 0,

                                    },
                                },
                            }}
                        >
                            <IconButton
                                size="small"
                                sx={{ position: 'absolute', marginLeft: "-50px", marginTop: "11px" }}
                            >
                                <img
                                    src={infoicon}
                                    alt={"info"}
                                    style={{ width: 24, height: 24 }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>


                    <Typography className='roles-generic-subtitles'>Permisos<span style={{ color: "#D01247" }}>*</span></Typography>
                    <Typography className='roles-generic-text' sx={{ mb: 1 }}>Seleccione los permisos asignados a este rol.</Typography>
                    <Box sx={{ border: '1px solid #D9D4D6', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ px: 1.25, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #D9D4D6', gap: 1 }}>
                            <Tooltip title="Seleccionar todos los permisos visibles" arrow placement="top"
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            backgroundColor: "#312D2E",
                                            color: "#DEDADA",
                                            fontFamily: "Poppins",
                                            fontWeight: 500,
                                            fontSize: "12px",
                                            padding: '8px 16px',
                                            borderRadius: '5px 5px 8px 8px',
                                            boxShadow: "0px 8px 16px 0px #00131F7A",
                                            border: '1px #312D2E'
                                        }
                                    },
                                    arrow: {
                                        sx: {
                                            color: "#312D2E"
                                        }
                                    }
                                }}
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'offset',
                                            options: {
                                                offset: [0, -10]
                                            }
                                        }
                                    ]
                                }}
                            >
                                <Checkbox
                                    size="small"
                                    checked={allVisiblePermissionsSelected}
                                    indeterminate={visiblePermissionCodes.some(code => selectedPermissions.includes(code)) && !allVisiblePermissionsSelected}
                                    onChange={toggleVisiblePermissions}
                                    inputProps={{ 'aria-label': 'Seleccionar todos los permisos visibles' }}
                                    icon={
                                        <img src={CheckboxDefault} alt="UnChecked" style={{ width: 20, height: 20 }} />
                                    }
                                    checkedIcon={
                                        <img src={CheckboxSelect} alt="Checked" style={{ width: 20, height: 20 }} />
                                    }
                                    indeterminateIcon={
                                        <img src={CheckboxMinusOne} alt="Checked" style={{ width: 20, height: 20 }} />
                                    }
                                    sx={{ color: '#B9B5B7', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#833A53' } }}
                                />
                            </Tooltip>
                            <TextField
                                size="small"
                                value={permissionSearch}
                                onChange={event => setPermissionSearch(event.target.value)}
                                placeholder="Buscar"
                                style={{ marginLeft: 'auto' }}
                                inputProps={{ 'aria-label': 'Buscar permisos', className: 'roles-search-text' }}
                                InputProps={{
                                    startAdornment: (<InputAdornment position="start">
                                        <img
                                            src={permissionSearch ? Iconseachred : seachicon}
                                            alt="Buscar"
                                            style={{ marginRight: 8, width: 24 }} />
                                    </InputAdornment>),
                                    endAdornment: permissionSearch && (
                                        <InputAdornment position="end">
                                            <img src={iconclose} alt="Limpiar búsqueda"
                                                onClick={() => setPermissionSearch('')}
                                                style={{ width: 24, height: 24, cursor: 'pointer' }}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    width: '224px',
                                    '& .MuiOutlinedInput-root': {
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: '#FFFFFF',

                                        '& fieldset': {
                                            borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: searchTerm ? '#6F1E3A' : '#9B9295',
                                            borderWidth: '1px',
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            color: '#6F1E3A',
                                        },
                                        '& .MuiOutlinedInput-input::placeholder': {
                                            color: '#9B9295',
                                            opacity: 1,
                                        },
                                    },
                                }}
                            />
                        </Box>
                        <Box sx={{ maxHeight: 260, overflowY: 'auto', px: 1.25, py: 0.5 }}>
                            {visiblePermissionGroups.length > 0 ? visiblePermissionGroups.map(group => (
                                <Box key={group.code}>
                                    <FormControlLabel
                                        sx={{ display: 'flex', m: 0, minHeight: 34 }}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={
                                                    group.permissions.length === 0
                                                        ? selectedPermissions.includes(group.code)
                                                        : group.permissions.every(permission =>
                                                            selectedPermissions.includes(permission.code)
                                                        )
                                                }
                                                indeterminate={
                                                    group.permissions.length > 0 &&
                                                    group.permissions.some(permission =>
                                                        selectedPermissions.includes(permission.code)
                                                    ) &&
                                                    !group.permissions.every(permission =>
                                                        selectedPermissions.includes(permission.code)
                                                    )
                                                }
                                                onChange={event =>
                                                    group.permissions.length === 0
                                                        ? togglePermission(group.code, event.target.checked)
                                                        : toggleGroupPermissions(group, event.target.checked)
                                                }
                                                icon={
                                                    <img src={CheckboxDefault} alt="UnChecked" style={{ width: 20, height: 20 }} />
                                                }
                                                checkedIcon={
                                                    <img src={CheckboxSelect} alt="Checked" style={{ width: 20, height: 20 }} />
                                                }
                                                indeterminateIcon={
                                                    <img src={CheckboxMinusOne} alt="Checked" style={{ width: 20, height: 20 }} />
                                                }
                                                sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' } }}
                                            />
                                        }
                                        label={<Typography className='roles-generic-text-two' sx={{
                                            color: (group.permissions.length === 0
                                                ? selectedPermissions.includes(group.code)
                                                : group.permissions.every(permission =>
                                                    selectedPermissions.includes(permission.code)
                                                )
                                            ) || (
                                                    group.permissions.length > 0 &&
                                                    group.permissions.some(permission =>
                                                        selectedPermissions.includes(permission.code)
                                                    )
                                                ) ? '#8F4D63' : '#51464B'
                                        }}>{group.label}</Typography>}
                                    />
                                    {group.permissions.map(permission => (
                                        <FormControlLabel
                                            className='roles-generic-text-two'
                                            key={permission.code}
                                            sx={{ display: 'flex', ml: 3.25, mr: 0, mt: 0, mb: 0, minHeight: 32 }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedPermissions.includes(permission.code)}
                                                    onChange={event => togglePermission(permission.code, event.target.checked)}
                                                    icon={
                                                        <img src={CheckboxDefault} alt="UnChecked" style={{ width: 20, height: 20 }} />
                                                    }
                                                    checkedIcon={
                                                        <img src={CheckboxSelect} alt="Checked" style={{ width: 20, height: 20 }} />
                                                    }
                                                    sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' } }}
                                                />
                                            }
                                            label={<Typography className='roles-generic-text-two' sx={{
                                                color: selectedPermissions.includes(permission.code) ? '#8F4D63' : '#51464B'
                                            }}>{permission.label}</Typography>}
                                        />
                                    ))}
                                </Box>
                            )) : (
                                <Box sx={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#746B70' }}>
                                    <Box component="img" src={NoResult} alt="No se encontraron resultados" sx={{ width: 176, height: 149, objectFit: 'contain' }} />
                                    <Typography sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#8F4D63', fontSize: '16px' }}>No se encontraron resultados.</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'space-between', display: 'flex' }}>

                    <SecondaryButton text='Cancelar' onClick={closeRoleDialog} />

                    <MainButton
                        text={editingRoleId ? 'Guardar' : 'Crear'}
                        onClick={handleSaveRole}
                        disabled={!roleName || selectedPermissions.length === 0}
                        width='116px'
                    />
                </DialogActions>
            </Dialog>

            <Dialog
                open={cancelAssignmentConfirmOpen}
                onClose={() => setCancelAssignmentConfirmOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ color: '#3A1724', fontWeight: 600 }}>Descartar cambios</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#51464B' }}>
                        ¿Está seguro de que desea descartar los cambios realizados en la asignación de roles? Esta acción no se puede revertir.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setCancelAssignmentConfirmOpen(false)} sx={{ color: '#833A53', fontWeight: 600 }}>
                        Cancelar
                    </Button>
                    <Button onClick={discardAssignmentChanges} variant="contained" sx={{ bgcolor: '#833A53', '&:hover': { bgcolor: '#6D2F45' }, fontWeight: 600 }}>
                        Descartar cambios
                    </Button>
                </DialogActions>
            </Dialog>


            <MainModal
                isOpen={deleteConfirmOpen}
                Title={roleToDelete ? 'Eliminar rol' : 'Eliminar roles'}
                message={roleToDelete
                    ? '¿Está seguro de que desea eliminar el rol de usuario seleccionado? Esta acción no se puede revertir.'
                    : `¿Deseas eliminar los ${selectedRoles.length} roles seleccionados?`}
                primaryButtonText="Eliminar"
                secondaryButtonText="Cancelar"
                onPrimaryClick={confirmDelete}
                onSecondaryClick={closeDeleteConfirm}
            />

            <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
                <DialogTitle sx={{ color: '#3A1724', fontWeight: 600 }}>No se pueden eliminar los roles</DialogTitle>
                <DialogContent>
                    <Alert severity="error">Error al eliminar roles: existen usuarios asignados a uno o más roles. Cancele la asignación para continuar</Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteErrorOpen(false)} variant="contained" sx={{ bgcolor: '#833A53', '&:hover': { bgcolor: '#6D2F45' } }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
            <ModalError
                isOpen={isErrorModalOpen}
                title={titleErrorModal}
                message={messageErrorModal}
                buttonText="Cerrar"
                onClose={() => setIsErrorModalOpen(false)}
            />

            {showSuccessSnack && (
                <SnackBar
                    message={messageSuccessSnack}
                    buttonText="Cerrar"
                    onClose={() => setShowSuccessSnack(false)}
                />
            )}
        </Box>
    );
};

export default Roles;
