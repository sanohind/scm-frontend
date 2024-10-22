import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
// import AdminDashboard from './pages/Dashboard/AdminDashboard';
// import UserDashboard from './pages/Dashboard/UserDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DefaultLayout from './layout/DefaultLayout';
import ECommerce from './pages/Dashboard/ECommerce';
import Dashboard from './pages/Dashboard/Dashboard';
import PerformanceReport from './pages/PerformanceReport';


function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [role, setRole] = useState<string | null>(() => {
    return localStorage.getItem('userRole');
  });
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Mendapatkan status autentikasi dan peran pengguna dari localStorage
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setRole(userRole);
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
  }, []);

  // Mengarahkan ke halaman login jika belum terautentikasi
  useEffect(() => {
    if (!isAuthenticated && pathname !== '/auth/signin') {
      navigate('/auth/signin');
    }
  }, [isAuthenticated, pathname, navigate]);

  return loading ? (
    <Loader />
  ) : (
      <Routes>
        {!isAuthenticated ? (
          <>
            <Route
              path="/auth/signin"
              element={
                <>
                  <PageTitle title="Signin SCM | PT SANOH INDONESIA" />
                  <SignIn setIsAuthenticated={setIsAuthenticated} setRole={setRole} />
                </>
              }
            />
            {/* Tambahkan route lain jika diperlukan */}
          </>
        ) : (
          // Menggunakan DefaultLayout dan meneruskan prop role
          <Route
            path="*"
            element={
              <DefaultLayout role={role}>
                <Routes>
                  {role === 'supplier' ? (
                    <>
                      {/* Routes khusus untuk admin */}
                      <Route
                        path="/"
                        element={
                          <>
                            <PageTitle title="Admin Dashboard | PT SANOH INDONESIA" />
                            <Dashboard />
                          </>
                        }
                      />
                      <Route
                        path="/performance-report"
                        element={
                          <>
                            <PageTitle title="Performance Report | PT SANOH INDONESIA" />
                            <PerformanceReport />
                          </>
                        }
                      />
                      <Route
                        path="/user-management"
                        element={
                          <>
                            <PageTitle title="User Management | PT SANOH INDONESIA" />
                            {/* <UserManagement /> */}
                          </>
                        }
                      />
                      {/* Tambahkan routes lain untuk admin */}
                    </>
                  ) : (
                    <>
                      {/* Routes khusus untuk user */}
                      <Route
                        path="/"
                        element={
                          <>
                            <PageTitle title="User Dashboard | PT SANOH INDONESIA" />
                            <ECommerce />
                          </>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <>
                            <PageTitle title="Profile | PT SANOH INDONESIA" />
                            <Profile />
                          </>
                        }
                      />
                      {/* Tambahkan routes lain untuk user */}
                    </>
                  )}
                </Routes>
              </DefaultLayout>
            }
          />
        )}
      </Routes>
  );
}

export default App;
