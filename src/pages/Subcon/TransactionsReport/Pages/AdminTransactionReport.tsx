import { useEffect, useState } from 'react';
import Select from 'react-select';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../../../components/Table/Pagination';
import MultiSelect from '../../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import SearchBar from '../../../../components/Table/SearchBar';
import { API_List_Item_Subcont_Admin, API_List_Partner_Admin, API_Transaction_Report_Subcont_Admin } from '../../../../api/api';
import DatePicker from '../../../../components/Forms/DatePicker';
import Button from '../../../../components/Forms/Button';

const AdminTransactionReport = () => {
    interface TransactionLog {
        timestamp: string;
        type: string;
        status: string;
        partName: string;
        partNumber: string;
        qtyOk: number;
        qtyNg: number;
        deliveryNote: string;
        actualQtyOk: number;
        actualQtyNg: number;
        response: string;
    }
    
    interface Supplier {
        value: string;
        label: string;
    }

    const [filteredData, setFilteredData] = useState<TransactionLog[]>([]);
    const [allData, setAllData] = useState<TransactionLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [selectedTransactionTypes, setSelectedTransactionTypes] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedParts, setSelectedParts] = useState<string[]>([]);
    const today = new Date();
    const [startDate, setStartDate] = useState<Date>(today);
    const [endDate, setEndDate] = useState<Date>(today);
    const [partOptions, setPartOptions] = useState<{ value: string; text: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [isSearchClicked, setIsSearchClicked] = useState(false);

    const fetchPartOptions = async (supplierCode?: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_List_Item_Subcont_Admin()}${supplierCode || selectedSupplier?.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (result.status) {
                const options = result.data.map((item: { part_name: string; part_number: string }) => ({
                    value: item.part_number,
                    text: `${item.part_number} | ${item.part_name}`,
            }));
            setPartOptions(options);
            } else {
                console.error('Failed to fetch part options:', result.message);
                toast.error('Failed to fetch part options');
            }
        } catch (error) {
            console.error('Error fetching part options:', error);
            toast.error('Error fetching part options');
        }
    };

    // Fetch suppliers list
    const fetchSuppliers = async () => {
        const token = localStorage.getItem('access_token');
        try {
        const response = await fetch(API_List_Partner_Admin(), {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
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
        toast.error('Failed to fetch suppliers list');
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
                // setLoading(true);
                setSelectedSupplier(savedSupplier);
                fetchPartOptions(savedSupplierCode);
                // fetchTransactionLogs(savedSupplierCode, startDate, endDate);
            }
        }
    }, [suppliers]);

    // Modified fetchTransactionLogs to include supplier
    const fetchTransactionLogs = async (
        supplierCode: string, 
        startDateParam: Date, 
        endDateParam: Date
    ) => {
        try {
            const token = localStorage.getItem('access_token');
            const formatDate = (date: Date) => date.toLocaleDateString('en-CA');
            const startDateString = formatDate(startDateParam);
            const endDateString = formatDate(endDateParam);

            const response = await fetch(
                `${API_Transaction_Report_Subcont_Admin()}${supplierCode}/${startDateString}/${endDateString}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();
            if (result.status) {
                const logs = result.data.map((item: any) => ({
                    timestamp: `${item.transaction_date} ${item.transaction_time}`,
                    type: item.transaction_type,
                    status: item.status,
                    partName: item.part_name,
                    partNumber: item.part_number,
                    qtyOk: item.qty_ok,
                    qtyNg: item.qty_ng,
                    qtyTotal: item.qty_total,
                    deliveryNote: item.delivery_note,
                    actualQtyOk: item.actual_qty_ok,
                    actualQtyNg: item.actual_qty_ng,
                    actualQtyTotal: item.actual_qty_total,
                    response: item.response,
                }));
                setAllData(logs);
                setFilteredData(logs);
            } else {
                setAllData([]);
                setFilteredData([]);
                toast.info('No data available for selected criteria');
            }
        } catch (error) {
            console.error('Error fetching transaction logs:', error);
            toast.error('Error fetching transaction data');
            setAllData([]);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle supplier change
    const handleSupplierChange = async (selectedOption: { value: string; label: string } | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            // setLoading(true);
            setAllData([]);
            setFilteredData([]);
            setSelectedParts([]);
            await fetchPartOptions(selectedOption.value);
            // await fetchTransactionLogs(selectedOption.value, startDate, endDate);
        } else {
            localStorage.removeItem('selected_supplier');
            setSelectedParts([]);
            setPartOptions([]);
            setAllData([]);
            setFilteredData([]);
        }
    };

    const handleStartDateChange = async (date: Date) => {
        setStartDate(date);
        
        // if (selectedSupplier) {
        //     await fetchTransactionLogs(selectedSupplier.value, date, endDate);
        // }
    };

    const handleEndDateChange = async (date: Date) => {
        setEndDate(date);
        
        // if (selectedSupplier) {
        //     await fetchTransactionLogs(selectedSupplier.value, startDate, date);
        // }
    };

    const handleSearch = async () => {
        if (selectedSupplier) {
            setIsSearchClicked(true);
            setLoading(true);
            await fetchTransactionLogs(selectedSupplier.value, startDate, endDate);
        } else {
            toast.warning('Please select a supplier');
        }
    };

    useEffect(() => {
        let filtered = [...allData];

        // Filter by transaction type
        if (selectedTransactionTypes.length > 0) {
        filtered = filtered.filter((row: any) => selectedTransactionTypes.includes(row.type));
        }

        // Filter by status
        if (selectedStatuses.length > 0) {
        filtered = filtered.filter((row: any) => selectedStatuses.includes(row.status));
        }
        
        // Filter by part name
        if (selectedParts.length > 0) {
        filtered = filtered.filter((row: any) => selectedParts.includes(row.partNumber));
        }
        
        // Filter by delivery note
        if (searchQuery) {
        filtered = filtered.filter((row) =>
            row.deliveryNote.toLowerCase().includes(searchQuery.toLowerCase())
        );
        }

        // Apply sorting
        setFilteredData(filtered);
    }, [allData, selectedTransactionTypes, selectedStatuses, selectedParts, searchQuery]);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleDownloadExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
        filteredData.map((row) => ({
            Date: new Date(row.timestamp).toLocaleString(),
            'Transaction Type': row.type,
            Status: row.status,
            'Part Name': row.partName,
            'Part Number': row.partNumber,
            'Quantity OK': row.qtyOk,
            'Quantity NG': row.qtyNg,
            Total: row.qtyOk + row.qtyNg,
        }))
        );

        // Add totals row
        XLSX.utils.sheet_add_aoa(
        ws,
        [
            [
            'Totals:',
            '',
            '',
            '',
            '',
            filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
            filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
            filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0),
            ],
        ],
        { origin: -1 }
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `${selectedSupplier?.value}`);
        XLSX.writeFile(wb, `transaction_report_${selectedSupplier?.value}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <>
            <ToastContainer />
            <Breadcrumb pageName="Transaction Report" />
            <div className="font-poppins bg-white text-black">
                <div className="p-2 md:p-4 lg:p-6 space-y-6">
                    {/* Add Supplier Selection at the top */}
                    <div className="w-full">
                        <Select
                        options={suppliers}
                        value={selectedSupplier}
                        onChange={handleSupplierChange}
                        placeholder="Select Supplier"
                        className="w-80"
                        />
                    </div>

                    <div className='flex flex-col gap-4'>
                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {/* Start Date */}
                            <div className="w-full">
                                <DatePicker
                                    id="startDate"
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    placeholder="Select Start Date"
                                    label="Start Date"
                                />
                            </div>

                            {/* End Date */}
                            <div className="w-full">
                                <DatePicker
                                    id="endDate"
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    placeholder="Select End Date"
                                    label="End Date"
                                />
                            </div>
                            {/* Search Button */}
                            <div className="w-full flex items-center">
                                <Button
                                    title="Search"
                                    onClick={handleSearch}
                                />
                            </div>
                        </div>

                        {/* Filters and Search Bar */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ${!isSearchClicked ? 'opacity-50 pointer-events-none' : ''}`}>
                            {/* Transaction Type */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction Type
                                </label>
                                <MultiSelect
                                id="transactionTypeSelect"
                                label="Filter by Transaction Type"
                                options={[
                                    { value: 'Incoming', text: 'Incoming' },
                                    { value: 'Process', text: 'Process' },
                                    { value: 'Outgoing', text: 'Outgoing' },
                                ]}
                                selectedOptions={selectedTransactionTypes}
                                onChange={setSelectedTransactionTypes}
                                />
                            </div>

                            {/* Status */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                                </label>
                                <MultiSelect
                                id="statusSelect"
                                label="Filter by Status"
                                options={[
                                    { value: 'Fresh', text: 'Fresh' },
                                    { value: 'Replating', text: 'Replating' },
                                ]}
                                selectedOptions={selectedStatuses}
                                onChange={setSelectedStatuses}
                                />
                            </div>

                            {/* Part Name */}
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Part Number
                                </label>
                                <MultiSelect
                                    id="partNumberSelect"
                                    label="Filter by Part Number"
                                    options={partOptions}
                                    selectedOptions={selectedParts}
                                    onChange={setSelectedParts}
                                />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className={`${!isSearchClicked ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Delivery Note
                            </label>
                            <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                <div className="md:w-1/2 lg:w-1/3">
                                <SearchBar
                                    placeholder="Filter by Delivery Note"
                                    onSearchChange={setSearchQuery}
                                />
                                </div>
                                {/* Download Buttons */}
                                <div className="flex gap-2 self-center">
                                <Button
                                    title="Download Excel"
                                    icon={FaFileExcel}
                                    onClick={handleDownloadExcel}
                                    disabled={!isSearchClicked || filteredData.length === 0}
                                />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-1 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]" rowSpan={2}>Date Time</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Delivery Note</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]" rowSpan={2}>Transaction Type</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[9%]" rowSpan={2}>Status</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Part Name</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[12%]" rowSpan={2}>Part Number</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]" colSpan={3}>Confirm Supplier</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]" colSpan={3}>Actual Received</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]" rowSpan={2}>Response</th>
                                    </tr>
                                    <tr>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY OK</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY NG</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">Total</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY OK</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">QTY NG</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                {loading ? (
                                    Array.from({ length: rowsPerPage }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="px-1 py-3 text-center whitespace-nowrap">
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
                                        <td className="px-1 py-3 text-center whitespace-nowrap">{new Date(row.timestamp).toLocaleString()}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.deliveryNote}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.type}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.status}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partName}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.partNumber}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyOk}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyNg}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.qtyOk + row.qtyNg}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.actualQtyOk || '-'}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{row.actualQtyNg || '-'}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{(row.actualQtyOk + row.actualQtyNg) || '-'}</td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">{(row.response) || '-'}</td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan={13} className="px-3 py-4 text-center text-gray-500">No data available. Please Select Date Range</td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={6} className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">Totals:</td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + row.qtyOk, 0)}</td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + row.qtyNg, 0)}</td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)}
                                    </td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + (row.actualQtyOk || 0), 0) || '-'}
                                    </td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + (row.actualQtyNg || 0), 0) || '-'}
                                    </td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                                        {paginatedData.reduce((sum, row) => sum + ((row.actualQtyOk || 0) + (row.actualQtyNg || 0)), 0) || '-'}
                                    </td>
                                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center"></td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4">
                        <Pagination
                            totalRows={filteredData.length}
                            rowsPerPage={rowsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminTransactionReport;