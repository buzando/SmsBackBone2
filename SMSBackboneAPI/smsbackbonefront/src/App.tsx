import { useEffect } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme } from '@mui/material'
import { themeOptions } from './TSX/ThemeOptions'
import { ThemeProvider } from '@emotion/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage'
import AutentificationPage from './pages/AutentificationPage'
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
//import UsersPage from './pages/private/UsersPage';
import PrivateRoute from './components/PrivateRoute';
import AutentificationRoute from './components/AutentificationRoute'
import { AppContextProvider } from './hooks/useContextInitialState'
import Reports from './pages/Reports'
import Templates from './pages/Templates'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/es-mx';
import PrivacyNotice from './pages/PrivacyNotice'
//import TermsAndConditions from './pages/public/TermsAndConditions';
//import PasswordReset from './pages/public/PasswordReset';
//import HelpPage from './pages/private/HelpPage';
//import ReportsPage from './pages/private/ReportsPage';
//import ApiTestPage from './pages/private/ApiTestPage';
import HomePage from './pages/HomePage';
//import PaymentHistoryPage from './pages/private/billing_temp/PaymentHistoryPage';
//import PaymentMethodsPage from './pages/private/billing_temp/PaymentMethodsPage';
//import PaymentUsagePage from './pages/private/billing_temp/PaymentUsagePage';
//import PaymentCostsPage from './pages/private/billing_temp/PaymentCostsPage';
//import PaymentSettingsPage from './pages/private/billing_temp/PaymentSettingsPage';
//import MyNumbersPage from './pages/private/numbers_temp/MyNumbersPage';
//import BuyNumbersPage from './pages/private/numbers_temp/BuyNumbersPage';
import AccountRecharge2 from './pages/AccountRecharge2'
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
                    <BrowserRouter basename='/RedQuantum/'>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                         
                                <Route path="/AccountRecharge2" element={<AccountRecharge2 />} />
                           
                            <Route element={<AutentificationRoute />}>
                                <Route path="/Autentification" element={<AutentificationPage />} />
                            </Route>
                            <Route element={<AutentificationRoute />} >
                                <Route path="/chooseroom" element={<Chooseroom />} />
                            </Route>
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/ConfigurationAccount" element={<ConfigurationAccount />} />
                            <Route path="/password_reset" element={<PasswordReset />} />
                            {/*<Route path="/legan/terms" element={<TermsAndConditions />} />*/}
                            <Route element={<PrivateRoute />}>
                                <Route path='/' element={<HomePage />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/TermsAndConditions' element={<TermsAndConditions />} />
                            </Route>
                              <Route element={<PrivateRoute />}>
                                <Route path='/Clients' element={<Clients />} />
                            </Route>
                             <Route element={<PrivateRoute />}>
                                <Route path='/RoomsAdmin' element={<RoomsAdmin />} />
                            </Route>
                                <Route element={<PrivateRoute />}>
                                <Route path='/NumbersDids' element={<NumbersDids />} />
                            </Route>
                             <Route element={<PrivateRoute />}>
                                <Route path='/ReportsAdmin' element={<ReportsAdmin />} />
                            </Route>
                             <Route element={<PrivateRoute />}>
                                <Route path='/PrivacyNotice' element={<PrivacyNotice />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Templates' element={<Templates />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/BlackList' element={<BlackList />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/TestSMS' element={<TestSMS />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/PaymentMethods' element={<PaymentMethods />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Reports' element={<Reports />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Campains' element={<Campaigns />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Costs' element={<Costs />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Use' element={<Use />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/PaymentHistoric' element={<PaymentHistoric />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/PaymentSettings' element={<PaymentSettings />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/BillingInformation' element={<BillingInformation />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/CreditManagement' element={<CreditManagement />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/AccountRecharge' element={<AccountRecharge />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/MyNumbers' element={<MyNumbers />} />
                            </Route>
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/users' element={<UsersPage />} />*/}
                            {/*</Route>*/}
                            <Route element={<PrivateRoute />}>
                                <Route path='/rooms' element={<Rooms />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/UserAdministration' element={<UserAdministration />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/ManageAccount' element={<ManageAccount />} />
                            </Route>
                            <Route element={<PrivateRoute />}>
                                <Route path='/Help' element={<Help />} />
                            </Route>
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/billing/paymenthistory' element={<PaymentHistoryPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/billing/paymentmethods' element={<PaymentMethodsPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/billing/paymentusage' element={<PaymentUsagePage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/billing/paymentcost' element={<PaymentCostsPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/billing/paymentsettings' element={<PaymentSettingsPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/reports' element={<ReportsPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/numbers/mynumbers' element={<MyNumbersPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/numbers/buynumbers' element={<BuyNumbersPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/apitest' element={<ApiTestPage />} />*/}
                            {/*</Route>*/}
                            {/*<Route element={<PrivateRoute />}>*/}
                            {/*    <Route path='/help' element={<HelpPage />} />*/}
                            {/*</Route>*/}
                        </Routes>
                    </BrowserRouter>
                </ThemeProvider>
            </LocalizationProvider>
        </AppContextProvider >
    )
}

export default App