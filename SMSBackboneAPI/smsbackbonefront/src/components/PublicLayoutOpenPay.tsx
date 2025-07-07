import React, { useState, useContext, useEffect } from 'react';
import { styled, Theme, CSSObject } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { AppContext } from '../hooks/useContextInitialState'
import nuxiba_svg from '../assets/nuxiba.svg'
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CssBaseline from '@mui/material/CssBaseline';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import EditIcon from "@mui/icons-material/Edit";
import Modal from "@mui/material/Modal";
import { InputAdornment } from '@mui/material';
import {
    Box,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Button,
    TextField,
    MenuList,
    Popper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DropDownIcon from '../assets/icon-punta-flecha-bottom.svg';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import rentaNumerosUrl from '../assets/RentaDeNumeros.svg';
import Tooltip from "@mui/material/Tooltip";
import seachicon from '../assets/icon-lupa.svg'
import iconclose from "../assets/icon-close.svg"
import HouseIcon from "../assets/IconRooms.svg"
import IconUser from '../assets/USER_ICON.svg';
import Iconpeople from '../assets/Iconpeople.svg';
import Iconmesage from '../assets/Iconmesage.svg';
import Iconreports from '../assets/Iconreports.svg';
import IconUserArrow from '../assets/CHEVRON_USER.svg';
import CloseSession from '../assets/Icon-CerrarSesion.svg';
import Iconfacturation from '../assets/Iconfacturation.svg';
import Iconhelpu from '../assets/Iconhelpu.svg';

const drawerWidth = 250;

type Page = {
    id: number,
    title: string,
    path: string,
    icon: React.ReactNode,
    hasSubMenus: boolean,
    subMenus: SubMenu[]
}
type SubMenu = {
    id: number,
    title: string,
    path: string,
    icon: React.ReactNode,
}



const pages: Page[] = [
    { id: 0, title: 'Inicio', path: '/', icon: <HomeIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 1, title: 'Usuarios', path: '/UserAdministration', icon: <PeopleAltIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    {
        id: 2, title: 'Administración', path: '', icon: <Iconpeople sx={{ color: 'white' }} />, hasSubMenus: true, subMenus: [
            { id: 1, title: 'Usuarios', path: '/users', icon: <PeopleAltIcon sx={{ color: 'white' }} /> },
            { id: 2, title: 'Salas', path: '/rooms', icon: <HomeIcon sx={{ color: 'white' }} /> },
        ]
    },
    {
        id: 3, title: 'Facturación', path: '/billing', icon: <Iconfacturation sx={{ color: 'white' }} />, hasSubMenus: true, subMenus: [
            { id: 1, title: 'Historial de pagos', path: '/PaymentHistoric', icon: <HistoryIcon sx={{ color: 'white' }} /> },
            { id: 2, title: 'Métodos de pago', path: '/PaymentMethods', icon: <PaymentIcon sx={{ color: 'white' }} /> },
            { id: 3, title: 'Facturación', path: '/BillingInformation', icon: <DataUsageIcon sx={{ color: 'white' }} /> },
            { id: 4, title: 'Costos', path: '/Costs', icon: <AttachMoneyIcon sx={{ color: 'white' }} /> },
            { id: 5, title: 'Ajustes de pago', path: '/PaymentSettings', icon: <SettingsSuggestIcon sx={{ color: 'white' }} /> },
        ]
    },
    { id: 4, title: 'Reportes', path: '/reports', icon: <Iconreports sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    {
        id: 5, title: 'SMS', path: '/numbers', icon: <Iconmesage sx={{ color: 'white' }} />, hasSubMenus: true, subMenus: [
            { id: 1, title: 'Configuración SMS', path: '/sms', icon: <ChecklistRtlIcon sx={{ color: 'white' }} /> },
        ]
    },
    { id: 6, title: 'Ayuda', path: '/help', icon: <Iconhelpu sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },

    // Opciones del botón de usuario
    { id: 7, title: 'Editar cuenta', path: '/ManageAccount', icon: <EditIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 8, title: 'Administrar cuentas', path: '/UserAdministration', icon: <PeopleAltIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 9, title: 'Cerrar sesión', path: '', icon: <Avatar sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 10, title: 'Salas', path: '/rooms', icon: <Avatar sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
];

type Room = {
    id: string | number;
    name: string;
    client: string;
    description: string; // Ajustado desde "dscription"
    credits: number;
    long_sms: number;
    calls: number;
    short_sms: number;
};

type Props = {
    children: React.ReactNode;
}


const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        //marginLeft: drawerWidth,
        // width: `calc(100% - ${drawerWidth}px)`,
        width: `calc(100%)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': {
                ...openedMixin(theme),
                background: 'transparent linear-gradient(311deg, #0B0029 0%, #B9A0A8 100%)',
                borderRight: '1px solid #E6E4E4',
                color: '#FFFFFF',
            },
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': {
                ...closedMixin(theme),
                background: 'transparent linear-gradient(311deg, #0B0029 0%, #B9A0A8 100%)',
                borderRight: '1px solid #E6E4E4',
                color: '#FFFFFF',
            },
        }),
    })
);



const PublicLayoutOpenPay: React.FC<Props> = props => {
    const [searchOpen, setSearchOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredPages, setFilteredPages] = useState<Page[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [openSubMenuBilling, setOpenSubMenuBilling] = useState(false);
    const [openSubMenuNumbers, setOpenSubMenuNumbers] = useState(false);
    const { contextState, setContextState } = useContext(AppContext)
    const { user } = contextState
    const [openSubMenu, setOpenSubMenu] = useState(false); // Submenú de administración
    const [helpModalIsOpen, setHelpModalIsOpen] = useState(false);




    const closeHelpModal = () => setHelpModalIsOpen(false);


    const handleLogout = () => {
        // Limpiar localStorage y sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Redirigir al login
        navigate('/login');
    };


    useEffect(() => {
        // Cargar datos desde localStorage
        const storedRooms = [
            {
                id: 1,
                name: 'Sala de Prueba',
                client: 'Cliente Ficticio',
                description: 'Descripción de prueba',
                credits: 100,
                long_sms: 20,
                calls: 10,
                short_sms: 50
            }
        ];

        const selectedRoom = storedRooms[0];
        const currentRoom = JSON.stringify({ id: 1, name: 'Sala de Prueba', client: 'Cliente Ficticio', description: 'Descripción de prueba', credits: 100, long_sms: 20, calls: 10, short_sms: 50 });

        sessionStorage.setItem('ListRooms', JSON.stringify(storedRooms));
        sessionStorage.setItem('selectedRoom', JSON.stringify(selectedRoom));


        console.log("Guardado en localStorage:");
        console.log("ListRooms:", localStorage.getItem('ListRooms'));
        console.log("selectedRoom:", localStorage.getItem('selectedRoom'));

        setRooms(storedRooms);
        setSelectedRoom(selectedRoom);

        if (storedRooms) {
            try {
                if (Array.isArray(storedRooms)) {
                    setRooms(storedRooms);
                } else {
                    console.error('Los datos de las salas no están en el formato correcto.');
                }
            }
             catch (error) {
                console.error('Error al parsear las salas desde localStorage', error);
            }
        }
        if (currentRoom) {
            try {
                const room = JSON.parse(currentRoom);
                setSelectedRoom(room);
            } catch (error) {
                console.error('Error al parsear la sala seleccionada desde localStorage', error);
            }
        }
        setFilteredPages([]);

        // Actualizar los resultados de búsqueda
        const results: Page[] = pages
            .flatMap((page) =>
                // Solo considerar páginas que no tengan submenús
                !page.hasSubMenus
                    ? [page]
                    : [] // No agregamos las páginas con submenús
            )
            .filter((item) =>
                searchTerm && item.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const search = searchTerm.toLowerCase();
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                const aStartsWith = aTitle.startsWith(search);
                const bStartsWith = bTitle.startsWith(search);

                // Priorizar los resultados que comienzan con el término buscado
                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Ordenar alfabéticamente los demás resultados
                return aTitle.localeCompare(bTitle);
            });

        setFilteredPages(results);
    }, [searchTerm, openSubMenuBilling, openSubMenuNumbers]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);  // Establecer correctamente el anchorEl
    };

    //const handleMenuClose = () => {
    //    setAnchorEl(null);
    //};

    // Función para seleccionar una sala
    const handleRoomChange = (room: Room) => {
        setSelectedRoom(room);
        localStorage.setItem('selectedRoom', JSON.stringify(room));
        setAnchorEl(null);
    };


    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };


    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(null);
        switch (Number(event.currentTarget.id)) {
            case 1:
                console.log("Profile settings")
                break;
            case 2:
                console.log("Account settings")
                break;
            case 3:
                setContextState({
                    user: {
                        userName: '',
                        email: '',
                        rol: ''
                    },
                    token: '',
                    expiration: ''
                })
                localStorage.clear();
                navigate('/login')
                break;
        }
    };


    const handleSubMenuToggle = () => {
        setOpenSubMenu(!openSubMenu);
    };


    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" sx={{ bgcolor: '#290013' }}>
                <Toolbar>
                    {/* Sección Izquierda */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton color="inherit" onClick={() => console.log('Drawer opened')}>
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit" sx={{ ml: 2 }}>
                            connectSMS
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            marginRight: '50px', // Ajusta este valor para mover toda la sección hacia la izquierda
                        }}
                    >
                        {/* Buscador */}
                        {!searchOpen ? (
                            <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
                                <SearchIcon />
                            </IconButton>
                        ) : (
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: 'background.paper',
                                    borderRadius: '5px',
                                    boxShadow: 2,
                                    border: '1px solid #7B354D', // Borde del mismo color que las letras
                                    height: '40px',
                                    width: '300px',
                                }}
                            >
                                {/* Campo de texto para búsqueda */}
                                <TextField
                                    fullWidth
                                    placeholder="Buscar"
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoComplete="off"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <img src={seachicon} alt="Buscar" style={{ width: '18px', height: '18px' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchTerm('')}
                                                    sx={{ color: '#7B354D' }}
                                                >
                                                    <img src={iconclose} alt="Limpiar" style={{ width: '16px', height: '16px' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        style: {
                                            height: '100%',
                                            textAlign: 'left',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '16px',
                                            lineHeight: '25px',
                                            letterSpacing: '0px',
                                            color: '#7B354D',
                                            opacity: 1,
                                        },
                                    }}
                                />
                                {/* Mostrar resultados filtrados */}
                                {searchTerm ? (
                                    filteredPages.length > 0 ? (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '40px',
                                                left: 0,
                                                width: '100%',
                                                bgcolor: 'background.paper',
                                                boxShadow: 3,
                                                zIndex: 1500,
                                                borderRadius: '0 0 5px 5px',
                                                border: '1px solid #7B354D',
                                                borderTop: 'none',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                padding: 2,
                                            }}
                                        >
                                            {filteredPages.map((page) => (
                                                <MenuItem
                                                    key={page.id}
                                                    onClick={() => {
                                                        navigate(page.path);
                                                        setSearchOpen(false);
                                                        setSearchTerm('');
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            textAlign: 'left',
                                                            fontFamily: 'Poppins, sans-serif',
                                                            fontSize: '16px',
                                                            lineHeight: '25px',
                                                            color: '#7B354D', // Color del texto
                                                        }}
                                                    >
                                                        {page.title}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '40px',
                                                left: 0,
                                                width: '100%',
                                                bgcolor: 'background.paper',
                                                boxShadow: 3,
                                                zIndex: 1500,
                                                borderRadius: '0 0 5px 5px',
                                                border: '1px solid #7B354D',
                                                borderTop: 'none',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                padding: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins, sans-serif',
                                                    fontSize: '16px',
                                                    lineHeight: '25px',
                                                    color: '#7B354D',
                                                    opacity: 1,
                                                }}
                                            >
                                                No se encontraron resultados
                                            </Typography>
                                        </Box>
                                    )
                                ) : null}


                            </Box>
                        )}
                    </Box>

                    {/* Selector de salas */}
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            ml: 2,
                            padding: '4px 8px',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                            justifyContent: 'space-between',
                            minWidth: '300px',
                            maxWidth: '350px',
                            height: '50px',
                            position: 'relative', // Es importante mantener esto para el Popper
                            marginLeft: '-5px'
                        }}
                    >
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                            {/* Ícono de la casa */}
                            <img
                                src={HouseIcon}
                                alt="Room Icon"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                }}
                            />
                            <Box sx={{ marginLeft: '10px' }}>
                                {/* Nombre y Descripción de la sala */}
                                <Typography
                                    variant="body1"
                                    color="inherit"
                                    sx={{
                                        fontSize: '12px',
                                        color: '#574B4F',
                                        fontWeight: 'medium',
                                        fontFamily: 'Poppins, sans-serif',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {selectedRoom && selectedRoom.name ? selectedRoom.name : 'Sin nombre'}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        fontSize: '9px',
                                        color: '#574B4F',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontFamily: 'Poppins, sans-serif',
                                    }}
                                >
                                    {selectedRoom && selectedRoom.description ? selectedRoom.description : 'Sin descripción'}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Ícono del menú */}
                        <IconButton
                            color="inherit"
                            onClick={handleMenuOpen}
                            sx={{
                                color: 'black',
                                transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)', // Cambia la rotación si está abierto
                                transition: 'transform 0.3s ease-in-out', // Agrega animación para suavizar el giro
                            }}
                        >

                            <img src={DropDownIcon} alt="dropdown" width="24" height="24" />
                        </IconButton>

                        {/* Usamos Popper para controlar el posicionamiento */}
                        <Popper
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            placement="bottom"
                            modifiers={[
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [-120, 8], // Ajusta el desplazamiento (horizontal, vertical)
                                    },
                                },
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        boundary: 'window', // Evita que se salga de los bordes de la ventana
                                    },
                                },
                            ]}
                            sx={{
                                zIndex: 1300,
                                backgroundColor: 'white',
                                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px',
                                width: '100%',
                                maxWidth: '300px',
                                marginTop: '8px',
                            }}
                        >
                            {/* Buscador */}
                            <Box sx={{ padding: '8px', display: 'flex', alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar"
                                    variant="outlined"
                                    size="small"
                                    value={searchTerm2}
                                    onChange={(e) => setSearchTerm2(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            padding: '2px 8px',
                                            '& .MuiInputAdornment-root': {
                                                position: 'absolute',
                                                right: 0, // Lupa alineada a la derecha dentro del recuadro
                                                marginRight: '8px',
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <SearchIcon sx={{ color: '#7B354D', marginRight: 1 }} />
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchTerm2('')}
                                                    sx={{ color: '#7B354D' }}
                                                >
                                                    <img src={iconclose} alt="Limpiar" style={{ width: '16px', height: '16px' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        style: {
                                            height: '100%',
                                            textAlign: 'left',
                                            fontFamily: 'Poppins, sans-serif',
                                            fontSize: '16px',
                                            lineHeight: '25px',
                                            letterSpacing: '0px',
                                            color: '#7B354D',
                                            opacity: 1,
                                        },
                                    }}
                                />
                            </Box>

                            {/* Resultados de la lista de salas */}
                            <MenuList sx={{ paddingLeft: 0 }}>
                                {rooms
                                    .filter((room) =>
                                        room.name.toLowerCase().includes(searchTerm2.toLowerCase())
                                    )
                                    .map((room, index) => (
                                        <MenuItem
                                            key={index}
                                            onClick={() => handleRoomChange(room)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '8px 16px',
                                            }}
                                        >
                                            <img
                                                src={HouseIcon}
                                                alt="Room Icon"
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    marginRight: '10px',
                                                    color: '#574B4F',
                                                }}
                                            />
                                            <Box sx={{ textAlign: 'left' }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontSize: '12px',
                                                        color: '#000',
                                                        fontFamily: 'Poppins, sans-serif',
                                                    }}
                                                >
                                                    {room.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: '9px',
                                                        color: '#574B4F',
                                                        fontFamily: 'Poppins, sans-serif',
                                                    }}
                                                >
                                                    {room.description}
                                                </Typography>
                                            </Box>
                                        </MenuItem>
                                    ))}
                            </MenuList>
                        </Popper>


                    </Box>






                    {/* Usuario */}
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 2 }}>
                        {/* Ícono de usuario grande */}
                        <img
                            src={IconUser}
                            alt="User Icon"
                            style={{
                                width: '40px',  // Ajusta el tamaño si es necesario
                                height: '40px',
                            }}
                        />

                        {/* Ícono pequeño de la flecha (CHEVRON_USER) */}
                        <img
                            src={IconUserArrow}
                            alt="Chevron Icon"
                            style={{
                                position: 'absolute',
                                bottom: '2px', // Ajusta la posición para que quede sobre el icono grande
                                right: '2px',
                                width: '14px', // Tamaño de la flecha
                                height: '14px',
                                backgroundColor: '#B0B0B0', // Color de fondo si es necesario
                                borderRadius: '50%', // Para que sea redondo
                                padding: '2px', // Ajusta el espacio dentro del círculo
                                transition: 'transform 0.3s ease-in-out', // ✨ Animación suave
                                transform: anchorElUser ? 'rotate(180deg)' : 'rotate(0deg)',
                            }}
                        />
                    </IconButton>

                    {/* Nombre del usuario */}
                    <Typography variant="body2" sx={{ color: '#fff', marginLeft: '8px' }}>
                        {user.userName || 'Usuario'}
                    </Typography>
                    <Menu
                        anchorEl={anchorElUser}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                        sx={{
                            mt: 1,
                            '& .MuiMenuItem-root': {
                                padding: '8px 16px', // Reduce el padding interno superior e inferior
                                margin: 0, // Elimina márgenes entre los elementos
                            },
                            '& .MuiTypography-root': {
                                lineHeight: '1.2', // Ajusta la altura de línea para textos más compactos
                            },
                            '& .MuiMenu-paper': {
                                transform: 'translateX(-20px) !important', // 📌 Mueve el menú más a la izquierda
                            },
                        }}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={() => navigate('/ManageAccount')} sx={{
                            '&:hover': {
                                background: '#F2EBED 0% 0% no-repeat padding-box', // ✨ Efecto hover
                                opacity: 1,
                            },
                        }}>
                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    font: 'normal normal normal 14px/54px Poppins',
                                    letterSpacing: '0px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    fontSize: '14px',
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <EditIcon sx={{ fontSize: 20, mr: 1 }} />
                                    Editar cuenta
                                </Box>
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={() => navigate('/TermsAndConditions')} sx={{
                            '&:hover': {
                                background: '#F2EBED 0% 0% no-repeat padding-box', // ✨ Efecto hover
                                opacity: 1,
                            },
                        }}>
                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    font: 'normal normal normal 14px/54px Poppins',
                                    letterSpacing: '0px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    fontSize: '14px',
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <DescriptionIcon sx={{ fontSize: 20, mr: 1 }} />
                                    Términos y condiciones
                                </Box>
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{
                            '&:hover': {
                                background: '#F2EBED 0% 0% no-repeat padding-box', // ✨ Efecto hover
                                opacity: 1,
                            },
                        }}>
                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    font: 'normal normal normal 14px/54px Poppins',
                                    letterSpacing: '0px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    fontSize: '14px',
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <img
                                        src={CloseSession}
                                        alt="Room Icon"
                                        style={{
                                            width: '19px',
                                            height: '19px',
                                            marginRight: '10px',
                                            color: '#574B4F',
                                        }}
                                    />                                    Cerrar sesión
                                </Box>
                            </Typography>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>



            <Drawer variant="permanent" open={true} PaperProps={{ sx: { background: 'transparent linear-gradient(311deg, #0B0029 0%, #B9A0A8 100%) 0% 0% no-repeat padding-box;', color: 'white' } }}>
                <DrawerHeader />

                <Box
                    sx={{
                        position: 'relative', // Esto permite posicionar elementos absolutos dentro
                        background: '#FFFFFF', // Fondo blanco
                        border: '1px solid #DDD8DA',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '90%', // Mantener el ancho del contenedor principal
                        marginX: 'auto',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra general
                        marginTop: '10px',
                    }}
                >
                    {/* Contenedor para el encabezado y los botones */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between', // Asegura que los elementos se separen
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        {/* Créditos totales con sombra */}
                        <Box
                            sx={{
                                background: '#DDD8D933', // Fondo semitransparente
                                border: '1px solid #DDD8DA',
                                borderRadius: '8px',
                                padding: '12px',
                                width: '80%', // Más pequeño y pegado a la izquierda
                            }}
                        >
                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    fontFamily: 'Poppins',
                                    letterSpacing: '-0.5px',
                                    color: '#574B4F',
                                    opacity: 1,
                                    fontSize: '13px', // Esto asegura que el tamaño de fuente sea correcto
                                }}
                            >
                                Créditos Totales SMS
                            </Typography>

                            <Typography
                                sx={{
                                    textAlign: 'left',
                                    fontFamily: 'Poppins',
                                    letterSpacing: '0px',
                                    color: '#330F1B',
                                    opacity: 1,
                                    fontSize: '18px', // Estilo para los valores numéricos debajo
                                    marginBottom: '-8px'
                                }}
                            >
                                {selectedRoom?.credits || 0}
                            </Typography>

                            {/* Créditos cortos y largos */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px',
                                }}
                            >
                                <Box sx={{ textAlign: 'left', flex: 1 }}>
                                    <Typography
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            letterSpacing: '0px',
                                            color: '#574B4F',
                                            opacity: 1,
                                            fontSize: '12px', // Ajuste preciso del tamaño de fuente
                                            marginBottom: '8px'
                                        }}
                                    >
                                        # Cortos
                                    </Typography>
                                    <Typography
                                        //450
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            letterSpacing: '0px',
                                            color: '#330F1B',
                                            opacity: 1,
                                            marginBottom: '-1px',
                                            fontSize: '14px', // Estilo para los valores numéricos debajo
                                        }}
                                    >
                                        {selectedRoom?.short_sms || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'left', flex: 1 }}>
                                    <Typography
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            letterSpacing: '0px',
                                            color: '#574B4F',
                                            opacity: 1,
                                            fontSize: '12px', // Ajuste preciso del tamaño de fuente
                                        }}
                                    >
                                        # Largos
                                    </Typography>
                                    <Typography
                                        //320
                                        sx={{
                                            textAlign: 'left',
                                            fontFamily: 'Poppins',
                                            letterSpacing: '0px',
                                            color: '#330F1B',
                                            opacity: 1,
                                            marginTop: '7px',
                                            fontSize: '14px',
                                        }}
                                    >
                                        {selectedRoom?.long_sms || 0}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        {/* Contenedor para el botón redondo */}
                        {/* Contenedor para los dos botones (el de cambio y el dropdown) */}
                        <Box
                            sx={{
                                position: 'absolute', // Se posiciona en relación con el contenedor padre
                                top: '35%', // Lo centra verticalmente
                                right: '5px', // Se acerca al borde derecho
                                transform: 'translateY(-50%)', // Corrige la alineación exacta
                                display: 'flex',
                                flexDirection: 'column', // Asegura que los botones estén alineados en columna
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px', // Espacio entre los dos botones
                                zIndex: 10, // Asegura que no se quede detrás de otros elementos
                            }}
                        >
                            {/* Botón cuadrado con icono de cambio */}
                            <IconButton
                                sx={{
                                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                                    boxShadow: '2px 2px 2px #6C64741A', // Sombra según especificaciones
                                    border: '1px solid #C6BFC299', // Borde con el color exacto
                                    borderRadius: '8px', // Bordes redondeados pero no circulares
                                    padding: '10px', // Ajuste de espacio interno
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '44px', // Tamaño cuadrado acorde a la referencia
                                    height: '44px', // Misma altura para mantener la proporción
                                    opacity: 1, // Asegura visibilidad
                                    '&:hover': {
                                        background: '#EBE5E7 0% 0% no-repeat padding-box',
                                        boxShadow: '2px 2px 2px #6C64741A',
                                        border: '1px solid #D9C5CB',
                                        opacity: 1,
                                    },
                                    '&:active': {
                                        background: '#EBD9DF 0% 0% no-repeat padding-box',
                                        boxShadow: '2px 2px 2px #6C64741A',
                                        border: '1px solid #BE93A066',
                                        opacity: 1,
                                    },
                                }}
                            >
                                <Tooltip title="Mis Números">
                                    <img
                                        src={rentaNumerosUrl}
                                        alt="Renta Números"
                                        style={{ width: '30px', height: 'auto' }}
                                        onClick={() => navigate('/MyNumbers')}
                                    />
                                </Tooltip>
                            </IconButton>

                            {/* Botón de DropDown debajo */}
                            <IconButton
                                sx={{
                                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                                    boxShadow: '2px 2px 2px #6C64741A',
                                    border: '1px solid #C6BFC299',
                                    borderRadius: '8px',
                                    padding: '6px', // Espacio más pequeño
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '32px', // Tamaño más pequeño que el de arriba
                                    height: '32px',
                                    opacity: 1,
                                    marginTop: '20px',
                                    '&:hover': {
                                        background: '#EBE5E7 0% 0% no-repeat padding-box',
                                        boxShadow: '2px 2px 2px #6C64741A',
                                        border: '1px solid #D9C5CB',
                                        opacity: 1,
                                    },
                                    '&:active': {
                                        background: '#EBD9DF 0% 0% no-repeat padding-box',
                                        boxShadow: '2px 2px 2px #6C64741A',
                                        border: '1px solid #BE93A066',
                                        opacity: 1,
                                    },
                                }}
                                onClick={() => console.log("Dropdown clicked")}
                            >
                                <img src={DropDownIcon} alt="Dropdown Icon" style={{ width: '20px', height: 'auto', transform: 'rotate(90deg)' }} />
                            </IconButton>
                        </Box>

                    </Box>

                    {/* Botones Gestionar y Recargar */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            gap: '10px'
                        }}
                    >
                        <Button
                            variant="contained"
                            sx={{
                                textAlign: 'center',
                                font: 'normal normal 600 14px/20px Poppins',
                                fontFamily: 'Poppins',
                                color: '#833A53',
                                background: '#FFF',
                                borderRadius: '4px',
                                padding: '6px 16px',
                                boxShadow: 'none',
                                width: '109px',
                                height: '32px',
                                '&:hover': {
                                    background: '#F2E9EC 0% 0% no-repeat padding-box', // Color al pasar el mouse
                                    borderRadius: '4px', // Redondeo al hover
                                    opacity: 1, // Asegura que se vea correctamente
                                },
                                '&:active': {
                                    background: '#E6C2CD 0% 0% no-repeat padding-box', // Color al presionar
                                    border: '1px solid #BE93A0', // Borde definido
                                    borderRadius: '4px',
                                    opacity: 1,
                                },
                            }}
                            onClick={() => navigate('/CreditManagement')}
                        >
                            Gestionar
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                textAlign: 'center',
                                font: 'normal normal 600 14px/20px Poppins',
                                fontFamily: 'Poppins',
                                color: '#833A53',
                                background: '#FFF',
                                borderRadius: '4px',
                                padding: '6px 16px',
                                boxShadow: 'none',
                                width: '109px',
                                height: '32px',
                                '&:hover': {
                                    background: '#F2E9EC 0% 0% no-repeat padding-box', // Color al pasar el mouse
                                    borderRadius: '4px', // Redondeo al hover
                                    opacity: 1, // Asegura que se vea correctamente
                                },
                                '&:active': {
                                    background: '#E6C2CD 0% 0% no-repeat padding-box', // Color al presionar
                                    border: '1px solid #BE93A0', // Borde definido
                                    borderRadius: '4px',
                                    opacity: 1,
                                },
                            }}
                            onClick={() => navigate('/AccountRecharge')}
                        >
                            Recargar
                        </Button>
                    </Box>
                </Box>






                <List component="nav">
                    {/* Menú de Administración */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={handleSubMenuToggle} sx={{ borderRadius: '8px' }}>
                            <ListItemIcon sx={{ color: '#FFFFFF' }}>
                                <img alt="Iconpeople" src={Iconpeople} style={{ width: 40, height: 20, filter: "brightness(0) invert(1)" }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Administración"
                                primaryTypographyProps={{
                                    fontFamily: "Poppins",
                                    marginRight: "100%",
                                    color: '#FFFFFF',
                                }}
                            />
                            {openSubMenu ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={openSubMenu} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {/* Usuarios */}
                            <Link to="/UserAdministration" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemButton
                                    sx={{
                                        pl: 4,
                                        position: 'relative',
                                        '&.Mui-selected': {
                                            backgroundColor: '#290013',
                                            color: '#FFFFFF',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                backgroundColor: '#FFFFFF',
                                            },
                                        },
                                    }}
                                    selected={location.pathname === '/UserAdministration'}
                                >
                                    <ListItemText
                                        primary="Usuarios"
                                        primaryTypographyProps={{
                                            fontFamily: "Poppins",
                                            marginLeft: '48px',
                                            fontSize: '14px',
                                            color: '#FFFFFF',
                                            marginBottom: "-5px",
                                            marginTop: "-5px"
                                        }}
                                    />
                                </ListItemButton>
                            </Link>
                            {/* Salas */}
                            <Link to="/rooms" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemButton
                                    sx={{
                                        pl: 4,
                                        position: 'relative',
                                        '&.Mui-selected': {
                                            backgroundColor: '#290013',
                                            color: '#FFFFFF',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                backgroundColor: '#FFFFFF',
                                            },
                                        },
                                    }}
                                    selected={location.pathname === '/rooms'}
                                >

                                    <ListItemText
                                        primary="Salas"
                                        primaryTypographyProps={{
                                            fontFamily: "Poppins",
                                            marginLeft: '48px',
                                            fontSize: '14px',
                                            color: '#FFFFFF',
                                            marginBottom: "-5px",
                                            marginTop: "-5px"
                                        }}
                                    />
                                </ListItemButton>
                            </Link>
                        </List>
                    </Collapse>
                    {/* Menú de SMS */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setOpenSubMenuNumbers(!openSubMenuNumbers)} sx={{ borderRadius: '8px' }}>
                            <img alt="Iconmesage" src={Iconmesage} style={{ width: 50, height: 20 }} />
                            <ListItemText
                                primary="SMS"
                                primaryTypographyProps={{
                                    fontFamily: "Poppins",
                                    marginLeft: "5px",
                                    color: '#FFFFFF',
                                }}
                            />
                            {openSubMenuNumbers ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={openSubMenuNumbers} timeout="auto">
                        <List component="div" disablePadding>
                            <ListItemButton sx={{ pl: 4, marginTop: "-5px", marginBottom: "-5px" }} onClick={() => navigate('/sms')}>

                                <ListItemText
                                    primary="Configuración SMS"
                                    primaryTypographyProps={{
                                        fontFamily: "Poppins",
                                        marginLeft: '48px',
                                        fontSize: '14px',
                                        color: '#FFFFFF',
                                        marginBottom: "-5px",
                                        marginTop: "-5px"
                                    }}
                                />
                            </ListItemButton>
                        </List>
                    </Collapse>

                    {/* Menú de Reportes */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/reports')} sx={{ borderRadius: '8px' }}>
                            <img alt="Iconreports" src={Iconreports} style={{ width: 50, height: 20, transform: "rotate(-90deg)" }} />
                            <ListItemText
                                primary="Reportes"
                                primaryTypographyProps={{
                                    fontFamily: "Poppins",
                                    marginLeft: "5px",
                                    color: '#FFFFFF',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>

                    {/* Menú de Facturación */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => setOpenSubMenuBilling(!openSubMenuBilling)} sx={{ borderRadius: '8px' }}>
                            <img alt="Iconfacturation" src={Iconfacturation} style={{ width: 50, height: 20 }} />
                            <ListItemText
                                primary="Facturación"
                                primaryTypographyProps={{
                                    fontFamily: "Poppins",
                                    marginLeft: "5px",
                                    color: '#FFFFFF',
                                }}
                            />
                            {openSubMenuBilling ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                    </ListItem>
                    <Collapse in={openSubMenuBilling} timeout="auto">
                        <List component="div" disablePadding>
                            {pages[3].subMenus.map((subMenu) => (
                                <ListItemButton key={subMenu.id} sx={{ pl: 4 }} onClick={() => navigate(subMenu.path)}>

                                    <ListItemText
                                        primary={subMenu.title}
                                        primaryTypographyProps={{
                                            fontFamily: "Poppins",
                                            marginLeft: '48px',
                                            fontSize: '14px',
                                            color: '#FFFFFF',
                                            marginBottom: "-5px",
                                            marginTop: "-5px"
                                        }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>

                    {/* Menú de Ayuda */}
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate('/help')} sx={{ borderRadius: '8px' }}>
                            <img alt="Iconhelpu" src={Iconhelpu} style={{ width: 50, height: 20, filter: "brightness(0) invert(1)" }} />
                            <ListItemText
                                primary="Ayuda"
                                primaryTypographyProps={{
                                    fontFamily: "Poppins",
                                    marginLeft: "5px",
                                    color: '#FFFFFF',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                </List>


            </Drawer >
            <Container
                fixed
                maxWidth="xl"
                sx={{
                    marginLeft: `${drawerWidth}px`, // Respeta el ancho del Drawer
                    marginTop: '5px', // Ajusta la altura de la AppBar (64px es el alto estándar)
                    paddingBottom: '16px', // Opcional: espacio extra para evitar superposición con el footer
                }}
            >
                <Box sx={{ height: '4.5rem' }} />
                {props.children}
            </Container>
            <footer>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        width: '100%',
                        padding: '16px',
                        borderTop: '1px solid #E6E4E4',
                        background: '#FFFFFF',
                        zIndex: 1200,
                    }}
                >
                    <Typography variant="caption" color="textSecondary">
                        {'Copyright © '}
                        {new Date().getFullYear()}
                        {' Nuxiba. Todos los derechos reservados. Se prohíbe el uso no autorizado.'}
                    </Typography>
                    <img src={nuxiba_svg} alt="Nuxiba Logo" width="80" />

                </Box>
            </footer>
            {/* Modal de ayuda */}
            <Modal
                open={helpModalIsOpen}
                onClose={closeHelpModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                sx={{
                    backdropFilter: "blur(4px)", // Fondo desenfocado
                    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo gris semitransparente
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "90%",
                        maxWidth: "600px",
                        maxHeight: "550px",
                        bgcolor: "background.paper",
                        borderRadius: "10px",
                        boxShadow: 24,
                        p: 3,
                    }}
                >
                    <Typography
                        id="modal-title"
                        sx={{
                            textAlign: "left",
                            font: "normal normal medium 26px/55px Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            fontSize: "26px",
                            mb: 1,
                        }}
                    >
                        Ayuda
                    </Typography>

                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "#E0E0E0",
                            my: 1,
                        }}
                    />

                    <Typography
                        id="modal-description"
                        sx={{
                            textAlign: "left",
                            font: "normal normal medium 18px/22px Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            fontSize: "18px", // Tamaño ajustado a 18px
                            marginBottom: "10px",
                        }}
                    >
                        Por favor, contáctenos:
                    </Typography>

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}> {/* Reducir espacio entre columnas */}
                        {/* Horarios de atención */}
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal medium 16px/54px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5, // Reducir margen inferior
                                }}
                            >
                                Horarios de atención
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                    mb: 0.5, // Reducir margen entre elementos
                                }}
                            >
                                Lunes a viernes
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                }}
                            >
                                Teléfono: 55 1107 8510 Opción 3
                            </Typography>
                        </Box>

                        {/* Línea de emergencia */}
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal medium 16px/54px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5, // Reducir margen inferior
                                }}
                            >
                                Línea de emergencia
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins", // Reducir espacio entre líneas
                                    color: "#574B4F",
                                    mb: 0.5, // Reducir margen entre elementos
                                }}
                            >
                                Lunes a viernes 21:00-07:00
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                }}
                            >
                                Teléfono: 55 5437 6175
                            </Typography>
                        </Box>
                    </Box>

                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                Sábado
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                9:00-18:00 CST
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                }}
                            >
                                Teléfono: 55 1107 8510 Opción 3
                            </Typography>
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                Sábado y domingo
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                }}
                            >
                                Teléfono: 55 5437 6175
                            </Typography>
                        </Box>
                    </Box>

                    {/* Línea horizontal */}
                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Box>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                                mb: 0.5,
                            }}
                        >
                            Domingo
                        </Typography>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                                mb: 0.5,
                            }}
                        >
                            9:00-15:00 CST
                        </Typography>
                        <Typography
                            sx={{
                                font: "normal normal normal 14px/20px Poppins",
                                color: "#574B4F",
                            }}
                        >
                            Teléfono: 55 1107 8510 Opción 3
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            borderBottom: "1px solid #E6E4E4",
                            my: 1,
                        }}
                    />

                    <Typography
                        sx={{
                            font: "normal normal medium 16px/54px Poppins",
                            color: "#574B4F",
                            mb: 1,
                        }}
                    >
                        Soporte: cwsoporte@nuxiba.com
                    </Typography>

                    <Box sx={{ textAlign: "right", mt: 2 }}>
                        <Button
                            onClick={closeHelpModal}
                            variant="contained"
                            color="primary"
                            sx={{
                                font: "normal normal medium 26px/55px Poppins",
                                backgroundColor: "#833A53",
                                color: "#FFFFFF",
                                borderRadius: "8px",
                                padding: "6px 16px",
                                "&:hover": {
                                    backgroundColor: "#A54261",
                                },
                            }}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}

export default PublicLayoutOpenPay;
