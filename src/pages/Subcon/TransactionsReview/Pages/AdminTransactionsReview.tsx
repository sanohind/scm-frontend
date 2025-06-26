import { useEffect, useState } from 'react';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    API_List_Partner_Admin, 
    API_Transaction_Review_Subcont_Admin } from '../../../../api/api';

const AdminTransactionReview = () => {
    interface TransactionReview {
        noDN: string;
        transactionDate: string;
        status: string;
        response: string;
    }

    const [data, setData] = useState<TransactionReview[]>([]);
    const [filteredData, setFilteredData] = useState<TransactionReview[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

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
        }
    };

    const fetchTransactionReview = async (supplierCode: string) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            const response = await fetch(`${API_Transaction_Review_Subcont_Admin()}${supplierCode}`, {
                method: 'GET',
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                console.error('Failed to fetch transaction:', response.status);
                toast.error(`Failed to fetch transaction. ${response.statusText}`);
                setFilteredData([]);
                setData([]);
                return;
            }

            const result = await response.json();
            if (result.data && Array.isArray(result.data) && result.data.length > 0) {
                const TransactionReview = result.data.map((transaction: any) => ({
                    noDN: transaction.delivery_note || 'N/A',                
                    transactionDate: transaction.date_time || '-',
                    status: transaction.status || '-',
                    response: transaction.response || 'Need Review',
                }));

                setData(TransactionReview);
                setFilteredData(TransactionReview);
                setLoading(false);
            } else {
                setData([]);
                setFilteredData([]);
                // toast.info(`No transaction found for ${supplierCode}`);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching transaction:', error);
            if (error instanceof Error) {
                toast.error(`Error fetching transaction: ${error.message}`);
            } else {
                toast.error('Error fetching transaction');
            }
            setData([]);
            setFilteredData([]);
        }
    };

    useEffect(() => {
        fetchSuppliers();

        const savedPage = localStorage.getItem('current_page');
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
                fetchTransactionReview(savedSupplierCode);
            }
        }
    }, [suppliers]);

    useEffect(() => {
        let filtered = [...data];

        if (searchQuery) {
            filtered = filtered.filter(row =>
                row.noDN.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig.key) {
        filtered.sort((a, b) => {
            let aValue = a[sortConfig.key as keyof TransactionReview];
            let bValue = b[sortConfig.key as keyof TransactionReview];

            if (sortConfig.key === 'transactionDate') {
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
        localStorage.setItem('current_page', page.toString());
    };

    const handleSort = (key: keyof TransactionReview) => {
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
            fetchTransactionReview(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            localStorage.removeItem('current_page');
            setCurrentPage(1);
            setData([]);
            setFilteredData([]);
        }
    };


    const handleNavigate = (noDN: string) => {
        navigate(`/transactions-review-detail?noDN=${noDN}`);
    };

    return (
        <>
            {/* <ToastContainer position="top-right" /> */}
            <Breadcrumb pageName="Transaction Review" />
            <div className="font-poppins bg-white">
                <div className="p-2 md:p-4 lg:p-6 space-y-6">
                
                    {/* Header Section */}
                    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <Select
                        options={suppliers}
                        value={selectedSupplier}
                        onChange={handleSupplierChange}
                        placeholder="Select Supplier"
                        className="w-80"
                        />
                        <div className='md:w-1/2 lg:w-1/3'>
                        <SearchBar
                            placeholder="Search no dn here..."
                            onSearchChange={setSearchQuery}
                        />
                        </div>
                    </div>

                    <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300 mt-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]">
                                            No. DN
                                        </th>
                                        <th
                                        className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[25%]"
                                            onClick={() => handleSort('transactionDate')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'transactionDate' ? (
                                                sortConfig.direction === 'asc' ? (
                                                    <FaSortUp className="mr-1" />
                                                ) : (
                                                    <FaSortDown className="mr-1" />
                                                )
                                                ) : (
                                                <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                Transaction Date
                                            </span>
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[25%]"
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
                                        <th className="px-3 py-3.5 text-xs font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]">
                                            Response
                                        </th>
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
                                        </tr>
                                        ))
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => handleNavigate(row.noDN)}
                                                    className="text-blue-600 underline"
                                                >
                                                    {row.noDN}
                                                </button>
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                {row.transactionDate}
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                {row.status}
                                            </td>
                                            <td className="px-3 py-3 text-center font-medium text-primary whitespace-nowrap">
                                                Need Review
                                            </td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                                                No Transaction Review for This Supplier
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

export default AdminTransactionReview;
