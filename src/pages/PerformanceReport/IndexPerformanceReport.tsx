import { useEffect, useState } from "react";
import PerformanceReport from "./Pages/PerformanceReport";
import CreatePerformanceReport from "./Pages/CreatePerformanceReport";

const IndexPerformanceReport: React.FC = () => {
    const [userRole, setUserRole] = useState<string>('');
  
    useEffect(() => {
      const role = localStorage.getItem('role') || '';
      setUserRole(role);
    }, []);
  
    if (userRole === 'supplier' || userRole === 'subcont') {
      return <PerformanceReport />;
    } else if (userRole === 'purchasing') {
      return <CreatePerformanceReport />;
    } else {
      return <div>No dashboard available for your role.</div>;
    }
  };
  
  export default IndexPerformanceReport;