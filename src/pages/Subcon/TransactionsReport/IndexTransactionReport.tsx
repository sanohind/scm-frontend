import { useEffect, useState } from "react";
import TransactionReport from "./Pages/TransactionsReport";
import AdminTransactionReport from "./Pages/AdminTransactionReport";

const IndexTransactionsReport: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);

    if (userRole === 'supplier-subcont-marketing' || userRole === 'supplier-subcont') {
        return <TransactionReport />;
    } else if (userRole === 'admin-subcont') {
        return <AdminTransactionReport />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexTransactionsReport;