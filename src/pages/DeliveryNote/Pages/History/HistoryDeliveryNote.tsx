import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchMonth from '../../../Table2/SearchMonth';
import { toast, ToastContainer } from 'react-toastify';
import { API_DN_History } from '../../../../api/api';

interface DeliveryNote {
  noDN: string;
  noPO: string;
  statusDN: string;
  planDNDate: string;
  receivedDNDate: string;
  noPackingSlip: string;
}

const HistoryDeliveryNote = () => {
  const [data, setData] = useState<DeliveryNote[]>([]);
  const [filteredData, setFilteredData] = useState<DeliveryNote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [rowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Delivery Note History from API
  const fetchHistoryDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);

    try {
      const response = await fetch(API_DN_History(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.data) {
        const deliveryNotes = result.data.map((dn: any) => ({
          noDN: dn.dn_number || '-',
          noPO: dn.po_number || '-',
          statusDN: dn.dn_status || '-',
          planDNDate: dn.send_date || '-',
          receivedDNDate: dn.receive_date || '-',
          noPackingSlip: dn.packing_slip || '-',
        }));

        setData(deliveryNotes);
        setFilteredData(deliveryNotes);
      } else {
        toast.error('No history delivery notes found');
      }
    } catch (error) {
      console.error('Error fetching history delivery notes:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching history delivery notes: ${error.message}`);
      } else {
        toast.error('Error fetching history delivery notes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryDeliveryNotes();

    const savedPage = localStorage.getItem('dn_history_current_page');
    if (savedPage) {
        setCurrentPage(parseInt(savedPage));
    }
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
        let aValue = a[sortConfig.key as keyof DeliveryNote];
        let bValue = b[sortConfig.key as keyof DeliveryNote];

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem('dn_history_current_page', page.toString());
  };

  const handleSort = (key: keyof DeliveryNote) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleDNNavigate = (noDN: string) => {
    navigate(`/delivery-note-detail?noDN=${noDN}`);
  };
  const handlePONavigate = (noPO: string) => {
    navigate(`/purchase-order-detail?noPO=${noPO}`);
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
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
  );

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="History Delivery Note" />
      <div className="font-poppins bg-white text-black p-2 md:p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Filter by Month</label>
            <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
          </div>
          <SearchBar
            placeholder="Search delivery note here..."
            onSearchChange={setSearchQuery}
          />
        </div>

        <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">No. DN</th>
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]">No. PO</th>
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]" onClick={() => handleSort('statusDN')}>
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
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]" onClick={() => handleSort('planDNDate')}>
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
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]" onClick={() => handleSort('receivedDNDate')}>
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
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]">No Packing Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <button onClick={() => handleDNNavigate(row.noDN)} className="text-blue-600 underline">
                          {row.noDN}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <button onClick={() => handlePONavigate(row.noPO)} className="text-blue-600 underline">
                          {row.noPO}
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.statusDN}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.planDNDate}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.receivedDNDate}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.noPackingSlip}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-gray-500">No history delivery notes available for now</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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