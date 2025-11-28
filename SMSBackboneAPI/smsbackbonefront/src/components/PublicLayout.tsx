import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box';
import nuxiba_svg from '../assets/nuxiba.svg'
import appIcon_svg from '../assets/AppIcon.svg'
import { useNavigate } from 'react-router-dom';
import logorq from '../assets/quantum-logov25.svg';

type Props = {
    children: React.ReactNode;
}

const Layout: React.FC<Props> = props => {

    const navigate = useNavigate();

    return (
        <>
            <AppBar position="sticky" sx={{ top: 0 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => navigate('/')}>
                        <Box
                            component="img"
                            src={logorq}
                            alt="Quantum"
                            sx={{
                                position: "absolute",
                                display: "block",
                                height: { xs: 38, sm: 42, md: 110 },
                                width: "auto",
                                objectFit: "contain",
                                filter: "brightness(0) invert(1)",
                                marginLeft: 22
                            }}
                        />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box sx={{ backgroundColor: "#F2F2F2" }}>
                {
                    props.children
                }
            </Box>
            <footer>
                <Box display="flex" justifyContent="space-between" sx={{ position: 'fixed', bottom: 0, width: '100%', padding: 1, borderTop: 'solid 1px #E6E4E4', background: '#FFFFFF' }}>
                    <Typography variant="caption" color="textSecondary" align="left">
                        {'Copyright � '}
                        {new Date().getFullYear()}
                        {' Nuxiba. Todos los derechos reservados. Se proh�be el uso no autorizado.'}
                    </Typography>

                    <img src={nuxiba_svg} alt="Description" width="70" />
                </Box>
            </footer>
        </>
    )
}

export default Layout