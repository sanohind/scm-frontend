import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { Table } from '../components/TableSettings';


const PerformanceReport = () => {
  return (
    <>
      <Breadcrumb pageName="Performance Report" />

      <div className="mt-4">
        <Table columns={columns} data={data} />
      </div>
    </>
  );
};

export default PerformanceReport;
