import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import Swal from 'sweetalert2';
import { API_DN_Detail } from '../../api/api';
import { FaPrint } from 'react-icons/fa';

const DeliveryNoteDetail = () => {
  const [details, setDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const location = useLocation();
  const navigate = useNavigate();
  const noDN = new URLSearchParams(location.search).get('noDN');
  const [dnDetails, setDNDetails] = useState({ noDN: '', noPO: '', planDelivery: '' });

  // Fetch Delivery Note Details from API
  const fetchDeliveryNoteDetails = async () => {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_DN_Detail()}${noDN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.data && result.data) {

        const dn = result.data;

        setDNDetails({
            noDN: dn.no_dn || '-',
            noPO: dn.po_no || '-',
            planDelivery: dn.plan_delivery_date || '-',
        });
        
          const details = dn.detail.map((detail, index) => ({
            no: (index + 1).toString(),
            partNumber: detail.part_no || '-',
            partName: detail.item_desc_a || '-',
            QTY: detail.dn_qty || '0',
            qtyLabel: detail.dn_snp || '0',
            qtyDelivered: detail.receipt_qty || '0',
            qtyReceived: detail.receipt_qty || '0',
          }));

          setDetails(details);
          setFilteredData(details);
        
      } else {
        Swal.fire('Error', 'No delivery note details found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching delivery note details:', error);
      Swal.fire('Error', 'Failed to fetch delivery note details.', 'error');
    }
  };

  useEffect(() => {
    if (noDN) {
      fetchDeliveryNoteDetails();
    }
  }, [noDN]);

  useEffect(() => {
    let filtered = [...details];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (row) =>
          row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.partName.toLowerCase().includes(searchQuery.toLowerCase())
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

    if (searchQuery) {
        filtered = filtered.filter((row) =>
          row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.partName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

  }, [searchQuery, details, sortConfig]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);


  return (
    <>
      <Breadcrumb pageName="History Delivery Note Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
          <div className="flex items-center">
            <span className="mr-2">No. DN:</span>
            <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.noDN}</span>
          </div>
          
          <div className="flex justify-between">
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <span className="mr-2">No. PO:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.noPO}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Plan Delivery Date:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.planDelivery}</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded"
                onClick={() => navigate(`/print-dn?noDN=${noDN}`)}
              >
                <FaPrint className="w-4 h-4" /> {/* Print icon added here */}
                <span>Print PO</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            
            <SearchBar
              placeholder="Search part number or name..."
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="px-2 py-3 text-center border-b">No</th>
                  <th className="px-2 py-3 text-center border-b">Part Number</th>
                  <th className="px-2 py-3 text-center border-b">Part Name</th>
                  <th className="px-2 py-3 text-center border-b">QTY Requested</th>
                  <th className="px-2 py-3 text-center border-b">QTY Label</th>
                  <th className="px-2 py-3 text-center border-b">QTY Delivered</th>
                  <th className="px-2 py-3 text-center border-b">QTY Received</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr
                      key={index}
                      className="odd:bg-white even:bg-gray-50 border-b"
                    >
                      <td className="px-2 py-4 text-center">{row.no}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.QTY}</td>
                      <td className="px-2 py-4 text-center">{row.qtyLabel}</td>
                      <td className="px-2 py-4 text-center">{row.qtyDelivered}</td>
                      <td className="px-2 py-4 text-center">{row.qtyReceived}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No details available for this delivery note
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

export default DeliveryNoteDetail;
