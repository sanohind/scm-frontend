import { useEffect, useState } from "react";
import StockItems from "./Pages/StockItems";
import AdminStockItems from "./Pages/AdminStockItems";


const IndexStockItems: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
  
    useEffect(() => {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }, []);
  
    if (userRole === 'supplier-subcont-marketing' || userRole === 'supplier-subcont') {
      return <StockItems />;
    } else if (userRole === 'admin-subcont') {
      return <AdminStockItems />;
    } else {
      return <div>No dashboard available for your role.</div>;
    }
  };

export default IndexStockItems;