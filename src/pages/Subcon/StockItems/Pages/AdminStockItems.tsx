import { useEffect, useState } from 'react';
import Breadcrumb from "../../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import { API_List_Partner_Admin, API_Stock_Item_Subcont_Admin } from '../../../../api/api';
import { FaFileExcel, FaSortDown, FaSortUp } from 'react-icons/fa';
import * as XLSX from 'xlsx'; // Import xlsx
import Button from '../../../../components/Forms/Button';

const AdminStockItems = () => {
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

    interface Supplier {
        value: string;
        label: string;
    }

    const [data, setData] = useState<StockItem[]>([]);
    const [filteredData, setFilteredData] = useState<StockItem[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });


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
        toast.error('Failed to fetch suppliers');
        }
    };

    const fetchStockItems = async (supplierCode: string) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            const response = await fetch(`${API_Stock_Item_Subcont_Admin()}${supplierCode}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            
            if (result.status && Array.isArray(result.data)) {
                setData(result.data);
                setFilteredData(result.data);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const savedSupplierCode = localStorage.getItem('selected_supplier');
        if (savedSupplierCode && suppliers.length > 0) {
            const savedSupplier = suppliers.find(
                (sup: Supplier) => sup.value === savedSupplierCode
            );
            if (savedSupplier) {
                setSelectedSupplier(savedSupplier);
                fetchStockItems(savedSupplierCode);
            }
        }
    }, [suppliers]);

    useEffect(() => {
        let sorted = [...data];
        if (sortConfig.key) {
            sorted.sort((a, b) => {
                let aValue = a[sortConfig.key as keyof StockItem];
                let bValue = b[sortConfig.key as keyof StockItem];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        if (searchQuery) {
            sorted = sorted.filter((row) =>
                (row.part_number?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
                (row.part_name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
                (row.old_part_name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
            );
        }
        setFilteredData(sorted);
    }, [data, searchQuery, sortConfig]);

    const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            fetchStockItems(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            setData([]);
            setFilteredData([]);
        }
    };

    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    const SkeletonRow = () => (
        <tr className="animate-pulse">
        {Array.from({ length: 8 }).map((_, idx) => (
            <td key={idx} className="px-3 py-3 text-center whitespace-nowrap">
            <div className="h-4 bg-gray-200 rounded"></div>
            </td>
        ))}
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
        XLSX.writeFile(workbook, `Stock_Items_${selectedSupplier?.label.split(' | ')[0] || 'All'}_${new Date().toISOString().slice(0,10)}.xlsx`);
        toast.success('Exported to Excel successfully!');
    };

    return (
        <>
        <ToastContainer />
        <Breadcrumb pageName="Stock Items" />
        <div className="font-poppins bg-white text-black">
            <div className="p-2 md:p-4 lg:p-6 space-y-6">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <Select
                options={suppliers}
                value={selectedSupplier}
                onChange={handleSupplierChange}
                placeholder="Select Supplier"
                className="w-80"
                />
                <div className='flex items-center md:w-1/2 lg:w-1/2 justify-end space-x-2'>
                    <div>
                        <SearchBar
                            placeholder="Search part number or name..."
                            onSearchChange={setSearchQuery}
                        />
                    </div>
                    <Button
                        title="Export Excel"
                        onClick={handleExportExcel}
                        disabled={!filteredData.length || loading}
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        icon={FaFileExcel}
                    />
                </div>
            </div>

            <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    {/* Table header and body from StockItems component */}
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
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">Unprocess Incoming Items</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">Ready Delivery Items</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">NG Items</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">Unprocess Incoming Items</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">Ready Delivery Items</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">NG Items</th>
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
                        <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                            {selectedSupplier ? 'No data available for selected supplier' : 'Please select a supplier'}
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

export default AdminStockItems;