import { useEffect, useState } from 'react';
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../Table2/SearchBar';
import Pagination from '../../Table2/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import { API_Item_Subcont } from '../../../api/api';

const StockItems = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');

  interface StockItem {
    part_number: string;
    part_name: string;
    incoming_fresh_stock: number;
    ready_fresh_stock: number;
    ng_fresh_stock: number;
    incoming_replating_stock: number;
    ready_replating_stock: number;
    ng_replating_stock: number;
  }

  const fetchStockItems = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_Item_Subcont(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      setData(result.data);
      setFilteredData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    }
  };

  useEffect(() => {
    fetchStockItems();
  }, []);

  useEffect(() => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.part_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, data]);

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
                  <td className="px-2 py-4 text-center">{row.part_number}</td>
                  <td className="px-2 py-4 text-center">{row.part_name}</td>
                  {/* Fresh columns */}
                  <td className="px-2 py-4 text-center">{row.incoming_fresh_stock}</td>
                  <td className="px-2 py-4 text-center">{row.ready_fresh_stock}</td>
                  <td className="px-2 py-4 text-center">{row.ng_fresh_stock}</td>
                  {/* Replating columns */}
                  <td className="px-2 py-4 text-center">{row.incoming_replating_stock}</td>
                  <td className="px-2 py-4 text-center">{row.ready_replating_stock}</td>
                  <td className="px-2 py-4 text-center">{row.ng_replating_stock}</td>
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
