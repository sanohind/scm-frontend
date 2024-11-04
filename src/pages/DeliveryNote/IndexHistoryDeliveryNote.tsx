import { useEffect, useState } from "react";
import HistoryDeliveryNote from "./Pages/History/HistoryDeliveryNote";
import WarehouseHistoryDeliveryNote from "./Pages/History/WarehouseHistoryDeliveryNote";

const IndexHistoryDeliveryNote: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);
  
    if (userRole === 'supplier' || userRole === 'subcont') {
        return <HistoryDeliveryNote />;
    } else if (userRole === 'warehouse') {
        return <WarehouseHistoryDeliveryNote />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexHistoryDeliveryNote;