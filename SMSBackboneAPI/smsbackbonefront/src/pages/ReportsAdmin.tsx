import React, { useEffect, useState } from 'react';
import {
    Box, IconButton, Tab, Tabs, Typography, Divider, TextField, MenuItem, Menu, Checkbox, InputAdornment, ListItemText, Tooltip, CircularProgress,
    TableContainer, Table, Paper, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
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
import IconCheckBox1 from "../assets/IconCheckBox1.svg";

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
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
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
                    <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6F565E" }}>
                        {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, originalData.length)} de {originalData.length}
                    </Typography>


                    {/* Flechas + Exportaciones */}
                    <Box display="flex" alignItems="center" gap={1} height={"25px"} marginBottom={"-5px"} marginTop={"-5px"}>
                        <Box sx={{ marginRight: "790px" }}>
                            <Tooltip title="Primera página">
                                <IconButton onClick={goToFirstPage} disabled={currentPage === 1}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage === 1 ? 0.3 : 1
                                        }}
                                    >
                                        <img src={backarrow} style={{ width: 24, marginRight: "-16px" }} />
                                        <img src={backarrow} style={{ width: 24 }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Página Anterior">
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                    <img src={backarrow} style={{ width: 24, opacity: currentPage === 1 ? 0.3 : 1, marginLeft: "-18px" }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Siguiente página">
                                <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    <img src={backarrow} style={{
                                        width: 24, transform: 'rotate(180deg)', marginRight: "-28px", marginLeft: "-28px",
                                        opacity: currentPage === totalPages ? 0.3 : 1
                                    }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Ultima Página">
                                <IconButton onClick={goToLastPage} disabled={currentPage === totalPages}>
                                    <Box
                                        display="flex"
                                        gap="0px"
                                        alignItems="center"
                                        sx={{
                                            opacity: currentPage === 1 ? 0.3 : 1
                                        }}
                                    >
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-6px" }} />
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-16px" }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Exportaciones */}
                        <Box display="flex" alignItems="center" gap={0} mr={-2.5}>
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
                <Box mt={0}>
                    {!hasFiltered ? (
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
                            <img src={emptybox} alt="Sin resultados" style={{ width: 240, marginBottom: 16 }} />
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
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                backgroundColor: "#FFFFFF",
                                padding: "60px 0",
                                borderRadius: "8px",
                                border: "1px solid #E0E0E0",
                                height: "410px"
                            }}
                        >
                            <img src={NoResult} alt="Sin resultados" style={{ width: 240, marginBottom: 16 }} />
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
                                        <TableContainer component={Paper} sx={{
                                            borderRadius: '12px', boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                                            height: "410px", overflowY: "auto"
                                        }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#5A2836', fontSize: "13px" }}
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
                                                                <TableCell key={key}
                                                                    sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#574B4F', fontSize: "13px" }}

                                                                >
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
                                            height="410px"
                                            width="100%"
                                        >
                                            <img src={NoResult} alt="No hay resultados" style={{ width: 0, height: 140, opacity: 0.7 }} />
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
                                                                sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#5A2836', fontSize: "13px" }}
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
                                                                <TableCell key={key}
                                                                    sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#574B4F', fontSize: "13px" }}
                                                                >
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
                                                                sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#5A2836', fontSize: "13px" }}
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
                                                                <TableCell key={key}
                                                                    sx={{ fontWeight: 500, fontFamily: 'Poppins', color: '#574B4F', fontSize: "13px" }}

                                                                >
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
                        width: "280px",
                        height: "282px",
                        overflowY: "hidden",
                        borderRadius: '12px',
                        boxShadow: '0px 8px 16px #00131F29',
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <TextField
                        placeholder="Buscar cliente"
                        variant="outlined"
                        fullWidth
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value.toLowerCase())}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <img
                                        src={seachicon}
                                        alt="Buscar"
                                        style={{
                                            width: 24,
                                            filter: clientSearch ? 'invert(14%) sepia(58%) saturate(1253%) hue-rotate(316deg) brightness(90%) contrast(95%)' : 'none'
                                        }}
                                    />
                                </InputAdornment>
                            ),
                            endAdornment: clientSearch && (
                                <IconButton onClick={() => setClientSearch('')}>
                                    <img src={iconclose} alt="Limpiar" style={{ width: 24 }} />
                                </IconButton>
                            ),
                            sx: {
                                fontFamily: 'Poppins',
                                color: clientSearch ? '#7B354D' : '#000',
                            }
                        }}
                        inputProps={{
                            style: {
                                fontFamily: 'Poppins',
                                color: clientSearch ? '#7B354D' : '#000',
                            }
                        }}
                        sx={{
                            width: '248px',
                            height: '40px',
                            mb: 1,
                            '& .MuiOutlinedInput-root': {
                                height: '40px',
                                border: '1px solid #9B9295',
                                '& fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                                '&:hover fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: clientSearch ? '#7B354D' : '#9B9295',
                                },
                            },
                        }}
                    />
                </Box>

                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                <Box sx={{ height: '126px', overflowY: 'auto' }}>
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
                                sx={{ height: "32px", marginLeft: "-12px" }}
                            >
                                <Checkbox checked={selectedClients.includes(client.nombrecliente)}
                                    checkedIcon={
                                        <Box
                                            sx={{
                                                width: '24px',
                                                height: '24px',
                                                position: 'relative',
                                                marginTop: '0px',
                                                marginLeft: '0px',
                                            }}
                                        >
                                            <img
                                                src={IconCheckBox1}
                                                alt="Seleccionado"
                                                style={{ width: '24px', height: '24px' }}
                                            />
                                        </Box>
                                    }
                                />
                                <ListItemText primary={client.nombrecliente}
                                    primaryTypographyProps={{
                                        fontFamily: 'Poppins',
                                        fontSize: '16px',
                                        fontWeight: 500,
                                        color: selectedClients.includes(client.nombrecliente) ? '#8F4E63' : '#786E71',
                                    }}
                                />
                            </MenuItem>
                        ))}
                    {clientsList.filter((c) => c.nombrecliente.toLowerCase().includes(clientSearch)).length === 0 && (
                        <Box sx={{ marginTop: "60px" }}>
                            <Typography sx={{ textAlign: 'center', color: '#7B354D', fontSize: '14px', fontWeight: 500, fontFamily: "Poppins" }}>
                                No se encontraron resultados.
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 1.5, mt: 1 }} />

                <Box display="flex" justifyContent="space-between" px={1} pb={1} gap={2.5}>
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