import { useEffect, useState } from "react";
import PurchaseOrder from "./PurchaseOrder";
import PurchasingPurchaseOrder from "./PurchasingPurchaseOrder";

const IndexPurchaseOrder: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
  
    useEffect(() => {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }, []);
  
    if (userRole === 'supplier' || userRole === 'subcon') {
      return <PurchaseOrder />;
    } else if (userRole === 'purchasing') {
      return <PurchasingPurchaseOrder />;
    } else {
      return <div>No dashboard available for your role.</div>;
    }
  };
  
  export default IndexPurchaseOrder;