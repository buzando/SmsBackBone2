import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from 'react-modal';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import '../chooseroom.css'
import { useNavigate } from 'react-router-dom';
import Backdrop from "@mui/material/Backdrop";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import IconCheckBox1 from "../assets/IconCheckBox1.svg";
import SecondaryButton from '../components/commons/SecondaryButton'
import { Divider } from '@mui/material';
import boxopen from '../assets/NoResultados.svg';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

type Room = {
    id: string | number;
    name: string;
    cliente: string;
    description: string;
    credits: number;
    long_sms: number;
    calls: number;
    short_sms: number;
};


const Chooseroom: React.FC = () => {
    const [loading, setLoading] = useState(false);
    Modal.setAppElement('#root');
    /*  let subtitle;*/
    const [modalIsOpen, setIsOpen] = useState(false);
    const [rooms, setrooms] = useState<Room[]>([]);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDontAskAgain(event.target.checked);
    }

    const SaveAutenticator = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);


        try {
            if (dontAskAgain) {

                const usuario = localStorage.getItem("userData");

                const obj = JSON.parse(usuario!);


                const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_AUTENTIFICATIONSAVE_ENDPOINT}?email=${obj.email}`;
                const response = await axios.get(
                    request
                );

                if (response.status === 200) {
                    obj.twoFactorAuthentication = true;
                    localStorage.setItem('userData', JSON.stringify(obj));
                    setLoading(false);
                    closeModal();
                }
            } else {
                closeModal();
            }
        }
        catch {
            console.log(`MODE: ${import.meta.env.MODE}`)
        }

    }

    const GetRooms = async () => {
        setLoading(true);
        const usuario = localStorage.getItem("userData");

        const obj = JSON.parse(usuario!);

        try {
            const request = `${import.meta.env.VITE_SMS_API_URL + import.meta.env.VITE_API_GetRooms}?email=${obj.email}`;
            const response = await axios.get(
                request
            );

            if (response.status === 200) {
                setrooms(response.data);
                localStorage.setItem('ListRooms', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error("Error al obtener las salas", error);
        } finally {
            setLoading(false);
        }

    }
    function openModal() {
        setIsOpen(true);
    }

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    function closeModal() {
        setIsOpen(false);
    }


    useEffect(() => {

        const usuario = localStorage.getItem("userData");

        GetRooms();
        const obj = JSON.parse(usuario!);
        if (!obj.twoFactorAuthentication) {
            openModal();
        }



    }, [])


    const navigate = useNavigate();
    const handleRoomSelection = (room: Room) => {

        localStorage.setItem('selectedRoom', JSON.stringify(room));

        navigate('/');
    };

    return (
        <Box
            className="container"
            sx={{
                backgroundColor: "#F2F2F2",
                minHeight: "100vh",
                padding: "5px",
            }}
        >
            {/* Spinner de pantalla completa */}
            <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <Typography
                variant="h5"
                className="centered-title"
                sx={{
                    textAlign: 'center',
                    fontFamily: 'Poppins',
                    letterSpacing: '0px',
                    color: '#330F1B',
                    opacity: 1,
                    fontSize: '28px',
                    lineHeight: '55px',
                }}
            >
                Seleccionar una sala para continuar
            </Typography>


            <div
                className="search-container"
                style={{
                    width: '430px',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #CED2D54D',
                    borderRadius: '4px',
                    padding: '10px',
                    boxShadow: '0px 4px 4px #E1E4E6',
                    background: '#FFFFFF',
                }}
            >
                <SearchIcon style={{ marginRight: '8px', color: '#8D4B62' }} /> {/* Lupa */}
                <input
                    type="text"
                    placeholder="Buscar"
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        fontSize: '14px',
                        fontFamily: 'Poppins, sans-serif',
                        color: searchTerm ? '#7B354D' : '#574B4F',
                    }}
                />
                {searchTerm && (
                    <CloseIcon
                        onClick={() => setSearchTerm('')}
                        style={{
                            cursor: 'pointer',
                            color: '#8D4B62',
                            marginLeft: '8px',
                        }}
                    />
                )}
            </div>


            {/* Lista de salas */}
            {rooms.filter((room) => {
                const term = searchTerm.toLowerCase();
                const nameWords = room.name.toLowerCase().split(" ");
                return nameWords.some((word) => word.startsWith(term));
            }).length === 0 ? (
                <Box>
                    <Box component="img" src={boxopen} alt="Caja Vacía" sx={{ width: '250px', height: 'auto', mt: 3 }} />
                    <Typography variant="body1" sx={{ textAlign: "center", marginTop: "20px", color: "#833A53", fontFamily: "Poppins" }}>
                        No se encontraron resultados.
                    </Typography>
                </Box>
            ) : (
                rooms
                    .filter((room) => {
                        const term = searchTerm.toLowerCase();
                        const nameWords = room.name.toLowerCase().split(" ");
                        return nameWords.some((word) => word.startsWith(term));
                    })
                    .map((room) => (
                        <div key={room.id} className="room-box"
                            style={{
                                background: "#FFFFFF 0% 0% no-repeat padding-box",
                                boxShadow: "0px 4px 4px #E1E4E6",
                                border: "1px solid #CED2D54D",
                                borderRadius: "4px",
                                opacity: 1,
                                width: "430px",
                                padding: "20px",
                                margin: "10px auto",
                            }}>
                            <div className="room-info">
                                <Box className="icon-container">
                                    <HomeIcon />
                                </Box>
                                <div className="room-details" style={{ marginLeft: "10px" }}>
                                    <h6 style={{ margin: "0", fontSize: "16px", color: "#330F1B" }}>{room.name}</h6>
                                    <p style={{ margin: "0", fontSize: "14px", color: "#8F4D63" }}>{room.cliente}</p>
                                </div>

                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '4px',
                                }}
                            >
                                <span
                                    style={{
                                        textAlign: 'right',
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        fontSize: '12px',
                                        lineHeight: '18px',
                                        letterSpacing: '0px',
                                        color: '#8D4B62',
                                        opacity: 1,
                                    }}
                                >
                                    SMS cortos: {room.short_sms}
                                </span>
                                <span
                                    style={{
                                        textAlign: 'right',
                                        fontFamily: 'Poppins',
                                        fontWeight: '500',
                                        fontSize: '12px',
                                        lineHeight: '18px',
                                        letterSpacing: '0px',
                                        color: '#8D4B62',
                                        opacity: 1,
                                    }}
                                >
                                    SMS largos: {room.long_sms}
                                </span>
                            </div>

                            {/* Botón para seleccionar la sala */}
                            <Button
                                onClick={() => handleRoomSelection(room)}
                                sx={{
                                    minWidth: 'auto',
                                    padding: 0,
                                    color: '#000',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        fontSize: '24px',
                                        lineHeight: 1,
                                    }}
                                >
                                    &gt;
                                </Box>
                            </Button>
                        </div>
                    ))
            )}


            <div>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    style={{
                        content: {
                            ...customStyles.content,
                            maxWidth: "500px",
                            padding: "20px",
                            overflowX: "hidden",
                            boxShadow: "0px 0px 16px #00131F52",
                            borderRadius: "8px"
                        },
                    }}
                    contentLabel="Guardar Información Modal"
                >
                    <Typography
                        variant="h6"
                        sx={{
                            textAlign: "left",
                            fontFamily: "Poppins",
                            fontSize: "20px",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            marginBottom: "16px",
                        }}
                    >
                        Guardar información
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: "left",
                            font: "normal normal normal 16px/20px Poppins",
                            letterSpacing: "0px",
                            color: "#330F1B",
                            opacity: 1,
                            marginBottom: "20px",
                        }}
                    >
                        ¿Desea que guardemos su información para la próxima vez que inicie sesión en este dispositivo?
                    </Typography>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={dontAskAgain}
                                sx={{
                                    color: '#6C3A52',
                                    '&.Mui-checked': { color: '#6C3A52' },

                                }}
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
                                onChange={handleCheckboxChange}
                                color="primary"
                            />

                        }
                        label={
                            <Typography
                                sx={{
                                    color: "#8F4D63",
                                    fontFamily: "Poppins",
                                    fontSize: "16px",
                                    fontWeight: 500
                                }}
                            >
                                No preguntar esto de nuevo
                            </Typography>
                        }
                        sx={{ marginBottom: "20px" }}
                    />
                    <Divider sx={{ width: 'calc(100% + 64px)', marginLeft: '-32px', mb: 2.5 }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <SecondaryButton
                            onClick={closeModal}
                            text='Cancelar'
                        />
                        <Button
                            onClick={SaveAutenticator}
                            variant="contained"
                            color="primary"
                            disabled={!dontAskAgain}
                            sx={{
                                background: "#833A53",
                                border: "1px solid #60293C",
                                borderRadius: "4px",
                                color: "#FFFFFF",
                                opacity: !dontAskAgain ? 0.4 : 1,
                                "&:hover": {
                                    backgroundColor: dontAskAgain ? "#a54261" : "#833A53",
                                },
                            }}
                        >
                            Guardar
                        </Button>

                    </div>
                </Modal>

            </div>


        </Box>
    );

};
export default Chooseroom;