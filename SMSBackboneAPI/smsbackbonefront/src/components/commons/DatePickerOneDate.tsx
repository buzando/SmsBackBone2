import React, { useEffect, useMemo, useState } from "react";
import { Popper, Paper, Box } from "@mui/material";
import { PopperProps } from "@mui/material/Popper";
import { GlobalStyles } from "@mui/material";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./CSS/DatePicker.css";
import { es } from "date-fns/locale";
import Iconarrow from "../../assets/icon-punta-flecha-bottom.svg";
import MainButton from "../commons/MainButton";
import SecondaryButton from "../commons/SecondaryButton";
import { addMonths, isBefore, startOfDay, startOfMonth } from "date-fns";

interface DatePickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onApply: (date: Date, hour: number, minute: number) => void;
  onClose: () => void;
  label?: string;
  placement?:
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "top-start"
  | "top"
  | "top-end";
  modifiers?: PopperProps["modifiers"];
  offset?: [number, number];
  // Fecha inicial que viene del horario (start/end)
  initialDate?: Date | null;
}

const DatePickerOneDate: React.FC<DatePickerProps> = ({
  open,
  anchorEl,
  onApply,
  onClose,
  placement = "bottom-start",
  modifiers,
  offset = [0, 10],
  initialDate,
  label = "HORA FINAL",
}) => {
  const base = useMemo(() => initialDate ?? new Date(), [initialDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(base);
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [focusedDate, setFocusedDate] = useState<Date>(base);

  const today = useMemo(() => startOfDay(new Date()), []);
  const minFocusMonth = useMemo(() => startOfMonth(today), [today]);

  // Cada vez que se abre el popper, sincronizamos con la fecha que venga del padre
  useEffect(() => {
    if (!open) return;

    const b = initialDate ?? new Date();
    setSelectedDate(b);
    setFocusedDate(b);
    setHour(0);
    setMinute(0);
  }, [open, initialDate]);

  const handleApply = () => {
    onApply(selectedDate, hour, minute);
    onClose();
  };

  const inc = (isHour: boolean) => {
    if (isHour) setHour((prev) => (prev + 1) % 24);
    else setMinute((prev) => (prev + 1) % 60);
  };

  const dec = (isHour: boolean) => {
    if (isHour) setHour((prev) => (prev - 1 + 24) % 24);
    else setMinute((prev) => (prev - 1 + 60) % 60);
  };

  const goPrevMonth = () => {
    const nextFocus = addMonths(focusedDate, -1);
    // 🔒 opcional: no permitir ir a meses anteriores al mes actual
    setFocusedDate(isBefore(nextFocus, minFocusMonth) ? minFocusMonth : nextFocus);
  };

  const goNextMonth = () => {
    setFocusedDate(addMonths(focusedDate, 1));
  };

  return (
    <>
      <GlobalStyles
        styles={{
          /* =========================
             MESES: minúsculas + sin negritas (FIX)
             ========================= */
          ".rdrMonthAndYearWrapper": {
            fontFamily: "Poppins, sans-serif",
            fontWeight: "400 !important",
            textTransform: "lowercase !important",
          },
          ".rdrMonthAndYearWrapper span": {
            fontWeight: "400 !important",
            textTransform: "lowercase !important",
          },

          /* OJO: .rdrMonthName es el título del mes (el que ves como MAR 2026) */
          ".rdrMonthName": {
            fontFamily: "Poppins, sans-serif",
            fontSize: "12px",
            fontWeight: "400 !important",
            color: "#574B4F",
            textTransform: "lowercase !important",
            letterSpacing: "1px",
            paddingBottom: "8px",
            marginBottom: "8px",
            borderBottom: "1px solid #E6E4E4CC",
          },

          /* =========================
             HOY: quitar estilo especial SOLO cuando NO está seleccionado
             ========================= */
          ".rdrDayToday": { background: "transparent !important" },
          ".rdrDayToday .rdrDayNumber": { background: "transparent !important" },
          ".rdrDayToday .rdrDayNumber span": {
            background: "transparent !important",
            fontWeight: "500 !important",
            color: "#574B4F !important",
            boxShadow: "none !important",
          },
          ".rdrDayToday .rdrDayNumber span:after": {
            display: "none !important",
            content: '""',
            background: "transparent !important",
          },

          /* =========================
             CONTENEDOR
             ========================= */
          ".date-picker-container": {
            borderRadius: "8px",
            border: "1px solid #C6BFC2",
            boxShadow: "0px 8px 16px #00131F29",
            padding: "12px 12px 10px 12px",
            fontFamily: "Poppins, sans-serif",
          },

          /* =========================
             HEADER (layout del mes)
             ========================= */
          ".rdrMonth": { padding: "0 10px 6px 10px" },

          /* =========================
             TIPOGRAFÍA
             ========================= */
          ".rdrWeekDay": {
            fontFamily: "Poppins, sans-serif",
            color: "#807D7E",
            fontSize: "11px",
            fontWeight: 500,
          },
          ".rdrDayNumber span": {
            fontFamily: "Poppins, sans-serif",
            color: "#574B4F",
            fontSize: "12px",
            fontWeight: 500,
          },

          /* =========================
             BASE DÍA
             ========================= */
          ".rdrDay": {
            outline: "none !important",
            background: "transparent !important",
          },

          /* Mata inline azul (style="color: rgb(61,145,255)") */
          ".date-picker-container .rdrDay": {
            color: "#574B4F !important",
          },

          /* Hover */
          ".rdrDayHovered .rdrDayNumber span": {
            color: "#8F4D63 !important",
          },

          /* Quitar preview azul */
          ".date-picker-container .rdrDayStartPreview, .date-picker-container .rdrDayEndPreview, .date-picker-container .rdrDayInPreview": {
            border: "none !important",
            color: "transparent !important",
            opacity: "0 !important",
          },

          /* =========================
             SELECCIÓN REAL
             ========================= */
          ".date-picker-container .rdrDay .rdrSelected": {
            background: "#8F4D63 !important",
            opacity: "1 !important",
            zIndex: "1 !important",
            width: "32px !important",
            height: "32px !important",
            left: "50% !important",
            top: "50% !important",
            transform: "translate(-50%, -40%) !important",
            borderRadius: "50% !important",
          },

          ".date-picker-container .rdrDay .rdrSelected ~ .rdrDayNumber": {
            position: "relative",
            zIndex: "2 !important",
          },
          ".date-picker-container .rdrDay .rdrSelected ~ .rdrDayNumber span": {
            color: "#FFFFFF !important",
            fontWeight: "700 !important",
          },

          /* Hoy seleccionado */
          ".date-picker-container .rdrDay.rdrDayToday .rdrSelected ~ .rdrDayNumber span": {
            color: "#FFFFFF !important",
            fontWeight: "700 !important",
          },

          /* =========================
             PASSIVE (otro mes)
             ========================= */
          ".date-picker-container .rdrDay.rdrDayPassive .rdrDayNumber span": {
            color: "#C6BFC2 !important",
            fontWeight: "400 !important",
          },
          ".date-picker-container .rdrDay.rdrDayPassive .rdrSelected ~ .rdrDayNumber span": {
            color: "#FFFFFF !important",
            fontWeight: "700 !important",
          },

          /* =========================
             FIX FINAL: que no se bajen los números
             ========================= */
          ".date-picker-container .rdrDayNumber": {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          },
          ".date-picker-container .rdrDayNumber span": {
            lineHeight: "12px !important",
            display: "inline-block",
            position: "relative",
            top: "-1px",
          },

          /* =========================
             OCULTAR PICKERS
             ========================= */
          ".rdrCalendarWrapper": {
            fontFamily: "Poppins, sans-serif",
          },
        }}
      />
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        sx={{ zIndex: 1500 }}
        modifiers={
          modifiers ?? [
            { name: "preventOverflow", options: { boundary: "window", padding: 10 } },
            { name: "offset", options: { offset: offset ?? [0, 10] } },
          ]
        }
      >
        <Paper elevation={3} className="date-picker-container">
          <Box sx={{ position: "relative" }}>
            {/* Mes anterior */}
            <img
              src={Iconarrow}
              alt="Mes anterior"
              onClick={goPrevMonth}
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                transform: "rotate(270deg)",
                width: "18px",
                height: "18px",
                cursor: "pointer",
                zIndex: 10,
                opacity: 0.85,
              }}
            />

            {/* Mes siguiente */}
            <img
              src={Iconarrow}
              alt="Mes siguiente"
              onClick={goNextMonth}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                transform: "rotate(90deg)",
                width: "18px",
                height: "18px",
                cursor: "pointer",
                zIndex: 10,
                opacity: 0.85,
              }}
            />

            <Calendar
              locale={es}
              date={selectedDate}
              onChange={(date) => {
                const d = startOfDay(date as Date);

                // ✅ No dejar seleccionar fechas pasadas (pero sin romper navegación)
                if (isBefore(d, today)) {
                  setSelectedDate(today);
                  setFocusedDate(today);
                  return;
                }

                setSelectedDate(d);
              }}
              months={2}
              direction="horizontal"
              showDateDisplay={false}
              showMonthAndYearPickers={false}
              shownDate={focusedDate}
              onShownDateChange={(date) => setFocusedDate(date as Date)}
            // ❌ Quitamos minDate porque te bloquea la navegación de mes
            // minDate={startOfDay(new Date())}
            />
          </Box>

          <Box
            sx={{
              width: "calc(100% + 24px)",
              ml: "-12px",
              mt: "10px",
              mb: "10px",
              borderTop: "1px solid #E6E4E4CC",
            }}
          />

          {/* Controles de HORA FINAL */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: "-2px", pb: "8px" }}>
            <Box sx={{ textAlign: "center" }}>
              <Box
                component="p"
                sx={{
                  textAlign: "center",
                  fontFamily: "Poppins, sans-serif",
                  letterSpacing: "1.12px",
                  color: "#574B4F",
                  textTransform: "uppercase",
                  fontSize: "14px",
                  fontWeight: 600,
                  mb: "6px",
                  mt: 0,
                }}
              >
                {label}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "18px", // más aire entre hora, ":" y minuto
                }}
              >
                {/* Hora */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      mr: "6px", // mueve horas un poquito a la izquierda
                    }}
                  >
                    <input
                      type="text"
                      value={hour.toString().padStart(2, "0")}
                      readOnly
                      style={{
                        textAlign: "center",
                        width: "42px",
                        height: "42px",
                        border: hour !== 0 ? "1px solid #8C3F56" : "1px solid #C6BFC2",
                        borderRadius: "8px",
                        background: "#dfdfdf",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: hour !== 0 ? "#8C3F56" : "#574B4F",
                        outline: "none",
                      }}
                    />

                    {/* Flechas hora */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "1px",
                        right: "-26px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      {/* SUBIR */}
                      <button
                        type="button"
                        onClick={() => inc(true)}
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={Iconarrow}
                          alt="Subir hora"
                          style={{
                            width: "24px",
                            height: "24px",
                            transform: "rotate(0deg)", // ↑ (Iconarrow apunta hacia abajo por default)
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>

                      {/* BAJAR */}
                      <button
                        type="button"
                        onClick={() => dec(true)}
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={Iconarrow}
                          alt="Bajar hora"
                          style={{
                            width: "24px",
                            height: "24px",
                            transform: "rotate(180deg)", // ↓
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>
                    </Box>
                  </Box>

                  <Box
                    component="span"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      mt: "6px",
                      color: "#574B4F",
                      opacity: 0.8,
                    }}
                  >
                    Horas
                  </Box>
                </Box>

                {/* Separador : */}
                <Box
                  component="span"
                  sx={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#574B4F",
                    mt: "-18px",
                    mx: "2px",
                  }}
                >
                  :
                </Box>

                {/* Minuto */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <input
                      type="text"
                      value={minute.toString().padStart(2, "0")}
                      readOnly
                      style={{
                        textAlign: "center",
                        width: "42px",
                        height: "42px",
                        border: minute !== 0 ? "1px solid #8C3F56" : "1px solid #C6BFC2",
                        borderRadius: "8px",
                        background: "#dfdfdf",
                        fontSize: "18px",
                        fontWeight: 700,
                        color: minute !== 0 ? "#8C3F56" : "#574B4F",
                        outline: "none",
                      }}
                    />

                    {/* Flechas minuto */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "1px",
                        right: "-26px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      {/* SUBIR */}
                      <button
                        type="button"
                        onClick={() => inc(false)}
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={Iconarrow}
                          alt="Subir minuto"
                          style={{
                            width: "24px",
                            height: "24px",
                            transform: "rotate(0deg)", // ↑
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>

                      {/* BAJAR */}
                      <button
                        type="button"
                        onClick={() => dec(false)}
                        style={{
                          width: "24px",
                          height: "24px",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={Iconarrow}
                          alt="Bajar minuto"
                          style={{
                            width: "24px",
                            height: "24px",
                            transform: "rotate(180deg)", // ↓
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>
                    </Box>
                  </Box>

                  <Box
                    component="span"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: "12px",
                      mt: "6px",
                      color: "#574B4F",
                      opacity: 0.8,
                    }}
                  >
                    Minutos
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              width: "calc(100% + 24px)",
              ml: "-12px",
              mt: "6px",
              mb: "10px",
              borderTop: "1px solid #E6E4E4CC",
            }}
          />

          {/* Botones */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: "6px" }}>
            <SecondaryButton text="Limpiar" onClick={onClose} />
            <MainButton text="Aplicar" onClick={handleApply} />
          </Box>
        </Paper>
      </Popper>
    </>
  );
};

export default DatePickerOneDate;