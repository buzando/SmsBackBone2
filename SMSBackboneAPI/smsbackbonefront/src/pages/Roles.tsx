import React, { useMemo, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Checkbox,
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router-dom';
import NoResult from '../assets/NoResultados.svg';

type Role = {
    id: string;
    name: string;
    createdAt: string;
    isSystem: boolean;
    permissions: string[];
    assignedUsers: number;
};

type PermissionOption = { code: string; label: string };
type PermissionGroup = { code: string; label: string; permissions: PermissionOption[] };

const PERMISSION_GROUPS: PermissionGroup[] = [
    { code: 'users.manage', label: 'Gestionar módulo de usuarios', permissions: [
        { code: 'users.create_edit', label: 'Crear/editar usuarios' },
        { code: 'users.delete', label: 'Eliminar usuarios' },
    ] },
    { code: 'rooms.manage', label: 'Gestionar módulo de salas', permissions: [
        { code: 'rooms.create_edit', label: 'Crear/editar salas' },
        { code: 'rooms.delete', label: 'Eliminar salas' },
    ] },
    { code: 'roles.manage', label: 'Gestionar módulo de roles de usuario', permissions: [
        { code: 'roles.create_edit', label: 'Crear/editar roles' },
        { code: 'roles.delete', label: 'Eliminar roles' },
        { code: 'roles.assign', label: 'Asignar roles de usuario' },
    ] },
    { code: 'campaigns.manage', label: 'Gestionar módulo de campañas', permissions: [
        { code: 'campaigns.start_stop', label: 'Iniciar/detener campañas' },
        { code: 'campaigns.create_delete', label: 'Crear/eliminar campañas' },
        { code: 'campaigns.duplicate', label: 'Duplicar campañas' },
    ] },
    { code: 'templates.manage', label: 'Gestionar módulo de plantillas', permissions: [
        { code: 'templates.create_edit', label: 'Crear/editar plantillas' },
        { code: 'templates.delete', label: 'Eliminar plantillas' },
    ] },
    { code: 'smsTest.manage', label: 'Gestionar módulo de prueba SMS', permissions: [
        { code: 'smsTest.short', label: 'Enviar prueba con número corto' },
        { code: 'smsTest.long', label: 'Enviar prueba con número largo' },
        { code: 'smsTest.template', label: 'Enviar prueba con plantilla' },
    ] },
    { code: 'blacklists.manage', label: 'Gestionar módulo de listas negras', permissions: [
        { code: 'blacklists.create_edit', label: 'Crear/editar listas negras' },
        { code: 'blacklists.delete', label: 'Eliminar listas negras' },
        { code: 'blacklists.records.manage', label: 'Gestionar registros' },
    ] },
    { code: 'reports.manage', label: 'Gestionar módulo de reportes', permissions: [] },
    { code: 'billing.manage', label: 'Gestionar módulo de facturación', permissions: [
        { code: 'billing.history.manage', label: 'Gestionar módulo de historial de pagos' },
        { code: 'billing.paymentMethods.manage', label: 'Gestionar módulo de métodos de pago' },
        { code: 'billing.paymentSettings.manage', label: 'Gestionar módulo de ajustes de pago' },
        { code: 'billing.data.manage', label: 'Gestionar módulo de datos de facturación' },
    ] },
    { code: 'api.download', label: 'Descargar API', permissions: [] },
    { code: 'smsCredits.manage', label: 'Gestionar créditos totales de SMS', permissions: [
        { code: 'smsCredits.recharge', label: 'Recargar créditos totales de SMS' },
    ] },
];

const ALL_PERMISSION_OPTIONS: PermissionOption[] = PERMISSION_GROUPS.flatMap(group => [
    { code: group.code, label: group.label },
    ...group.permissions,
]);

const SYSTEM_ROLE_PERMISSIONS: Record<string, string[]> = {
    Monitor: ['campaigns.start_stop', 'reports.manage'],
    Supervisor: ['campaigns.start_stop', 'reports.manage', 'campaigns.create_delete', 'blacklists.create_edit', 'blacklists.delete'],
    Administrador: ALL_PERMISSION_OPTIONS.map(permission => permission.code),
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
    const firstAccessDate = useMemo(getFirstAccessDate, []);
    const [roles, setRoles] = useState<Role[]>([
        { id: 'system-monitor', name: 'Monitor', createdAt: firstAccessDate, isSystem: true, permissions: SYSTEM_ROLE_PERMISSIONS.Monitor, assignedUsers: 0 },
        { id: 'system-supervisor', name: 'Supervisor', createdAt: firstAccessDate, isSystem: true, permissions: SYSTEM_ROLE_PERMISSIONS.Supervisor, assignedUsers: 0 },
        { id: 'system-administrator', name: 'Administrador', createdAt: firstAccessDate, isSystem: true, permissions: SYSTEM_ROLE_PERMISSIONS.Administrador, assignedUsers: 0 },
    ]);
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [inspectedRole, setInspectedRole] = useState<Role | null>(null);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [roleName, setRoleName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [permissionSearch, setPermissionSearch] = useState('');
    const [formError, setFormError] = useState('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteErrorOpen, setDeleteErrorOpen] = useState(false);

    const filteredRoles = useMemo(() => {
        const term = searchTerm.trim().toLocaleLowerCase('es-MX');
        if (!term) return roles;
        return roles.filter(role => role.name.toLocaleLowerCase('es-MX').includes(term));
    }, [roles, searchTerm]);

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
        setEditingRoleId(null);
        setRoleName('');
        setSelectedPermissions([]);
        setPermissionSearch('');
        setFormError('');
        setRoleDialogOpen(true);
    };

    const openEditRole = (role: Role) => {
        if (role.isSystem) return;
        setEditingRoleId(role.id);
        setRoleName(role.name);
        setSelectedPermissions(role.permissions);
        setPermissionSearch('');
        setFormError('');
        setRoleDialogOpen(true);
    };

    const closeRoleDialog = () => setRoleDialogOpen(false);

    const handleSaveRole = () => {
        const normalizedName = roleName.trim();
        if (!normalizedName || !/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]{1,40}$/.test(normalizedName)) {
            setFormError('Ingresa un nombre alfanumérico de hasta 40 caracteres.');
            return;
        }
        if (roles.some(role => role.id !== editingRoleId && role.name.toLocaleLowerCase('es-MX') === normalizedName.toLocaleLowerCase('es-MX'))) {
            setFormError('Ya existe un rol con ese nombre.');
            return;
        }
        if (selectedPermissions.length === 0) {
            setFormError('Selecciona al menos un permiso.');
            return;
        }

        if (editingRoleId) {
            setRoles(current => current.map(role => role.id === editingRoleId
                ? { ...role, name: normalizedName, permissions: selectedPermissions }
                : role));
        } else {
            const newRole: Role = {
                id: `custom-${Date.now()}`,
                name: normalizedName,
                createdAt: new Intl.DateTimeFormat('es-MX').format(new Date()),
                isSystem: false,
                permissions: selectedPermissions,
                assignedUsers: 0,
            };
            setRoles(current => [...current, newRole]);
        }
        setRoleDialogOpen(false);
        setRoleName('');
        setSelectedPermissions([]);
        setPermissionSearch('');
        setEditingRoleId(null);
        setFormError('');
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
        setSelectedPermissions(current => checked
            ? Array.from(new Set([...current, permissionCode]))
            : current.filter(code => code !== permissionCode));
        setFormError('');
    };

    const updateRoleName = (value: string) => {
        const alphanumericValue = value.replace(/[^A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ]/g, '').slice(0, 40);
        setRoleName(alphanumericValue);
        setFormError('');
    };

    const handleDeleteSelected = () => {
        const selected = roles.filter(role => selectedRoles.includes(role.id));
        if (selected.some(role => role.assignedUsers > 0)) {
            setDeleteErrorOpen(true);
            return;
        }
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        setRoles(current => current.filter(role => !selectedRoles.includes(role.id)));
        setSelectedRoles([]);
        setDeleteConfirmOpen(false);
    };

    const allVisibleCustomSelected = filteredRoles.filter(role => !role.isSystem).length > 0
        && filteredRoles.filter(role => !role.isSystem).every(role => selectedRoles.includes(role.id));

    return (
        <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#F4F3F4', p: { xs: 2, md: 3 }, fontFamily: 'Poppins, sans-serif' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: '#3A1724' }}>
                <IconButton aria-label="Regresar" onClick={() => navigate(-1)} size="small" sx={{ color: '#3A1724' }}>
                    <ArrowBackIosNewIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <Typography variant="h5" sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600, fontSize: { xs: 21, md: 24 } }}>
                    Roles de usuario
                </Typography>
            </Box>

            <Paper elevation={0} sx={{ minHeight: 'calc(100vh - 140px)', borderRadius: 1.5, p: { xs: 1.5, md: 2 }, bgcolor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', px: { xs: 0, md: 1 }, pb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#6F6870', minWidth: 95 }}>
                        1–{filteredRoles.length} de {roles.length}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', ml: 'auto' }}>
                        {activeTab === 0 && selectedRoles.length > 0 && (
                            <Button
                                startIcon={<DeleteOutlineIcon />}
                                onClick={handleDeleteSelected}
                                sx={{ color: '#833A53', textTransform: 'none', fontWeight: 600 }}
                            >
                                Eliminar ({selectedRoles.length})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={openCreateRole}
                            sx={{ bgcolor: '#833A53', '&:hover': { bgcolor: '#6D2F45' }, textTransform: 'uppercase', fontWeight: 600, px: 2.2, height: 40, whiteSpace: 'nowrap' }}
                        >
                            Añadir rol
                        </Button>
                        <TextField
                            size="small"
                            value={searchTerm}
                            onChange={event => setSearchTerm(event.target.value)}
                            placeholder="Buscar"
                            inputProps={{ 'aria-label': 'Buscar roles' }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9A9296' }} /></InputAdornment>,
                            }}
                            sx={{ width: { xs: '100%', sm: 210 }, '& .MuiOutlinedInput-root': { height: 40, borderRadius: 1, bgcolor: '#FFFFFF' } }}
                        />
                    </Box>
                </Box>

                <Tabs
                    value={activeTab}
                    onChange={(_, value: number) => setActiveTab(value)}
                    aria-label="Secciones de roles"
                    sx={{ borderBottom: '1px solid #D9D4D6', '& .MuiTabs-indicator': { bgcolor: '#833A53', height: 2 }, '& .MuiTab-root': { color: '#756B70', fontFamily: 'Poppins, sans-serif', fontSize: 12, fontWeight: 600, minHeight: 42, px: 3 }, '& .Mui-selected': { color: '#833A53 !important' } }}
                >
                    <Tab label="Lista de roles" />
                    <Tab label="Asignación de roles" />
                </Tabs>

                {activeTab === 0 ? (
                    <TableContainer sx={{ maxHeight: 'calc(100vh - 330px)', minHeight: 300, overflow: 'auto' }}>
                        <Table stickyHeader aria-label="Lista de roles" size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #D9D4D6', width: 34 }}>
                                        <Checkbox
                                            size="small"
                                            checked={allVisibleCustomSelected}
                                            disabled={!filteredRoles.some(role => !role.isSystem)}
                                            onChange={toggleAllCustomRoles}
                                            inputProps={{ 'aria-label': 'Seleccionar roles personalizados' }}
                                            sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' } }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ bgcolor: '#FFFFFF', color: '#51464B', fontWeight: 600, borderBottom: '1px solid #D9D4D6', minWidth: 170 }}>Nombre</TableCell>
                                    <TableCell sx={{ bgcolor: '#FFFFFF', color: '#51464B', fontWeight: 600, borderBottom: '1px solid #D9D4D6', minWidth: 180 }}>Fecha de creación</TableCell>
                                    <TableCell align="right" sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #D9D4D6', width: 94 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRoles.map(role => (
                                    <TableRow key={role.id} hover sx={{ height: 45 }}>
                                        <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E1DDDF' }}>
                                            <Checkbox
                                                size="small"
                                                checked={selectedRoles.includes(role.id)}
                                                disabled={role.isSystem}
                                                onChange={() => toggleRoleSelection(role)}
                                                inputProps={{ 'aria-label': `Seleccionar ${role.name}` }}
                                                sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' }, '&.Mui-disabled': { color: '#C7C3C5' } }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #E1DDDF', maxWidth: 260 }}>
                                            <Tooltip title={role.name.length > 34 ? role.name : ''} placement="top-start">
                                                <Typography noWrap sx={{ color: role.isSystem ? '#BEB9BC' : '#51464B', maxWidth: 240, fontSize: 14 }}>
                                                    {role.name}
                                                </Typography>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid #E1DDDF', color: role.isSystem ? '#C2BEC0' : '#6F6870', fontSize: 14 }}>
                                            {role.createdAt}
                                        </TableCell>
                                        <TableCell align="right" sx={{ borderBottom: '1px solid #E1DDDF', p: 0.5 }}>
                                            {!role.isSystem && (
                                                <Tooltip title="Editar rol">
                                                    <IconButton aria-label={`Editar rol ${role.name}`} onClick={() => openEditRole(role)} size="small" sx={{ color: '#382039' }}>
                                                        <EditOutlinedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Inspeccionar permisos">
                                                <IconButton aria-label={`Inspeccionar permisos de ${role.name}`} onClick={() => setInspectedRole(role)} size="small" sx={{ color: '#382039' }}>
                                                    <VisibilityOutlinedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredRoles.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ border: 0 }}>
                                            <Box sx={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: '#746B70' }}>
                                                <Box component="img" src={NoResult} alt="No se encontraron resultados" sx={{ width: 116, height: 116, objectFit: 'contain' }} />
                                                <Typography sx={{ fontWeight: 500 }}>No se encontraron resultados</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
                        <Box sx={{ textAlign: 'center', maxWidth: 440 }}>
                            <Typography variant="h6" sx={{ color: '#3A1724', fontWeight: 600, mb: 1 }}>Asignación de roles</Typography>
                            <Typography sx={{ color: '#746B70', mb: 2.5 }}>
                                Administra el rol de cada usuario desde la sección de usuarios.
                            </Typography>
                            <Button onClick={() => navigate('/UserAdministration')} sx={{ color: '#833A53', fontWeight: 600, textTransform: 'none' }}>
                                Ir a Usuarios
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            <Drawer anchor="right" open={Boolean(inspectedRole)} onClose={() => setInspectedRole(null)}>
                <Box sx={{ width: { xs: '100vw', sm: 390 }, height: '100%', display: 'flex', flexDirection: 'column', color: '#3A1724' }}>
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
                        <Button onClick={() => setInspectedRole(null)} sx={{ color: '#833A53', fontWeight: 600, textTransform: 'uppercase' }}>Cerrar</Button>
                    </Box>
                </Box>
            </Drawer>

            <Dialog open={roleDialogOpen} onClose={closeRoleDialog} fullWidth maxWidth="sm">
                <DialogTitle sx={{ color: '#3A1724', fontWeight: 600, pr: 6 }}>
                    {editingRoleId ? 'Editar rol' : 'Añadir rol'}
                    <IconButton aria-label="Cerrar" onClick={closeRoleDialog} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus
                        required
                        fullWidth
                        label="Nombre"
                        value={roleName}
                        onChange={event => updateRoleName(event.target.value)}
                        inputProps={{ maxLength: 40, 'aria-label': 'Nombre del rol' }}
                        helperText={`${roleName.length}/40 caracteres · Solo letras y números`}
                        sx={{ mb: 2.5 }}
                    />
                    <Typography sx={{ color: '#51464B', fontWeight: 600 }}>Permisos*</Typography>
                    <Typography sx={{ color: '#746B70', fontSize: 12, mb: 1 }}>Selecciona los permisos asignados a este rol.</Typography>
                    <Box sx={{ border: '1px solid #D9D4D6', borderRadius: 1, overflow: 'hidden' }}>
                        <Box sx={{ px: 1.25, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #D9D4D6', gap: 1 }}>
                            <Tooltip title="Seleccionar todos los permisos visibles">
                                <Checkbox
                                    size="small"
                                    checked={allVisiblePermissionsSelected}
                                    indeterminate={visiblePermissionCodes.some(code => selectedPermissions.includes(code)) && !allVisiblePermissionsSelected}
                                    onChange={toggleVisiblePermissions}
                                    inputProps={{ 'aria-label': 'Seleccionar todos los permisos visibles' }}
                                    sx={{ color: '#B9B5B7', '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#833A53' } }}
                                />
                            </Tooltip>
                            <TextField
                                size="small"
                                value={permissionSearch}
                                onChange={event => setPermissionSearch(event.target.value)}
                                placeholder="Buscar"
                                inputProps={{ 'aria-label': 'Buscar permisos' }}
                                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9A9296', fontSize: 19 }} /></InputAdornment> }}
                                sx={{ width: 190, '& .MuiOutlinedInput-root': { height: 34 } }}
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
                                                checked={selectedPermissions.includes(group.code)}
                                                    onChange={event => togglePermission(group.code, event.target.checked)}
                                                sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' } }}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: 13 }}>{group.label}</Typography>}
                                    />
                                    {group.permissions.map(permission => (
                                        <FormControlLabel
                                            key={permission.code}
                                            sx={{ display: 'flex', ml: 3.25, mr: 0, mt: 0, mb: 0, minHeight: 32 }}
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedPermissions.includes(permission.code)}
                                                    onChange={event => togglePermission(permission.code, event.target.checked)}
                                                    sx={{ color: '#B9B5B7', '&.Mui-checked': { color: '#833A53' } }}
                                                />
                                            }
                                            label={<Typography sx={{ fontSize: 13 }}>{permission.label}</Typography>}
                                        />
                                    ))}
                                </Box>
                            )) : (
                                <Box sx={{ minHeight: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#746B70' }}>
                                    <Typography sx={{ fontSize: 13 }}>No se encontraron permisos</Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
                </DialogContent>
                <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
                    <Button onClick={closeRoleDialog} sx={{ color: '#833A53', textTransform: 'uppercase' }}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveRole}
                        disabled={!roleName || selectedPermissions.length === 0}
                        sx={{ bgcolor: '#833A53', '&:hover': { bgcolor: '#6D2F45' }, '&.Mui-disabled': { bgcolor: '#E2DFE0', color: '#A9A5A6' }, textTransform: 'uppercase' }}
                    >
                        {editingRoleId ? 'Guardar' : 'Crear'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle sx={{ color: '#3A1724', fontWeight: 600 }}>Eliminar roles</DialogTitle>
                <DialogContent>
                    <Typography>¿Deseas eliminar los {selectedRoles.length} roles seleccionados?</Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: '#746B70' }}>Cancelar</Button>
                    <Button onClick={confirmDelete} variant="contained" color="error">Eliminar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteErrorOpen} onClose={() => setDeleteErrorOpen(false)}>
                <DialogTitle sx={{ color: '#3A1724', fontWeight: 600 }}>No se pueden eliminar los roles</DialogTitle>
                <DialogContent>
                    <Alert severity="error">Error al eliminar roles: existen usuarios asignados a uno o más roles. Cancele la asignación para continuar</Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDeleteErrorOpen(false)} variant="contained" sx={{ bgcolor: '#833A53', '&:hover': { bgcolor: '#6D2F45' } }}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Roles;
