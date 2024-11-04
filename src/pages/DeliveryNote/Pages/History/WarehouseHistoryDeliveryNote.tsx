import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import Select from 'react-select';
import { API_List_Partner, API_DN_History_Warehouse } from '../../../../api/api';
import { useNavigate } from 'react-router-dom';

const WarehouseHistoryDeliveryNote = () => {
  interface DeliveryNote {
    noDN: string;
    noPO: string;
    statusDN: string;
    planDNDate: string;
    receivedDNDate: string;
    noPackingSlip: string;
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

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_List_Partner(), {
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
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const fetchHistoryDeliveryNote = async (supplierCode: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_DN_History_Warehouse()}${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch history delivery note:', response.status);
        setFilteredData([]);
        setData([]);
        return;
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const deliveryNote = result.data.map((dn: any) => ({
          noDN: dn.dn_number || '-',
          noPO: dn.po_number || '-',
          statusDN: dn.dn_status || '-',
          planDNDate: dn.send_date || '-',
          receivedDNDate: dn.receive_date || '-',
          noPackingSlip: dn.packing_slip || '-',
        }));

        setData(deliveryNote);
        setFilteredData(deliveryNote);
      } else {
        setData([]);
        setFilteredData([]);
        Swal.fire('No History DN data found', result.message, 'info');
      }
    } catch (error) {
      console.error('Error fetching history delivery note:', error);
      Swal.fire('Error', 'Failed to fetch history delivery note. Please try again later.', 'error');
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
      fetchHistoryDeliveryNote(selectedOption.value);
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
      <Breadcrumb pageName="history Delivery Note" />
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
              placeholder="Search no history delivery note..."
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40">
                    No. DN
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40">
                    No. PO
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
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-4 text-center">
                        <button
                          onClick={() => handleDNNavigate(row.noDN)}
                          className="text-blue-600 underline"
                        >
                          {row.noDN}
                        </button>
                      </td>
                      <td className="px-2 py-4 text-center">{row.noPO}</td>
                      <td className="px-2 py-4 text-center">{row.statusDN}</td>
                      <td className="px-2 py-4 text-center">{row.planDNDate}</td>
                      <td className="px-2 py-4 text-center">{row.receivedDNDate}</td>
                      <td className="px-2 py-4 text-center">{row.noPackingSlip}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No history Delivery Note available for now
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
      </div>
    </>
  );
};

export default WarehouseHistoryDeliveryNote;
