import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./pages/Authentication/AuthContext";
import ProtectedRoute from "./pages/Authentication/ProtectedRoute";
import ManageUser from "./pages/ManageUser/Pages/ManageUser";
import AddUser from "./pages/ManageUser/Pages/AddUser";
import EditUser from "./pages/ManageUser/Pages/EditUser";
import PurchaseOrderDetail from "./pages/PurchaseOrder/Pages/PurchaseOrderDetail";
import DeliveryNoteDetail from "./pages/DeliveryNote/Pages/DeliveryNoteDetail";
import PageTitle from "./components/PageTitle";
import DefaultLayout from "./layout/DefaultLayout";
import NotFound from "./pages/404";
import Unauthorized from "./pages/Authentication/Pages/Unauthorized";
import Dashboard from "./pages/Dashboard/Dashboard";
import StockItems from "./pages/Subcon/Pages/StockItems";
import IndexPurchaseOrder from "./pages/PurchaseOrder/IndexPurchaseOrder";
import DeliveryNoteDetailEdit from "./pages/DeliveryNote/Pages/DeliveryNoteDetailEdit";
import SignIn from "./pages/Authentication/Pages/SignIn";
import IndexPerformanceReport from "./pages/PerformanceReport/IndexPerformanceReport";
import IndexForeCast from "./pages/ForecastReport/IndexForeCast";
import IndexHistoryPurchaseOrder from "./pages/PurchaseOrder/IndexHistoryPurchaseOrder";
import IndexHistoryDeliveryNote from "./pages/DeliveryNote/IndexHistoryDeliveryNote";
import IndexDeliveryNote from "./pages/DeliveryNote/IndexDeliveryNote";
import TransactionsReport from "./pages/Subcon/Pages/TransactionsReport";
import PrintPO from "./pages/Print/PrintPO";
import Transactions from "./pages/Subcon/Pages/Transactions";
import PrintDN from "./pages/Print/PrintDN";
import PrintLabel from "./pages/Print/PrintLabel";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/auth/login" element={<SignIn />} />

          <Route
            path="/print/purchase-order"
            element={
              <ProtectedRoute allowedRoles={['1','3','5']}>
                <PageTitle title="Print Purchase Order | PT SANOH INDONESIA" />
                <PrintPO />
              </ProtectedRoute>
            }
          />
          <Route
            path="/print/delivery-note"
            element={
              <ProtectedRoute allowedRoles={['1','2','5']}>
                <PageTitle title="Print Delivery Note | PT SANOH INDONESIA" />
                <PrintDN />
              </ProtectedRoute>
            }
          />
          <Route
            path="/print/label/delivery-note"
            element={
              <ProtectedRoute allowedRoles={['1','2','5']}>
                <PageTitle title="Print Label Delivery Note | PT SANOH INDONESIA" />
                <PrintLabel />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes with DefaultLayout */}
          <Route element={<DefaultLayout/>}>

            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['1','2','3','4','5']}>
                  <PageTitle title="Dashboard | PT SANOH INDONESIA" />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['1','2','3','4','5']}>
                  <PageTitle title="Dashboard | PT SANOH INDONESIA" />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/list-user"
              element={
                <ProtectedRoute allowedRoles={['4']}>
                  <PageTitle title="Manage User | PT SANOH INDONESIA" />
                  <ManageUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedRoute allowedRoles={['4']}>
                  <PageTitle title="Add User | PT SANOH INDONESIA" />
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-user"
              element={
                <ProtectedRoute allowedRoles={['4']}>
                  <PageTitle title="Edit User | PT SANOH INDONESIA" />
                  <EditUser />
                </ProtectedRoute>
              }
            />
            {/* Purchasing Routes */}
            <Route
              path="/purchase-order"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Purchase Order | PT SANOH INDONESIA" />
                  <IndexPurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-order-detail"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Purchase Order Detail | PT SANOH INDONESIA" />
                  <PurchaseOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-purchase-order"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="History Purchase Order | PT SANOH INDONESIA" />
                  <IndexHistoryPurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance-report"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Performance Report | PT SANOH INDONESIA" />
                  <IndexPerformanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast-report"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Forecast | PT SANOH INDONESIA" />
                  <IndexForeCast />
                </ProtectedRoute>
              }
            />
            {/* Warehouse Routes */}
            <Route
              path="/delivery-note"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Delivery Note | PT SANOH INDONESIA" />
                  <IndexDeliveryNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-note-detail"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Delivery Note Detail | PT SANOH INDONESIA" />
                  <DeliveryNoteDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-delivery-note"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="History Delivery Note | PT SANOH INDONESIA" />
                  <IndexHistoryDeliveryNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-note-detail-edit"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Delivery Note Detail Edit | PT SANOH INDONESIA" />
                  <DeliveryNoteDetailEdit />
                </ProtectedRoute>
              }
            />
            {/* Subcon Routes */}
            <Route
              path="/stock-items"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Stock Item | PT SANOH INDONESIA" />
                  <StockItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Transaksi | PT SANOH INDONESIA" />
                  <Transactions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions-report"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Transactions Report | PT SANOH INDONESIA" />
                  <TransactionsReport />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <>              
                <PageTitle title="Page Not Found | PT SANOH INDONESIA" />
                <NotFound />
              </>
            }
          />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <>
                <PageTitle title="Unauthorized | PT SANOH INDONESIA" />
                <Unauthorized /> 
              </>
            }
          />

          {/* Test Page */}
          <Route
            path="/test"
            element={
              <>

              </>
            }
          />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;