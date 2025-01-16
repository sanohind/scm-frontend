import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../../../components/Table/Pagination';
import MultiSelect from '../../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { API_List_Item_Subcont, API_Transaction_Subcont } from '../../../../api/api';
import SearchBar from '../../../../components/Table/SearchBar';
import DatePicker from '../../../../components/Forms/DatePicker';
import Button from '../../../../components/Forms/Button';

const TransactionReport = () => {
  interface TransactionLog {
    timestamp: string;
    type: string;
    status: string;
    partName: string;
    partNumber: string;
    qtyOk: number;
    qtyNg: number;
    qtyTotal: number;
    deliveryNote: string;
    actualQtyOk: number;
    actualQtyNg: number;
    actualQtyTotal: number;
    response: string;
  }
  
  const [filteredData, setFilteredData] = useState<TransactionLog[]>([]);
  const [allData, setAllData] = useState<TransactionLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const NowDate = new Date();
  const [startDate, setStartDate] = useState<Date>(NowDate);
  const [endDate, setEndDate] = useState<Date>(NowDate);
  const [partOptions, setPartOptions] = useState<{ value: string; text: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(false);

  useEffect(() => {
    fetchPartOptions();
  }, []);

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
          value: item.part_number,
          text: `${item.part_number} | ${item.part_name}`,
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

  const fetchTransactionLogs = async () => {
    if (!startDate || !endDate) {
      toast.warning('Start Date and End Date must be selected');
      return;
    }

    setLoading(true);
    setIsSearchClicked(true);

    try {
      const token = localStorage.getItem('access_token');

      // Format dates in 'YYYY-MM-DD' format
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-CA');
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
          qtyTotal: item.qty_total,
          deliveryNote: item.delivery_note,
          actualQtyOk: item.actual_qty_ok,
          actualQtyNg: item.actual_qty_ng,
          actualQtyTotal: item.actual_qty_total,
          response: item.response,
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
      filtered = filtered.filter((row: any) => selectedParts.includes(row.partNumber));
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
    // Format dates in 'YYYY-MM-DD' format
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-CA');
    };

    const startDateString = formatDate(startDate);
    const endDateString = formatDate(endDate);

    const ws = XLSX.utils.json_to_sheet(
      filteredData.map((row) => ({
        'Transaction Date': new Date(row.timestamp).toLocaleString(),
        'Delivery Note': row.deliveryNote,
        'Transaction Type': row.type,
        'Status': row.status,
        'Part Name': row.partName,
        'Part Number': row.partNumber,
        'Quantity OK': row.qtyOk,
        'Quantity NG': row.qtyNg,
        'Total Quantity': row.qtyTotal,
        'Actual Quantity OK': row.actualQtyOk,
        'Actual Quantity NG': row.actualQtyNg,
        'Actual Total Quantity': row.actualQtyTotal,
      }))
    );
    

    ws['!cols'] = [
      { wch: 20 }, // Transaction Date
      { wch: 25 }, // Delivery Note
      { wch: 20 }, // Transaction Type
      { wch: 15 }, // Status
      { wch: 20 }, // Part Name
      { wch: 20 }, // Part Number
      { wch: 15 }, // Quantity OK
      { wch: 15 }, // Quantity NG
      { wch: 18 }, // Total Quantity
      { wch: 18 }, // Actual Quantity OK
      { wch: 18 }, // Actual Quantity NG
      { wch: 20 }, // Actual Total Quantity
    ];

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
          '',
          filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
          filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
          filteredData.reduce((sum, row) => sum + row.qtyTotal, 0),
          filteredData.reduce((sum, row) => sum + row.actualQtyOk, 0),
          filteredData.reduce((sum, row) => sum + row.actualQtyNg, 0),
          filteredData.reduce((sum, row) => sum + row.actualQtyTotal, 0),
        ],
      ],
      { origin: -1 }
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transaction Report');

    const bpName = localStorage.getItem('bp_code') || 'All';
    XLSX.writeFile(wb, `transaction_report_${bpName}_${startDateString}_to_${endDateString}.xlsx`);
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
                <DatePicker
                  id="startDate"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select Start Date"
                  label="Start Date"
                />
              </div>

              {/* End Date */}
              <div className="w-full">
                <DatePicker
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select End Date"
                  label="End Date"
                />
              </div>

              {/* Search Button */}
              <div className="w-full flex items-center">
                <Button
                  title="Search"
                  onClick={fetchTransactionLogs}
                />
                </div>
            </div>

            {/* Filters and Search Bar */}
            <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${!isSearchClicked ? 'opacity-50 pointer-events-none' : ''}`}>
              {/* Transaction Type */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <MultiSelect
                  id="transactionTypeSelect"
                  label="Filter by Transaction Type"
                  options={[
                    { value: 'Incoming', text: 'Incoming' },
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
            <div className={`${!isSearchClicked ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Note
              </label>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div className="md:w-1/2 lg:w-1/3">
                  <SearchBar
                    placeholder="Filter by Delivery Note"
                    onSearchChange={setSearchQuery}
                  />
                </div>
                {/* Download Buttons */}
                <div className="flex gap-2 self-center">
                  <Button
                    title="Download Excel"
                    icon={FaFileExcel}
                    onClick={handleDownloadExcel}
                    disabled={!isSearchClicked || filteredData.length === 0}
                  />
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
                    <th className="px-1 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]" rowSpan={2}>Date Time</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Delivery Note</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]" rowSpan={2}>Transaction Type</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[9%]" rowSpan={2}>Status</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]" colSpan={3}>Confirm Supplier</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]" colSpan={3}>Received Sanoh</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]" rowSpan={2}>Response</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY OK</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY NG</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">Total</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY OK</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY NG</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">Total</th>
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
                      <tr key={index} 
                      className={`hover:bg-gray-50 ${row.deliveryNote?.startsWith('System-') ? 'bg-red-200' : ''}`}
                      >
                        <td className="px-1 py-3 text-center whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.deliveryNote}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.type}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partName}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partNumber}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyOk}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyNg}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyTotal}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.actualQtyOk === null ? '-' : row.actualQtyOk}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.actualQtyNg === null ? '-' : row.actualQtyNg}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.actualQtyTotal === null ? '-' : row.actualQtyTotal}
                        </td>
                        <td
                          className={`px-3 py-3 text-center whitespace-nowrap ${
                            row.response === 'Under Review' || row.response?.startsWith('System Review-') ? 'text-primary' : ''
                          }`}
                        >
                          {row.response || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={13} className="px-3 py-4 text-center text-gray-500">No data available. Please Select Date Range</td>
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
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                      {paginatedData.reduce((sum, row) => sum + (row.actualQtyOk || 0), 0) || '-'}
                    </td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                      {paginatedData.reduce((sum, row) => sum + (row.actualQtyNg || 0), 0) || '-'}
                    </td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                      {paginatedData.reduce((sum, row) => sum + ((row.actualQtyOk || 0) + (row.actualQtyNg || 0)), 0) || '-'}
                    </td>
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center"></td>
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