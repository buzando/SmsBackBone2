import { useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme } from '@mui/material'
import { themeOptions } from './TSX/ThemeOptions'
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import AutentificationPage from './pages/AutentificationPage'
import ClientRoomPicker from './pages/ClientRoomPicker'
import Chooseroom from './pages/chooseroom'
import PasswordReset from './pages/PasswordReset'
import RegisterPage from './pages/RegisterPage'
import Rooms from './pages/Rooms'
import UserAdministration from './pages/UserAdministration'
import AccountRecharge from './pages/AccountRecharge'
import ManageAccount from './pages/ManageAccount'
import PaymentHistoric from './pages/PaymentHistoric'
import ConfigurationAccount from './pages/ConfigurationAccount'
import TermsAndConditions from './pages/TermsAndConditions'
import CreditManagement from './pages/CreditManagement'
import MyNumbers from './pages/MyNumbers'
import PaymentSettings from './pages/PaymentSettings'
import PaymentMethods from './pages/PaymentMethods'
import Campaigns from './pages/Campains'
import Use from './pages/Use'
import Costs from './pages/Costs'
import Help from './pages/Help'
import NumbersDids from './pages/NumbersDids'
import BillingInformation from './pages/BillingInformation'
import BlackList from './pages/BlackList'
import TestSMS from './pages/TestSMS'
import Clients from './pages/Clients'
import RoomsAdmin from './pages/RoomsAdmin'
import ReportsAdmin from './pages/ReportsAdmin'
import AutentificationRoute from './components/AutentificationRoute'
import { AppContextProvider } from './hooks/useContextInitialState'
import Reports from './pages/Reports'
import Templates from './pages/Templates'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/es-mx';
import PrivacyNotice from './pages/PrivacyNotice'
import HomePage from './pages/HomePage';
import PermissionRoute from './components/PermisionRoute'
import { PERMISSIONS } from './pages/permisions'

function App() {

    console.log(`MODE: ${import.meta.env.MODE}`)
    console.log(`API URL: ${import.meta.env.VITE_SMS_API_URL}`)
    useEffect(() => {
        const expirationDate = localStorage.getItem('expirationDate');
        if (expirationDate) {
            const expirationDateObj = new Date(expirationDate);
            const currentDate = new Date();
            const isExpired = expirationDateObj && expirationDateObj < currentDate;
            if (isExpired) {
                console.log("TOKEN EXPIRADO");
                localStorage.clear();
            }
        }
    }, [])



    let prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    prefersDarkMode = false; // Esta lienia es para que siempre se vea el tema claro
    const theme = createTheme(themeOptions(prefersDarkMode ? 'dark' : 'light'));
    return (
        <AppContextProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='es-mx'>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter basename='/Quantum/'>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/ConfigurationAccount" element={<ConfigurationAccount />} />
                            <Route path="/password_reset" element={<PasswordReset />} />

                            <Route element={<AutentificationRoute />}>
                                <Route path="/Autentification" element={<AutentificationPage />} />
                                <Route path="/chooseroom" element={<Chooseroom />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute
                                        permission={PERMISSIONS.MESA_CLIENT_ROOM_PICKER}
                                        layout="auth"
                                    />
                                }
                            >
                                <Route path="/ClientRoomPicker" element={<ClientRoomPicker />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW} />
                                }
                            >
                                <Route path="/" element={<HomePage />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.USER_TERMS_VIEW} />
                                }
                            >
                                <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.USER_PRIVACY_VIEW} />
                                }
                            >
                                <Route path="/PrivacyNotice" element={<PrivacyNotice />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.ROOT_CLIENTS_MANAGE} />
                                }
                            >
                                <Route path="/Clients" element={<Clients />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.ROOT_ROOMS_MANAGE} />
                                }
                            >
                                <Route path="/RoomsAdmin" element={<RoomsAdmin />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.ROOT_REPORTS_VIEW} />
                                }
                            >
                                <Route path="/ReportsAdmin" element={<ReportsAdmin />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.NUMBERS_DIDS_MANAGE} />
                                }
                            >
                                <Route path="/NumbersDids" element={<NumbersDids />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.ADMIN_USERS_MANAGE} />
                                }
                            >
                                <Route path="/UserAdministration" element={<UserAdministration />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.ADMIN_ROOMS_VIEW} />
                                }
                            >
                                <Route path="/rooms" element={<Rooms />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.SMS_CAMPAIGNS_VIEW} />
                                }
                            >
                                <Route path="/Campains" element={<Campaigns />} />
                                <Route path="/campains" element={<Campaigns />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.SMS_TEMPLATES_MANAGE} />
                                }
                            >
                                <Route path="/Templates" element={<Templates />} />
                                <Route path="/templates" element={<Templates />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.SMS_BLACKLISTS_MANAGE} />
                                }
                            >
                                <Route path="/BlackList" element={<BlackList />} />
                                <Route path="/blacklists" element={<BlackList />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.SMS_TEST_SEND} />
                                }
                            >
                                <Route path="/TestSMS" element={<TestSMS />} />
                                <Route path="/sms-test" element={<TestSMS />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.REPORTS_VIEW} />
                                }
                            >
                                <Route path="/Reports" element={<Reports />} />
                                <Route path="/reports" element={<Reports />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BILLING_PAYMENT_METHODS_MANAGE} />
                                }
                            >
                                <Route path="/PaymentMethods" element={<PaymentMethods />} />
                                <Route path="/Paymentmethods" element={<PaymentMethods />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BILLING_DATA_MANAGE} />
                                }
                            >
                                <Route path="/BillingInformation" element={<BillingInformation />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BILLING_HISTORY_VIEW} />
                                }
                            >
                                <Route path="/PaymentHistoric" element={<PaymentHistoric />} />
                                <Route path="/Paymenthistoric" element={<PaymentHistoric />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BILLING_PAYMENT_SETTINGS_MANAGE} />
                                }
                            >
                                <Route path="/PaymentSettings" element={<PaymentSettings />} />
                                <Route path="/Paymentsettings" element={<PaymentSettings />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BALANCE_TRANSFER_MANAGE} />
                                }
                            >
                                <Route path="/CreditManagement" element={<CreditManagement />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BALANCE_RECHARGE} />
                                }
                            >
                                <Route path="/AccountRecharge" element={<AccountRecharge />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.BALANCE_NUMBERS_MANAGE} />
                                }
                            >
                                <Route path="/MyNumbers" element={<MyNumbers />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.USER_ACCOUNT_EDIT} />
                                }
                            >
                                <Route path="/ManageAccount" element={<ManageAccount />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.USAGE_VIEW} />
                                }
                            >
                                <Route path="/Use" element={<Use />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.COSTS_VIEW} />
                                }
                            >
                                <Route path="/Costs" element={<Costs />} />
                            </Route>

                            <Route
                                element={
                                    <PermissionRoute permission={PERMISSIONS.HELP_VIEW} />
                                }
                            >
                                <Route path="/Help" element={<Help />} />
                                <Route path="/help" element={<Help />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </LocalizationProvider>
        </AppContextProvider >
    )
}

export default App