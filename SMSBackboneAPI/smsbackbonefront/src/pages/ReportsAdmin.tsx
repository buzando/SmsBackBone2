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
import axios from "../components/commons/AxiosInstance";
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
    const [activeFilter, setActiveFilter] = useState<'fecha' | 'cliente' | null>(null);
    const [anchorElFecha, setAnchorElFecha] = useState<null | HTMLElement>(null);
    const [openFecha, setOpenFecha] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [clientAnchorEl, setClientAnchorEl] = useState<null | HTMLElement>(null);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [selectedClients, setSelectedClients] = useState<Clients[]>([]);
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
    const [totalregisters, Settotalregisters] = useState(0);
    const [pagination, SetPagination] = useState(0);
    const [totaldivision, Settotaldivision] = useState(0);
    const [resetKey, setResetKey] = useState(0);
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
        setSelectedStartDate(null);
        setSelectedStartDate(null);
        setSelectedClients([]);
        setHasFiltered(false);
        setOriginalData([]);
        setAnchorElFecha(null);
        setOpenFecha(false);
        setResetKey(prev => prev + 1);
        setActiveFilter(null);
    };

    const handleFechaClose = () => {
        setOpenFecha(false);
    };
    const GetClients = async () => {
        try {
            const request = `${import.meta.env.VITE_API_GET_CLIENTS}`;
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

    useEffect(() => {
        handleReport(selectedStartDate, selectedEndDate, activeTab);
    }, [currentPage]);

    const handleReport = async (start: Date | null, end: Date | null, tab: number) => {
        if (!start || !end) return;

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_GET_REPORTSADMIN}`, {
                fechaInicio: start.toISOString(),
                fechaFin: end.toISOString(),
                tipoReporte: tab,
                Page: currentPage,
                clientIds: selectedClients.map(c => c.id),
            });
            if (response.status == 200) {
                const datos = response.data;
                setHasFiltered(true);
                setOriginalData(datos.items);
                setFilteredData(datos.items);
                Settotalregisters(datos.total);
                SetPagination(datos.pagination);
                Settotaldivision(Math.ceil(datos.total / datos.pagination));
            }
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

    const exportReport2 = async (
        format: 'pdf' | 'xlsx' | 'csv',
        callback: () => void
    ) => {
        try {
            const payload = {
                ReportType: "ReportesAdmin",
                Format: format,
                PageOrigin: activeTab.toString(),
                StartDate: selectedStartDate?.toISOString(),
                EndDate: selectedEndDate?.toISOString(),
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_GETREPORTS_ALL}`,
                payload
            );

            if (response.data?.success && response.data?.downloadUrl) {
                const responsedata = await fetch("/Quantum/Download/" + response.data?.fileName);
                const blob = await responsedata.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = response.data?.fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            } else {
                console.error("Error: No se generó el archivo.");
            }
        } catch (error) {
            console.error(`Error al exportar reporte a ${format}:`, error);
        } finally {
            callback();
        }
    };

    const handleExportClick = (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        setTimeout(() => {
            exportReport2(format, () => setThisLoading(false));
        }, 1000);
    };

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => setCurrentPage(totaldivision);

    const handleNextPage = () => {
        if (currentPage < totaldivision) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };


    return (
        <Box p={3} sx={{ marginTop: "-80px", width: '100%', minHeight: 'calc(100vh - 80px)', overflow: 'hidden' }}>
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




                    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" mt={-0.5} mb={-0.5}>
                        {/* Paginación + texto */}
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#6F565E", whiteSpace: "nowrap" }}>
                                {`${(currentPage - 1) * pagination + 1}–${Math.min(currentPage * pagination, totalregisters)} de ${totalregisters}`}
                            </Typography>

                            {/* Botones de navegación */}
                            <Tooltip title="Primera página" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton onClick={goToFirstPage} disabled={currentPage === 1}>
                                    <Box display="flex" alignItems="center" sx={{ opacity: currentPage === 1 ? 0.3 : 1 }}>
                                        <img src={backarrow} style={{ width: 24, marginRight: "-16px" }} />
                                        <img src={backarrow} style={{ width: 24 }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Página anterior" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                                    <img src={backarrow} style={{ width: 24, opacity: currentPage === 1 ? 0.3 : 1, marginLeft: "-18px" }} />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Siguiente página" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton onClick={handleNextPage} disabled={currentPage === totaldivision}>
                                    <img
                                        src={backarrow}
                                        style={{
                                            width: 24,
                                            transform: 'rotate(180deg)',
                                            marginRight: "-28px",
                                            marginLeft: "-28px",
                                            opacity: currentPage === totaldivision ? 0.3 : 1
                                        }}
                                    />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Última página" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton onClick={goToLastPage} disabled={currentPage === Math.ceil(pagination / totalregisters)}>
                                    <Box display="flex" alignItems="center" sx={{ opacity: currentPage === totaldivision ? 0.3 : 1 }}>
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-6px" }} />
                                        <img src={backarrow} style={{ width: 24, transform: 'rotate(180deg)', marginLeft: "-16px" }} />
                                    </Box>
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Botones de exportación */}
                        <Box display="flex" alignItems="center" gap={1}>
                            <Tooltip title="Exportar a CSV" placement="top" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton
                                    onClick={() => handleExportClick('csv', setIsExportingCSV)}
                                    disabled={anyExporting && !isExportingCSV}
                                    sx={{ opacity: !isExportingCSV && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingCSV ? <DualSpinner /> : <img src={IconDownloadCSV} alt="CSV" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a Excel" placement="top" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
                                <IconButton
                                    onClick={() => handleExportClick('xlsx', setIsExportingXLSX)}
                                    disabled={anyExporting && !isExportingXLSX}
                                    sx={{ opacity: !isExportingXLSX && anyExporting ? 0.3 : 1 }}
                                >
                                    {isExportingXLSX ? <DualSpinner /> : <img src={IconDownloadExcel} alt="Excel" />}
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exportar a PDF" placement="top" componentsProps={{ tooltip: { sx: tooltipStyle }, arrow: { sx: arrowStyle } }} arrow>
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
                                            borderRadius: '12px',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                                            maxHeight: '350px', // Fija la altura visible
                                            overflowY: 'auto',   // Scroll solo vertical
                                        }}
                                        >
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontFamily: 'Poppins',
                                                                    color: '#574B4F',
                                                                    fontSize: '13px',
                                                                    maxWidth: 180,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}

                                                            >
                                                                {key}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody
                                                    sx={{
                                                        display: 'block',
                                                        maxHeight: '370px',
                                                        overflowY: 'auto',
                                                    }}>
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
                                        <TableContainer
                                            component={Paper}
                                            sx={{
                                                borderRadius: '12px',
                                                boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                                                maxHeight: '350px', // Fija la altura visible
                                                overflowY: 'auto',   // Scroll solo vertical
                                            }}
                                        >
                                            <Table stickyHeader>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontFamily: 'Poppins',
                                                                    color: '#5A2836',
                                                                    fontSize: '13px',
                                                                    backgroundColor: '#F5F5F5',
                                                                }}
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
                                                                <TableCell
                                                                    key={key}
                                                                    sx={{
                                                                        fontWeight: 500,
                                                                        fontFamily: 'Poppins',
                                                                        color: '#574B4F',
                                                                        fontSize: '13px',
                                                                    }}
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
                                        <TableContainer component={Paper} sx={{
                                            borderRadius: '12px',
                                            boxShadow: '0 0 10px rgba(0,0,0,0.05)',
                                            maxHeight: '350px', // Fija la altura visible
                                            overflowY: 'auto',   // Scroll solo vertical
                                        }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {Object.keys(originalData[0]).map((key) => (
                                                            <TableCell
                                                                key={key}
                                                                sx={{
                                                                    fontWeight: 500,
                                                                    fontFamily: 'Poppins',
                                                                    color: '#574B4F',
                                                                    fontSize: '13px',
                                                                    maxWidth: 180,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}

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
                                        prev.includes(client)
                                            ? prev.filter((c) => c !== client)
                                            : [...prev, client]
                                    )
                                }
                                sx={{ height: "32px", marginLeft: "-12px" }}
                            >
                                <Checkbox checked={selectedClients.includes(client)}
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
                                        color: selectedClients.includes(client) ? '#8F4E63' : '#786E71',
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
                            handleReport(selectedStartDate, selectedEndDate, activeTab);
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            setClientMenuOpen(false);
                            handleReport(selectedStartDate, selectedEndDate, activeTab);
                        }}
                        text="APLICAR"
                    />
                </Box>
            </Menu>
            <CustomDateTimePicker
                key={resetKey}
                open={openFecha}
                anchorEl={anchorElFecha}
                onClose={handleFechaClose}
                onApply={(startDate, endDate) => {
                    handleDateRangeChange(new Date(startDate), endDate)
                }}
                placement="bottom-start"
            />
        </Box>
    );
};
const tooltipStyle = {
    fontFamily: 'Poppins',
    backgroundColor: '#312D2E',
    color: '#DEDADA',
    fontSize: '12px',
    borderRadius: '6px',
    padding: '6px 10px',
};

const arrowStyle = {
    color: '#322D2E',
};

export default ReportsAdmin;