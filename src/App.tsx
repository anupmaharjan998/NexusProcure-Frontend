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
import InventoryPage from "./pages/Inventory/InventoryPage.tsx";
import CategoryPage from "./pages/Inventory/CategoryPage.tsx";
import {AddInventoryItemPage} from "./pages/Inventory/AddInventoryItemPage.tsx";
import InventoryItemDetailPage from "./pages/Inventory/InventoryItemDetailPage.tsx";
import {EditInventoryItemPage} from "./pages/Inventory/EditInventoryItemPage.tsx";
import PurchaseOrderDeliveryPage from "./pages/Inventory/PurchaseOrderDeliveryPage.tsx";
import EditInventoryStockPage from './pages/Inventory/EditInventoryStockPage';
import AddInventoryAssetPage from './pages/Inventory/AddInventoryAssetPage';
import AddInventoryStockPage from "./pages/Inventory/EditInventoryStockPage";
import DelegationPage from "./pages/Delegation/DelegationPage.tsx";
import CreateInventoryRequestPage from './pages/Inventory/CreateInventoryRequestPage';
import MyInventoryRequestsPage from './pages/Inventory/MyInventoryRequestsPage';
import ManagerInventoryApprovalPage from './pages/Inventory/ManagerInventoryApprovalPage';
import InventoryPendingRequestsPage from './pages/Inventory/InventoryPendingRequestsPage';
import InventoryRequestDetailPage from './pages/Inventory/InventoryRequestDetailPage';
import InventoryRequestProcessPage from './pages/Inventory/InventoryRequestProcessPage';
import ManagerInventoryShortageDecisionPage from './pages/Inventory/ManagerInventoryShortageDecisionPage';
import ReportsDashboardPage from './pages/Reports/ReportsDashboardPage';
import PurchaseOrderReportPage from './pages/Reports/PurchaseOrderReportPage';
import InventoryReportPage from './pages/Reports/InventoryReportPage';
import SpendingAnalyticsPage from './pages/Reports/SpendingAnalyticsPage';
import ProcurementRequestPage from "./pages/ProcurementRequest/ProcurementRequestPage.tsx";
import ProcurementRequestDetailPage from "./pages/ProcurementRequest/ProcurementRequestDetailPage.tsx";
import MyAssignedInventoryItemDetailPage from "./pages/Inventory/MyAssignedInventoryItemDetailPage.tsx";


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
                                <ProtectedRoute permissions={['VIEW_USERS']}>
                                    <Users/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/roles"
                            element={
                                <ProtectedRoute permissions={['VIEW_ROLES']}>
                                    <Roles/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/permissions"
                            element={
                                <ProtectedRoute permissions={['VIEW_PERMISSIONS']}>
                                    <Permissions/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/departments"
                            element={
                                <ProtectedRoute permissions={['VIEW_DEPARTMENTS']}>
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
                                <ProtectedRoute permissions={['VIEW_VENDOR']}>
                                    <Vendors/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/vendors/:id"
                            element={
                                <ProtectedRoute permissions={['VIEW_VENDOR']}>
                                    <VendorDetails/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute  permissions={['VIEW_CATEGORIES']}>
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
                                <ProtectedRoute>
                                    <RequisitionApprovalDetailsPage/>
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/procurement/approval-policy"
                            element={
                                <ProtectedRoute>
                                    <ApprovalPolicyPage/>
                                </ProtectedRoute>
                            }
                        />


                        <Route
                            path="/procurement/risk-score"
                            element={
                                <ProtectedRoute>
                                    <TotalAmountRiskScores/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/rfq"
                            element={
                                <ProtectedRoute>
                                    <RFQListPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/rfqs/:rfqId"
                            element={
                                <ProtectedRoute>
                                    <RFQQuotationListPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/rfqs/quotation/:quotationId"
                            element={
                                <ProtectedRoute>
                                    <QuotationDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/rfqs/:rfqId/compare"

                            element={
                                <ProtectedRoute>
                                    <QuotationComparePage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/quotations-approvals"
                            element={
                                <ProtectedRoute>
                                    <QuotationApprovalList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/procurement/quotation-approval/:id"
                            element={
                                <ProtectedRoute>
                                    <QuotationApprovalDetails/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/purchase-orders"
                            element={
                                <ProtectedRoute>
                                    <PurchaseOrderPage />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/procurement/purchase-orders/:id"
                            element={
                                <ProtectedRoute>
                                    <PurchaseOrderDetailsPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/inventory"
                            element={
                                <ProtectedRoute>
                                    <InventoryPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventory/categories"
                            element={
                                <ProtectedRoute>
                                    <CategoryPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventory/add-item"
                            element={
                                <ProtectedRoute>
                                    <AddInventoryItemPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventory/item-detail/:id"
                            element={
                                <ProtectedRoute>
                                    <InventoryItemDetailPage/>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/inventory/item-edit/:id"
                            element={
                                <ProtectedRoute>
                                    <EditInventoryItemPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/inventory/delivery"
                            element={
                                <ProtectedRoute>
                                    <PurchaseOrderDeliveryPage/>
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/inventory" element={<InventoryPage />} />
                        <Route path="/inventory/categories" element={<CategoryPage />} />
                        <Route path="/inventory/stocks/create" element={<AddInventoryStockPage />} />
                        <Route path="/inventory/stocks/edit/:id" element={<EditInventoryStockPage />} />
                        <Route path="/inventory/assets/create" element={<AddInventoryAssetPage />} />
                        <Route path="/inventory/assets/:id" element={<InventoryItemDetailPage />} />
                        <Route path="/inventory/delivery" element={<PurchaseOrderDeliveryPage />} />

                        <Route path="/delegations" element={<DelegationPage />} />

                        <Route path="/rfq/:token" element={<PublicRfqPage/>}/>


                        <Route path="/inventory-requests/new" element={<CreateInventoryRequestPage />} />

                        <Route path="/inventory-requests/my" element={<MyInventoryRequestsPage />} />

                        <Route
                            path="/inventory-requests/manager-pending"
                            element={<ManagerInventoryApprovalPage />}
                        />

                        <Route
                            path="/inventory-requests/inventory-pending"
                            element={<InventoryPendingRequestsPage />}
                        />

                        <Route
                            path="/inventory-requests/:requestId"
                            element={<InventoryRequestDetailPage />}
                        />

                        <Route
                            path="/inventory-requests/:requestId/process"
                            element={<InventoryRequestProcessPage />}
                        />

                        <Route
                            path="/inventory-requests/shortage-decisions"
                            element={<ManagerInventoryShortageDecisionPage />}
                        />

                        <Route
                            path="/procurement/requests"
                            element={<ProcurementRequestPage />}
                        />

                        <Route
                            path="/procurement/requests/:id"
                            element={<ProcurementRequestDetailPage />}
                        />
                        <Route
                            path="/inventory-items/:id"
                            element={<MyAssignedInventoryItemDetailPage />}
                        />


                        <Route path="/reports" element={<ReportsDashboardPage />} />
                        <Route path="/reports/purchase-orders" element={<PurchaseOrderReportPage />} />
                        <Route path="/reports/inventory" element={<InventoryReportPage />} />
                        <Route path="/reports/spending" element={<SpendingAnalyticsPage />} />


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


