import React, { useEffect, useState } from 'react';
import {
    Box, IconButton, Tab, Tabs, Typography, Divider, TextField, MenuItem, Menu, Checkbox, InputAdornment, ListItemText, Tooltip, CircularProgress,
    TableContainer, Table, Paper, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';
import CustomDateTimePicker from '../components/commons/DatePicker';
import SecondaryButton from '../components/commons/SecondaryButton';
import MainButton from '../components/commons/MainButton';
import axios from 'axios';
import dayjs from 'dayjs';
import seachicon from '../assets/icon-lupa.svg';
import iconclose from "../assets/icon-close.svg";
import IconDownloadCSV from '../assets/IconCSV.svg';
import IconDownloadExcel from '../assets/IconExcel.svg';
import IconDownloadPDF from '../assets/IconPDF.svg';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import backarrow from '../assets/MoveTable.svg';
import emptybox from '../assets/Nousers.svg';
import NoResult from '../assets/NoResultados.svg';

interface Clients {
    id: number;
    nombrecliente: string;
}

const ReportsAdmin = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [activeFilter, setActiveFilter] = useState<'fecha' | 'cliente'>('cliente');
    const [anchorElFecha, setAnchorElFecha] = useState<null | HTMLElement>(null);
    const [openFecha, setOpenFecha] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [clientAnchorEl, setClientAnchorEl] = useState<null | HTMLElement>(null);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [clientsList, setClientsList] = useState<Clients[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [originalData, setOriginalData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [page, setPage] = useState(0);
    const [itemsPerPage] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isExportingCSV, setIsExportingCSV] = useState(false);
    const [isExportingXLSX, setIsExportingXLSX] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const [rowsPerPage] = useState(50);
    const [errorModal, setErrorModal] = useState(false);
    const anyExporting = isExportingCSV || isExportingXLSX || isExportingPDF;
    const [hasFiltered, setHasFiltered] = useState(false);
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

    const handleChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleFechaClose = () => {
        setOpenFecha(false);
    };
    const GetClients = async () => {
        try {
            const request = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_CLIENTS}`;
            const response = await axios.get<Clients[]>(request);
            if (response.status === 200) {
                const fetchedClient = response.data;
                const uniqueClients: Clients[] = [
                    ...new Map(fetchedClient.map((item) => [item.nombrecliente, item])).values()
                ];
                setClientsList(uniqueClients);
            }
        } catch (err) {
            console.error("Error al obtener clientes:", err);
        }
    };
    const handleReport = async (start: Date | null, end: Date | null, tab: number) => {
        if (!start || !end) return;

        try {
            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_REPORTSADMIN}`, {
                fechaInicio: start.toISOString(),
                fechaFin: end.toISOString(),
                tipoReporte: tab
            });
            const datos = response.data;
            setHasFiltered(true);
            setOriginalData(datos);
            setFilteredData(datos.slice(0, rowsPerPage));
        } catch (error) {
            console.error('Error al obtener el reporte:', error);
        }
    };

    const handleDateRangeChange = (start: Date, end: Date) => {
        setSelectedStartDate(new Date(start));
        setSelectedEndDate(new Date(end));
        setOpenFecha(false);
        handleReport(new Date(start), new Date(end), activeTab);
    };
    useEffect(() => {
        GetClients();
    }, []);



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
        const data = originalData;
        const cleanData = data.map((item) => {
            const result: { [key: string]: any } = {};
            Object.keys(item).forEach((key) => {
                const value = item[key];
                result[key] =
                    typeof value === 'string' || typeof value === 'number'
                        ? value
                        : value instanceof Date
                            ? dayjs(value).format('DD/MM/YYYY HH:mm')
                            : value !== null && typeof value === 'object'
                                ? JSON.stringify(value)
                                : value;
            });
            return result;
        });
        try {
            if (data.length <= MAX_RECORDS_LOCAL) {

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
                    saveAs(blob, 'DescargarReporte.xlsx');
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
                    pdf.save('DescargarReporte.pdf');
                }
            } else {
                const payload = { Formato: format };
                const response = await axios.post(
                    '${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_EXPORT_NUMBERS}',
                    payload,
                    { headers: { 'Content-Type': 'application/json' }, responseType: 'blob' }
                );

                const blob = new Blob([response.data], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `DescargarReporte.${format}`);
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

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => setCurrentPage(totalPages);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    return (
        <Box p={3} sx={{ marginTop: "-80px", width: '90%', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={() => navigate('/')}>
                    <ArrowBackIosNewIcon sx={{ color: "#330F1B" }} />
                </IconButton>
                <Typography sx={{ fontSize: "24px", fontFamily: "Poppins", fontWeight: 500, color: "#330F1B", ml: 1 }}>
                    Reportes
                </Typography>
            </Box>
            <Box sx={{ marginLeft: "32px", }}>
                <Divider sx={{ marginBottom: "0px", marginTop: "16px" }} />
                <Tabs
                    value={activeTab}
                    onChange={handleChange}
                    textColor="inherit"
                    indicatorColor="primary"
                    TabIndicatorProps={{
                        sx: {
                            backgroundColor: '#7B354D',
                            display: 'none',
                        }
                    }}
                    sx={{
                        minHeight: '43px',
                    }}
                >
                    {['Facturación', 'Consumo de cliente', 'Consumo de sistema'].map((label, index) => (
                        <Tab
                            key={index}
                            label={label}
                            sx={{
                                minWidth: '109px',
                                px: 2,
                                height: '43px',
                                fontFamily: 'Poppins',
                                fontStyle: 'normal',
                                fontWeight: 500,
                                fontSize: '16px',
                                lineHeight: '25px',
                                textTransform: 'none',
                                color: '#574B4F',
                                backgroundColor: 'transparent',
                                '&:hover': {
                                    backgroundColor: '#EDD5DC99',
                                    color: '#864058',
                                },
                                '&.Mui-selected': {
                                    color: '#864058',
                                    backgroundColor: '#EDD5DC99',
                                },
                            }}
                        />
                    ))}
                </Tabs>
                <Divider sx={{ marginBottom: "15px", marginTop: "0px" }} />
                <Box sx={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px', mt: 1 }}>
                    {['FECHA', 'CLIENTE'].map((label) => {
                        const key = label.toLowerCase() as 'fecha' | 'cliente';
                        const isActive = activeFilter === key;
                        const isFecha = key === 'fecha';
                        const isCliente = key === 'cliente';
                        const hasFechas = selectedStartDate && selectedEndDate;
                        const fechaLabel = hasFechas
                            ? `${dayjs(selectedStartDate).format('D MMM, HH:mm')} – ${dayjs(selectedEndDate).format('D MMM HH:mm')}`
                            : 'FECHA';

                        return (
                            <Box
                                key={label}
                                onClick={(event) => {
                                    setActiveFilter(key);
                                    if (key === 'fecha') {
                                        setAnchorElFecha(event.currentTarget);
                                        setOpenFecha(true);
                                    } else if (key === 'cliente') {
                                        setClientAnchorEl(event.currentTarget);
                                        setClientMenuOpen(true);
                                    }
                                }}
                                sx={{
                                    px: '16px',
                                    py: '6px',
                                    border: '1px solid',
                                    borderColor: isActive ? '#7B354D' : '#CFCFCF',
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    fontFamily: 'Poppins',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    backgroundColor: isActive ? '#F6EEF1' : '#FFFFFF',
                                    color: isActive ? '#7B354D' : '#9B9295',
                                    transition: 'all 0.2s ease-in-out',
                                    userSelect: 'none', marginBottom: "-10px"
                                }}
                            >
                                {isFecha ? fechaLabel : label}
                            </Box>
                        );
                    })}
                </Box>

                {/* Divider inferior opcional */}
                <Divider sx={{ marginBottom: "5px" }} />
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
                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, originalData.length)} de {originalData.length}
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
                <Box mt={3}>
                    {!hasFiltered ? (
                        // Caja cerrada al entrar a la vista
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                backgroundColor: "#FAFAFA",
                                padding: "60px 0",
                                borderRadius: "8px",
                                border: "1px solid #E0E0E0"
                            }}
                        >
                            <img src={emptybox} alt="Sin resultados" style={{ width: 120, marginBottom: 16 }} />
                            <Typography
                                sx={{
                                    fontFamily: "Poppins",
                                    fontSize: "16px",
                                    color: "#7B354D",
                                    fontWeight: 500
                                }}
                            >
                                Usa los filtros para generar un reporte.
                            </Typography>
                        </Box>
                    ) : originalData.length === 0 ? (
                        // Caja abierta si no hay resultados después de aplicar filtro
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                backgroundColor: "#FAFAFA",
                                padding: "60px 0",
                                borderRadius: "8px",
                                border: "1px solid #E0E0E0"
                            }}
                        >
                            <img src={NoResult} alt="Sin resultados" style={{ width: 120, marginBottom: 16 }} />
                            <Typography
                                sx={{
                                    fontFamily: "Poppins",
                                    fontSize: "16px",
                                    color: "#7B354D",
                                    fontWeight: 500
                                }}
                            >
                                No se encontraron resultados.
                            </Typography>
                        </Box>
                    ) : (

                        <>
                            {activeTab === 0 && (
                                <>
                                    {Array.isArray(originalData) && originalData.length > 0 ? (
                                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{ fontWeight: 'bold', fontFamily: 'Poppins', color: '#5A2836' }}
                                                            >
                                                                {key}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {originalData.map((row: any, index: number) => (
                                                        <TableRow key={index}>
                                                            {Object.keys(row).map((key) => (
                                                                <TableCell key={key}>
                                                                    {typeof row[key] === 'string' || typeof row[key] === 'number'
                                                                        ? row[key]
                                                                        : row[key] instanceof Date
                                                                            ? dayjs(row[key]).format('DD/MM/YYYY HH:mm')
                                                                            : row[key] !== null && typeof row[key] === 'object'
                                                                                ? JSON.stringify(row[key])
                                                                                : row[key]}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            flexDirection="column"
                                            height="400px"
                                            width="100%"
                                        >
                                            <img src={NoResult} alt="No hay resultados" style={{ width: 140, height: 140, opacity: 0.7 }} />
                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                    color: '#5A2836',
                                                    fontFamily: 'Poppins',
                                                    fontWeight: 'medium',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                No se encontraron resultados.
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            )}

                            {activeTab === 1 &&
                                <>
                                    {Array.isArray(originalData) && originalData.length > 0 ? (
                                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{ fontWeight: 'bold', fontFamily: 'Poppins', color: '#5A2836' }}
                                                            >
                                                                {key}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {originalData.map((row: any, index: number) => (
                                                        <TableRow key={index}>
                                                            {Object.keys(row).map((key) => (
                                                                <TableCell key={key}>
                                                                    {typeof row[key] === 'string' || typeof row[key] === 'number'
                                                                        ? row[key]
                                                                        : row[key] instanceof Date
                                                                            ? dayjs(row[key]).format('DD/MM/YYYY HH:mm')
                                                                            : row[key] !== null && typeof row[key] === 'object'
                                                                                ? JSON.stringify(row[key])
                                                                                : row[key]}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            flexDirection="column"
                                            height="400px"
                                            width="100%"
                                        >
                                            <img src={NoResult} alt="No hay resultados" style={{ width: 140, height: 140, opacity: 0.7 }} />
                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                    color: '#5A2836',
                                                    fontFamily: 'Poppins',
                                                    fontWeight: 'medium',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                No se encontraron resultados.
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            }
                            {activeTab === 2 &&
                                <>
                                    {Array.isArray(originalData) && originalData.length > 0 ? (
                                        <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.05)' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{ fontWeight: 'bold', fontFamily: 'Poppins', color: '#5A2836' }}
                                                            >
                                                                {key}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {originalData.map((row: any, index: number) => (
                                                        <TableRow key={index}>
                                                            {Object.keys(row).map((key) => (
                                                                <TableCell key={key}>
                                                                    {typeof row[key] === 'string' || typeof row[key] === 'number'
                                                                        ? row[key]
                                                                        : row[key] instanceof Date
                                                                            ? dayjs(row[key]).format('DD/MM/YYYY HH:mm')
                                                                            : row[key] !== null && typeof row[key] === 'object'
                                                                                ? JSON.stringify(row[key])
                                                                                : row[key]}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Box
                                            display="flex"
                                            justifyContent="center"
                                            alignItems="center"
                                            flexDirection="column"
                                            height="400px"
                                            width="100%"
                                        >
                                            <img src={NoResult} alt="No hay resultados" style={{ width: 140, height: 140, opacity: 0.7 }} />
                                            <Typography
                                                sx={{
                                                    mt: 1,
                                                    color: '#5A2836',
                                                    fontFamily: 'Poppins',
                                                    fontWeight: 'medium',
                                                    fontSize: '16px',
                                                }}
                                            >
                                                No se encontraron resultados.
                                            </Typography>
                                        </Box>
                                    )}
                                </>
                            }
                        </>
                    )}
                </Box>
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
                        .filter((c) => c.nombrecliente.toLowerCase().includes(clientSearch))
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
                            // Aquí podrías resetear los datos si aplicas filtros
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            setClientMenuOpen(false);
                            // Aquí puedes aplicar lógica si quieres filtrar por cliente
                        }}
                        text="APLICAR"
                    />
                </Box>
            </Menu>
            <CustomDateTimePicker
                open={openFecha}
                anchorEl={anchorElFecha}
                onClose={handleFechaClose}
                onApply={(startDate, endDate) => {
                    handleDateRangeChange(new Date(startDate), endDate)
                }}
            />
        </Box>
    );
};

export default ReportsAdmin;