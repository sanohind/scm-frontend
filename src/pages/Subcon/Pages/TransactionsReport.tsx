import { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import MultiSelect from '../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { API_List_Item_Subcont, API_Transaction_Subcont } from '../../../api/api';

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
  const [rowsPerPage] = useState(6);
  const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [partOptions, setPartOptions] = useState<{ value: string; text: string }[]>([]);

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
      console.error('Start Date and End Date must be selected');
      toast.warning('Start Date and End Date must be selected');
      return;
    }

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

    // Apply sorting
    setFilteredData(filtered);
  }, [allData, selectedTransactionTypes, selectedStatuses, selectedParts]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      'Date',
      'Transaction Type',
      'Status',
      'Part Name',
      'Part Number',
      'Quantity OK',
      'Quantity NG',
      'Total',
    ];
    const tableRows: (string | number)[][] = [];

    filteredData.forEach((row) => {
      const rowData = [
        new Date(row.timestamp).toLocaleString(),
        row.type,
        row.status,
        row.partName,
        row.partNumber,
        row.qtyOk,
        row.qtyNg,
        row.qtyOk + row.qtyNg,
      ];
      tableRows.push(rowData);
    });

    // Add totals row
    const totalsRow = [
      'Totals:',
      '',
      '',
      '',
      '',
      filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
      filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
      filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0),
    ];
    tableRows.push(totalsRow);

    // Add logo
    const img = new Image();
    img.src = '../../../src/images/logo_sanoh_address.png';
    img.onload = () => {
      doc.addImage(img, 'PNG', 10, 10, 100, 20);

      // Add title
      const bpName = localStorage.getItem('bp_code') || 'All';
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transaction Report ${bpName}`, doc.internal.pageSize.getWidth() / 2, 38, {
        align: 'center',
      });

      // Add date range
      const startDateString = startDate ? startDate.toLocaleDateString() : 'All';
      const endDateString = endDate ? endDate.toLocaleDateString() : 'All';
      doc.setFont('helvetica', 'normal');
      doc.text(`Date Range: ${startDateString} - ${endDateString}`, 10, 45);

      // Add filters
      const filters = [];
      if (selectedTransactionTypes.length > 0)
        filters.push(`Transaction Types: ${selectedTransactionTypes.join(', ')}`);
      if (selectedStatuses.length > 0) filters.push(`Status: ${selectedStatuses.join(', ')}`);
      if (selectedParts.length > 0) filters.push(`Parts: ${selectedParts.join(', ')}`);
      doc.setFont('helvetica', 'normal');
      if (filters.length > 0) doc.text(`Filters: ${filters.join(' | ')}`, 10, 55);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: filters.length > 0 ? 60 : 50,
        styles: { fontSize: 8 },
      });

      // Add download date
      const downloadDate = new Date().toLocaleString();
      doc.text(`Downloaded on: ${downloadDate}`, 10, doc.internal.pageSize.getHeight() - 10);

      // Save the PDF
      doc.save(`transaction_report_${bpName}.pdf`);
    };
  };

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

          {/* Download Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
              onClick={handleDownloadPDF}
            >
              <FaFilePdf className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
              onClick={handleDownloadExcel}
            >
              <FaFileExcel className="w-4 h-4" />
              <span>Download Excel</span>
            </button>
          </div>

          {/* Table Section */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    {['Date', 'Delivery Note', 'Transaction Type', 'Status', 'Part Name', 'Part Number', 'Qty OK', 'Qty NG', 'Total'].map((header) => (
                      <th key={header} className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
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