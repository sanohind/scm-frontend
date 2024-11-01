import React, { useEffect, useState } from 'react';

import Forecast from './Pages/Forecast';
import CreateForecast from './Pages/CreateForecast';

const IndexForeCast: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const role = localStorage.getItem('role') || '';
        setUserRole(role);
    }, []);

    if (userRole === 'supplier' || userRole === 'subcont') {
        return <Forecast />;
    } else if (userRole === 'purchasing') {
        return <CreateForecast />;
    } else {
        return <div>No dashboard available for your role.</div>;
    }
};

export default IndexForeCast;