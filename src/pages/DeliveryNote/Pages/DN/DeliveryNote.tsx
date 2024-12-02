import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchMonth from '../../../Table2/SearchMonth';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { API_DN } from '../../../../api/api';


const DeliveryNote = () => {
  interface DeliveryNote {
    noDN: string;
    noPO: string;
    createdDate: string;
    planDNDate: string;
    statusDN: string;
    progress: string;
  }

  const [data, setData] = useState<DeliveryNote[]>([]);
  const [filteredData, setFilteredData] = useState<DeliveryNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  
  const navigate = useNavigate();

  const fetchDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(API_DN(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch delivery notes');

      const result = await response.json();
      const deliveryNotes = result.data.map((dn: any) => ({
        noDN: dn.no_dn || '-',
        noPO: dn.po_no || '-',
        createdDate: dn.dn_created_date || '-',
        planDNDate: dn.plan_delivery_date || '-',
        statusDN: dn.status_desc || '-',
        progress: dn.progress || '-',
      }));
      setData(deliveryNotes);
      setFilteredData(deliveryNotes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching delivery notes: ${error.message}`);
      } else {
        toast.error('Error fetching delivery notes');
      }
    }
  };

  useEffect(() => {
    fetchDeliveryNotes();

    const savedPage = localStorage.getItem('dn_current_page');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
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
    localStorage.setItem('dn_current_page', page.toString());
  };

  const handleSort = (key: keyof DeliveryNote) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Navigate to PO Detail page with noPO parameter
  const handlePONavigate = (noPO: string) => {
    navigate(`/purchase-order-detail?noPO=${noPO}`);
  };

  // Navigate to PO Detail page with noPO parameter
  const handleDNNavigate = (noDN: string) => {
    navigate(`/delivery-note-detail-edit?noDN=${noDN}`);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Delivery Note" />
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
                  <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">No. PO</th>
                  <th
                    className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                    onClick={() => handleSort('createdDate')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'createdDate' ? (
                  sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                      ) : (
                  <FaSortDown className="opacity-50 mr-1" />
                      )}
                      Created Date
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                    onClick={() => handleSort('planDNDate')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'planDNDate' ? (
                  sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                      ) : (
                  <FaSortDown className="opacity-50 mr-1" />
                      )}
                      Plan Delivery Date
                    </span>
                  </th>
                  <th
                    className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]"
                    onClick={() => handleSort('statusDN')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'statusDN' ? (
                  sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                      ) : (
                  <FaSortDown className="opacity-50 mr-1" />
                      )}
                      Status DN
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">Progress</th>
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
                    </tr>
                  ))
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                  <button
                    onClick={() => handleDNNavigate(row.noDN)}
                    className="text-blue-600 underline"
                  >
                    {row.noDN}
                  </button>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                  <button
                    onClick={() => handlePONavigate(row.noPO)}
                    className="text-blue-600 underline"
                  >
                    {row.noPO}
                  </button>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.createdDate}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.planDNDate}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.statusDN}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">{row.progress}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                      No Delivery Note available for now
                    </td>
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

export default DeliveryNote;
