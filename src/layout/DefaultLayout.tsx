import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from './Header';
import Footer from './Footer/Footer';

const DefaultLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi pengambilan user role dari localStorage atau API
    const role = localStorage.getItem('role');
    setUserRole(role);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Tampilkan loader sementara
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} role={userRole}/>

      {/* Content Area */}
      <div className="relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
          {/* Render halaman sesuai route */}
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DefaultLayout;
