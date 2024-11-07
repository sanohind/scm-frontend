import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchBar from '../../../Table2/SearchBar';
import Pagination from '../../../Table2/Pagination';
import Select from 'react-select';
import { API_List_Partner_Purchasing, API_PO_History } from '../../../../api/api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const PurchasingHistoryPurchaseOrder = () => {
    const [data, setData] = useState<{ noPO: string; poDate: string; note: string; status: string }[]>([]);
    const [filteredData, setFilteredData] = useState<{ noPO: string; poDate: string; note: string; status: string }[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof typeof data[0] | '', direction: string }>({ key: '', direction: '' });
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();

    const fetchSuppliers = async () => {
        const token = localStorage.getItem('access_token');
        try {
        const response = await fetch(API_List_Partner_Purchasing(), {
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
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

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

    const handlePageChange = (page: number) => setCurrentPage(page);

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
        fetchPurchaseOrders(selectedOption.value);
        localStorage.setItem('selected_bp_code', selectedOption.value);
        } else {
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
                <div className="flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
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

                <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
                    <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-base text-gray-700">
                        <tr>
                        <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40"
                            onClick={() => handleSort('noPO')}>No. PO
                        </th>
                        <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                            onClick={() => handleSort('poDate')}>
                            <span className="flex items-center justify-center">
                            {sortConfig.key === 'poDate' ? (
                                sortConfig.direction === 'asc' ? <FaSortUp className="mr-1" /> : <FaSortDown className="mr-1" />
                            ) : <FaSortDown className="opacity-50 mr-1" />}
                            PO Date
                            </span>
                        </th>
                        <th className="py-3 text-center border-b border-b-gray-400 w-70">
                            Note
                        </th>
                        <th className="py-3 text-center border-b border-b-gray-400 w-30">
                            Status
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.length > 0 ? (
                        paginatedData.map((row, index) => (
                            <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                            <td className="px-2 py-4 text-center">
                                <button
                                onClick={() => handlePONavigate(row.noPO)}
                                className="text-blue-600 underline"
                                >
                                {row.noPO}
                                </button>
                            </td>
                            <td className="px-2 py-4 text-center">{row.poDate}</td>
                            <td className="px-2 py-4 text-center">{row.note}</td>
                            <td className="px-2 py-4 text-center">{row.status}</td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={4} className="text-center py-4">No History Purchase Order available for now</td>
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

export default PurchasingHistoryPurchaseOrder;
