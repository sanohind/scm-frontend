import { useEffect, useState } from "react";
import HistoryPurchaseOrder from "./Pages/History/HistoryPurchaseOrder";
import PurchasingHistoryPurchaseOrder from "./Pages/History/PurchasingHistoryPurchaseOrder";

const IndexHistoryPurchaseOrder: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
  
    useEffect(() => {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }, []);
  
    if (userRole === 'supplier-marketing' || userRole === 'supplier-subcont-marketing') {
      return <HistoryPurchaseOrder />;
    } else if (userRole === 'admin-purchasing') {
      return <PurchasingHistoryPurchaseOrder />;
    } else {
      return <div>No dashboard available for your role.</div>;
    }
  };
  
  export default IndexHistoryPurchaseOrder;