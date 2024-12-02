import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import Select from 'react-select';
import { API_List_Partner_Admin, API_PO_History } from '../../../../api/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const PurchasingHistoryPurchaseOrder = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<{ noPO: string; poDate: string; note: string; status: string }[]>([]);
    const [filteredData, setFilteredData] = useState<{ noPO: string; poDate: string; note: string; status: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof typeof data[0] | '', direction: string }>({ key: '', direction: '' });
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();

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
        const suppliersList = result.data.map((supplier: { bp_code: string; bp_name: string }) => ({
            value: supplier.bp_code,
            label: `${supplier.bp_code} | ${supplier.bp_name}`,
        }));

        setSuppliers(suppliersList);
        } catch (error) {
        console.error('Error fetching suppliers:', error);
        }
    };

    const fetchPurchaseOrders = async (supplierCode: string) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            const response = await fetch(`${API_PO_History()}${supplierCode}`, {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch purchase orders:', response.status);
            toast.error(`Failed to fetch purchase orders. ${response.statusText}`);
            setFilteredData([]);
            setData([]);
            return;
        }

        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            const purchaseOrder = result.data.map((po: any) => ({
            noPO: po.po_number || 'N/A',
            poDate: po.po_date || '-',          
            note: po.note || '-',
            status: po.po_status || '-'          
            }));

            setData(purchaseOrder);
            setFilteredData(purchaseOrder);
        } else {
            setData([]);
            setFilteredData([]);
            toast.error('No purchase orders found.');
        }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            if (error instanceof Error) {
                toast.error(`Failed to fetch purchase orders. ${error.message}`);
            } else {
                toast.error('Failed to fetch purchase orders.');
            }
            setData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
        const savedPage = localStorage.getItem('po_history_current_page');
        if (savedPage) {
            setCurrentPage(parseInt(savedPage));
        }
    }, []);

    useEffect(() => {
        const savedSupplierCode = localStorage.getItem('selected_supplier');
        if (savedSupplierCode && suppliers.length > 0) {
            const savedSupplier = suppliers.find(
                (sup: { value: string; label: string }) => sup.value === savedSupplierCode
            );
            if (savedSupplier) {
                setSelectedSupplier(savedSupplier);
                fetchPurchaseOrders(savedSupplierCode);
            }
        }
    }, [suppliers]);

    useEffect(() => {
        let filtered = [...data];

        if (searchQuery) {
        filtered = filtered.filter(row =>
            row.noPO.toLowerCase().includes(searchQuery.toLowerCase())
        );
        }

        if (sortConfig.key) {
        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key as keyof typeof a];
            let bValue = b[sortConfig.key as keyof typeof b];

            if (sortConfig.key === 'poDate') {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        localStorage.setItem('po_history_current_page', page.toString());
    };

    const handleSort = (key: keyof typeof data[0]) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            fetchPurchaseOrders(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            localStorage.removeItem('po_history_current_page');
            setData([]);
            setFilteredData([]);
        }
    };

    const handlePONavigate = (noPO: string) => {
        navigate(`/purchase-order-detail?noPO=${noPO}`);
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="History Purchase Order" />
            <div className="font-poppins bg-white">
                <div className="p-2 md:p-4 lg:p-6 space-y-6">
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <Select
                        options={suppliers}
                        value={selectedSupplier}
                        onChange={handleSupplierChange}
                        placeholder="Select Supplier"
                        className="w-80"
                        />
                        <SearchBar
                        placeholder="Search no purchase order..."
                        onSearchChange={setSearchQuery}
                        />
                    </div>

                    <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]"
                                            onClick={() => handleSort('noPO')}
                                        >
                                            No. PO
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                                            onClick={() => handleSort('poDate')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'poDate' ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                ) : (
                                                    <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                PO Date
                                            </span>
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[40%]"
                                            onClick={() => handleSort('note')}
                                        >
                                            Note
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                                            onClick={() => handleSort('status')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'status' ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                ) : (
                                                    <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                Status
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        Array.from({ length: rowsPerPage }).map((_, index) => (
                                            <tr key={index}>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                                                </td>
                                                <td className="px-3 py-4 text-center">
                                                    <div className="h-4 bg-gray-200 rounded mx-auto"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handlePONavigate(row.noPO)}
                                                        className="text-blue-600 underline"
                                                    >
                                                        {row.noPO}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.poDate}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.note}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                                                No history purchase orders available for now
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

export default PurchasingHistoryPurchaseOrder;
