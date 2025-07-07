import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Divider, Tooltip,
    CircularProgress, Menu, TextField, Checkbox, ListItemText, MenuItem, InputAdornment, ListItemIcon
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import MainButtonIcon from '../components/commons/MainButtonIcon'
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import seachicon from '../assets/icon-lupa.svg';
import backarrow from '../assets/MoveTable.svg';
import iconclose from '../assets/icon-close.svg';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import IconDownloadCSV from '../assets/IconCSV.svg';
import IconDownloadExcel from '../assets/IconExcel.svg';
import IconDownloadPDF from '../assets/IconPDF.svg';
import BoxEmpty from '../assets/Nousers.svg';
import NoResult from '../assets/NoResultados.svg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MainModal from '../components/commons/MainModal'
import Thrashicon from '../assets/Icon-trash-Card.svg'

interface Clients {
    id: number;
    nombrecliente: string;
}

export interface RoomAdminData {
    id: number;
    fechaAlta: string;
    nombrecliente: string;
    nombreSala: string;
    creditosGlobales: number;
    creditosSmsCortos: number;
    creditosSmsLargos: number;
}

const RoomsAdmin: React.FC = () => {
    const [roomsData, setRoomsData] = useState<RoomAdminData[]>([]);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [clientAnchorEl, setClientAnchorEl] = useState<null | HTMLElement>(null);
    const [activeFilter, setActiveFilter] = useState<'cliente' | ''>('');
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [totalItems, setTotalItems] = useState(0);
    const [errorModal, setErrorModal] = useState(false);
    const [isExportingCSV, setIsExportingCSV] = useState(false);
    const [isExportingXLSX, setIsExportingXLSX] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const anyExporting = isExportingCSV || isExportingXLSX || isExportingPDF;
    const [loading, setLoading] = useState<boolean>(false);
    const [clientSearch, setClientSearch] = useState('');
    const [clientsList, setClientsList] = useState<Clients[]>([]);
    const [originalData, setOriginalData] = useState<RoomAdminData[]>([]);
    const [currentPageData, setCurrentPageData] = useState<RoomAdminData[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [rowToDelete, setRowToDelete] = useState<RoomAdminData | null>(null);
    const open = Boolean(anchorEl);

    const navigate = useNavigate();

    const DualSpinner = () => (
        <Box
            sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <CircularProgress
                variant="determinate"
                value={100}
                size={24}
                thickness={8}
                sx={{ color: '#D6C4CB', position: 'absolute' }}
            />
            <CircularProgress
                size={24}
                thickness={8}
                sx={{
                    color: '#7B354D',
                    position: 'absolute',
                    animationDuration: '1s',
                }}
            />
            <Box
                sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    zIndex: 3,
                }}
            />
        </Box>
    );


    const getRooms = async () => {
        setLoading(true);
        try {
            const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_ROOMSADMIN}`;
            const response = await axios.get(requestUrl);
            setRoomsData(response.data);
            setOriginalData(response.data);
            setCurrentPageData(response.data.slice(0, 50));
        } catch (error) {
            console.error("Error al obtener las salas:", error);
        }
    };

    const GetClients = async () => {
        setLoading(true);

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_GET_CLIENTS}`;
            const response = await axios.get<Clients[]>(request);

            if (response.status === 200) {
                const fetchedClient = response.data;
                const uniqueClients: Clients[] = [
                    ...new Map(fetchedClient.map((item: Clients) => [item.nombrecliente, item])).values()
                ];
                setClientsList(uniqueClients);

            }
        } catch {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        GetClients();
        getRooms();
    }, []);

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => setCurrentPage(totalPages);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleExportClick = (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        setTimeout(() => {
            exportRooms(format, () => setThisLoading(false));
        }, 1000);
    };

    const exportRooms = async (
        format: 'csv' | 'xlsx' | 'pdf',
        onComplete?: () => void
    ) => {
        const MAX_RECORDS_LOCAL = 100000;
        const data = roomsData;

        try {
            if (data.length <= MAX_RECORDS_LOCAL) {
                const cleanData = data.map(item => ({
                    "fechaAlta": item.fechaAlta,
                    "nombrecliente": item.nombrecliente,
                    "nombreSala": item.nombreSala,
                    "creditosGlobales": item.creditosGlobales,
                    "creditosSmsCortos": item.creditosSmsCortos,
                    "creditosSMSLargos": item.creditosSmsLargos
                }));


                if (format === 'csv') {
                    const csv = unparse(cleanData);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    saveAs(blob, 'DescargaSalas.csv');
                } else if (format === 'xlsx') {
                    const worksheet = XLSX.utils.json_to_sheet(cleanData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'NumerosDID');
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([excelBuffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    saveAs(blob, 'DescargaClientes.xlsx');
                } else if (format === 'pdf') {
                    const input = document.querySelector('table');
                    if (!input) return;

                    const clone = input.cloneNode(true) as HTMLElement;
                    clone.style.position = 'absolute';
                    clone.style.top = '-9999px';
                    document.body.appendChild(clone);

                    const canvas = await html2canvas(clone, { scale: 2, useCORS: true });
                    document.body.removeChild(clone);

                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF('l', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const imgProps = pdf.getImageProperties(imgData);
                    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                    pdf.save('DescargaSalas.pdf');
                }
            } else {
                const payload = { Formato: format };
                const response = await axios.post(
                    `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_EXPORT_NUMBERS}`,
                    payload,
                    { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
                );

                const blob = new Blob([response.data], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `DescargaSalas.${format}`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            setErrorModal(true);
        } finally {
            onComplete?.();
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setDeleteModalOpen(false);
            setRowToDelete(null);

            // Actualizar UI tras eliminación (puedes hacer un nuevo fetch o filtrar)
            const updated = roomsData.filter(r => r.id !== id);
            setRoomsData(updated);
            setOriginalData(updated);
            setCurrentPageData(updated.slice(0, itemsPerPage));
        } catch (error) {
            console.error("Error al eliminar sala:", error);
        }
    };

    return (
        <Box p={3} sx={{ marginTop: "-80px", width: '90%', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Header con título y flecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 500, fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Salas
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: "17px", marginTop: "16px" }} />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px',
                        marginBottom: '24px',
                    }}
                >
                    {/* Chips redonditos */}
                    <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['CLIENTE'].map((label) => {
                            const isClient = label === 'CLIENTE';


                            const count = selectedClients.length;


                            const labelDisplay = count > 0 ? `${count} ${label}` : label;

                            return (
                                <Box
                                    key={label}
                                    onClick={(e) => {
                                        if (label === 'CLIENTE') {
                                            setClientAnchorEl(e.currentTarget);
                                            setClientMenuOpen(true);
                                        }
                                        setActiveFilter(label.toLowerCase() as any);
                                    }}
                                    sx={{
                                        px: '16px', py: '6px', border: '1px solid', borderColor: activeFilter === label.toLowerCase() ? '#7B354D' : '#CFCFCF',
                                        borderRadius: '50px', cursor: 'pointer', fontFamily: 'Poppins', fontWeight: 600,
                                        fontSize: '13px', backgroundColor: activeFilter === label.toLowerCase() ? '#F6EEF1' : '#FFFFFF',
                                        color: activeFilter === label.toLowerCase() ? '#7B354D' : '#9B9295', transition: 'all 0.2s ease-in-out', userSelect: 'none',
                                    }}
                                >
                                    {labelDisplay}
                                </Box>
                            );
                        })}

                    </Box>

                    {/* Botón y buscador */}
                    <Box sx={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                        <SecondaryButton text="Clientes" onClick={() => navigate('/Clients')} />
                        <Box sx={{ position: 'relative', width: '220px' }}>
                            <Box
                                display="flex"
                                alignItems="center"
                                sx={{
                                    backgroundColor: "#FFFFFF",
                                    border: searchTerm ? "1px solid #7B354D" : "1px solid #9B9295",
                                    borderRadius: "4px",
                                    px: 2,
                                    py: 1,
                                    width: "100%",
                                    height: "40px"
                                }}
                            >
                                <img src={seachicon} alt="Buscar" style={{ marginRight: 8, width: 18 }} />
                                <input
                                    type="text"
                                    placeholder="Buscar"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        border: "none",
                                        outline: "none",
                                        width: "100%",
                                        fontSize: "16px",
                                        fontFamily: "Poppins",
                                        color: searchTerm ? "#7B354D" : "#9B9295",
                                        backgroundColor: "transparent",
                                    }}
                                />
                                {searchTerm && (
                                    <img
                                        src={iconclose}
                                        alt="Limpiar búsqueda"
                                        onClick={() => {
                                            setSearchTerm('');
                                        }}
                                        style={{ marginLeft: 8, width: 20, height: 20, cursor: 'pointer' }}
                                    />

                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Divider sx={{ width: 'calc(100% + 0px)', mb: 0 }} />
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={0}
                    p={2}
                    sx={{ backgroundColor: "#F2F2F2", borderRadius: "8px" }}
                >
                    {/* Rango de resultados */}
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#330F1B" }}>
                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, roomsData.length)} de {roomsData.length}
                    </Typography>


                    {/* Flechas + Exportaciones */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <Tooltip title="Primera página">
                            <IconButton onClick={goToFirstPage} disabled={currentPage === 1}>
                                <Box
                                    display="flex"
                                    gap="2px"
                                    alignItems="center"
                                    sx={{
                                        opacity: currentPage === 1 ? 0.3 : 1
                                    }}
                                >
                                    <img src={backarrow} style={{ width: 24 }} />
                                    <img src={backarrow} style={{ width: 24 }} />
                                </Box>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Página Anterior">
                            <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                <img src={backarrow} style={{ width: 24, opacity: currentPage === 1 ? 0.3 : 1 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Siguiente página">
                            <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                                <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', opacity: currentPage === totalPages ? 0.3 : 1 }} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ultima Página">
                            <IconButton onClick={goToLastPage} disabled={currentPage === totalPages}>
                                <Box
                                    display="flex"
                                    gap="2px"
                                    alignItems="center"
                                    sx={{
                                        opacity: currentPage === 1 ? 0.3 : 1
                                    }}
                                >
                                    <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)' }} />
                                    <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)' }} />
                                </Box>
                            </IconButton>
                        </Tooltip>


                        {/* Exportaciones */}
                        <Box display="flex" alignItems="center" gap={2} ml={3}>
                            <Tooltip title="Exportar a CSV" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
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
                                <IconButton
                                    onClick={() => handleExportClick('csv', setIsExportingCSV)}
                                    disabled={anyExporting && !isExportingCSV}
                                    sx={{ opacity: !isExportingCSV && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingCSV ? <DualSpinner /> : <img src={IconDownloadCSV} alt="CSV" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a Excel" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
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
                                <IconButton
                                    onClick={() => handleExportClick('xlsx', setIsExportingXLSX)}
                                    disabled={anyExporting && !isExportingXLSX}
                                    sx={{ opacity: !isExportingXLSX && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingXLSX ? <DualSpinner /> : <img src={IconDownloadExcel} alt="Excel" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a PDF" placement="top"
                                arrow
                                PopperProps={{
                                    modifiers: [
                                        {
                                            name: 'arrow',
                                            options: {
                                                padding: 0,
                                            },
                                        },
                                    ],
                                }}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#312D2E',
                                            color: '#DEDADA',
                                            fontSize: '12px',
                                            borderRadius: '6px',
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
                                <IconButton
                                    onClick={() => handleExportClick('pdf', setIsExportingPDF)}
                                    disabled={anyExporting && !isExportingPDF}
                                    sx={{ opacity: !isExportingPDF && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingPDF ? <DualSpinner /> : <img src={IconDownloadPDF} alt="PDF" />}
                                </IconButton>
                            </Tooltip>
                        </Box>

                    </Box>
                </Box>
                {roomsData.length === 0 && searchTerm === '' ? (
                    // Caso 1: No hay rooms en general
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: '400px',
                            backgroundColor: '#F9F9F9',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                            mt: 2,
                        }}
                    >
                        <img src={BoxEmpty} alt="Empty" width={220} />
                        <Typography variant="h6" mt={2}
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: '#7B354D',
                                fontWeight: 500,
                            }}
                        >
                            No hay salas registradas
                        </Typography>
                    </Box>
                ) : roomsData.length === 0 && searchTerm !== '' ? (
                    // Caso 2: Se buscó algo, pero no hay coincidencias
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: '400px',
                            backgroundColor: '#F9F9F9',
                            padding: 4,
                            borderRadius: '12px',
                            border: '1px solid #E0E0E0',
                            mt: 2,
                        }}
                    >
                        <img src={NoResult} alt="No results" width={220} />
                        <Typography variant="h6" mt={2}
                            sx={{
                                fontFamily: 'Poppins',
                                fontSize: '16px',
                                color: '#7B354D',
                                fontWeight: 500,
                            }}
                        >
                            No se encontraron resultados
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            padding: '8px 2px',
                            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                            overflowX: 'auto',
                            maxHeight: "400px"
                        }}
                    >
                        <table style={{ minWidth: '1140px', borderCollapse: 'collapse', }}>
                            <thead>
                                <tr style={{
                                    textAlign: 'left', fontFamily: 'Poppins', fontSize: '13px',
                                    color: '#330F1B', fontWeight: 500, borderBottom: '1px solid #E0E0E0'
                                }}>
                                    <th style={{
                                        padding: '6px', textAlign: 'left',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Fecha de alta</th>
                                    <th style={{
                                        padding: '6px', textAlign: 'left',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Cliente</th>
                                    <th style={{
                                        padding: '6px', textAlign: 'left',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Nombre de sala</th>
                                    <th style={{
                                        padding: '6px', textAlign: 'left', whiteSpace: 'nowrap',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos globales</th>
                                    <th style={{
                                        padding: '6px', textAlign: 'left', whiteSpace: 'nowrap',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos SMS # cortos</th>
                                    <th style={{
                                        padding: '6px', textAlign: 'left', whiteSpace: 'nowrap',
                                        fontWeight: 500, color: "#330F1B", fontSize: "13px"
                                    }}>Créditos SMS # Largos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomsData.map((room) => (
                                    <tr key={room.id} style={{ borderBottom: '1px solid #E0E0E0' }}>
                                        <td style={{
                                            padding: '5px', width: '180px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{room.fechaAlta}</td>
                                        <td style={{
                                            padding: '6px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{room.nombrecliente}</td>
                                        <td style={{
                                            padding: '6px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{room.nombreSala}</td>
                                        <td style={{
                                            padding: '6px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{room.creditosGlobales}</td>
                                        <td style={{
                                            padding: '6px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>{room.creditosSmsCortos}</td>
                                        <td style={{
                                            padding: '6px', width: '100px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                            , borderRight: '1px solid #E0E0E0',
                                        }}>{room.creditosSmsLargos}</td>
                                        <td style={{
                                            padding: '6px', width: '40px', whiteSpace: 'nowrap', overflow: 'hidden',
                                            textOverflow: 'ellipsis', fontFamily: 'Poppins', color: "#574B4F", fontSize: "13px"
                                        }}>
                                            <IconButton
                                                onClick={(event) => {
                                                    setAnchorEl(event.currentTarget);
                                                    setSelectedRow(room); // o el item actual
                                                }}
                                            >
                                                <MoreVertIcon sx={{ color: '#7B354D' }} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Box>

                )}
            </Box>
            <Menu
                anchorEl={clientAnchorEl}
                open={clientMenuOpen}
                onClose={() => setClientMenuOpen(false)}
                PaperProps={{
                    sx: {
                        padding: 1,
                        width: 250,
                        borderRadius: '12px',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <TextField
                    placeholder="Buscar cliente"
                    variant="outlined"
                    fullWidth
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value.toLowerCase())}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <img src={seachicon} alt="Buscar" style={{ width: 16 }} />
                            </InputAdornment>
                        ),
                        endAdornment: clientSearch && (
                            <IconButton onClick={() => setClientSearch('')}>
                                <img src={iconclose} alt="Limpiar" style={{ width: 16 }} />
                            </IconButton>
                        ),
                    }}
                    sx={{ mb: 1 }}
                />

                <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {clientsList
                        .filter((c) => c.nombrecliente.toLowerCase().includes(clientSearch.toLowerCase()))
                        .map((client) => (
                            <MenuItem
                                key={client.id}
                                onClick={() =>
                                    setSelectedClients((prev) =>
                                        prev.includes(client.nombrecliente)
                                            ? prev.filter((c) => c !== client.nombrecliente)
                                            : [...prev, client.nombrecliente]
                                    )
                                }
                            >
                                <Checkbox checked={selectedClients.includes(client.nombrecliente)} />
                                <ListItemText primary={client.nombrecliente} />
                            </MenuItem>
                        ))}
                    {clientsList.filter((c) => c.nombrecliente.toLowerCase().includes(clientSearch)).length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500 }}>
                            No se encontraron resultados.
                        </Typography>
                    )}
                </Box>

                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" px={2} pb={1} gap={1}>
                    <SecondaryButton
                        onClick={() => {
                            setSelectedClients([]);
                            setClientSearch('');
                            setClientMenuOpen(false);
                            setRoomsData(originalData.slice(0, 50));
                            setCurrentPage(1);
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            const filtered = originalData.filter((room) =>
                                selectedClients.length === 0 || selectedClients.includes(room.nombrecliente)
                            );

                            setRoomsData(filtered);
                            setClientMenuOpen(false);
                            setCurrentPage(1);
                        }}


                        text="APLICAR"
                    />
                </Box>
            </Menu>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        borderRadius: 2,
                        minWidth: 160,
                        mt: 1,
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
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
                <MenuItem
                    onClick={() => {
                        setRowToDelete(selectedRow);
                        setDeleteModalOpen(true);
                        setAnchorEl(null);
                    }}
                    sx={{
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                        '&:hover': {
                            backgroundColor: '#F2EBED'
                        }
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <img
                            src={Thrashicon}
                            alt="Eliminar"
                            style={{ width: 24, height: 24, color: '#5F5064' }}
                        />
                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', color: "#574B4F" }}>
                            Eliminar
                        </Typography>
                    </Box>
                </MenuItem>
            </Menu>
            <MainModal
                isOpen={deleteModalOpen}
                onPrimaryClick={() => {
                    if (rowToDelete) handleDelete(rowToDelete.id);
                }}
                onSecondaryClick={() => setDeleteModalOpen(false)}
                Title="¿Deseas eliminar esta sala?"
                message={rowToDelete?.nombreSala ?? ''}
                primaryButtonText="Aceptar"
                secondaryButtonText="Cancelar"
            />
        </Box>
    );
};

export default RoomsAdmin;
