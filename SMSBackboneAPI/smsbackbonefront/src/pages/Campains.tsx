import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Divider,
  Grid,
  Paper,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  Select,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  RadioGroup,
  Checkbox,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  FormControl,
  FormControlLabel,
  SelectChangeEvent,
  Switch,
  Radio,
  FormGroup,
  Popover
} from "@mui/material";
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import seachicon from '../assets/icon-lupa.svg'
import MoreVertIcon from "@mui/icons-material/MoreVert";
import welcome from '../assets/icon-welcome.svg'
import PushPinIcon from "@mui/icons-material/PushPin";
import iconplus from "../assets/Icon-plus.svg";
import IconArrowDown1 from "../assets/IconArrowDown1.svg";
import CloseIcon from '@mui/icons-material/Close';
import IconTache from "../assets/icon-close.svg";
import iconclose from "../assets/icon-close.svg";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckIcon from '@mui/icons-material/Check';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DynamicCampaignText from '../components/commons/DynamicCampaignText'
import IconTrash from "../assets/IconTrash.svg";
import IconCirclePlus from "../assets/IconCirclePlus.svg";
import IconCloudError from '../assets/IconCloudError.svg'
import CloudCheckedIcon from '../assets/CloudCheckedIcon.svg'
import UpCloudIcon from '../assets/UpCloudIcon.svg'
import SecondaryButton from '../components/commons/SecondaryButton'
import MainModal from '../components/commons/MainModal';
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import CustomDateTimePicker from '../components/commons/DatePickerOneDate';
import TemplateViewer from '../components/commons/TemplateViewer'
import smsico from '../assets/Icon-sms.svg'
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import MainButton from '../components/commons/MainButton'
import infoicon from '../assets/Icon-info.svg'
import infoiconerror from '../assets/Icon-infoerror.svg'
import ModalError from "../components/commons/ModalError"
import Thrashicon from '../assets/Icon-trash-Card.svg'
import boxopen from '../assets/NoResultados.svg';
import * as XLSX from 'xlsx';
import RemoveIcon from "@mui/icons-material/Remove";
import IconPlus2 from '../assets/IconPlus2.svg';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from 'react-beautiful-dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import RestoreIcon from "@mui/icons-material/Restore";
import { Tooltip } from "@mui/material";
import IconSMS from '../assets/IconSMS.svg';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { scaleLinear } from "d3-scale";
import DropZone from '../components/commons/DropZone';
import { Tabs, Tab } from '@mui/material';
import MapChart from "../components/commons/Map";
import { Menu, MenuItem } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Chipbar from '../components/commons/ChipBar'
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import DynamicCampaignEditText from '../components/commons/DynamicCampaignEditText';
interface Horario {
  titulo: string;
  start: Date | null;
  end: Date | null;
  operationMode?: number; // 1 o 2
  order?: number;
}

export interface Template {
  id: number;
  name: string;
  message: string;
  creationDate: string; // DateTime en C# es string en JS/TS
  idRoom: number;
}

export interface BlackList {
  id: number;
  name: string;
  creationDate: string;
  expirationDate: string;
  quantity: number;
}
export interface CampaignFullResponse {
  id: number;
  name: string;
  message?: string;
  useTemplate: boolean;
  templateId?: number;
  autoStart: boolean;
  flashMessage: boolean;
  customANI: boolean;
  recycleRecords: boolean;
  numberType: number;
  createdDate: string;
  startDate: string;
  numeroActual: number;
  numeroInicial: number;
  respondedRecords: number;
  outOfScheduleRecords: number;
  blockedRecords: number;
  recycleCount: number;
  receptionRate: number;
  inProcessCount: number;
  deliveredCount: number;
  notDeliveredCount: number;
  notSentCount: number;
  failedCount: number;
  exceptionCount: number;
  noReceptionRate: number;
  waitRate: number;
  deliveryFailRate: number;
  rejectionRate: number;
  noSendRate: number;
  exceptionRate: number;
  schedules: CampaignScheduleDto[];
  recycleSetting?: CampaignRecycleSettingDto;
  contacts: CampaignContactDto[];
  saveAsTemplate: boolean;
  templateName: String;
  campaignContactScheduleSendDTO?: CampaignContactScheduleSendDTO[];
}

export interface CampaignContactScheduleSendDTO {
  id: number;
  campaignId: number;
  contactId: number;
  scheduleId: number;
  sentAt?: string;
  status: string;
  responseMessage?: string;
  state: string;
}

export interface CampaignScheduleDto {
  startDateTime: string;
  endDateTime: string;
  operationMode?: number;
  order: number;
}

export interface DuplicateHorario {
  start: Date;
  end: Date;
  operationMode: number; // 1 = normal, 2 = reciclado
};


export interface CampaignRecycleSettingDto {
  typeOfRecords?: string;
  includeNotContacted: boolean;
  numberOfRecycles: number;
}

export interface CampaignContactDto {
  phoneNumber: string;
  dato?: string;
  datoId?: string;
  misc01?: string;
  misc02?: string;
}

const Campains: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | undefined>(undefined);
  const [campaignName, setCampaignName] = useState('');
  const [Serchterm, setSerchterm] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(false);
  const [tipoMensaje, setTipoMensaje] = useState<'escrito' | 'plantilla'>('escrito');
  const [mensajeAceptado, setMensajeAceptado] = useState(false);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [tipoNumero, setTipoNumero] = useState('corto');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [aniEnabled, setAniEnabled] = useState(false);
  const [recycleEnabled, setRecycleEnabled] = useState(false);
  const [recycleType, setRecycleType] = useState('todos'); // 'todos' o 'rechazados'
  const [includeUncontacted, setIncludeUncontacted] = useState(false);
  const [recycleCount, setRecycleCount] = useState(1);
  const [blacklistEnabled, setBlacklistEnabled] = useState(false);
  const [blackLists, setBlackLists] = useState<BlackList[]>([]);
  const [searchTermBlacklist, setSearchTermBlacklist] = useState('');
  const [selectedAni, setSelectedAni] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [messageChipBar, setMessageChipBar] = useState("");
  const [TitleErrorModal, setTitleErrorModal] = useState('');
  const [MessageErrorModal, setMessageErrorModal] = useState('');
  const [currentHorarioIndex, setCurrentHorarioIndex] = useState<number | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignFullResponse | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [editActiveStep, setEditActiveStep] = useState<number>(0);
  const [openEditCampaignModal, setOpenEditCampaignModal] = useState(false);
  const [editCampaignName, setEditCampaignName] = useState('');
  const [editHorarios, setEditHorarios] = useState<Horario[]>([]);
  const [campaignToEdit, setCampaignToEdit] = useState<CampaignFullResponse | null>(null);
  const [editAutoStart, setEditAutoStart] = useState(false);
  const [editVariables, setEditVariables] = useState<string[]>([]);
  const [EditMensaje, setEditMensaje] = useState<string>('');
  const [editGuardarComoPlantilla, setEditGuardarComoPlantilla] = useState(false);
  const [editTemplateName, setEditTemplateName] = useState<string>('');
  const [editIsLongNumber, setEditIsLongNumber] = useState(false);
  const [editCustomAni, setEditCustomAni] = useState(false);
  const [editAniValue, setEditAniValue] = useState('');
  const [editReciclar, setEditReciclar] = useState(false);
  const [editFlash, setEditFlash] = useState(false);
  const [editUsarListaNegra, setEditUsarListaNegra] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState<'todas' | 'encendidas' | 'detenidas'>();
  const [elapsedTime, setElapsedTime] = useState('');
  const [openDuplicateModal, setOpenDuplicateModal] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateAutoStart, setDuplicateAutoStart] = useState(false);
  const [duplicateHorarios, setDuplicateHorarios] = useState<DuplicateHorario[]>([
    {
      start: new Date(),
      end: new Date(),
      operationMode: 1
    }
  ]); const [shouldConcatenate, setShouldConcatenate] = useState(true);
  const [shouldShortenUrls, setShouldShortenUrls] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [stateRespondedCounts, setStateRespondedCounts] = useState<{ stateName: string; messages: number }[]>([]);
  const [showChipBarAdd, setShowChipBarAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [allowConcatenation, setAllowConcatenation] = useState(false);

  const [openPicker, setOpenPicker] = useState<{
    open: boolean;
    index: number;
    field: 'start' | 'end' | '';
  }>({
    open: false,
    index: 0,
    field: '',
  });

  const handleChangeHorario = (
    index: number,
    date: Date,
    campo: 'start' | 'end'
  ) => {
    setHorarios((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [campo]: date } : h))
    );
  };


  const handleOpenEditCampaignModal = (campaign: CampaignFullResponse) => {
    setSelectedCampaign(campaign);
    setEditCampaignName(campaign.name);
    setEditAutoStart(campaign.autoStart ?? false);
    setEditMensaje(campaign.message ?? '');
    // ✅ Fechas y horarios
    setEditHorarios(
      campaign.schedules.map((s, index) => ({
        titulo: `Horario ${index + 1}`,
        start: new Date(s.startDateTime),
        end: new Date(s.endDateTime),
        operationMode: s.operationMode ?? 1,
        order: s.order
      }))
    );

    // ✅ Configuraciones adicionales
    setEditIsLongNumber(campaign.numberType === 2);
    setEditCustomAni(campaign.customANI);
    setEditAniValue('');
    setEditReciclar(campaign.recycleRecords);
    setEditUsarListaNegra(false);
    setEditFlash(campaign.flashMessage || false);
    setEditMensaje(campaign.message || '');

    // ✅ Variables disponibles
    const tieneDato = campaign.contacts.some(c => !!c.dato);
    const tieneID = campaign.contacts.some(c => !!c.datoId);
    const vars: string[] = [];
    if (tieneDato) vars.push("Dato");
    if (tieneID) vars.push("ID");
    setEditVariables(vars);

    setOpenEditCampaignModal(true);
    setEditActiveStep(-1);
  };



  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const [estadisticasCarga, setEstadisticasCarga] = useState<{
    registrosCargados: number;
    registrosFallidos: number;
    telefonosCargados: number;
    telefonosFallidos: number;
  } | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const dataCountry = [
    { id: "01", state: "Aguascalientes", value: 10 },
    { id: "02", state: "Baja California", value: 20 },
    { id: "03", state: "Baja California Sur", value: 30 },
    { id: "04", state: "Campeche", value: 40 },
    { id: "05", state: "Coahuila", value: 50 }
  ];

  const registros = [
    { tipo: "Respondidos", total: 4, porcentaje: "4%" },
    { tipo: "Fuera de horario", total: 4, porcentaje: "4%" },
    { tipo: "Bloqueados", total: 4, porcentaje: "4%" }
  ];



  const mensajesIndicadores = [
    ["Mensajes entregados de forma correcta."],
    ["Mensaje no entregado.", "Esta condición se presenta cuando se ha vencido el tiempo de entrega asignado."],
    ["Mensaje en espera.", "El mensaje ha sido aceptado por la red destino, pero el usuario tiene apagado su teléfono."],
    ["Mensaje fallido.", "La red destino ha enviado el mensaje al usuario, pero el usuario ha rechazado su entrega."],
    ["Mensaje rechazado.", "Esta condición se presenta cuando la red destino rechaza el mensaje."],
    ["Mensaje no enviado.", "No hubo un carrier disponible para enviarlo.", "No se consumieron créditos."],
    ["Excepción no controlada en el sistema.", "No se consumieron créditos."]
  ];

  const data = [
    { name: "Recibidos", value: 90, color: "#A17EFF" },
    { name: "No recibidos", value: 10, color: "#F6B960" },
    { name: "En espera", value: 90, color: "#5EBBFF" },
    { name: "Entrega-falla", value: 90, color: "#FF88BB" },
    { name: "Rechazados", value: 90, color: "#F6B960" },
    { name: "No enviados", value: 90, color: "#A6A6A6" },
    { name: "Excepciones", value: 90, color: "#7DD584" }
  ];
  const aniOptions = ['Regionalizado', 'Centralizado',];
  const filteredBlackLists = blackLists.filter((item) =>
    item.name.toLowerCase().includes(searchTermBlacklist.toLowerCase())
  );

  const fetchTemplates = async () => {
    const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;
    try {
      setLoadingTemplates(true);
      const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_GETTEMPLATESBYROOM}${salaId}`;
      const response = await axios.get(requestUrl);
      setTemplates(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchBlackLists = async () => {
    const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;
    if (!salaId) return;

    try {

      const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_BLACKLIST}${salaId}`;
      const response = await axios.get(requestUrl);
      if (response.status === 200) {
        setBlackLists(response.data);
      }
    } finally {
    }
  };

  const validatePhone = (value: string) => {
    const phoneRegex = /^\d{10,12}$/; // Acepta entre 10 y 12 dígitos
    return phoneRegex.test(value);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPhone(value);
    setError(!validatePhone(value)); // Actualiza error según la validación
  };

  const handleSearch2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSerchterm(value); // Actualiza el estado de búsqueda

    //ToDo: buscador campañas
  };

  const [checkedTelefonos, setCheckedTelefonos] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'telefonos' | 'variables'>('telefonos');
  const [postCargaActiva, setPostCargaActiva] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [openInfoModal, setOpenInfoModal] = useState(false);

  const [isRunning, setIsRunning] = useState(true);

  const [infoChecks, setInfoChecks] = useState<Record<string, boolean>>({
    "Horarios": true,
    "Prueba de envío de mensaje": true,
    "Registros": true,
    "Mapa de concentración de mensajes": true,
    "Resultados de envío por día": true,
  });

  const [selectedTelefonos, setSelectedTelefonos] = useState<string[]>([]);
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);

  const [openCreateCampaignModal, setOpenCreateCampaignModal] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [calendarAnchor, setCalendarAnchor] = useState<null | HTMLElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<"start" | "end" | null>(null); // saber cuál está editando

  const handleManageFile = (file: File) => {
    console.log("📁 Archivo recibido:", file.name);
    const isValid = file.name.endsWith('.xlsx');

    if (!isValid) {
      setUploadedFile(null);
      setFileError(true);
      setFileSuccess(false);
      return;
    }

    setFileError(false);
    setFileSuccess(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(''); // 👈 dejar vacío para que no seleccione nada automáticamente
      setExcelData([]);
      setColumns([]);
    };
    reader.readAsArrayBuffer(file);

    const readerB64 = new FileReader();
    readerB64.onloadend = () => {
      const base64 = (readerB64.result as string).split(',')[1];
      setBase64File(base64);
      setUploadedFileBase64(base64);
    };
    readerB64.readAsDataURL(file);
  };



  const [telefonos, setTelefonos] = useState<string[]>([]);
  const [variables, setVariables] = useState<string[]>([]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState(false);
  const [fileSuccess, setFileSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedDatoCol, setSelectedDatoCol] = useState('');
  const [selectedTelefonoCol, setSelectedTelefonoCol] = useState('');
  const [omitHeaders, setOmitHeaders] = useState(false);
  const [workbook, setWorkbook] = useState<any>(null);
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [base64File, setBase64File] = useState('');
  const [uploadedFileBase64, setUploadedFileBase64] = useState('');
  const [dragColumns, setDragColumns] = useState<string[]>([]);
  const [selectedBlackListIds, setSelectedBlackListIds] = useState<number[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignFullResponse[]>([]);
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignFullResponse | null>(null);
  const [stateMessageCounts, setStateMessageCounts] = useState<{ stateName: string; messages: number }[]>([]);



  const handleAgregarHorarioEditar = () => {
    setEditHorarios(prev => [
      ...prev,
      {
        titulo: `Horario ${prev.length + 1}`,
        start: new Date(),
        end: new Date(),
        operationMode: 1,
        order: prev.length + 1
      }
    ]);
  };

  const handleStartDateChangeEditar = (index: number, newStart: Date) => {
    setEditHorarios(prev =>
      prev.map((h, i) => i === index ? { ...h, start: newStart } : h)
    );
  };

  const handleEndDateChangeEditar = (index: number, newEnd: Date) => {
    setEditHorarios(prev =>
      prev.map((h, i) => i === index ? { ...h, end: newEnd } : h)
    );
  };

  const handleEliminarHorarioEditar = (index: number) => {
    setEditHorarios(prev => prev.filter((_, i) => i !== index));
  };


  const handleAgregarHorario = () => {
    setHorarios((prev) => {
      if (prev.length >= 5) {
        return prev;
      }

      return [
        ...prev,
        {
          titulo: `Horario ${prev.length + 1}`,
          start: null,  // ← dejamos vacío
          end: null,    // ← dejamos vacío
          operationMode: 1,
          order: prev.length + 1
        }
      ];
    });

    const handleStartDateChange = (index: number, newStart: Date) => {
      setHorarios(prev =>
        prev.map((h, i) => i === index ? { ...h, start: newStart } : h)
      );
    };

    const handleEndDateChange = (index: number, newEnd: Date) => {
      setHorarios(prev =>
        prev.map((h, i) => i === index ? { ...h, end: newEnd } : h)
      );
    };

    // Mostrar solo si aún no se ha mostrado
    if (!mostrarModoOperacion) {
      setMostrarModoOperacion(true);
    }
  };
  const handleEliminarHorario = (index: number) => {
    setHorarios((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const currentSet = selectedTab === 'telefonos' ? selectedTelefonos : selectedVariables;
    setDragColumns(columns.filter(col =>
      !selectedTelefonos.includes(col) || selectedTab === 'telefonos'
    ).filter(col =>
      !selectedVariables.includes(col) || selectedTab === 'variables'
    ));
  }, [selectedTelefonos, selectedVariables, selectedTab, columns]);

  const handleContinue = async () => {
    if (activeStep === 0 && !postCargaActiva) {
      const cargaExitosa = await handleSaveTemplate();
      if (!cargaExitosa) return;
      setPostCargaActiva(true);
    } else if (activeStep === 2) {
      await handleSaveCampaign(); // Aquí se guarda la campaña
    } else if (activeStep === 1) {
      if (!mensajeAceptado) {
        setMensajeAceptado(true);
        return;
      }
      setActiveStep((prev) => prev + 1);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };


  const handleSheetChange = (event: SelectChangeEvent<string>) => {
    const selected = event.target.value;
    setSelectedSheet(selected);

    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[selected], { header: 1 });
    const jsonData = sheet as any[][];
    setExcelData(jsonData);

    const allColumns = jsonData[0] as string[];
    setColumns(allColumns);

    // Clasificación de columnas
    const telCols = allColumns.filter(col =>
      col.toLowerCase().includes("teléfono") || col.toLowerCase().includes("telefono")
    );
    const varCols = allColumns.filter(col => !telCols.includes(col));

    setTelefonos(telCols);
    setVariables(varCols);
  };


  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (!selectedCampaign?.startDate) return;

    const interval = setInterval(() => {
      const start = new Date(selectedCampaign.startDate).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      setElapsedTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedCampaign?.startDate]);


  const fetchCampaigns = async () => {
    setLoadingPage(true);
    const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;
    if (!salaId) return;

    try {
      const url = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GET_CAMPAIGN + salaId}`;
      const response = await axios.get(url);
      if (response.status === 200) {
        setCampaigns(response.data);

        const firstCampaign = response.data[0];

        if (selectedCampaignId) {
          const exists = response.data.some((c: { id: number }) => c.id === selectedCampaignId);
          if (!exists) {
            setSelectedCampaignId(firstCampaign?.id || null);
            setSelectedCampaign(firstCampaign);
          }
        } else {
          setSelectedCampaignId(firstCampaign?.id || null);
          setSelectedCampaign(firstCampaign);
        }

      }
    } catch (error) {
      console.error("Error al traer campañas:", error);
    }
    finally {
      setLoadingPage(false);
    }
  };

  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);

  const filteredCampaigns = campaigns.filter(c => {
    if (campaignFilter === 'encendidas') return c.autoStart;
    if (campaignFilter === 'detenidas') return !c.autoStart;
    return true; // 'todas'
  }).filter((c) =>
    c.name.toLowerCase().includes(Serchterm.toLowerCase())
  );


  const [pinnedCampaigns, setPinnedCampaigns] = useState<number[]>([]);

  const colorScale = scaleLinear<string>()
    .domain([0, 50])
    .range(["#F5E8EA", "#7B354D"]);

  const [panelAbierto, setPanelAbierto] = useState(true);

  const [horarios, setHorarios] = useState<Horario[]>([{
    titulo: "Horario 1",
    start: null,
    end: null,
    operationMode: 1, // opcional
    order: 1          // opcional
  }]);
  const [mostrarModoOperacion, setMostrarModoOperacion] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const current = selectedTab === 'telefonos' ? [...selectedTelefonos] : [...selectedVariables];
    const [moved] = current.splice(result.source.index, 1);
    current.splice(result.destination.index, 0, moved);

    if (selectedTab === 'telefonos') {
      setSelectedTelefonos(current);
    } else {
      setSelectedVariables(current);
    }
  };

  const columnsToRender = selectedTab === 'telefonos'
    ? [...telefonos, ...variables.filter(v => !telefonos.includes(v))]
    : [...variables, ...telefonos.filter(t => !variables.includes(t))];

  const currentSelected = selectedTab === 'telefonos' ? selectedTelefonos : selectedVariables;

  const handleOpenModal = () => {
    if (templates.length === 0) {
      fetchTemplates();
    }
    if (blackLists.length === 0) {
      fetchBlackLists();
    }
    setOpenCreateCampaignModal(true);
  };

  const navigate = useNavigate();

  const handleSaveTemplate = async (): Promise<boolean> => {
    setLoadingTemplates(true);
    setLoading(true);
    const sessionId = crypto.randomUUID();
    const createdBy = localStorage.getItem("userName") || "frontend"; // o ajústalo si usas otra clave
    const sheetName = selectedSheet; // nombre de la hoja seleccionada
    sessionIdRef.current = sessionId;

    try {
      if (!uploadedFileBase64 || selectedTelefonos.length === 0 || selectedVariables.length === 0) {
        throw new Error("Faltan campos requeridos");
      }

      const payload = {
        Base64File: uploadedFileBase64,
        SheetName: sheetName,
        PhoneColumns: selectedTelefonos,
        DatoColumns: selectedVariables,
        SessionId: sessionIdRef.current,
        CreatedBy: createdBy
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_ADD_TMPSAVEFILE}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setMessageChipBar("Registros añadidos con éxito");
        setEstadisticasCarga(response.data);
      }
      return true;
    } catch (error) {
      console.error(error);
      setIsErrorModalOpen(true);
      setTitleErrorModal('Error al cargar archivo');
      setMessageErrorModal('Ocurrió un error al intentar cargar el archivo. Inténtalo más tarde.');
      return false;
    } finally {
      setLoadingTemplates(false);
      setLoading(false);
    }
  };

  const totalRegistros = (estadisticasCarga?.registrosCargados || 0) + (estadisticasCarga?.registrosFallidos || 0);
  const porcentajeRegistrosCargados = totalRegistros > 0
    ? Math.round((estadisticasCarga?.registrosCargados || 0) * 100 / totalRegistros)
    : 0;

  const totalTelefonos = (estadisticasCarga?.telefonosCargados || 0) + (estadisticasCarga?.telefonosFallidos || 0);
  const porcentajeTelefonosCargados = totalTelefonos > 0
    ? Math.round((estadisticasCarga?.telefonosCargados || 0) * 100 / totalTelefonos)
    : 0;

  const handleCloseModalCampaña = () => {
    setTelefonos([]);
    setVariables([]);
    setCampaignName('');
    setMensajeTexto('');
    setTipoMensaje('escrito');
    setMensajeAceptado(false);
    setSelectedTemplate(undefined);
    setFlashEnabled(false);
    setAniEnabled(false);
    setRecycleEnabled(false);
    setRecycleType('todos');
    setIncludeUncontacted(false);
    setRecycleCount(1);
    setBlacklistEnabled(false);
    setSelectedBlackListIds([]);
    setHorarios([{
      titulo: "Horario 1",
      start: null,
      end: null,
      operationMode: 1,
      order: 1
    }]);
    setMostrarModoOperacion(false);
    setPostCargaActiva(false);
    setActiveStep(-1);
    setUploadedFile(null);
    setUploadedFileBase64('');
    setSelectedTelefonos([]);
    setSelectedVariables([]);
    setCheckedTelefonos([]);
    setEstadisticasCarga(null);
    setMessageChipBar('');
    sessionIdRef.current = null;
    setFileError(false);
    setFileSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet('');
    setColumns([]);
    setExcelData([]);
    setBase64File('');
    setUploadedFileBase64('');
    setOpenCreateCampaignModal(false);
  };

  const handleRemoveUploadedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFile(null);
    setUploadedFileBase64('');
    setFileError(false);
    setFileSuccess(false);
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet('');
    setColumns([]);
    setExcelData([]);
    setBase64File('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toLocalISOString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  };


  const handleSaveCampaign = async () => {
    setLoading(true);
    try {
      const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

      const payload = {
        campaigns: {
          name: campaignName,
          RoomId: salaId,
          message: mensajeTexto,
          useTemplate: tipoMensaje === "plantilla",
          templateId: tipoMensaje === "plantilla" ? selectedTemplate?.id : null,
          autoStart: true,
          flashMessage: flashEnabled,
          customANI: aniEnabled,
          recycleRecords: recycleEnabled,
          numberType: tipoNumero === 'corto' ? 1 : 2,
          createdDate: new Date().toISOString(),
          concatenate: shouldConcatenate,
          shortenUrls: shouldShortenUrls
        },
        campaignSchedules: horarios.map((h, index) => ({
          startDateTime: toLocalISOString(h.start!),
          endDateTime: toLocalISOString(h.end!),
          operationMode: recycleEnabled ? 2 : 1,
          order: index + 1
        })),
        campaignRecycleSetting: recycleEnabled ? {
          typeOfRecords: recycleType, // 'todos' o 'rechazados'
          includeNotContacted: includeUncontacted,
          numberOfRecycles: recycleCount
        } : null,
        blacklistIds: blacklistEnabled ? selectedBlackListIds : [],
        sessionId: sessionIdRef.current,
        saveAsTemplate: saveAsTemplate,
        templateName: templateName,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_ADD_CAMPAIGN}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setMessageChipBar("Campaña Agregada con Exito");
        setShowChipBarAdd(true);
        setTimeout(() => setShowChipBarAdd(false), 3000);
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      handleCloseModalCampaña();
      setLoading(false);
      await fetchCampaigns();
    }
  };

  const progresoCampaña = selectedCampaign?.numeroInicial
    ? Math.round((selectedCampaign.numeroActual / selectedCampaign.numeroInicial) * 100)
    : 0;

  const now = new Date();

  const getScheduleStatus = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate < now) return 'expired';
    if (startDate > now) return 'upcoming';
    return 'current';
  };

  const totalProcesados = selectedCampaign?.numeroActual ?? 0;

  const getPercentage = (valor: number) =>
    totalProcesados > 0 ? `${Math.round((valor / totalProcesados) * 100)}%` : "0%";


  const total = selectedCampaign?.numeroInicial ?? 0;
  const getRatePercent = (valor: number) =>
    total > 0 ? Math.round((valor / total) * 100) : 0;
  const barData = [
    { name: "En proceso", value: selectedCampaign?.inProcessCount ?? 0, color: "#A17EFF" },
    { name: "Entregados", value: selectedCampaign?.deliveredCount ?? 0, color: "#F6B960" },
    { name: "No entregados", value: selectedCampaign?.notDeliveredCount ?? 0, color: "#5EBBFF" },
    { name: "No enviados", value: selectedCampaign?.notSentCount ?? 0, color: "#FF88BB" },
    { name: "Fallidos", value: selectedCampaign?.failedCount ?? 0, color: "#A6A6A6" },
    { name: "Excepciones", value: selectedCampaign?.exceptionCount ?? 0, color: "#7DD584" }
  ];


  const getRate = (cantidad: number) =>
    total > 0 ? `${Math.round((cantidad / total) * 100)}%` : "0%";

  const indicadores = [
    { label: "Tasa de en proceso", value: getRate(selectedCampaign?.inProcessCount ?? 0), color: "#A17EFF" },
    { label: "Tasa de entrega", value: getRate(selectedCampaign?.deliveredCount ?? 0), color: "#F6B960" },
    { label: "Tasa de no entrega", value: getRate(selectedCampaign?.notDeliveredCount ?? 0), color: "#5EBBFF" },
    { label: "Tasa de no envío", value: getRate(selectedCampaign?.notSentCount ?? 0), color: "#FF88BB" },
    { label: "Tasa de falla", value: getRate(selectedCampaign?.failedCount ?? 0), color: "#A6A6A6" },
    { label: "Tasa de excepción", value: getRate(selectedCampaign?.exceptionCount ?? 0), color: "#7DD584" }
  ];


  const handleContinuarEditar = () => {
    if (editActiveStep === -1) {
      // Ir al paso de mensaje (step 1)
      setEditActiveStep(1);
    } else if (editActiveStep === 1) {
      // Ir al paso de configuraciones (step 2)
      setEditActiveStep(2);
    } else if (editActiveStep === 2) {
      // Ir al último paso: guardar como plantilla
      handleEditCampaign();
    }
  };

  const handleAtrasEditar = () => {
    if (editActiveStep === 1) {
      // Ir al último paso: guardar como plantilla
      setEditActiveStep(-1)
    } else {
      setEditActiveStep(editActiveStep - 1)
    }
  };

  const handleSelectCampaign = (selected: CampaignFullResponse) => {
    if (selectedCampaign?.id === selected.id) return;
    setSelectedCampaignId(selected.id);
    const reordered = [selected, ...campaigns.filter(c => c.id !== selected.id)];
    setCampaigns(reordered);
    setSelectedCampaign(selected);
  };

  const handleCloseEditModal = () => {
    setOpenEditCampaignModal(false);
    setEditActiveStep(0); // opcional: resetear pasos si es necesario
  };

  const handleEditCampaign = async () => {
    try {
      if (!selectedCampaign?.id) return;

      const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

      const payload = {
        campaigns: {
          id: selectedCampaign.id,
          name: editCampaignName,
          RoomId: salaId,
          message: EditMensaje,
          autoStart: editAutoStart,
          flashMessage: editFlash,
          customANI: editCustomAni,
          recycleRecords: editReciclar,
          numberType: editIsLongNumber ? 2 : 1,
          createdDate: selectedCampaign.createdDate || new Date().toISOString(),
          shouldConcatenate: false,
          shouldShortenUrls: false,
        },
        campaignSchedules: editHorarios.map((h, index) => ({
          startDateTime: h.start?.toISOString(),
          endDateTime: h.end?.toISOString(),
          operationMode: editReciclar ? 2 : 1,
          order: index + 1
        })),
        campaignRecycleSetting: editReciclar ? {
          typeOfRecords: recycleType,
          includeNotContacted: includeUncontacted,
          numberOfRecycles: recycleCount
        } : null,
        blacklistIds: editUsarListaNegra ? selectedBlackListIds : [],
        sessionId: sessionIdRef.current || "",
        saveAsTemplate: editGuardarComoPlantilla,
        templateName: editTemplateName,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_EDIT_CAMPAIGN}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setMessageChipBar("Campaña actualizada con éxito");
        setShowChipBarAdd(true);
        setTimeout(() => setShowChipBarAdd(false), 3000);
        setOpenEditCampaignModal(false);
        await fetchCampaigns(); // opcional: recargar campañas
      }
    } catch (error) {
      setTitleErrorModal("Error al actualizar campaña");
      setMessageErrorModal("No ha sido posible actualizar la campaña. Intente más tarde.");
      setIsErrorModalOpen(true);
      setOpenDeleteModal(false);
    }
  };

  const handleDeleteCampaign = async (ids?: number | number[]) => {
    setLoading(true);
    try {
      // 🔄 Normaliza el parámetro a un array
      const idArray = Array.isArray(ids) ? ids : ids ? [ids] : [];

      if (idArray.length === 0) {
        setOpenDeleteModal(false);
        return;
      }

      // Validación: si alguna campaña está encendida
      const encendidas = idArray
        .map(id => campaigns.find(c => c.id === id))
        .filter(c => c?.autoStart);

      if (encendidas.length > 0) {
        setTitleErrorModal("Error al eliminar campaña");
        setMessageErrorModal("No ha sido posible eliminar una o más campañas debido a que se encuentran encendidas.");
        setIsErrorModalOpen(true);
        setOpenDeleteModal(false);
        return;
      }

      // Enviar al backend (ajusta según tu endpoint)
      await axios.post(
        `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_DELETE_CAMPAIGN}`,
        idArray,
        { headers: { 'Content-Type': 'application/json' } }
      );

      setOpenDeleteModal(false);
      setCampaignToDelete(null);
      setMessageChipBar("Campaña(s) Eliminada(s) con Exito");
      setShowChipBarAdd(true);
      setTimeout(() => setShowChipBarAdd(false), 3000);
      setSelectedCampaigns([]);
      await fetchCampaigns();
    } catch (error) {
      setTitleErrorModal("Error al eliminar campaña");
      setMessageErrorModal("No ha sido posible eliminar la campaña. Intente más tarde.");
      setIsErrorModalOpen(true);
      setOpenDeleteModal(false);
    }
    finally {
      setLoading(false);
    }
  };

  const handleConfirmDuplicateCampaign = async () => {
    try {
      const payload = {
        campaignIdToClone: selectedCampaign?.id,
        newName: duplicateName,
        newSchedules: duplicateHorarios.map((h, index) => ({
          startDateTime: h.start.toISOString(),
          endDateTime: h.end.toISOString(),
          operationMode: h.operationMode ?? 1, // ✅ conservamos el valor real
          order: index + 1
        }))
      };

      const response = await axios.post(
        `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_CLONE_CAMPAIGN}`,
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {

        setOpenDuplicateModal(false);
        setMessageChipBar("Campaña duplicada con Exito");
        setShowChipBarAdd(true);
        setTimeout(() => setShowChipBarAdd(false), 3000);
      }
    } catch (error) {
      setTitleErrorModal("Error al duplicar la campaña");
      setMessageErrorModal("No ha sido posible duplicar la campaña. Intente más tarde.");
      setIsErrorModalOpen(true);
    }
    finally {
      await fetchCampaigns();
      setOpenDuplicateModal(false);
    }
  };


  const handleStartCampaign = async (campaign: any) => {
    const updated = {
      ...campaign,
      autoStart: !campaign.autoStart,
      startDate: !campaign.autoStart ? new Date().toISOString() : null
    };
    setCampaigns(prev =>
      prev.map(c => (c.id === campaign.id ? updated : c))
    );
    const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_STAR_CAMPAIGN}${campaign.id}`
    await axios.get(requestUrl);

    setSelectedCampaign(updated);

  };

  const handleOpenDuplicateModal = (campaign: CampaignFullResponse) => {
    setSelectedCampaign(campaign);
    setDuplicateAutoStart(campaign.autoStart);
    setDuplicateHorarios([{ start: new Date(), end: new Date(), operationMode: 1 }]);

    setOpenDuplicateModal(true);
  };

  const handleAddDuplicateHorario = () => {
    if (duplicateHorarios.length < 5) {
      setDuplicateHorarios(prev => [
        ...prev,
        {
          start: new Date(),
          end: new Date(),
          operationMode: 1
        }
      ]);
    }
  };


  const handleRemoveDuplicateHorario = (index: number) => {
    if (duplicateHorarios.length > 1) {
      setDuplicateHorarios(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleDuplicateHorarioChange = (index: number,
    field: 'start' | 'end',
    value: Date) => {
    const updated = [...duplicateHorarios];
    updated[index][field] = value;
    setDuplicateHorarios(updated);
  };

  const isEditNameInvalid = !!(
    editCampaignName &&
    (editCampaignName.length > 40 || !/^[a-zA-Z0-9ñÑ ]+$/.test(editCampaignName))
  );

  const isNameInvalid = !!(
    campaignName &&
    (campaignName.length > 40 || !/^[a-zA-Z0-9ñÑ ]+$/.test(campaignName))
  );

  const isDuplicateNameInvalid = !!(
    duplicateName &&
    (duplicateName.length > 40 || !/^[a-zA-Z0-9ñÑ ]+$/.test(duplicateName))
  );

  useEffect(() => {
    if (campaigns.length === 0) return;

    const sentCounts: Record<string, number> = {};
    const respondedCounts: Record<string, number> = {};

    campaigns.forEach(campaign => {
      campaign.campaignContactScheduleSendDTO?.forEach(send => {
        if (send.state) {
          // 🔥 Contar todos los enviados (sin importar si respondieron)
          sentCounts[send.state] = (sentCounts[send.state] || 0) + 1;

          // 🔥 Contar solo los respondidos (si tiene responseMessage no vacío)
          if (send.responseMessage !== null && send.responseMessage!.trim() !== "") {
            respondedCounts[send.state] = (respondedCounts[send.state] || 0) + 1;
          }
        }
      });
    });

    const mappedSent = Object.entries(sentCounts).map(([stateName, messages]) => ({ stateName, messages }));
    const mappedResponded = Object.entries(respondedCounts).map(([stateName, messages]) => ({ stateName, messages }));

    setStateMessageCounts(mappedSent);
    setStateRespondedCounts(mappedResponded);
  }, [campaigns]);

  useEffect(() => {
    if (!selectedCampaign?.id || !selectedCampaign.schedules) return;

    const checkAndFetch = () => {
      const now = new Date();

      const isActive = selectedCampaign.schedules.some(schedule => {
        const start = new Date(schedule.startDateTime);
        const end = new Date(schedule.endDateTime);
        return start <= now && now <= end;
      });

      if (isActive) {
        const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_UPDATE_CAMPAIGN}${selectedCampaign.id}`
        fetch(requestUrl)
          .then(res => res.json())
          .then(data => {
            setSelectedCampaign(data); // refresca solo el seleccionado
          })
          .catch(err => {
            console.error("Error refrescando selectedCampaign:", err);
          });

        const sentCounts: Record<string, number> = {};
        const respondedCounts: Record<string, number> = {};
        selectedCampaign.campaignContactScheduleSendDTO?.forEach(send => {
          if (send.state) {
            // 🔥 Contar todos los enviados (sin importar si respondieron)
            sentCounts[send.state] = (sentCounts[send.state] || 0) + 1;

            // 🔥 Contar solo los respondidos (si tiene responseMessage no vacío)
            if (send.responseMessage !== null && send.responseMessage!.trim() !== "") {
              respondedCounts[send.state] = (respondedCounts[send.state] || 0) + 1;
            }
          }
        });

        const mappedSent = Object.entries(sentCounts).map(([stateName, messages]) => ({ stateName, messages }));
        const mappedResponded = Object.entries(respondedCounts).map(([stateName, messages]) => ({ stateName, messages }));

        setStateMessageCounts(mappedSent);
        setStateRespondedCounts(mappedResponded);
      }
    };

    const interval = setInterval(checkAndFetch, 5000); // revisa cada 5 seg

    return () => clearInterval(interval); // limpia cuando cambia o desmonta
  }, [selectedCampaign?.id, selectedCampaign?.schedules]);
  const [isChecked, setIsChecked] = useState(false);

  return (

    <Box sx={{ padding: "20px", marginLeft: "30px", maxWidth: "81%", mt: -7 }}>
      {loadingPage && (
        <Box sx={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Box sx={{
            width: '80px',
            height: '80px',
            border: '8px solid #f3f3f3',
            borderTop: '8px solid #8F4D63',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
        </Box>
      )}

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
              display: 'block',
            }}
          />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 500,
            color: '#330F1B',
            fontFamily: 'Poppins',
            fontSize: '26px',
          }}
        >
          {/* Título que ya tengas, como "Campañas" */}
          Campañas
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: "20px", marginTop: "17px" }} />

      <Grid container spacing={2}>
        {/* Listado de campañas */}

        <Grid item sx={{ display: 'flex', }}>
          <Box sx={{ display: "flex", }}>
            {/* Panel de campañas */}
            {panelAbierto && (
              <Paper
                sx={{
                  padding: "15px",
                  borderRadius: "8px 0 0 8px", // borde izquierdo redondeado
                  width: "370px",
                  height: "581px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "279px",
                    marginBottom: "10px", marginLeft: "25px"
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      textAlign: "left",
                      fontFamily: "Poppins",
                      letterSpacing: "0px",
                      color: "#330F1B",
                      opacity: 1,
                      fontSize: "18px",
                    }}
                  >
                    Listado de campañas
                  </Typography>
                  <Tooltip title="Crear" arrow placement="top"
                    componentsProps={{
                      tooltip: {
                        sx: {
                          backgroundColor: "#000000",
                          color: "#CCC3C3",
                          fontFamily: "Poppins, sans-serif",
                          fontSize: "12px",
                          padding: "6px 8px",
                          borderRadius: "8px",
                          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
                        }
                      },
                      arrow: {
                        sx: {
                          color: "#000000"
                        }
                      }
                    }}
                    PopperProps={{
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                          }
                        }
                      ]
                    }}
                  >
                    <IconButton onClick={handleOpenModal} sx={{}}>
                      <img src={iconplus} alt="Agregar" style={{ width: "20px", height: "20px", }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar"
                  value={Serchterm}
                  onChange={handleSearch2}
                  autoFocus
                  onKeyDown={(e) => e.stopPropagation()} // Evita la navegación automática
                  sx={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "4px",
                    height: "40px",
                    width: "279px",
                    marginBottom: "15px", marginLeft: "25px",
                    "& .MuiOutlinedInput-root": {
                      padding: "8px 12px",
                      height: "40px",
                      "& fieldset": {
                        borderColor: "#9B9295", // borde normal
                      },
                      "&:hover fieldset": {
                        borderColor: "#7B354D", // al pasar mouse
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#9B9295", // 👈 mismo que el normal
                        borderWidth: "1px",     // 👈 evita que se ponga más grueso
                      },
                    },
                    "& .MuiOutlinedInput-input": {
                      fontSize: "16px",
                      fontFamily: "Poppins, sans-serif",
                      color: Serchterm ? "#7B354D" : "#9B9295",
                      padding: "8px 12px",
                      height: "100%",
                    },
                  }}

                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <img
                          src={seachicon}
                          alt="Buscar"
                          style={{
                            width: "18px",
                            height: "18px",
                            filter: Serchterm
                              ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)"
                              : "none",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: Serchterm ? (
                      <InputAdornment position="end">
                        <img
                          src={iconclose}
                          alt="Limpiar búsqueda"
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSerchterm("")} // Borra el texto al hacer clic
                        />
                      </InputAdornment>
                    ) : null,
                  }}
                />

                <Select
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value as 'todas' | 'encendidas' | 'detenidas')}
                  fullWidth
                  size="small"
                  displayEmpty
                  sx={{
                    marginTop: "10px",
                    width: "279px", marginLeft: "25px",
                    marginBottom: "10px",
                    textAlign: "left",
                    fontFamily: "Poppins, sans-serif",
                    letterSpacing: "0px",
                    color: "#645E60",
                    opacity: 1,
                    fontSize: "12px",
                  }}
                  renderValue={(selected) =>
                    selected && typeof selected === "string" ? selected : (
                      <span style={{ fontStyle: "normal" }}>Seleccionar estatus</span>
                    )
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderColor: "#9B9295",
                        borderBottomLeftRadius: "14px",
                        borderBottomRightRadius: "14px",
                      }
                    }
                  }}
                >
                  <MenuItem sx={{
                    marginTop: "5px",
                    marginBottom: "5px",
                    textAlign: "left",
                    fontFamily: "Poppins",
                    letterSpacing: "0px",
                    color: "#645E60",
                    opacity: 1,
                    fontSize: "12px",
                    "&:hover": {
                      backgroundColor: "#F2EBED"
                    }
                  }} value="todas">Todos</MenuItem>

                  <MenuItem sx={{
                    marginTop: "5px",
                    marginBottom: "5px",
                    textAlign: "left",
                    fontFamily: "Poppins",
                    letterSpacing: "0px",
                    color: "#645E60",
                    opacity: 1,
                    fontSize: "12px",
                    "&:hover": {
                      backgroundColor: "#F2EBED"
                    }
                  }} value="encendidas">Campañas encendidas</MenuItem>

                  <MenuItem sx={{
                    marginTop: "5px",
                    marginBottom: "5px",
                    textAlign: "left",
                    fontFamily: "Poppins",
                    letterSpacing: "0px",
                    color: "#645E60",
                    opacity: 1,
                    fontSize: "12px",
                    "&:hover": {
                      backgroundColor: "#F2EBED"
                    }
                  }} value="detenidas">Campañas detenidas</MenuItem>
                </Select>

                {filteredCampaigns.length > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", marginLeft: "8px", }}>
                    <Checkbox
                      checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      indeterminate={
                        selectedCampaigns.length > 0 &&
                        selectedCampaigns.length < filteredCampaigns.length
                      }
                      onChange={() => {
                        if (selectedCampaigns.length === 0) {
                          setSelectedCampaigns(filteredCampaigns.map((_, index) => index));
                        } else {
                          setSelectedCampaigns([]);
                        }
                      }}
                      icon={
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: "2px solid #8F4D63",
                          }}
                        />
                      }
                      checkedIcon={
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            backgroundColor: "#8F4D63",
                            border: "2px solid #8F4D63",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#FFFFFF",
                              fontSize: "13px",
                              fontWeight: "bold",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            ✓
                          </Box>
                        </Box>
                      }
                      indeterminateIcon={
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            backgroundColor: "#8F4D63",
                            border: "2px solid #8F4D63",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#FFFFFF",
                              fontSize: "20px",
                              fontWeight: "bold",
                              fontFamily: "Poppins, sans-serif",
                              lineHeight: "1",
                            }}
                          >
                            −
                          </Box>
                        </Box>
                      }
                    />


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
                              offset: [0, -7] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                            }
                          }
                        ]
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          const algunaEncendida = selectedCampaigns.some(
                            index => filteredCampaigns[index]?.autoStart
                          );

                          if (algunaEncendida) {
                            setTitleErrorModal("Error al eliminar campaña");
                            setMessageErrorModal("No ha sido posible eliminar una o más campañas debido a que se encuentran encendidas.");
                            setIsErrorModalOpen(true);
                          } else {
                            setOpenDeleteModal(true); // Abre modal de confirmación múltiple
                          }
                        }}
                        sx={{ padding: 0 }}
                      >
                        <Box component="img" src={IconTrash} alt="Eliminar"
                          sx={{ width: "24px", height: "24px", cursor: "pointer" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>

                )}
                <Divider
                  sx={{
                    width: 'calc(100% + 30px)',
                    marginLeft: '-15px',
                    marginBottom: '5px',
                  }}
                />
                <List sx={{ overflowY: "auto", flexGrow: 1 }}>
                  {filteredCampaigns.length === 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
                      <Box component="img" src={boxopen} alt="Caja Vacía" sx={{ width: '250px', height: 'auto' }} />
                      <Typography sx={{ marginTop: '10px', color: '#8F4D63', fontWeight: '500', fontFamily: 'Poppins' }}>
                        No se encontraron resultados.
                      </Typography>
                    </Box>
                  ) : (
                    filteredCampaigns.map((campaign, index) => {
                      const isSelected = selectedCampaigns.includes(index);
                      const progreso = (campaign.numeroActual / campaign.numeroInicial) * 100;

                      return (
                        <ListItem key={index} sx={{
                          background: "#FFFFFF",
                          backgroundColor:
                            selectedCampaign?.id === campaign.id
                              ? "#F2EBEDCC"  // ← mismo color que hover
                              : isSelected
                                ? "rgba(209, 119, 154, 0.15)"
                                : "#FFFFFF",
                          border: "1px solid #AE78884D",
                          opacity: 1,
                          width: "100%",
                          height: "73px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          padding: "10px",
                          display: "flex",
                          flexDirection: "column",
                          transition: "background-color 0.3s",
                          "&:hover": {
                            backgroundColor: "#F2EBEDCC"
                          }
                        }}>

                          <Box sx={{ display: "flex", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
                            <Box sx={{ marginTop: "-5px", display: "flex", alignItems: "center" }}>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {
                                  setSelectedCampaigns(prev =>
                                    isSelected ? prev.filter(i => i !== index) : [...prev, index]
                                  );
                                }}
                                icon={
                                  <Box
                                    sx={{
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "4px",
                                      border: "2px solid #8F4D63",
                                    }}
                                  />
                                }
                                checkedIcon={
                                  <Box
                                    sx={{
                                      width: "20px",
                                      height: "20px",
                                      borderRadius: "4px",
                                      backgroundColor: "#8F4D63",
                                      border: "2px solid #8F4D63",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{
                                        color: "#FFFFFF",
                                        fontSize: "13px",
                                        fontWeight: "bold",
                                        lineHeight: "1",
                                        fontFamily: "Poppins, sans-serif",
                                      }}
                                    >
                                      ✓
                                    </Box>
                                  </Box>
                                }
                                sx={{
                                  color: "#8F4D63",
                                  "&.Mui-checked": { color: "#8F4D63" },
                                  alignSelf: "flex-start",
                                }}
                              />

                              <img src={smsico} alt="SMS"
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  marginRight: "8px",
                                  color: isSelected ? "#8E5065" : "#574B4F",
                                }} />
                              <Typography sx={{
                                fontSize: "12px",
                                fontWeight: "500",
                                fontFamily: "Poppins",
                                color: isSelected ? "#8E5065" : "#574B4F", // 👈 Cambia de color cuando está seleccionado
                                marginBottom: "6px"
                              }}
                              >
                                {campaign.name}
                              </Typography>
                            </Box>
                            <IconButton
                              onClick={(e) => handleMenuClick(e, index)}
                              sx={{
                                position: "absolute",
                                top: "30px",
                                right: "30px",
                                height: "24px",
                                width: "24px",
                                padding: 0
                              }}
                            >
                              <MoreVertIcon sx={{ color: "#6C3A52" }} />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                handleSelectCampaign(campaign);
                              }}
                              sx={{ padding: 0 }}
                            >
                              <PushPinIcon
                                sx={{
                                  color: selectedCampaign?.id === campaign.id ? "#8E5065" : "#574B4F",
                                  fontSize: "20px",
                                  transform: selectedCampaign?.id === campaign.id ? "rotate(45deg)" : "none",
                                  transition: "transform 0.3s ease, color 0.3s ease"
                                }}
                              />
                            </IconButton>
                          </Box>
                          <Box sx={{ width: "65%", backgroundColor: "#E0E0E0", borderRadius: "6px", height: "10px", position: "relative", marginBottom: "10px", marginX: "auto" }}>
                            <Box sx={{
                              width: `${progreso}%`, backgroundColor: "#AE7888", borderRadius: "3px",
                              height: "8px",
                              position: "absolute",
                              marginTop: "-9px",
                            }} />
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", width: "100%", marginTop: "0px", paddingLeft: "45px" }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: "600", marginLeft: "7px", marginTop: "-7px", color: isSelected ? "#8E5065" : "#574B4F" }}>{Math.round(progreso)}%</Typography>
                            <Typography sx={{ fontSize: "12px", marginTop: "-7px", marginLeft: "7px", color: isSelected ? "#8E5065" : "#574B4F", fontFamily: "Poppins" }}>{campaign.numeroActual}/{campaign.numeroInicial}</Typography>
                          </Box>
                        </ListItem>
                      );
                    })
                  )}
                </List>
              </Paper>
            )}
            <IconButton
              onClick={() => setPanelAbierto(!panelAbierto)}
              sx={{
                height: "581px",
                width: "30px",
                borderRadius: "0 8px 8px 0", // redondeado derecho
                borderLeft: "1px solid #D6D6D6", // 👉 esta es la línea gris
                backgroundColor: "#FFFFFF",
                '&:hover': { backgroundColor: "#FFFFFF" },
                paddingX: "10px"
              }}
            >
              <Typography sx={{
                fontSize: "20px",
                transform: panelAbierto ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
              >
                ❮
              </Typography>
            </IconButton>
          </Box>
        </Grid>


        {/* Visualización de campaña */}
        {filteredCampaigns.length > 0 && (
          <Grid item xs >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>            <Typography
              variant="h6"
              sx={{
                textAlign: "left",
                fontFamily: "Poppins",
                letterSpacing: "0px",
                color: "#330F1B",
                opacity: 1,
                fontSize: "18px",
              }}
            >
              Visualización
            </Typography>

              <Tooltip title="Añadir información" arrow placement="top"
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo negro con transparencia
                      color: "#CCC3C3",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      padding: "6px 8px",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)" // Sombra opcional
                    }
                  },
                  arrow: {
                    sx: {
                      color: "rgba(0, 0, 0, 0.8)" // Flecha negra con transparencia
                    }
                  }
                }}
              >
                <IconButton
                  style={{
                    backgroundColor: "#FFFFFF",
                    left: "84%",
                    border: '1px solid #CCCFD2',
                    borderRadius: '8px',
                    color: '#8F4D63',
                    background: '#FFFFFF',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#F2E9EC';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.border = '1px solid #CCCFD2';
                  }}
                  onClick={() => setOpenInfoModal(true)}
                >
                  <img src={welcome} alt="Welcome" style={{ width: '24px', height: '24px' }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box
              sx={{
                height: "540px",
                overflowY: "auto",
                pr: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <Paper sx={{ padding: "10px", marginTop: "10px", borderRadius: "10px", width: "100%", maxWidth: "100%", height: "auto" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img alt="IconSMS" src={IconSMS}
                      style={{ width: 35, height: 20, marginRight: "10px" }}
                    />
                    <Typography
                      variant="subtitle1"
                      sx={{
                        textAlign: "left",
                        fontFamily: "Poppins",
                        letterSpacing: "0px",
                        color: "#574B4F",
                        opacity: 1,
                        fontSize: "18px",
                      }}
                    >
                      {selectedCampaign?.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <IconButton onClick={(e) => {
                      setAnchorEl(e.currentTarget);
                      setMenuIndex(-1);
                    }}>
                      <MoreVertIcon sx={{ color: "#574B4F", fontSize: "20px" }} />
                    </IconButton>

                    <PushPinIcon sx={{ color: "#6C3A52", fontSize: "20px", cursor: "pointer" }} />
                  </Box>
                </Box>

                <Box
                  sx={{
                    border: "1px solid #D6CED2",
                    borderRadius: "10px",
                    opacity: 1,
                    width: "100%", height: "auto",
                    padding: "12px",
                    marginTop: "10px",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontFamily: "Poppins" }}>
                      Progreso: <span style={{ color: "#8F4D63" }}>Completada al {progresoCampaña}%</span>
                    </Typography>
                    {selectedCampaign?.startDate && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <AccessTimeIcon sx={{ fontSize: "16px" }} />
                        <Typography sx={{ fontFamily: "Poppins", opacity: 0.7, fontSize: "14px" }}>{elapsedTime}</Typography>
                      </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <AutorenewIcon sx={{ fontSize: "16px" }} />
                      <Typography>{selectedCampaign?.recycleCount ?? 0}</Typography>
                    </Box>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={progresoCampaña}
                    sx={{
                      marginTop: "8px",
                      height: "12px",
                      borderRadius: "6px",
                      backgroundColor: "#E0E0E0",
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: "#AE7888"
                      }
                    }}
                  />              <Box sx={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <Typography sx={{ fontSize: "12px", fontFamily: "Poppins", opacity: 0.7, textAlign: "center" }}>
                      Registros <br />procesados:<br />
                      <Box component="span" sx={{ fontSize: "24px", fontWeight: "bold", color: "#574B4F" }}>
                        {selectedCampaign?.numeroActual}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontFamily: "Poppins", opacity: 0.7, textAlign: "center" }}>
                      Registros <br />respondidos:<br />
                      <Box component="span" sx={{ fontSize: "24px", fontWeight: "bold", color: "#574B4F" }}>
                        {selectedCampaign?.respondedRecords ?? 0}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontFamily: "Poppins", opacity: 0.7, textAlign: "center" }}>
                      Registros <br />fuera de horario:<br />
                      <Box component="span" sx={{ fontSize: "24px", fontWeight: "bold", color: "#574B4F" }}>
                        {selectedCampaign?.outOfScheduleRecords ?? 0}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontFamily: "Poppins", opacity: 0.7, textAlign: "center" }}>
                      Registros <br />bloqueados:<br />
                      <Box component="span" sx={{ fontSize: "24px", fontWeight: "bold", color: "#574B4F", }}>
                        {selectedCampaign?.blockedRecords ?? 0}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontFamily: "Poppins", opacity: 0.7, textAlign: "center" }}>
                      Total de <br />registros:<br />
                      <Box component="span" sx={{ fontSize: "24px", fontWeight: "bold", color: "#574B4F" }}>
                        {selectedCampaign?.numeroInicial ?? "0"}
                      </Box>
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "right", marginTop: "8px" }}>
                  <MainButton
                    text={selectedCampaign?.autoStart ? 'Detener' : 'Iniciar'}
                    onClick={() => handleStartCampaign(selectedCampaign)}
                  />
                </Box>


              </Paper>

              {/* Paper Horarios */}
              {infoChecks["Horarios"] && (
                <Paper sx={{ padding: "10px", marginTop: "10px", borderRadius: "10px", width: "100%", maxWidth: "100%", height: "auto" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginLeft: "10px" }}>
                      Horarios
                    </Typography>
                    <Tooltip title="Cerrar" arrow placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#000000",
                            color: "#CCC3C3",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
                          }
                        },
                        arrow: {
                          sx: {
                            color: "#000000"
                          }
                        }
                      }}
                      PopperProps={{
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                            }
                          }
                        ]
                      }}
                    >
                      <IconButton onClick={() => setInfoChecks(prev => ({ ...prev, Horarios: false }))}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: "flex", gap: "16px", paddingLeft: "10px", paddingTop: "4px" }}>
                    {[
                      { label: "Vencido", color: "#B0B0B0" },
                      { label: "Vigente", color: "#5CB85C" },
                      { label: "Próximo", color: "#E38C28" }
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Box
                          sx={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            backgroundColor: item.color
                          }}
                        />
                        <Typography sx={{ fontSize: "14px", fontFamily: "Poppins", color: "#574B4F" }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{
                    padding: "10px",
                    marginTop: "10px",
                    borderRadius: "10px",
                    width: "100%",
                    height: "auto",
                    backgroundColor: "#D6D6D64D"
                  }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      {['expired', 'current', 'upcoming'].map((status) => {
                        const colorMap = {
                          expired: '#B4ACAC',
                          current: '#5CB85C',
                          upcoming: '#E38C28'
                        };

                        const horariosFiltrados = selectedCampaign?.schedules.filter(
                          h => getScheduleStatus(h.startDateTime, h.endDateTime) === status
                        ) || [];

                        return (
                          <Box key={status} sx={{ flex: 1, px: 1 }}>
                            {horariosFiltrados.map((horario, index) => {
                              const start = new Date(horario.startDateTime);
                              const end = new Date(horario.endDateTime);
                              const sameDay = start.toDateString() === end.toDateString();

                              const formatted = sameDay
                                ? `${start.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase()}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : `${start.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase()}–${end.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }).toUpperCase()}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                              return (
                                <Typography
                                  key={index}
                                  sx={{
                                    color: colorMap[status as keyof typeof colorMap],
                                    fontFamily: 'Poppins',
                                    fontSize: '12px',
                                    mb: 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {formatted}
                                </Typography>
                              );
                            })}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>

                </Paper>
              )}

              {/*Paper Mensaje*/}
              {infoChecks["Prueba de envío de mensaje"] && (
                <Paper
                  sx={{
                    padding: "10px",
                    marginTop: "10px",
                    borderRadius: "10px",
                    width: "100%",
                    height: "auto"
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginLeft: "10px" }}>
                      Mensaje
                    </Typography>
                    <Tooltip title="Cerrar" arrow placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#000000",
                            color: "#CCC3C3",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
                          }
                        },
                        arrow: {
                          sx: {
                            color: "#000000"
                          }
                        }
                      }}
                      PopperProps={{
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                            }
                          }
                        ]
                      }}
                    >
                      <IconButton onClick={() => setInfoChecks(prev => ({ ...prev, "Prueba de envío de mensaje": false }))}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '14px',
                      color: '#574B4F',
                      backgroundColor: '#F3F1F1',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                    }}

                  >
                    <Typography sx={{ textAlign: "left", fontFamily: "Poppins", fontSize: "14px", color: "#574B4F" }}>
                      {selectedCampaign?.message}
                    </Typography>
                  </Box>

                  <Divider sx={{ marginY: "15px" }} />

                  <Paper
                    sx={{
                      padding: "10px",
                      marginTop: "15px",
                      borderRadius: "10px",
                      width: "100%",
                      height: "auto",
                      boxShadow: "none"
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginBottom: "5px" }}>
                      Prueba de envío
                    </Typography>
                    <Box
                      sx={{
                        padding: "16px",
                        marginTop: "10px",
                        borderRadius: "10px",
                        backgroundColor: "#FFFFFF"
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            sx={{
                              fontFamily: "Poppins",
                              fontSize: "14px",
                              color: "#574B4F",
                              marginBottom: "6px"
                            }}
                          >
                            Teléfono
                          </Typography>
                          <TextField
                            fullWidth
                            value={phone}
                            onChange={(e) => {
                              const onlyNumbers = e.target.value.replace(/\D/g, "");
                              setPhone(onlyNumbers);
                              setError(!validatePhone(onlyNumbers));
                            }}
                            error={error}
                            helperText={error ? "Número inválido" : ""}
                            placeholder="5255"
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              maxLength: 12
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <Tooltip
                                    placement="bottom-start"
                                    arrow
                                    componentsProps={{
                                      tooltip: {
                                        sx: {
                                          backgroundColor: "#FFFFFF",
                                          color: "#574B4F",
                                          fontFamily: "Poppins, sans-serif",
                                          fontSize: "13px",
                                          padding: "8px 12px",
                                          borderRadius: "10px",
                                          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                          maxWidth: 220,
                                          border: "1px solid #9B9295" // 🔥 borde nuevo
                                        }
                                      },
                                      arrow: {
                                        sx: {
                                          color: "#FFFFFF", opacity: 0.0
                                        }
                                      }
                                    }}
                                    PopperProps={{
                                      modifiers: [
                                        {
                                          name: 'offset',
                                          options: {
                                            offset: [-200, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                          }
                                        }
                                      ]
                                    }}
                                    title={
                                      <Box>
                                        <Typography component="div" sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#574B4F" }}>
                                          Solo caracteres numéricos
                                        </Typography>
                                        <Typography component="div" sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#574B4F" }}>
                                          El teléfono debe incluir el número del país
                                        </Typography>
                                      </Box>
                                    }
                                  >
                                    <img
                                      src={error ? infoiconerror : infoicon}
                                      alt="Info"
                                      style={{ width: "24px", height: "24px", cursor: "pointer" }}
                                    />
                                  </Tooltip>
                                </InputAdornment>

                              )
                            }}
                            sx={{
                              backgroundColor: "#FFFFFF",
                              borderRadius: "4px",
                              "& .MuiInputBase-input": {
                                fontFamily: "Poppins, sans-serif"
                              },
                              "& .MuiFormHelperText-root": {
                                fontFamily: "Poppins, sans-serif",
                                backgroundColor: "#FFFFFF",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                margin: 0
                              }
                            }}
                          />
                        </Box>
                        <Box sx={{ marginTop: "38px" }}>
                          <MainButton
                            text="Enviar"
                            onClick={() => console.log("Enviar")}
                            disabled={error}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Paper>
              )}

              {/*Paper Gestión de registros*/}
              {infoChecks["Registros"] && (
                <Paper sx={{ padding: "10px", marginTop: "10px", borderRadius: "10px", width: "100%", height: "auto" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginLeft: "10px" }}>
                      Gestión de registros
                    </Typography>
                    <Tooltip title="Cerrar" arrow placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#000000",
                            color: "#CCC3C3",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
                          }
                        },
                        arrow: {
                          sx: {
                            color: "#000000"
                          }
                        }
                      }}
                      PopperProps={{
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                            }
                          }
                        ]
                      }}
                    >
                      <IconButton onClick={() => setInfoChecks(prev => ({ ...prev, Registros: false }))}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontFamily: "Poppins, sans-serif", padding: "10px 8px", opacity: 0.8 }}>Tipo</TableCell>
                          <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", opacity: 0.8, padding: "10px 8px", }}>Total</TableCell>
                          <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", opacity: 0.8, padding: "10px 8px", }}>Porcentaje</TableCell>
                          <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", opacity: 0.8, padding: "10px 8px", }}>Acción</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          {
                            tipo: "Respondidos",
                            total: selectedCampaign?.respondedRecords ?? 0
                          },
                          {
                            tipo: "Fuera de horario",
                            total: selectedCampaign?.outOfScheduleRecords ?? 0
                          },
                          {
                            tipo: "Bloqueados",
                            total: selectedCampaign?.blockedRecords ?? 0
                          }
                        ].map((row, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ fontSize: "13px", fontFamily: "Poppins, sans-serif", padding: "6px 8px", opacity: 0.5 }}>
                              {row.tipo}
                            </TableCell>
                            <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", padding: "2px 8px", opacity: 0.6 }}>
                              {row.total}
                            </TableCell>
                            <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", padding: "2px 8px", opacity: 0.7 }}>
                              {getPercentage(row.total)}
                            </TableCell>
                            <TableCell align="center" sx={{ fontFamily: "Poppins, sans-serif", padding: "2px 8px", opacity: 0.6 }}>
                              <Tooltip title="Eliminar">
                                <IconButton>
                                  <Box component="img" src={IconTrash} alt="Eliminar" sx={{ width: "25px", height: "25px", cursor: "pointer", opacity: 0.6 }} />
                                </IconButton>
                              </Tooltip>
                              <IconButton>
                                <RestoreIcon sx={{ color: "#9B9295" }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>

                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/*Paper Resultados de envío*/}
              {infoChecks["Resultados de envío por día"] && (
                <Paper sx={{ padding: "10px", marginTop: "25px", borderRadius: "10px", width: "100%", height: "auto" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginLeft: "10px" }}>
                      Resultados de envío
                    </Typography>
                    <Tooltip title="Cerrar" arrow placement="top"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "#000000",
                            color: "#CCC3C3",
                            fontFamily: "Poppins, sans-serif",
                            fontSize: "12px",
                            padding: "6px 8px",
                            borderRadius: "8px",
                            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.7)"
                          }
                        },
                        arrow: {
                          sx: {
                            color: "#000000"
                          }
                        }
                      }}
                      PopperProps={{
                        modifiers: [
                          {
                            name: 'offset',
                            options: {
                              offset: [0, -15] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                            }
                          }
                        ]
                      }}
                    >
                      <IconButton onClick={() => setInfoChecks(prev => ({ ...prev, "Resultados de envío por día": false }))}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", padding: "10px", border: "2px solid #F2F2F2", borderRadius: "10px", marginBottom: "20px", }}>
                    {indicadores.map((indicador, index) => (
                      <Box key={index} sx={{ textAlign: "center" }}>
                        <Tooltip
                          placement="bottom-start"
                          arrow
                          componentsProps={{
                            tooltip: {
                              sx: {
                                backgroundColor: "#FFFFFF",
                                color: "#574B4F",
                                fontFamily: "Poppins, sans-serif",
                                fontSize: "13px",
                                padding: "8px 12px",
                                borderRadius: "10px",
                                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                                maxWidth: 220,
                                border: "1px solid #9B9295"
                              }
                            },
                            arrow: {
                              sx: {
                                color: "#FFFFFF", opacity: 0
                              }
                            }
                          }}
                          PopperProps={{
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [-90, -15]
                                }
                              }
                            ]
                          }}
                          title={
                            <Box>
                              {mensajesIndicadores[index].map((mensaje, i) => (
                                <Typography key={i} component="div" sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#574B4F" }}>
                                  {mensaje}
                                </Typography>
                              ))}
                            </Box>
                          }
                        >
                          <img src={infoicon} width="24px" height="24px" style={{ cursor: "pointer" }} />
                        </Tooltip>

                        <Typography
                          sx={{
                            fontSize: "14px",
                            color: "#9B9295",
                            fontWeight: "500",
                            fontFamily: "Poppins, sans-serif",
                            whiteSpace: "pre-line",
                            lineHeight: "16px"
                          }}
                          dangerouslySetInnerHTML={{
                            __html: indicador.label.replace("Tasa de ", "Tasa de<br/>")
                          }}
                        />
                        <Typography sx={{ fontSize: "22px", color: indicador.color, fontWeight: "500", fontFamily: "Poppins" }}>
                          {indicador.value}
                        </Typography>
                      </Box>

                    ))}
                  </Box>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />

                      <Bar dataKey="value">
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              )}

              {/*Paper Mapa */}
              {infoChecks["Mapa de concentración de mensajes"] && (
                <Paper sx={{ padding: "10px", marginTop: "25px", borderRadius: "10px", width: "100%", height: "auto" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <Typography variant="subtitle1" sx={{ fontFamily: "Poppins", marginLeft: "10px" }}>
                      Mapa de concentración de mensajes
                    </Typography>
                    <Tooltip title="Cerrar" arrow>
                      <IconButton onClick={() => setInfoChecks(prev => ({ ...prev, "Mapa de concentración de mensajes": false }))}>
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <MapChart enviadosData={stateMessageCounts} respondidosData={stateRespondedCounts} />


                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      marginTop: "-5px",
                    }}
                  >
                    <Typography sx={{ fontSize: "14px", color: "#7C7C7C" }}>–</Typography>
                    <Box
                      sx={{
                        width: "200px",
                        height: "12px",
                        borderRadius: "6px",
                        background: "linear-gradient(to right, #E0E0E0, #8F4E63)",
                      }}
                    />
                    <Typography sx={{ fontSize: "14px", color: "#7C7C7C" }}>+</Typography>
                  </Box>
                </Paper>
              )}

            </Box>
          </Grid>
        )}
      </Grid>
      <MainModal
        isOpen={openDeleteModal}
        Title="Eliminar campañas"
        message="Esta seguro de quedesea eliminar las campañas seleccionadas? Esta acción no podrá revertirse."
        primaryButtonText="Eliminar"
        secondaryButtonText="Cancelar"
        onPrimaryClick={() =>
          campaignToDelete
            ? handleDeleteCampaign(campaignToDelete.id)
            : handleDeleteCampaign(selectedCampaigns.map(index => filteredCampaigns[index]?.id))
        }
        onSecondaryClick={() => setOpenDeleteModal(false)}
      />

      <Dialog
        open={openInfoModal}
        onClose={() => setOpenInfoModal(false)}
        PaperProps={{
          sx: {
            width: "585px",
            height: "435px",
            padding: "24px",
            borderRadius: "12px",
            boxSizing: "border-box",
          }
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: "20px",
            color: "#574B4F",
            paddingBottom: 0,
            textTransform: "none",
            pl: "5px",
            marginTop: "-20px",
          }}
        >
          Información visible en la sección campañas
        </DialogTitle>
        {/* Línea divisoria */}
        <Divider
          sx={{
            position: "absolute",
            marginY: "47px",
            left: "0px",
            backgroundColor: "#9F94A5",
            height: "1px",
            width: "100%",
            opacity: 0.3
          }}
        />

        <DialogContent sx={{ paddingTop: "10px" }}>
          <List sx={{ pl: "-20px" }}>
            <ListItem disablePadding sx={{ opacity: 0.5, marginBottom: "4px", marginTop: "15px" }}>
              <Checkbox
                checked
                icon={
                  <Box
                    sx={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      border: "2px solid #8F4D63",
                    }}
                  />
                }
                checkedIcon={
                  <Box
                    sx={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor: "#8F4D63",
                      border: "2px solid #8F4D63",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: "bold",
                        lineHeight: "1",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      ✓
                    </Box>
                  </Box>
                }
                sx={{
                  color: "#8F4D63",
                  "&.Mui-checked": { color: "#8F4D63" },
                  alignSelf: "flex-start",
                }} disabled />
              <ListItemText
                primary="Progreso de la campaña seleccionada"
                primaryTypographyProps={{
                  sx: { fontFamily: "Poppins", color: "#D3CED0", fontSize: "16px" }
                }}
              />
            </ListItem>
            {[
              "Horarios",
              "Prueba de envío de mensaje",
              "Registros",
              "Mapa de concentración de mensajes",
              "Resultados de envío por día"
            ].map((text, i) => (
              <ListItem key={i} disablePadding sx={{ marginBottom: "4px" }}>
                <Checkbox
                  checked={infoChecks[text]}
                  onChange={() =>
                    setInfoChecks((prev) => ({ ...prev, [text]: !prev[text] }))
                  }
                  icon={
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: "2px solid #8F4D63",
                      }}
                    />
                  }
                  checkedIcon={
                    <Box
                      sx={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        backgroundColor: "#8F4D63",
                        border: "2px solid #8F4D63",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          color: "#FFFFFF",
                          fontSize: "13px",
                          fontWeight: "bold",
                          lineHeight: "1",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        ✓
                      </Box>
                    </Box>
                  }
                  sx={{
                    color: "#8F4D63",
                    "&.Mui-checked": { color: "#8F4D63" },
                    alignSelf: "flex-start",
                  }}
                />
                <ListItemText
                  primary={text}
                  primaryTypographyProps={{
                    sx: {
                      fontFamily: "Poppins",
                      color: "#8F4D63",
                      fontWeight: 500,
                      fontSize: "16px",
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        {/* Línea divisoria */}
        <Divider
          sx={{
            position: "absolute",
            marginY: "332px",
            left: "0px",
            backgroundColor: "#9F94A5",
            height: "1px",
            width: "100%",
            opacity: 0.3
          }}
        />


        <DialogActions sx={{
          justifyContent: "space-between", paddingX: "24px", paddingBottom: "8px",
          marginLeft: "-20px",
          marginRight: "-20px",
          marginBottom: "-15px",
        }}>


          <Button
            variant="outlined"
            onClick={() => setOpenInfoModal(false)}
            sx={{
              border: "1px solid #CCCFD2",
              borderRadius: "4px",
              color: "#833A53",
              backgroundColor: "transparent",
              fontVariant: "normal",
              letterSpacing: "1.12px",
              fontWeight: "500",
              fontSize: "14px",
              fontFamily: "Poppins",
              opacity: 1,
              "&:hover": {
                backgroundColor: "#f3e6eb",
                fontSize: "14px",
                fontFamily: "Poppins",
                color: "#833A53",
                letterSpacing: "1.12px",
                opacity: 1,
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenInfoModal(false)}
            sx={{
              background: "#833A53 0% 0% no-repeat padding-box",
              border: "1px solid #D4D1D1",
              borderRadius: "4px",
              opacity: 1,
              fontVariant: "normal",
              fontWeight: "500",
              fontSize: "14px",
              fontFamily: "Poppins",
              letterSpacing: "1.12px",
              color: "#FFFFFF", // Letra blanca
            }}
          >
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/*Modal Creación*/}

      <Dialog
        open={openCreateCampaignModal}
        onClose={() => setOpenCreateCampaignModal(false)}
        maxWidth={false} // Le quitamos el límite de ancho
        fullWidth // Forzamos que se respete el ancho del Paper
        PaperProps={{
          sx: {
            width: "810px",
            height: "668px",
            borderRadius: "12px",
            padding: "32px",
            boxSizing: "border-box",
          }
        }}
      >
        <Box
          sx={{
            height: "120px"
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
              color: "#574B4F",
              paddingBottom: "0px",
              pl: "9px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textTransform: "none",
              marginTop: "-25px",
              marginLeft: "-20px"
            }}
          >
            Crear campaña SMS
            <IconButton onClick={handleCloseModalCampaña}>
              <CloseIcon sx={{
                fontSize: "22px", color: "#574B4F",
                marginLeft: "65px",
                marginTop: "-20px",
                position: "absolute"
              }} />
            </IconButton>
          </DialogTitle>

          {/* Línea divisoria */}
          <Divider
            sx={{
              position: "absolute",
              marginY: "15px",
              left: "0px",
              backgroundColor: "#9F94A5",
              height: "1px",
              width: "100%",
              opacity: 0.3
            }}
          />

          <Divider sx={{ marginTop: "14px", marginBottom: "18px", opacity: 0.3 }} />

          {/*Stepper */}
          <DialogContent sx={{ padding: "0 8px", }}>


            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", width: "100%" }}>
              {["Nombre y horarios", "Registros", "Mensaje", "Configuraciones"].map((label, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;
                const isLast = index === 3;

                return (
                  <React.Fragment key={label}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                      <Box
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `2px solid ${isActive || isCompleted ? "#8F4D63" : "#D6D6D6"}`,
                          backgroundColor: isActive ? "#8F4D63" : isCompleted ? "#8F4D63" : "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isActive && (
                          <Box
                            component="span"
                            sx={{
                              color: "#FFFFFF",
                              fontSize: "14px",
                              fontWeight: "bold",
                              fontFamily: "Poppins",
                            }}
                          >
                            ✓
                          </Box>
                        )}
                        {!isActive && isCompleted && (
                          <CheckIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                        )}
                      </Box>

                      <Typography
                        sx={{
                          marginTop: "6px",
                          fontSize: "12px",
                          fontFamily: "Poppins",
                          color: isActive ? "#8F4D63" : "#9B9295",
                          textAlign: "center",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "80px",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>

                    {!isLast && (
                      <Box
                        sx={{
                          width: "80px",
                          height: "2px",
                          backgroundColor: "#D6D6D6",
                          mx: "20px",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>

          </DialogContent>
        </Box>

        {/* Línea divisoria */}
        <Divider
          sx={{
            position: "absolute",
            marginY: "116px",
            left: "0px",
            backgroundColor: "#9F94A5",
            height: "1px",
            width: "100%",
            opacity: 0.3
          }}
        />
        <Box
          sx={{
            overflowY: 'auto', display: "flex", flexDirection: "column", marginTop: "0px", paddingBottom: 10,
          }}
        >
          {activeStep === -1 && (
            <Box sx={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: 4, maxHeight: "399px", overflowY: "auto" }}>

              {/* Box 1: Ingrese un nombre */}

              <Box
                sx={{
                  width: "340px",
                  height: "88px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "18px",
                    color: "#574B4F",
                  }}
                >
                  Ingrese un nombre
                </Typography>
                <TextField
                  variant="outlined"
                  placeholder="Nombre"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  error={isNameInvalid}
                  helperText={
                    campaignName
                      ? campaignName.length > 40
                        ? "Máximo 40 caracteres"
                        : !/^[a-zA-Z0-9ñÑ ]+$/.test(campaignName)
                          ? "Formato inválido"
                          : ""
                      : ""
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontFamily: 'Poppins, sans-serif',
                    },
                  }}
                  InputProps={{
                    endAdornment:
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
                              color: "#574B4F",
                              whiteSpace: "pre-line",
                              transform: "translate(-1px, -15px)",
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
                              padding: 0
                            }
                          }
                        }}
                      >
                        <InputAdornment position="end">
                          <img
                            src={isNameInvalid ? infoiconerror : infoicon}
                            alt="info-icon"
                            style={{ width: 24, height: 24 }}
                          />
                        </InputAdornment>
                      </Tooltip>


                  }}
                  sx={{
                    width: "340px",
                    height: "54px",
                    fontFamily: "Poppins",
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      height: "54px",
                      boxSizing: "border-box",
                    }
                  }}
                />
              </Box>

              {/* Box 2: Horarios */}
              {/* Renderiza todos los horarios */}
              {horarios.map((horario, index) => (
                <React.Fragment key={index}>
                  {/*Modo de operación*/}
                  {index !== 0 && mostrarModoOperacion && (
                    <Box sx={{ mt: -2, mb: -2, ml: 2 }}>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontWeight: 500,
                          fontSize: "18px",
                          color: "#330F1B",
                          marginBottom: "8px",
                        }}
                      >
                        Modo de operación
                      </Typography>

                      <FormControl>
                        <RadioGroup row>
                          <FormControlLabel
                            control={
                              <Radio
                                value="reanudar"
                                sx={{
                                  color: "#574B4F",
                                  '&.Mui-checked': { color: "#8F4D63" }
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ fontFamily: "Poppins", fontSize: "16px", color: "#574B4F" }}>
                                Reanudar
                              </Typography>
                            }
                          />

                          <FormControlLabel
                            control={
                              <Radio
                                value="reciclar"
                                sx={{
                                  color: "#574B4F",
                                  '&.Mui-checked': { color: "#8F4D63" }
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ fontFamily: "Poppins", fontSize: "16px", color: "#574B4F" }}>
                                Reciclar
                              </Typography>
                            }
                          />


                        </RadioGroup>
                      </FormControl>
                    </Box>
                  )}

                  <Box
                    key={index}
                    sx={{
                      width: "672px",
                      backgroundColor: "#F2EBEDCC",
                      borderRadius: "8px",
                      padding: "16px",
                      marginTop: "-5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#574B4F",
                        }}
                      >
                        {horario.titulo}
                      </Typography>
                    </Box>
                    {/*Horarios textfields */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        key={`start-${index}`}
                        variant="outlined"
                        placeholder="Inicia"
                        value={
                          horario.start
                            ? horario.start.toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : ''
                        }
                        sx={{
                          width: "262px", height: "56px", backgroundColor: "#FFFFFF", '& .MuiInputBase-input': {
                            fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F"
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={(e) => {
                                  setCalendarAnchor(e.currentTarget);
                                  setCalendarOpen(true);
                                  setCalendarTarget("start");
                                  setCurrentHorarioIndex(index);
                                }}
                                size="small"
                                sx={{ padding: 0 }}
                              >
                                <CalendarTodayIcon sx={{ width: "15px", height: "15px", color: "#8F4D63" }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        key={`end-${index}`}
                        variant="outlined"
                        placeholder="Termina"
                        value={
                          horario.end
                            ? horario.end.toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : ''
                        }
                        sx={{
                          width: "262px", height: "56px", backgroundColor: "#FFFFFF", '& .MuiInputBase-input': {
                            fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F"
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={(e) => {
                                  setCalendarAnchor(e.currentTarget);
                                  setCalendarOpen(true);
                                  setCalendarTarget("end");
                                  setCurrentHorarioIndex(index);
                                }}
                                size="small"
                                sx={{ padding: 0 }}
                              >
                                <CalendarTodayIcon sx={{ width: "15px", height: "15px", color: "#8F4D63" }} />
                              </IconButton>

                            </InputAdornment>
                          )
                        }}
                      />
                      {/* Botones a la derecha */}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0 }}>
                        {/* Eliminar */}
                        {index > 0 && (
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
                                    offset: [-0, -10] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                  }
                                }
                              ]
                            }}
                          >
                            <IconButton onClick={() => handleEliminarHorario(index)}>
                              <Box
                                component="img"
                                src={IconTrash}
                                alt="Eliminar"
                                sx={{ width: 24, height: 24, cursor: "pointer", opacity: 0.6, }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                        {/* Agregar solo en el último horario */}
                        {index === horarios.length - 1 && horarios.length < 5 && (
                          <Tooltip title="Añadir horario" arrow placement="top"
                            componentsProps={{
                              tooltip: {
                                sx: {
                                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                                  color: "#CCC3C3",
                                  fontFamily: "Poppins, sans-serif",
                                  fontSize: "12px",
                                  padding: "6px 8px",
                                  borderRadius: "8px",
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
                                    offset: [0, -12]
                                  }
                                }
                              ]
                            }}
                          >
                            <IconButton onClick={handleAgregarHorario} disabled={horarios.length >= 5}>
                              <Box
                                component="img"
                                src={IconCirclePlus}
                                alt="Agregar Horario"
                                sx={{ width: "24px", height: "24px", cursor: "pointer", }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Checkbox Iniciar campaña automáticamente */}
                  {index === 0 && (
                    <Box
                      sx={{
                        width: "250px",
                        height: "80px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        mt: horarios.length <= 1 ? -4.5 : -1,
                        marginBotttom: -1,
                        ml: 2
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => setIsChecked(e.target.checked)}
                          icon={
                            <Box
                              sx={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                border: "2px solid #574B4FCC",
                              }}
                            />
                          }
                          checkedIcon={
                            <Box
                              sx={{
                                width: '24px',
                                height: '24px',
                                position: 'relative',
                                marginTop: '0px',
                                marginLeft: '-2px',
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
                            color: "#8F4D63",
                            "&.Mui-checked": { color: "#8F4D63" },
                            alignSelf: "flex-start",
                            padding: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            color: isChecked ? '#8F4D63' : '#574B4FCC',
                            whiteSpace: "nowrap",
                          }}
                        >
                          Iniciar campaña automáticamente
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </React.Fragment>
              ))}

            </Box>
          )}

          {activeStep === 0 && (
            <Box sx={{ marginTop: "30px", display: "flex", flexDirection: "column", gap: 2, maxHeight: "420px", overflowY: "auto" }}>
              {!fileSuccess && (
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', mt: "-7px", textAlign: 'center' }}>
                  Cargue un archivo desde su biblioteca.
                </Typography>

              )}

              {!postCargaActiva && uploadedFile && (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 27, marginBottom: "-10px", mt: 1
                }}
                >
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', textAlign: 'left' }}>
                    Archivo cargado
                  </Typography>
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', textAlign: 'right' }}>
                    Seleccionar datos
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 4,
                  width: '100%',
                  marginTop: '16px', overflowY: "hidden"
                }}
              >

                {/* DropZon´t (Cargue un archivo desde su biblioteca.*/}
                {!fileSuccess && (
                  <Box sx={{ width: "320px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box
                      marginBottom={'20px'} marginTop={'10px'}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          handleManageFile(file);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        justifyContent: fileSuccess ? 'flex-start' : 'center',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          width: '200px',
                          height: '200px',
                          minWidth: '200px',
                          minHeight: '200px',
                          maxWidth: '200px',
                          maxHeight: '200px',
                          border: fileError
                            ? '2px solid #EF5466'
                            : fileSuccess
                              ? '2px solid #8F4E63CC'
                              : '2px dashed #D9B4C3',
                          backgroundColor: fileError
                            ? '#FFF4F5'
                            : fileSuccess
                              ? '#E5CBD333'
                              : 'transparent',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          fontFamily: 'Poppins',
                          fontSize: '13px',
                          color: '#330F1B',
                          cursor: 'pointer',
                          px: 1,
                          marginLeft: fileSuccess ? '80px' : '380px',
                        }}
                      >
                        {/*Tooltip */}
                        <Box
                          sx={{
                            position: 'absolute',
                            marginTop: "-140px",
                            marginRight: '-140px',
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
                              ) : (
                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                  · El archivo debe ser Excel (.xls/.xlsx)<br />
                                  · La primera columna debe contener<br />
                                  el ID de cada registro<br />
                                  · Los teléfonos y datos adicionales<br />
                                  pueden presentarse en cualquier<br />
                                  orden<br />
                                  · Las columnas deben contar con el<br />
                                  formato de texto o dato general
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
                                    offset: [104, -260] //  [horizontal, vertical]
                                  }
                                }
                              ]
                            }}
                          >
                            <img
                              src={fileError ? infoiconerror : infoicon}
                              alt="estado"
                              style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                            />
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
                                onClick={handleRemoveUploadedFile}
                                sx={{
                                  position: 'absolute',
                                  mt: 8,
                                  marginLeft: "30px",
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

                        <input
                          type="file"
                          hidden
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              handleManageFile(file);
                            }
                          }}
                        />

                        <Box sx={{ width: '142px', height: '100px' }}>
                          <img
                            src={
                              fileError
                                ? IconCloudError
                                : fileSuccess
                                  ? CloudCheckedIcon
                                  : UpCloudIcon
                            }
                            alt="estado archivo"
                            style={{ marginBottom: '8px', width: "72px", height: "48px" }}
                          />

                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontFamily: 'Poppins',
                              color: '#330F1B',
                              fontSize: '14px',
                              opacity: !fileError && !fileSuccess ? 0.6 : 1,
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
                              fontSize: '12px',
                              color: '#574B4F',
                              opacity: 0.7,
                              textAlign: 'center',
                              wordBreak: 'break-word',
                              maxWidth: '142px',
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
                                fontSize: '12px',
                                color: '#574B4F',
                                opacity: 0.7,
                                textAlign: 'center',
                                mt: '4px'
                              }}
                            >
                              Total de registros: {excelData.length}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>


                    {!fileSuccess && (
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          mt: -1, ml: '380px'
                        }}
                      >
                        <Button
                          disableRipple
                          sx={{
                            backgroundColor: 'transparent',
                            textTransform: 'none',
                            padding: 0,
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          <a
                            href="/RedQuantum/Files/ArchivoEjemplo.xlsx"
                            download
                            style={{ textDecoration: 'none' }}
                          >
                            <Typography
                              sx={{
                                textDecoration: 'underline',
                                fontFamily: 'Poppins',
                                fontSize: '11px',
                                color: '#8F4D63',
                                cursor: 'pointer',
                              }}
                            >
                              Descargar archivo de muestra
                            </Typography>
                          </a>

                        </Button>
                      </Box>
                    )}


                    {uploadedFile && !postCargaActiva && (
                      <FormControl fullWidth sx={{ marginTop: "24px" }}>
                        <Select
                          value={selectedSheet}
                          onChange={handleSheetChange}
                          displayEmpty
                          renderValue={(selected) =>
                            selected ? (
                              <span style={{ color: '#786E71', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                {selected}
                              </span>
                            ) : (
                              <span style={{ color: '#786E71', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                Seleccionar hoja
                              </span>
                            )
                          }
                          sx={{
                            marginLeft: '80px',
                            marginTop: '-5px',
                            color: '#786E71',
                            width: '200px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            mb: 0
                          }}
                        >
                          {sheetNames.map((name, idx) => (
                            <MenuItem
                              key={idx}
                              value={name}
                              sx={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#9B9295',
                                '&:hover': {
                                  backgroundColor: '#F2EBED', // color solo al pasar el mouse
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'transparent', //  quita el fondo cuando está seleccionado
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: '#F2EBED', //  mantiene el hover cuando está seleccionado
                                },
                              }}
                            >
                              {name}
                            </MenuItem>
                          ))}
                        </Select>

                      </FormControl>


                    )}
                  </Box>
                )}
                {/* DropZon´t para pagina siguiente (Archivo cargado / Seleccionar datos)*/}
                {!postCargaActiva && uploadedFile && (
                  <Box sx={{ width: "320px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Box
                      marginBottom={'20px'} marginTop={'10px'}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          setUploadedFile(file);
                          handleManageFile(file);
                        }
                      }}
                      sx={{
                        display: 'flex',
                        justifyContent: fileSuccess ? 'flex-start' : 'center', // 👈 aquí está la magia
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Box
                        sx={{
                          width: '200px',
                          height: '200px',
                          minWidth: '200px',
                          minHeight: '200px',
                          maxWidth: '200px',
                          maxHeight: '200px',
                          border: fileError
                            ? '2px solid #EF5466'
                            : fileSuccess
                              ? '2px solid #8F4E63CC'
                              : '2px dashed #D9B4C3',
                          backgroundColor: fileError
                            ? '#FFF4F5'
                            : fileSuccess
                              ? '#E5CBD333'
                              : 'transparent',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          fontFamily: 'Poppins',
                          fontSize: '13px',
                          color: '#330F1B',
                          cursor: 'pointer',
                          px: 1,
                          marginLeft: fileSuccess ? '80px' : '380px',
                        }}
                      >
                        {/*Tooltip */}
                        <Box
                          sx={{
                            position: 'absolute',
                            marginTop: "-140px",
                            marginRight: '-140px',
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
                              ) : (
                                <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                  · El archivo debe ser Excel (.xls/.xlsx)<br />
                                  · La primera columna debe contener<br />
                                  el ID de cada registro<br />
                                  · Los teléfonos y datos adicionales<br />
                                  pueden presentarse en cualquier<br />
                                  orden<br />
                                  · Las columnas deben contar con el<br />
                                  formato de texto o dato general
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
                                    offset: [104, -260] //  [horizontal, vertical]
                                  }
                                }
                              ]
                            }}
                          >
                            <img
                              src={fileError ? infoiconerror : infoicon}
                              alt="estado"
                              style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                            />
                          </Tooltip>
                          {!postCargaActiva && uploadedFile && (
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
                                      offset: [0, -8]
                                    }
                                  }
                                ]
                              }}
                            >
                              <IconButton
                                onClick={
                                  handleRemoveUploadedFile
                                }
                                sx={{
                                  position: 'absolute',
                                  mt: 8,
                                  marginLeft: "30px",
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

                        <input
                          type="file"
                          hidden
                          ref={fileInputRef}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              handleManageFile(file);
                            }
                          }}
                        />

                        <Box sx={{ width: '142px', height: '100px' }}>
                          <img
                            src={
                              fileError
                                ? IconCloudError
                                : fileSuccess
                                  ? CloudCheckedIcon
                                  : UpCloudIcon
                            }
                            alt="estado archivo"
                            style={{ marginBottom: '8px', width: "72px", height: "48px" }}
                          />

                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontFamily: 'Poppins',
                              color: '#330F1B',
                              fontSize: '14px',
                              opacity: !fileError && !fileSuccess ? 0.6 : 1,
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
                              fontSize: '12px',
                              color: '#574B4F',
                              opacity: 0.7,
                              textAlign: 'center',
                              wordBreak: 'break-word',
                              maxWidth: '142px',
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
                                fontSize: '12px',
                                color: '#574B4F',
                                opacity: 0.7,
                                textAlign: 'center',
                                mt: '4px'
                              }}
                            >
                              Total de registros: {excelData.length}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>


                    {/*Descargar archivo de muestra*/}
                    {!fileSuccess && (
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          mt: -1, ml: '380px'
                        }}
                      >
                        <Button
                          disableRipple
                          sx={{
                            backgroundColor: 'transparent',
                            textTransform: 'none',
                            padding: 0,
                            minWidth: 'auto',
                            '&:hover': {
                              backgroundColor: 'transparent'
                            }
                          }}
                        >
                          <Typography
                            sx={{
                              textDecoration: "underline",
                              fontFamily: 'Poppins',
                              fontSize: '11px',
                              color: "#8F4D63",
                            }}
                          >
                            Descargar archivo de muestra
                          </Typography>
                        </Button>
                      </Box>
                    )}


                    {uploadedFile && !postCargaActiva && (
                      <FormControl fullWidth sx={{ marginTop: "24px" }}>
                        <Select
                          value={selectedSheet}
                          onChange={handleSheetChange}
                          displayEmpty
                          renderValue={(selected) =>
                            selected ? (
                              <span style={{ color: '#786E71', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                {selected}
                              </span>
                            ) : (
                              <span style={{ color: '#786E71', fontFamily: 'Poppins, sans-serif', fontSize: '12px' }}>
                                Seleccionar hoja
                              </span>
                            )
                          }
                          sx={{
                            marginLeft: '80px',
                            marginTop: '-5px',
                            color: '#786E71',
                            width: '200px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#FFFFFF',
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            mb: 0
                          }}
                        >
                          {sheetNames.map((name, idx) => (
                            <MenuItem
                              key={idx}
                              value={name}
                              sx={{
                                fontFamily: 'Poppins, sans-serif',
                                fontSize: '12px',
                                color: '#9B9295',
                                '&:hover': {
                                  backgroundColor: '#F2EBED', // color solo al pasar el mouse
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'transparent', //  quita el fondo cuando está seleccionado
                                },
                                '&.Mui-selected:hover': {
                                  backgroundColor: '#F2EBED', //  mantiene el hover cuando está seleccionado
                                },
                              }}
                            >
                              {name}
                            </MenuItem>
                          ))}
                        </Select>

                      </FormControl>


                    )}
                  </Box>
                )}

                {/*Caja visual para archivos subidos en (Archivo cargado / Seleccionar datos)*/}
                {!postCargaActiva && uploadedFile && (
                  <Box
                    sx={{
                      position: "absolute", width: "312px", height: "305px", borderRadius: '15px', marginBottom: "-10px",
                      border: "1px solid #E6E4E4", marginLeft: "25px", marginTop: "-5px", pointerEvents: "none",
                    }}
                  >
                    <Divider sx={{
                      width: 'calc(100% + 0px)', marginTop: '240px',
                    }} />
                  </Box>
                )}
                {/*Teléfonos y Variables en (Archivo cargado / Seleccionar datos)*/}
                {!postCargaActiva && uploadedFile && (
                  <Box sx={{
                    width: 380, border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px',
                    marginTop: '-0px', fontFamily: 'Poppins',
                  }}>
                    <Tabs
                      value={selectedTab}
                      onChange={(_, newValue) => setSelectedTab(newValue)}
                      indicatorColor="secondary"
                      textColor="inherit"
                      sx={{
                        borderBottom: '1px solid #D9B4C3',
                        marginTop: '-20px',
                        marginBottom: '14px',
                        '.MuiTabs-flexContainer': {
                          width: '100%',
                        },
                        '.MuiTab-root': {
                          fontFamily: 'Poppins',
                          fontWeight: 600,
                          fontSize: '14px', letterSpacing: '0.96px',
                          textTransform: 'none',
                          color: '#7B354D',
                          paddingBottom: '6px',
                          flex: 1, // <-- esto reparte mitad y mitad
                          justifyContent: 'center',
                          marginBottom: '10px',
                          '&:hover': {
                            backgroundColor: 'transparent',
                          },
                        },
                        '.Mui-selected': {
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      <Tab label="Teléfonos" value="telefonos" />
                      <Tab label="Variables" value="variables" />
                    </Tabs>



                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="columns-droppable">
                        {(provided) => (
                          <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ maxHeight: '192px', overflowY: 'auto' }}>
                            {currentSelected.map((col, index) => {
                              const isDisabled = selectedTab === 'telefonos' ? selectedVariables.includes(col) : selectedTelefonos.includes(col);
                              const toggleValue = () => {
                                const updater = selectedTab === 'telefonos' ? setSelectedTelefonos : setSelectedVariables;
                                updater(currentSelected.filter(c => c !== col));
                              };
                              return (
                                <Draggable key={col} draggableId={col} index={index}>
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        border: '1px solid #A46F80', borderRadius: '4px', padding: '6px 12px',
                                        marginBottom: '10px', backgroundColor: '#F2EBED', width: '192px', height: "40px", cursor: 'grab'
                                      }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Checkbox checked onChange={toggleValue} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                        <Typography sx={{
                                          fontFamily: 'Poppins', fontSize: '16px', color: "#8F4D63"

                                        }}>{col}</Typography>
                                      </Box>
                                      <DragIndicatorIcon sx={{ fontSize: '18px', color: '#576771', cursor: 'grab', width: '24px', height: "24px" }} />
                                    </Box>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}

                            {columnsToRender
                              .filter(col => !currentSelected.includes(col))
                              .map((col) => {
                                const isDisabled = selectedTab === 'telefonos'
                                  ? selectedVariables.includes(col)
                                  : selectedTelefonos.includes(col);

                                const toggleValue = () => {
                                  const updater = selectedTab === 'telefonos' ? setSelectedTelefonos : setSelectedVariables;
                                  updater([...currentSelected, col]);
                                };

                                return (
                                  <Box
                                    key={col}
                                    sx={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                      border: '1px solid #786F72', borderRadius: '4px', padding: '6px 12px',
                                      marginBottom: '10px', backgroundColor: '#FFF', width: '192px',
                                      opacity: isDisabled ? 0.6 : 1, height: "40px",
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                                      <Checkbox checked={false} onChange={toggleValue} disabled={isDisabled} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F", opacity: 0.9 }}>{col}</Typography>
                                    </Box>
                                    <DragIndicatorIcon sx={{ fontSize: '18px', color: '#576771', width: '24px', height: "24px", fontFamily: "Poppins", opacity: 0.8 }} />
                                  </Box>
                                );
                              })}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Box>
                )}

                {/*Box con Estados y Registros (Detalle de carga)*/}
                {postCargaActiva && estadisticasCarga && (
                  <Box sx={{
                    position: "relative", width: "1000px",
                    minHeight: "500px", // altura fija
                    backgroundColor: "#FFFFFF",
                    overflowY: "auto"
                  }}>
                    <Typography sx={{
                      marginLeft: "30px", mt: -0, mb: "16px",
                      fontFamily: 'Poppins', color: '#330F1B', fontWeight: 600, fontSize: '18px',
                    }}>
                      Detalles de Carga
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap', border: "1px solid #E6E4E4", marginLeft: "20px",
                        width: '658px', height: '600px', gap: "2px", borderRadius: "12px",
                      }}
                    >
                      <Box sx={{
                        width: "200px", height: "200px", display: "flex", flexDirection: "column",
                        alignItems: "center", marginLeft: "-51px", marginTop: "16px"
                      }}>
                        <Box
                          marginBottom={'0px'} marginTop={'0px'} marginRight={"20px"}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              setUploadedFile(file);
                              handleManageFile(file);
                            }
                          }}
                          sx={{
                            justifyContent: fileSuccess ? 'flex-start' : 'center', // 👈 aquí está la magia

                            width: '200px',
                          }}
                        >
                          <Box
                            sx={{
                              width: '200px',
                              height: '200px',
                              minWidth: '200px',    // ← fuerza el tamaño mínimo
                              minHeight: '200px',   // ← fuerza el tamaño mínimo
                              maxWidth: '200px',    // ← evita que crezca más
                              maxHeight: '200px',   // ← evita que crezca más
                              border: fileError
                                ? '2px solid #EF5466'
                                : fileSuccess
                                  ? '2px solid #8F4E63CC'
                                  : '2px dashed #D9B4C3',
                              backgroundColor: fileError
                                ? '#FFF4F5'
                                : fileSuccess
                                  ? '#E5CBD333'
                                  : 'transparent',
                              borderRadius: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              textAlign: 'center',
                              fontFamily: 'Poppins',
                              fontSize: '13px',
                              color: '#330F1B',
                              cursor: 'pointer',
                              px: 1,
                              marginLeft: fileSuccess ? '80px' : '380px',
                            }}
                          >
                            {/*Tooltip */}
                            <Box
                              sx={{
                                marginTop: "-42px",
                                marginRight: '-140px',
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
                                  ) : (
                                    <Box sx={{ fontFamily: 'Poppins', fontSize: '14px', color: '#000000', opacity: 0.7 }}>
                                      · El archivo debe ser Excel (.xls/.xlsx)<br />
                                      · La primera columna debe contener<br />
                                      el ID de cada registro<br />
                                      · Los teléfonos y datos adicionales<br />
                                      pueden presentarse en cualquier<br />
                                      orden<br />
                                      · Las columnas deben contar con el<br />
                                      formato de texto o dato general
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
                                        offset: [104, -260] //  [horizontal, vertical]
                                      }
                                    }
                                  ]
                                }}
                              >
                                <img
                                  src={fileError ? infoiconerror : infoicon}
                                  alt="estado"
                                  style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                                />
                              </Tooltip>
                              {!postCargaActiva && uploadedFile && (
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
                                      setUploadedFile(null);
                                      setFileSuccess(false);
                                      setFileError(false);
                                      setBase64File('');
                                      setUploadedFileBase64('');
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                      }
                                    }}
                                    sx={{
                                      mt: 8,
                                      marginLeft: "0px",
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

                            <input
                              type="file"
                              hidden
                              ref={fileInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setUploadedFile(file);
                                  handleManageFile(file);
                                }
                              }}
                            />

                            <Box sx={{ width: '142px', height: '100px' }}>
                              <img
                                src={
                                  fileError
                                    ? IconCloudError
                                    : fileSuccess
                                      ? CloudCheckedIcon
                                      : UpCloudIcon
                                }
                                alt="estado archivo"
                                style={{ marginBottom: '8px', width: "72px", height: "48px" }}
                              />

                              <Typography
                                sx={{
                                  fontWeight: 600,
                                  fontFamily: 'Poppins',
                                  color: '#330F1B',
                                  fontSize: '14px',
                                  opacity: !fileError && !fileSuccess ? 0.6 : 1,
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
                                  fontSize: '12px',
                                  color: '#574B4F',
                                  opacity: 0.7,
                                  textAlign: 'center',
                                  wordBreak: 'break-word',
                                  maxWidth: '142px',
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
                                    fontSize: '12px',
                                    color: '#574B4F',
                                    opacity: 0.7,
                                    textAlign: 'center',
                                    mt: '4px'
                                  }}
                                >
                                  Total de registros: {excelData.length}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap', height: "220px",
                          width: '416px', marginTop: "16px", marginLeft: "86px"
                        }}
                      >
                        {/* Box 1 de textos - Estados 1*/}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "100px",
                            height: "74px", mr: 1
                          }}
                        >
                          <Typography sx={{
                            fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Estado
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Cargados
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >No cargados
                          </Typography>
                        </Box>

                        {/* Box 2 de textos - Registros */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "100px",
                            height: "74px", mr: 1
                          }}
                        >
                          <Typography sx={{
                            fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Registros
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          > {estadisticasCarga.registrosCargados}
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          > {estadisticasCarga.registrosFallidos}
                          </Typography>
                        </Box>

                        {/* Box 3 de textos - Porcentajes */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "142px", height: "74px"
                          }}
                        >

                          <Typography sx={{
                            fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Porcentaje
                          </Typography>


                          <Box sx={{ display: 'flex', alignItems: 'center', mb: "6px" }}>
                            <LinearProgress
                              variant="determinate"
                              value={porcentajeRegistrosCargados}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: "#E2E2E2",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#8F4D63",
                                },
                              }}
                            />
                            <Typography sx={{
                              minWidth: '40px', textAlign: 'right', color: "#574B4F", fontSize: "12px", fontFamily: 'Poppins, sans-serif',
                            }}>
                              {porcentajeRegistrosCargados}%
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', mb: "6px" }}>
                            <LinearProgress
                              variant="determinate"
                              value={100 - porcentajeTelefonosCargados}
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: "#E2E2E2",
                                "& .MuiLinearProgress-bar": {
                                  backgroundColor: "#8F4D63",
                                },
                              }}
                            />
                            <Typography sx={{
                              minWidth: '40px', textAlign: 'right', color: "#574B4F",
                              fontFamily: "Poppins", fontSize: '12px'
                            }}>
                              {100 - porcentajeTelefonosCargados}%
                            </Typography>
                          </Box>
                        </Box>

                        {/* Box 4 de textos - Estados 2*/}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "100px",
                            height: "74px", mt: -0, mr: 0
                          }}
                        >
                          <Typography sx={{
                            fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Estado
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Cargados
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >No cargados
                          </Typography>
                        </Box>

                        {/* Box 5 de textos - Teléfonos */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "100px",
                            height: "74px", mt: -0
                          }}
                        >
                          <Typography sx={{
                            fontWeight: 600, fontSize: '14px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          >Teléfonos
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          > {estadisticasCarga.telefonosCargados}
                          </Typography>

                          <Typography sx={{
                            fontWeight: 500, fontSize: '12px', fontFamily: 'Poppins, sans-serif',
                            marginBottom: '6px', color: '#574B4F'
                          }}
                          > {estadisticasCarga.telefonosFallidos}
                          </Typography>
                        </Box>

                      </Box>
                      <Divider
                        sx={{
                          position: "absolute",
                          width: 'calc(80% + 60px)', // compensa 15px de padding a cada lado
                          marginTop: '230px',
                        }}
                      />
                      <Box sx={{
                        width: "658px", height: "30px", marginTop: "-116px"
                      }}>
                        <Typography sx={{
                          fontFamily: "Poppins", fontSize: "16px", fontWeight: 600,
                          color: "#330F1B", ml: 2
                        }}>
                          Datos seleccionados</Typography>
                      </Box>

                      <Box sx={{
                        display: 'flex', flexDirection: 'row',
                        gap: 0, marginTop: "-205px", ml: "-1px"
                      }}>
                        {/*Teléfonos*/}
                        <Box
                          sx={{
                            flex: 1,
                            border: '1px solid #E6E4E4',
                            padding: '12px',
                            maxHeight: '200px', width: "329px",
                            overflowY: 'auto',
                          }}
                        >
                          <Typography sx={{
                            fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px',
                            color: '#330F1B', mb: 1
                          }}>
                            Teléfonos
                          </Typography>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedTelefonos.map((variable, i) => (
                              <Button
                                key={i}
                                sx={{
                                  justifyContent: 'space-between',
                                  border: '1px solid #A46F80',
                                  width: '192px', height: "40px",
                                  color: '#8F4D63',
                                  fontFamily: 'Poppins',
                                  textTransform: 'none',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  padding: '6px 12px',
                                  '&:hover': {
                                    backgroundColor: '#F2EBED',
                                    borderColor: '#8F4D63',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, ml: -1 }}>
                                  <Checkbox checked={true} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                  <Typography
                                    sx={{
                                      fontFamily: 'Poppins',
                                      color: '#8F4D63',
                                      fontSize: '16px',
                                    }}
                                  >
                                    {variable}
                                  </Typography>
                                </Box>
                              </Button>
                            ))}
                          </Box>
                        </Box>

                        {/*Variables*/}
                        <Box
                          sx={{
                            flex: 1,
                            border: '1px solid #E6E4E4',
                            padding: '12px',
                            maxHeight: '200px', width: "329px",
                            overflowY: 'auto',
                          }}
                        >
                          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '14px', color: '#330F1B', mb: 1 }}>
                            Variables
                          </Typography>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {selectedVariables.map((variable, i) => (
                              <Button
                                key={i}
                                sx={{
                                  justifyContent: 'space-between',
                                  border: '1px solid #A46F80',
                                  width: '192px', height: "40px",
                                  color: '#8F4D63',
                                  fontFamily: 'Poppins',
                                  textTransform: 'none',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  padding: '6px 12px',
                                  '&:hover': {
                                    backgroundColor: '#F2EBED',
                                    borderColor: '#8F4D63',
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, ml: -1 }}>
                                  <Checkbox checked={true} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                  <Typography
                                    sx={{
                                      fontFamily: 'Poppins',
                                      color: '#8F4D63',
                                      fontSize: '16px',
                                    }}
                                  >
                                    {variable}
                                  </Typography>
                                </Box>
                              </Button>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {activeStep === 1 && (
            <>
              {!mensajeAceptado ? (
                // 🔴 SELECCIÓN DE TIPO DE MENSAJE
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, }}>

                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', textAlign: "center", mt: 3 }}>
                    Seleccionar el tipo de mensaje.
                  </Typography>

                  <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", gap: 5 }}>

                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", }}>
                      <Box sx={{ border: "2px solid #9B929599", borderRadius: "8px", width: "160px", height: "160px" }}
                      >
                        <FormControlLabel
                          value="escrito"
                          control={
                            <Radio
                              checked={tipoMensaje === "escrito"}
                              onChange={() => setTipoMensaje("escrito")}
                              sx={{
                                color: "#574B4F",
                                '&.Mui-checked': {
                                  color: "#574B4F",
                                },
                              }}
                            />
                          }
                          label={
                            <Box sx={{
                              textAlign: "center", p: 2, mb: 6,
                              borderColor: tipoMensaje === "escrito" ? "#8F4D63" : "#ccc",
                              borderRadius: "12px", width: 120
                            }}>
                              <Typography variant="h6" sx={{
                                color: "#8F4D63", marginLeft: "-180px",
                                fontWeight: 600, fontSize: "30px"
                              }}>
                                Abc|
                              </Typography>
                            </Box>
                          }
                          labelPlacement="bottom"
                          sx={{
                            marginLeft: "110px",
                            alignItems: 'flex-start',      //  opcional, ajusta alineación vertical si lo necesitas
                          }}
                        />

                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, color: "#574B4F", mt: 2, textAlign: "center" }}>
                          Escrito + variables
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", }}>
                      <Box sx={{ border: "2px solid #9B929599", borderRadius: "8px", width: "160px", height: "160px" }}>
                        <FormControlLabel
                          value="plantilla"
                          control={<Radio checked={tipoMensaje === "plantilla"} onChange={() => setTipoMensaje("plantilla")} />}
                          label={
                            <Box sx={{
                              textAlign: "center", p: 2, border: "3px solid",
                              borderColor: tipoMensaje === "plantilla" ? "#8F4D63" : "#8F4D63",
                              borderRadius: "6px", width: "123px", height: "37px", mt: 2, mb: 8
                            }}>
                              <Box sx={{ marginLeft: "70px", marginTop: "-12px", }}>
                                <img
                                  src={IconArrowDown1}
                                  alt="ArrowDown"
                                  style={{
                                    fontSize: 32, color: "#8F4D63",
                                    width: 24,
                                    height: 24,
                                  }}
                                />
                              </Box>
                            </Box>
                          }
                          labelPlacement="bottom"
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, color: "#574B4F", mt: 2, textAlign: "center" }}>
                          Plantilla
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                </Box>
              ) : tipoMensaje === "escrito" ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, overflowX: "hidden", }}>
                  {/* Componente editor de mensaje */}
                  <DynamicCampaignText
                    variables={variables}
                    value={mensajeTexto}
                    onChange={setMensajeTexto}
                    allowConcatenation={allowConcatenation}
                  />

                  {/* Opciones adicionales debajo */}
                  <Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: -2, marginTop: "-25px" }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={allowConcatenation}
                            onChange={(e) => setAllowConcatenation(e.target.checked)}
                            sx={{
                              color: "#786F72",
                              '&.Mui-checked': {
                                color: "#8F4D63",
                              },
                            }}
                          />
                        }
                        label="Concatenar mensajes con más de 160 caracteres"
                        sx={{
                          fontFamily: "Poppins",
                          '& .MuiFormControlLabel-label': {
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            color: "#786F72", // color texto cuando no está marcado
                          },
                          '& .Mui-checked + .MuiFormControlLabel-label': {
                            color: "#8F4D63", // color texto cuando está marcado
                          },
                        }}
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            sx={{
                              color: "#786F72", // color cuando está desmarcado
                              '&.Mui-checked': {
                                color: "#8F4D63", // color cuando está marcado
                              },
                            }}
                          />
                        }
                        label="Acortar URLs en el mensaje"
                        sx={{
                          fontFamily: "Poppins",
                          '& .MuiFormControlLabel-label': {
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            color: "#786F72", // color texto cuando no está marcado
                          },
                          '& .Mui-checked + .MuiFormControlLabel-label': {
                            color: "#8F4D63", // color texto cuando está marcado
                          },
                        }}
                      />

                      <FormControlLabel
                        control={
                          <Checkbox
                            sx={{
                              color: "#786F72", // color cuando está desmarcado
                              '&.Mui-checked': {
                                color: "#8F4D63", // color cuando está marcado
                              },
                            }}
                            checked={saveAsTemplate}
                            onChange={(e) => setSaveAsTemplate(e.target.checked)}
                          />
                        }
                        label="Guardar como plantilla"
                        sx={{
                          fontFamily: "Poppins",
                          '& .MuiFormControlLabel-label': {
                            fontFamily: "Poppins",
                            fontSize: "14px",
                            color: "#786F72", // color texto cuando no está marcado
                          },
                          '& .Mui-checked + .MuiFormControlLabel-label': {
                            color: "#8F4D63", // color texto cuando está marcado
                          },
                        }}
                      />

                    </Box>

                    <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "14px", mt: 2, mb: 1 }}>
                      Nombre
                    </Typography>

                    <TextField
                      fullWidth
                      placeholder="Nombre de la plantilla"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <img src={infoicon} alt="info" style={{ width: 20, height: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => setTemplateName(e.target.value)}
                      sx={{
                        width: "500px",
                        fontFamily: "Poppins",
                        backgroundColor: "#FFFFFF",
                        borderRadius: "8px",
                        '& .MuiOutlinedInput-root': {
                          fontSize: "14px",
                          paddingRight: "8px",
                        },
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                // 🔵 CONTENIDO PLANTILLA
                <TemplateViewer
                  templates={templates}
                  value={mensajeTexto}
                  onChange={setMensajeTexto}
                  onSelectTemplateId={(id) => {
                    const tpl = templates.find(t => t.id === id);
                    setSelectedTemplate(tpl);
                  }}
                  dynamicVariables={selectedVariables}
                />


              )}
            </>
          )}
          {/*Configuraciones Avanzadas en crar campaña SMS*/}
          {activeStep === 2 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', ml: 7 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px', mb: 2 }}>
                Configuraciones avanzadas
              </Typography>
              <RadioGroup
                row
                value={tipoNumero}
                onChange={(e) => setTipoNumero(e.target.value)}
                sx={{ mb: 1, }}
              >
                <FormControlLabel
                  value="corto"
                  control={
                    <Radio
                      sx={{
                        color: '#330F1B', // color cuando no está seleccionado
                        '&.Mui-checked': {
                          color: '#8F4D63', // color circulito seleccionado
                        },
                      }}
                    />
                  }
                  label="Número corto"
                  sx={{
                    mr: 4,
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Poppins',
                      color: tipoNumero === 'corto' ? '#8F4D63' : '#330F1B', // texto cambia con selección
                    },
                  }}
                />
                <FormControlLabel
                  value="largo"
                  control={
                    <Radio
                      sx={{
                        color: '#330F1B',
                        '&.Mui-checked': {
                          color: '#8F4D63',
                        },
                      }}
                    />
                  }
                  label="Número largo"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Poppins',
                      color: tipoNumero === 'largo' ? '#8F4D63' : '#330F1B',
                    },
                  }}
                />
              </RadioGroup>
              {/*Mensaje flash box*/}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center', width: "584px", height: "57px",
                  border: '1px solid #E6E4E4',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  opacity: tipoNumero === 'largo' ? 0.5 : 1,
                  backgroundColor: flashEnabled ? '#FFFFFF' : '#FFFFFF',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#330F1B',
                    }}
                  >
                    Mensaje flash
                  </Typography>
                  <Tooltip
                    placement="right"
                    title={(
                      <Box sx={{
                        fontFamily: 'Poppins', fontSize: '14px',
                        color: '#000000', opacity: 0.7,
                      }}>
                        · Configuración que define<br />
                        cuántas veces se reciclarán<br />
                        automáticamente los registros de<br />
                        la campaña.<br />
                        Pueden ser todos los registros o<br />
                        solo los no contactados,<br />
                        incluyendo los de máquina/<br />
                        buzón.
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
                            offset: [104, -260] //  [horizontal, vertical]
                          }
                        }
                      ]
                    }}
                  >
                    <img
                      src={infoicon}
                      alt="info"
                      style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                    />
                  </Tooltip>
                </Box>
                <Switch
                  checked={flashEnabled}
                  disabled={tipoNumero === 'largo'}
                  onChange={(e) => setFlashEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8F4D63',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8F4D63',
                    },
                  }}
                />
              </Box>
              {/*Personalizar ANI box*/}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  minHeight: "57px",
                  border: '1px solid #E6E4E4',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: aniEnabled ? '#FFFFFF' : '#FFFFFF',
                  opacity: tipoNumero === 'corto' ? 0.5 : 1,
                  mb: 2,
                  gap: 1, // espacio entre los dos bloques
                }}
              >
                {/* Primer bloque: texto + tooltip + switch */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Personalizar ANI
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={aniEnabled}
                    disabled={tipoNumero === 'corto'}
                    onChange={(e) => setAniEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Segundo bloque: Select, visible solo si el switch está activado */}
                {aniEnabled && (
                  <Box sx={{ mt: 1 }}>
                    <Select
                      fullWidth
                      value={selectedAni}
                      onChange={(e) => setSelectedAni(e.target.value)}
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? (
                          <span style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#786E71' }}>
                            {selected}
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#786E71' }}>
                            Seleccionar
                          </span>
                        )
                      }
                      sx={{
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'Poppins',
                        fontSize: '12px', // también puedes poner aquí, pero lo controlamos mejor en renderValue
                        borderRadius: '8px',
                        height: '40px',
                        width: '200px',
                        border: '1px solid #9B9295',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      {aniOptions.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#786E71',
                            '&:hover': {
                              backgroundColor: '#F2EBED',
                            },
                          }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>




                  </Box>
                )}
              </Box>

              {/*Reciclar registros automaticamente box*/}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  border: '1px solid #D6CED2',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: recycleEnabled ? '#FFFFFF' : '#FFFFFF',
                  mb: 2,
                  gap: 2,
                }}
              >
                {/* Bloque 1: Texto + tooltip + switch */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Reciclar registros automáticamente
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={recycleEnabled}
                    onChange={(e) => setRecycleEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Bloque 2: Visible solo si switch está activado */}
                {recycleEnabled && (
                  <Box sx={{ display: 'flex', gap: 6 }}>
                    {/* Box A: Tipo de registros */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1 }}>
                        Tipo de registros
                      </Typography>
                      <RadioGroup
                        value={recycleType}
                        onChange={(e) => setRecycleType(e.target.value)}
                      >
                        <FormControlLabel
                          value="todos"
                          control={
                            <Radio
                              sx={{
                                color: '#574B4F', // color normal del circulito
                                '&.Mui-checked': {
                                  color: '#8F4D63', // color cuando está seleccionado
                                },
                              }}
                            />
                          }
                          label="Todos"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontFamily: 'Poppins',
                              fontSize: '16px',
                              color: recycleType === 'todos' ? '#8F4D63' : '#574B4F', // color texto seleccionado
                            },
                          }}
                        />
                        <FormControlLabel
                          value="rechazados"
                          control={
                            <Radio
                              sx={{
                                color: '#330F1B',
                                '&.Mui-checked': {
                                  color: '#8F4D63',
                                },
                              }}
                            />
                          }
                          label="Rechazados"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontFamily: 'Poppins',
                              fontSize: '16px',
                              color: recycleType === 'rechazados' ? '#8F4D63' : '#574B4F',
                            },
                          }}
                        />
                      </RadioGroup>

                    </Box>

                    {/* Box B: Incluir no contactados */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: "130px" }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1, textAlign: "center" }}>
                        Incluir registros no contactados
                      </Typography>
                      <Checkbox
                        checked={includeUncontacted}
                        onChange={(e) => setIncludeUncontacted(e.target.checked)}
                        sx={{
                          color: '#330F1B', // color del cuadro cuando está desmarcado
                          '&.Mui-checked': {
                            color: '#8F4D63', // color cuando está marcado
                          },
                        }}
                      />

                    </Box>

                    {/* Box C: Número de reciclajes */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1 }}>
                        Número de reciclajes
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => setRecycleCount((prev) => Math.max(1, prev - 1))}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={recycleCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) setRecycleCount(val);
                          }}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                          sx={{ width: 60, textAlign: 'center', mx: 1 }}
                        />
                        <IconButton
                          onClick={() => setRecycleCount((prev) => prev + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/*Listas negras box*/}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  border: '1px solid #D6CED2',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  mb: 2,
                  gap: 2,
                }}
              >
                {/* Primer Box: Título + tooltip + switch */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Listas Negras
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={blacklistEnabled}
                    onChange={(e) => setBlacklistEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Segundo Box: Buscador + tabla */}
                {blacklistEnabled && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Buscador */}
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        backgroundColor: "#FFFFFF",
                        border: searchTermBlacklist ? "1px solid #7B354D" : "1px solid #9B9295",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        width: "100%",
                        maxWidth: "360px",
                        height: "40px",
                      }}
                    >
                      <img
                        src={seachicon}
                        alt="Buscar"
                        style={{
                          marginRight: "8px",
                          width: "18px",
                          height: "18px",
                          filter: searchTermBlacklist
                            ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)"
                            : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Buscar listas negras"
                        value={searchTermBlacklist}
                        onChange={(e) => setSearchTermBlacklist(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          width: "100%",
                          fontSize: "16px",
                          fontFamily: "Poppins, sans-serif",
                          color: searchTermBlacklist ? "#7B354D" : "#9B9295",
                          backgroundColor: "transparent",
                        }}
                      />
                      {searchTermBlacklist && (
                        <img
                          src={iconclose}
                          alt="Limpiar búsqueda"
                          style={{
                            marginLeft: "8px",
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSearchTermBlacklist('')}
                        />
                      )}
                    </Box>

                    {/* Tabla */}
                    <Box sx={{ maxHeight: "191px", overflowY: "auto", border: "1px solid #D6CED2", borderRadius: "8px" }}>
                      <table style={{ width: "100%", fontFamily: 'Poppins', fontSize: "14px", borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '2px 4px', width: '30%' }}>Nombre</th>
                            <th style={{ textAlign: 'left', padding: '4px 6px', width: '35%' }}>Creación</th>
                            <th style={{ textAlign: 'left', padding: '4px 6px', width: '35%' }}>Expiración</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBlackLists.map((list) => (
                            <tr key={list.id}>
                              <td style={{ padding: '2px 4px' }}>
                                <Checkbox
                                  checked={selectedBlackListIds.includes(list.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBlackListIds(prev => [...prev, list.id]);
                                    } else {
                                      setSelectedBlackListIds(prev => prev.filter(id => id !== list.id));
                                    }
                                  }}
                                  sx={{
                                    color: '#8F4D63',
                                    '&.Mui-checked': { color: '#8F4D63' },
                                  }}
                                />
                                {list.name}
                              </td>
                              <td style={{ padding: '2px 4px' }}>{list.creationDate || 'NA'}</td>
                              <td style={{ padding: '2px 4px' }}>{list.expirationDate || 'NA'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Box>
                )}
              </Box>

            </Box>
          )}

        </Box>


        {/*Botones Cancelar / Atras / Siguiente */}
        <DialogActions
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "24px",
            justifyContent: "space-between",
            borderTop: "1px solid #E0E0E0",
            backgroundColor: "#FFF",
          }}
        >
          {/* Botón Cancelar a la izquierda */}
          <Button
            variant="outlined"
            onClick={() => setOpenCreateCampaignModal(false)}
            sx={{
              width: "118px",
              height: "36px",
              border: "1px solid #CCCFD2",
              borderRadius: "4px",
              color: "#833A53",
              backgroundColor: "transparent",
              fontFamily: "Poppins",
              fontWeight: "500",
              fontSize: "14px",
              letterSpacing: "1.12px",
              "&:hover": {
                backgroundColor: "#f3e6eb",
                color: "#833A53",
              },
            }}
          >
            Cancelar
          </Button>

          {/* Botones Atrás y Siguiente a la derecha */}
          <Box sx={{ display: "flex", gap: "20px" }}>
            {activeStep > -1 && (
              <Button
                onClick={() => setActiveStep((prev) => prev - 1)}
                sx={{
                  width: "118px",
                  height: "36px",
                  border: "1px solid #CCCFD2",
                  borderRadius: "4px",
                  color: "#833A53",
                  backgroundColor: "transparent",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                  fontSize: "14px",
                  letterSpacing: "1.12px",
                  "&:hover": {
                    backgroundColor: "#f3e6eb",
                  },
                }}
              >
                Atrás
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleContinue}
              disabled={
                activeStep === -1 &&
                (campaignName.trim() === '' || horarios.length === 0)
              }
              loading={loading}
              sx={{
                width: "118px",
                height: "36px",
                background: "#833A53",
                border: "1px solid #D4D1D1",
                borderRadius: "4px",
                color: "#FFFFFF",
                fontFamily: "Poppins",
                fontWeight: "500",
                fontSize: "14px",
                letterSpacing: "1.12px",
              }}
            >
              {activeStep === 2 || (activeStep === 0 && !postCargaActiva) ? "Cargar" : "Siguiente"}

            </Button>
          </Box>
        </DialogActions>


      </Dialog>


      <CustomDateTimePicker
        open={calendarOpen}
        anchorEl={calendarAnchor}
        onClose={() => setCalendarOpen(false)}
        placement="top"
        offset={[100, -200]}
        onApply={(selectedDate, hour, minute) => {
          const fullDate = new Date(selectedDate);
          fullDate.setHours(hour);
          fullDate.setMinutes(minute);
          fullDate.setSeconds(0);
          fullDate.setMilliseconds(0);

          if (currentHorarioIndex !== null && calendarTarget) {
            if (editActiveStep === -1) {
              // 🟦 Modal de edición
              setEditHorarios((prev) =>
                prev.map((h, i) =>
                  i === currentHorarioIndex ? { ...h, [calendarTarget]: fullDate } : h
                )
              );
            } else {
              // 🟩 Modal de creación
              setHorarios((prev) =>
                prev.map((h, i) =>
                  i === currentHorarioIndex ? { ...h, [calendarTarget]: fullDate } : h
                )
              );
            }
          }

          setCalendarOpen(false);
        }}
      />





      <ModalError
        isOpen={isErrorModalOpen}
        title={TitleErrorModal}
        message={MessageErrorModal}
        buttonText="Cerrar"
        onClose={() => setIsErrorModalOpen(false)}
      />

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
          setMenuIndex(null);
        }}
      >
        {menuIndex === -1 ? (
             <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '184px'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <MenuItem
                  onClick={() => {
                    if (selectedCampaign.autoStart) {
                      handleOpenEditCampaignModal(selectedCampaign);
                    }
                    handleMenuClose();
                  }}
                  disabled={menuIndex !== null && selectedCampaign?.autoStart}
                  sx={{
                    opacity: menuIndex !== null && selectedCampaign?.autoStart ? 0.5 : 1,
                    fontFamily: "Poppins",
                    color: "#574B4F",
                    fontSize: "14px",
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '8px',
                    height: "40px", '&:hover': {
                      backgroundColor: '#F2EBED'
                    }
                  }}
                >
                  <EditIcon sx={{ marginRight: 1, width: 24, height: 24, ml: 0.5 }} />
                  Editar
                </MenuItem>
              </Box>

              {selectedCampaign?.autoStart && (
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
                        color: "#574B4F",
                        whiteSpace: "pre-line",
                        transform: "translate(-1px, -15px)",
                        borderColor: "#00131F3D",
                        borderStyle: "solid",
                        borderWidth: "1px",
                        width: "190px",
                        height: "88px", textAlign: "center"
                      }}
                    >
                      <>
                        No es posible editar<br />
                        mientras la campaña<br />
                        se encuentre en curso.
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
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [10, 1] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                        }
                      }
                    ]
                  }}
                >
                  <Box
                    component="img"
                    src={infoicon}
                    alt="info"
                    sx={{
                      width: 24,
                      height: 24,
                      mr: '25px', // mueve ligeramente hacia la izquierda
                      cursor: 'pointer'
                    }}
                  />
                </Tooltip>
              )}
            </Box>

            <MenuItem onClick={() => {
              if (menuIndex !== null && menuIndex >= 0) {
                handleOpenDuplicateModal(selectedCampaign);
              } else if (selectedCampaign) {
                handleOpenDuplicateModal(selectedCampaign);
              }
              handleMenuClose();
            }}
              sx={{
                fontFamily: "Poppins", color: "#574B4F",
                fontSize: "14px",
                fontWeight: 500,
                height: "40px", '&:hover': {
                  backgroundColor: '#F2EBED'
                }
              }}
            >
              <ContentCopyIcon sx={{ width: 24, height: 24, marginRight: 1, ml: 0.5 }} /> Duplicar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setCampaignToDelete(selectedCampaign);
                setOpenDeleteModal(true);
                handleMenuClose();
              }}
              sx={{
                fontFamily: "Poppins", color: "#574B4F", fontSize: "14px", fontWeight: 500, height: "40px",
                ml: "1px", '&:hover': {
                  backgroundColor: '#F2EBED'
                }
              }}
            >
              <ListItemIcon>
                <img src={Thrashicon} alt="Eliminar archivo" style={{ width: 24, height: 24, marginLeft: "3px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Eliminar"
                primaryTypographyProps={{
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#574B4F", marginTop: "0px"
                }}
              />
            </MenuItem>
          </>
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '184px'
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <MenuItem
                  onClick={() => {
                    if (!campaigns[menuIndex!]?.autoStart) {
                      handleOpenEditCampaignModal(campaigns[menuIndex!]);
                    }
                    handleMenuClose();
                  }}
                  disabled={menuIndex !== null && campaigns[menuIndex]?.autoStart}
                  sx={{
                    opacity: menuIndex !== null && campaigns[menuIndex]?.autoStart ? 0.5 : 1,
                    fontFamily: "Poppins",
                    color: "#574B4F",
                    fontSize: "14px",
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '8px',
                    height: "40px", '&:hover': {
                      backgroundColor: '#F2EBED'
                    }
                  }}
                >
                  <EditIcon sx={{ marginRight: 1, width: 24, height: 24, ml: 0.5 }} />
                  Editar
                </MenuItem>
              </Box>

              {menuIndex !== null && campaigns[menuIndex]?.autoStart && (
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
                        color: "#574B4F",
                        whiteSpace: "pre-line",
                        transform: "translate(-1px, -15px)",
                        borderColor: "#00131F3D",
                        borderStyle: "solid",
                        borderWidth: "1px",
                        width: "190px",
                        height: "88px", textAlign: "center"
                      }}
                    >
                      <>
                        No es posible editar<br />
                        mientras la campaña<br />
                        se encuentre en curso.
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
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [10, 1] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                        }
                      }
                    ]
                  }}
                >
                  <Box
                    component="img"
                    src={infoicon}
                    alt="info"
                    sx={{
                      width: 24,
                      height: 24,
                      mr: '25px', // mueve ligeramente hacia la izquierda
                      cursor: 'pointer'
                    }}
                  />
                </Tooltip>
              )}
            </Box>

            <MenuItem onClick={() => {
              if (menuIndex !== null && menuIndex >= 0) {
                handleOpenDuplicateModal(campaigns[menuIndex]);
              } else if (selectedCampaign) {
                handleOpenDuplicateModal(selectedCampaign);
              }
              handleMenuClose();
            }}
              sx={{
                fontFamily: "Poppins", color: "#574B4F",
                fontSize: "14px",
                fontWeight: 500,
                height: "40px", '&:hover': {
                  backgroundColor: '#F2EBED'
                }
              }}
            >
              <ContentCopyIcon sx={{ width: 24, height: 24, marginRight: 1, ml: 0.5 }} /> Duplicar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setCampaignToDelete(filteredCampaigns[menuIndex ?? 0]);
                setOpenDeleteModal(true);
                handleMenuClose();
              }}
              sx={{
                fontFamily: "Poppins", color: "#574B4F", fontSize: "14px", fontWeight: 500, height: "40px",
                ml: "1px", '&:hover': {
                  backgroundColor: '#F2EBED'
                }
              }}
            >
              <ListItemIcon>
                <img src={Thrashicon} alt="Eliminar archivo" style={{ width: 24, height: 24, marginLeft: "3px" }} />
              </ListItemIcon>
              <ListItemText
                primary="Eliminar"
                primaryTypographyProps={{
                  fontFamily: "Poppins",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#574B4F", marginTop: "0px"
                }}
              />
            </MenuItem>
          </>
        )}
      </Menu>


      <Dialog
        open={openEditCampaignModal}
        onClose={() => setOpenEditCampaignModal(false)}
        maxWidth={false} // Le quitamos el límite de ancho
        fullWidth // Forzamos que se respete el ancho del Paper
        PaperProps={{
          sx: {
            width: "810px",
            height: "668px",
            borderRadius: "12px",
            padding: "32px",
            boxSizing: "border-box",
          }
        }}
      >
        <Box
          sx={{
            height: "120px"
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Poppins",
              fontWeight: 600,
              fontSize: "20px",
              color: "#574B4F",
              paddingBottom: "0px",
              pl: "9px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              textTransform: "none",
              marginTop: "-25px",
              marginLeft: "-20px"
            }}
          >
            Editar campaña SMS
            <IconButton onClick={() => setOpenEditCampaignModal(false)}>
              <CloseIcon sx={{
                fontSize: "22px", color: "#574B4F",
                marginLeft: "65px",
                marginTop: "-20px",
                position: "absolute"
              }} />
            </IconButton>
          </DialogTitle>

          {/* Línea divisoria */}
          <Divider
            sx={{
              position: "absolute",
              marginY: "15px",
              left: "0px",
              backgroundColor: "#9F94A5",
              height: "1px",
              width: "100%",
              opacity: 0.3
            }}
          />

          <Divider sx={{ marginTop: "10px", marginBottom: "18px", opacity: 0.3 }} />

          {/*Stepper */}
          <DialogContent sx={{ padding: "0 8px", }}>


            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", width: "100%" }}>
              {["Nombre y horarios", "Registros", "Mensaje", "Configuraciones"].map((label, index) => {
                const isActive = index === editActiveStep;
                const isCompleted = index < editActiveStep;
                const isLast = index === 3;

                return (
                  <React.Fragment key={label}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                      <Box
                        sx={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          border: `2px solid ${isActive || isCompleted ? "#8F4D63" : "#D6D6D6"}`,
                          backgroundColor: isActive ? "#8F4D63" : isCompleted ? "#8F4D63" : "#FFFFFF",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isActive && (
                          <Box
                            component="span"
                            sx={{
                              color: "#FFFFFF",
                              fontSize: "14px",
                              fontWeight: "bold",
                              fontFamily: "Poppins",
                            }}
                          >
                            ✓
                          </Box>
                        )}
                        {!isActive && isCompleted && (
                          <CheckIcon sx={{ fontSize: 16, color: "#FFFFFF" }} />
                        )}
                      </Box>

                      <Typography
                        sx={{
                          marginTop: "6px",
                          fontSize: "12px",
                          fontFamily: "Poppins",
                          color: isActive ? "#8F4D63" : "#9B9295",
                          textAlign: "center",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "80px",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>

                    {!isLast && (
                      <Box
                        sx={{
                          width: "80px",
                          height: "2px",
                          backgroundColor: "#D6D6D6",
                          mx: "20px",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>

          </DialogContent>
        </Box>

        {/* Línea divisoria */}
        <Divider
          sx={{
            position: "absolute",
            marginY: "116px",
            left: "0px",
            backgroundColor: "#9F94A5",
            height: "1px",
            width: "100%",
            opacity: 0.3
          }}
        />
        <Box
          sx={{
            overflowY: 'auto', display: "flex", flexDirection: "column", marginTop: "0px", paddingBottom: 10,
          }}
        >
          {/*Editar campañas - Paso 1*/}
          {editActiveStep === -1 && (
            <Box sx={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: 4, maxHeight: "318px", ml: "25px" }}>

              {/* Box 1: Ingrese un nombre */}

              <Box
                sx={{
                  width: "340px",
                  height: "88px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between", mt: 0.5
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "18px",
                    color: "#330F1B",
                    mb: 1.5, mt: -2
                  }}
                >
                  Ingrese un nombre
                </Typography>
                <TextField
                  variant="outlined"
                  placeholder="Nombre"
                  value={editCampaignName}
                  onChange={(e) => setEditCampaignName(e.target.value)}
                  helperText={
                    editCampaignName
                      ? editCampaignName.length > 40
                        ? "Máximo 40 caracteres"
                        : !/^[a-zA-Z0-9ñÑ ]+$/.test(editCampaignName)
                          ? "Formato inválido"
                          : ""
                      : ""
                  }
                  error={
                    !!editCampaignName &&
                    (editCampaignName.length > 40 || !/^[a-zA-Z0-9ñÑ ]+$/.test(editCampaignName))
                  }
                  FormHelperTextProps={{
                    sx: {
                      fontFamily: 'Poppins, sans-serif',
                    },
                  }}
                  InputProps={{
                    endAdornment:
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
                              color: "#574B4F",
                              whiteSpace: "pre-line",
                              transform: "translate(-1px, -15px)",
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
                              padding: 0
                            }
                          }
                        }}
                      >
                        <InputAdornment position="end">
                          <img
                            src={isEditNameInvalid ? infoiconerror : infoicon}
                            alt="info-icon"
                            style={{ width: 24, height: 24 }}
                          />
                        </InputAdornment>
                      </Tooltip>


                  }}
                  sx={{
                    width: "340px",
                    height: "54px",
                    fontFamily: "Poppins",
                    "& .MuiInputBase-input": {
                      fontFamily: "Poppins",
                      height: "54px",
                      boxSizing: "border-box",
                    }
                  }}
                />
              </Box>

              {/* Box 2: Horarios */}
              {/* Renderiza todos los horarios */}
              {editHorarios.map((horario, index) => (

                <React.Fragment key={index}>

                  {index > 0 && (
                    <Box sx={{ width: "100%", height: "62px", backgroundColor: "#FFFFFF", mt: 0 }}>
                      <Typography sx={{ fontFamily: "Poppins", fontSize: "18px", color: "#574B4F", mb: "4px" }}>
                        Modo de operación
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <FormControlLabel
                          control={<Radio checked={horario.operationMode === 1} onChange={() => {
                            const nuevos = [...editHorarios];
                            nuevos[index].operationMode = 1;
                            setEditHorarios(nuevos);
                          }} value="reanudar"
                            sx={{
                              color: "#8F4D63",
                              '&.Mui-checked': { color: "#8F4D63" }
                            }}
                          />}
                          label={<Typography sx={{ fontFamily: "Poppins", fontSize: "16px", color: "#8F4D63" }}>Reanudar</Typography>}
                        />
                        <FormControlLabel
                          control={<Radio checked={horario.operationMode === 2} onChange={() => {
                            const nuevos = [...editHorarios];
                            nuevos[index].operationMode = 2;
                            setEditHorarios(nuevos);
                          }} value="reciclar" sx={{
                            color: "#9B9295",
                            '&.Mui-checked': { color: "#9B9295" }
                          }} />}
                          label={<Typography sx={{ fontFamily: "Poppins", fontSize: "16px", color: "#9B9295" }}>Reciclar</Typography>}
                        />
                      </Box>
                    </Box>
                  )}
                  <Box
                    key={index}
                    sx={{
                      width: "672px",
                      backgroundColor: "#F2EBEDCC",
                      borderRadius: "8px",
                      padding: "16px",
                      marginTop: "-5px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px"
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography
                        sx={{
                          fontFamily: "Poppins",
                          fontSize: "16px",
                          fontWeight: 500,
                          color: "#574B4F",
                        }}
                      >
                        {horario.titulo}
                      </Typography>

                    </Box>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        key={`start-edit-${index}`}
                        variant="outlined"
                        placeholder="Inicia"
                        value={
                          horario.start
                            ? horario.start.toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : ''
                        }
                        disabled={isEditNameInvalid}
                        sx={{
                          width: "262px", height: "56px", backgroundColor: "#FFFFFF", '& .MuiInputBase-input': {
                            fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F"
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={(e) => {
                                  setCalendarAnchor(e.currentTarget);
                                  setCalendarOpen(true);
                                  setCalendarTarget("start");
                                  setCurrentHorarioIndex(index);
                                }}
                                size="small"
                                disabled={isEditNameInvalid}
                                sx={{ padding: 0 }}
                              >
                                <CalendarTodayIcon sx={{ width: "15px", height: "15px", color: "#8F4D63" }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <TextField
                        key={`end-edit-${index}`}
                        variant="outlined"
                        placeholder="Termina"
                        value={
                          horario.end
                            ? horario.end.toLocaleString('es-MX', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : ''
                        }
                        disabled={isEditNameInvalid}
                        sx={{
                          width: "262px", height: "56px", backgroundColor: "#FFFFFF", '& .MuiInputBase-input': {
                            fontFamily: 'Poppins', fontSize: '16px', color: "#574B4F"
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={(e) => {
                                  setCalendarAnchor(e.currentTarget);
                                  setCalendarOpen(true);
                                  setCalendarTarget("end");
                                  setCurrentHorarioIndex(index);
                                }}
                                size="small"
                                disabled={isEditNameInvalid}
                                sx={{ padding: 0 }}
                              >
                                <CalendarTodayIcon sx={{ width: "15px", height: "15px", color: "#8F4D63" }} />
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {index > 0 && (
                          <Box sx={{ marginTop: '0px', marginLeft: '0px', }}>
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
                                      offset: [-0, -10] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                                    }
                                  }
                                ]
                              }}
                            >
                              <IconButton onClick={() => handleEliminarHorarioEditar(index)} >
                                <Box
                                  component="img"
                                  src={IconTrash}
                                  alt="Eliminar"
                                  sx={{ width: 24, height: 24, cursor: "pointer", opacity: 0.6 }}
                                />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        {index === editHorarios.length - 1 && editHorarios.length < 5 && (
                          <Box sx={{ marginTop: '0px', marginLeft: '0px' }}>
                            <Tooltip title="Agregar horario" arrow placement="top"
                              componentsProps={{
                                tooltip: {
                                  sx: {
                                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                                    color: "#CCC3C3",
                                    fontFamily: "Poppins, sans-serif",
                                    fontSize: "12px",
                                    padding: "6px 8px",
                                    borderRadius: "8px",
                                  }
                                },
                                arrow: {
                                  sx: {
                                    color: "rgba(0, 0, 0, 0.8)"
                                  }
                                }
                              }}
                            >

                              <IconButton onClick={handleAgregarHorarioEditar}>
                                <Box
                                  component="img"
                                  src={IconCirclePlus}
                                  alt="Agregar Horario"
                                  sx={{ width: "24px", height: "24px", cursor: "pointer", position: "absolute" }}
                                />
                              </IconButton>

                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    </Box>

                  </Box>
                  {/* Checkbox Iniciar campaña automáticamente */}
                  {index === 0 && (
                    <Box
                      sx={{
                        width: "250px",
                        height: "80px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        mt: editHorarios.length <= 1 ? -3.5 : -1,
                        mb: -1,
                        marginBotttom: "10px",
                        marginLeft: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}
                      >
                        <Checkbox
                          disabled={editHorarios.length <= 1} // 🔒 Desactivado hasta que haya más de 1 horario
                          checked={editAutoStart}
                          onChange={(e) => setEditAutoStart(e.target.checked)}
                          icon={
                            <Box
                              sx={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "4px",
                                border: `2px solid ${editHorarios.length <= 1 ? '#C0C0C0' : '#8F4D63'}`,
                              }}
                            />
                          }
                          checkedIcon={
                            <Box
                              sx={{
                                width: '24px',
                                height: '24px',
                                position: 'relative',
                                marginTop: '0px',
                                marginLeft: '-2px',
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
                            color: "#8F4D63",
                            "&.Mui-checked": { color: "#8F4D63" },
                            alignSelf: "flex-start",
                            padding: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontFamily: "Poppins",
                            fontSize: "16px",
                            color: editHorarios.length <= 1 ? "#C0C0C0" : "#8F4D63",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Iniciar campaña automáticamente
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </React.Fragment>
              ))}

            </Box>
          )}
          {/*Editar campañas - Paso 2*/}
          {editActiveStep === 0 && (
            // 🟰 CONTENIDO de "Registros" nuevo (el que quieres mostrar)
            <Box sx={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: 2, maxHeight: "420px", overflowY: "auto" }}>

              <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: '#330F1B', mt: -1 }}>
                Cargue un archivo desde su biblioteca.
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 4,
                  width: '100%',
                  marginTop: '16px',
                }}
              >
                {/* Parte izquierda: DropZone y Seleccionar hoja */}
                <Box sx={{ width: "320px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <DropZone onDrop={(file) => {
                    setUploadedFile(file);
                    handleManageFile(file);
                  }} error={fileError} />

                  {uploadedFile && !postCargaActiva && (
                    <FormControl fullWidth sx={{ marginTop: "16px" }}>
                      <Typography sx={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', mb: 1 }}>
                        Seleccionar hoja
                      </Typography>
                      <Select
                        value={selectedSheet}
                        onChange={handleSheetChange}
                        displayEmpty
                        sx={{
                          borderRadius: "8px",
                          backgroundColor: "#FFFFFF",
                          fontFamily: "Poppins",
                          fontSize: "14px"
                        }}
                      >
                        {sheetNames.map((name, idx) => (
                          <MenuItem key={idx} value={name}>{name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>

                {!postCargaActiva && uploadedFile && (
                  <Box sx={{ width: 380, border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', marginTop: '24px', fontFamily: 'Poppins' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '18px', marginBottom: '12px', color: '#330F1B' }}>Seleccionar datos y orden</Typography>
                    <Tabs
                      value={selectedTab}
                      onChange={(_, newValue) => setSelectedTab(newValue)}
                      indicatorColor="secondary"
                      textColor="inherit"
                      sx={{ borderBottom: '1px solid #D9B4C3', marginBottom: '16px', '.MuiTab-root': { fontFamily: 'Poppins', fontWeight: 500, fontSize: '14px', textTransform: 'none', color: '#7B354D', paddingBottom: '6px', minWidth: '100px' } }}
                    >
                      <Tab label="Teléfonos" value="telefonos" />
                      <Tab label="Variables" value="variables" />
                    </Tabs>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="columns-droppable">
                        {(provided) => (
                          <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ maxHeight: '160px', overflowY: 'auto' }}>
                            {currentSelected.map((col, index) => {
                              const isDisabled = selectedTab === 'telefonos' ? selectedVariables.includes(col) : selectedTelefonos.includes(col);
                              const toggleValue = () => {
                                const updater = selectedTab === 'telefonos' ? setSelectedTelefonos : setSelectedVariables;
                                updater(currentSelected.filter(c => c !== col));
                              };
                              return (
                                <Draggable key={col} draggableId={col} index={index}>
                                  {(provided) => (
                                    <Box
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D9B4C3', borderRadius: '8px', padding: '6px 12px', marginBottom: '10px', backgroundColor: '#F2EBED', width: '100%', cursor: 'grab' }}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Checkbox checked onChange={toggleValue} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                        <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px' }}>{col}</Typography>
                                      </Box>
                                      <DragIndicatorIcon sx={{ fontSize: '18px', color: '#9B9295', cursor: 'grab' }} />
                                    </Box>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}

                            {columnsToRender
                              .filter(col => !currentSelected.includes(col))
                              .map((col) => {
                                const isDisabled = selectedTab === 'telefonos'
                                  ? selectedVariables.includes(col)
                                  : selectedTelefonos.includes(col);

                                const toggleValue = () => {
                                  const updater = selectedTab === 'telefonos' ? setSelectedTelefonos : setSelectedVariables;
                                  updater([...currentSelected, col]);
                                };

                                return (
                                  <Box
                                    key={col}
                                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #D9B4C3', borderRadius: '8px', padding: '6px 12px', marginBottom: '10px', backgroundColor: '#FFF', width: '100%', opacity: isDisabled ? 0.5 : 1 }}
                                  >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Checkbox checked={false} onChange={toggleValue} disabled={isDisabled} sx={{ '&.Mui-checked': { color: '#7B354D' } }} />
                                      <Typography sx={{ fontFamily: 'Poppins', fontSize: '14px' }}>{col}</Typography>
                                    </Box>
                                    <DragIndicatorIcon sx={{ fontSize: '18px', color: '#D9D9D9' }} />
                                  </Box>
                                );
                              })}
                          </Box>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Box>
                )}

                {postCargaActiva && estadisticasCarga && (
                  <Box
                    sx={{
                      border: "1px solid #D9B4C3",
                      borderRadius: "8px",
                      padding: "16px 24px",
                      marginLeft: "32px",
                      width: "280px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center"
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "16px", mb: 2, fontFamily: "Poppins" }}>
                      Resumen de carga
                    </Typography>

                    {/* Registros */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: "Poppins", mb: 1 }}>
                      <Typography>Registros</Typography>
                      <Typography>{porcentajeRegistrosCargados}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={porcentajeRegistrosCargados}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#E2E2E2",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#8F4D63",
                        },
                        mb: 1,
                      }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: "Poppins", mb: 2 }}>
                      <Typography>Cargados: {estadisticasCarga.registrosCargados}</Typography>
                      <Typography>No cargados: {estadisticasCarga.registrosFallidos}</Typography>
                    </Box>

                    {/* Teléfonos */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: "Poppins", mb: 1 }}>
                      <Typography>Teléfonos</Typography>
                      <Typography>{porcentajeTelefonosCargados}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={porcentajeTelefonosCargados}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#E2E2E2",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#8F4D63",
                        },
                        mb: 1,
                      }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", fontFamily: "Poppins" }}>
                      <Typography>Cargados: {estadisticasCarga.telefonosCargados}</Typography>
                      <Typography>No cargados: {estadisticasCarga.telefonosFallidos}</Typography>
                    </Box>
                  </Box>
                )}

              </Box>

            </Box>
          )}

          {editActiveStep === 1 && (
            <Box
              sx={{ maxHeight: "342px", ml: "0px" }}
            >
              <DynamicCampaignEditText
                value={EditMensaje}
                onChange={setEditMensaje}
              />

              <FormControlLabel
                label=""
                control={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px", ml: 2
                    }}
                  >
                    <Checkbox
                      checked={editGuardarComoPlantilla}
                      onChange={(e) => setEditGuardarComoPlantilla(e.target.checked)}
                      icon={
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            border: "2px solid #8F4D63",
                          }}
                        />
                      }
                      checkedIcon={
                        <Box
                          sx={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "4px",
                            backgroundColor: "#8F4D63",
                            border: "2px solid #8F4D63",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            component="span"
                            sx={{
                              color: "#FFFFFF",
                              fontSize: "13px",
                              fontWeight: "bold",
                              lineHeight: "1",
                              fontFamily: "Poppins, sans-serif",
                            }}
                          >
                            ✓
                          </Box>
                        </Box>
                      }
                      sx={{
                        color: "#8F4D63",
                        "&.Mui-checked": { color: "#8F4D63" },
                        alignSelf: "flex-start",
                        padding: 0,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "Poppins",
                        fontSize: "16px",
                        color: "#8F4D63",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Guardar como plantilla
                    </Typography>
                  </Box>
                }
                sx={{ mt: 1.5, mb: 1 }}
              />

              <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', color: "#330F1B", fontWeight: 500, mb: 1 }}>
                Nombre
              </Typography>
              <TextField
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                fullWidth
                sx={{
                  width: "340px", height: "54",
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontFamily: 'Poppins'
                  }
                }}
                InputProps={{
                  endAdornment: (
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
                            color: "#574B4F",
                            whiteSpace: "pre-line",
                            transform: "translate(-1px, -15px)",
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
                            padding: 0
                          }
                        }
                      }}
                    >
                      <InputAdornment position="end">
                        <img
                          src={isEditNameInvalid ? infoiconerror : infoicon}
                          alt="info-icon"
                          style={{ width: 24, height: 24 }}
                        />
                      </InputAdornment>
                    </Tooltip>
                  )
                }}
              />

            </Box>
          )}

          {editActiveStep === 2 && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', ml: 7 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '18px', fontWeight: 500, mb: 2 }}>
                Configuraciones avanzadass
              </Typography>
              <RadioGroup
                row
                value={tipoNumero}
                onChange={(e) => setTipoNumero(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel
                  value="corto"
                  control={
                    <Radio
                      sx={{
                        color: '#330F1B', // color cuando no está seleccionado
                        '&.Mui-checked': {
                          color: '#8F4D63', // color circulito seleccionado
                        },
                      }}
                    />
                  }
                  label="Número corto"
                  sx={{
                    mr: 4,
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Poppins',
                      color: tipoNumero === 'corto' ? '#8F4D63' : '#330F1B', // texto cambia con selección
                    },
                  }}
                />
                <FormControlLabel
                  value="largo"
                  control={
                    <Radio
                      sx={{
                        color: '#330F1B',
                        '&.Mui-checked': {
                          color: '#8F4D63',
                        },
                      }}
                    />
                  }
                  label="Número largo"
                  sx={{
                    '& .MuiFormControlLabel-label': {
                      fontFamily: 'Poppins',
                      color: tipoNumero === 'largo' ? '#8F4D63' : '#330F1B',
                    },
                  }}
                />
              </RadioGroup>

              {/* Flash Message */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center', width: "584px", height: "57px",
                  border: '1px solid #E6E4E4',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  opacity: tipoNumero === 'largo' ? 0.5 : 1,
                  backgroundColor: flashEnabled ? '#FFFFFF' : '#FFFFFF',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                  <Typography
                    sx={{
                      fontFamily: 'Poppins',
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#330F1B',
                    }}
                  >
                    Mensaje flash
                  </Typography>
                  <Tooltip
                    placement="right"
                    title={(
                      <Box sx={{
                        fontFamily: 'Poppins', fontSize: '14px',
                        color: '#000000', opacity: 0.7,
                      }}>
                        · Configuración que define<br />
                        cuántas veces se reciclarán<br />
                        automáticamente los registros de<br />
                        la campaña.<br />
                        Pueden ser todos los registros o<br />
                        solo los no contactados,<br />
                        incluyendo los de máquina/<br />
                        buzón.
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
                            offset: [104, -260] //  [horizontal, vertical]
                          }
                        }
                      ]
                    }}
                  >
                    <img
                      src={infoicon}
                      alt="info"
                      style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                    />
                  </Tooltip>
                </Box>
                <Switch
                  checked={flashEnabled}
                  disabled={tipoNumero === 'largo'}
                  onChange={(e) => setFlashEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#8F4D63',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#8F4D63',
                    },
                  }}
                />
              </Box>
              {/* ANI */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  minHeight: "57px",
                  border: '1px solid #E6E4E4',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: aniEnabled ? '#FFFFFF' : '#FFFFFF',
                  opacity: tipoNumero === 'corto' ? 0.5 : 1,
                  mb: 2,
                  gap: 1, // espacio entre los dos bloques
                }}
              >
                {/* Primer bloque: texto + tooltip + switch */}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Personalizar ANI
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={aniEnabled}
                    disabled={tipoNumero === 'corto'}
                    onChange={(e) => setAniEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Segundo bloque: Select, visible solo si el switch está activado */}
                {aniEnabled && (
                  <Box sx={{ mt: 1 }}>
                    <Select
                      fullWidth
                      value={selectedAni}
                      onChange={(e) => setSelectedAni(e.target.value)}
                      disabled={!aniEnabled}
                      displayEmpty
                      renderValue={(selected) =>
                        selected ? (
                          <span style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#786E71' }}>
                            {selected}
                          </span>
                        ) : (
                          <span style={{ fontFamily: 'Poppins', fontSize: '12px', color: '#786E71' }}>
                            Seleccionar
                          </span>
                        )
                      }
                      sx={{
                        backgroundColor: '#FFFFFF',
                        fontFamily: 'Poppins',
                        fontSize: '12px', // también puedes poner aquí, pero lo controlamos mejor en renderValue
                        borderRadius: '8px',
                        height: '40px',
                        width: '200px',
                        border: '1px solid #9B9295',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#D6CED2',
                          borderWidth: '1px',
                        },
                      }}
                    >
                      {aniOptions.map((option) => (
                        <MenuItem
                          key={option}
                          value={option}
                          sx={{
                            fontFamily: 'Poppins',
                            fontSize: '12px',
                            color: '#786E71',
                            '&:hover': {
                              backgroundColor: '#F2EBED',
                            },
                          }}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>




                  </Box>
                )}
              </Box>

              {/* Reciclar */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  border: '1px solid #D6CED2',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: recycleEnabled ? '#FFFFFF' : '#FFFFFF',
                  mb: 2,
                  gap: 2,
                }}
              >
                {/* Bloque 1: Texto + tooltip + switch */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Reciclar registros automáticamente
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={recycleEnabled}
                    onChange={(e) => setRecycleEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Bloque 2: Visible solo si switch está activado */}
                {recycleEnabled && (
                  <Box sx={{ display: 'flex', gap: 6 }}>
                    {/* Box A: Tipo de registros */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1 }}>
                        Tipo de registros
                      </Typography>
                      <RadioGroup
                        value={recycleType}
                        onChange={(e) => setRecycleType(e.target.value)}
                      >
                        <FormControlLabel
                          value="todos"
                          control={
                            <Radio
                              sx={{
                                color: '#574B4F', // color normal del circulito
                                '&.Mui-checked': {
                                  color: '#8F4D63', // color cuando está seleccionado
                                },
                              }}
                            />
                          }
                          label="Todos"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontFamily: 'Poppins',
                              fontSize: '16px',
                              color: recycleType === 'todos' ? '#8F4D63' : '#574B4F', // color texto seleccionado
                            },
                          }}
                        />
                        <FormControlLabel
                          value="rechazados"
                          control={
                            <Radio
                              sx={{
                                color: '#330F1B',
                                '&.Mui-checked': {
                                  color: '#8F4D63',
                                },
                              }}
                            />
                          }
                          label="Rechazados"
                          sx={{
                            '& .MuiFormControlLabel-label': {
                              fontFamily: 'Poppins',
                              fontSize: '16px',
                              color: recycleType === 'rechazados' ? '#8F4D63' : '#574B4F',
                            },
                          }}
                        />
                      </RadioGroup>

                    </Box>

                    {/* Box B: Incluir no contactados */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: "130px" }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1, textAlign: "center" }}>
                        Incluir registros no contactados
                      </Typography>
                      <Checkbox
                        checked={includeUncontacted}
                        onChange={(e) => setIncludeUncontacted(e.target.checked)}
                        sx={{
                          color: '#330F1B', // color del cuadro cuando está desmarcado
                          '&.Mui-checked': {
                            color: '#8F4D63', // color cuando está marcado
                          },
                        }}
                      />

                    </Box>

                    {/* Box C: Número de reciclajes */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '14px', fontFamily: 'Poppins', mb: 1 }}>
                        Número de reciclajes
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                          onClick={() => setRecycleCount((prev) => Math.max(1, prev - 1))}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={recycleCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) setRecycleCount(val);
                          }}
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                          sx={{ width: 60, textAlign: 'center', mx: 1 }}
                        />
                        <IconButton
                          onClick={() => setRecycleCount((prev) => prev + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Listas negras */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: "584px",
                  border: '1px solid #D6CED2',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  mb: 2,
                  gap: 2,
                }}
              >
                {/* Primer Box: Título + tooltip + switch */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: 'Poppins',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#330F1B',
                      }}
                    >
                      Listas Negras
                    </Typography>
                    <Tooltip
                      placement="right"
                      title={(
                        <Box sx={{
                          fontFamily: 'Poppins', fontSize: '14px',
                          color: '#000000', opacity: 0.7,
                        }}>
                          · Configuración que define<br />
                          cuántas veces se reciclarán<br />
                          automáticamente los registros de<br />
                          la campaña.<br />
                          Pueden ser todos los registros o<br />
                          solo los no contactados,<br />
                          incluyendo los de máquina/<br />
                          buzón.
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
                              offset: [104, -260] //  [horizontal, vertical]
                            }
                          }
                        ]
                      }}
                    >
                      <img
                        src={infoicon}
                        alt="info"
                        style={{ width: '24px', height: '24px', pointerEvents: 'auto', cursor: 'default' }}
                      />
                    </Tooltip>
                  </Box>

                  <Switch
                    checked={blacklistEnabled}
                    onChange={(e) => setBlacklistEnabled(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#8F4D63',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#8F4D63',
                      },
                    }}
                  />
                </Box>

                {/* Segundo Box: Buscador + tabla */}
                {blacklistEnabled && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Buscador */}
                    <Box
                      display="flex"
                      alignItems="center"
                      sx={{
                        backgroundColor: "#FFFFFF",
                        border: searchTermBlacklist ? "1px solid #7B354D" : "1px solid #9B9295",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        width: "100%",
                        maxWidth: "360px",
                        height: "40px",
                      }}
                    >
                      <img
                        src={seachicon}
                        alt="Buscar"
                        style={{
                          marginRight: "8px",
                          width: "18px",
                          height: "18px",
                          filter: searchTermBlacklist
                            ? "invert(19%) sepia(34%) saturate(329%) hue-rotate(312deg) brightness(91%) contrast(85%)"
                            : "none",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Buscar listas negras"
                        value={searchTermBlacklist}
                        onChange={(e) => setSearchTermBlacklist(e.target.value)}
                        style={{
                          border: "none",
                          outline: "none",
                          width: "100%",
                          fontSize: "16px",
                          fontFamily: "Poppins, sans-serif",
                          color: searchTermBlacklist ? "#7B354D" : "#9B9295",
                          backgroundColor: "transparent",
                        }}
                      />
                      {searchTermBlacklist && (
                        <img
                          src={iconclose}
                          alt="Limpiar búsqueda"
                          style={{
                            marginLeft: "8px",
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSearchTermBlacklist('')}
                        />
                      )}
                    </Box>

                    {/* Tabla */}
                    <Box sx={{ maxHeight: "191px", overflowY: "auto", border: "1px solid #D6CED2", borderRadius: "8px" }}>
                      <table style={{ width: "100%", fontFamily: 'Poppins', fontSize: "14px", borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left', padding: '2px 4px', width: '30%' }}>Nombre</th>
                            <th style={{ textAlign: 'left', padding: '4px 6px', width: '35%' }}>Creación</th>
                            <th style={{ textAlign: 'left', padding: '4px 6px', width: '35%' }}>Expiración</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBlackLists.map((list) => (
                            <tr key={list.id}>
                              <td style={{ padding: '2px 4px' }}>
                                <Checkbox
                                  checked={selectedBlackListIds.includes(list.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedBlackListIds(prev => [...prev, list.id]);
                                    } else {
                                      setSelectedBlackListIds(prev => prev.filter(id => id !== list.id));
                                    }
                                  }}
                                  sx={{
                                    color: '#8F4D63',
                                    '&.Mui-checked': { color: '#8F4D63' },
                                  }}
                                />
                                {list.name}
                              </td>
                              <td style={{ padding: '2px 4px' }}>{list.creationDate || 'NA'}</td>
                              <td style={{ padding: '2px 4px' }}>{list.expirationDate || 'NA'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Box>
                  </Box>
                )}
              </Box>

            </Box>
          )}

        </Box>


        {/*Botones Cancelar / Atras / Siguiente */}
        <DialogActions
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "24px",
            justifyContent: "space-between",
            borderTop: "1px solid #E0E0E0",
            backgroundColor: "#FFF",
          }}
        >
          {/* Botón Cancelar a la izquierda */}
          <Button
            variant="outlined"
            onClick={handleCloseEditModal}
            sx={{
              width: "118px",
              height: "36px",
              border: "1px solid #CCCFD2",
              borderRadius: "4px",
              color: "#833A53",
              backgroundColor: "transparent",
              fontFamily: "Poppins",
              fontWeight: "500",
              fontSize: "14px",
              letterSpacing: "1.12px",
              "&:hover": {
                backgroundColor: "#f3e6eb",
                color: "#833A53",
              },
            }}
          >
            Cancelar
          </Button>

          {/* Botones Atrás y Siguiente a la derecha */}
          <Box sx={{ display: "flex", gap: "20px" }}>
            {editActiveStep > -1 && (
              <Button
                onClick={handleAtrasEditar}
                sx={{
                  width: "118px",
                  height: "36px",
                  border: "1px solid #CCCFD2",
                  borderRadius: "4px",
                  color: "#833A53",
                  backgroundColor: "transparent",
                  fontFamily: "Poppins",
                  fontWeight: "500",
                  fontSize: "14px",
                  letterSpacing: "1.12px",
                  "&:hover": {
                    backgroundColor: "#f3e6eb",
                  },
                }}
              >
                Atrás
              </Button>
            )}

            <Button
              variant="contained"
              onClick={handleContinuarEditar}
              sx={{
                width: "118px",
                height: "36px",
                background: "#833A53",
                border: "1px solid #D4D1D1",
                borderRadius: "4px",
                color: "#FFFFFF",
                fontFamily: "Poppins",
                fontWeight: "500",
                fontSize: "14px",
                letterSpacing: "1.12px",
              }}
            >
              {editActiveStep === 2 || (editActiveStep === 0) ? "Cargar" : "Siguiente"}

            </Button>
          </Box>
        </DialogActions>


      </Dialog>

      <Dialog open={openDuplicateModal} onClose={() => setOpenDuplicateModal(false)} maxWidth="sm" fullWidth>
        <Box sx={{ fontFamily: 'Poppins' }}>
          <DialogTitle sx={{
            fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', display: 'flex', mt: "4px",
            justifyContent: 'space-between', alignItems: 'center', textTransform: 'none',
          }}>
            Duplicar campaña SMS
            <IconButton onClick={() => setOpenDuplicateModal(false)}>
              <CloseIcon sx={{ position: "absolute", color: '#A6A6A6', marginTop: "-19px", marginLeft: "15px" }} />
            </IconButton>
          </DialogTitle>

          <Divider />

          <DialogContent sx={{ maxHeight: '60vh', overflowY: 'auto', paddingTop: 2, ml: 1 }}>
            <Typography sx={{
              fontSize: '16px', fontFamily: 'Poppins',
              fontWeight: 500, marginBottom: 1
            }}>Nombre</Typography>
            <TextField
              placeholder="Nombre de la nueva campaña"
              fullWidth
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              error={isDuplicateNameInvalid}
              helperText={
                duplicateName.length > 40
                  ? "Máximo 40 caracteres"
                  : !/^[a-zA-Z0-9ñÑ ]+$/.test(duplicateName)
                    ? "Formato inválido"
                    : ""
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: 'Poppins', width: "340px"
                }
              }}
              FormHelperTextProps={{
                sx: {
                  position: "absolute",
                  fontFamily: 'Poppins',
                  fontSize: '12px',
                  color: '#D01247', mt: 7.5, ml: 1.5

                }
              }}
              InputProps={{
                endAdornment: (
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
                          color: "#574B4F",
                          whiteSpace: "pre-line",
                          transform: "translate(-1px, -15px)",
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
                          padding: 0
                        }
                      }
                    }}
                  >
                    <InputAdornment position="end">
                      <img
                        src={isDuplicateNameInvalid ? infoiconerror : infoicon}
                        alt="info-icon"
                        style={{ width: 24, height: 24 }}
                      />
                    </InputAdornment>
                  </Tooltip>
                )
              }}
            />

            <Typography sx={{
              fontSize: '16px', fontWeight: 500, fontFamily: 'Poppins',
              marginBottom: 1, mt: 3.5
            }}>Seleccionar de 1 a 5 horarios</Typography>
            <Box
              sx={{
                backgroundColor: '#F9F4F6',
                padding: '16px',
                borderRadius: '8px',
                mb: 2
              }}
            >
              {duplicateHorarios.map((horario, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2
                  }}
                >
                  <TextField
                    key={`start-duplicate-${index}`}
                    variant="outlined"
                    placeholder="Inicia"
                    value={
                      horario.start
                        ? horario.start.toLocaleString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : ''
                    }
                    onClick={(e) => {
                      setCalendarAnchor(e.currentTarget);
                      setCalendarOpen(true);
                      setCalendarTarget('start');
                      setCurrentHorarioIndex(index);
                    }}
                    sx={{
                      width: '262px', height: '56px', backgroundColor: '#FFFFFF',
                      '& .MuiInputBase-input': {
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                      },

                    }}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            sx={{ padding: 0 }}
                            onClick={(e) => {
                              setCalendarAnchor(e.currentTarget);
                              setCalendarOpen(true);
                              setCalendarTarget('start');
                              setCurrentHorarioIndex(index);
                            }}
                          >
                            <CalendarTodayIcon sx={{ width: 15, height: 15, color: '#8F4D63' }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    key={`end-duplicate-${index}`}
                    variant="outlined"
                    placeholder="Termina"
                    value={
                      horario.end
                        ? horario.end.toLocaleString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                        : ''
                    }
                    onClick={(e) => {
                      setCalendarAnchor(e.currentTarget);
                      setCalendarOpen(true);
                      setCalendarTarget('end');
                      setCurrentHorarioIndex(index);
                    }}
                    sx={{
                      width: '262px', height: '56px', backgroundColor: '#FFFFFF',
                      '& .MuiInputBase-input': {
                        fontFamily: 'Poppins',
                        fontSize: '14px',
                      },
                    }}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            sx={{ padding: 0 }}
                            onClick={(e) => {
                              setCalendarAnchor(e.currentTarget);
                              setCalendarOpen(true);
                              setCalendarTarget('end');
                              setCurrentHorarioIndex(index);
                            }}
                          >
                            <CalendarTodayIcon sx={{ width: 15, height: 15, color: '#8F4D63' }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  {/* Botón eliminar horario */}
                  {duplicateHorarios.length > 1 && (
                    <IconButton onClick={() => handleRemoveDuplicateHorario(index)}>
                      <RemoveIcon sx={{ color: '#6C3A52', width: 20, height: 20, ml: -2, mr: -1.5 }} />
                    </IconButton>
                  )}

                  {/* Botón añadir horario (solo en el último si hay menos de 5) */}
                  {index === duplicateHorarios.length - 1 && duplicateHorarios.length < 5 && (
                    <IconButton onClick={handleAddDuplicateHorario}>
                      <AddIcon sx={{ color: '#6C3A52', width: 20, height: 20, ml: -1.5, mr: -1.5 }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>


            <FormControlLabel
              control={
                <Checkbox
                  checked={duplicateAutoStart}
                  onChange={(e) => setDuplicateAutoStart(e.target.checked)}
                  icon={
                    <Box
                      sx={{
                        ml: 2.5, mt: -1,
                        width: "20px",
                        height: "20px",
                        borderRadius: "4px",
                        border: "2px solid #8F4D63",
                      }}
                    />
                  }
                  checkedIcon={
                    <Box
                      sx={{
                        width: '24px',
                        height: '24px',
                        position: 'relative',
                        marginTop: '0px',
                        marginLeft: '-2px',
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
                    color: "#8F4D63",
                    "&.Mui-checked": { color: "#8F4D63" },
                    alignSelf: "flex-start",
                    padding: 0,
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontFamily: "Poppins",
                    fontSize: "16px",
                    color: "#8F4D63",
                    whiteSpace: "nowrap", ml: 1.5, mt: -1
                  }}
                >
                  Iniciar campaña automáticamente
                </Typography>
              }
              sx={{ marginTop: 2 }}
            />
          </DialogContent>

          <Divider />

          <DialogActions
            sx={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 40
            }}
          >
            <SecondaryButton onClick={() => setOpenDuplicateModal(false)} text='Cancelar' />
            <MainButton onClick={handleConfirmDuplicateCampaign} text='Duplicar' />
          </DialogActions>
        </Box>
      </Dialog>
      {showChipBarAdd && (
        <Chipbar
          message={messageChipBar}
          buttonText="Cerrar"
          onClose={() => setShowChipBarAdd(false)}
        />
      )}
    </Box>
  );

};

export default Campains;
