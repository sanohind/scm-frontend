import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import { API_PO_History_Supplier } from '../../../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchMonth from '../../../Table2/SearchMonth';

const HistoryPurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const navigate = useNavigate();

  const fetchHistoryPurchaseOrders = async () => {
    const token = localStorage.getItem('access_token');
    const bpCode = localStorage.getItem('bp_code');

    try {
      const response = await fetch(`${API_PO_History_Supplier()}${bpCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.data) {
        const historyPurchaseOrders = result.data.map((po) => ({
          noPO: po.po_number || '-',
          poDate: po.po_date || '-',
          status: po.po_status || '-',
        }));

        setData(historyPurchaseOrders);
        setFilteredData(historyPurchaseOrders);
      } else {
        Swal.fire('Error', 'No history purchase orders found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching history purchase orders:', error);
      Swal.fire('Error', 'Failed to fetch history purchase orders.', 'error');
    }
  };

  useEffect(() => {
    fetchHistoryPurchaseOrders();
  }, []);

  useEffect(() => {
    let filtered = [...data];
    
    if (selectedMonth) {
      filtered = filtered.filter((row) => row.poDate.startsWith(selectedMonth));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.noPO.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.status.toLowerCase().includes(searchQuery.toLowerCase())
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
  }, [searchQuery, sortConfig, data, selectedMonth]);

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

  const handleRowClick = (noPO) => {
    navigate(`/purchase-order-detail?noPO=${noPO}`);
  };

  return (
    <>
      <Breadcrumb pageName="History Purchase Order" />
      <div className="font-poppins bg-white text-black p-6 sm:w-150 md:w-180 xl:w-230 ">
        <div className="flex justify-between mb-4">
          <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          <SearchBar
            placeholder="Search no purchase order here..."
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="w-full text-sm text-left text-gray-700 ">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="py-3 text-center border-b border-b-gray-400 w-40">No. PO</th>
                <th
                  className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                  onClick={() => handleSort('poDate')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'poDate' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    PO Date
                  </span>
                </th>
                <th
                  className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                  onClick={() => handleSort('status')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'status' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    Status PO
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-gray-50 border-b cursor-pointer"
                    onClick={() => handleRowClick(row.noPO)}
                  >
                    <td className="px-2 py-4 text-center text-blue-600 underline">{row.noPO}</td>
                    <td className="px-2 py-4 text-center">{row.poDate}</td>
                    <td className="px-2 py-4 text-center">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No history purchase orders available for now
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
    </>
  );
};

export default HistoryPurchaseOrder;
