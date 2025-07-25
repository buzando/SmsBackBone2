import { Box, Divider, Typography, Select, MenuItem, TextField, InputLabel, FormControl, IconButton, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from '../assets/icon-punta-flecha-bottom.svg';
import axios from "axios";
import { useState, useEffect } from "react";
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecondaryButton from '../components/commons/SecondaryButton'
import MainButton from '../components/commons/MainButton'
import { Modal } from "@mui/material";
import infoicon from '../assets/Icon-info.svg';
import infoiconerror from '../assets/Icon-infoerror.svg';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import SnackBar from "../components/commons/ChipBar";
import ModalError from "../components/commons/ModalError";
export interface Template {
  id: number;
  name: string;
  message: string;
  creationDate: string; // DateTime en C# es string en JS/TS
  idRoom: number;
}


import Iconeyesopen from '../assets/Iconeyesopen.svg';

export default function TestSMS() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [numbersData, setNumbersData] = useState<{ id: number; number: string }[]>([]);
  const [Loading, setLoading] = useState(false);
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const isViewButtonEnabled = toNumber && selectedTemplateId;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: number, name: string, message: string } | null>(null);
  const [toNumberError, setToNumberError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showChipBar, setshowChipBar] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    fetchNumbersAndTemplates();
  }, []);

  const fetchNumbersAndTemplates = async () => {
    try {
      // Obtenemos email para números
      const user = JSON.parse(localStorage.getItem('userData') || '{}')?.id; // Ajusta aquí si necesitas

      // Obtenemos salaId para plantillas
      const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

      if (!user || !salaId) {
        return;
      }

      // Petición de plantillas
      const templatesRequestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_GETTEMPLATESBYROOM}${salaId}`;
      const templatesResponse = await axios.get(templatesRequestUrl);


      // Petición de números
      const numbersRequestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_NUMBERS}${user}`;
      const numbersResponse = await axios.get(numbersRequestUrl);


      setNumbersData(numbersResponse.data);
      setTemplates(templatesResponse.data);
    } catch (error) {
      console.error('Error al cargar números o plantillas', error);
    }
  };


  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleSend = async () => {
    if (!fromNumber || !toNumber || (message.length === 0 && !selectedTemplateId)) {
      console.error('Faltan datos obligatorios');
      return;
    }
    const clientId = JSON.parse(localStorage.getItem('userData') || '{}')?.clientId;
    try {
      const payload = {
        from: fromNumber,
        to: toNumber,
        message: message || null,
        templateId: selectedTemplateId || null,
        clientID: clientId || null
      };

      const requestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_MESSAGE_SEND}`;
      const response = await axios.post(requestUrl, payload);

      if (response.status === 200) {
        setshowChipBar(true);
      } else {
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setIsErrorModalOpen(true);
    }
  };


  return (
    <div style={{ padding: '14px', marginTop: '-70px', marginLeft: "40px", maxWidth: "1180px", height: "715px" }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            p: 0,
            mr: 1,
            ml: '-30px',
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
          {t('pages.testSMS.title')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', position: "absolute", ml: "980px", mt: "-50px" }}>
        <FormControl size="small" sx={{ width: '150px', backgroundColor: "#ffffff" }}>
          <Select value={language} onChange={handleLanguageChange}>
            <MenuItem value="es" sx={{ fontFamily: "Poppins" }}>Español</MenuItem>
            <MenuItem value="en" sx={{ fontFamily: "Poppins" }}>English</MenuItem>
            <MenuItem value="pt" sx={{ fontFamily: "Poppins" }}>Português</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2.5, mt: 2 }} />

      <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "18px", color: "#330F1B", mb: 1 }}>
        {t('pages.testSMS.smsTestDescription')}
      </Typography>

      <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", mb: 2, color: "#574B4F", mt: 2 }}>
        {t('pages.testSMS.smsSelectDescription')}
      </Typography>

      <Box display="flex" gap={4} mb={3} sx={{ alignItems: "left" }}>
        <Box>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "16px", fontWeight: 500, mb: 1, color: "#330F1B" }}>
            {t('pages.testSMS.from')}
          </Typography>

          <FormControl sx={{
            backgroundColor: "#ffffff",
            fontFamily: "Poppins",
            borderRadius: "8px",
            border: "1px solid #9B9295",
            width: "220px", height: "40px"
          }}>
            <Select defaultValue="" value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
              displayEmpty sx={{
                color: "#786E71",
                borderRadius: '8px',
                fontFamily: 'Poppins',
                fontSize: '14px', mt: "-8px",
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '& fieldset': {
                  border: 'none',
                },
              }}
            >
              <MenuItem value="" sx={{ fontFamily: "Poppins", color: "#786E71", mt: "-8px", fontSize: "12px" }}>
                <em>{t('pages.testSMS.numberPlaceholder')}</em>
              </MenuItem>
              {numbersData.map((number) => (
                <MenuItem key={number.id} value={number.id} sx={{ fontFamily: "Poppins", color: "#786E71", mt: "-8px" }}>
                  {number.number}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </Box>

        <Box sx={{}}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              fontWeight: 500,
              mb: 1,
              color: toNumberError ? "#D32F2F" : "#330F1B",
            }}
          >
            {t('pages.testSMS.to')}
          </Typography>

          <TextField fullWidth
            value={toNumber}
            placeholder="5255"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setToNumber(value);
              setToNumberError(value.length !== 10);
            }}
            sx={{ width: "221px", height: "54px" }}
            error={toNumberError}
            helperText={toNumberError ? t('pages.testSMS.invalidNumber') : " "}

            InputProps={{
              sx: {
                backgroundColor: "#FFFFFF", fontFamily: "Poppins",
                '&::placeholder': {
                  color: '#786E71',
                  opacity: 0.8,
                  fontFamily: "Poppins"
                }
              },
              endAdornment: (
                <Tooltip
                  placement="bottom-end"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "transparent",
                        padding: 0,
                      },
                    },
                  }}
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
                        transform: "translate(-10px, -22px)",
                        borderColor: "#00131F3D",
                        borderStyle: "solid",
                        borderWidth: "1px"
                      }}
                    >
                      <>
                        • Solo caracteres numéricos<br />
                        • El teléfono debe incluir el<br />
                        código del país
                      </>
                    </Box>
                  }
                >
                  <img
                    src={toNumberError ? infoiconerror : infoicon}
                    alt="info"
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                </Tooltip>
              )
            }}
          />

        </Box>
      </Box>

      <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", mb: 3, color: "#786E71" }}>
        {t('pages.testSMS.writeMessageOrSelect')}
      </Typography>

      <Box display="flex" gap={2}>
        <Box flex={1}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              fontWeight: 500,
              mb: 1,
              color: messageError ? "#D32F2F" : "#330F1B",
            }}
          >
            {t('pages.testSMS.message')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={message}
            placeholder={t('pages.testSMS.writeMessageOrSelect')}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              setMessageError(value.length === 0 || value.length > 160); // 🔥 Error si está vacío o pasa 160 caracteres
            }}
            disabled={!!selectedTemplate}
            error={messageError}
            helperText={messageError ? t('pages.testSMS.invalidFormat') : " "}
            InputProps={{
              sx: {
                backgroundColor: "#FFFFFF", fontFamily: "Poppins", borderRadius: "2px",
                border: "1px solid #C6BFC299", width: "545px", height: "123px"
              },
              endAdornment: (
                <Tooltip
                  placement="bottom-end"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        backgroundColor: "transparent",
                        padding: 0,
                      },
                    },
                  }}
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
                        transform: "translate(-10px, -22px)",
                        borderColor: "#00131F3D",
                        borderStyle: "solid",
                        borderWidth: "1px"
                      }}
                    >
                      <>
                        • Solo caracteres alfanuméricos<br />
                        • Longitud máxima de 160<br />
                        caracteres
                      </>
                    </Box>
                  }
                >
                  <img
                    src={messageError ? infoiconerror : infoicon}
                    alt="info"
                    style={{ width: 24, height: 24, marginLeft: "5px", marginTop: "-65px" }}
                  />
                </Tooltip>
              )
            }}
          />
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "12px",
              color: "#A1A1A1",
              mt: -2, ml: 1.5
            }}
          >
            {t('pages.testSMS.charactersCounter', { count: message.length })}
          </Typography>
        </Box>

        <Box flex={1}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "16px", fontWeight: 500, mb: 1 }}>
            {t('pages.testSMS.template')}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <FormControl sx={{
              backgroundColor: "#ffffff",
              fontFamily: "Poppins",
              borderRadius: "8px",
              border: "1px solid #9B9295",
              width: "220px", height: "40px"
            }}>
              <Select defaultValue="" value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                displayEmpty sx={{
                  color: "#786E71",
                  borderRadius: '8px',
                  fontFamily: 'Poppins',
                  fontSize: '14px', mt: "-8px",
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                }}
              >
                <MenuItem value="" sx={{ fontFamily: "Poppins", color: "#786E71", mt: "-8px", fontSize: "12px" }}>
                  <em>{t('pages.testSMS.selectMessagePlaceholder')}</em>
                </MenuItem>
                {templates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <IconButton
              sx={{ p: 1 }}
              onClick={() => {
                if (!isViewButtonEnabled) return;

                const template = templates.find((t) => t.id === Number(selectedTemplateId));

                console.log("Plantilla seleccionada:", template); // ⬅️ Agrega esto

                if (template) {
                  setSelectedTemplate(template);
                  setTimeout(() => setIsPreviewOpen(true), 0); // ⬅️ Esto también ayuda a que se renderice bien
                }
              }}
              disabled={!isViewButtonEnabled}
            >
              <Tooltip title="Visualizar" arrow placement="top"
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
                        offset: [0, -12] // [horizontal, vertical] — aquí movemos 3px hacia abajo
                      }
                    }
                  ]
                }}
              >
                <img
                  src={Iconeyesopen}
                  style={{ color: isViewButtonEnabled ? "#7B354D" : "#C4C4C4" }} />
              </Tooltip>
            </IconButton>
          </Box>
        </Box>


      </Box>
      <Box display="flex" justifyContent="flex-end" mt={-8} gap={3} marginRight={"310px"} >
        <SecondaryButton
          text={t('pages.testSMS.clear')}
          onClick={() => {
            setFromNumber('');
            setToNumber('');
            setSelectedTemplateId('');
            setMessage('');
            setMessageError(false);
            setToNumberError(false);
          }}
        />
        <MainButton
          text={t('pages.testSMS.send')}
          onClick={() => {
            setIsPreviewOpen(true);
          }}
          isLoading={Loading}
          disabled={
            toNumberError || messageError || message.length === 0
          }
        />
      </Box>
      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}>
        <Box
          sx={{
            width: 500,
            backgroundColor: 'white',
            borderRadius: 2,
            p: 3,
            mx: 'auto',
            my: '10%',
            fontFamily: 'Poppins',
            outline: 'none',
          }}
        >
          <Typography fontWeight="600" fontSize="18px" color="#330F1B" mb={2}>
            {t('pages.testSMS.preview')} <span style={{ color: '#7B354D' }}>{selectedTemplate?.name || ''}</span>
          </Typography>

          <Box sx={{ backgroundColor: '#F8E7EC', borderRadius: 2, padding: 2, mb: 3 }}>
            <Typography fontSize="15px" color="#3A3A3A">
              {selectedTemplate?.message || ''}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <SecondaryButton text={t('pages.testSMS.cancel')} onClick={() => setIsPreviewOpen(false)} />
            <MainButton text={t('pages.testSMS.send')} onClick={() => {
              setIsPreviewOpen(false);
            }} isLoading={Loading} />
          </Box>
        </Box>
      </Modal>

      {showChipBar && (
        <SnackBar
          message="Se han enviado los mensajes correctamente"
          buttonText="Cerrar"
          onClose={() => setshowChipBar(false)}
        />
      )}
      <ModalError
        isOpen={isErrorModalOpen}
        title="Error al enviar"
        message="Intentelo mas tarde"
        buttonText="Cerrar"
        onClose={() => setIsErrorModalOpen(false)}
      />
    </div>
  );
}
