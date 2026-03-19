import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {AuthProvider} from './context/AuthContext';
import {ProtectedRoute} from './components/Layout/ProtectedRoute';
import {PublicRoute} from './components/Layout/PublicRoute';
import {Login} from './pages/Login';
import {Dashboard} from './pages/Dashboard';
import {Users} from './pages/Users';
import {Roles} from './pages/Roles';
import {Departments} from './pages/Departments';
import {Profile} from './pages/Profile';
import {Permissions} from './pages/Permissions';
import {ForgetPassword} from './pages/ForgetPassword';
import {ResetPassword} from './pages/ResetPassword';
import {Vendors} from "./pages/Vendors.tsx";
import {VendorDetails} from "./pages/VendorDetails.tsx";
import {Categories} from "./pages/Categories.tsx";
import ApprovalFlowPage from "./pages/ApprovalFlowPage.tsx";
import RequisitionApprovalPage from "./pages/Requisition/RequisitionApprovalPage.tsx";
import RequisitionPage from "./pages/Requisition/RequisitionPage.tsx";
import RequisitionDetailsPage from "./pages/Requisition/RequisitionDetailsPage.tsx";
import RequisitionApprovalDetailsPage from "./pages/Requisition/RequisitionApprovalDetailsPage.tsx";
import ApprovalPolicyPage from "./pages/ApprovalPolicyPage.tsx";
import {TotalAmountRiskScores} from "./pages/ApprovalPolicy/TotalAmountRiskScores.tsx";
import PublicRfqPage from "./pages/RFQ/PublicRfqPage.tsx";
import RFQListPage from "./pages/RFQ/RFQListPage.tsx";
import RFQQuotationListPage from "./pages/RFQ/RFQQuotationListPage.tsx";
import QuotationDetailsPage from "./pages/RFQ/QuotationDetailsPage.tsx";
import QuotationComparePage from "./pages/RFQ/QuotationComparePage.tsx";
import QuotationApprovalList from "./pages/RFQ/QuotationApprovalPage.tsx";
import QuotationApprovalDetails from "./pages/RFQ/QuotationApprovalDetails.tsx";
import PurchaseOrderDetailsPage from "./pages/PurchaseOrder/PurchaseOrderDetailsPage.tsx";
import PurchaseOrderPage from "./pages/PurchaseOrder/PurchaseOrderPage.tsx";

// Create Material-UI theme with NexusProcure design system
const theme = createTheme({
    palette: {
        primary: {
            main: '#0056D2',
            dark: '#0041A8',
        },
        secondary: {
            main: '#00A8E8',
        },
        error: {
            main: '#E63946',
        },
        success: {
            main: '#2ECC71',
        },
        background: {
            default: '#F8FAFC',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E293B',
            secondary: '#475569',
        },
    },
    typography: {
        fontFamily: 'Poppins, sans-serif',
        h1: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h2: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h3: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h4: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h5: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        h6: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
        },
        button: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route element={<PublicRoute/>}>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/forget-password" element={<ForgetPassword/>}/>
                            <Route path="/reset-password/:token" element={<ResetPassword/>}/>

                        </Route>

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <Users/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/roles"
                            element={
                                <ProtectedRoute>
                                    <Roles/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/permissions"
                            element={
                                <ProtectedRoute>
                                    <Permissions/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/departments"
                            element={
                                <ProtectedRoute>
                                    <Departments/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/vendors"
                            element={
                                <ProtectedRoute>
                                    <Vendors/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/vendors/:id"
                            element={
                                <ProtectedRoute>
                                    <VendorDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute>
                                    <Categories/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/requisitions"
                            element={
                                <ProtectedRoute>
                                    <RequisitionPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/requisitions/:id"
                            element={
                                <ProtectedRoute>
                                    <RequisitionDetailsPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/requisitions-approvals"
                            element={
                                <ProtectedRoute>
                                    <RequisitionApprovalPage/>
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/procurement/requisitions/:id/approval"
                            element={
                                <RequisitionApprovalDetailsPage/>
                            }
                        />


                        <Route
                            path="/procurement/approval-policy"
                            element={
                                <ApprovalPolicyPage/>
                            }
                        />


                        <Route
                            path="/procurement/risk-score"
                            element={
                                <TotalAmountRiskScores/>
                            }
                        />
                        <Route
                            path="/rfq"
                            element={
                                <RFQListPage/>
                            }
                        />

                        <Route
                            path="/rfqs/:rfqId"
                            element={
                                <RFQQuotationListPage />
                            }
                        />
                        <Route
                            path="/rfqs/quotation/:quotationId"
                            element={
                                <QuotationDetailsPage />
                            }
                        />
                        <Route
                            path="/rfqs/:rfqId/compare"
                            element={<QuotationComparePage />}
                        />

                        <Route
                            path="/procurement/quotations-approvals"
                            element={<QuotationApprovalList />}
                        />
                        <Route
                            path="/procurement/quotation-approval/:id"
                            element={<QuotationApprovalDetails />}
                        />

                        <Route
                            path="/procurement/purchase-orders"
                            element={<PurchaseOrderPage />}
                        />

                        <Route
                            path="/procurement/purchase-orders/:id"
                            element={<PurchaseOrderDetailsPage />}
                        />



                        <Route path="/rfq/:token" element={<PublicRfqPage/>}/>


                        {/*<Route*/}
                        {/*    path="/procurement/purchase-orders"*/}
                        {/*    element={*/}
                        {/*        <ProtectedRoute>*/}
                        {/*            <PurchaseOrders />*/}
                        {/*        </ProtectedRoute>*/}
                        {/*    }*/}
                        {/*/>*/}

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
                        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                    </Routes>

                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;


