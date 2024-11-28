// Dashboard.tsx

import React, { useEffect, useState } from 'react';
import DashboardSupplier from './Pages/DashboardSupplier';
import DashboardPurchasingWarehouse from './Pages/DashboardPurchasingWarehouse';
import DashboardAdmin from './Pages/DashboardAdmin';


const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  if (userRole === 'admin') {
    return <DashboardAdmin />;
  } else if (userRole === 'purchasing' || userRole === 'warehouse' || userRole === 'admin_subcont') {
    return <DashboardPurchasingWarehouse />;
  } else if (userRole === 'supplier' || userRole === 'subcont') {
    return <DashboardSupplier />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default Dashboard;
