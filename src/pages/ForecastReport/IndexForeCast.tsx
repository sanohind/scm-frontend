import React, { useEffect, useState } from 'react';

import Forecast from './Pages/Forecast';
import CreateForecast from './Pages/CreateForecast';

const IndexForeCast: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);

    if (userRole === 'supplier-marketing' || userRole === 'supplier-subcont-marketing') {
        return <Forecast />;
    } else if (userRole === 'admin-purchasing' || userRole === 'super-user') {
        return <CreateForecast />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexForeCast;