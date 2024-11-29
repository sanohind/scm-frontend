// Dashboard.tsx

import React, { useEffect, useState } from 'react';
import DashboardSupplier from './Pages/DashboardSupplier';
import DashboardPurchasingWarehouse from './Pages/DashboardPurchasingWarehouse';
import DashboardAdmin from './Pages/DashboardAdmin';
import DashboardAdminSubcont from './Pages/DashboardAdminSubcont';


const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  if (userRole === 'admin') {
    return <DashboardAdmin />;
  } else if (userRole === 'purchasing' || userRole === 'warehouse') {
    return <DashboardPurchasingWarehouse />;
  } else if (userRole === 'supplier' || userRole === 'subcont') {
    return <DashboardSupplier />;
  } else if (userRole === 'admin') {
    return <DashboardAdmin />;
  }else if (userRole === 'admin-subcont') {
    return <DashboardAdminSubcont />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default Dashboard;
