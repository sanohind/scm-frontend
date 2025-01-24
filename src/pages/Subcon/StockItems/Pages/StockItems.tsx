import { useEffect, useState } from 'react';
import Breadcrumb from "../../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import { API_Item_Subcont } from '../../../../api/api';

const StockItems = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  interface StockItem {
    part_number: string;
    part_name: string;
    old_part_name: string;
    incoming_fresh_stock: number;
    ready_fresh_stock: number;
    ng_fresh_stock: number;
    incoming_replating_stock: number;
    ready_replating_stock: number;
    ng_replating_stock: number;
  }

  const fetchStockItems = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
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
    } finally {
      setLoading(false);
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
        row.part_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.old_part_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, data]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
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
      <td className="px-3 py-3 text-center whitespace-nowrap">
        <div className="h-4 bg-gray-200 rounded"></div>
      </td>
    </tr>
  );

  return (
    <>
      <ToastContainer />
      <Breadcrumb pageName="Stock Items" />
      <div className="font-poppins bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          <div className="flex justify-end md:w-1/2 lg:w-1/3">
            <SearchBar
              placeholder="Search part number or name..."
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[12%]" rowSpan={2}>Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[14%]" rowSpan={2}>Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[14%]" rowSpan={2}>Old Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[30%]" colSpan={3}>Fresh</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[30%]" colSpan={3}>Replating</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">Unprocess Incoming Items</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">Ready Delivery Items</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">NG Items</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">Unprocess Incoming Items</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">Ready Delivery Items</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[10%]">NG Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: rowsPerPage }).map((_, index) => (
                      <SkeletonRow key={index} />
                    ))
                  ) : paginatedData.length > 0 ? (
                    paginatedData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.part_number}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.part_name}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.old_part_name}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.incoming_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.ready_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.ng_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.incoming_replating_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.ready_replating_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.ng_replating_stock}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 py-4 text-center text-gray-500">No data available</td>
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

export default StockItems;