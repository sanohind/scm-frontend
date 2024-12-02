import { useEffect, useState } from "react";
import HistoryDeliveryNote from "./Pages/History/HistoryDeliveryNote";
import WarehouseHistoryDeliveryNote from "./Pages/History/WarehouseHistoryDeliveryNote";

const IndexHistoryDeliveryNote: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);
  
    if (userRole === 'supplier-marketing' || userRole === 'supplier-subcont-marketing' || userRole === 'supplier-warehouse' || userRole === 'supplier-subcont') {
        return <HistoryDeliveryNote />;
    } else if (userRole === 'admin-warehouse') {
        return <WarehouseHistoryDeliveryNote />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexHistoryDeliveryNote;