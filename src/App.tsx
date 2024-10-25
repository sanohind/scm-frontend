// import { useEffect, useState } from 'react';
// import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./pages/Authentication/AuthContext";
import SignIn from "./pages/Authentication/SignIn";
import ProtectedRoute from "./pages/Authentication/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
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
                <ProtectedRoute allowedRoles={['4', '2', '3', '1', '5']}>
                  <PageTitle title="Dashboard | PT SANOH INDONESIA" />
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['4', '2', '3', '1', '5']}>
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
              path="/performance-report"
              element={
                <ProtectedRoute allowedRoles={['2', '1', '5']}>
                  <PageTitle title="Performance Report | PT SANOH INDONESIA" />
                  <PerformanceReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forecast"
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;


// import Loader from './common/Loader';
// import PageTitle from './components/PageTitle';
// import SignIn from './pages/Authentication/SignIn';
// // import AdminDashboard from './pages/Dashboard/AdminDashboard';
// // import UserDashboard from './pages/Dashboard/UserDashboard';
// import Profile from './pages/Profile';
// import DefaultLayout from './layout/DefaultLayout';
// import ECommerce from './pages/Dashboard/ECommerce';
// import Dashboard from './pages/Dashboard';
// import PerformanceReport from './pages/PerformanceReport';


// function App() {
//   const [loading, setLoading] = useState<boolean>(true);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
//     return localStorage.getItem('isAuthenticated') === 'true';
//   });
//   const [role, setRole] = useState<string | null>(() => {
//     return localStorage.getItem('userRole');
//   });
//   const { pathname } = useLocation();
//   const navigate = useNavigate();

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [pathname]);

//   useEffect(() => {
//     setTimeout(() => setLoading(false), 1000);
//   }, []);

//   // Mendapatkan status autentikasi dan peran pengguna dari localStorage
//   useEffect(() => {
//     const userRole = localStorage.getItem('userRole');
//     const authStatus = localStorage.getItem('isAuthenticated');
//     if (authStatus === 'true') {
//       setIsAuthenticated(true);
//       setRole(userRole);
//     } else {
//       setIsAuthenticated(false);
//       setRole(null);
//     }
//   }, []);

//   // Mengarahkan ke halaman login jika belum terautentikasi
//   useEffect(() => {
//     if (!isAuthenticated && pathname !== '/auth/signin') {
//       navigate('/auth/signin');
//     }
//   }, [isAuthenticated, pathname, navigate]);

//   return loading ? (
//     <Loader />
//   ) : (
//       <Routes>
//         {!isAuthenticated ? (
//           <>
//             <Route
//               path="/auth/signin"
//               element={
//                 <>
//                   <PageTitle title="Signin SCM | PT SANOH INDONESIA" />
//                   <SignIn setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
//                 </>
//               }
//             />
//             {/* Tambahkan route lain jika diperlukan */}
//           </>
//         ) : (
//           // Menggunakan DefaultLayout dan meneruskan prop role
//           <Route
//             path="*"
//             element={
//               <DefaultLayout role={role}>
//                 <Routes>
//                   {role === '1' ? (
//                     <>
//                       {/* Routes khusus untuk admin */}
//                       <Route
//                         path="/"
//                         element={
//                           <>
//                             <PageTitle title="Admin Dashboard | PT SANOH INDONESIA" />
//                             <Dashboard />
//                           </>
//                         }
//                       />
//                       <Route
//                         path="/performance-report"
//                         element={
//                           <>
//                             <PageTitle title="Performance Report | PT SANOH INDONESIA" />
//                             <PerformanceReport />
//                           </>
//                         }
//                       />
//                       <Route
//                         path="/user-management"
//                         element={
//                           <>
//                             <PageTitle title="User Management | PT SANOH INDONESIA" />
//                             {/* <UserManagement /> */}
//                           </>
//                         }
//                       />
//                       {/* Tambahkan routes lain untuk admin */}
//                     </>
//                   ) : (
//                     <>
//                       {/* Routes khusus untuk user */}
//                       <Route
//                         path="/"
//                         element={
//                           <>
//                             <PageTitle title="User Dashboard | PT SANOH INDONESIA" />
//                             <ECommerce />
//                           </>
//                         }
//                       />
//                       <Route
//                         path="/profile"
//                         element={
//                           <>
//                             <PageTitle title="Profile | PT SANOH INDONESIA" />
//                             <Profile />
//                           </>
//                         }
//                       />
//                       {/* Tambahkan routes lain untuk user */}
//                     </>
//                   )}
//                 </Routes>
//               </DefaultLayout>
//             }
//           />
//         )}
//       </Routes>
//   );
// }

// export default App;

