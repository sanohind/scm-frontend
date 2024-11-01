import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import { API_DN_Supplier } from '../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchMonth from '../Table2/SearchMonth';

const DeliveryNote = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const fetchDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(API_DN_Supplier(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch delivery notes');

      const result = await response.json();


      const deliveryNotes = result.data.map((dn) => ({
        noDN: dn.no_dn || '-',
        noPO: dn.po_no || '-',
        createdDate: dn.dn_created_date || '-',
        planDNDate: dn.plan_delivery_date || '-',
        statusDN: dn.status_desc || '-',
        progress: dn.progress || '-',
      }));

      setData(deliveryNotes);
      setFilteredData(deliveryNotes);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
    }
  };

  useEffect(() => {
    fetchDeliveryNotes();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    // Filter by month using PO date
    if (selectedMonth) {
      filtered = filtered.filter((row) => row.createdDate.startsWith(selectedMonth));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.noDN.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.noPO.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.statusDN.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <>
      <Breadcrumb pageName="Delivery Note" />
      <div className="font-poppins bg-white text-black p-6">
        <div className="flex justify-between items-center">
          <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          <SearchBar
            placeholder="Search no purchase order..."
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="mt-6 relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="py-3 px-2 text-center border-b border-b-gray-400 w-40">No. DN</th>
                <th className="py-3 px-2 text-center border-b border-b-gray-400 w-40">No. PO</th>
                <th
                  className="py-3 px-2 text-center border-b border-b-gray-400 cursor-pointer w-40"
                  onClick={() => handleSort('createdDate')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'createdDate' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSortDown className="opacity-50" />
                    )}
                    Created Date
                  </span>
                </th>
                <th
                  className="py-3 px-2 text-center border-b border-b-gray-400 cursor-pointer w-60"
                  onClick={() => handleSort('planDNDate')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'planDNDate' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSortDown className="opacity-50" />
                    )}
                    Plan Delivery Date
                  </span>
                </th>
                <th
                  className="py-3 px-2 text-center border-b border-b-gray-400 cursor-pointer w-40"
                  onClick={() => handleSort('statusDN')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'statusDN' ? (
                      sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSortDown className="opacity-50" />
                    )}
                    Status DN
                  </span>
                </th>
                <th className="py-3 px-2 text-center border-b border-b-gray-400 w-40">Progress</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                    <td className="px-2 py-4 text-center">
                      <a href={`/delivery-note-detail-edit?noDN=${row.noDN}`} className="text-blue-600 underline">
                        {row.noDN}
                      </a>
                    </td>
                    <td className="px-2 py-4 text-center">
                      <a href={`/purchase-order-detail?noPO=${row.noPO}`} className="text-blue-600 underline">
                        {row.noPO}
                      </a>
                    </td>
                    <td className="px-2 py-4 text-center">{row.createdDate}</td>
                    <td className="px-2 py-4 text-center">{row.planDNDate}</td>
                    <td className="px-2 py-4 text-center">{row.statusDN}</td>
                    <td className="px-2 py-4 text-center">{row.progress}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No Delivery Note available for now
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

export default DeliveryNote;
