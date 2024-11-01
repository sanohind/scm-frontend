import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import { API_PO_Detail } from '../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaPrint } from 'react-icons/fa';

const PurchaseOrderDetail = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [poDetails, setPODetails] = useState({
    noPO: '',
    planDelivery: '',
    note: ''
  });

  // Get noPO from URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const noPO = queryParams.get('noPO');

  const fetchPurchaseOrderDetails = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_PO_Detail()}${noPO}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result) {
        setPODetails({
          noPO: result.data.po_no,
          planDelivery: result.data.planned_receipt_date || '-',
          note: result.data.note || '-',
        });

        // Set details data
        const detailsData = result.data.detail.map((detail, index) => ({
          no: index + 1,
          partNumber: detail.bp_part_no || '-',
          partName: detail.item_desc_a || '-',
          UoM: detail.purchase_unit || '-',
          QTY: detail.po_qty || 0,
          QTYReceipt: detail.receipt_qty || 0,
        }));

        setData(detailsData);
        setFilteredData(detailsData);
      } else {
        Swal.fire('Error', 'No Purchase Order details found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire('Error', 'Failed to fetch Purchase Order details.', 'error');
    }
  };

  useEffect(() => {
    if (noPO) {
      fetchPurchaseOrderDetails();
    }
  }, [noPO]);

  useEffect(() => {
    let filtered = [...data];

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

    setFilteredData(filtered);
  }, [searchQuery, sortConfig, data]);

  const paginatedData = filteredData.slice(
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
      <Breadcrumb pageName="Purchase Order Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
          <div className="flex items-center">
            <span className="mr-2">No. PO:</span>
            <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.noPO}</span>
          </div>
          
          <div className="flex justify-between">
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <span className="mr-2">Plan Delivery Date:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.planDelivery}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Note:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.note}</span>
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


          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-20">No
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-60">Part Number</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-80">Part Name</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">UoM</th>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-30"
                    onClick={() => handleSort('QTY')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'QTY' ? (
                        sortConfig.direction === 'asc' ? (
                          <FaSortUp className="mr-1" />
                        ) : (
                          <FaSortDown className="mr-1" />
                        )
                      ) : (
                        <FaSortDown className="opacity-50 mr-1" />
                      )}
                      QTY PO
                    </span>
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">QTY Receipt</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">QTY Minus</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">{row.no}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.UoM}</td>
                      <td className="px-2 py-4 text-center">{row.QTY}</td>
                      <td className="px-2 py-4 text-center">{row.QTYReceipt}</td>
                      <td className="px-2 py-4 text-center">{row.QTY - row.QTYReceipt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
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

export default PurchaseOrderDetail;
