import React, { useState } from 'react';
import { Popper, Paper } from "@mui/material";
import { Calendar } from "react-date-range";
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './CSS/DatePicker.css';
import { es } from 'date-fns/locale';
import Iconarrow from '../../assets/icon-punta-flecha-bottom.svg';
import MainButton from '../commons/MainButton';
import SecondaryButton from '../commons/SecondaryButton';
import { PopperProps } from '@mui/material/Popper';

interface DatePickerProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    onApply: (date: Date, hour: number, minute: number) => void;
    onClose: () => void;
    placement?: 'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end';
    modifiers?: PopperProps['modifiers'];
    offset?: [number, number];
    currentHorarioIndex?: number | null;
    calendarTarget?: 'start' | 'end' | null;
}

const DatePickerOneDate: React.FC<DatePickerProps> = ({
    open, anchorEl, onApply, onClose, placement = 'bottom-start', modifiers, offset = [0, 10]
}) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);
    const [focusedDate, setFocusedDate] = useState(new Date());

    const handleApply = () => {
        onApply(selectedDate, hour, minute);
        onClose();
    };

    return (
        <Popper
            open={open}
            anchorEl={anchorEl}
            placement={placement}
            sx={{ zIndex: 1500 }}
            modifiers={modifiers ?? [
                { name: 'preventOverflow', options: { boundary: 'window', padding: 10 } },
                { name: 'offset', options: { offset: offset ?? [0, 10] } }
            ]}
        >
            <Paper elevation={3} className="date-picker-container">
                <div className="date-picker-divider"></div>

                {/* Selector de Fecha única */}
                <div style={{ position: 'relative' }}>
                    <img
                        src={Iconarrow}
                        alt="Mes anterior"
                        onClick={() => {
                            const newDate = new Date(focusedDate);
                            newDate.setMonth(focusedDate.getMonth() - 1);
                            setFocusedDate(newDate);
                        }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            left: '12px', // 👈 ahora sí está a la izquierda
                            transform: 'rotate(270deg)', // 👈 apuntando hacia la izquierda
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
                            const newDate = new Date(focusedDate);
                            newDate.setMonth(focusedDate.getMonth() + 1);
                            setFocusedDate(newDate);
                        }}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '12px',
                            transform: 'rotate(90deg)', // apuntando hacia la derecha
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            zIndex: 10,
                        }}
                    />

                    <Calendar
                        key={focusedDate.toString()}
                        locale={es}
                        date={selectedDate}
                        onChange={setSelectedDate}
                        months={2}
                        direction="horizontal"
                        showDateDisplay={false}
                        showMonthAndYearPickers={false}
                        shownDate={focusedDate}
                        onShownDateChange={(date) => setFocusedDate(date)}
                    />
                </div>



                <hr className="date-picker-divider" />

                {/* Controles de HORA FINAL */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-10px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{
                            textAlign: 'center',
                            font: 'normal normal medium 14px/54px Poppins',
                            letterSpacing: '1.12px',
                            color: '#574B4F',
                            textTransform: 'uppercase',
                            opacity: 1,
                            fontSize: '14px',
                            marginBottom: '5px'
                        }}>HORA FINAL</p>


                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {[{ value: hour, setter: setHour, label: 'hora' }, { value: minute, setter: setMinute, label: 'minuto' }]
                                .map((unit, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    value={unit.value.toString().padStart(2, '0')}
                                                    readOnly
                                                    style={{
                                                        textAlign: 'center',
                                                        width: '50px',
                                                        height: '40px',
                                                        border: '1px solid #ccc',
                                                        borderRadius: '4px',
                                                        background: '#F2F2F2',
                                                        fontSize: '20px',
                                                        fontWeight: 600,
                                                        color: '#574B4F'
                                                    }}
                                                />
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '-35px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '2px'
                                                }}>
                                                    <button onClick={() => unit.setter((prev) => (prev + 1) % (i === 0 ? 24 : 60))}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                                        <img src={Iconarrow} alt="Subir" style={{ width: '12px', height: '12px' }} />
                                                    </button>
                                                    <button onClick={() => unit.setter((prev) => (prev - 1 + (i === 0 ? 24 : 60)) % (i === 0 ? 24 : 60))}
                                                        style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                                        <img src={Iconarrow} alt="Bajar" style={{ transform: 'rotate(180deg)', width: '12px', height: '12px' }} />
                                                    </button>
                                                </div>
                                            </div>

                                            {i === 0 && (
                                                <span style={{
                                                    fontSize: '24px',
                                                    fontWeight: 600,
                                                    color: '#574B4F',
                                                    margin: '0 6px',
                                                    alignSelf: 'center'
                                                }}>:</span>
                                            )}
                                        </div>

                                        <span style={{
                                            fontFamily: 'Poppins',
                                            fontSize: '12px',
                                            marginTop: '6px',
                                            color: '#574B4F',
                                            textTransform: 'lowercase',
                                            marginLeft: '-20px'
                                        }}>{unit.label}</span>
                                    </div>

                                ))}
                        </div>
                    </div>
                </div>

                <hr className="time-divider" />

                {/* Botones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <SecondaryButton text='Cancelar' onClick={onClose} />
                    <MainButton text="Aceptar" onClick={handleApply} />
                </div>
            </Paper>
        </Popper>
    );
};

export default DatePickerOneDate;
