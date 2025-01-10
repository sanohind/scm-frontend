import { useEffect, useState } from 'react';
import Breadcrumb from "../../../../components/Breadcrumbs/Breadcrumb";
import SearchBar from '../../../../components/Table/SearchBar';
import Pagination from '../../../../components/Table/Pagination';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TransactionsReview = () => {
    const [data, setData] = useState<TransactionReview[]>([]);
    const [filteredData, setFilteredData] = useState<TransactionReview[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    interface TransactionReview {
        delivery_note: string;
        transaction_date: string;
        transaction_type: string;
        status: string;
    }

    const fetchTransactionsReview = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            const response = await fetch(API_Transaction_Review_Subcont(), {
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
        fetchTransactionsReview();
    }, []);

    useEffect(() => {
        let filtered = [...data];
        if (searchQuery) {
            filtered = filtered.filter((row) =>
                row.delivery_note.toLowerCase().includes(searchQuery.toLowerCase())
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
        </tr>
    );
    
    const handleDNNavigate = (noDN: string) => {
        navigate(`/transactions-review-detail?noDN=${noDN}`);
    };
    return (
        <>
        <ToastContainer />
        <Breadcrumb pageName="Stock Items" />
        <div className="font-poppins bg-white text-black">
            <div className="p-2 md:p-4 lg:p-6 space-y-6">
            <div className="flex justify-end md:w-1/2 lg:w-1/3">
                <SearchBar
                placeholder="Search delivery note here..."
                onSearchChange={setSearchQuery}
                />
            </div>

            <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Delivery Note</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Transaction Date</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Transaction Type</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Status</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">Response</th>
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
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                <button
                                    onClick={() => handleDNNavigate(row.delivery_note)}
                                    className="text-blue-600 underline"
                                >
                                    {row.delivery_note}
                                </button>
                            </td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">{row.transaction_date}</td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">{row.transaction_type}</td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">Under Review</td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500">No transaction records available</td>
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

export default TransactionsReview;