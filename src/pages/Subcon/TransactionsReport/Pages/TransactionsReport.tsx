import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../../Table2/Pagination';
import MultiSelect from '../../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { API_List_Item_Subcont, API_Transaction_Subcont } from '../../../../api/api';
import SearchBar from '../../../Table2/SearchBar';

const TransactionReport = () => {
  interface TransactionLog {
    timestamp: string;
    type: string;
    status: string;
    partName: string;
    partNumber: string;
    qtyOk: number;
    qtyNg: number;
    deliveryNote: string;
  }
  
  const [filteredData, setFilteredData] = useState<TransactionLog[]>([]);
  const [allData, setAllData] = useState<TransactionLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [partOptions, setPartOptions] = useState<{ value: string; text: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartOptions = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(API_List_Item_Subcont(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.status) {
          const options = result.data.map((item: { part_number: string; part_name: string }) => ({
            value: item.part_name,
            text: item.part_name,
          }));
          setPartOptions(options);
        } else {
          console.error('Failed to fetch part options:', result.message);
          toast.error('Failed to fetch part options');
        }
      } catch (error) {
        console.error('Error fetching part options:', error);
        toast.error('Error fetching part options');
      }
    };

    fetchPartOptions();
  }, []);

  const fetchTransactionLogs = async () => {
    if (!startDate || !endDate) {
      toast.warning('Start Date and End Date must be selected');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      // Format dates in 'YYYY-MM-DD' format
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-CA'); // 'en-CA' gives 'YYYY-MM-DD' format
      };

      const startDateString = formatDate(startDate);
      const endDateString = formatDate(endDate);

      const response = await fetch(
        `${API_Transaction_Subcont()}?start_date=${startDateString}&end_date=${endDateString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.status) {
        const logs = result.data.map((item: any) => ({
          timestamp: `${item.transaction_date}T${item.transaction_time}`,
          type: item.transaction_type,
          status: item.status,
          partName: item.part_name,
          partNumber: item.part_number,
          qtyOk: item.qty_ok,
          qtyNg: item.qty_ng,
          deliveryNote: item.delivery_note,
        }));
        setAllData(logs);
        setFilteredData(logs);
      } else {
        console.error('Failed to fetch transaction logs:', result.message);
        toast.error('Failed to fetch transaction logs');
      }
    } catch (error) {
      console.error('Error fetching transaction logs:', error);
      toast.error('Error fetching transaction logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchTransactionLogs();
    }
  }, [startDate, endDate]);

  useEffect(() => {
    let filtered = [...allData];

    // Filter by transaction type
    if (selectedTransactionTypes.length > 0) {
      filtered = filtered.filter((row: any) => selectedTransactionTypes.includes(row.type));
    }

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((row: any) => selectedStatuses.includes(row.status));
    }
    
    // Filter by part name
    if (selectedParts.length > 0) {
      filtered = filtered.filter((row: any) => selectedParts.includes(row.partName));
    }
    
    // Filter by delivery note
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.deliveryNote.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    setFilteredData(filtered);
  }, [allData, selectedTransactionTypes, selectedStatuses, selectedParts, searchQuery]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDownloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        Date: new Date(row.timestamp).toLocaleString(),
        'Transaction Type': row.type,
        Status: row.status,
        'Part Name': row.partName,
        'Part Number': row.partNumber,
        'Quantity OK': row.qtyOk,
        'Quantity NG': row.qtyNg,
        Total: row.qtyOk + row.qtyNg,
      }))
    );

    // Add totals row
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        [
          'Totals:',
          '',
          '',
          '',
          '',
          filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
          filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
          filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0),
        ],
      ],
      { origin: -1 }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaction Report');

    const bpName = localStorage.getItem('bp_code') || 'All';
    XLSX.writeFile(wb, `transaction_report_${bpName}.xlsx`);
  };

  return (
    <>
      <ToastContainer />
      <Breadcrumb pageName="Transaction Report" />
      <div className="font-poppins bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          <div className='flex flex-col gap-4'>
            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Start Date */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startDate ? startDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                />
              </div>

              {/* End Date */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={endDate ? endDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                />
              </div>

              {/* Transaction Type */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <MultiSelect
                  id="transactionTypeSelect"
                  label="Filter by Transaction Type"
                  options={[
                    { value: 'Ingoing', text: 'Ingoing' },
                    { value: 'Process', text: 'Process' },
                    { value: 'Outgoing', text: 'Outgoing' },
                  ]}
                  selectedOptions={selectedTransactionTypes}
                  onChange={setSelectedTransactionTypes}
                />
              </div>

              {/* Status */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <MultiSelect
                  id="statusSelect"
                  label="Filter by Status"
                  options={[
                    { value: 'Fresh', text: 'Fresh' },
                    { value: 'Replating', text: 'Replating' },
                  ]}
                  selectedOptions={selectedStatuses}
                  onChange={setSelectedStatuses}
                />
              </div>

              {/* Part Name */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Name
                </label>
                <MultiSelect
                  id="partNameSelect"
                  label="Filter by Part Name"
                  options={partOptions}
                  selectedOptions={selectedParts}
                  onChange={setSelectedParts}
                />
              </div>
            </div>

            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Note
              </label>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <SearchBar
                  placeholder="Filter by Delivery Note"
                  onSearchChange={setSearchQuery}
                />
                {/* Download Buttons */}
                <div className="flex gap-2 self-center">
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                    onClick={handleDownloadExcel}
                  >
                    <FaFileExcel className="w-4 h-4" />
                    <span>Download Excel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          

          {/* Table Section */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-1 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">Date Time</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[17%]">Delivery Note</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[9%]">Transaction Type</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]">Status</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]">Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]">Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY OK</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY NG</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="px-1 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </td>
                      </tr>
                    ))
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-1 py-3 text-center whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.deliveryNote}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.type}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partName}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partNumber}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyOk}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyNg}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyOk + row.qtyNg}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-gray-500">No data available. Please Select Date Range</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={6} className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">Totals:</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">{paginatedData.reduce((sum, row) => sum + row.qtyOk, 0)}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">{paginatedData.reduce((sum, row) => sum + row.qtyNg, 0)}</td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                      {paginatedData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination
              totalRows={filteredData.length}
              rowsPerPage={rowsPerPage}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionReport;