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
    Popper,
    Fab,
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
import facturicone from '../assets/facturicone.svg';
import Iconhelpu from '../assets/Iconhelpu.svg';
import logorq from '../assets/Logo-RQ_2.svg';
import PrivacityIcon from '../assets/Icon_privacidad.svg'
import api from '../assets/api.svg'
import apihover from '../assets/apihover.svg'
import { useLocation } from 'react-router-dom';

const drawerWidth = 278;

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
        id: 2, title: 'Administración', path: '', icon: <img src={Iconpeople} alt="Administración" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />, hasSubMenus: true, subMenus: [
            { id: 1, title: 'Salas', path: '/rooms', icon: <HomeIcon sx={{ color: 'white' }} /> },
        ]
    },
    {
        id: 3, title: 'Facturación', path: '/billing', icon: <img src={facturicone} alt="Facturación" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />, hasSubMenus: true, subMenus: [
            { id: 1, title: 'Historial de pagos', path: '/PaymentHistoric', icon: <HistoryIcon sx={{ color: 'white' }} /> },
            { id: 2, title: 'Métodos de pago', path: '/PaymentMethods', icon: <PaymentIcon sx={{ color: 'white' }} /> },
            { id: 3, title: 'Facturación', path: '/BillingInformation', icon: <DataUsageIcon sx={{ color: 'white' }} /> },
            { id: 4, title: 'Costos', path: '/Costs', icon: <AttachMoneyIcon sx={{ color: 'white' }} /> },
            { id: 5, title: 'Ajustes de pago', path: '/PaymentSettings', icon: <SettingsSuggestIcon sx={{ color: 'white' }} /> },
        ]
    },
    { id: 4, title: 'Reportes', path: '/Reports', icon: <img src={Iconreports} alt="Reportes" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />, hasSubMenus: false, subMenus: [] },
    {
        id: 5,
        title: 'SMS',
        path: '/numbers',
        icon: <img src={Iconmesage} alt="SMS" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />,
        hasSubMenus: true,
        subMenus: [
            { id: 1, title: 'Campañas', path: '/campains', icon: undefined },
            { id: 2, title: 'Plantillas', path: '/templates', icon: undefined },
            { id: 3, title: 'Prueba SMS', path: '/sms-test', icon: undefined },
            { id: 4, title: 'Listas Negras', path: '/blacklists', icon: undefined },
            { id: 5, title: 'Configuración SMS', path: '/sms', icon: undefined }
        ]
    },
    { id: 6, title: 'Ayuda', path: '/help', icon: <img src={Iconhelpu} alt="Ayuda" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />, hasSubMenus: false, subMenus: [] },


    { id: 7, title: 'Editar cuenta', path: '/ManageAccount', icon: <EditIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 8, title: 'Administrar cuentas', path: '/UserAdministration', icon: <PeopleAltIcon sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
    { id: 9, title: 'Cerrar sesión', path: '', icon: <Avatar sx={{ color: 'white' }} />, hasSubMenus: false, subMenus: [] },
];

type Room = {
    id: string | number;
    name: string;
    client: string;
    description: string;
    credits: number;
    long_sms: number;
    calls: number;
    short_sms: number;
};
type FlattenedPage = {
    id: string | number;
    title: string;
    path: string;
    icon: React.ReactNode;
    hasSubMenus: boolean;
    subMenus: SubMenu[];
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



const NavBarAndDrawer: React.FC<Props> = props => {
    const [searchOpen, setSearchOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredPages, setFilteredPages] = useState<Page[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchTerm2, setSearchTerm2] = useState('');
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { contextState, setContextState } = useContext(AppContext)
    const { user } = contextState
    const [helpModalIsOpen, setHelpModalIsOpen] = useState(false);
    const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
    const [selectedLink, setSelectedLink] = useState<string | null>(null);
    const [isHoveringApi, setIsHoveringApi] = useState(false);
    const location = useLocation();
    const [userMenu, setUserMenu] = useState(null);
    const handleSelection = (link: string) => {
        setSelectedLink(link); // Cambia el enlace seleccionado
    };


    const closeHelpModal = () => setHelpModalIsOpen(false);


    const handleLogout = () => {
        // Limpiar localStorage y sessionStorage
        localStorage.clear();
        sessionStorage.clear();

        // Redirigir al login
        navigate('/login');
    };

    const fetchRoomsAndDispatch = async () => {
        const usuario = localStorage.getItem("userData");
        const obj = usuario ? JSON.parse(usuario) : null;

        if (!obj?.email) return;

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GetRooms}?email=${obj.email}`;
            const response = await fetch(request);

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("ListRooms", JSON.stringify(data));
                window.dispatchEvent(new Event("roomsUpdate"));
            }
        } catch (error) {
            console.error("Error al obtener salas desde layout:", error);
        }
    };

    useEffect(() => {
        const loadSelectedRoom = () => {
            const currentRoom = localStorage.getItem('selectedRoom');
            if (currentRoom) {
                try {
                    const room = JSON.parse(currentRoom);
                    setSelectedRoom(room);
                } catch (error) {
                    console.error('Error al parsear la sala seleccionada desde localStorage', error);
                }
            }
        };

        loadSelectedRoom();

        const handleStorageUpdate = () => {
            loadSelectedRoom();
        };

        window.addEventListener('storageUpdate', handleStorageUpdate);

        return () => {
            window.removeEventListener('storageUpdate', handleStorageUpdate);
        };
    }, []);

    useEffect(() => {
        fetchRoomsAndDispatch();
    }, []);

    useEffect(() => {
        const updateRooms = () => {
            const storedRooms = localStorage.getItem('ListRooms');
            if (storedRooms) {
                try {
                    const parsedRooms = JSON.parse(storedRooms);
                    if (Array.isArray(parsedRooms)) {
                        setRooms(parsedRooms);
                    }
                } catch (error) {
                    console.error("Error actualizando rooms desde localStorage", error);
                }
            }
        };

        window.addEventListener('roomsUpdate', updateRooms);

        return () => {
            window.removeEventListener('roomsUpdate', updateRooms);
        };
    }, []);


    useEffect(() => {
        const results: Page[] = pages
            .flatMap((page) => {
                if (!page.hasSubMenus) {
                    return [page];
                } else {
                    return page.subMenus.map((sub, index) => ({
                        id: Number(`${page.id}${index}`), // ID numérico único
                        title: sub.title,
                        path: sub.path,
                        icon: sub.icon || page.icon,
                        hasSubMenus: false,
                        subMenus: [], // necesario para cumplir el tipo Page
                    }));
                }
            })
            .filter((item) =>
                searchTerm && item.title.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                const search = searchTerm.toLowerCase();
                const aTitle = a.title.toLowerCase();
                const bTitle = b.title.toLowerCase();

                const aStartsWith = aTitle.startsWith(search);
                const bStartsWith = bTitle.startsWith(search);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                return aTitle.localeCompare(bTitle);
            });

        setFilteredPages(results);
    }, [searchTerm]);

    useEffect(() => {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const user = JSON.parse(userDataString);
            setUserMenu(user.idRole);
        }
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        if (anchorEl) {
            setAnchorEl(null);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    //const handleMenuClose = () => {
    //    setAnchorEl(null);
    //};


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


    const toggleSubMenu = (menu: string) => {
        setActiveSubMenu((prev) => (prev === menu ? null : menu));
    };

    const handleDownload = async () => {
        const response = await fetch("/RedQuantum/Files/Documentacion_API_RedQuantum.pdf");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Documentacion_API_RedQuantum.pdf";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="fixed" sx={{ bgcolor: '#290013' }}>
                <Toolbar>
                    {/* Sección Izquierda */}
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={() => navigate("/")}
                        >
                            <img src={logorq} alt="App Icon" width="170" />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                            marginRight: '50px',
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
                                    border: '1px solid #7B354D',
                                    height: '40px',
                                    width: '300px',
                                }}
                            >
                                {/* Campo de texto para búsqueda */}
                                <TextField
                                    
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
                                                            color: '#7B354D',
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
                                transform: anchorEl ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease-in-out',
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
                                        offset: [-120, 8],
                                    },
                                },
                                {
                                    name: 'preventOverflow',
                                    options: {
                                        boundary: 'window',
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
                                                right: 0,
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
                                width: '40px',
                                height: '40px',
                            }}
                        />

                        {/* Ícono pequeño de la flecha (CHEVRON_USER) */}
                        <img
                            src={IconUserArrow}
                            alt="Chevron Icon"
                            style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                width: '14px',
                                height: '14px',
                                backgroundColor: '#B0B0B0',
                                borderRadius: '50%',
                                padding: '2px',
                                transition: 'transform 0.3s ease-in-out',
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
                                padding: '8px 16px',
                                margin: 0,
                            },
                            '& .MuiTypography-root': {
                                lineHeight: '1.2',
                            },
                            '& .MuiMenu-paper': {
                                transform: 'translateX(-20px) !important',
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
                                background: '#F2EBED 0% 0% no-repeat padding-box',
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
                                background: '#F2EBED 0% 0% no-repeat padding-box',
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
                        <MenuItem onClick={() => navigate('/PrivacyNotice')} sx={{
                            '&:hover': {
                                background: '#F2EBED 0% 0% no-repeat padding-box',
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
                                    <img src={PrivacityIcon} alt="Privacidad" style={{ width: 20, height: 20, marginRight: 8 }} />
                                    Aviso de privacidad
                                </Box>
                            </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{
                            '&:hover': {
                                background: '#F2EBED 0% 0% no-repeat padding-box',
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



            <Drawer variant="permanent" open={true} PaperProps={{ sx: { background: 'transparent linear-gradient(311deg, #0B0029 0%, #B9A0A8 100%) 0% 0% no-repeat padding-box;', color: 'white', } }}>
                <DrawerHeader />
                {(userMenu === 3 || userMenu === 4 || userMenu === 5) && (

                    <Box
                        sx={{
                            position: 'relative',
                            background: '#FFFFFF',
                            border: '1px solid #DDD8DA',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            width: '90%',
                            marginX: 'auto',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            marginTop: '10px',
                        }}
                    >
                        {/* Contenedor para el encabezado y los botones */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                            }}
                        >
                            {/* Créditos totales con sombra */}
                            <Box
                                sx={{
                                    background: '#DDD8D933',
                                    border: '1px solid #DDD8DA',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    width: '80%',
                                }}
                            >
                                <Typography
                                    sx={{
                                        textAlign: 'left',
                                        fontFamily: 'Poppins',
                                        letterSpacing: '-0.5px',
                                        color: '#574B4F',
                                        opacity: 1,
                                        fontSize: '15px',
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
                                        fontSize: '18px',
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
                                                fontSize: '14px',
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
                                                marginBottom: '-4px',
                                                fontSize: '16px',
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
                                                fontSize: '15px',
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
                                                fontSize: '16px',
                                                marginBottom: '-4px',
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
                                    position: 'absolute',
                                    top: '35%',
                                    right: '5px',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    zIndex: 10,
                                }}
                            >
                                {/* Botón cuadrado con icono de cambio */}
                                <IconButton
                                    sx={{
                                        background: '#FFFFFF 0% 0% no-repeat padding-box',
                                        boxShadow: '2px 2px 2px #6C64741A',
                                        border: '1px solid #C6BFC299',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '44px',
                                        height: '44px',
                                        opacity: 1,
                                        '&:hover': {
                                            background: '#BE93A066 0% 0% no-repeat padding-box',
                                            boxShadow: '2px 2px 2px #6C64741A',
                                            border: '1px solid #D9C5CB',
                                            opacity: 1,
                                        },
                                        '&:active': {
                                            background: '#312D2E 0% 0% no-repeat padding-box',
                                            boxShadow: '0px 8px 16px #837C7C7A',
                                            border: '1px solid #BE93A066',
                                            opacity: 1,
                                        },
                                    }}
                                >
                                    <Tooltip title="Mis números"
                                        placement="top"
                                        arrow

                                        PopperProps={{
                                            modifiers: [
                                                {
                                                    name: 'arrow',
                                                    options: {
                                                        padding: 8,
                                                    },
                                                },
                                            ],
                                        }}
                                        componentsProps={{
                                            tooltip: {
                                                sx: {
                                                    fontFamily: 'Poppins',
                                                    backgroundColor: '#322D2E',
                                                    color: '#DEDADA',
                                                    fontSize: '12px',
                                                    borderRadius: '4px',
                                                    padding: '6px 10px',
                                                },
                                            },
                                            arrow: {
                                                sx: {
                                                    color: '#322D2E',
                                                },
                                            },
                                        }}

                                    >

                                        <img
                                            src={rentaNumerosUrl}
                                            alt="Renta Números"
                                            style={{ width: '39px', height: '38px', }}
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
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
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
                                        background: '#F2E9EC 0% 0% no-repeat padding-box',
                                        borderRadius: '4px',
                                        opacity: 1,
                                    },
                                    '&:active': {
                                        background: '#E6C2CD 0% 0% no-repeat padding-box',
                                        border: '1px solid #BE93A0',
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
                                        background: '#F2E9EC 0% 0% no-repeat padding-box',
                                        borderRadius: '4px',
                                        opacity: 1,
                                    },
                                    '&:active': {
                                        background: '#E6C2CD 0% 0% no-repeat padding-box',
                                        border: '1px solid #BE93A0',
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
                )}
                {/*Comienzo del fondo para opciones*/}
                <Box
                    sx={{
                        position: "relative",
                        left: "17px",
                        height: "auto",
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: "auto",
                        marginTop: "25px",
                        width: "245px",
                        borderRadius: "6px",
                        borderColor: "#5F5064",
                        backgroundColor: "#5A4A63CC",
                    }}>

                    {userMenu === 1 ? (

                        <List component="nav">
                            {/* Menú de Administración */}
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => toggleSubMenu('administracion')} sx={{ borderRadius: '8px' }}>
                                    <ListItemIcon sx={{ color: '#FFFFFF' }}>
                                        <img alt="Iconpeople" src={Iconpeople} style={{ width: 35, height: 20, filter: "brightness(0) invert(1)" }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Administración"
                                        primaryTypographyProps={{
                                            fontFamily: "Poppins",
                                            marginBottom: "-2px",
                                            color: '#FFFFFF',
                                            marginLeft: "-15px"
                                        }}
                                    />
                                    {activeSubMenu === 'administracion' ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                            </ListItem>
                            <Collapse in={activeSubMenu === 'administracion'} timeout="auto">
                                <List component="div" disablePadding>
                                    {/* Usuarios */}
                                    <Link to="/Clients" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                            selected={location.pathname === '/Clients'}
                                            onClick={() => handleSelection('Clients')}
                                        >

                                            {/*Linea Gris*/}
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: "35px",
                                                    width: "4px",
                                                    height: "35px",
                                                    backgroundColor: selectedLink === 'Clients' ? '#FFFFFF' : '#9F94A5',
                                                }} />

                                            <ListItemText
                                                primary="Clients"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginLeft: '30px',
                                                    fontSize: '14px',
                                                    color: selectedLink === 'Clients' ? '#FFFFFF' : '#9F94A5',
                                                    marginBottom: "-5px",
                                                    marginTop: "-5px"
                                                }}
                                            />
                                        </ListItemButton>
                                    </Link>
                                    {/* Salas */}
                                    <Link to="/RoomsAdmin" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                            selected={location.pathname === '/RoomsAdmin'}
                                            onClick={() => handleSelection('RoomsAdmin')}
                                        >

                                            {/*Linea Gris*/}
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    left: "35px",
                                                    width: "4px",
                                                    height: "35px",
                                                    backgroundColor: selectedLink === 'RoomsAdmin' ? '#FFFFFF' : '#9F94A5',
                                                }} />

                                            <ListItemText
                                                primary="Salas"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginLeft: '30px',
                                                    fontSize: '14px',
                                                    color: selectedLink === 'RoomsAdmin' ? '#FFFFFF' : '#9F94A5',
                                                    marginBottom: "-5px",
                                                    marginTop: "-5px"
                                                }}
                                            />
                                        </ListItemButton>
                                    </Link>
                                </List>
                            </Collapse>

                            {/* Menú de Reportes */}
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => navigate('/ReportsAdmin')} sx={{ borderRadius: '8px' }}>
                                    <img alt="Iconreports" src={Iconreports} style={{ width: 35, height: 20, transform: "rotate(-90deg)" }} />
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
                        </List>
                    ) : (
                        userMenu === 2 ? (
                            <List component="nav">
                                {/* Menú de Administración */}
                                <ListItem disablePadding>
                                    <ListItemButton onClick={() => toggleSubMenu('administracion')} sx={{ borderRadius: '8px' }}>
                                        <ListItemIcon sx={{ color: '#FFFFFF' }}>
                                            <img alt="Iconpeople" src={Iconpeople} style={{ width: 35, height: 20, filter: "brightness(0) invert(1)" }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Administración"
                                            primaryTypographyProps={{
                                                fontFamily: "Poppins",
                                                marginBottom: "-2px",
                                                color: '#FFFFFF',
                                                marginLeft: "-15px"
                                            }}
                                        />
                                        {activeSubMenu === 'administracion' ? <ExpandLess /> : <ExpandMore />}
                                    </ListItemButton>
                                </ListItem>
                                <Collapse in={activeSubMenu === 'administracion'} timeout="auto">
                                    <List component="div" disablePadding>
                                        {/* Usuarios */}
                                        <Link to="/NumbersDids" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/NumbersDids'}
                                                onClick={() => handleSelection('NumbersDids')}
                                            >

                                                {/*Linea Gris*/}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'NumbersDids' ? '#FFFFFF' : '#9F94A5',
                                                    }} />

                                                <ListItemText
                                                    primary="Numeros DIDs"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'NumbersDids' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }}
                                                />
                                            </ListItemButton>
                                        </Link>
                                    </List>
                                </Collapse>

                            </List>
                        ) :
                            (
                                <List component="nav">
                                    {/* Menú de Administración */}
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => toggleSubMenu('administracion')} sx={{ borderRadius: '8px' }}>
                                            <ListItemIcon sx={{ color: '#FFFFFF' }}>
                                                <img alt="Iconpeople" src={Iconpeople} style={{ width: 35, height: 20, filter: "brightness(0) invert(1)" }} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Administración"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginBottom: "-2px",
                                                    color: '#FFFFFF',
                                                    marginLeft: "-15px"
                                                }}
                                            />
                                            {activeSubMenu === 'administracion' ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={activeSubMenu === 'administracion'} timeout="auto">
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
                                                    onClick={() => handleSelection('Usuarios')}
                                                >

                                                    {/*Linea Gris*/}
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            left: "35px",
                                                            width: "4px",
                                                            height: "35px",
                                                            backgroundColor: selectedLink === 'Usuarios' ? '#FFFFFF' : '#9F94A5',
                                                        }} />

                                                    <ListItemText
                                                        primary="Usuarios"
                                                        primaryTypographyProps={{
                                                            fontFamily: "Poppins",
                                                            marginLeft: '30px',
                                                            fontSize: '14px',
                                                            color: selectedLink === 'Usuarios' ? '#FFFFFF' : '#9F94A5',
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
                                                    onClick={() => handleSelection('Salas')}
                                                >

                                                    {/*Linea Gris*/}
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            left: "35px",
                                                            width: "4px",
                                                            height: "35px",
                                                            backgroundColor: selectedLink === 'Salas' ? '#FFFFFF' : '#9F94A5',
                                                        }} />

                                                    <ListItemText
                                                        primary="Salas"
                                                        primaryTypographyProps={{
                                                            fontFamily: "Poppins",
                                                            marginLeft: '30px',
                                                            fontSize: '14px',
                                                            color: selectedLink === 'Salas' ? '#FFFFFF' : '#9F94A5',
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
                                        <ListItemButton onClick={() => toggleSubMenu('sms')} sx={{ borderRadius: '8px' }}>
                                            <img alt="Iconmesage" src={Iconmesage} style={{ width: 35, height: 20 }} />
                                            <ListItemText
                                                primary="SMS"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginLeft: "4px",
                                                    marginBottom: "-2px",
                                                    color: '#FFFFFF',
                                                }}
                                            />
                                            {activeSubMenu === 'sms' ? <ExpandLess /> : <ExpandMore />}                            </ListItemButton>
                                    </ListItem>
                                    <Collapse in={activeSubMenu === 'sms'} timeout="auto">
                                        {/* Campañas */}
                                        <Link to="/Campains" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Campains'}
                                                onClick={() => handleSelection('Campañas')}
                                            >

                                                {/*Linea Gris*/}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Campañas' ? '#FFFFFF' : '#9F94A5',
                                                    }} />

                                                <ListItemText
                                                    primary="Campañas"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Campañas' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }}
                                                />
                                            </ListItemButton>
                                        </Link>
                                        {/* Plantillas */}
                                        <Link to="/Templates" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Templates'}
                                                onClick={() => handleSelection('Plantillas')}
                                            >

                                                {/*Linea Gris*/}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Plantillas' ? '#FFFFFF' : '#9F94A5',
                                                    }} />

                                                <ListItemText
                                                    primary="Plantillas"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Plantillas' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }}
                                                />
                                            </ListItemButton>
                                        </Link>
                                        {/* Pruebas SMS */}
                                        <Link to="/TestSMS" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/TestSMS'}
                                                onClick={() => handleSelection('Prueba SMS')}
                                            >

                                                {/*Linea Gris*/}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Prueba SMS' ? '#FFFFFF' : '#9F94A5',
                                                    }} />

                                                <ListItemText
                                                    primary="Prueba SMS"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Prueba SMS' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }}
                                                />
                                            </ListItemButton>
                                        </Link>
                                        {/* Listas Negras */}
                                        <Link to="/BlackList" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/BlackList'}
                                                onClick={() => handleSelection('Listas Negras')}
                                            >

                                                {/*Linea Gris*/}
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Listas Negras' ? '#FFFFFF' : '#9F94A5',
                                                    }} />

                                                <ListItemText
                                                    primary="Listas Negras"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Listas Negras' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }}
                                                />
                                            </ListItemButton>
                                        </Link>



                                    </Collapse>

                                    {/* Menú de Reportes */}
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate('/reports')} sx={{ borderRadius: '8px' }}>
                                            <img alt="Iconreports" src={Iconreports} style={{ width: 35, height: 20, transform: "rotate(-90deg)" }} />
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
                                        <ListItemButton onClick={() => toggleSubMenu('facturacion')} sx={{ borderRadius: '8px' }}>
                                            <img alt="facturicone" src={facturicone} style={{ width: 35, height: 20 }} />
                                            <ListItemText
                                                primary="Facturación"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginLeft: "6px",
                                                    marginBottom: "-2px",
                                                    color: '#FFFFFF',
                                                }}
                                            />
                                            {activeSubMenu === 'facturacion' ? <ExpandLess /> : <ExpandMore />}
                                        </ListItemButton>
                                    </ListItem>
                                    <Collapse in={activeSubMenu === 'facturacion'} timeout="auto">
                                        {/* Historial de pagos */}
                                        <Link to="/Paymenthistoric" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Paymenthistoric'}
                                                onClick={() => handleSelection('Historial de pagos')}
                                            >
                                                {/*Linea Gris*/}

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Historial de pagos' ? '#FFFFFF' : '#9F94A5',
                                                    }} />
                                                <ListItemText
                                                    primary="Historial de pagos"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Historial de pagos' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }} />
                                            </ListItemButton>
                                        </Link>
                                        {/* Métodos de pago */}
                                        <Link to="/Paymentmethods" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Paymentmethods'}
                                                onClick={() => handleSelection('Métodos de pago')}
                                            >
                                                {/*Linea Gris*/}

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Métodos de pago' ? '#FFFFFF' : '#9F94A5',
                                                    }} />
                                                <ListItemText
                                                    primary="Métodos de pago"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Métodos de pago' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }} />
                                            </ListItemButton>
                                        </Link>

                                        {/* Ajustes de Pago */}
                                        <Link to="/Paymentsettings" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Paymentsettings'}
                                                onClick={() => handleSelection('Ajustes de pago')}
                                            >
                                                {/*Linea Gris*/}

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Ajustes de pago' ? '#FFFFFF' : '#9F94A5',
                                                    }} />
                                                <ListItemText
                                                    primary="Ajustes de pago"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }} />
                                            </ListItemButton>
                                        </Link>



                                        {/* Costos */}
                                        <Link to="/Costs" style={{ textDecoration: 'none', color: 'inherit' }}>
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
                                                selected={location.pathname === '/Costs'}
                                                onClick={() => handleSelection('Costos')}
                                            >
                                                {/*Linea Gris*/}

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        left: "35px",
                                                        width: "4px",
                                                        height: "35px",
                                                        backgroundColor: selectedLink === 'Costos' ? '#FFFFFF' : '#9F94A5',
                                                    }} />
                                                <ListItemText
                                                    primary="Costos"
                                                    primaryTypographyProps={{
                                                        fontFamily: "Poppins",
                                                        marginLeft: '30px',
                                                        fontSize: '14px',
                                                        color: selectedLink === 'Costos' ? '#FFFFFF' : '#9F94A5',
                                                        marginBottom: "-5px",
                                                        marginTop: "-5px"
                                                    }} />
                                            </ListItemButton>
                                        </Link>







                                    </Collapse>



                                    {/* Menú de Ayuda */}
                                    <ListItem disablePadding>
                                        <ListItemButton onClick={() => navigate('/help')} sx={{ borderRadius: '8px' }}>
                                            <img alt="Iconhelpu" src={Iconhelpu} style={{ width: 35, height: 20, filter: "brightness(0) invert(1)" }} />
                                            <ListItemText
                                                primary="Ayuda"
                                                primaryTypographyProps={{
                                                    fontFamily: "Poppins",
                                                    marginLeft: "6px",
                                                    color: '#FFFFFF',
                                                }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            )
                    )

                    }

                    {/* Final del fondo para opciones */}
                </Box>
            </Drawer >
            <Container

                maxWidth={false}
                disableGutters
                sx={{
                    width: '81.7%',
                    height: '100%',
                    overflowX: 'hidden',
                    overflowY: 'hidden',
                    overflow: 'hidden',
                    margin: 0,
                    marginLeft: "277px",
                    marginTop: "70px",
                    padding: 0,
                    backgroundColor: '#F2F2F2',
                    display: 'flex',
                    flexDirection: 'column',
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
                            {location.pathname === '/' && (
                    <Fab
                        aria-label="help"
                        onClick={handleDownload}
                        sx={{
                            position: "fixed",
                            bottom: 70,
                            right: 30,
                            zIndex: 1500,
                            width: "60px",
                            height: "60px",
                            backgroundColor: "#FFFFFF",
                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                            border: "1px solid #D9C5CB",
                            "&:hover": {
                                background: "#EBE5E7 0% 0% no-repeat padding-box",
                                boxShadow: "0px 8px 16px #00131F14",
                                border: "1px solid #D9C5CB",
                            },
                        }}
                    >

                
                            <Tooltip
                                title="Descargar API"
                                arrow
                                placement="top"
                                sx={{
                                    "& .MuiTooltip-tooltip": {
                                        backgroundColor: "#330F1B",
                                        color: "#FFFFFF",
                                        fontSize: "12px",
                                        fontFamily: "Poppins, sans-serif",
                                        fontWeight: "medium",
                                    },
                                    "& .MuiTooltip-arrow": {
                                        color: "#330F1B",
                                    },
                                }}
                            >

                                <div
                                    onClick={handleDownload}
                                    onMouseEnter={() => setIsHoveringApi(true)}
                                    onMouseLeave={() => setIsHoveringApi(false)}
                                    style={{
                                        position: "fixed",
                                        bottom: "70px",
                                        right: "30px",
                                        width: "80px",
                                        height: "80px",
                                        cursor: "pointer",
                                        zIndex: 1500,
                                    }}
                                >
                                    {/* Imagen base */}
                                    <img
                                        src={api}
                                        alt="Ícono de api"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                            objectFit: "contain",
                                            display: "block",
                                        }}
                                    />

                                    {/* Overlay rosita */}
                                    {isHoveringApi && (
                                        <div
                                            style={{
                                                marginTop: "15px",
                                                marginLeft: "18px",
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "58px",
                                                height: "60px",
                                                borderRadius: "50%",
                                                backgroundColor: "#D9C5CB",
                                                opacity: 0.5,
                                                pointerEvents: "none",
                                            }}
                                        />
                                    )}

                                </div>

                            </Tooltip>
                      
                    </Fab>
  )}





                </Box>


            </footer>
            {/* Modal de ayuda */}
            <Modal
                open={helpModalIsOpen}
                onClose={closeHelpModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
                sx={{
                    backdropFilter: "blur(4px)",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
                            fontSize: "18px",
                            marginBottom: "10px",
                        }}
                    >
                        Por favor, contáctenos:
                    </Typography>

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                        {/* Horarios de atención */}
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal medium 16px/54px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                Horarios de atención
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                Lunes a viernes
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

                        {/* Línea de emergencia */}
                        <Box>
                            <Typography
                                sx={{
                                    font: "normal normal medium 16px/54px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
                                }}
                            >
                                Línea de emergencia
                            </Typography>
                            <Typography
                                sx={{
                                    font: "normal normal normal 14px/20px Poppins",
                                    color: "#574B4F",
                                    mb: 0.5,
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

export default NavBarAndDrawer;
