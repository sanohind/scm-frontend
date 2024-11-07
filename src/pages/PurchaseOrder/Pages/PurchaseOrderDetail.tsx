import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../Table2/SearchBar';
import Pagination from '../../Table2/Pagination';
import { API_PO_Detail } from '../../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp, FaPrint } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const PurchaseOrderDetail = () => {
  interface DetailData {
    no: number;
    partNumber: string;
    partName: string;
    UoM: string;
    QTY: number;
    QTYReceipt: number;
  }
  
  const [data, setData] = useState<DetailData[]>([]);
  const [filteredData, setFilteredData] = useState<DetailData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [loading, setLoading] = useState(true);
  const [poDetails, setPODetails] = useState({
    noPO: '',
    planDelivery: '',
    note: ''
  });

  // Get noPO from URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const noPO = queryParams.get('noPO');

  const fetchPurchaseOrderDetails = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);

    try {
      const response = await fetch(`${API_PO_Detail()}${noPO}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response) throw new Error('Network response was not ok');

      const result = await response.json();

      if (result) {
        setPODetails({
          noPO: result.data.po_no,
          planDelivery: result.data.planned_receipt_date || '-',
          note: result.data.note || '-',
        });

        // Set details data
        const detailsData = result.data.detail.map((detail: any, index: number) => ({
          no: index + 1,
          partNumber: detail.bp_part_no || '-',
          partName: detail.item_desc_a || '-',
          UoM: detail.purchase_unit || '-',
          QTY: detail.po_qty || 0,
          QTYReceipt: detail.receipt_qty || 0,
        }));

        setData(detailsData);
        setFilteredData(detailsData);
        setLoading(false);
        // toast.success('Purchase Order details fetched successfully');
      } else {
        Swal.fire('Error', 'No Purchase Order details found.', 'error');
        toast.error(`No Purchase Order details found: ${result.message}`);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(`Failed to fetch data: ${error}`);
    }
  };

  useEffect(() => {
    if (noPO) {
      fetchPurchaseOrderDetails();
    }
  }, [noPO]);

  useEffect(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((row: any) =>
        row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.partName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue: string | number = a[sortConfig.key as keyof DetailData];
        let bValue: string | number = b[sortConfig.key as keyof DetailData];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = (aValue as string).toLowerCase();
          bValue = (bValue as string).toLowerCase();
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

  const handleSort = (key: keyof DetailData) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-12 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-12 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
      </td>
      <td className="px-2 py-4 text-center">
        <div className="h-4 bg-gray-300 rounded w-16 mx-auto"></div>
      </td>
    </tr>
  );

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Purchase Order Detail" />
      <div className="bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
          <div className="flex items-center">
            <span className="mr-2">No. PO:</span>
            {loading ? (
              <div className="h-6 skeleton rounded w-24"></div>
            ) : (
              <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.noPO}</span>
            )}
          </div>
          
          <div className="flex justify-between">
            <div className="flex gap-4">
              <div className="flex items-center">
                <span className="mr-2">Plan Delivery Date:</span>
                {loading ? (
                  <div className="h-6 skeleton rounded w-32"></div>
                ) : (
                  <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.planDelivery}</span>
                )}
              </div>
              <div className="flex items-center">
                <span className="mr-2">Note:</span>
                {loading ? (
                  <div className="h-6 skeleton rounded w-48"></div>
                ) : (
                  <span className="bg-stone-300 px-4 py-2 rounded">{poDetails.note}</span>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="flex items-center gap-2 px-6 py-2 bg-blue-900 text-white rounded"
                onClick={() => window.print()}
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


          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-20"
                    onClick={() => handleSort('no')}>
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'no' ? (
                        sortConfig.direction === 'asc' ? (
                          <FaSortUp className="mr-1" />
                        ) : (
                          <FaSortDown className="mr-1" />
                        )
                      ) : (
                        <FaSortDown className="opacity-50 mr-1" />
                      )}
                      No
                    </span>
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-60">Part Number</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-80">Part Name</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">UoM</th>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-30"
                    onClick={() => handleSort('QTY')}
                  >
                    <span className="flex items-center justify-center">
                      {sortConfig.key === 'QTY' ? (
                        sortConfig.direction === 'asc' ? (
                          <FaSortUp className="mr-1" />
                        ) : (
                          <FaSortDown className="mr-1" />
                        )
                      ) : (
                        <FaSortDown className="opacity-50 mr-1" />
                      )}
                      QTY PO
                    </span>
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">QTY Receipt</th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">QTY Minus</th>
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
                      <td className="px-2 py-4 text-center">{row.no}</td>
                      <td className="px-2 py-4 text-center">{row.partNumber}</td>
                      <td className="px-2 py-4 text-center">{row.partName}</td>
                      <td className="px-2 py-4 text-center">{row.UoM}</td>
                      <td className="px-2 py-4 text-center">{row.QTY}</td>
                      <td className="px-2 py-4 text-center">{row.QTYReceipt}</td>
                      <td className="px-2 py-4 text-center">{row.QTY - row.QTYReceipt}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No data available
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

export default PurchaseOrderDetail;
