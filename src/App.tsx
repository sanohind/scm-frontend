import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./pages/Authentication/AuthContext";
import ProtectedRoute from "./pages/Authentication/ProtectedRoute";
import ManageUser from "./pages/ManageUser/Pages/ManageUser";
import AddUser from "./pages/ManageUser/Pages/AddUser";
import EditUser from "./pages/ManageUser/Pages/EditUser";
import PurchaseOrderDetail from "./pages/PurchaseOrder/Pages/PurchaseOrderDetail";
import HistoryPurchaseOrder from "./pages/PurchaseOrder/Pages/HistoryPurchaseOrder";
import PerformanceReport from "./pages/PerformanceReport/PerformanceReport";
import DeliveryNote from "./pages/DeliveryNote/Pages/DeliveryNote";
import DeliveryNoteDetail from "./pages/DeliveryNote/Pages/DeliveryNoteDetail";
import HistoryDeliveryNote from "./pages/DeliveryNote/Pages/HistoryDeliveryNote";
import Transaction from "./pages/Subcon/Pages/Transaction";
import PageTitle from "./components/PageTitle";
import DefaultLayout from "./layout/DefaultLayout";
import NotFound from "./pages/404";
import Unauthorized from "./pages/Authentication/Unauthorized";
import Dashboard from "./pages/Dashboard/Dashboard";
import StockItems from "./pages/Subcon/Pages/StockItem";
import AddTransaction from "./pages/Subcon/Pages/AddTransaction";
import IndexPurchaseOrder from "./pages/PurchaseOrder/IndexPurchaseOrder";
import DeliveryNoteDetailEdit from "./pages/DeliveryNote/Pages/DeliveryNoteDetailEdit";
import SignIn from "./pages/Authentication/Pages/SignIn";
import Forecast from "./pages/ForecastReport/Forecast";


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
                  <HistoryPurchaseOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance-report"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Performance Report | PT SANOH INDONESIA" />
                  <PerformanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast-report"
              element={
                <ProtectedRoute allowedRoles={['3', '1', '5']}>
                  <PageTitle title="Forecast | PT SANOH INDONESIA" />
                  <Forecast />
                </ProtectedRoute>
              }
            />
            {/* Warehouse Routes */}
            <Route
              path="/delivery-note"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Delivery Note | PT SANOH INDONESIA" />
                  <DeliveryNote />
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
                  <HistoryDeliveryNote />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivery-note-detail-edit"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="History Delivery Note | PT SANOH INDONESIA" />
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
              path="/transaction"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Transaksi Subcon | PT SANOH INDONESIA" />
                  <Transaction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-transaction"
              element={
                <ProtectedRoute allowedRoles={['5']}>
                  <PageTitle title="Transaksi Subcon | PT SANOH INDONESIA" />
                  <AddTransaction />
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

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;