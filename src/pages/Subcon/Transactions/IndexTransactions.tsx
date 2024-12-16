import { useEffect, useState } from "react";
import Transactions from "./Pages/Transactions";
import AdminTransactions from "./Pages/AdminTransactions";

const IndexTransactions: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);

    if (userRole === 'supplier-subcont-marketing' || userRole === 'supplier-subcont') {
        return <Transactions />;
    } else if (userRole === 'admin-subcont') {
        return <AdminTransactions />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexTransactions;