import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Divider, Modal, FormControl, TextField, InputLabel, Select, MenuItem, Menu, Tooltip, ListItemText, ListItemIcon, Checkbox } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MainIcon from '../components/commons/MainButtonIcon';
import seachicon from '../assets/icon-lupa.svg';
import iconclose from "../assets/icon-close.svg";
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import IconCheckBox2 from "../assets/IconCheckBox2.svg";
import BoxEmpty from '../assets/Nousers.svg';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import SecondaryButton from '../components/commons/SecondaryButton'
import MainButton from '../components/commons/MainButton'
import infoicon from '../assets/Icon-info.svg'
import DynamicMessageEditor from '../components/commons/DymanicMessageEditor';
import axios from 'axios';
import ModalError from "../components/commons/ModalError"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '../assets/Icon-trash-Card.svg'
import SmsIcon from '@mui/icons-material/Sms';
import Emptybox from '../assets/NoResultados.svg';
import MainModal from "../components/commons/MainModal"
import ChipBar from "../components/commons/ChipBar";
import Thrashicon from '../assets/Icon-trash-Card.svg'
import backarrow from '../assets/MoveTable.svg';
import backarrowD from '../assets/MoveTabledesactivated.svg';
import IconSMS from '../assets/IconSMS.svg';
import infoiconerror from '../assets/Icon-infoerror.svg';
import DynamicMessageEditText from '../components/commons/DynamicMessageEditText'; // ajusta el path si está en otra carpeta

interface CampañaAsignada {
    chanel: string;
    campainName: string;
}
export interface Template {
    id: number;
    name: string;
    message: string;
    creationDate: string; // DateTime en C# es string en JS/TS
    idRoom: number;
}
const Templates = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const navigate = useNavigate();

    const [openModal, setOpenModal] = React.useState(false);
    const [mensaje, setMensaje] = React.useState('');
    const [selectedID, setSelectedID] = React.useState('');
    const [selectedPhone, setSelectedPhone] = React.useState('');
    const [selectedDato, setSelectedDato] = React.useState('');
    const [openPreviewModal, setOpenPreviewModal] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [TitleErrorModal, setTitleErrorModal] = useState('');
    const [MessageErrorModal, setMessageErrorModal] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
    const [assignedCampaigns, setAssignedCampaigns] = useState<string[]>([]);
    const open = Boolean(anchorEl);
    const [hasAssignedCampaigns, setHasAssignedCampaigns] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
    const [showChipBar, setShowChipBar] = useState(false);
    const [messageChipBar, setMessageChipBar] = useState('');
    const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);
    const [openMassiveDeleteModal, setOpenMassiveDeleteModal] = useState(false);
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [templateToEdit, setTemplateToEdit] = useState<Template | null>(null);
    const [isEdit, setIdEdit] = useState<boolean>(false);
    const [editMessage, setEditMessage] = useState('');
    const [campaignPage, setCampaignPage] = useState(1);
    const [campaignSearch, setCampaignSearch] = useState('');
    const [campaignData, setCampaignData] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    const isTemplateNameInvalid = !!(
        templateName &&
        (templateName.length > 40 || !/^[a-zA-Z0-9 ]+$/.test(templateName))
    );

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalItems = filteredTemplates.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    const currentItems = filteredTemplates.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );


    const handleOpenEditTemplate = (template: Template) => {
        setIdEdit(true);
        setIsEditingTemplate(true);
        setTemplateToEdit(template);
        setTemplateName(template.name);
        setMensaje(template.message);
        setOpenModal(true);
    };


    const resetTemplateForm = () => {
        setIsEditingTemplate(false);
        setTemplateToEdit(null);
        setTemplateName('');
        setMensaje('');
    };



    const handleOpenDeleteModal = (template: Template) => {
        setTemplateToDelete(template);
        setOpenDeleteModal(true);
    };

    const handleOpenDeleteSelectedTemplates = async () => {
        try {
            const room = JSON.parse(localStorage.getItem('selectedRoom') || '{}');

            // 🔥 Revisión de campañas asignadas
            let hasAssigned = false;

            for (const template of selectedTemplates) {
                const payload = {
                    name: template.name,
                    idRoom: room.id
                };

                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_ADD_GETCAMPAINSBYTEMPLATE}`,
                    payload,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.data && response.data.length > 0) {
                    hasAssigned = true;
                    break;
                }
            }

            if (hasAssigned) {
                setTitleErrorModal('Error al eliminar plantillas');
                setMessageErrorModal('Alguna o todas las plantillas seleccionadas se encuentran asignadas a una campaña que está en curso. No es posible eliminarla(s).');
                setIsErrorModalOpen(true);
            } else {
                setOpenMassiveDeleteModal(true);
            }
        } catch (err) {
            console.error('Error verificando campañas asignadas:', err);
            setTitleErrorModal('Error inesperado');
            setMessageErrorModal('No se pudo verificar el estado de las plantillas. Intente más tarde.');
            setIsErrorModalOpen(true);
        }
    };



    const handleConfirmDeleteTemplate = async () => {
        if (!templateToDelete) return;

        try {
            const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

            const payload = {
                name: templateToDelete.name,
                idRoom: salaId
            };

            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_DELETE_TEMPLATE}`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                setTemplates(prev => prev.filter(t => t.id !== templateToDelete.id));
                setMessageChipBar('Plantilla eliminada correctamente');
                setShowChipBar(true);
                setTimeout(() => setShowChipBar(false), 3000);
            }
        } catch (err) {
            setTitleErrorModal("Error al eliminar");
            setMessageErrorModal("No se pudo eliminar la plantilla. Intenta más tarde.");
            setIsErrorModalOpen(true);
        } finally {
            setOpenDeleteModal(false);
            setTemplateToDelete(null);
        }
    };

    const handleDeleteSelectedTemplates = async () => {
        try {
            const room = JSON.parse(localStorage.getItem('selectedRoom') || '{}');

            for (const template of selectedTemplates) {
                const payload = {
                    name: template.name,
                    idRoom: room.id
                };

                await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_DELETE_TEMPLATE}`,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
            }

            // 🔥 Mostrar mensaje y limpiar selección
            setTemplates(prev => prev.filter(t => !selectedTemplates.find(sel => sel.id === t.id)));
            setSelectedTemplates([]);
            setMessageChipBar("Plantillas eliminadas correctamente");
            setShowChipBar(true);
            setTimeout(() => setShowChipBar(false), 3000);
        } catch (err) {
            console.error("Error al eliminar plantillas", err);
            setTitleErrorModal("Error al eliminar plantillas");
            setMessageErrorModal("No se pudieron eliminar una o más plantillas.");
            setIsErrorModalOpen(true);
        } finally {
            setOpenMassiveDeleteModal(false);
        }
    };


    const handleSelectTemplate = (template: Template) => {
        const isSelected = selectedTemplates.some((t) => t.id === template.id);

        if (isSelected) {
            setSelectedTemplates(prev => prev.filter((t) => t.id !== template.id));
        } else {
            setSelectedTemplates(prev => [...prev, template]);
        }
    };

    const handleSelectAllTemplates = () => {
        if (selectedTemplates.length === templates.length) {
            setSelectedTemplates([]);
        } else {
            setSelectedTemplates(templates);
        }
    };


    const handleMenuClick = async (event: React.MouseEvent<HTMLElement>, template: Template) => {
        setAnchorEl(event.currentTarget);
        setSelectedTemplate(template);

        // Cargar campañas al abrir el menú
        try {
            const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

            const payload = {
                name: template.name,
                idRoom: salaId
            };

            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_GETCAMPAINSBYTEMPLATE}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setCampaignData(response.data);
            setHasAssignedCampaigns(response.data.length > 0);
        } catch (error) {
            console.error('Error cargando campañas para validar eliminar:', error);
            setCampaignData([]);
            setHasAssignedCampaigns(false);
        }
    };


    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTemplate(null);
    };

    const handleInspectTemplate = async (template: Template) => {
        try {
            setIsInspectModalOpen(true);
            const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

            const payload = {
                name: selectedTemplate?.name,
                idRoom: salaId
            }

            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_ADD_GETCAMPAINSBYTEMPLATE}`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setCampaignData(response.data);
        } catch (error) {
            console.error('Error cargando campañas asignadas:', error);
            setTitleErrorModal('Error al inspeccionar plantilla');
            setMessageErrorModal('No se pudieron cargar las campañas asociadas.');
            setIsErrorModalOpen(true);
            setIsInspectModalOpen(false);
        }
    };


    const fetchTemplates = async () => {

        try {
            const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

            setLoadingTemplates(true);
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GET_GETTEMPLATESBYROOM + salaId}`;
            const response = await axios.get(requestUrl);
            setTemplates(response.data);
        }
        catch (error) {
            console.error(error);
            setIsErrorModalOpen(true);
            setTitleErrorModal('Error al traer las plantillas');
            setMessageErrorModal('Ocurrió un error al intentar guardar la plantilla. Inténtalo más tarde.');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const extractVariablesFromMessage = (msg: string): string[] => {
        const matches = msg.match(/\{(.*?)\}/g);
        if (!matches) return [];
        return Array.from(new Set(matches.map(v => v.replace(/[{}]/g, ''))));
    };
    useEffect(() => {


        fetchTemplates();
    }, []);

    const handleSaveTemplate = async () => {
        setIsSavingTemplate(true); // 🔥 Activa spinner

        const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

        try {
            if (isEditingTemplate && templateToEdit) {
                const payload = {
                    oldName: templateToEdit.name,
                    idRoom: salaId,
                    newName: templateName,
                    newMessage: mensaje,
                };

                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_UPDATE_TEMPLATES}`,
                    payload,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.status === 200) {
                    setTemplates(prev =>
                        prev.map(t =>
                            t.id === templateToEdit.id
                                ? { ...t, name: templateName, message: mensaje }
                                : t
                        )
                    );
                    fetchTemplates();
                    setMessageChipBar('Plantilla actualizada correctamente');
                }
            } else {
                const payload = {
                    name: templateName,
                    message: mensaje,
                    idRoom: salaId,
                };

                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_ADD_TEMPLATE}`,
                    payload,
                    { headers: { 'Content-Type': 'application/json' } }
                );

                if (response.status === 200) {
                    setMessageChipBar('Plantilla agregada correctamente');
                    fetchTemplates();
                }
            }

            setShowChipBar(true);
            setTimeout(() => setShowChipBar(false), 3000);
            setOpenModal(false);
            resetTemplateForm();
        } catch (error) {
            setIsErrorModalOpen(true);
            setTitleErrorModal('Error al guardar la plantilla');
            setMessageErrorModal('Ocurrió un error al intentar guardar la plantilla. Inténtalo más tarde.');
        } finally {
            setIsSavingTemplate(false); // 🔥 Detiene spinner
        }
    };




    const getProcessedMessage = () => {
        if (!mensaje) return '';

        const variableRegex = /\[\{(.*?)\}\]/g;
        return mensaje.replace(variableRegex, (_, variableName) => `[${variableName}]`);
    };



    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handlePreviewClick = () => {
        console.log("Mensaje crudo:", mensaje);
        setOpenPreviewModal(true);
    };

    const handleMessageChange = (text: string) => {
        setMensaje(text);
    };


    const isAcceptDisabled = !templateName.trim() || isTemplateNameInvalid || !mensaje.trim();



    return (
        <div style={{ padding: '20px', marginTop: '-70px', marginLeft: '40px', maxWidth: '1140px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        p: 0,
                        mr: 1,
                        ml: '-28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
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

                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: '500',
                        color: '#330F1B',
                        fontFamily: 'Poppins',
                        fontSize: '26px',
                    }}
                >
                    Plantillas
                </Typography>
            </Box>

            <Divider sx={{ marginBottom: '17px', marginTop: '16px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '25px', marginBottom: '20px' }}>
                <MainIcon
                    text="Nueva plantilla"
                    isLoading={false}
                    onClick={handleOpenModal}
                    width="218px"
                >
                    <span className="flex items-center">
                        <span className="mr-2">+</span> Nueva Plantilla
                    </span>
                </MainIcon>

                <div style={{ position: 'relative', width: '220px' }}>
                    <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                            backgroundColor: '#FFFFFF',
                            border: searchTerm ? '1px solid #7B354D' : '1px solid #9B9295',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            width: '218px',
                            height: '40px',
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <img
                            src={seachicon}
                            alt="Buscar"
                            style={{
                                marginRight: '8px',
                                width: '18px',
                                height: '18px',
                                filter: searchTerm ? 'invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)' : 'none',
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                fontSize: '16px',
                                fontFamily: 'Poppins, sans-serif',
                                color: searchTerm ? '#7B354D' : '#9B9295',
                                backgroundColor: 'transparent',
                            }}
                        />
                        {searchTerm && (
                            <img
                                src={iconclose}
                                alt="Limpiar"
                                style={{ marginLeft: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                                onClick={() => setSearchTerm('')}
                            />
                        )}
                    </Box>
                </div>
            </div>

            {templates.length > 0 && (
                <Box sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', marginTop: '-46px',
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, marginLeft: "10px" }}>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#574B4F', minWidth: '120px' }}>
                            {startItem}–{endItem} de {totalItems}
                        </Typography>
                        <Box sx={{ marginLeft: "-25px" }}>
                            {/* Ir al inicio */}
                            <IconButton
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                sx={{ p: 0 }}
                            >
                                <img
                                    src={currentPage === 1 ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(0deg)', width: 22 }}
                                    alt="Primera página"
                                />
                                <img
                                    src={currentPage === 1 ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(0deg)', width: 22, marginLeft: '-16px' }}
                                    alt=""
                                />
                            </IconButton>

                            {/* Anterior */}
                            <IconButton
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                sx={{ p: 0 }}
                            >
                                <img
                                    src={currentPage === 1 ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(0deg)', width: 22 }}
                                    alt="Anterior"
                                />
                            </IconButton>

                            {/* Siguiente */}
                            <IconButton
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                sx={{ p: 0 }}
                            >
                                <img
                                    src={currentPage === totalPages ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(180deg)', width: 22 }}
                                    alt="Siguiente"
                                />
                            </IconButton>

                            {/* Ir al final */}
                            <IconButton
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                sx={{ p: 0 }}
                            >
                                <img
                                    src={currentPage === totalPages ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(180deg)', width: 22 }}
                                    alt="Última página"
                                />
                                <img
                                    src={currentPage === totalPages ? backarrowD : backarrow}
                                    style={{ transform: 'rotate(180deg)', width: 22, marginLeft: '-16px' }}
                                    alt=""
                                />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            )}

            {templates.length === 0 ? (
                <Box
                    sx={{
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '60px 0',
                        height: '450px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                        mt: 3,
                    }}
                >
                    <img src={BoxEmpty}
                        alt="Caja vacía"
                        style={{ width: '176px', height: "149px", marginBottom: '16px' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            color: '#7B354D',
                            fontWeight: 500,
                        }}
                    >
                        Crea una plantilla para comenzar.
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                        overflowX: 'auto',
                        height: "450px",
                        mt: 3.6
                    }}
                >
                    <table style={{
                        width: '100%', minWidth: '1080px',
                        borderCollapse: 'collapse',
                        fontFamily: 'Poppins',
                    }}>
                        <thead>
                            {selectedTemplates.length === 0 ? (
                                <tr style={{ backgroundColor: '#FFFFFF', textAlign: 'left', }}>
                                    <th style={{ padding: '5px' }}>
                                        <Box sx={{ marginLeft: "6px" }}>
                                            <Checkbox
                                                checked={selectedTemplates.length === templates.length && templates.length > 0}
                                                indeterminate={selectedTemplates.length > 0 && selectedTemplates.length < templates.length}
                                                onChange={handleSelectAllTemplates}
                                                sx={{
                                                    color: '#574861',
                                                    '&.Mui-checked': {
                                                        color: '#7B354D'
                                                    },
                                                    '&.MuiCheckbox-indeterminate': {
                                                        color: '#7B354D'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </th><th style={{ padding: '00px', fontWeight: 500 }}>Fecha de creación</th>
                                    <th style={{ padding: '0px', fontWeight: 500 }}>Nombre</th>
                                    <th style={{ padding: '0px', fontWeight: 500, borderRight: "1px solid #E6E4E4" }}>Contenido</th>
                                    <th style={{ padding: '0px', fontWeight: 500 }}></th>
                                </tr>
                            ) : (
                                <tr style={{
                                    backgroundColor: '#FFFFFF',
                                    textAlign: 'left', width: '100%'
                                }}>
                                    <th colSpan={6} style={{ minWidth: "967px" }}>

                                        <Box display="flex" alignItems="center" gap={1} pl={2} marginTop={"6px"} marginLeft={"-7px"} marginBottom={"8px"}>
                                            {/*Checkbox para tablas*/}
                                            <Box sx={{ marginBottom: "0px", marginTop: "2px" }}>
                                                <Checkbox
                                                    checked={selectedTemplates.length === templates.length}
                                                    indeterminate={selectedTemplates.length > 0 && selectedTemplates.length < templates.length}
                                                    onChange={handleSelectAllTemplates}
                                                    icon={
                                                        <Box
                                                            sx={{
                                                                width: '24px',
                                                                height: '24px',
                                                            }}
                                                        />
                                                    }
                                                    checkedIcon={
                                                        <Box
                                                            sx={{
                                                                width: '24px',
                                                                height: '24px',
                                                                position: 'relative',
                                                                marginTop: '1px',
                                                                marginLeft: '10px',
                                                            }}
                                                        >
                                                            <img
                                                                src={IconCheckBox1}
                                                                alt="Seleccionado"
                                                                style={{ width: '24px', height: '24px' }}
                                                            />
                                                        </Box>
                                                    }
                                                    indeterminateIcon={
                                                        <Box
                                                            sx={{
                                                                width: '24px',
                                                                height: '24px',
                                                                position: 'relative',
                                                                marginTop: '1px',
                                                                marginLeft: '10px',
                                                            }}
                                                        >
                                                            <img
                                                                src={IconCheckBox2}
                                                                alt="Indeterminado"
                                                                style={{ width: '24px', height: '24px' }}
                                                            />
                                                        </Box>
                                                    }
                                                    sx={{ padding: 0 }}
                                                />
                                            </Box>
                                            <Tooltip title="Eliminar" arrow placement="top"
                                                componentsProps={{
                                                    tooltip: {
                                                        sx: {
                                                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                                                            color: "#CCC3C3",
                                                            fontFamily: "Poppins, sans-serif",
                                                            fontSize: "12px",
                                                            padding: "6px 8px",
                                                            borderRadius: "8px",
                                                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)"
                                                        }
                                                    },
                                                    arrow: {
                                                        sx: {
                                                            color: "rgba(0, 0, 0, 0.8)"
                                                        }
                                                    }
                                                }}
                                                PopperProps={{
                                                    modifiers: [
                                                        {
                                                            name: 'offset',
                                                            options: {
                                                                offset: [0, -10] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                                            }
                                                        }
                                                    ]
                                                }}
                                            >
                                                <IconButton onClick={handleOpenDeleteSelectedTemplates}>
                                                    <img src={DeleteIcon} alt="Eliminar" style={{ width: 20, height: 20 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </th>
                                </tr>
                            )}
                        </thead>

                        <tbody>
                            {filteredTemplates.length === 0 ? (
                                <Box
                                    sx={{
                                        width: '100%',
                                        backgroundColor: '#FFFFFF',
                                        borderRadius: '8px',
                                        padding: '60px 0',
                                        height: '332px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                                        mt: 3,
                                    }}
                                >
                                    <img src={Emptybox} alt="Caja vacía" style={{
                                        width: '240px',
                                        marginTop: '-56px',
                                        marginLeft: '620px',
                                        position: 'absolute',
                                    }} />
                                    <Typography
                                        sx={{
                                            fontFamily: 'Poppins',
                                            position: 'absolute',
                                            fontSize: '14px',
                                            color: '#7B354D',
                                            fontWeight: 500,
                                            marginTop: '158px',
                                            marginLeft: '629px',
                                        }}
                                    >
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            ) : (
                                currentItems.map((template) => (
                                    <tr key={template.id} style={{ borderTop: '1px solid #E0E0E0', borderBottom: '1px solid #E0E0E0' }}>
                                        <td style={{ padding: '0px', width: "60px" }}>
                                            <Box sx={{ marginLeft: "10px" }}>
                                                <Checkbox
                                                    checked={selectedTemplates.some((t) => t.id === template.id)}
                                                    onChange={() => handleSelectTemplate(template)}
                                                    checkedIcon={
                                                        <Box
                                                            sx={{
                                                                width: '24px',
                                                                height: '24px',
                                                            }}
                                                        >
                                                            <img
                                                                src={IconCheckBox1}
                                                                alt="Seleccionado"
                                                                style={{ width: '24px', height: '24px' }}
                                                            />
                                                        </Box>
                                                    }
                                                    sx={{
                                                        color: '#574861',
                                                        '&.MuiCheckbox-indeterminate': {
                                                            color: '#7B354D'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </td>

                                        {/* Fecha */}
                                        <td style={{
                                            padding: '0px', width: '200px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', textAlign: "left",
                                            fontSize: '13px', color: "#574B4F", fontFamily: 'Poppins',
                                        }}>
                                            {new Date(template.creationDate).toLocaleDateString('es-MX')}
                                        </td>

                                        {/* Nombre con Tooltip */}
                                        <td style={{
                                            padding: '0px', width: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textAlign: "left",
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>
                                            {template.name.length > 15 ? (
                                                <Tooltip title={template.name} arrow>
                                                    <span>{template.name.slice(0, 15) + '...'}</span>
                                                </Tooltip>
                                            ) : (
                                                template.name
                                            )}
                                        </td>

                                        {/* Contenido */}
                                        <td style={{
                                            padding: '0px', width: '480px', whiteSpace: 'nowrap', overflow: 'hidden', textAlign: "left",
                                            textOverflow: 'ellipsis', fontSize: '13px', color: "#574B4F", fontFamily: 'Poppins'
                                        }}>{template.message}</td>

                                        {/* Menú de acciones */}
                                        <td
                                            style={{
                                                padding: '0px', width: '50px',
                                                borderLeft: '1px solid #E0E0E0',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <IconButton onClick={(e) => handleMenuClick(e, template)}>
                                                <MoreVertIcon sx={{ color: '#7B354D' }} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>
                </Box>
            )}



            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        width: '580px',
                        height: "664px",
                        fontFamily: 'Poppins',
                        backgroundColor: 'white',
                        borderRadius: 2,
                        p: 3,
                        mx: 'auto',
                        my: '3%',
                        outline: 'none',

                    }}
                >
                    <Typography variant="h6" fontWeight={600} fontFamily="Poppins"
                        color='#574B4F' marginTop="0px">
                        {isEdit ? 'Editar plantilla' : 'Añadir plantilla'}
                    </Typography>

                    <IconButton onClick={handleCloseModal} sx={{ position: 'absolute', marginTop: "-48px", marginLeft: '506px' }}>
                        <CloseIcon />
                    </IconButton>

                    <Divider sx={{ width: 'calc(100% + 49px)', marginLeft: '-24px', mb: 2, mt: 3 }} />

                    <Typography
                        mt={2} mb={1}
                        fontWeight={500}
                        fontSize={"16px"}
                        fontFamily="Poppins"
                        sx={{ color: isTemplateNameInvalid ? '#D01247' : '#330F1B' }}
                    >
                        Nombre
                        <Box component="span" sx={{ color: "#EF5466", ml: "2px" }}>*</Box>
                    </Typography>
                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            error={isTemplateNameInvalid}
                            helperText={
                                templateName.length > 40
                                    ? 'Máximo 40 caracteres'
                                    : !/^[a-zA-Z0-9 ]+$/.test(templateName) && templateName
                                        ? 'Nombre inválido'
                                        : ''
                            }
                            FormHelperTextProps={{
                                sx: {
                                    position: "absolute",
                                    fontFamily: 'Poppins',
                                    fontSize: '12px',
                                    color: '#D01247',
                                    marginLeft: '10px',
                                    marginTop: '60px'
                                }
                            }}
                            sx={{
                                width: "340px", height: "54px",
                                fontFamily: 'Poppins',
                                '& input': {
                                    fontFamily: 'Poppins',
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
                                        • Solo caracteres alfabéticos<br />
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
                                    src={isTemplateNameInvalid ? infoiconerror : infoicon}
                                    alt={isTemplateNameInvalid ? "error" : "info"}
                                    style={{ width: 24, height: 24 }}
                                />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    <Typography mt={4.5} fontWeight={500} fontSize={'16px'} fontFamily="Poppins" mb={1.5} color={'#330F1B'}>
                        Mensaje
                        <Box component="span" sx={{ color: "#EF5466", ml: "2px" }}>*</Box>
                    </Typography>

                    {isEdit ? (
                        <DynamicMessageEditText
                            value={mensaje}
                            onChange={setEditMessage}
                            variables={extractVariablesFromMessage(editMessage)}
                        />
                    ) : (
                        <DynamicMessageEditor
                            initialMessage={mensaje}
                            onChange={handleMessageChange}
                        />

                    )}



                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            mt: 2,
                            whiteSpace: 'nowrap',
                            fontFamily: 'Poppins',
                            fontWeight: 500
                        }}
                    >
                        <Box
                            onClick={handlePreviewClick}
                            sx={{
                                width: '142px',
                                height: '40px',
                                backgroundColor: '#FFFFFF',
                                color: '#833A53',
                                border: '1px solid #CCCFD2',
                                borderRadius: '4px',
                                fontFamily: 'Poppins',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                letterSpacing: "1.12px",
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                '&:hover': {
                                    backgroundColor: '#F2EBED'
                                }
                            }}
                        >
                            VISTA PREVIA
                        </Box>

                    </Box>

                    <Divider sx={{ width: 'calc(100% + 49px)', marginLeft: '-24px', mb: 2, mt: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <SecondaryButton text='Cancelar' onClick={handleCloseModal} />

                        <MainButton
                            text="Aceptar"
                            onClick={handleSaveTemplate}
                            disabled={isAcceptDisabled}
                        />
                    </Box>
                </Box>
            </Modal>

            <Modal open={openPreviewModal} onClose={() => setOpenPreviewModal(false)}>
                <Box
                    sx={{
                        width: '556px', height: '417px',
                        backgroundColor: 'white',
                        borderRadius: 2,
                        p: 3,
                        mx: 'auto',
                        my: '10%',
                        fontFamily: 'Poppins',
                        outline: 'none',
                    }}
                >
                    <Typography fontWeight="500" fontSize="18px" fontFamily="Poppins" color="#330F1B" mb={2}>
                        Vista previa: <span style={{ color: '#7B354D', fontFamily: "Poppins", fontWeight: "500" }}>{templateName || 'Mensaje Prueba 1'}</span>
                    </Typography>

                    <IconButton onClick={() => setOpenPreviewModal(false)} sx={{ position: 'absolute', marginTop: '-58px', marginLeft: '484px' }}>
                        <CloseIcon />
                    </IconButton>

                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2 }} />

                    <Box sx={{
                        backgroundColor: '#F2EBEDCC', borderRadius: 2, padding: 2, width: '508px', height: '300px',

                        border: " 2px solid #C6BFC299",
                    }}>
                        <Typography fontSize="15px" color="#3A3A3A" fontFamily="Poppins" fontWeight="500">
                            {getProcessedMessage()}
                        </Typography>
                    </Box>
                </Box>
            </Modal>
            <ModalError
                isOpen={isErrorModalOpen}
                title={TitleErrorModal}
                message={MessageErrorModal}
                buttonText="Cerrar"
                onClose={() => setIsErrorModalOpen(false)}
            />
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: 2,
                        mt: -1,
                        ml: -13.5,
                        minWidth: 160,
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                        '& .MuiMenuItem-root': {
                            fontFamily: 'Poppins',
                            fontSize: '14px',
                            color: '#333',
                            '&:hover': { backgroundColor: '#F2EBED' }
                        }
                    }
                }}
            >
                <MenuItem disabled={hasAssignedCampaigns} onClick={() => !hasAssignedCampaigns && handleOpenEditTemplate(selectedTemplate!)}
                    sx={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        '&:hover': {
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" sx={{ mr: 1, color: '#5F5064', width: 24, height: 24 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F" }}>

                        Editar
                    </Typography>
                </MenuItem>



                <MenuItem onClick={() => { handleMenuClose(); handleInspectTemplate(selectedTemplate!); }}
                    sx={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        '&:hover': {
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" sx={{ mr: 1, color: '5F5064', width: 24, height: 24 }} />
                    </ListItemIcon>
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F" }}>
                        Inspeccionar
                    </Typography>
                </MenuItem>
                <MenuItem
                    onClick={() => { handleMenuClose(); handleOpenDeleteModal(selectedTemplate!); }}
                    disabled={hasAssignedCampaigns}

                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <img
                            src={Thrashicon}
                            alt="Eliminar"
                            style={{ width: 24, height: 24, color: "#5F5064" }}
                        />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F", marginLeft: "4px" }}>
                            Eliminar
                        </Typography>
                    </Box>
                </MenuItem>
            </Menu>

            <Modal open={isInspectModalOpen} onClose={() => setIsInspectModalOpen(false)}>

                <Box sx={{
                    position: 'absolute',
                    marginTop: '60px',
                    marginLeft: '50%',
                    transform: 'translateX(-50%)',
                    width: '546px',
                    height: '667px',
                    maxHeight: 'calc(100vh - 100px)',
                    bgcolor: 'white',
                    borderRadius: '8px',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '20px', fontWeight: 600, color: '#330F1B', mt: -1.2, ml: -0.4 }}>
                            Inspeccionar plantilla
                        </Typography>
                        <IconButton onClick={() => setIsInspectModalOpen(false)}>
                            <CloseIcon sx={{ color: '#A6A6A6', marginTop: '-34px', marginRight: '-24px' }} />
                        </IconButton>
                    </Box>

                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1, mt: 1 }} />

                    {/* Tabs */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            mb: 2,
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: 'Poppins',
                                fontWeight: 600,
                                fontSize: '12px',
                                color: '#8F4E63',
                                width: '100%',
                                textAlign: 'left',
                                pb: 1,
                                cursor: 'default',
                                letterSpacing: "0.96px",
                                textTransform: "uppercase",
                                mb: 0.9,
                                mt: 0.5
                            }}
                        >
                            CAMPAÑAS ASIGNADAS
                        </Typography>
                    </Box>


                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 3, mt: -2.3 }} />

                    <Box sx={{ border: '1px solid #E6E4E4', borderRadius: '6px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '490px', height: '70px', gap: 4, ml: -0.1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, ml: 3 }}>
                                <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#574B4F', minWidth: '80px' }}>
                                    {Math.min(campaignPage * 50 - 49, campaignData.length)}–{Math.min(campaignPage * 50, campaignData.length)} de {campaignData.length}
                                </Typography>

                                {/* Flechas */}
                                <IconButton onClick={() => setCampaignPage(1)} disabled={campaignPage === 1} sx={{ p: 0 }}>
                                    <img src={campaignPage === 1 ? backarrowD : backarrow} style={{ transform: 'rotate(0deg)', width: 22 }} />
                                    <img src={campaignPage === 1 ? backarrowD : backarrow} style={{ transform: 'rotate(0deg)', width: 22, marginLeft: '-16px' }} />
                                </IconButton>

                                <IconButton onClick={() => setCampaignPage(prev => Math.max(prev - 1, 1))} disabled={campaignPage === 1} sx={{ p: 0 }}>
                                    <img src={campaignPage === 1 ? backarrowD : backarrow} style={{ transform: 'rotate(0deg)', width: 22 }} />
                                </IconButton>

                                <IconButton onClick={() => setCampaignPage(prev => prev + 1)} disabled={campaignPage * 50 >= campaignData.length} sx={{ p: 0 }}>
                                    <img src={campaignPage * 50 >= campaignData.length ? backarrowD : backarrow} style={{ transform: 'rotate(180deg)', width: 22 }} />
                                </IconButton>

                                <IconButton onClick={() => setCampaignPage(Math.ceil(campaignData.length / 50))} disabled={campaignPage * 50 >= campaignData.length} sx={{ p: 0 }}>
                                    <img src={campaignData.length === 0 || campaignPage * 50 >= campaignData.length ? backarrowD : backarrow} style={{ transform: 'rotate(180deg)', width: 22 }} />
                                    <img src={campaignData.length === 0 || campaignPage * 50 >= campaignData.length ? backarrowD : backarrow} style={{ transform: 'rotate(180deg)', width: 22, marginLeft: '-16px' }} />
                                </IconButton>
                            </Box>

                            <Box display="flex" alignItems="center" sx={{ backgroundColor: '#FFFFFF', border: campaignSearch ? '1px solid #7B354D' : '1px solid #9B9295', borderRadius: '4px', padding: '6px 10px', width: '220px', height: '40px' }}>
                                <img src={seachicon} alt="Buscar" style={{ marginRight: '8px', width: '24px', height: '24px', filter: campaignSearch ? 'invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)' : 'none' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar"
                                    value={campaignSearch}
                                    onChange={(e) => setCampaignSearch(e.target.value)}
                                    style={{
                                        border: 'none', outline: 'none', width: '100%',
                                        fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                                        color: campaignSearch ? '#7B354D' : '#9B9295', backgroundColor: 'transparent'
                                    }}
                                />
                                {campaignSearch && (
                                    <img
                                        src={iconclose}
                                        alt="Limpiar búsqueda"
                                        style={{ marginLeft: '8px', width: '24px', height: '24px', cursor: 'pointer' }}
                                        onClick={() => setCampaignSearch('')}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, overflowY: 'auto' }}>
                            {campaignData.filter(c => c.toLowerCase().includes(campaignSearch.toLowerCase())).slice((campaignPage - 1) * 50, campaignPage * 50).length === 0 ? (
                                <Box sx={{ width: '100%', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={Emptybox} alt="No results" style={{ width: '242px', marginBottom: '16px', position: 'absolute', marginLeft: '0px' }} />
                                    <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#7B354D', fontWeight: 500, mt: '220px', position: 'absolute', marginBottom: '0px' }}>
                                        No se encontraron resultados.
                                    </Typography>
                                </Box>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Poppins', borderTop: '1px solid #E6E4E4' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E6E4E4' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500, color: '#330F1B', fontSize: '13px' }}>Canal</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500, color: '#330F1B', fontSize: '13px' }}>Ícono</th>
                                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 500, color: '#330F1B', fontSize: '13px' }}>Campaña</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {campaignData.filter(c => c.toLowerCase().includes(campaignSearch.toLowerCase())).slice((campaignPage - 1) * 50, campaignPage * 50).map((row, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #E0E0E0' }}>
                                                <td style={{ padding: '10px', color: '#574B4F', fontSize: '13px' }}>SMS</td>
                                                <td style={{ padding: '10px' }}>
                                                    <img alt="IconSMS" src={IconSMS} style={{ width: 22, height: 22 }} />
                                                </td>
                                                <td style={{ padding: '10px', color: '#574B4F', fontSize: '13px' }}>{row}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <MainModal
                isOpen={openDeleteModal}
                Title="Eliminar plantilla"
                message="¿Está seguro de que desea eliminar la plantilla seleccionada? Esta acción no podrá revertirse."
                primaryButtonText="Eliminar"
                secondaryButtonText="Cancelar"
                onPrimaryClick={handleConfirmDeleteTemplate}
                onSecondaryClick={() => setOpenDeleteModal(false)}
            />
            <MainModal
                isOpen={openMassiveDeleteModal}
                Title="Eliminar plantillas"
                message="¿Está seguro de que desea eliminar las plantillas seleccionadas? Esta acción no podrá revertirse."
                primaryButtonText="Eliminar"
                secondaryButtonText="Cancelar"
                onPrimaryClick={handleDeleteSelectedTemplates}
                onSecondaryClick={() => setOpenMassiveDeleteModal(false)}
            />

            {
                showChipBar && (
                    <ChipBar
                        message={messageChipBar}
                        buttonText="Cerrar"
                        onClose={() => setShowChipBar(false)}
                    />
                )
            }
        </div >
    );
};

export default Templates;
