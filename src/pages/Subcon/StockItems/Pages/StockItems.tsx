import { useEffect, useState } from 'react';
import Breadcrumb from "../../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import { API_Item_Subcont } from '../../../../api/api';
import { FaFileExcel, FaSortDown, FaSortUp } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Import xlsx
import Button from '../../../../components/Forms/Button';

const StockItems = () => {
  const [data, setData] = useState<StockItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

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
    if (sortConfig.key) {
      filtered.sort((a, b) => {
          let aValue = a[sortConfig.key as keyof StockItem];
          let bValue = b[sortConfig.key as keyof StockItem];

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  }
    if (searchQuery) {
        filtered = filtered.filter((row) =>
            (row.part_number?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
            (row.part_name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
            (row.old_part_name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
        );
    }

    setFilteredData(filtered);
  }, [searchQuery, sortConfig, data]);


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

  const handleSort = (key: keyof StockItem) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    if (!filteredData.length) {
        toast.warn('No data available to export.');
        return;
    }

    const header = [
        "Part Number", "Part Name", "Old Part Name",
        "Fresh - Unprocess Incoming Items", "Fresh - Ready Delivery Items", "Fresh - NG Items",
        "Replating - Unprocess Incoming Items", "Replating - Ready Delivery Items", "Replating - NG Items"
    ];

    const body = filteredData.map(item => ({
        "Part Number": item.part_number,
        "Part Name": item.part_name,
        "Old Part Name": item.old_part_name,
        "Fresh - Unprocess Incoming Items": item.incoming_fresh_stock,
        "Fresh - Ready Delivery Items": item.ready_fresh_stock,
        "Fresh - NG Items": item.ng_fresh_stock,
        "Replating - Unprocess Incoming Items": item.incoming_replating_stock,
        "Replating - Ready Delivery Items": item.ready_replating_stock,
        "Replating - NG Items": item.ng_replating_stock,
    }));

    const worksheet = XLSX.utils.json_to_sheet(body, { header: header, skipHeader: false });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Items");

    // Adjust column widths (optional, but improves readability)
    const colWidths = header.map((_, i) => ({ wch: i < 3 ? 20 : 15 })); // Adjust widths as needed
    worksheet['!cols'] = colWidths;

    // Generate buffer
    XLSX.writeFile(workbook, `Stock_Items_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast.success('Exported to Excel successfully!');
  };

  return (
    <>
      <ToastContainer />
      <Breadcrumb pageName="Stock Items" />
      <div className="font-poppins bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          <div className="flex justify-end items-center space-x-2 md:w-1/2 lg:w-1/3 ml-auto">
            <div>
              <SearchBar
                placeholder="Search part number or name..."
                onSearchChange={setSearchQuery}
              />
            </div>
            {/* <button
                onClick={handleExportExcel}
                disabled={!filteredData.length || loading}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to Excel"
            >
                Export
            </button> */}
            <Button
                title="Export Excel"
                onClick={handleExportExcel}
                disabled={!filteredData.length || loading}
                color="bg-primary"
                className="px-4 py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                icon={FaFileExcel}
            />
          </div>

          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                        rowSpan={2}
                        className="cursor-pointer px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[12%]"
                        onClick={() => handleSort('part_number')}
                        >
                            <span className="flex items-center justify-center">
                                Part Number
                                {sortConfig.key === 'part_number' ? (
                                sortConfig.direction === 'asc' ? (
                                    <FaSortUp className="mr-1" />
                                ) : (
                                    <FaSortDown className="mr-1" />
                                )
                                ) : (
                                <FaSortDown className="opacity-50 mr-1" />
                                )}
                            </span>
                    </th>
                    <th
                        rowSpan={2}
                        className="cursor-pointer px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[14%]"
                        onClick={() => handleSort('part_name')}
                        >
                        <span className="flex items-center justify-center">
                            Part Name
                            {sortConfig.key === 'part_name' ? (
                            sortConfig.direction === 'asc' ? (
                                <FaSortUp className="mr-1" />
                            ) : (
                                <FaSortDown className="mr-1" />
                            )
                            ) : (
                            <FaSortDown className="opacity-50 mr-1" />
                            )}
                        </span>
                    </th>
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
                        <td className="px-3 py-3 text-center whitespace-nowrap bg-gray-3">{row.incoming_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.ready_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap bg-gray-3">{row.ng_fresh_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.incoming_replating_stock}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap bg-gray-3">{row.ready_replating_stock}</td>
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