import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { API_DN_Admin, API_List_Partner_Admin } from '../../../../api/api';

const WarehouseDeliveryNote = () => {
  interface DeliveryNote {
    noDN: string;
    noPO: string;
    createdDate: string;
    planDNDate: string;
    confirmUpdate: string;
    statusDN: string;
    progress: string;
  }

  const [data, setData] = useState<DeliveryNote[]>([]);
  const [filteredData, setFilteredData] = useState<DeliveryNote[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
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
      const suppliersList = result.data.map((supplier: any) => ({
        value: supplier.bp_code,
        label: `${supplier.bp_code} | ${supplier.bp_name}`,
      }));

      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchDeliveryNote = async (supplierCode: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_DN_Admin()}${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch delivery note:', response.status);
        toast.error(`Failed to fetch delivery note. ${response.statusText}`);
        setFilteredData([]);
        setData([]);
        return;
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const deliveryNote = result.data.map((dn: any) => ({
          noDN: dn.no_dn || 'N/A',
          noPO: dn.po_no || '-',
          createdDate: dn.dn_created_date || '-',
          planDNDate: dn.plan_delivery_date || '-',
          confirmUpdate: dn.confirm_update_at || '-',
          statusDN: dn.status_desc || '-',
          progress: dn.progress || '-',
        }));

        setData(deliveryNote);
        setFilteredData(deliveryNote);
      } else {
        setData([]);
        setFilteredData([]);
        toast.info(`No DN data found for ${supplierCode}`);
      }
    } catch (error) {
      console.error('Error fetching delivery note:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching delivery note: ${error.message}`);
      } else {
        toast.error('Error fetching delivery note');
      }
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
        row.noDN.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof DeliveryNote];
        let bValue = b[sortConfig.key as keyof DeliveryNote];

        if (sortConfig.key === 'createdDate' || sortConfig.key === 'planDNDate') {
          aValue = new Date(aValue).toISOString();
          bValue = new Date(bValue).toISOString();
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

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSort = (key: keyof DeliveryNote) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedSupplier(selectedOption);
    if (selectedOption) {
      fetchDeliveryNote(selectedOption.value);
      localStorage.setItem('selected_bp_code', selectedOption.value);
    } else {
      setData([]);
      setFilteredData([]);
    }
  };


  const handleDNNavigate = (noDN: string) => {
    navigate(`/delivery-note-detail?noDN=${noDN}`);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Delivery Note" />
      <div className="font-poppins bg-white">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <Select
              options={suppliers}
              value={selectedSupplier}
              onChange={handleSupplierChange}
              placeholder="Select Supplier"
              className="w-80"
            />
              <SearchBar
                placeholder="Search no delivery note..."
                onSearchChange={setSearchQuery}
              />
          </div>

          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300 mt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">
                      No. DN
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">
                      No. PO
                    </th>
                    <th
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                      onClick={() => handleSort('createdDate')}
                    >
                      <span className="flex items-center justify-center">
                        {sortConfig.key === 'createdDate' ? (
                          sortConfig.direction === 'asc' ? (
                            <FaSortUp className="mr-1" />
                          ) : (
                            <FaSortDown className="mr-1" />
                          )
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
                          sortConfig.direction === 'asc' ? (
                            <FaSortUp className="mr-1" />
                          ) : (
                            <FaSortDown className="mr-1" />
                          )
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
                    <th className="px-3 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[15%]">
                      Progress
                    </th>
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
                          {row.noPO}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.createdDate}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.planDNDate}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.statusDN}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {row.progress}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                        No Delivery Note Available for This Supplier
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

export default WarehouseDeliveryNote;
