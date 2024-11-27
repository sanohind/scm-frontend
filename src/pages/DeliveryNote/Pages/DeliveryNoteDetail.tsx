import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../Table2/SearchBar';
import Pagination from '../../Table2/Pagination';
import { API_DN_Detail } from '../../../api/api';
import { FaFileExcel, FaPrint } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import * as XLSX from 'xlsx';

const DeliveryNoteDetail = () => {
  interface Detail {
    no: number;
    partNumber: string;
    partName: string;
    QTY: string;
    qtyLabel: string;
    qtyDelivered: string;
    qtyReceived: string;
    qtyConfirm: string;
    uom: string;
    [key: string]: string | number;
  }
  
  const [details, setDetails] = useState<Detail[]>([]);
  const [filteredData, setFilteredData] = useState<Detail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig] = useState({ key: '', direction: 'asc' });
  const location = useLocation();
  const navigate = useNavigate();
  const noDN = new URLSearchParams(location.search).get('noDN');
  const [dnDetails, setDNDetails] = useState({ noDN: '', noPO: '', planDelivery: '' });

  // Fetch Delivery Note Details from API
  const fetchDeliveryNoteDetails = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_DN_Detail()}${noDN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      setLoading(false);

      if (result.data && result.data) {

        const dn = result.data;

        setDNDetails({
            noDN: dn.no_dn || '-',
            noPO: dn.po_no || '-',
            planDelivery: dn.plan_delivery_date || '-',
        });
        
          const details = dn.detail.map((detail: any) => ({
            no: detail.dn_line,
            partNumber: detail.part_no || '-',
            partName: detail.item_desc_a || '-',
            QTY: detail.dn_qty || '-',
            qtyLabel: detail.dn_snp || '-',
            qtyDelivered: detail.receipt_qty || '-',
            qtyReceived: detail.receipt_qty || '-',
            qtyConfirm: detail.qty_confirm || '-',
            uom: detail.dn_unit || '-',
          }));

          setDetails(details);
          setFilteredData(details);
        
      } else {
        toast.error('No delivery note details found');
      }
    } catch (error) {
      console.error('Error fetching delivery note details:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching delivery note details: ${error.message}`);
      } else {
        toast.error('Error fetching delivery note details');
      }
    }
  };

  useEffect(() => {
    if (noDN) {
      fetchDeliveryNoteDetails();
    } else {
      toast.error('No delivery note number found');
      navigate('/delivery-note');
    }
  }, [noDN]);

  useEffect(() => {
    let filtered = [...details];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (row) =>
          row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.partName.toLowerCase().includes(searchQuery.toLowerCase())
      );
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

    if (searchQuery) {
        filtered = filtered.filter((row) =>
          row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.partName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

  }, [searchQuery, details, sortConfig]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handlePrintDN = () => {
    window.open(`/#/print/delivery-note?noDN=${noDN}`, '_blank');
  };

  const handlePrintLabel = () => {
    window.open(`/#/print/label/delivery-note?noDN=${noDN}`, '_blank');
  };

  const handleDownloadExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // First, create header rows with DN and PO information as array of arrays
    const headerRows = [
      ['Delivered To :  PT Sanoh Indonesia', '', '', '', '', '', '', '', '', ''], // Add empty cells to match column count
      ['No. DN :  ' + dnDetails.noDN, '', '', '', '', '', '', '', '', ''],
      ['No. PO :  ' + dnDetails.noPO, '', '', '', '', '', '', '', '', ''],
      ['Plan Delivery Date :  ' + dnDetails.planDelivery, '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['No', 'Part Number', 'Part Name', 'UoM', 'QTY PO', 'QTY Label', 'QTY Requested', 'QTY Confirm', 'QTY Delivered', 'QTY Minus']
    ];

    // Add worksheet configuration to merge cells
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
    ];

    // Convert all data to array format (including the actual data rows)
    const dataRows = filteredData.map(row => [
      row.no,
      row.partNumber,
      row.partName,
      row.UoM,
      Number(row.QTY) || 0,
      Number(row.qtyLabel) || 0,
      Number(row.qtyRequested) || 0,
      Number(row.qtyConfirm) || 0,
      Number(row.qtyDelivered) || 0,
      Number(row.qtyMinus) || 0
    ]);
  
    // Calculate totals
    const totals = {
      qtyPO: dataRows.reduce((sum, row) => sum + Number(row[4] || 0), 0),
      qtyLabel: dataRows.reduce((sum, row) => sum + Number(row[5] || 0), 0),
      qtyRequested: dataRows.reduce((sum, row) => sum + Number(row[6] || 0), 0),
      qtyConfirm: dataRows.reduce((sum, row) => sum + Number(row[7] || 0), 0),
      qtyDelivered: dataRows.reduce((sum, row) => sum + Number(row[8] || 0), 0),
      qtyMinus: dataRows.reduce((sum, row) => sum + Number(row[9] || 0), 0)
    };
  
    // Add totals row
    const totalsRow = [
      'Totals:',
      '',
      '',
      '',
      totals.qtyPO,
      totals.qtyLabel,
      totals.qtyRequested,
      totals.qtyConfirm,
      totals.qtyDelivered,
      totals.qtyMinus
    ];
  
    // Combine all rows
    const allRows = [...headerRows, ...dataRows, totalsRow];
  
    // Create worksheet from all rows
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws['!merges'] = merges;
  
    // Set column widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 25 }, // Part Number
      { wch: 40 }, // Part Name
      { wch: 8 },  // UoM
      { wch: 10 }, // QTY PO
      { wch: 10 }, // QTY Label
      { wch: 12 }, // QTY Requested
      { wch: 12 }, // QTY Confirm
      { wch: 12 }, // QTY Delivered
      { wch: 10 }  // QTY Minus
    ];
    ws['!cols'] = colWidths;
  
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Note Detail');
  
    // Write to file
    XLSX.writeFile(wb, `Delivery_Note_${dnDetails.noDN}.xlsx`);
  };


  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Delivery Note Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:space-y-6">
            {/* No. DN */}
            <div className="flex items-center">
              <span className="text-sm md:text-base font-medium mr-2">No. DN:</span>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
              ) : (
                <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{dnDetails.noDN}</span>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
              {/* Left side details */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* No. PO */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">No. PO:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{dnDetails.noPO}</span>
                  )}
                </div>
                {/* Plan Delivery Date */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Plan Delivery Date:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-36"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{dnDetails.planDelivery}</span>
                  )}
                </div>
              </div>
              {/* Print Buttons */}
              <div className="flex gap-2 items-center">
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handlePrintLabel}
                >
                  <FaPrint className="w-4 h-4" />
                  <span>Print Label</span>
                </button>
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handlePrintDN}
                >
                  <FaPrint className="w-4 h-4" />
                  <span>Print DN</span>
                </button>
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-4 md:px-4 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handleDownloadExcel}
                >
                  <FaFileExcel className="w-4 h-4" />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end">
              <div className="w-full">
                <SearchBar
                  placeholder="Search part number or name..."
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[5%]"
                    >
                      No
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[15%]">Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[26%]">Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[9%]">UoM</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b  w-[9%]">QTY</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[9%]">QTY Confirm</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[9%]">QTY Label</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[9%]">QTY Delivered</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[9%]">QTY Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
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
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.no}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partNumber}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partName}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.uom}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.QTY}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyConfirm}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyLabel}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyDelivered}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyReceived}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                        No details available for this delivery note
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
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

export default DeliveryNoteDetail;
