import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../Table2/SearchBar';
import Pagination from '../Table2/Pagination';
import Swal from 'sweetalert2';
import { API_DN_History_Supplier } from '../../api/api';
import { FaPrint } from 'react-icons/fa';

const HistoryDeliveryNoteDetail = () => {
  const [details, setDetails] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const noDN = new URLSearchParams(location.search).get('noDN');
  const [dnDetails, setDNDetails] = useState({ noDN: '', noPO: '', planDelivery: '' });

  // Fetch Delivery Note Details from API
  const fetchHistoryDeliveryNoteDetails = async () => {
    const token = localStorage.getItem('access_token');
    const bpCode = localStorage.getItem('bp_code');

    try {
      const response = await fetch(`${API_DN_History_Supplier()}${bpCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result.data) {
        const dn = result.data.find((dn) => dn.dn_number === noDN);
        if (dn) {
          const detailsData = dn.detail.map((detail, index) => ({
            no: (index + 1).toString(),
            partNumber: detail.internal_part_number || 'No Part Number',
            partName: detail.part_name || 'No Part Name',
            QTY: detail.total_quantity || '0',
            qtyLabel: detail.pcs_per_kamban || '0',
            qtyDelivered: detail.total_quantity || '0',
            qtyReceived: detail.total_quantity || '0',
          }));

          setDNDetails({
            noDN: dn.dn_number || 'No DN Number',
            noPO: dn.po_number || 'No PO Number',
            planDelivery: dn.send_date || 'Unknown Plan Delivery Date',
          });

          setDetails(detailsData);
          setFilteredData(detailsData);
        } else {
          Swal.fire('Error', 'No details found for this delivery note.', 'error');
        }
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
      fetchHistoryDeliveryNoteDetails();
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

    setFilteredData(filtered);
  }, [searchQuery, details]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => setCurrentPage(page);

  const handleSearch = (query) => setSearchQuery(query);

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

export default HistoryDeliveryNoteDetail;
