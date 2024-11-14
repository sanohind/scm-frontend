import { useEffect, useState } from 'react';
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../Table2/SearchBar';
import Pagination from '../../Table2/Pagination';
// import { API_getStockItems } from '../../api/api';
import Swal from 'sweetalert2';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';

const StockItems = () => {
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });


  interface StockItem {
    partNumber: string;
    partName: string;
    freshIncoming: number;
    freshReadyDelivery: number;
    freshNotGood: number;
    replatingIncoming: number;
    replatingReadyDelivery: number;
    replatingNotGood: number;
    stockTotal: number;
  }
  
  const [data, setData] = useState<StockItem[]>([
      {
        partNumber: "P001",
        partName: "Brake Pipe",
        freshIncoming: 100,
        freshReadyDelivery: 50,
        freshNotGood: 5,
        replatingIncoming: 20,
        replatingReadyDelivery: 15,
        replatingNotGood: 2,
        stockTotal: 192
      },
    {
      partNumber: "P002",
      partName: "Fuel Line",
      freshIncoming: 150,
      freshReadyDelivery: 75,
      freshNotGood: 8,
      replatingIncoming: 30,
      replatingReadyDelivery: 25,
      replatingNotGood: 3,
      stockTotal: 291
    },
    {
      partNumber: "P003",
      partName: "Hydraulic Hose",
      freshIncoming: 80,
      freshReadyDelivery: 40,
      freshNotGood: 4,
      replatingIncoming: 15,
      replatingReadyDelivery: 10,
      replatingNotGood: 1,
      stockTotal: 150
    },
    {
      partNumber: "P004",
      partName: "Coupling",
      freshIncoming: 200,
      freshReadyDelivery: 100,
      freshNotGood: 10,
      replatingIncoming: 40,
      replatingReadyDelivery: 30,
      replatingNotGood: 5,
      stockTotal: 385
    },
    {
      partNumber: "P005",
      partName: "Steel Tube",
      freshIncoming: 120,
      freshReadyDelivery: 60,
      freshNotGood: 6,
      replatingIncoming: 25,
      replatingReadyDelivery: 20,
      replatingNotGood: 2,
      stockTotal: 233
    }
  ]);

  // const fetchStockItems = async () => {
  //   const token = localStorage.getItem('access_token');
  //   try {
  //     const response = await fetch(API_getStockItems, {
  //       method: 'GET',
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (!response.ok) throw new Error('Network response was not ok');
  //     const result = await response.json();
  //     setData(result.data);
  //     setFilteredData(result.data);
  //   } catch (error) {
  //     console.error('Error fetching data:', error);
  //     Swal.fire('Error', 'Failed to fetch stock items.', 'error');
  //   }
  // };

  useEffect(() => {
    // fetchStockItems();
  }, []);

  useEffect(() => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.partName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key as keyof StockItem];
        let bValue = b[sortConfig.key as keyof StockItem];

        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

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

  return (
    <>
      <ToastContainer />
      <Breadcrumb pageName="Stock Items" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
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
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400" rowSpan={2}>Part No</th>
                  <th className="py-3 px-3 text-center border-b border-x border-b-gray-400" rowSpan={2}>Part Name</th>
                  <th className="py-3 px-3 text-center border-b border-x" colSpan={3}>Fresh</th>
                  <th className="py-3 px-3 text-center border-b border-x" colSpan={3}>Replating</th>                  
                </tr>
                <tr>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">Unprocess Incoming Stock</th>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">Ready Delivery Stock</th>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">NG Stock</th>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">Unprocess Incoming Stock</th>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">Ready Delivery Stock</th>
                  <th className="py-2 px-2 text-center border-b border-x border-b-gray-400">NG Stock</th>
                </tr>
                
              </thead>

              <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                  <td className="px-2 py-4 text-center">{row.partNumber}</td>
                  <td className="px-2 py-4 text-center">{row.partName}</td>
                  {/* Fresh columns */}
                  <td className="px-2 py-4 text-center">{row.freshIncoming}</td>
                  <td className="px-2 py-4 text-center">{row.freshReadyDelivery}</td>
                  <td className="px-2 py-4 text-center">{row.freshNotGood}</td>
                  {/* Replating columns */}
                  <td className="px-2 py-4 text-center">{row.replatingIncoming}</td>
                  <td className="px-2 py-4 text-center">{row.replatingReadyDelivery}</td>
                  <td className="px-2 py-4 text-center">{row.replatingNotGood}</td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No data available
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

export default StockItems;
