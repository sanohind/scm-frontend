import { useEffect, useState } from "react";
import DeliveryNote from "./Pages/DN/DeliveryNote";
import WarehouseDeliveryNote from "./Pages/DN/WarehouseDeliveryNote";

const IndexDeliveryNote: React.FC = () => {
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const role = localStorage.getItem('role') || '';
    setUserRole(role);
  }, []);

  if (userRole === 'supplier-marketing' || userRole === 'supplier-subcont-marketing' || userRole === 'supplier-warehouse' || userRole === 'supplier-subcont') {
    return <DeliveryNote />;
  } else if (userRole === 'admin-warehouse' || userRole === 'admin-subcont') {
    return <WarehouseDeliveryNote />;
  } else {
    return <div>No dashboard available for your role.</div>;
  }
};

export default IndexDeliveryNote;