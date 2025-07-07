import React, { useState } from 'react';
import { Popper, Paper } from "@mui/material";
import { DateRange } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './CSS/DatePicker.css';
import { es } from 'date-fns/locale';
import Iconarrow from '../../assets/icon-punta-flecha-bottom.svg'
import MainButton from '../commons/MainButton'
import SecondaryButton from '../commons/SecondaryButton'
interface DatePickerProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onApply: (start: Date, end: Date, startHour: number, startMinute: number, endHour: number, endMinute: number) => void;
    onClose: () => void;
    placement?: 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';
}

const DatePicker: React.FC<DatePickerProps> = ({ open, anchorEl, onApply, onClose, placement = 'bottom-start' }) => {
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    // Estados para las horas y minutos de inicio y fin
    const [startHours, setStartHours] = useState(0);
    const [startMinutes, setStartMinutes] = useState(0);
    const [endHours, setEndHours] = useState(0);
    const [endMinutes, setEndMinutes] = useState(0);
    const [shownDate, setShownDate] = useState(new Date());
    const handleApply = () => {
        onApply(dateRange[0].startDate, dateRange[0].endDate, startHours, startMinutes, endHours, endMinutes);
        onClose();
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement={placement}
            modifiers={[
                {
                    name: 'preventOverflow',
                    options: { boundary: 'window', padding: 10 },
                },
                {
                    name: 'offset',
                    options: { offset: [0, 10] },
                },
            ]}
        >
            <Paper elevation={3} className="date-picker-container">
                <div className="date-picker-divider"></div>
                <div style={{ position: 'relative' }}>
                    <img
                        src={Iconarrow}
                        alt="Mes anterior"
                        onClick={() => {
                            const newDate = new Date(shownDate);
                            newDate.setMonth(shownDate.getMonth() - 1);
                            setShownDate(newDate);
                        }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            left: '12px',
                            transform: 'rotate(270deg)',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    />

                    <img
                        src={Iconarrow}
                        alt="Mes siguiente"
                        onClick={() => {
                            const newDate = new Date(shownDate);
                            newDate.setMonth(shownDate.getMonth() + 1);
                            setShownDate(newDate);
                        }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '12px',
                            transform: 'rotate(90deg)',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    />

                </div>

                {/* Selector de Fecha */}
                <DateRange
                  key={shownDate.toString()}
                    locale={es}
                    editableDateInputs={true}
                    onChange={(item) => {
                        setDateRange([{
                            startDate: item.selection.startDate || new Date(),
                            endDate: item.selection.endDate || new Date(),
                            key: 'selection',
                        }]);
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={dateRange}
                    months={2}
                    direction="horizontal"
                    showDateDisplay={false}
                    showMonthAndYearPickers={false}
                    shownDate={shownDate}
                    onShownDateChange={(date) => setShownDate(date)}
                />


                <hr className="date-picker-divider" />

                {/* Controles de Hora */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '-10px' }}>
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
                        <div key={index} style={{ textAlign: 'center' }}>
                            <p style={{
                                textAlign: 'center',
                                font: 'normal normal medium 14px/54px Poppins',
                                letterSpacing: '1.12px',
                                color: '#574B4F',
                                textTransform: 'uppercase',
                                opacity: 1,
                                fontSize: '14px',
                                marginBottom: '-5px'
                            }}>{time.title}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                {[{
                                    value: time.hourValue,
                                    setter: time.setHour,
                                    label: "hora"
                                }, {
                                    value: time.minuteValue,
                                    setter: time.setMinute,
                                    label: "minuto"
                                }].map((unit, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <input type="text" value={unit.value.toString().padStart(2, '0')} readOnly
                                                style={{
                                                    textAlign: 'center', width: '40px', height: '40px',
                                                    border: '1px solid #ccc', borderRadius: '4px', background: '#F2F2F2',
                                                    fontSize: '20px', fontWeight: 600, color: '#574B4F'
                                                }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: '-6px' }}>
                                                <button onClick={() => unit.setter((prev) => (prev + 1) % (i === 0 ? 24 : 60))}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', marginBottom: '-10px' }}>
                                                    <img src={Iconarrow} alt="Subir" style={{ width: '14px', height: '14px' }} />
                                                </button>
                                                <button onClick={() => unit.setter((prev) => (prev - 1 + (i === 0 ? 24 : 60)) % (i === 0 ? 24 : 60))}
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', marginTop: '-10px' }}>
                                                    <img src={Iconarrow} alt="Bajar" style={{ transform: 'rotate(180deg)', width: '14px', height: '14px' }} />
                                                </button>
                                            </div>
                                            {i === 0 && <span style={{ fontSize: '18px', fontWeight: 600, color: '#574B4F' }}>:</span>}
                                        </div>
                                        <span style={{
                                            textAlign: 'center',
                                            font: 'normal normal normal 12px/54px Poppins',
                                            letterSpacing: '0px',
                                            color: '#574B4F',
                                            opacity: 1,
                                            fontSize: '12px',
                                            marginTop: '-25px',
                                            marginRight: '65px'
                                        }}>{unit.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="time-divider" /> {/* Línea horizontal debajo de Hora Inicial y Hora Final */}

                {/* Botones de acción */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <SecondaryButton text='Cancelar' onClick={onClose} />
                    <MainButton text="Aceptar" onClick={handleApply} width='auto' />
                </div>
            </Paper>
        </Popper>
    );
};

export default DatePicker;
