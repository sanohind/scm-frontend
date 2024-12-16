import React, { useEffect, useState } from 'react';
import DashboardSuperAdmin from './Pages/Admin/SuperAdmin';
import DashboardAdminPurchasingWarehouse from './Pages/Admin/AdminPurchasingWarehouse';
import DashboardAdminSubcont from './Pages/Admin/AdminSubcont';
import DashboardSupplierMarketing from './Pages/Customer/SupplierMarketing';
import DashboardSupplierSubcontMarketing from './Pages/Customer/SupplierSubcontMarketing';
import DashboardSupplierWarehouse from './Pages/Customer/SupplierWarehouse';
import DashboardSupplierSubcont from './Pages/Customer/SupplierSubcont';
import DashboardSuperUser from './Pages/Admin/SuperUser';

const Dashboard: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  if (userRole === 'super-admin') {
    return <DashboardSuperAdmin />;
  } else if (userRole === 'super-user') {
    return <DashboardSuperUser />;
  } else if (userRole === 'admin-purchasing' || userRole === 'admin-warehouse') {
    return <DashboardAdminPurchasingWarehouse />;
  } else if (userRole === 'admin-subcont') {
    return <DashboardAdminSubcont />;
  } else if (userRole === 'supplier-marketing') {
    return <DashboardSupplierMarketing />;
  } else if (userRole === 'supplier-subcont-marketing') {
    return <DashboardSupplierSubcontMarketing />;
  } else if (userRole === 'supplier-warehouse') {
    return <DashboardSupplierWarehouse />;
  } else if (userRole === 'supplier-subcont') {
    return <DashboardSupplierSubcont />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default Dashboard;
