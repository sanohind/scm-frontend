import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaExclamationTriangle  } from 'react-icons/fa';
import { API_PO_Supplier, API_Update_PO_Supplier } from '../../../../api/api';
import SearchMonth from '../../../Table2/SearchMonth';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

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
  const [rowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchPurchaseOrders = async () => {
    const token = localStorage.getItem('access_token');
    const bpCode = localStorage.getItem('bp_code');
    setLoading(true);

    try {
      const response = await fetch(`${API_PO_Supplier()}${bpCode}`, {
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
      // toast.success('Purchase orders fetched successfully');

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

  const handlePageChange = (page: number) => setCurrentPage(page);

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
    const updateURL = `${API_Update_PO_Supplier()}${po_no}`;

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
      Swal.fire(result.message, '', result.status === 'success' ? 'success' : 'error');
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
    <tr className="odd:bg-white even:bg-gray-50 border-b">
        <td className="px-2 py-4 text-center">
            <div className="w-24 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-24 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-24 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-16 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-28 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-24 h-4 mx-auto skeleton rounded"></div>
        </td>
        <td className="px-2 py-4 text-center">
            <div className="w-24 h-8 mx-auto skeleton rounded"></div>
        </td>
    </tr>
  );

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Purchase Order" />
      <div className="bg-white">
        <div className="flex flex-col p-6">
          <div className="flex justify-between items-center">
            <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            <SearchBar
              placeholder="Search no purchase order..."
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40">No. PO
                  </th>
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
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">
                    Revision No.
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-70">
                    Note
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">
                    Status
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-50">
                    Response
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                      Array.from({ length: rowsPerPage }).map((_, index) => (
                          <SkeletonRow key={index} />
                      ))
                ) : (
                    paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => handlePONavigate(row.noPO)}
                          className="text-blue-600 underline"
                        >
                          {row.noPO}
                        </button>
                      </td>
                      <td className="px-2 py-4 text-center">{row.poDate}</td>
                      <td className="px-2 py-4 text-center">{row.planDelivery}</td>
                      <td className="px-2 py-4 text-center">{row.poRevision}</td>
                      <td className="px-2 py-4 text-center">{row.note}</td>
                      <td className="px-2 py-4 text-center">{row.status}</td>
                      <td className={`text-center ${
                          row.response === 'Accepted' ? 'bg-green-500' : row.response === 'Declined' ? 'bg-red-500' : ''
                        }`}>
                        {row.response === 'Accepted' ? (
                          <span className="text-black">{row.response}</span>
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
                            <button
                              className="px-3 py-2 bg-green-400 text-black rounded"
                              onClick={() => handleResponse(row.noPO, 'Accepted')}
                            >
                              Accept
                            </button>
                            <button
                              className="px-3 py-2 bg-red-500 text-white rounded"
                              onClick={() => handleResponse(row.noPO, 'Declined')}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No Purchase Order available for now
                    </td>
                  </tr>
                ))}
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

export default PurchaseOrder;
