import { useEffect, useState } from "react";
import DeliveryNote from "./DeliveryNote";
import WarehouseDeliveryNote from "./WarehouseDeliveryNote";

const IndexDeliveryNote: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
  
    useEffect(() => {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }, []);
  
    if (userRole === 'supplier' || userRole === 'subcont') {
      return <DeliveryNote />;
    } else if (userRole === 'warehouse') {
      return <WarehouseDeliveryNote />;
    } else {
      return <div>No dashboard available for your role.</div>;
    }
  };
  
  export default IndexDeliveryNote;