import React, { useState, useEffect } from 'react';
import { Popper, Paper, Box, Typography } from "@mui/material";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './CSS/DatePicker.css';
import { es } from 'date-fns/locale';
import Iconarrow from '../../assets/icon-punta-flecha-bottom.svg'
import MainButton from '../commons/MainButton'
import SecondaryButton from '../commons/SecondaryButton'
import { GlobalStyles } from "@mui/material";
import { addMonths, subMonths } from "date-fns";
import { startOfDay } from 'date-fns';
interface DatePickerProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onApply: (start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number) => void;
    onClose: () => void;
    placement?:
    | 'bottom-start'
    | 'bottom'
    | 'bottom-end'
    | 'top-start'
    | 'top'
    | 'top-end';
    resetSignal?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
    open,
    anchorEl,
    onApply,
    onClose,
    placement = 'bottom-start',
    resetSignal,
    minDate,
    maxDate
}) => {
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const handleNextMonth = () => {
        setShownDate(prev => addMonths(prev, 1));
    };

    const handlePrevMonth = () => {
        setShownDate(prev => subMonths(prev, 1));
    };

    // Estados para las horas y minutos de inicio y fin
    const [startHours, setStartHours] = useState(0);
    const [startMinutes, setStartMinutes] = useState(0);
    const [endHours, setEndHours] = useState(0);
    const [endMinutes, setEndMinutes] = useState(0);
    const [shownDate, setShownDate] = useState(new Date());
    console.log("shownDate:", shownDate); // 👈 aquí
    const handleApply = () => {
        onApply(dateRange[0].startDate, dateRange[0].endDate, startHours, startMinutes, endHours, endMinutes);
        onClose();
    };
    const [isValidRange, setIsValidRange] = useState(false);

    useEffect(() => {
        if (resetSignal) {
            setDateRange([{ startDate: new Date(), endDate: new Date(), key: 'selection' }]);
            setStartHours(0);
            setStartMinutes(0);
            setEndHours(0);
            setEndMinutes(0);
        }
    }, [resetSignal]);
    return (
        <>
            <GlobalStyles
                styles={{
                    /* =========================
                       HEADER MES
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
                       DÍA BASE
                       ========================= */
                    ".rdrDay": {
                        outline: "none !important",
                        background: "transparent !important",
                        position: "relative",
                    },

                    ".custom-datepicker-scale .rdrDay": {
                        color: "#574B4F !important",
                    },

                    /* =========================
                       HOY
                       ========================= */
                    ".rdrDayToday": {
                        background: "transparent !important",
                    },

                    ".rdrDayToday::after": {
                        display: "none !important",
                    },

                    ".rdrDayToday .rdrDayNumber": {
                        background: "transparent !important",
                        position: "relative",
                        zIndex: "3",
                    },

                    ".rdrDayToday .rdrDayNumber span": {
                        background: "transparent !important",
                        color: "#574B4F !important",
                        fontWeight: "500 !important",
                        boxShadow: "none !important",
                        position: "relative",
                        zIndex: "4",
                    },

                    /* =========================
                       HOVER SOLO EN EL DÍA ACTUAL
                       ========================= */
                    ".rdrDayHovered": {
                        background: "transparent !important",
                    },

                    ".rdrDayHovered .rdrDayNumber": {
                        background: "transparent !important",
                        position: "relative",
                        zIndex: "3",
                    },

                    ".rdrDayHovered .rdrDayNumber span": {
                        color: "#8F4D63 !important",
                        background: "transparent !important",
                        position: "relative",
                        zIndex: "4",
                    },

                    /* círculo hover SOLO para el día bajo el mouse */
                    ".rdrDayHovered::before": {
                        content: '""',
                        position: "absolute",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        border: "1px solid #C9A9B5",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                        zIndex: "1",
                    },

                    /* =========================
                       PREVIEW DEL RANGO
                       ========================= */
                    ".rdrDayStartPreview, .rdrDayEndPreview": {
                        border: "1px solid #C9A9B5 !important",
                        borderRadius: "50% !important",
                        width: "32px !important",
                        height: "32px !important",
                        position: "absolute !important",
                        top: "50% !important",
                        left: "50% !important",
                        transform: "translate(-50%, -50%) !important",
                        background: "transparent !important",
                        zIndex: "1",
                    },

                    /* quitar el borde de todos los días intermedios */
                    ".rdrDayInPreview": {
                        border: "none !important",
                        background: "#F3E7EC !important",
                    },

                    ".rdrDayStartPreview::after, .rdrDayEndPreview::after": {
                        display: "none !important",
                    },

                    /* =========================
                       RANGO SELECCIONADO
                       ========================= */
                    ".custom-datepicker-scale .rdrInRange": {
                        background: "#F3E7EC !important",
                    },

                    ".custom-datepicker-scale .rdrStartEdge, .custom-datepicker-scale .rdrEndEdge": {
                        background: "#8F4D63 !important",
                        borderRadius: "50% !important",
                        width: "32px !important",
                        height: "32px !important",
                        left: "50% !important",
                        top: "50% !important",
                        transform: "translate(-50%, -50%) !important",
                        position: "absolute !important",
                        zIndex: "2 !important",
                        boxShadow: "none !important",
                    },

                    ".custom-datepicker-scale .rdrStartEdge ~ .rdrDayNumber, .custom-datepicker-scale .rdrEndEdge ~ .rdrDayNumber": {
                        position: "relative",
                        zIndex: "4 !important",
                        background: "transparent !important",
                    },

                    ".custom-datepicker-scale .rdrStartEdge ~ .rdrDayNumber span, .custom-datepicker-scale .rdrEndEdge ~ .rdrDayNumber span": {
                        color: "#FFFFFF !important",
                        fontWeight: "700 !important",
                        background: "transparent !important",
                    },

                    /* =========================
                       DÍAS DE OTRO MES
                       ========================= */
                    ".custom-datepicker-scale .rdrDayPassive .rdrDayNumber span": {
                        color: "#C6BFC2 !important",
                        fontWeight: "400 !important",
                    },

                    /* =========================
                       FIX ALINEACIÓN
                       ========================= */
                    ".custom-datepicker-scale .rdrDayNumber": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        position: "relative",
                        zIndex: "3",
                        background: "transparent !important",
                    },

                    ".custom-datepicker-scale .rdrDayNumber span": {
                        lineHeight: "12px !important",
                        display: "inline-block",
                        position: "relative",
                        top: "-3px",
                        background: "transparent !important",
                    },

                    /* =========================
                       CALENDARIO WRAPPER
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
                modifiers={[
                    {
                        name: 'preventOverflow',
                        options: { boundary: 'window', padding: 10 },
                    },
                    {
                        name: 'offset',
                        options: { offset: [0, -10] },
                    },
                ]}
            >
                <div onClick={(e) => {
                    e.stopPropagation();
                    if ((e as any).nativeEvent?.stopImmediatePropagation) {
                        (e as any).nativeEvent.stopImmediatePropagation();
                    }
                }}>
                    <Paper elevation={3} className="custom-datepicker-scale">
                        <div className="date-picker-divider"></div>
                        <div style={{ position: 'relative', zIndex: 20 }}>
                            <img
                                src={Iconarrow}
                                alt="Mes anterior"
                                /*onClick={() => {
                                    const newDate = new Date(shownDate);
                                    newDate.setMonth(shownDate.getMonth() - 1);
                                    setShownDate(newDate);
                                }}*/
                                onClick={handlePrevMonth}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    left: '12px',
                                    transform: 'rotate(270deg)',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    zIndex: 999,
                                    pointerEvents: 'auto',
                                }}
                            />

                            <img
                                src={Iconarrow}
                                alt="Mes siguiente"
                                /*onClick={() => {
                                    const newDate = new Date(shownDate);
                                    newDate.setMonth(shownDate.getMonth() + 1);
                                    setShownDate(newDate);
                                }}*/
                                onClick={handleNextMonth}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '12px',
                                    transform: 'rotate(90deg)',
                                    width: '20px',
                                    height: '20px',
                                    cursor: 'pointer',
                                    zIndex: 999,
                                    pointerEvents: 'auto',
                                }}
                            />

                        </div>

                        {/* Selector de Fecha */}
                        <DateRange
                            minDate={minDate}
                            maxDate={maxDate}
                            //key={shownDate.toString()}
                            key={`${shownDate.getFullYear()}-${shownDate.getMonth()}`}
                            locale={es}
                            editableDateInputs={true}
                            onChange={(item) => {
                                const start = item.selection.startDate;
                                const end = item.selection.endDate;

                                setDateRange([{
                                    startDate: start || new Date(),
                                    endDate: end || new Date(),
                                    key: 'selection',
                                }]);

                                setIsValidRange(!!start && !!end);
                            }}
                            //moveRangeOnFirstSelection={false}
                            moveRangeOnFirstSelection={false}
                            retainEndDateOnFirstSelection={true}
                            preventSnapRefocus={true}
                            ranges={dateRange}
                            months={2}
                            direction="horizontal"
                            showDateDisplay={false}
                            showMonthAndYearPickers={false}
                            shownDate={shownDate}
                            //onShownDateChange={(date) => setShownDate(date)}
                            onShownDateChange={() => { }}
                        />

                        <Box
                            sx={{
                                width: "calc(100% + 0px)",
                                mb: "20px",
                                borderTop: "1px solid #E6E4E4CC",
                            }}
                        />

                        {/* Controles de Hora */}
                        <Box style={{ display: 'flex', justifyContent: 'space-around', marginTop: '-20px' }}>
                            {[{
                                title: "HORA INICIAL",
                                hourValue: startHours,
                                setHour: setStartHours,
                                minuteValue: startMinutes,
                                setMinute: setStartMinutes
                            }, {
                                title: "HORA FINAL",
                                hourValue: endHours,
                                setHour: setEndHours,
                                minuteValue: endMinutes,
                                setMinute: setEndMinutes
                            }].map((time, index) => (
                                <Box key={index} style={{ textAlign: 'center' }}>
                                    <Box sx={{ textAlign: "center" }}>
                                        <Box sx={{ mt: 1 }}>
                                            <Typography style={{
                                                textAlign: 'center',
                                                fontFamily: "Poppins, sans-serif",
                                                letterSpacing: '1.12px',
                                                color: '#574B4F',
                                                textTransform: 'uppercase',
                                                opacity: 1,
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                marginBottom: '-2px'
                                            }}>
                                                {time.title}
                                            </Typography>
                                        </Box>
                                        <Box style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '50px' }}>
                                            {[{
                                                value: time.hourValue,
                                                setter: time.setHour,
                                                label: "Hora"
                                            }, {
                                                value: time.minuteValue,
                                                setter: time.setMinute,
                                                label: "Minuto"
                                            }].map((unit, i) => (
                                                <Box key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <input
                                                            type="text"
                                                            value={unit.value.toString().padStart(2, '0')}
                                                            readOnly
                                                            style={{
                                                                textAlign: 'center',
                                                                width: '42px',
                                                                height: '42px',
                                                                border: `1px solid ${unit.value !== 0 ? '#8C3F56' : '#C6BFC2'}`,
                                                                borderRadius: '8px',
                                                                background: '#dfdfdf',
                                                                fontSize: '20px',
                                                                fontWeight: 600,
                                                                color: `${unit.value !== 0 ? '#8C3F56' : '#574B4F'}`,
                                                                outline: "none"
                                                            }} />
                                                        <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '-8px' }}>
                                                            <button onClick={() => unit.setter((prev) => (prev + 1) % (i === 0 ? 24 : 60))}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', marginBottom: '-10px' }}>
                                                                <img src={Iconarrow} alt="Subir" style={{ width: '16px', height: '16px' }} />
                                                            </button>
                                                            <button onClick={() => unit.setter((prev) => (prev - 1 + (i === 0 ? 24 : 60)) % (i === 0 ? 24 : 60))}
                                                                style={{ border: 'none', background: 'none', cursor: 'pointer', marginTop: '-10px' }}>
                                                                <img src={Iconarrow} alt="Bajar" style={{ transform: 'rotate(180deg)', width: '16px', height: '16px' }} />
                                                            </button>
                                                        </Box>
                                                        {i === 0 && <span style={{ fontSize: '18px', fontWeight: 600, color: '#574B4F' }}>:</span>}
                                                    </Box>
                                                    <Typography style={{
                                                        textAlign: 'center',
                                                        font: 'normal normal normal 12px/54px Poppins',
                                                        letterSpacing: '0px',
                                                        color: '#574B4F',
                                                        opacity: 1,
                                                        fontSize: '12px',
                                                        marginTop: '-25px',
                                                        marginLeft: '-50px'
                                                    }}>
                                                        {unit.label}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                width: "calc(100% + 0px)",
                                mt: "-10px",
                                mb: "20px",
                                border: "1px solid #E6E4E4CC",
                            }}
                        />

                        {/* Botones de acción */}
                        <Box sx={{
                            display: "flex", justifyContent: "center", mt: "-8px", marginBottom: '20px',
                        }}>
                            <Box
                                sx={{
                                    marginBottom: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center', gap: '400px'
                                }}
                            >
                                <SecondaryButton text='Cancelar' onClick={onClose} />
                                <MainButton text="Aceptar" onClick={handleApply} width='auto' disabled={!isValidRange} />
                            </Box>
                        </Box>
                    </Paper>
                </div>
            </Popper>
        </>
    );
};

export default DatePicker;
