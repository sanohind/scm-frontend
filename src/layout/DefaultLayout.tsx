import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';


const DefaultLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi pengambilan user role dari localStorage atau API
    const role = localStorage.getItem('userRole');
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
        
        <main className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
          {/* Render halaman sesuai route */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DefaultLayout;
