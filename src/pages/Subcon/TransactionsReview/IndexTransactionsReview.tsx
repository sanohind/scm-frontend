import { useEffect, useState } from "react";
import AdminTransactionsReview from "./Pages/AdminTransactionsReview";


const IndexTransactionsReview: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
    
    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);

    if (userRole === 'admin-subcont' || userRole === 'super-user') {
        return <AdminTransactionsReview />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexTransactionsReview;