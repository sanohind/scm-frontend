// Dashboard.tsx

import React, { useEffect, useState } from 'react';
import DashboardSupplier from './DashboardSupplier';
import DashboardPurchasingWarehouse from './DashboardPurchasingWarehouse';
import DashboardSubcon from './DashboardSubcon';
import DashboardAdmin from './DashboardAdmin';


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
  } else if (userRole === 'supplier') {
    return <DashboardSupplier />;
  } else if (userRole === 'subcon') {
    return <DashboardSubcon />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default Dashboard;
