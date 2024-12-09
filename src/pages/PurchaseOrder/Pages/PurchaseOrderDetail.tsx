import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import SearchBar from '../../../components/Table/SearchBar';
import Pagination from '../../../components/Table/Pagination';
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
  const [rowsPerPage] = useState(10);
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

  const handlePrintPO = () => {
    window.open(`/#/print/purchase-order?noPO=${noPO}`, '_blank');
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb 
        pageName="Purchase Order Detail" 
        isSubMenu={true}
        parentMenu={{
          name: "Purchase Order",
          link: "/purchase-order"
        }}
      />
      <div className="bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-4 md:space-y-6">
            {/* PO Number */}
            <div className="flex items-center">
              <span className="text-sm md:text-base font-medium mr-2">No. PO :</span>
              {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
              ) : (
              <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{poDetails.noPO}</span>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
              {/* Left side details */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Plan Delivery Date */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Plan Delivery Date :</span>
                  {loading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-36"></div>
                  ) : (
                  <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{poDetails.planDelivery}</span>
                  )}
                </div>

                {/* Note */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Note :</span>
                  {loading ? (
                  <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-48"></div>
                  ) : (
                  <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">{poDetails.note}</span>
                  )}
                </div>
              </div>

              {/* Print Button */}
              <div className="flex items-center">
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handlePrintPO}
                >
                  <FaPrint className="w-4 h-4" />
                  <span>Print PO</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex justify-end w-full">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <SearchBar
                  placeholder="Search part number or name..."
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[5%] cursor-pointer"
                      onClick={() => handleSort('no')}
                    >
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
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]">Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[30%]">Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">UoM</th>
                    <th 
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%] cursor-pointer"
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
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">QTY Receipt</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">QTY Minus</th>
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
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                  ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.no}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.partNumber}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.partName}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.UoM}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.QTY}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.QTYReceipt}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">{row.QTY - row.QTYReceipt}</td>
                    </tr>
                  ))
                  ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-4 text-center text-gray-500">No data available</td>
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

export default PurchaseOrderDetail;
