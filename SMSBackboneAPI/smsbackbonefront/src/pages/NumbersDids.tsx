import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Divider, IconButton, Checkbox, TextField, InputAdornment, Tooltip, CircularProgress, FormControl, Paper, List, ListItemButton } from '@mui/material';
import { Modal, Tabs, Tab, Button, Select, Switch, FormControlLabel, ToggleButtonGroup, ToggleButton, InputLabel, Grid, Popper, ClickAwayListener } from '@mui/material';
import MainIcon from '../components/commons/MainButtonIcon';
import seachicon from '../assets/icon-lupa.svg';
import iconclose from '../assets/icon-close.svg';
import BoxEmpty from '../assets/Nousers.svg';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IconDownloadCSV from '../assets/IconCSV.svg';
import IconDownloadExcel from '../assets/IconExcel.svg';
import IconDownloadPDF from '../assets/IconPDF.svg';
import backarrow from '../assets/MoveTable.svg';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import DeleteIcon from '@mui/icons-material/Delete';
import MainButton from '../components/commons/MainButton'
import SecondaryButton from '../components/commons/SecondaryButton'
import NoResult from '../assets/NoResultados.svg'; // Ajusta la ruta si cambia
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CloseIcon from '@mui/icons-material/Close';
import IconPlusCircle from '../assets/IconPlusCircle.svg'
import IconPlusUnselected from '../assets/IconPlusUnselected.svg'
import IconMinusSelected from '../assets/IconMinusSelected.svg'
import IconUpdateSelected from '../assets/IconUpdateSelected.svg'
import IconNegativeCircle from '../assets/IconNegativeCircle.svg'
import IconReUpdate1 from '../assets/IconReUpdate1.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import infoicon from '../assets/Icon-info.svg'
import Thrashicon from '../assets/Icon-trash-Card.svg'
import IconCloudError from '../assets/IconCloudError.svg'
import CloudCheckedIcon from '../assets/CloudCheckedIcon.svg'
import UpCloudIcon from '../assets/UpCloudIcon.svg'
import IconPlus2 from '../assets/IconPlus2.svg';
import { SelectChangeEvent } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ModalError from "../components/commons/ModalError";
import LinearProgress from '@mui/material/LinearProgress';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface NumberData {
    Id: number;
    Number: string;
    Type: string;
    Service: string;
    Cost: number;
    NextPaymentDate: string;
    State: string;
    Municipality: string;
    Lada: string;
    Estatus: string;
    IdClient: number;
}

interface Clients {
    id: number;
    nombrecliente: string;
}
interface FormData {
    Name: string;
    Phones: string[];
    ExpirationDate: Date | null;
    File: string;
}


const NumbersDids: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<'servicio' | 'cliente' | 'estatus' | ''>(''); // ejemplo
    const [numbersData, setNumbersData] = useState<NumberData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [currentItems, setCurrentItems] = useState<any[]>([]);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuRowId, setMenuRowId] = useState<number | null>(null);
    const open = Boolean(anchorEl);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const [serviceAnchorEl, setServiceAnchorEl] = useState<null | HTMLElement>(null);
    const openServiceFilter = Boolean(serviceAnchorEl);
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [originalData, setOriginalData] = useState<NumberData[]>([]);
    const [clientsList, setClientsList] = useState<Clients[]>([]);
    const [clientMenuOpen, setClientMenuOpen] = useState(false);
    const [clientAnchorEl, setClientAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [statusMenuOpen, setStatusMenuOpen] = useState(false);
    const [isExportingCSV, setIsExportingCSV] = useState(false);
    const [isExportingXLSX, setIsExportingXLSX] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const anyExporting = isExportingCSV || isExportingXLSX || isExportingPDF;
    const [tab, setTab] = useState(0);
    const [channel, setChannel] = useState<'corto' | 'largo'>('corto');
    const [ShowModal, setShowModal] = useState(false);
    const [sourceType, setSourceType] = useState<'file' | 'individual'>('file');
    const [manageByIndividual, setManageByIndividual] = useState(false);
    const [manageOperation, setManageOperation] = useState<'agregar' | 'eliminar' | 'darDeBaja'>('agregar');
    const [manageByList, setManageByList] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileError, setFileError] = useState(false);
    const [fileSuccess, setFileSuccess] = useState(false);
    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [excelData, setExcelData] = useState<any[][]>([]);
    const [base64File, setBase64File] = useState('');
    const [showColumnOptions, setShowColumnOptions] = useState(true);
    const [selectedSheet, setSelectedSheet] = useState('');
    const [uploadedFileBase64, setUploadedFileBase64] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [workbook, setWorkbook] = useState<any>(null);
    const [selectedDatoCol, setSelectedDatoCol] = useState('');
    const [selectedTelefonoCol, setSelectedTelefonoCol] = useState('');
    const [individualPhones, setIndividualPhones] = useState<string[]>([]);
    const [selectedChannel, setSelectedChannel] = useState('');
    const [isShared, setIsShared] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Clients | null>(null);
    const [clientAnchorEl2, setClientAnchorEl2] = useState<null | HTMLElement>(null);
    const [clientSearch2, setClientSearch2] = useState('');
    const [errorModal, setErrorModal] = useState(false);
    const openClientPopper2 = Boolean(clientAnchorEl2);
    const [showUploadStatusModal, setShowUploadStatusModal] = useState(false);
    const [detailedView, setDetailedView] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [totalRecords, setTotalRecords] = useState<number>(0);

    const [uploadSummary, setUploadSummary] = useState<{
        success: number;
        failed: number;
        total: number;
        fileName?: string;
        errors?: {
            minLength: number;
            specialChars: number;
            alphanumeric: number;
            duplicated?: number;
        };
    } | null>(null);

    const [formData, setFormData] = useState<FormData>({
        Name: '',
        Phones: [''],
        ExpirationDate: null,
        File: '',
    });
    const handleCloseModal = () => setShowModal(false);
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

    const handleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === numbersData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(numbersData.map((n) => n.Id));
        }
    };


    const GetNumbers = async () => {
        setLoading(true);

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL +
                import.meta.env.VITE_API_GET_ALLNUMBERS}`;
            const response = await axios.get(request);

            if (response.status === 200) {
                const fetchedNumbers = response.data;
                setOriginalData(fetchedNumbers);
                setNumbersData(fetchedNumbers.slice(0, 50));
            }
        } catch {

        } finally {
            setLoading(false);
        }
    }

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
        GetNumbers();
    }, []);


    const handleExportClick = (
        format: 'csv' | 'xlsx' | 'pdf',
        setThisLoading: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
        setThisLoading(true);
        setTimeout(() => {
            exportNumbers(format, () => setThisLoading(false));
        }, 1000);
    };

    const goToFirstPage = () => setCurrentPage(1);

    const goToLastPage = () => setCurrentPage(totalPages);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };


    useEffect(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        setCurrentItems(numbersData.slice(start, end)); // numbersData = tu lista completa
        setTotalItems(numbersData.length);
        setTotalPages(Math.ceil(numbersData.length / itemsPerPage));
    }, [numbersData, currentPage]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, rowId: number) => {
        setAnchorEl(event.currentTarget);
        setMenuRowId(rowId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRowId(null);
    };


    const filteredData = numbersData.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.Number.toLowerCase().includes(term) ||
            item.Type.toLowerCase().includes(term) ||
            item.Service.toLowerCase().includes(term) || // Aquí se filtran los servicios
            item.State.toLowerCase().includes(term) ||
            item.Municipality.toLowerCase().includes(term) ||
            item.Estatus.toLowerCase().includes(term)
        );
    });

    const paginatedData = filteredData.slice(startIndex, endIndex);

    const handleApplyServiceFilter = () => {
        const tiposSeleccionados: Array<'Corto' | 'Largo' | 'Llamada'> = selectedServices
            .map((s) =>
                s === 'SMS # cortos' ? 'Corto' :
                    s === 'SMS # largos' ? 'Largo' :
                        s === 'Llamada' ? 'Llamada' :
                            ''
            )
            .filter((s): s is 'Corto' | 'Largo' | 'Llamada' => !!s);

        const lowerSearch = searchTerm.toLowerCase();

        const filtered = originalData.filter((item) => {
            const matchType =
                tiposSeleccionados.length === 0 || tiposSeleccionados.includes(item.Type as 'Corto' | 'Largo' | 'Llamada');
            const matchSearch =
                !searchTerm ||
                item.Number.toLowerCase().includes(lowerSearch) ||
                item.Type.toLowerCase().includes(lowerSearch) ||
                item.Service.toLowerCase().includes(lowerSearch) ||
                item.State.toLowerCase().includes(lowerSearch) ||
                item.Municipality.toLowerCase().includes(lowerSearch) ||
                item.Estatus.toLowerCase().includes(lowerSearch);

            return matchType && matchSearch;
        });

        setNumbersData(filtered);
        setServiceAnchorEl(null);
        setCurrentPage(1);
    };

    const handleClearServiceFilter = () => {
        setSearchTerm('');
        setSelectedServices([]);
        setNumbersData(originalData.slice(0, 50));
        setCurrentPage(1);
        setServiceAnchorEl(null);
    };

    const selectedCount = selectedServices.length;
    const servicioLabel =
        selectedCount === 0
            ? 'SERVICIO'
            : `${selectedCount} SERVICIO${selectedCount > 1 ? 'S' : ''}`;


    const exportNumbers = async (
        format: 'csv' | 'xlsx' | 'pdf',
        onComplete?: () => void
    ) => {
        const MAX_RECORDS_LOCAL = 100000;
        const data = numbersData;

        try {
            if (data.length <= MAX_RECORDS_LOCAL) {
                const cleanData = data.map(item => ({
                    Número: item.Number,
                    Tipo: item.Type,
                    Servicio: item.Service,
                    Estado: item.State,
                    Municipio: item.Municipality,
                    Lada: item.Lada,
                    Estatus: item.Estatus,
                    FechaPago: item.NextPaymentDate,
                    Costo: item.Cost
                }));

                if (format === 'csv') {
                    const csv = unparse(cleanData);
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    saveAs(blob, 'NumerosDID.csv');
                } else if (format === 'xlsx') {
                    const worksheet = XLSX.utils.json_to_sheet(cleanData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'NumerosDID');
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    const blob = new Blob([excelBuffer], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    saveAs(blob, 'NumerosDID.xlsx');
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
                    pdf.save('NumerosDID.pdf');
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
                link.setAttribute('download', `NumerosDID.${format}`);
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

    const handleFile = (file: File) => {
        const isValid = file.name.endsWith('.xlsx');

        if (!isValid) {
            setUploadedFile(null);
            setFileError(true);
            setFileSuccess(false);
            setSheetNames([]);
            setColumns([]);
            setExcelData([]);
            setBase64File('');
            setTotalRecords(0);
            setSelectedFileName('');
            return;
        }
        setSelectedFileName(file.name);
        setUploadedFile(file);
        setFileError(false);
        setFileSuccess(true);
        setShowColumnOptions(true);

        const reader = new FileReader();

        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            const sheetNames = workbook.SheetNames;
            setSheetNames(sheetNames);
            setSelectedSheet('');

            const sheet = workbook.Sheets[sheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

            setExcelData(jsonData);
            setColumns(jsonData[0] as string[]);

            // ✅ Contar registros en columna A (sin encabezado)
            const total = jsonData.slice(1).filter(row => !!row[0] && row[0].toString().trim() !== "").length;
            setTotalRecords(total); // ← guarda total en estado
        };

        reader.readAsArrayBuffer(file);

        // Extraer base64 también
        const readerB64 = new FileReader();
        readerB64.onloadend = () => {
            const base64 = (readerB64.result as string).split(',')[1];
            setBase64File(base64);
            setUploadedFileBase64(base64);
        };
        readerB64.readAsDataURL(file);

        setSelectedFileName(file.name); // ← opcional si usas filename visual
    };


    const hasPhoneInput = formData.Phones.some(p => p.trim() !== '');

    const handleSheetChange = (event: SelectChangeEvent<string>) => {
        const selected = event.target.value;
        setSelectedSheet(selected);

        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[selected], { header: 1 });
        const jsonData = sheet as any[][];
        setExcelData(jsonData);
        setColumns(jsonData[0] as string[]);
    };


    const handleAddIndividualPhone = () => {
        if (individualPhones.length < 5) {
            setIndividualPhones(prev => [...prev, '']);
        }
    };


    const handleRemoveIndividualPhone = (index: number) => {
        const updated = [...individualPhones];
        updated.splice(index, 1);
        setIndividualPhones(updated);
    };

    const handleIndividualPhoneChange = (index: number, value: string) => {
        const updated = [...individualPhones];
        updated[index] = value;
        setIndividualPhones(updated);
    };

    useEffect(() => {
        if (manageByIndividual && individualPhones.length === 0) {
            setIndividualPhones(['']);
        }
    }, [manageByIndividual]);

    const filteredClients = clientsList.filter((c) =>
        c.nombrecliente.toLowerCase().includes(clientSearch2.toLowerCase())
    );

    const handleUploadSubmit = async () => {
        const payload = {
            name: formData.Name,
            expirationDate: formData.ExpirationDate,
            phones: manageByIndividual ? individualPhones : [],
            fileBase64: manageByList ? uploadedFileBase64 : '',
            clientId: selectedClient?.id || null,
            channel: selectedChannel,
            operation: manageOperation,
            isShared: isShared,
            FileName: selectedFileName
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_MANAGE_NUMBERS}`, payload);

            if (response.status === 200) {
                const data = response.data;
                setUploadSummary({
                    success: data.success,
                    failed: data.failed,
                    total: data.total,
                    fileName: data.fileName,
                    errors: data.errors ?? {} // default a vacío si no hay detalle
                });
                setShowModal(false);
                setShowUploadStatusModal(true);
                GetNumbers();
            } else {
                setShowModal(false);
                setErrorModal(true);
            }
        } catch (error) {
            setShowModal(false);
            setErrorModal(true);
        }
    };

    const readyToUpload =
        (
            (manageByIndividual && individualPhones.some(p => p.trim() !== '')) ||
            (manageByList && uploadedFileBase64 !== '')
        ) &&
        selectedChannel !== '' &&
        !!manageOperation;

    return (
        <Box p={3} sx={{ marginTop: "-80px", width: '90%', minHeight: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Header con título y flecha */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <IconButton onClick={() => navigate('/')} sx={{ p: 0, mr: 1 }}>
                    <img src={ArrowBackIosNewIcon} alt="Regresar" style={{ width: 24, transform: 'rotate(270deg)' }} />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 'bold', fontFamily: 'Poppins', fontSize: '26px', color: '#330F1B' }}>
                    Números DIDS
                </Typography>
            </Box>

            <Divider sx={{ marginBottom: "17px", marginTop: "16px" }} />

            {/* Controles de acción */}
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
                    {['SERVICIO', 'CLIENTE', 'ESTATUS'].map((label) => {
                        const isService = label === 'SERVICIO';
                        const isClient = label === 'CLIENTE';
                        const isStatus = label === 'ESTATUS';

                        const count = isService
                            ? selectedServices.length
                            : isClient
                                ? selectedClients.length
                                : isStatus
                                    ? selectedStatus.length
                                    : 0;

                        const labelDisplay = count > 0 ? `${count} ${label}` : label;

                        return (
                            <Box
                                key={label}
                                onClick={(e) => {
                                    if (label === 'SERVICIO') setServiceAnchorEl(e.currentTarget);
                                    if (label === 'CLIENTE') {
                                        setClientAnchorEl(e.currentTarget);
                                        setClientMenuOpen(true);
                                    }
                                    if (label === 'ESTATUS') {
                                        setStatusAnchorEl(e.currentTarget);
                                        setStatusMenuOpen(true);
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
                    <MainIcon text="Gestionar números" width="218px" onClick={() => setShowModal(true)} />
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
                                        // Aplica búsqueda vacía que muestre solo SMS cortos o largos
                                        const filtered = numbersData.filter(
                                            (item) =>
                                                item.Service.toLowerCase().includes("sms cortos") ||
                                                item.Service.toLowerCase().includes("sms largos")
                                        );
                                        setNumbersData(filtered);
                                    }}
                                    style={{ marginLeft: 8, width: 20, height: 20, cursor: 'pointer' }}
                                />

                            )}
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ marginBottom: "17px", marginTop: "16px" }} />
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={2}
                p={2}
                sx={{ backgroundColor: "#F6F6F6", borderRadius: "8px" }}
            >
                {/* Rango de resultados */}
                <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#330F1B" }}>
                    {(currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
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
                                <img src={backarrow} style={{ width: 12 }} />
                                <img src={backarrow} style={{ width: 12 }} />
                            </Box>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Página Anterior">
                        <IconButton onClick={handlePrevPage} disabled={currentPage === 1}>
                            <img src={backarrow} style={{ width: 12, opacity: currentPage === 1 ? 0.3 : 1 }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Siguiente página">
                        <IconButton onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <img src={backarrow} style={{ width: 12, transform: 'rotate(180deg)', opacity: currentPage === totalPages ? 0.3 : 1 }} />
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
                                <img src={backarrow} style={{ width: 12, transform: 'rotate(180deg)' }} />
                                <img src={backarrow} style={{ width: 12, transform: 'rotate(180deg)' }} />
                            </Box>
                        </IconButton>
                    </Tooltip>


                    {/* Exportaciones */}
                    <Box display="flex" alignItems="center" gap={2} ml={3}>
                        <Tooltip title="Exportar CSV" arrow>
                            <IconButton
                                onClick={() => handleExportClick('csv', setIsExportingCSV)}
                                disabled={anyExporting && !isExportingCSV}
                                sx={{ opacity: !isExportingCSV && anyExporting ? 0.3 : 1 }}
                            >
                                {isExportingCSV ? <DualSpinner /> : <img src={IconDownloadCSV} alt="CSV" />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Exportar Excel" arrow>
                            <IconButton
                                onClick={() => handleExportClick('xlsx', setIsExportingXLSX)}
                                disabled={anyExporting && !isExportingXLSX}
                                sx={{ opacity: !isExportingXLSX && anyExporting ? 0.3 : 1 }}
                            >
                                {isExportingXLSX ? <DualSpinner /> : <img src={IconDownloadExcel} alt="Excel" />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Exportar PDF" arrow>
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

            {originalData.length === 0 ? (
                // Caja cerrada - sin registros cargados
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: '100%',
                        minHeight: '300px',
                        backgroundColor: '#F9F9F9',
                        padding: 4,
                        borderRadius: '12px',
                        border: '1px solid #E0E0E0',
                        mt: 2,
                    }}
                >
                    <img src={BoxEmpty} alt="Caja vacía" style={{ width: '120px', marginBottom: '16px' }} />
                    <Typography
                        sx={{
                            fontFamily: 'Poppins',
                            fontSize: '16px',
                            color: '#7B354D',
                            fontWeight: 500,
                        }}
                    >
                        De de alta un número para comenzar.
                    </Typography>
                </Box>
            ) : paginatedData.length === 0 ? (
                // Caja abierta - no hay coincidencias con los filtros
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: '100%',
                        minHeight: '300px',
                        backgroundColor: '#F9F9F9',
                        padding: 4,
                        borderRadius: '12px',
                        border: '1px solid #E0E0E0',
                        mt: 2,
                    }}
                >
                    <img src={NoResult} alt="No resultados" style={{ width: '120px', marginBottom: '16px' }} />
                    <Typography
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
                        padding: '30px 20px',
                        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontFamily: 'Poppins', fontSize: '13px', color: '#9B9295' }}>
                                <th style={{ padding: '12px' }}>
                                    <Checkbox
                                        checked={selectedIds.length === numbersData.length}
                                        indeterminate={selectedIds.length > 0 && selectedIds.length < numbersData.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th style={{ padding: '12px 16px' }}>Número DID</th>
                                <th style={{ padding: '12px 16px' }}>Tipo</th>
                                <th style={{ padding: '12px 16px' }}>Estado</th>
                                <th style={{ padding: '12px 16px' }}>Municipio</th>
                                <th style={{ padding: '12px 16px' }}>Servicio</th>
                                <th style={{ padding: '12px 16px' }}>Estatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((number) => (
                                <tr key={number.Id} style={{ borderTop: '1px solid #E0E0E0' }}>
                                    <td style={{ padding: '12px' }}>
                                        <Checkbox
                                            checked={selectedIds.includes(number.Id)}
                                            onChange={() => handleSelect(number.Id)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px', fontFamily: 'Poppins', fontSize: '14px', color: '#330F1B' }}>{number.Number}</td>
                                    <td style={{ padding: '12px 16px' }}>{number.Type}</td>
                                    <td style={{ padding: '12px 16px' }}>{number.State}</td>
                                    <td style={{ padding: '12px 16px' }}>{number.Municipality}</td>
                                    <td style={{ padding: '12px 16px' }}>{number.Service}</td>
                                    <td style={{ padding: '12px 16px' }}>{number.Estatus}</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <IconButton onClick={(event) => handleMenuOpen(event, number.Id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>
            )}
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={() => { console.log('Reemplazo', menuRowId); handleMenuClose(); }}>
                    <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Reemplazo</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { console.log('Dar de baja', menuRowId); handleMenuClose(); }}>
                    <ListItemIcon><DownloadForOfflineIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Dar de baja</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { console.log('Eliminar', menuRowId); handleMenuClose(); }}>
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Eliminar</ListItemText>
                </MenuItem>
            </Menu>
            <Menu
                anchorEl={serviceAnchorEl}
                open={openServiceFilter}
                onClose={() => setServiceAnchorEl(null)}
                PaperProps={{
                    sx: {
                        paddingTop: 1,
                        paddingBottom: 1,
                        width: 230,
                        borderRadius: '12px',
                        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                    },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                {['SMS # cortos', 'SMS # largos', 'Llamada'].map((option) => (
                    <MenuItem
                        key={option}
                        onClick={() =>
                            setSelectedServices((prev) =>
                                prev.includes(option)
                                    ? prev.filter((s) => s !== option)
                                    : [...prev, option]
                            )
                        }
                        sx={{ fontFamily: 'Poppins', fontSize: '14px' }}
                    >
                        <Checkbox checked={selectedServices.includes(option)} />
                        <ListItemText primary={option} />
                    </MenuItem>
                ))}

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between" px={2} pb={1} gap={1}>
                    <SecondaryButton onClick={handleClearServiceFilter} text="LIMPIAR" />

                    <MainButton onClick={handleApplyServiceFilter} text="APLICAR" />

                </Box>
            </Menu>
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
                            setNumbersData(originalData.slice(0, 50));
                            setCurrentPage(1);
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            // Obtener los IDs de los clientes seleccionados
                            const selectedClientIds = clientsList
                                .filter(c => selectedClients.includes(c.nombrecliente))
                                .map(c => c.id);

                            // Filtrar los números por idClient
                            const filtered = originalData.filter(item =>
                                selectedClientIds.length === 0 || selectedClientIds.includes(item.IdClient)
                            );

                            setNumbersData(filtered);
                            setClientMenuOpen(false);
                            setCurrentPage(1);
                        }}

                        text="APLICAR"
                    />
                </Box>
            </Menu>
            <Menu
                anchorEl={statusAnchorEl}
                open={statusMenuOpen}
                onClose={() => setStatusMenuOpen(false)}
                PaperProps={{ sx: { width: 250, borderRadius: '12px', padding: 1 } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                <Box sx={{ maxHeight: '230px', overflowY: 'auto' }}>
                    {['Disponible', 'Asignado', 'En prueba', 'Comprado', 'Asignado a prueba'].map((status) => (
                        <MenuItem
                            key={status}
                            onClick={() =>
                                setSelectedStatus((prev) =>
                                    prev.includes(status)
                                        ? prev.filter((s) => s !== status)
                                        : [...prev, status]
                                )
                            }
                        >
                            <Checkbox checked={selectedStatus.includes(status)} />
                            <ListItemText primary={status} />
                        </MenuItem>
                    ))}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" px={2} pb={1} gap={1}>
                    <SecondaryButton
                        onClick={() => {
                            setSelectedStatus([]);
                            setStatusMenuOpen(false);
                            setNumbersData(originalData);
                            setCurrentPage(1);
                        }}
                        text="LIMPIAR"
                    />
                    <MainButton
                        onClick={() => {
                            const filtered = originalData.filter((item) =>
                                selectedStatus.length === 0 ||
                                selectedStatus.includes(item.Estatus) // ajusta el campo si es necesario
                            );
                            setNumbersData(filtered);
                            setStatusMenuOpen(false);
                            setCurrentPage(1);
                        }}
                        text="APLICAR"
                    />
                </Box>
            </Menu>
            <Modal open={ShowModal} onClose={handleCloseModal}>
                <Box sx={{
                    width: '580px',
                    height: '592px',
                    bgcolor: 'white',
                    borderRadius: '10px',
                    mx: 'auto',
                    mt: '3.5%',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'Poppins',
                    overflow: 'hidden', // 🔥 evita doble scroll
                    boxShadow: 24,
                }}>


                    <Box sx={{ px: 4, pt: 4 }}>
                        <Typography fontWeight="600" fontSize="20px" fontFamily='Poppins' marginTop={'-10px'} marginLeft={'-5px'}>
                            Gestionar Números DIDS
                        </Typography>

                        <IconButton
                            onClick={handleCloseModal}
                            sx={{
                                position: 'absolute',
                                marginTop: '-46px',
                                marginLeft: '500px',
                                zIndex: 10
                            }}
                        >
                            <CloseIcon sx={{ color: '#A6A6A6' }} />
                        </IconButton>

                        <Divider sx={{
                            width: 'calc(100% + 64px)', marginLeft: '-32px',
                            marginTop: "20px",
                            marginBottom: "-15px"
                        }} />
                        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ px: 3, pt: 1 }}>
                            <Tab label="Números Generales" sx={{ fontFamily: 'Poppins', textTransform: 'none' }} />
                            <Tab label="Números Especiales" sx={{ fontFamily: 'Poppins', textTransform: 'none' }} />
                        </Tabs>
                        <Typography
                            mt={3}
                            fontWeight="500"
                            fontSize="18px"
                            fontFamily="Poppins"
                            textAlign="center"
                            sx={{ width: '100%' }}
                        >
                            Seleccionar operación
                        </Typography>


                        <ToggleButtonGroup
                            exclusive
                            value={manageOperation}
                            onChange={(e, value) => value && setManageOperation(value)}
                            sx={{
                                mt: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: "25px",
                            }}
                        >
                            {/* CARGAR */}
                            <Tooltip
                                title={
                                    <Box
                                        sx={{
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "8px",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            color: "#000000",
                                            whiteSpace: "pre-line",
                                            transform: "translate(-5px, -5px)",
                                            borderColor: "#00131F3D",
                                            borderStyle: "solid",
                                            borderWidth: "1px"
                                        }}
                                    >
                                        Cargar Registros
                                    </Box>
                                }
                                placement="top"
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            backgroundColor: "transparent",
                                            padding: 0
                                        }
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "6px",
                                        border: '2px solid #8F4E63',
                                        backgroundColor: manageOperation === 'agregar' ? '#8F4D63' : '#FFFFFF',
                                    }}
                                >
                                    <ToggleButton
                                        value="agregar"
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: "64px",
                                            height: "64px",
                                            padding: 1
                                        }}
                                    >
                                        <img
                                            src={manageOperation === 'agregar' ? IconPlusCircle : IconPlusUnselected}
                                            alt="Agregar"
                                            style={{ width: 32, height: 32, marginBottom: 4 }}
                                        />
                                    </ToggleButton>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontFamily: 'Poppins',
                                            fontSize: '14px',
                                            lineHeight: 1,
                                            color: '#8F4D63',
                                            textTransform: 'none',
                                            marginLeft: "6px",
                                            marginTop: "7px"
                                        }}
                                    >
                                        Cargar
                                    </Typography>
                                </Box>
                            </Tooltip>



                            {/* DAR DE BAJA */}
                            <Tooltip
                                title={
                                    <Box
                                        sx={{
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "8px",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            color: "#000000",
                                            whiteSpace: "pre-line",
                                            transform: "translate(-5px, -5px)",
                                            borderColor: "#00131F3D",
                                            borderStyle: "solid",
                                            borderWidth: "1px"
                                        }}
                                    >
                                        Dar de baja registros
                                    </Box>
                                }
                                placement="top"
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            backgroundColor: "transparent",
                                            padding: 0
                                        }
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "6px",
                                        border: '2px solid #8F4E63',
                                        backgroundColor: manageOperation === 'darDeBaja' ? '#8F4D63' : '#FFFFFF',
                                    }}
                                >
                                    <ToggleButton
                                        value="darDeBaja"
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: "64px",
                                            height: "64px",
                                            padding: 1
                                        }}
                                    >
                                        <img
                                            src={manageOperation === 'darDeBaja' ? IconUpdateSelected : IconReUpdate1}
                                            alt="darDeBaja"
                                            style={{ width: 27, height: 27, marginBottom: 4 }}
                                        />
                                    </ToggleButton>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontFamily: 'Poppins',
                                            fontSize: '14px',
                                            lineHeight: 1,
                                            color: '#8F4D63',
                                            textTransform: 'none',
                                            marginLeft: "-2px",
                                            marginTop: "6px"
                                        }}
                                    >
                                        Dar de baja
                                    </Typography>
                                </Box>
                            </Tooltip>
                            {/* ELIMINAR */}
                            <Tooltip
                                title={
                                    <Box
                                        sx={{
                                            backgroundColor: "#FFFFFF",
                                            borderRadius: "8px",
                                            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                            padding: "8px 12px",
                                            fontSize: "14px",
                                            fontFamily: "Poppins",
                                            color: "#000000",
                                            whiteSpace: "pre-line",
                                            transform: "translate(-5px, -5px)",
                                            borderColor: "#00131F3D",
                                            borderStyle: "solid",
                                            borderWidth: "1px"
                                        }}
                                    >
                                        Eliminar teléfonos<br />de la lista actual
                                    </Box>
                                }
                                placement="top"
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            backgroundColor: "transparent",
                                            padding: 0
                                        }
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: "64px",
                                        height: "64px",
                                        borderRadius: "6px",
                                        border: '2px solid #8F4E63',
                                        backgroundColor: manageOperation === 'eliminar' ? '#8F4D63' : '#FFFFFF',
                                    }}
                                >
                                    <ToggleButton
                                        value="eliminar"
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: "64px",
                                            height: "64px",
                                            padding: 1
                                        }}
                                    >
                                        <img
                                            src={manageOperation === 'eliminar' ? IconMinusSelected : IconNegativeCircle}
                                            alt="Eliminar"
                                            style={{ width: 32, height: 32, marginBottom: 4 }}
                                        />
                                    </ToggleButton>
                                    <Typography
                                        sx={{
                                            fontWeight: 500,
                                            fontFamily: 'Poppins',
                                            fontSize: '14px',
                                            lineHeight: 1,
                                            color: '#8F4D63',
                                            textTransform: 'none',
                                            marginLeft: "3px",
                                            marginTop: "6px"
                                        }}
                                    >
                                        Eliminar
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </ToggleButtonGroup>


                        <Divider sx={{ my: 3, mt: 5 }} />
                    </Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {tab === 1 && (
                            <Grid item xs={6}>
                                <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 500, color: '#330F1B', mb: 1 }}>
                                    Cliente
                                </Typography>

                                {/* TextField que abre el Popper */}
                                <TextField
                                    placeholder="Seleccionar cliente"
                                    value={selectedClient?.nombrecliente || ''}
                                    onClick={(e) => setClientAnchorEl2(e.currentTarget)}
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <ArrowDropDownIcon />
                                            </InputAdornment>
                                        ),
                                        readOnly: true,
                                        sx: {
                                            fontFamily: 'Poppins',
                                            backgroundColor: '#FFFFFF',
                                            borderRadius: '8px'
                                        }
                                    }}
                                />

                                {/* Aquí mismo va el Popper, dentro del mismo Grid */}
                                <Popper
                                    open={openClientPopper2}
                                    anchorEl={clientAnchorEl2}
                                    placement="bottom-start"
                                    style={{ zIndex: 1300 }}
                                >
                                    <ClickAwayListener onClickAway={() => setClientAnchorEl2(null)}>
                                        <Paper sx={{ width: clientAnchorEl2?.clientWidth, borderRadius: '8px', mt: 1 }}>
                                            <TextField
                                                autoFocus
                                                placeholder="Buscar cliente"
                                                value={clientSearch2}
                                                onChange={(e) => setClientSearch2(e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <img src={seachicon} alt="Buscar" style={{ width: 16 }} />
                                                        </InputAdornment>
                                                    ),
                                                    sx: { fontFamily: 'Poppins', px: 1.5 }
                                                }}
                                                fullWidth
                                                size="small"
                                            />
                                            <List>
                                                {filteredClients.map((client) => (
                                                    <ListItemButton
                                                        key={client.id}
                                                        onClick={() => {
                                                            setSelectedClient(client);
                                                            setClientAnchorEl2(null);
                                                            setClientSearch2('');
                                                        }}
                                                        sx={{ fontFamily: 'Poppins', fontSize: '14px' }}
                                                    >
                                                        {client.nombrecliente}
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Paper>
                                    </ClickAwayListener>
                                </Popper>
                            </Grid>

                        )}
                        <Grid item xs={tab === 1 ? 6 : 12}>
                            <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px', fontWeight: 500, color: '#330F1B', mb: 1 }}>
                                Canal
                            </Typography>
                            <FormControl fullWidth size="small">
                                <InputLabel id="channel-select-label" sx={{ fontFamily: 'Poppins' }}>Seleccionar canal</InputLabel>
                                <Select
                                    labelId="channel-select-label"
                                    value={selectedChannel}
                                    onChange={(e) => setSelectedChannel(e.target.value)}
                                    label="Seleccionar canal"
                                    sx={{ fontFamily: 'Poppins', backgroundColor: '#FFFFFF', borderRadius: '8px' }}
                                >
                                    <MenuItem value="Corto">SMS, números cortos</MenuItem>
                                    <MenuItem value="Largo">SMS, números largos</MenuItem>
                                    <MenuItem value="Llamada">Llamada</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: 3,
                            py: 0,
                            mt: -3,
                            maxHeight: 'calc(85vh - 200px)',
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                px: 4,
                                py: 3,
                                maxHeight: 'calc(90vh - 180px)', // o lo que uses
                                overflowX: 'hidden', // 🔥 Esto evita scroll lateral
                            }}
                        >
                            <Typography fontWeight="500" fontSize="18px" mb={1} fontFamily={"Poppins"}
                                marginLeft={'-30px'} marginTop={'-10px'}>Seleccionar fuente de registros</Typography>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2,
                                    ml: '-30px',
                                    border: '1px solid #E6E4E4',
                                    borderRadius: '6px',
                                    width: '530px',
                                    height: '57px',
                                    opacity: manageByIndividual ? 0.4 : 1,
                                    pointerEvents: manageByIndividual ? 'none' : 'auto'
                                }}
                            >
                                <Typography fontSize="18px" fontFamily={"Poppins"} marginLeft={'16px'}>Por archivo</Typography>
                                <Switch
                                    checked={manageByList}
                                    onChange={() => {
                                        const newValue = !manageByList;
                                        setManageByList(newValue);
                                        if (newValue) {
                                            setManageByIndividual(false);
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box mt={-2}>
                            {manageByList && (
                                <>
                                    {manageOperation === 'agregar' && (
                                        <Box display="flex" alignItems="flex-start" gap={3} mt={2} flexWrap="wrap">
                                            <Box
                                                marginBottom={'25px'}
                                                onClick={() => !hasPhoneInput && fileInputRef.current?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    if (hasPhoneInput) return; // prevenir carga
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleFile(file);
                                                }}
                                                sx={{
                                                    border: fileError
                                                        ? '2px solid #EF5466'
                                                        : fileSuccess
                                                            ? '2px solid #8F4E63CC' // ✅ borde éxito
                                                            : '2px dashed #D9B4C3',
                                                    backgroundColor: fileError
                                                        ? '#FFF4F5'
                                                        : fileSuccess
                                                            ? '#E5CBD333'           // ✅ fondo éxito
                                                            : 'transparent',
                                                    borderRadius: '8px',
                                                    width: '160px',
                                                    height: '160px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins',
                                                    fontSize: '13px',
                                                    color: '#330F1B',
                                                    position: 'relative',
                                                    cursor: hasPhoneInput ? 'not-allowed' : 'pointer',
                                                    px: 1,
                                                    opacity: hasPhoneInput ? 0.5 : 1,
                                                    pointerEvents: hasPhoneInput ? 'none' : 'auto',
                                                }}

                                            >

                                                {/*Tooltip */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        marginTop: "-115px",
                                                        marginRight: '-115px',
                                                        width: 24,
                                                        height: 24,

                                                    }}
                                                >
                                                    <Tooltip
                                                        placement="right"
                                                        title={
                                                            fileError ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#EF5466', opacity: 0.7 }}>
                                                                    Solo se permiten archivos .xlsx
                                                                </Box>
                                                            ) : fileSuccess ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#28A745', opacity: 0.7 }}>
                                                                    Archivo cargado {selectedFile?.name}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                                                    El archivo debe ser Excel<br />(.xls/.xlsx)
                                                                </Box>
                                                            )
                                                        }
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: "#FFFFFF",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                    padding: "8px 12px",
                                                                    fontSize: "14px",
                                                                    fontFamily: "Poppins",
                                                                    color: "#000000",
                                                                    whiteSpace: "pre-line",
                                                                    transform: "translate(-5px, -5px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }
                                                            }
                                                        }}
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [35, -180] // 👉 [horizontal, vertical]
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <Box>
                                                            {!fileSuccess && (
                                                                <img
                                                                    src={fileError ? infoiconerror : infoicon}
                                                                    alt="estado"
                                                                    style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Tooltip>
                                                    {fileSuccess && (
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
                                                                            offset: [0, -8] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                                                        }
                                                                    }
                                                                ]
                                                            }}
                                                        >
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // ❌ evita que el click se propague al Box que abre el file picker
                                                                    setSelectedFile(null);
                                                                    setUploadedFile(null);
                                                                    setFileSuccess(false);
                                                                    setFileError(false);
                                                                    setBase64File('');
                                                                    setUploadedFileBase64('');
                                                                    setFormData(prev => ({ ...prev, File: '' }));
                                                                    if (fileInputRef.current) {
                                                                        fileInputRef.current.value = '';
                                                                    }
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    right: 0,
                                                                    width: 24,
                                                                    height: 24,
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                <img src={Thrashicon} alt="Eliminar archivo" style={{ width: 24, height: 24 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                </Box>


                                                {/*Imagen central del archivo a subir*/}
                                                <Box
                                                    sx={{
                                                        width: "142px", height: "100px"
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            fileError
                                                                ? IconCloudError
                                                                : fileSuccess
                                                                    ? CloudCheckedIcon
                                                                    : UpCloudIcon
                                                        }
                                                        alt="estado archivo"
                                                        style={{ marginBottom: '8px', width: "" }}
                                                    />


                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontFamily: "Poppins",
                                                            color: "#330F1B",
                                                            fontSize: '12px',
                                                            opacity: !fileError && !fileSuccess ? 0.9 : 1
                                                        }}
                                                    >
                                                        {fileError
                                                            ? 'Archivo inválido'
                                                            : fileSuccess
                                                                ? 'Archivo cargado'
                                                                : 'Subir archivo'}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '10px',
                                                            color: '#574B4F',
                                                            opacity: 1,
                                                            textAlign: 'center',
                                                            wordBreak: 'break-word',
                                                            maxWidth: '142px',
                                                            mt: '1px'
                                                        }}
                                                    >
                                                        {fileSuccess && uploadedFile
                                                            ? uploadedFile.name
                                                            : 'Arrastre un archivo aquí, o selecciónelo.'}
                                                    </Typography>
                                                    {fileSuccess && (
                                                        <Typography
                                                            sx={{
                                                                fontFamily: 'Poppins',
                                                                fontSize: '10px',
                                                                color: '#574B4F',
                                                                opacity: 1,
                                                                textAlign: 'center',
                                                                mt: '1px'
                                                            }}
                                                        >
                                                            Total de registros: {totalRecords}
                                                        </Typography>
                                                    )}

                                                </Box>

                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={fileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFile(file);
                                                    }}

                                                />



                                            </Box>
                                        </Box>

                                    )}
                                    {manageOperation === 'eliminar' && (
                                        <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'flex-start' }}>

                                            <Box
                                                marginBottom={'25px'}
                                                onClick={() => !hasPhoneInput && fileInputRef.current?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    if (hasPhoneInput) return; // prevenir carga
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleFile(file);
                                                }}
                                                sx={{
                                                    border: fileError
                                                        ? '2px solid #EF5466'
                                                        : fileSuccess
                                                            ? '2px solid #8F4E63CC' // ✅ borde éxito
                                                            : '2px dashed #D9B4C3',
                                                    backgroundColor: fileError
                                                        ? '#FFF4F5'
                                                        : fileSuccess
                                                            ? '#E5CBD333'           // ✅ fondo éxito
                                                            : 'transparent',
                                                    borderRadius: '8px',
                                                    width: '160px',
                                                    height: '160px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins',
                                                    fontSize: '13px',
                                                    color: '#330F1B',
                                                    position: 'relative',
                                                    cursor: hasPhoneInput ? 'not-allowed' : 'pointer',
                                                    px: 1,
                                                    opacity: hasPhoneInput ? 0.5 : 1,
                                                    pointerEvents: hasPhoneInput ? 'none' : 'auto',
                                                }}

                                            >

                                                {/*Tooltip */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        marginTop: "-115px",
                                                        marginRight: '-115px',
                                                        width: 24,
                                                        height: 24,

                                                    }}
                                                >
                                                    <Tooltip
                                                        placement="right"
                                                        title={
                                                            fileError ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#EF5466', opacity: 0.7 }}>
                                                                    Solo se permiten archivos .xlsx
                                                                </Box>
                                                            ) : fileSuccess ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#28A745', opacity: 0.7 }}>
                                                                    Archivo cargado {selectedFile?.name}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                                                    El archivo debe ser Excel<br />(.xls/.xlsx)
                                                                </Box>
                                                            )
                                                        }
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: "#FFFFFF",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                    padding: "8px 12px",
                                                                    fontSize: "14px",
                                                                    fontFamily: "Poppins",
                                                                    color: "#000000",
                                                                    whiteSpace: "pre-line",
                                                                    transform: "translate(-5px, -5px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }
                                                            }
                                                        }}
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [35, -180] // 👉 [horizontal, vertical]
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <Box>
                                                            {!fileSuccess && (
                                                                <img
                                                                    src={fileError ? infoiconerror : infoicon}
                                                                    alt="estado"
                                                                    style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Tooltip>
                                                    {fileSuccess && (
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
                                                                            offset: [0, -8] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                                                        }
                                                                    }
                                                                ]
                                                            }}
                                                        >
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // ❌ evita que el click se propague al Box que abre el file picker
                                                                    setSelectedFile(null);
                                                                    setUploadedFile(null);
                                                                    setFileSuccess(false);
                                                                    setFileError(false);
                                                                    setBase64File('');
                                                                    setUploadedFileBase64('');
                                                                    setFormData(prev => ({ ...prev, File: '' }));
                                                                    if (fileInputRef.current) {
                                                                        fileInputRef.current.value = '';
                                                                    }
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    right: 0,
                                                                    width: 24,
                                                                    height: 24,
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                <img src={Thrashicon} alt="Eliminar archivo" style={{ width: 24, height: 24 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                </Box>


                                                {/*Imagen central del archivo a subir*/}
                                                <Box
                                                    sx={{
                                                        width: "142px", height: "100px"
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            fileError
                                                                ? IconCloudError
                                                                : fileSuccess
                                                                    ? CloudCheckedIcon
                                                                    : UpCloudIcon
                                                        }
                                                        alt="estado archivo"
                                                        style={{ marginBottom: '8px', width: "" }}
                                                    />


                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontFamily: "Poppins",
                                                            color: "#330F1B",
                                                            fontSize: '12px',
                                                            opacity: !fileError && !fileSuccess ? 0.9 : 1
                                                        }}
                                                    >
                                                        {fileError
                                                            ? 'Archivo inválido'
                                                            : fileSuccess
                                                                ? 'Archivo cargado'
                                                                : 'Subir archivo'}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '10px',
                                                            color: '#574B4F',
                                                            opacity: 1,
                                                            textAlign: 'center',
                                                            wordBreak: 'break-word',
                                                            maxWidth: '142px',
                                                            mt: '1px'
                                                        }}
                                                    >
                                                        {fileSuccess && uploadedFile
                                                            ? uploadedFile.name
                                                            : 'Arrastre un archivo aquí, o selecciónelo.'}
                                                    </Typography>
                                                    {fileSuccess && (
                                                        <Typography
                                                            sx={{
                                                                fontFamily: 'Poppins',
                                                                fontSize: '10px',
                                                                color: '#574B4F',
                                                                opacity: 1,
                                                                textAlign: 'center',
                                                                mt: '1px'
                                                            }}
                                                        >
                                                            Total de registros: {totalRecords}
                                                        </Typography>
                                                    )}

                                                </Box>

                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={fileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFile(file);
                                                    }}

                                                />



                                            </Box>

                                        </Box>

                                    )}
                                    {manageOperation === 'darDeBaja' && (
                                        <Box display="flex" alignItems="flex-start" gap={3} mt={2} flexWrap="wrap">

                                            <Box
                                                marginBottom={'25px'}
                                                onClick={() => !hasPhoneInput && fileInputRef.current?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    if (hasPhoneInput) return; // prevenir carga
                                                    const file = e.dataTransfer.files?.[0];
                                                    if (file) handleFile(file);
                                                }}
                                                sx={{
                                                    border: fileError
                                                        ? '2px solid #EF5466'
                                                        : fileSuccess
                                                            ? '2px solid #8F4E63CC' // ✅ borde éxito
                                                            : '2px dashed #D9B4C3',
                                                    backgroundColor: fileError
                                                        ? '#FFF4F5'
                                                        : fileSuccess
                                                            ? '#E5CBD333'           // ✅ fondo éxito
                                                            : 'transparent',
                                                    borderRadius: '8px',
                                                    width: '160px',
                                                    height: '160px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    textAlign: 'center',
                                                    fontFamily: 'Poppins',
                                                    fontSize: '13px',
                                                    color: '#330F1B',
                                                    position: 'relative',
                                                    cursor: hasPhoneInput ? 'not-allowed' : 'pointer',
                                                    px: 1,
                                                    opacity: hasPhoneInput ? 0.5 : 1,
                                                    pointerEvents: hasPhoneInput ? 'none' : 'auto',
                                                }}

                                            >

                                                {/*Tooltip */}
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        marginTop: "-115px",
                                                        marginRight: '-115px',
                                                        width: 24,
                                                        height: 24,

                                                    }}
                                                >
                                                    <Tooltip
                                                        placement="right"
                                                        title={
                                                            fileError ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#EF5466', opacity: 0.7 }}>
                                                                    Solo se permiten archivos .xlsx
                                                                </Box>
                                                            ) : fileSuccess ? (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#28A745', opacity: 0.7 }}>
                                                                    Archivo cargado {selectedFile?.name}
                                                                </Box>
                                                            ) : (
                                                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                                                    El archivo debe ser Excel<br />(.xls/.xlsx)
                                                                </Box>
                                                            )
                                                        }
                                                        componentsProps={{
                                                            tooltip: {
                                                                sx: {
                                                                    backgroundColor: "#FFFFFF",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                    padding: "8px 12px",
                                                                    fontSize: "14px",
                                                                    fontFamily: "Poppins",
                                                                    color: "#000000",
                                                                    whiteSpace: "pre-line",
                                                                    transform: "translate(-5px, -5px)",
                                                                    borderColor: "#00131F3D",
                                                                    borderStyle: "solid",
                                                                    borderWidth: "1px"
                                                                }
                                                            }
                                                        }}
                                                        PopperProps={{
                                                            modifiers: [
                                                                {
                                                                    name: 'offset',
                                                                    options: {
                                                                        offset: [35, -180] // 👉 [horizontal, vertical]
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <Box>
                                                            {!fileSuccess && (
                                                                <img
                                                                    src={fileError ? infoiconerror : infoicon}
                                                                    alt="estado"
                                                                    style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </Tooltip>
                                                    {fileSuccess && (
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
                                                                            offset: [0, -8] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                                                        }
                                                                    }
                                                                ]
                                                            }}
                                                        >
                                                            <IconButton
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedFile(null);
                                                                    setUploadedFile(null);
                                                                    setFileSuccess(false);
                                                                    setFileError(false);
                                                                    setBase64File('');
                                                                    setUploadedFileBase64('');
                                                                    setFormData(prev => ({ ...prev, File: '' }));
                                                                    if (fileInputRef.current) {
                                                                        fileInputRef.current.value = '';
                                                                    }
                                                                }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    right: 0,
                                                                    width: 24,
                                                                    height: 24,
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                <img src={Thrashicon} alt="Eliminar archivo" style={{ width: 24, height: 24 }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}

                                                </Box>


                                                {/*Imagen central del archivo a subir*/}
                                                <Box
                                                    sx={{
                                                        width: "142px", height: "100px"
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            fileError
                                                                ? IconCloudError
                                                                : fileSuccess
                                                                    ? CloudCheckedIcon
                                                                    : UpCloudIcon
                                                        }
                                                        alt="estado archivo"
                                                        style={{ marginBottom: '8px', width: "" }}
                                                    />


                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontFamily: "Poppins",
                                                            color: "#330F1B",
                                                            fontSize: '12px',
                                                            opacity: !fileError && !fileSuccess ? 0.9 : 1
                                                        }}
                                                    >
                                                        {fileError
                                                            ? 'Archivo inválido'
                                                            : fileSuccess
                                                                ? 'Archivo cargado'
                                                                : 'Subir archivo'}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontFamily: 'Poppins',
                                                            fontSize: '10px',
                                                            color: '#574B4F',
                                                            opacity: 1,
                                                            textAlign: 'center',
                                                            wordBreak: 'break-word',
                                                            maxWidth: '142px',
                                                            mt: '1px'
                                                        }}
                                                    >
                                                        {fileSuccess && uploadedFile
                                                            ? uploadedFile.name
                                                            : 'Arrastre un archivo aquí, o selecciónelo.'}
                                                    </Typography>
                                                    {fileSuccess && (
                                                        <Typography
                                                            sx={{
                                                                fontFamily: 'Poppins',
                                                                fontSize: '10px',
                                                                color: '#574B4F',
                                                                opacity: 1,
                                                                textAlign: 'center',
                                                                mt: '1px'
                                                            }}
                                                        >
                                                            Total de registros: {totalRecords}
                                                        </Typography>
                                                    )}

                                                </Box>

                                                <input
                                                    type="file"
                                                    hidden
                                                    ref={fileInputRef}
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFile(file);
                                                    }}

                                                />



                                            </Box>

                                        </Box>
                                    )}
                                </>
                            )}

                            <Box
                                sx={{
                                    flex: 1,
                                    px: 4,
                                    mt: 2,
                                    mb: 1,
                                    maxHeight: 'calc(90vh - 180px)', // o lo que uses
                                    overflowX: 'hidden', // 🔥 Esto evita scroll lateral
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mb: 2,
                                        ml: '-30px',
                                        opacity: manageByList ? 0.4 : 1,
                                        border: '1px solid #E6E4E4',
                                        borderRadius: '6px',
                                        width: '530px',
                                        height: '57px',
                                        pointerEvents: manageByList ? 'none' : 'auto',
                                    }}
                                >
                                    <Typography fontSize="18px" fontFamily={"Poppins"} marginLeft={'16px'}>Por registro individual</Typography>
                                    <Switch
                                        checked={manageByIndividual}
                                        onChange={() => {
                                            const newValue = !manageByIndividual;
                                            setManageByIndividual(newValue);
                                            if (newValue) {
                                                setManageByList(false);
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>

                            {manageByIndividual && (
                                <Box mt={-2} ml={2.5}>
                                    <Typography sx={{
                                        fontFamily: 'Poppins', fontSize: '16px',
                                        fontWeight: 500, mb: 1, color: '#574B4F'
                                    }}>
                                        Teléfono(s)
                                    </Typography>

                                    <Box
                                        sx={{
                                            maxHeight: '160px',
                                            overflowY: 'auto',
                                            pr: 1,
                                            display: 'flex',
                                            flexDirection: 'column',

                                            gap: 1
                                        }}
                                    >
                                        {individualPhones.map((phone, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TextField
                                                    value={phone}
                                                    onChange={(e) => {
                                                        const numericValue = e.target.value.replace(/\D/g, '');
                                                        handleIndividualPhoneChange(index, numericValue);
                                                    }}
                                                    placeholder="5255..."
                                                    sx={{
                                                        width: '232px',
                                                        height: '54px',
                                                        '& .MuiInputBase-root': {
                                                            height: '54px',
                                                        },
                                                        '& input': {
                                                            height: '54px',
                                                            boxSizing: 'border-box',
                                                            fontFamily: 'Poppins',
                                                            fontSize: '14px',
                                                        }
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <Tooltip
                                                                    title={
                                                                        <Box
                                                                            sx={{
                                                                                backgroundColor: "#FFFFFF",
                                                                                borderRadius: "8px",
                                                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                                                                                padding: "8px 12px",
                                                                                fontSize: "14px",
                                                                                fontFamily: "Poppins",
                                                                                color: "#000000",
                                                                                whiteSpace: "pre-line",
                                                                                transform: "translate(2px, -15px)",
                                                                                borderColor: "#00131F3D",
                                                                                borderStyle: "solid",


                                                                            }}
                                                                        >
                                                                            <>
                                                                                Teléfono válido de 10 dígitos
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
                                                                    <img src={infoicon} alt="info" style={{ width: 24, height: 24 }} />
                                                                </Tooltip>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />

                                                {index === individualPhones.length - 1 && individualPhones.length < 5 && (
                                                    <Tooltip title="Agregar número" arrow placement="top"
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
                                                                        offset: [-20, -7] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                                                    }
                                                                }
                                                            ]
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 21,
                                                                height: 21,
                                                                backgroundColor: "#6F565E",
                                                                borderRadius: "50%", // 🔥 clave para hacerlo circular
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center"
                                                            }}
                                                        >
                                                            <IconButton onClick={handleAddIndividualPhone}>
                                                                <img
                                                                    src={IconPlus2}
                                                                    alt="Agregar teléfono"
                                                                    style={{ width: 21, height: 21, }}
                                                                />
                                                            </IconButton>
                                                        </Box>
                                                    </Tooltip>

                                                )}

                                                {index > 0 && (
                                                    <Tooltip title="Eliminar teléfono">
                                                        <IconButton onClick={() => handleRemoveIndividualPhone(index)}>
                                                            <img src={Thrashicon} alt="Eliminar" style={{ width: 24, height: 24 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}



                        </Box>
                    </Box>

                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mt: 2, mb: 1 }} />

                    <Box sx={{
                        px: 2.5,
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: "6px"

                    }}>
                        <SecondaryButton onClick={handleCloseModal} text='Cancelar'

                        />
                        <MainButton
                            onClick={handleUploadSubmit}
                            text='Guardar cambios'
                            disabled={!readyToUpload}
                        />


                    </Box>
                </Box>
            </Modal>
            <Modal open={showUploadStatusModal} onClose={() => setShowUploadStatusModal(false)}>
                <Box sx={{
                    width: '580px',
                    bgcolor: 'white',
                    borderRadius: '10px',
                    mx: 'auto',
                    mt: '5%',
                    fontFamily: 'Poppins',
                    p: 4,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Regresar */}
                    {detailedView && (
                        <IconButton
                            onClick={() => setDetailedView(false)}
                            sx={{ position: 'absolute', top: 16, left: 16 }}
                        >
                            <Tooltip title="Regresar" arrow>
                                <img src={ArrowBackIosNewIcon} style={{ width: 16, transform: 'rotate(90deg)' }} />
                            </Tooltip>
                        </IconButton>
                    )}

                    {/* Título */}
                    <Typography fontWeight="600" fontSize="20px" mb={1} textAlign="center">
                        Gestionar números DIDS
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {uploadSummary && !detailedView && manageOperation == 'agregar' && (
                        <>
                            <Typography fontWeight="600" fontSize="16px" mb={2}>Estado de carga</Typography>
                            <Box display="flex" gap={3}>
                                {manageByList && (
                                    <Box
                                        sx={{
                                            border: '2px solid #D9B4C3',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            width: '170px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            backgroundColor: '#FDF8FA',
                                            fontFamily: 'Poppins',
                                            position: 'relative'
                                        }}
                                    >
                                        <Tooltip title="Este resumen corresponde al archivo recién cargado">
                                            <img src={infoicon} alt="info" style={{ position: 'absolute', top: 12, right: 12, width: 20 }} />
                                        </Tooltip>
                                        <img src={CloudCheckedIcon} alt="éxito" style={{ width: 48, marginBottom: 8 }} />
                                        <Typography fontWeight="600" fontSize="14px" color="#8F4D63">Archivo cargado</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ mt: 0.5 }}>{uploadSummary.fileName}</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ opacity: 0.7 }}>Total de registros: {uploadSummary.total}</Typography>
                                    </Box>
                                )}


                                {/* Tabla porcentajes */}
                                <Box flex={1}>
                                    <Box display="flex" fontWeight="600" fontSize="14px" mb={1}>
                                        <Box width="33%">Estado</Box>
                                        <Box width="33%">Números</Box>
                                        <Box width="34%">Porcentaje</Box>
                                    </Box>
                                    {[
                                        { label: 'Cargados', value: uploadSummary.success },
                                        { label: 'No cargados', value: uploadSummary.failed }
                                    ].map(({ label, value }) => {
                                        const pct = Math.round((value / uploadSummary.total) * 100);
                                        return (
                                            <Box key={label} display="flex" alignItems="center" mb={1}>
                                                <Box width="33%">{label}</Box>
                                                <Box width="33%">{value}</Box>
                                                <Box width="34%" display="flex" alignItems="center" gap={1}>
                                                    <Box flex={1} height="8px" borderRadius="4px" sx={{ backgroundColor: '#E0D1D6' }}>
                                                        <Box width={`${pct}%`} height="100%" borderRadius="4px" sx={{ backgroundColor: '#8F4D63' }} />
                                                    </Box>
                                                    <Typography fontSize="13px">{pct}%</Typography>
                                                    <IconButton onClick={() => setDetailedView(true)}><img src={seachicon} style={{ width: 16 }} /></IconButton>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </>
                    )}

                    {uploadSummary && detailedView && manageOperation == "agregar" && (
                        <>
                            <Typography fontWeight="600" fontSize="16px" mb={2}>Detalle de carga</Typography>
                            <Typography fontWeight={500} fontSize="15px" mb={2}>Teléfonos</Typography>
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                {[
                                    { label: 'Cargados', color: '#A178E7', value: uploadSummary.success },
                                    { label: 'No cargados:\nCaracteres mínimos no cumplidos.', color: '#F1B13F', value: uploadSummary.errors?.minLength || 0 },
                                    { label: 'No cargados:\nContiene caracteres especiales.', color: '#3DB4E7', value: uploadSummary.errors?.specialChars || 0 },
                                    { label: 'No cargados:\nContiene caracteres alfanuméricos.', color: '#F280B9', value: uploadSummary.errors?.alphanumeric || 0 },
                                    { label: 'No cargados:\nContiene repetidos.', color: '#B3B3FF', value: uploadSummary.errors?.duplicated || 0 },
                                ]
                                    .map(({ label, color, value }, i, arr) => {
                                        const visibleItems = 5;
                                        return (
                                            <Box key={i} textAlign="center" width={`${100 / visibleItems}%`}>
                                                <Typography fontSize="10px" color={color} whiteSpace="pre-line">{label}</Typography>
                                                <Typography fontSize="20px" fontWeight="bold" color={color}>{value}</Typography>
                                                <Typography fontSize="12px" color={color}>
                                                    {uploadSummary.total ? Math.round((value / uploadSummary.total) * 100) : 0}%
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: '8px',
                                                        borderRadius: '4px',
                                                        mt: 1,
                                                        backgroundColor: value > 0 ? color : '#F5F5F5', // 🔥 solo pinta si hay valor
                                                        opacity: value > 0 ? 0.8 : 0.3,
                                                    }}
                                                />
                                            </Box>
                                        );
                                    })}

                            </Box>

                            <Divider sx={{ my: 2, borderColor: '#E0E0E0' }} />
                        </>
                    )}

                    {manageOperation === 'darDeBaja' && uploadSummary && !detailedView && (
                        <>
                            <Typography fontWeight="600" fontSize="16px" mb={2}>Estado de carga</Typography>
                            <Box display="flex" gap={3}>
                                {manageByList && (
                                    <Box
                                        sx={{
                                            border: '2px solid #D9B4C3',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            width: '170px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            backgroundColor: '#FDF8FA',
                                            fontFamily: 'Poppins',
                                            position: 'relative'
                                        }}
                                    >
                                        <Tooltip title="Este resumen corresponde al archivo recién cargado">
                                            <img src={infoicon} alt="info" style={{ position: 'absolute', top: 12, right: 12, width: 20 }} />
                                        </Tooltip>
                                        <img src={CloudCheckedIcon} alt="éxito" style={{ width: 48, marginBottom: 8 }} />
                                        <Typography fontWeight="600" fontSize="14px" color="#8F4D63">Archivo cargado</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ mt: 0.5 }}>{uploadSummary.fileName}</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ opacity: 0.7 }}>Total de registros: {uploadSummary.total}</Typography>
                                    </Box>
                                )}


                                {/* Tabla porcentajes */}
                                <Box flex={1}>
                                    <Box display="flex" fontWeight="600" fontSize="14px" mb={1}>
                                        <Box width="33%">Estado</Box>
                                        <Box width="33%">Números</Box>
                                        <Box width="34%">Porcentaje</Box>
                                    </Box>
                                    {[
                                        { label: 'Baja', value: uploadSummary.success },
                                        { label: 'Sin baja', value: uploadSummary.failed }
                                    ].map(({ label, value }) => {
                                        const pct = Math.round((value / uploadSummary.total) * 100);
                                        return (
                                            <Box key={label} display="flex" alignItems="center" mb={1}>
                                                <Box width="33%">{label}</Box>
                                                <Box width="33%">{value}</Box>
                                                <Box width="34%" display="flex" alignItems="center" gap={1}>
                                                    <Box flex={1} height="8px" borderRadius="4px" sx={{ backgroundColor: '#E0D1D6' }}>
                                                        <Box width={`${pct}%`} height="100%" borderRadius="4px" sx={{ backgroundColor: '#8F4D63' }} />
                                                    </Box>
                                                    <Typography fontSize="13px">{pct}%</Typography>
                                                    <IconButton onClick={() => setDetailedView(true)}><img src={seachicon} style={{ width: 16 }} /></IconButton>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </>
                    )}
                    {uploadSummary && detailedView && manageOperation === 'darDeBaja' && (
                        <Box
                            sx={{
                                border: '1px solid #E4D8D2',
                                borderRadius: 2,
                                p: 2,
                                mt: 2,
                                backgroundColor: '#FDF9F8',
                            }}
                        >
                            <Typography fontWeight="bold" fontSize="16px" mb={1}>
                                Teléfonos
                            </Typography>

                            {/* Barra de progreso personalizada */}
                            <Box display="flex" height="10px" borderRadius="8px" overflow="hidden" mb={2}>
                                <Box
                                    width={`${(uploadSummary.success / (uploadSummary.success + uploadSummary.failed)) * 100}%`}
                                    bgcolor="#A178E7"
                                />
                                <Box
                                    width={`${(uploadSummary.failed / (uploadSummary.success + uploadSummary.failed)) * 100}%`}
                                    bgcolor="#F1B13F"
                                />
                            </Box>

                            {/* Valores */}
                            <Box display="flex" justifyContent="space-between">
                                <Box textAlign="center" width="50%">
                                    <Typography color="#A178E7" fontWeight="medium">Dados de baja:</Typography>
                                    <Typography fontSize="22px" fontWeight="bold" color="#A178E7">
                                        {uploadSummary.success}
                                    </Typography>
                                    <Typography color="#A178E7">
                                        {((uploadSummary.success / (uploadSummary.success + uploadSummary.failed)) * 100).toFixed(2)}%
                                    </Typography>
                                </Box>

                                <Box textAlign="center" width="50%">
                                    <Typography color="#F1B13F" fontWeight="medium">
                                        No dados de baja:
                                    </Typography>
                                    <Typography fontSize="22px" fontWeight="bold" color="#F1B13F">
                                        {uploadSummary.failed}
                                    </Typography>
                                    <Typography color="#F1B13F">
                                        {((uploadSummary.failed / (uploadSummary.success + uploadSummary.failed)) * 100).toFixed(2)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {uploadSummary && !detailedView && manageOperation === 'eliminar' && (
                        <>
                            <Typography fontWeight="600" fontSize="16px" mb={2}>Estado de carga</Typography>
                            <Box display="flex" gap={3}>
                                {manageByList && (
                                    <Box
                                        sx={{
                                            border: '2px solid #D9B4C3',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            width: '170px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            backgroundColor: '#FDF8FA',
                                            fontFamily: 'Poppins',
                                            position: 'relative'
                                        }}
                                    >
                                        <Tooltip title="Este resumen corresponde al archivo recién cargado">
                                            <img src={infoicon} alt="info" style={{ position: 'absolute', top: 12, right: 12, width: 20 }} />
                                        </Tooltip>
                                        <img src={CloudCheckedIcon} alt="éxito" style={{ width: 48, marginBottom: 8 }} />
                                        <Typography fontWeight="600" fontSize="14px" color="#8F4D63">Archivo cargado</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ mt: 0.5 }}>{uploadSummary.fileName}</Typography>
                                        <Typography fontSize="12px" color="#574B4F" sx={{ opacity: 0.7 }}>Total de registros: {uploadSummary.total}</Typography>
                                    </Box>
                                )}


                                {/* Tabla porcentajes */}
                                <Box flex={1}>
                                    <Box display="flex" fontWeight="600" fontSize="14px" mb={1}>
                                        <Box width="33%">Estado</Box>
                                        <Box width="33%">Números</Box>
                                        <Box width="34%">Porcentaje</Box>
                                    </Box>
                                    {[
                                        { label: 'Eliminados', value: uploadSummary.success },
                                        { label: 'No Eliminados', value: uploadSummary.failed }
                                    ].map(({ label, value }) => {
                                        const pct = Math.round((value / uploadSummary.total) * 100);
                                        return (
                                            <Box key={label} display="flex" alignItems="center" mb={1}>
                                                <Box width="33%">{label}</Box>
                                                <Box width="33%">{value}</Box>
                                                <Box width="34%" display="flex" alignItems="center" gap={1}>
                                                    <Box flex={1} height="8px" borderRadius="4px" sx={{ backgroundColor: '#E0D1D6' }}>
                                                        <Box width={`${pct}%`} height="100%" borderRadius="4px" sx={{ backgroundColor: '#8F4D63' }} />
                                                    </Box>
                                                    <Typography fontSize="13px">{pct}%</Typography>
                                                    <IconButton onClick={() => setDetailedView(true)}><img src={seachicon} style={{ width: 16 }} /></IconButton>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </>
                    )}

                    {uploadSummary && detailedView && manageOperation === 'eliminar' && (
                        <>
                            <Typography fontWeight="600" fontSize="16px" mb={2}>Detalle de carga</Typography>
                            <Typography fontWeight={500} fontSize="15px" mb={2}>Teléfonos</Typography>

                            <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor="#FFF7F7" borderRadius="12px" px={3} py={2}>

                                <Box flex={1}>
                                    <Box height={10} display="flex" borderRadius="5px" overflow="hidden">
                                        <Box
                                            flex={uploadSummary.success}
                                            bgcolor="#A178E7"
                                            height="100%"
                                            sx={{ transition: 'width 0.3s ease' }}
                                        />
                                        <Box
                                            flex={uploadSummary.failed}
                                            bgcolor="#F1B13F"
                                            height="100%"
                                            sx={{ transition: 'width 0.3s ease' }}
                                        />
                                    </Box>
                                </Box>

                                <Box display="flex" flexDirection="column" mt={2}>
                                    {/* Barra de progreso */}
                                    <Box height="10px" display="flex" borderRadius="5px" overflow="hidden">
                                        <Box
                                            width={`${(uploadSummary.success / uploadSummary.total) * 100 || 0}%`}
                                            bgcolor="#A178E7"
                                            height="100%"
                                            sx={{
                                                transition: 'width 0.3s ease',
                                                minWidth: uploadSummary.success > 0 ? '2%' : 0,
                                            }}
                                        />
                                        <Box
                                            width={`${(uploadSummary.failed / uploadSummary.total) * 100 || 0}%`}
                                            bgcolor="#F1B13F"
                                            height="100%"
                                            sx={{
                                                transition: 'width 0.3s ease',
                                                minWidth: uploadSummary.failed > 0 ? '2%' : 0,
                                            }}
                                        />
                                    </Box>

                                    {/* Texto inferior con detalles */}
                                    <Box display="flex" justifyContent="space-between" width="100%" mt={2}>
                                        <Box textAlign="center" flex={1}>
                                            <Typography fontSize="13px" fontWeight="medium" color="#A178E7">
                                                Eliminados:
                                            </Typography>
                                            <Typography fontSize="20px" fontWeight="bold" color="#A178E7">
                                                {uploadSummary.success}
                                            </Typography>
                                            <Typography fontSize="12px" color="#A178E7">
                                                {uploadSummary.total ? ((uploadSummary.success / uploadSummary.total) * 100).toFixed(2) : '0.00'}%
                                            </Typography>
                                        </Box>
                                        <Box textAlign="center" flex={1}>
                                            <Typography fontSize="13px" fontWeight="medium" color="#F1B13F">
                                                No eliminados:
                                            </Typography>
                                            <Typography fontSize="20px" fontWeight="bold" color="#F1B13F">
                                                {uploadSummary.failed}
                                            </Typography>
                                            <Typography fontSize="12px" color="#F1B13F">
                                                {uploadSummary.total ? ((uploadSummary.failed / uploadSummary.total) * 100).toFixed(2) : '0.00'}%
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                            </Box>
                        </>
                    )}

                </Box>
            </Modal>


            <ModalError
                isOpen={errorModal}
                title="Error al cargar registros"
                message="Algo salió mal. Inténtelo de nuevo o regrese más tarde."
                buttonText="Cerrar"
                onClose={() => setErrorModal(false)}
            />
        </Box>
    );
};

export default NumbersDids;
