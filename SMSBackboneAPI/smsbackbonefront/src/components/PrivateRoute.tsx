import { Navigate, Outlet } from "react-router-dom";
import Layout from './Layout';
import { Box } from "@mui/material";

type Props = {
    isAllowed?: boolean; // Hacer opcional si es necesario
    redirectTo?: string; // Hacer opcional si es necesario
    children?: React.ReactNode; // children es opcional
};

const PrivateRoute: React.FC<Props> = ({
    redirectTo = "/login",
    children,
}) => {
    const isLogin = (): boolean => !!localStorage.getItem('token');

    if (!isLogin()) {
        return <Navigate to={redirectTo} />;
    }

    return (
        <Layout>
            {children ? children : <Outlet />} {/* Renderiza children o usa <Outlet /> */}
        </Layout>
    );
};

export default PrivateRoute;
