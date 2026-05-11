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

import {
  addMonths,
  subMonths,
  isBefore,
  isAfter,
  startOfDay,
  startOfMonth,
} from "date-fns";

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
  initialDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
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
  minDate,
  maxDate,
}) => {
  const minAllowedDate = useMemo(
    () => (minDate ? startOfDay(minDate) : null),
    [minDate]
  );

  const maxAllowedDate = useMemo(
    () => (maxDate ? startOfDay(maxDate) : null),
    [maxDate]
  );

  const base = useMemo(() => {
    const initial = initialDate ?? new Date();
    const normalized = startOfDay(initial);

    if (minAllowedDate && isBefore(normalized, minAllowedDate)) {
      return minAllowedDate;
    }

    if (maxAllowedDate && isAfter(normalized, maxAllowedDate)) {
      return maxAllowedDate;
    }

    return initial;
  }, [initialDate, minAllowedDate, maxAllowedDate]);

  const [selectedDate, setSelectedDate] = useState<Date>(base);
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const [focusedDate, setFocusedDate] = useState<Date>(base);

  const minFocusMonth = useMemo(
    () => (minAllowedDate ? startOfMonth(minAllowedDate) : null),
    [minAllowedDate]
  );

  const maxFocusMonth = useMemo(
    () => (maxAllowedDate ? startOfMonth(maxAllowedDate) : null),
    [maxAllowedDate]
  );

  useEffect(() => {
    if (!open) return;

    setSelectedDate(base);
    setFocusedDate(base);
    setHour(0);
    setMinute(0);
  }, [open, base]);

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
    const nextFocus = subMonths(focusedDate, 1);

    if (
      minAllowedDate &&
      minFocusMonth &&
      isBefore(nextFocus, minFocusMonth)
    ) {
      setFocusedDate(minFocusMonth);
      return;
    }

    setFocusedDate(nextFocus);
  };

  const goNextMonth = () => {
    const nextFocus = addMonths(focusedDate, 1);

    if (
      maxAllowedDate &&
      maxFocusMonth &&
      isAfter(nextFocus, maxFocusMonth)
    ) {
      setFocusedDate(maxFocusMonth);
      return;
    }

    setFocusedDate(nextFocus);
  };

  return (
    <>
      <GlobalStyles
        styles={{
          ".rdrMonthAndYearWrapper": {
            fontFamily: "Poppins, sans-serif",
            fontWeight: "400 !important",
            textTransform: "lowercase !important",
          },

          ".rdrMonthAndYearWrapper span": {
            fontWeight: "400 !important",
            textTransform: "lowercase !important",
          },

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

          ".rdrDayToday": {
            background: "transparent !important",
          },

          ".rdrDayToday .rdrDayNumber": {
            background: "transparent !important",
          },

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

          ".date-picker-container": {
            borderRadius: "8px",
            border: "1px solid #C6BFC2",
            boxShadow: "0px 8px 16px #00131F29",
            padding: "12px 12px 10px 12px",
            fontFamily: "Poppins, sans-serif",
          },

          ".rdrMonth": {
            padding: "0 10px 6px 10px",
          },

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

          ".rdrDay": {
            outline: "none !important",
            background: "transparent !important",
          },

          ".date-picker-container .rdrDay": {
            color: "#574B4F !important",
          },

          ".rdrDayHovered .rdrDayNumber span": {
            color: "#8F4D63 !important",
          },

          ".date-picker-container .rdrDayStartPreview, .date-picker-container .rdrDayEndPreview, .date-picker-container .rdrDayInPreview":
            {
              border: "none !important",
              color: "transparent !important",
              opacity: "0 !important",
            },

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

          ".date-picker-container .rdrDay .rdrSelected ~ .rdrDayNumber span":
            {
              color: "#FFFFFF !important",
              fontWeight: "700 !important",
            },

          ".date-picker-container .rdrDay.rdrDayToday .rdrSelected ~ .rdrDayNumber span":
            {
              color: "#FFFFFF !important",
              fontWeight: "700 !important",
            },

          ".date-picker-container .rdrDay.rdrDayPassive .rdrDayNumber span":
            {
              color: "#C6BFC2 !important",
              fontWeight: "400 !important",
            },

          ".date-picker-container .rdrDay.rdrDayPassive .rdrSelected ~ .rdrDayNumber span":
            {
              color: "#FFFFFF !important",
              fontWeight: "700 !important",
            },

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
            {
              name: "preventOverflow",
              options: {
                boundary: "window",
                padding: 10,
              },
            },
            {
              name: "offset",
              options: {
                offset: offset ?? [0, 10],
              },
            },
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
              key={`${focusedDate.getFullYear()}-${focusedDate.getMonth()}`}
              locale={es}
              date={selectedDate}
              onChange={(date) => {
                const d = startOfDay(date as Date);

                if (minAllowedDate && isBefore(d, minAllowedDate)) {
                  setSelectedDate(minAllowedDate);
                  setFocusedDate(minAllowedDate);
                  return;
                }

                if (maxAllowedDate && isAfter(d, maxAllowedDate)) {
                  setSelectedDate(maxAllowedDate);
                  setFocusedDate(maxAllowedDate);
                  return;
                }

                setSelectedDate(d);
              }}
              months={2}
              direction="horizontal"
              showDateDisplay={false}
              showMonthAndYearPickers={false}
              shownDate={focusedDate}
              onShownDateChange={(date) =>
                setFocusedDate(date as Date)
              }
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

          {/* Hora */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: "-2px",
              pb: "8px",
            }}
          >
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
                  gap: "18px",
                }}
              >
                {/* Horas */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      mr: "6px",
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
                        border:
                          hour !== 0
                            ? "1px solid #8C3F56"
                            : "1px solid #C6BFC2",
                        borderRadius: "8px",
                        background: "#dfdfdf",
                        fontSize: "18px",
                        fontWeight: 700,
                        color:
                          hour !== 0
                            ? "#8C3F56"
                            : "#574B4F",
                        outline: "none",
                      }}
                    />

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
                            transform: "rotate(0deg)",
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>

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
                            transform: "rotate(180deg)",
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

                {/* : */}
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

                {/* Minutos */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      value={minute.toString().padStart(2, "0")}
                      readOnly
                      style={{
                        textAlign: "center",
                        width: "42px",
                        height: "42px",
                        border:
                          minute !== 0
                            ? "1px solid #8C3F56"
                            : "1px solid #C6BFC2",
                        borderRadius: "8px",
                        background: "#dfdfdf",
                        fontSize: "18px",
                        fontWeight: 700,
                        color:
                          minute !== 0
                            ? "#8C3F56"
                            : "#574B4F",
                        outline: "none",
                      }}
                    />

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
                            transform: "rotate(0deg)",
                            opacity: 0.85,
                            display: "block",
                          }}
                        />
                      </button>

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
                            transform: "rotate(180deg)",
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: "6px",
            }}
          >
            <SecondaryButton
              text="Limpiar"
              onClick={onClose}
            />

            <MainButton
              text="Aplicar"
              onClick={handleApply}
            />
          </Box>
        </Paper>
      </Popper>
    </>
  );
};

export default DatePickerOneDate;