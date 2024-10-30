import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./pages/Authentication/AuthContext";
import SignIn from "./pages/Authentication/SignIn";
import ProtectedRoute from "./pages/Authentication/ProtectedRoute";
import ManageUser from "./pages/ManageUser/ManageUser";
import AddUser from "./pages/ManageUser/AddUser";
import EditUser from "./pages/ManageUser/EditUser";
import PurchaseOrder from "./pages/PurchaseOrder/PurchaseOrder";
import PurchaseOrderDetail from "./pages/PurchaseOrder/PurchaseOrderDetail";
import HistoryPurchaseOrder from "./pages/HistoryPurchaseOrder/HistoryPurchaseOrder";
import PerformanceReport from "./pages/PerformanceReport";
import Forecast from "./pages/Forecast";
import DeliveryNote from "./pages/DeliveryNote/DeliveryNote";
import DeliveryNoteDetail from "./pages/DeliveryNote/DeliveryNoteDetail";
import HistoryDeliveryNote from "./pages/HistoryDeliveryNote/HistoryDeliveryNote";
import StockItem from "./pages/Subcon/StockItem";
import Transaction from "./pages/Subcon/Transaction";
import PageTitle from "./components/PageTitle";
import DefaultLayout from "./layout/DefaultLayout";
import NotFound from "./pages/404";
import Unauthorized from "./pages/Authentication/Unauthorized";
import Dashboard from "./pages/Dashboard/Dashboard";
import TesPages from "./pages/TesPages";
import HistoryPurchaseOrderDetail from "./pages/HistoryPurchaseOrder/HistoryPurchaseOrderDetail";


const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/signin" element={<SignIn />} />

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
              path="/manage-user"
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
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Purchase Order | PT SANOH INDONESIA" />
                  <PurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase-order-detail"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Purchase Order Detail | PT SANOH INDONESIA" />
                  <PurchaseOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-purchase-order"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="History Purchase Order | PT SANOH INDONESIA" />
                  <HistoryPurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-purchase-order-detail"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="History Purchase Order | PT SANOH INDONESIA" />
                  <HistoryPurchaseOrderDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance-report"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Performance Report | PT SANOH INDONESIA" />
                  <PerformanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast-report"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Forecast | PT SANOH INDONESIA" />
                  <Forecast />
                </ProtectedRoute>
              }
            />
            {/* Warehouse Routes */}
            <Route
              path="/delivery-note"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Delivery Note | PT SANOH INDONESIA" />
                  <DeliveryNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-note-detail"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Delivery Note Detail | PT SANOH INDONESIA" />
                  <DeliveryNoteDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history-delivery-note"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="History Delivery Note | PT SANOH INDONESIA" />
                  <HistoryDeliveryNote />
                </ProtectedRoute>
              }
            />
            {/* Subcon Routes */}
            <Route
              path="/stock-item"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Stock Item | PT SANOH INDONESIA" />
                  <StockItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transaksi-subcon"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Transaksi Subcon | PT SANOH INDONESIA" />
                  <Transaction />
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
          {/* Page Tes */}
          <Route
            path="/tes"
            element={
              <>
                <PageTitle title="Page Tes | PT SANOH INDONESIA" />
                <TesPages /> 
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;