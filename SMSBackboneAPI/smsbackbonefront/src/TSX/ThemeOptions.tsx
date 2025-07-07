import { ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

export const themeOptions = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    //main: '#c00021',
                    main: '#240F17',
                },
                text: {
                    primary: '#330F1B',
                },
            }
            : {
                primary: {
                    main: '#917503',
                },
                typography: {
                    fontFamily: 'Poppins, Arial, sans-serif', // Aplica la fuente Poppins
                },
            }),
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: 'Poppins, Arial, sans-serif', // Aplica a todos los botones
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    fontFamily: 'Poppins, Arial, sans-serif', // Aplica a todos los campos de texto
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    fontFamily: 'Poppins, Arial, sans-serif', // Aplica a todos los select
                },
            },
        },
    },
});
