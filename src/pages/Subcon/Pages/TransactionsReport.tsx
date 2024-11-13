import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import MultiSelect from '../../../components/Forms/MultiSelect';
import { ToastContainer } from 'react-toastify';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Dummy data representing transaction logs
const transactionLogs = [

  {
    timestamp: '2023-10-02T11:00:00Z',
    type: 'ready',
    status: 'replating',
    partName: 'Fuel Line',
    partNumber: 'P002',
    qtyOk: 75,
    qtyNg: 3,
  },
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
  
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Transaction Type", "Status", "Part Name", "Part Number", "Quantity OK", "Quantity NG", "Total"];
    const tableRows: (string | number)[][] = [];

    filteredData.forEach(row => {
      const rowData = [
        new Date(row.timestamp).toLocaleString(),
        row.type,
        row.status,
        row.partName,
        row.partNumber,
        row.qtyOk,
        row.qtyNg,
        row.qtyOk + row.qtyNg
      ];
      tableRows.push(rowData);
    });

    // Add totals row
    const totalsRow = [
      "Totals:",
      "",
      "",
      "",
      "",
      filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
      filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
      filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)
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
      doc.text(`Transaction Report ${bpName}`, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });

      // Add date range
      const startDate = dateRange[0].startDate ? new Date(dateRange[0].startDate).toLocaleDateString() : 'All';
      const endDate = dateRange[0].endDate ? new Date(dateRange[0].endDate).toLocaleDateString() : 'All';
      doc.setFont('helvetica', 'normal');
      doc.text(`Date Range: ${startDate} - ${endDate}`, 10, 45);

      // Add filters
      const filters = [];
      if (selectedTransactionTypes.length > 0) filters.push(`Transaction Types: ${selectedTransactionTypes.join(', ')}`);
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
    const ws = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      Date: new Date(row.timestamp).toLocaleString(),
      'Transaction Type': row.type,
      Status: row.status,
      'Part Name': row.partName,
      'Part Number': row.partNumber,
      'Quantity OK': row.qtyOk,
      'Quantity NG': row.qtyNg,
      Total: row.qtyOk + row.qtyNg,
    })));

    // Add totals row
    XLSX.utils.sheet_add_aoa(ws, [[
      'Totals:',
      '',
      '',
      '',
      '',
      filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
      filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
      filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)
    ]], { origin: -1 });

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
        <div className="flex flex-col p-6 gap-4">
          <div className="flex justify-between gap-4">
            <div className="relative w-1/4">
              <div
                className="border rounded px-4 py-3 cursor-pointer bg-white flex justify-between text-gray-400"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
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
                  <div className="fixed inset-0" onClick={() => setIsDatePickerOpen(false)} />
                  <div className="absolute z-10 mt-2">
                    <DateRange
                      editableDateInputs={true}
                      onChange={(item) => {
                        setDateRange([
                          {
                            startDate: item.selection.startDate || null,
                            endDate: item.selection.endDate || null,
                            key: 'selection',
                          },
                        ]);
                      }}
                      moveRangeOnFirstSelection={false}
                      ranges={dateRange}
                      className="border rounded shadow-lg bg-white"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="w-1/4">
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
            </div>
            <div className="w-1/4">
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
            </div>
            <div className="w-1/4">
              <MultiSelect
                id="partNameSelect"
                label="Filter by Part Name"
                options={partOptions}
                selectedOptions={selectedParts}
                onChange={setSelectedParts}
              />
            </div>
            
          </div>
          <div className="flex justify-end gap-4">
            

          <button
            className="bg-blue-900 text-white py-2 px-4 rounded-md flex items-center gap-2"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf />
            Download PDF
          </button>
          <button
            className="bg-blue-900 text-white py-2 px-4 rounded-md flex items-center gap-2"
            onClick={handleDownloadExcel}
          >
            <FaFileExcel />
            Download Excel
          </button>
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Date</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Delivery Note</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Transaction Type</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Status</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Part Name</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Part Number</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Quantity OK</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Quantity NG</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400">Total</th>
                </tr>
              </thead>

              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-4 text-center">{row.deliveryNote}</td>
                      <td className="px-2 py-4 text-center">{row.type}</td>
                      <td className="px-2 py-4 text-center">{row.status}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.qtyOk}</td>
                      <td className="px-2 py-4 text-center">{row.qtyNg}</td>
                      <td className="px-2 py-4 text-center">{row.qtyOk + row.qtyNg}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan={6} className="px-2 py-4 text-center font-semibold">Totals:</td>
                <td className="px-2 py-4 text-center font-semibold">
                  {paginatedData.reduce((sum, row) => sum + row.qtyOk, 0)}
                </td>
                <td className="px-2 py-4 text-center font-semibold">
                  {paginatedData.reduce((sum, row) => sum + row.qtyNg, 0)}
                </td>
                <td className="px-2 py-4 text-center font-semibold">
                  {paginatedData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)}
                </td>
              </tr>
            </tfoot>
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