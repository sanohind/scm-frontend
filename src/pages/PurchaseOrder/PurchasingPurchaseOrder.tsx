import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaExclamationTriangle } from 'react-icons/fa';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import Select from 'react-select';
import { API_List_Partner_Purchasing, API_PO_Purchasing } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const PurchasingPurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_List_Partner_Purchasing(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch suppliers');

      const result = await response.json();
      const suppliersList = result.data.map(supplier => ({
        value: supplier.bp_code,
        label: `${supplier.bp_code} | ${supplier.bp_name}`,
      }));

      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchPurchaseOrders = async (supplierCode) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_PO_Purchasing()}${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // if (!response.ok) throw new Error('Failed to fetch purchase orders');

      if (!response.ok) {
        console.error('Failed to fetch purchase orders:', response.status);
        setFilteredData([]);
        setData([]);
        return;
      }

      const result = await response.json();
      if (result.status && Array.isArray(result.data) && result.data.length > 0) {
        const purchaseOrder = result.data.map(po => ({
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
      } else {
        setData([]);
        setFilteredData([]);
        Swal.fire('No PO data found', result.message, 'info');
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      Swal.fire('Error', 'Failed to fetch purchase orders. Please try again later.', 'error');
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
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

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

  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
    if (selectedOption) {
      fetchPurchaseOrders(selectedOption.value);
      localStorage.setItem('selected_bp_code', selectedOption.value);
    } else {
      setData([]);
      setFilteredData([]);
    }
  };

  const handleShowReason = (reason) => {
    Swal.fire({
      title: 'Reason for Decline',
      html: `<p style="border: 1px solid #ccc; padding: 10px; font-size: 12px; text-align: left;">${reason}</p>`,
      icon: 'info',
      confirmButtonColor: '#1D4ED8',
      confirmButtonText: 'OK',
    });
  };

  const handlePONavigate = (noPO) => {
    navigate(`/purchase-order-detail?noPO=${noPO}`);
  };

  return (
    <>
      <Breadcrumb pageName="Purchase Order" />
      <div className="font-poppins bg-white">
        <div className="flex flex-col p-6">
          <div className="flex justify-between items-center mb-4">
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

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40"
                    onClick={() => handleSort('noPO')}>No. PO
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                    onClick={() => handleSort('poDate')}>
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'poDate' ? (
                        sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                      ) : <FaSortDown className="opacity-50 mr-1" />}
                      PO Date
                    </span>
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                    onClick={() => handleSort('planDelivery')}>
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'planDelivery' ? (
                        sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                      ) : <FaSortDown className="opacity-50 mr-1" />}
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
                {paginatedData.length > 0 ? (
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
                      <td className={`text-center ${row.response === 'Accepted' ? 'bg-green-500' : row.response === 'Declined' ? 'bg-red-500' : ''}`}>
                        {row.response === 'Declined' ? (
                          <div className="flex items-center justify-center">
                            <FaExclamationTriangle
                              className="text-white mr-2 cursor-pointer"
                              onClick={() => handleShowReason(row.reason)}
                            />
                            <span className="text-white">{row.response}</span>
                          </div>
                        ) : (
                          <span>{row.response}</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">No Purchase Order available for now</td>
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

export default PurchasingPurchaseOrder;
