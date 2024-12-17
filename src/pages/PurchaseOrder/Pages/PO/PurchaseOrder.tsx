import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaExclamationTriangle } from 'react-icons/fa';
import SearchMonth from '../../../../components/Table/SearchMonth';
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { API_PO, API_Update_PO } from '../../../../api/api';
import Button from '../../../../components/Forms/Button';

const PurchaseOrder = () => {
  interface PurchaseOrder {
    noPO: string;
    poDate: string;
    planDelivery: string;
    poRevision: string;
    revisionDate: string;
    status: string;
    response: string;
    reason: string;
    note: string;
  }

  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchPurchaseOrders = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);

    try {
      const response = await fetch(API_PO(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();
      const purchaseOrders = result.data.map((po: any) => ({
        noPO: po.po_no || '-',
        poDate: po.po_date || '-',
        planDelivery: po.planned_receipt_date || '-',
        poRevision: po.po_revision_no ? `Rev ${po.po_revision_no.toString().padStart(2, '0')}` : '-',
        revisionDate: po.po_revision_date || '-',
        status: po.po_status || '-',
        response: po.response || '',
        reason: po.reason || '',
        note: po.note || '-',
      }));

      setData(purchaseOrders);
      setFilteredData(purchaseOrders);
      setLoading(false);
    } catch (error) {
      toast.error(`Failed to fetch purchase orders: ${error}`);
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchPurchaseOrders();
    const savedPage = localStorage.getItem('po_current_page');
    if (savedPage) {
        setCurrentPage(parseInt(savedPage));
    }
  }, []);

  useEffect(() => {
    let filtered = [...data];

    // Filter by month using PO date
    if (selectedMonth) {
      filtered = filtered.filter((row) => row.poDate.startsWith(selectedMonth));
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.noPO.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof PurchaseOrder];
        let bValue = b[sortConfig.key as keyof PurchaseOrder];

        // Convert to Date if sorting by date column
        if (sortConfig.key === 'poDate' || sortConfig.key === 'planDelivery') {
          aValue = new Date(aValue).toISOString();
          bValue = new Date(bValue).toISOString();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(filtered);
  }, [searchQuery, selectedMonth, sortConfig, data]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    localStorage.setItem('po_current_page', page.toString());
  };

  const handleSort = (key: keyof PurchaseOrder) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResponse = (po_no: string, response: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${response.toLowerCase()} this purchase order.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1E3A8A',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${response.toLowerCase()} it!`,
      cancelButtonText: 'No, cancel',
      input: response === 'Declined' ? 'textarea' : undefined,
      inputPlaceholder: 'Provide your reason for declining',
      inputValidator: (value: string) => {
        if (response === 'Declined' && !value) {
          return 'Please provide a reason for declining';
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const reason = response === 'Declined' ? result.value : '';
        updateResponse(po_no, response, reason);
      }
    });
  };

  const updateResponse = async (po_no: string, response: string, reason: string = '') => {
    const token = localStorage.getItem('access_token');
    const updateURL = `${API_Update_PO()}${po_no}`;

    try {
      const res = await fetch(updateURL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response, reason }),
      });

      const result = await res.json();
      Swal.fire({
        text: result.message,
        icon: result.status === 'success' ? 'success' : 'error',
        confirmButtonColor: '#1E3A8A' // blue-900 color
      });
    } catch (error) {
      console.error('Error updating response:', error);
      Swal.fire('Failed to update response', '', 'error');
    } finally {
      // Refetch data regardless of success or failure
      fetchPurchaseOrders();
    }
  };

  // Navigate to PO Detail page with noPO parameter
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
      <td className="px-3 py-3 text-center whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Purchase Order" />
      <div className="bg-white">
        <div className="flex flex-col p-2 md:p-4 lg:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
              <div className="flex flex-col w-full lg:w-1/3">
                <label className="text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
                <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
              </div>
              <div className="w-full lg:w-1/3">
                <SearchBar
                placeholder="Search purchase order here..."
                onSearchChange={setSearchQuery}
                />
              </div>
            </div>

          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">
                      No. PO
                    </th>
                    <th
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]"
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
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]"
                      onClick={() => handleSort('planDelivery')}
                    >
                      <span className="flex items-center justify-center">
                        {sortConfig.key === 'planDelivery' ? (
                          sortConfig.direction === 'asc' ? (
                            <FaSortUp className="mr-1" />
                          ) : (
                            <FaSortDown className="mr-1" />
                          )
                        ) : (
                          <FaSortDown className="opacity-50 mr-1" />
                        )}
                        Plan Delivery
                      </span>
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[5%]">
                      Revision No.
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">
                      Note
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">
                      Status
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">
                      Response
                    </th>
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
                          <button
                            onClick={() => handlePONavigate(row.noPO)}
                            className="text-blue-600 underline"
                          >
                            {row.noPO}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.poDate}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.planDelivery}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.poRevision}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.note}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                        <td className={`px-3 py-3 text-center whitespace-nowrap font-semibold ${
                          row.response === 'Accepted' ? 'bg-green-700' : row.response === 'Declined' ? 'bg-red-600' : ''
                        }`}>
                          {row.response === 'Accepted' ? (
                            <span className="text-white">{row.response}</span>
                          ) : row.response === 'Declined' ? (
                            <div className="flex items-center justify-center">
                              <FaExclamationTriangle
                                className="text-white mr-2 cursor-pointer"
                                onClick={() =>
                                  Swal.fire({
                                    title: 'Reason for Decline',
                                    text: row.reason,
                                    icon: 'info',
                                    confirmButtonColor: '#1E3A8A',
                                  })
                                }
                              />
                              <span className="text-white">{row.response}</span>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-center">
                              <Button
                                title="Accept"
                                type="button"
                                onClick={() => handleResponse(row.noPO, 'Accepted')}
                                color='bg-green-700'
                              />
                              <Button
                                title="Decline"
                                type="button"
                                onClick={() => handleResponse(row.noPO, 'Declined')}
                                color='bg-red-600'
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                        No Purchase Order available for now
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
      </div>
    </>
  );
};

export default PurchaseOrder;