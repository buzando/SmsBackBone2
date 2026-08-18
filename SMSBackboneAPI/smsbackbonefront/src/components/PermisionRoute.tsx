import { Navigate, Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './Layout';
import AutentificationLayout from './AutentificationLayout';
import {
  getCurrentRole,
  hasPermission,
  type PermissionKey,
} from '../pages/permisions';

type RouteLayout = 'main' | 'auth' | 'none';

type Props = {
  permission: PermissionKey;
  redirectTo?: string;
  children?: React.ReactNode;
  layout?: RouteLayout;
};

const PermissionRoute: React.FC<Props> = ({
  permission,
  redirectTo = '/',
  children,
  layout = 'main',
}) => {
  const isLogin = (): boolean => !!localStorage.getItem('token');

  if (!isLogin()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasPermission(permission)) {
    const role = getCurrentRole();

    if (role === 'Root') {
      return <Navigate to="/Clients" replace />;
    }

    if (role === 'Mesa') {
      return <Navigate to="/ClientRoomPicker" replace />;
    }

    return <Navigate to={redirectTo} replace />;
  }

  const content = children ? children : <Outlet />;

  if (layout === 'none') {
    return <>{content}</>;
  }

  if (layout === 'auth') {
    return (
      <AutentificationLayout>
        <Box
          sx={{
            backgroundColor: '#F2F2F2',
            overflowY: 'hidden',
            overflowX: 'hidden',
            minHeight: 'calc(100vh - 4.5rem)',
          }}
        >
          {content}
        </Box>
      </AutentificationLayout>
    );
  }

  return <Layout>{content}</Layout>;
};

export default PermissionRoute;