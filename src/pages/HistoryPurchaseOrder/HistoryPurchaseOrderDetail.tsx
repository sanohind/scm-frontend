import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import { API_indexPOHistorySupplier } from '../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaPrint } from 'react-icons/fa';

const HistoryPurchaseOrderDetail = () => {
  const [details, setDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [poInfo, setPOInfo] = useState({ noPO: '', planDelivery: '', note: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Get noPO from URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const noPO = queryParams.get('noPO');

  const fetchPODetails = async () => {
    const token = localStorage.getItem('access_token');
    const bpCode = localStorage.getItem('bp_code');

    try {
      const response = await fetch(`${API_indexPOHistorySupplier}${bpCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const result = await response.json();
      const po = result.data.find((po) => po.po_number === noPO);

      if (po) {
        setPOInfo({
          noPO: po.po_number,
          planDelivery: po.po_date || '-',
          note: po.note || '-',
        });

        const detailsData = po.detail.map((detail, index) => ({
          no: index + 1,
          partNumber: detail.part_number || '-',
          partName: detail.part_name || '-',
          UoM: detail.unit || '-',
          QTY: detail.quantity || 0,
          QTYReceipt: detail.receipt_qty || 0,
        }));

        setDetails(detailsData);
        setFilteredDetails(detailsData);
      } else {
        Swal.fire('Error', 'No matching PO found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      Swal.fire('Error', 'Failed to fetch PO details.', 'error');
    }
  };

  useEffect(() => {
    if (noPO) fetchPODetails();
  }, [noPO]);

  useEffect(() => {
    let filtered = [...details];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((row) =>
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

    setFilteredDetails(filtered);
  }, [searchQuery, sortConfig, details]);

  const paginatedDetails = filteredDetails.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <>
      <Breadcrumb pageName="History Purchase Order Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
          <div className="flex items-center">
            <span className="mr-2">No. PO:</span>
            <span className="bg-stone-300 px-4 py-2 rounded">{poInfo.noPO}</span>
          </div>
          
          <div className="flex justify-between">
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <span className="mr-2">Plan Delivery Date:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{poInfo.planDelivery}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Note:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{poInfo.note}</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded"
                onClick={() => window.print()}
              >
                <FaPrint className="w-4 h-4" /> {/* Print icon added here */}
                <span>Print PO</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <SearchBar
              placeholder="Search part number or name..."
              onSearchChange={setSearchQuery}
            />
          </div>
          
        

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 px-2 text-center border-b border-b-gray-400 w-20">No</th>
                  <th className="py-3 px-2 text-center border-b border-b-gray-400 w-60">Part Number</th>
                  <th className="py-3 px-2 text-center border-b border-b-gray-400 w-80">Part Name</th>
                  <th className="py-3 px-2 text-center border-b border-b-gray-400 w-30">UoM</th>
                  <th
                    className="py-3 px-2 text-center border-b border-b-gray-400 cursor-pointer w-30"
                    onClick={() => handleSort('QTY')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'QTY' ? (
                        sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                      ) : (
                        <FaSortDown className="opacity-50" />
                      )}
                      QTY PO
                    </span>
                  </th>
                  <th className="py-3 px-2 text-center border-b border-b-gray-400 w-300">QTY Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDetails.length > 0 ? (
                  paginatedDetails.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">{row.no}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.UoM}</td>
                      <td className="px-2 py-4 text-center">{row.QTY}</td>
                      <td className="px-2 py-4 text-center">{row.QTYReceipt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No purchase order details available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            totalRows={filteredDetails.length}
            rowsPerPage={rowsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default HistoryPurchaseOrderDetail;
