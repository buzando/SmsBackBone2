import { Navigate, Outlet } from "react-router-dom";
import AutentificationLayout from "./AutentificationLayout";
import { Box } from "@mui/material";

type Props = {
    isAllowed?: boolean; // Hacer opcional si necesitas
    redirectTo?: string; // Hacer opcional si necesitas
    children?: React.ReactNode; // children es opcional
};

const AutentificationRoute: React.FC<Props> = ({
    redirectTo = "/login",
    children,
}) => {
    // Simular l�gica de autenticaci�n
    const isLogin = (): boolean => !!localStorage.getItem("token");

    if (!isLogin()) {
        return <Navigate to={redirectTo} />;
    }

    return (
        <AutentificationLayout>
            <Box sx={{ backgroundColor: "#F2F2F2", overflowY: "hidden", overflowX: "hidden", maxHeight: "605px" }}>
                {children ? children : <Outlet />} {/* Renderiza children o usa <Outlet /> */}
            </Box>
        </AutentificationLayout>
    );
};

export default AutentificationRoute;
