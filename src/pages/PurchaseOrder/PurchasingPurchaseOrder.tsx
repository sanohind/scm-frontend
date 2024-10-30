import { useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaExclamationTriangle } from 'react-icons/fa';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';

import Select from 'react-select';
import { APIindexpoheader3, APIpartner3 } from '../../api/api';

const PurchasingPurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(APIpartner3, {
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
      const response = await fetch(`${APIindexpoheader3}/${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch purchase orders');

      const result = await response.json();
      const purchaseOrders = result.data.map(po => ({
        noPO: po.po_no || '-',
        poDate: po.po_date || '-',
        planDelivery: po.planned_receipt_date || '-',
        poRevision: po.po_revision_no ? `Rev ${po.po_revision_no.toString().padStart(2, '0')}` : '-',
        note: po.note || '-',
        status: po.po_status || '-',
        response: po.response || '',
        reason: po.reason || '',
      }));

      setData(purchaseOrders);
      setFilteredData(purchaseOrders);
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
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
    fetchPurchaseOrders(selectedOption.value);
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
                      <td className="px-2 py-4 text-center text-blue-600 underline">{row.noPO}</td>
                      <td className="px-2 py-4 text-center">{row.poDate}</td>
                      <td className="px-2 py-4 text-center">{row.planDelivery}</td>
                      <td className="px-2 py-4 text-center">{row.poRevision}</td>
                      <td className="px-2 py-4 text-center">{row.note}</td>
                      <td className="px-2 py-4 text-center">{row.status}</td>
                      <td className="px-2 py-4 text-center">{row.response}</td>
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
