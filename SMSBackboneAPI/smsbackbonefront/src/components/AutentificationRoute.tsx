import { Navigate, Outlet } from "react-router-dom";
import AutentificationLayout from "./AutentificationLayout";

type Props = {
    isAllowed?: boolean; // Hacer opcional si necesitas
    redirectTo?: string; // Hacer opcional si necesitas
    children?: React.ReactNode; // children es opcional
};

const AutentificationRoute: React.FC<Props> = ({
    redirectTo = "/login",
    children,
}) => {
    // Simular lógica de autenticación
    const isLogin = (): boolean => !!localStorage.getItem("token");

    if (!isLogin()) {
        return <Navigate to={redirectTo} />;
    }

    return (
        <AutentificationLayout>
            {children ? children : <Outlet />} {/* Renderiza children o usa <Outlet /> */}
        </AutentificationLayout>
    );
};

export default AutentificationRoute;
