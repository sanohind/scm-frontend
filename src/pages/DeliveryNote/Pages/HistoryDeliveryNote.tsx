import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../Table2/SearchBar';
import Pagination from '../../Table2/Pagination';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import { API_DN_History_Supplier } from '../../../api/api';
import SearchMonth from '../../Table2/SearchMonth';

const HistoryDeliveryNote = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const navigate = useNavigate();

  // Fetch Delivery Note History from API
  const fetchHistoryDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');
    const bpCode = localStorage.getItem('bp_code');

    try {
      const response = await fetch(`${API_DN_History_Supplier()}${bpCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.data) {
        const deliveryNotes = result.data.map((dn) => ({
          noDN: dn.dn_number || '-',
          noPO: dn.po_number || '-',
          statusDN: dn.dn_status || '-',
          planDNDate: dn.send_date || '-',
          receivedDNDate: dn.receive_date || '-',
          noPackingSlip: dn.no_packing_slip || '-',
        }));

        setData(deliveryNotes);
        setFilteredData(deliveryNotes);
      } else {
        Swal.fire('Error', 'No history delivery notes found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching history delivery notes:', error);
      Swal.fire('Error', 'Failed to fetch history delivery notes.', 'error');
    }
  };

  useEffect(() => {
    fetchHistoryDeliveryNotes();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (selectedMonth) {
      filtered = filtered.filter((row) => row.receivedDNDate.startsWith(selectedMonth));
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

  const handleRowClick = (noDN) => {
    navigate(`/delivery-note-detail?noDN=${noDN}`);
  };

  return (
    <>
      <Breadcrumb pageName="History Delivery Note" />
      <div className="font-poppins bg-white text-black p-6 sm:w-150 md:w-180 xl:w-230">
        <div className="flex justify-between mb-4">
          <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          <SearchBar
            placeholder="Search delivery note here..."
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-base text-gray-700">
              <tr>
                <th className="py-3 text-center border-b border-b-gray-400 w-40">
                  No. DN
                </th>
                <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36">
                  <span
                    className="flex items-center justify-center"
                    onClick={() => handleSort('noPO')}
                  >
                    {sortConfig.key === 'noPO' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    No. PO
                  </span>
                </th>
                <th
                  className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                  onClick={() => handleSort('statusDN')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'statusDN' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    Status DN
                  </span>
                </th>
                <th
                  className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                  onClick={() => handleSort('planDNDate')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'planDNDate' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    Delivery Date
                  </span>
                </th>
                <th
                  className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                  onClick={() => handleSort('receivedDNDate')}
                >
                  <span className="flex items-center justify-center">
                    {sortConfig.key === 'receivedDNDate' ? (
                      sortConfig.direction === 'asc' ? (
                        <FaSortUp className="mr-1" />
                      ) : (
                        <FaSortDown className="mr-1" />
                      )
                    ) : (
                      <FaSortDown className="opacity-50 mr-1" />
                    )}
                    Received Date
                  </span>
                </th>
                <th className="py-3 text-center border-b border-b-gray-400 w-40">
                  No Packing Slip
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className="odd:bg-white even:bg-gray-50 border-b cursor-pointer"
                    onClick={() => handleRowClick(row.noDN)}
                  >
                    <td className="px-2 py-4 text-center text-blue-600 underline">{row.noDN}</td>
                    <td className="px-2 py-4 text-center">{row.noPO}</td>
                    <td className="px-2 py-4 text-center">{row.statusDN}</td>
                    <td className="px-2 py-4 text-center">{row.planDNDate}</td>
                    <td className="px-2 py-4 text-center">{row.receivedDNDate}</td>
                    <td className="px-2 py-4 text-center">{row.noPackingSlip}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No history delivery notes available for now
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

export default HistoryDeliveryNote;
