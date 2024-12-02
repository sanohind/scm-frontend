import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaExclamationTriangle } from 'react-icons/fa';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { API_List_Partner_Admin, API_PO_Admin } from '../../../../api/api';

const PurchasingPurchaseOrder = () => {
  interface PurchaseOrder {
    noPO: string;
    poDate: string;
    planDelivery: string;
    poRevision: string;
    note: string;
    status: string;
    response: string;
    reason: string;
    [key: string]: string | undefined;
  }
  
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [filteredData, setFilteredData] = useState<PurchaseOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof PurchaseOrder | ''; direction: string }>({ key: '', direction: '' });
  interface Supplier {
    value: string;
    label: string;
  }
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    try {
      const response = await fetch(API_List_Partner_Admin(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch suppliers');

      const result = await response.json();
      const suppliersList = result.data.map((supplier: { bp_code: string; bp_name: string }) => ({
        value: supplier.bp_code,
        label: `${supplier.bp_code} | ${supplier.bp_name}`,
      }));

      setSuppliers(suppliersList);
      setLoading(false);
      // toast.success('Suppliers fetched successfully');
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error(`Failed to fetch suppliers: ${error}`);
    }
  };

  const fetchPurchaseOrders = async (supplierCode: string) => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    try {
      const response = await fetch(`${API_PO_Admin()}${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch purchase orders:', response.status);
        setFilteredData([]);
        setData([]);
        toast.error(`Failed to fetch purchase orders, ${response.status}`);
        return;
      }

      const result = await response.json();
      if (result.status && Array.isArray(result.data) && result.data.length > 0) {
        const purchaseOrder = result.data.map((po: any) => ({
          noPO: po.po_no || 'N/A',
          poDate: po.po_date || '-',
          planDelivery: po.planned_receipt_date || '-',
          poRevision: po.po_revision_no || '-',
          note: po.note || '-',
          status: po.po_status || '-',
          response: po.response || 'No Action',
          reason: po.reason || '',
        }));

        setData(purchaseOrder);
        setFilteredData(purchaseOrder);
        setLoading(false);
        // toast.success('Purchase orders fetched successfully');
      } else {
        setData([]);
        setFilteredData([]);
        toast.info(`No PO data found, ${result.message}`);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      toast.error(`Failed to fetch purchase orders: ${error}`);
      setData([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (searchQuery) {
      filtered = filtered.filter(row =>
        row.noPO.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'poDate' || sortConfig.key === 'planDelivery') {
          aValue = aValue ? new Date(aValue).toISOString() : '';
          bValue = bValue ? new Date(bValue).toISOString() : '';
        }

        if (!aValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (!bValue) return sortConfig.direction === 'asc' ? 1 : -1;
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

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSort = (key: keyof PurchaseOrder) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedSupplier(selectedOption);
    if (selectedOption) {
      fetchPurchaseOrders(selectedOption.value);
      localStorage.setItem('selected_bp_code', selectedOption.value);
    } else {
      setData([]);
      setFilteredData([]);
    }
  };

  const handleShowReason = (reason: string) => {
    Swal.fire({
      title: 'Reason for Decline',
      html: `<p style="border: 1px solid #ccc; padding: 10px; font-size: 12px; text-align: left;">${reason}</p>`,
      icon: 'info',
      confirmButtonColor: '#1E3A8A', // Changed to Tailwind's blue-900 color
      confirmButtonText: 'OK',
    });
  };

  const handlePONavigate = (noPO: string) => {
    navigate(`/purchase-order-detail?noPO=${noPO}`);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Purchase Order" />
      <div className="font-poppins bg-white">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <Select
              options={suppliers}
              value={selectedSupplier}
              onChange={handleSupplierChange}
              placeholder="Select Supplier"
              className="w-80"
            />
            <SearchBar
              placeholder="Search no purchase order..."
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300 mt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]" onClick={() => handleSort('noPO')}>No. PO</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]" onClick={() => handleSort('poDate')}>
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
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[15%]" onClick={() => handleSort('planDelivery')}>
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
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[5%]">Revision No.</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]"> Note</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">Status</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                    </td>
                    </tr>
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
                    <td
                      className={`px-3 py-3 text-center whitespace-nowrap ${
                      row.response === 'Accepted'
                        ? 'bg-green-500'
                        : row.response === 'Declined'
                        ? 'bg-red-600'
                        : ''
                      }`}
                    >
                      {row.response === 'Declined' ? (
                      <div className="flex items-center justify-center">
                        <FaExclamationTriangle
                        className="text-white mr-2 cursor-pointer"
                        onClick={() => handleShowReason(row.reason)}
                        />
                        <span className="text-white">{row.response}</span>
                      </div>
                      ) : (
                      <span className="text-black">{row.response}</span>
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

export default PurchasingPurchaseOrder;
