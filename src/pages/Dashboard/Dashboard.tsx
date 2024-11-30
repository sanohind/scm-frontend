import React, { useEffect, useState } from 'react';
import DashboardSuperAdmin from './Pages/Admin/DashboardSuperAdmin';
import DashboardAdminPurchasingWarehouse from './Pages/Admin/DashboardAdminPurchasingWarehouse';
import DashboardAdminSubcont from './Pages/Admin/DashboardAdminSubcont';
import DashboardSupplierMarketing from './Pages/Customer/DashboardSupplierMarketing';
import DashboardSupplierWarehouseSubcont from './Pages/Customer/DashboardSupplierWarehouseSubcont';

const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  if (userRole === 'super-admin') {
    return <DashboardSuperAdmin />;
  } else if (userRole === 'admin-purchasing' || userRole === 'admin-warehouse') {
    return <DashboardAdminPurchasingWarehouse />;
  } else if (userRole === 'admin-subcont') {
    return <DashboardAdminSubcont />;
  } else if (userRole === 'supplier-marketing' || userRole === 'supplier-subcont-marketing') {
    return <DashboardSupplierMarketing />;
  } else if (userRole === 'supplier-warehouse' || userRole === 'supplier-subcont') {
    return <DashboardSupplierWarehouseSubcont />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default Dashboard;
