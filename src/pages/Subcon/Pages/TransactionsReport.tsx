import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import MultiSelect from '../../../components/Forms/MultiSelect';
import { ToastContainer } from 'react-toastify';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

// Dummy data representing transaction logs
const transactionLogs = [
  {
    timestamp: '2023-10-01T10:00:00Z',
    type: 'ingoing',
    status: 'fresh',
    partName: 'Brake Pipe',
    partNumber: 'P001',
    qtyOk: 100,
    qtyNg: 5,
  },
  {
    timestamp: '2023-10-02T11:00:00Z',
    type: 'ready',
    status: 'replating',
    partName: 'Fuel Line',
    partNumber: 'P002',
    qtyOk: 75,
    qtyNg: 3,
  },
  // Add more dummy data as needed
];

const partOptions = [
  { value: 'Brake Pipe', text: 'Brake Pipe' },
  { value: 'Fuel Line', text: 'Fuel Line' },
  { value: 'Hydraulic Hose', text: 'Hydraulic Hose' },
  { value: 'Coupling', text: 'Coupling' },
  { value: 'Steel Tube', text: 'Steel Tube' },
];

const TransactionReport = () => {
  const [filteredData, setFilteredData] = useState(transactionLogs);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    let filtered = [...transactionLogs];

    // Filter by transaction type
    if (selectedTransactionTypes.length > 0) {
      filtered = filtered.filter((row) => selectedTransactionTypes.includes(row.type));
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((row) => selectedStatuses.includes(row.status));
    }

    // Filter by part name
    if (selectedParts.length > 0) {
      filtered = filtered.filter((row) => selectedParts.includes(row.partName));
    }

    // Filter by date range
    if (dateRange[0].startDate && dateRange[0].endDate) {
      filtered = filtered.filter((row) => {
        const rowDate = new Date(row.timestamp);
        return rowDate >= dateRange[0].startDate && rowDate <= new Date(dateRange[0].endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
  }, [selectedTransactionTypes, selectedStatuses, selectedParts, dateRange, sortConfig]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);



  return (
    <>
      <ToastContainer />
      <Breadcrumb pageName="Transaction Report" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
            <div className="flex justify-between gap-4">
              <div className="relative">
                <div className="border rounded px-4 py-3 cursor-pointer bg-white flex justify-between text-gray-400" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                  {dateRange[0].startDate && dateRange[0].endDate ? (
                  `${dateRange[0].startDate.toLocaleDateString()} - ${dateRange[0].endDate.toLocaleDateString()}`
                  ) : (
                  'Select Date Range'
                  )}
                    {dateRange[0].startDate && dateRange[0].endDate && (
                    <button
                      className="ml-2 text-black"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDateRange([{ startDate: null, endDate: null, key: 'selection' }]);
                      }}
                      >
                      &times;
                    </button>
                  )}
                </div>
                {isDatePickerOpen && (
                  <>
                    <div 
                      className="fixed inset-0" 
                      onClick={() => setIsDatePickerOpen(false)}
                    />
                    <div className="absolute z-10 mt-2">
                      <DateRange
                        editableDateInputs={true}
                        onChange={item => {
                          setDateRange([{
                            startDate: item.selection.startDate || null,
                            endDate: item.selection.endDate || null,
                            key: 'selection'
                          }]);
                        }}
                        moveRangeOnFirstSelection={false}
                        ranges={dateRange}
                        className="border rounded shadow-lg bg-white"
                      />
                    </div>
                  </>
                )}
              </div>
              <MultiSelect
                id="transactionTypeSelect"
                label="Filter by Transaction Type"
                options={[
                { value: 'ingoing', text: 'Ingoing' },
                { value: 'ready', text: 'Ready' },
                { value: 'outgoing', text: 'Outgoing' },
                ]}
                selectedOptions={selectedTransactionTypes}
                onChange={setSelectedTransactionTypes}
              />
              <MultiSelect
                id="statusSelect"
                label="Filter by Status"
                options={[
                { value: 'fresh', text: 'Fresh' },
                { value: 'replating', text: 'Replating' },
                ]}
                selectedOptions={selectedStatuses}
                onChange={setSelectedStatuses}
              />
              <MultiSelect
                id="partNameSelect"
                label="Filter by Part Name"
                options={partOptions}
                selectedOptions={selectedParts}
                onChange={setSelectedParts}
              />
            </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Timestamp</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Transaction Type</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Status</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Part Name</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Part Number</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Quantity OK</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Quantity NG</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-4 text-center">{row.type}</td>
                      <td className="px-2 py-4 text-center">{row.status}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.qtyOk}</td>
                      <td className="px-2 py-4 text-center">{row.qtyNg}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalRows={filteredData.length}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default TransactionReport;