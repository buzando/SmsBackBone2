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
export default function TestSMS() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [numbersData, setNumbersData] = useState<{ id: number; number: string }[]>([]);
  const [Loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<{ id: number; name: string; message: string }[]>([]);
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const isViewButtonEnabled = fromNumber && toNumber && selectedTemplateId;
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: number, name: string, message: string } | null>(null);
  const [toNumberError, setToNumberError] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'es');

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  useEffect(() => {
    const fetchNumbersAndTemplates = async () => {
      try {
        // Obtenemos email para números
        const email = JSON.parse(localStorage.getItem('userData') || '{}')?.email; // Ajusta aquí si necesitas

        // Obtenemos salaId para plantillas
        const salaId = JSON.parse(localStorage.getItem('selectedRoom') || '{}')?.id;

        if (!email || !salaId) {
          console.error("Falta email o salaId");
          return;
        }

        // Petición de números
        const numbersRequestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_NUMBERS}${email}`;
        const numbersResponse = await axios.get(numbersRequestUrl);

        // Petición de plantillas
        const templatesRequestUrl = `${import.meta.env.VITE_SMS_API_URL}${import.meta.env.VITE_API_GET_GETTEMPLATESBYROOM}${salaId}`;
        const templatesResponse = await axios.get(templatesRequestUrl);

        setNumbersData(numbersResponse.data);
        setTemplates(templatesResponse.data);
      } catch (error) {
        console.error('Error al cargar números o plantillas', error);
      }
    };

    fetchNumbersAndTemplates();
  }, []);
  const handleLanguageChange = (e: any) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div style={{ padding: '20px', marginTop: '-80px', marginLeft: '40px', maxWidth: '1540px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControl size="small" sx={{ width: '150px', backgroundColor: "#ffffff" }}>
          <Select value={language} onChange={handleLanguageChange}>
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="pt">Português</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            p: 0,
            mr: 1,
            ml: '-28px', // para que flote más a la izquierda si quieres
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

      <Divider sx={{ mb: 2 }} />

      <Typography sx={{ fontFamily: "Poppins", fontWeight: 500, fontSize: "16px", mb: 1 }}>
        {t('pages.testSMS.smsTestDescription')}
      </Typography>

      <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", mb: 2 }}>
        {t('pages.testSMS.smsSelectDescription')}
      </Typography>

      <Box display="flex" gap={2} mb={3}>
        <Box flex={1}>
          <Typography sx={{ fontFamily: "Poppins", fontSize: "16px", fontWeight: 500, mb: 1 }}>
            {t('pages.testSMS.from')}
          </Typography>
          <FormControl sx={{ backgroundColor: "#ffffff", fontFamily: "Poppins", borderRadius: "6px", width: "220px" }}>
            <Select defaultValue="" value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)} displayEmpty sx={{ fontFamily: "Poppins" }}>
              <MenuItem value="">
                <em>{t('pages.testSMS.numberPlaceholder')}</em>
              </MenuItem>
              {numbersData.map((number) => (
                <MenuItem key={number.id} value={number.id} sx={{ fontFamily: "Poppins" }}>
                  {number.number}
                </MenuItem>
              ))}
            </Select>

          </FormControl>
        </Box>

        <Box flex={1}>
          <Typography
            sx={{
              fontFamily: "Poppins",
              fontSize: "16px",
              fontWeight: 500,
              mb: 1,
              color: toNumberError ? "#D32F2F" : "#330F1B", // 🔥 cambia a rojo si hay error
            }}
          >
            {t('pages.testSMS.to')}
          </Typography>

          <TextField fullWidth
            value={toNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // 🔥 Solo deja números
              setToNumber(value);
              setToNumberError(value.length !== 10); // 🔥 Error si no son exactamente 10 dígitos
            }}
            error={toNumberError}
            helperText={toNumberError ? t('pages.testSMS.invalidNumber') : " "}

            InputProps={{
              sx: { backgroundColor: "#f7f7f7" },
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
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        color: "#000000",
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
                    style={{ width: 20, height: 20, marginRight: 8 }}
                  />
                </Tooltip>
              )
            }}
          />

        </Box>
      </Box>

      <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", mb: 2 }}>
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
              color: messageError ? "#D32F2F" : "#330F1B", // 🔥 Se pone rojo si hay error
            }}
          >
            {t('pages.testSMS.message')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            value={message}
            placeholder={t('pages.testSMS.writeMessageOrSelect')}
            onChange={(e) => {
              const value = e.target.value;
              setMessage(value);
              setMessageError(value.length === 0 || value.length > 160); // 🔥 Error si está vacío o pasa 160 caracteres
            }}
            error={messageError}
            helperText={messageError ? t('pages.testSMS.invalidFormat') : " "}
            InputProps={{
              sx: { backgroundColor: "#f7f7f7", fontFamily: "Poppins" },
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
                        fontSize: "13px",
                        fontFamily: "Poppins",
                        color: "#000000",
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
                    style={{ width: 20, height: 20, marginRight: 8 }}
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
              mt: 1,
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
            <FormControl sx={{ flex: 1, }}>
              <Select defaultValue="" value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)} displayEmpty>
                <MenuItem value="">
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
                if (template) {
                  setSelectedTemplate(template);
                  setIsPreviewOpen(true);
                }
              }}
              disabled={!isViewButtonEnabled}
            >
              <VisibilityIcon sx={{ color: isViewButtonEnabled ? "#7B354D" : "#C4C4C4" }} />
            </IconButton>
          </Box>
        </Box>

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
              console.log("Enviando SMS...");
              // Aquí luego puedes hacer la lógica de envío real
              setIsPreviewOpen(false);
            }} />
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
