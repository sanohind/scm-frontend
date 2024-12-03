import { useEffect, useState } from 'react';
import Select from 'react-select';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../../Table2/Pagination';
import MultiSelect from '../../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import SearchBar from '../../../Table2/SearchBar';
import { API_List_Item_Subcont_Admin, API_List_Partner_Admin, API_Transaction_Report_Subcont_Admin } from '../../../../api/api';

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
    }
    
    interface Supplier {
        value: string;
        label: string;
    }

    const [filteredData, setFilteredData] = useState<TransactionLog[]>([]);
    const [allData, setAllData] = useState<TransactionLog[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(8);
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

    const fetchPartOptions = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_List_Item_Subcont_Admin()}?bp_code=${selectedSupplier?.value}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
            const result = await response.json();
            if (result.status) {
            const options = result.data.map((item: { part_number: string; part_name: string }) => ({
                value: item.part_name,
                text: item.part_name,
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
                setSelectedSupplier(savedSupplier);
                fetchPartOptions(savedSupplierCode);
                fetchTransactionLogs(savedSupplierCode, startDate, endDate);
            }
        }
      }, [suppliers]);

    // Modified fetchTransactionLogs to include supplier
    const fetchTransactionLogs = async (
        supplierCode: string, 
        startDateParam: Date, 
        endDateParam: Date
    ) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const formatDate = (date: Date) => date.toLocaleDateString('en-CA');
            const startDateString = formatDate(startDateParam);
            const endDateString = formatDate(endDateParam);

            const response = await fetch(
                `${API_Transaction_Report_Subcont_Admin()}?start_date=${startDateString}&end_date=${endDateString}&bp_code=${supplierCode}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await response.json();
            if (result.status) {
                const logs = result.data.map((item: any) => ({
                    timestamp: `${item.transaction_date}T${item.transaction_time}`,
                    type: item.transaction_type,
                    status: item.status,
                    partName: item.part_name,
                    partNumber: item.part_number,
                    qtyOk: item.qty_ok,
                    qtyNg: item.qty_ng,
                    deliveryNote: item.delivery_note,
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
            localStorage.setItem('selected_bp_code', selectedOption.value);
            setAllData([]);
            setFilteredData([]);
            
            // Reset part options and fetch new ones
            setSelectedParts([]);
            await fetchPartOptions(selectedOption.value);
            
            // Fetch transaction logs with current date range
            await fetchTransactionLogs(selectedOption.value, startDate, endDate);
        } else {
            // Reset everything if supplier is deselected
            setSelectedParts([]);
            setPartOptions([]);
            setAllData([]);
            setFilteredData([]);
        }
    };

    const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = new Date(e.target.value);
        setStartDate(newStartDate);
        
        if (selectedSupplier) {
            await fetchTransactionLogs(selectedSupplier.value, newStartDate, endDate);
        }
    };

    const handleEndDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = new Date(e.target.value);
        setEndDate(newEndDate);
        
        if (selectedSupplier) {
            await fetchTransactionLogs(selectedSupplier.value, startDate, newEndDate);
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
        filtered = filtered.filter((row: any) => selectedParts.includes(row.partName));
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

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = [
            'Date',
            'Transaction Type',
            'Status',
            'Part Name',
            'Part Number',
            'Quantity OK',
            'Quantity NG',
            'Total',
        ];
        const tableRows: (string | number)[][] = [];

        filteredData.forEach((row) => {
            const rowData = [
                new Date(row.timestamp).toLocaleString(),
                row.type,
                row.status,
                row.partName,
                row.partNumber,
                row.qtyOk,
                row.qtyNg,
                row.qtyOk + row.qtyNg,
            ];
            tableRows.push(rowData);
        });

        // Add totals row
        const totalsRow = [
            'Totals:',
            '',
            '',
            '',
            '',
            filteredData.reduce((sum, row) => sum + row.qtyOk, 0),
            filteredData.reduce((sum, row) => sum + row.qtyNg, 0),
            filteredData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0),
        ];
        tableRows.push(totalsRow);

        // Add logo
        const img = new Image();
        img.src = '../../../src/images/logo_sanoh_address.png';
        img.onload = () => {
            doc.addImage(img, 'PNG', 10, 10, 70, 15, undefined, 'FAST'); // Use 'FAST' compression

            // Add title
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Transaction Report ${selectedSupplier?.value}`, doc.internal.pageSize.getWidth() / 2, 38, {
                align: 'center',
            });

            // Add date range
            const startDateString = startDate ? startDate.toLocaleDateString() : 'All';
            const endDateString = endDate ? endDate.toLocaleDateString() : 'All';
            doc.setFont('helvetica', 'normal');
            doc.text(`Date Range: ${startDateString} - ${endDateString}`, 10, 45);

            // Add filters
            const filters = [];
            if (selectedTransactionTypes.length > 0)
                filters.push(`Transaction Types: ${selectedTransactionTypes.join(', ')}`);
            if (selectedStatuses.length > 0) filters.push(`Status: ${selectedStatuses.join(', ')}`);
            if (selectedParts.length > 0) filters.push(`Parts: ${selectedParts.join(', ')}`);
            doc.setFont('helvetica', 'normal');
            if (filters.length > 0) doc.text(`Filters: ${filters.join(' | ')}`, 10, 55);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: filters.length > 0 ? 60 : 50,
                styles: { fontSize: 8 },
            });

            // Add download date
            const downloadDate = new Date().toLocaleString();
            doc.text(`Downloaded on: ${downloadDate}`, 10, doc.internal.pageSize.getHeight() - 10);

            // Save the PDF
            doc.save(`transaction_report_${selectedSupplier?.value}_${startDateString}_${endDateString}.pdf`);
        };
    };

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                    </label>
                    <input
                    type="date"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={handleStartDateChange}
                    />
                </div>

                {/* End Date */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                    </label>
                    <input
                    type="date"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={handleEndDateChange}
                    />
                </div>

                {/* Transaction Type */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                    </label>
                    <MultiSelect
                    id="transactionTypeSelect"
                    label="Filter by Transaction Type"
                    options={[
                        { value: 'Ingoing', text: 'Ingoing' },
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
                    Part Name
                    </label>
                    <MultiSelect
                    id="partNameSelect"
                    label="Filter by Part Name"
                    options={partOptions}
                    selectedOptions={selectedParts}
                    onChange={setSelectedParts}
                    />
                </div>
                </div>

                {/* Search Bar */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Note
                </label>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <SearchBar
                    placeholder="Filter by Delivery Note"
                    onSearchChange={setSearchQuery}
                    />
                    {/* Download Buttons */}
                    <div className="flex gap-2 self-center">
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                        onClick={handleDownloadPDF}
                    >
                        <FaFilePdf className="w-4 h-4" />
                        <span>Download PDF</span>
                    </button>
                    <button
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors"
                        onClick={handleDownloadExcel}
                    >
                        <FaFileExcel className="w-4 h-4" />
                        <span>Download Excel</span>
                    </button>
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
                        <th className="px-1 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">Date Time</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[17%]">Delivery Note</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[9%]">Transaction Type</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]">Status</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]">Part Name</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]">Part Number</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY OK</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY NG</th>
                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[7%]">Total</th>
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
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={9} className="px-3 py-4 text-center text-gray-500">No data available. Please Select Date Range</td>
                        </tr>
                    )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                    <tr>
                        <td colSpan={6} className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">Totals:</td>
                        <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">{paginatedData.reduce((sum, row) => sum + row.qtyOk, 0)}</td>
                        <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">{paginatedData.reduce((sum, row) => sum + row.qtyNg, 0)}</td>
                        <td className="px-3 py-3.5 text-sm font-semibold text-gray-700 text-center">
                        {paginatedData.reduce((sum, row) => sum + row.qtyOk + row.qtyNg, 0)}
                        </td>
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