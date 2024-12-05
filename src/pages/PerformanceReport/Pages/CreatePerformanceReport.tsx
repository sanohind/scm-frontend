import { useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FaFilePdf, FaSortDown, FaSortUp } from 'react-icons/fa';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import SearchBar from '../../Table2/SearchBar';
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_Performance_Report_Admin, API_Download_Performance_Report, API_List_Partner_Admin, API_Performance_Report_Admin } from '../../../api/api';

const CreatePerformanceReport = () => {
    interface PerformanceReport {
        no: string;
        periode: string;
        upload_at: string;
        filedata: string;
        attachedFile: string;
    }
    
    const [data, setData] = useState<PerformanceReport[]>([]);
    const [filteredData, setFilteredData] = useState<PerformanceReport[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(5);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof PerformanceReport | '', direction: 'asc' | 'desc' | '' }>({ key: '', direction: '' });
    interface Supplier {
        value: string;
        label: string;
    }
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [file, setFile] = useState<File | null>(null);
    const [period, setPeriod] = useState('');

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
            if (error instanceof Error) {
                toast.error(`Failed to download file. ${error.message}`);
            } else {
                toast.error('Failed to download file.');
            }
        }
    };

    const fetchPerformanceReport = async (supplierCode: string, selectedMonth: string | null = null) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            const response = await fetch(
                `${API_Performance_Report_Admin()}${supplierCode}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) throw new Error('Failed to fetch performance report');

            const result = await response.json();
            if (result.success && Array.isArray(result.data) && result.data.length > 0) {
                let performanceReport = result.data.map((report: any) => ({
                    no: report.po_listing_no || 'N/A',
                    periode: formatDate(report.date) || '-',
                    upload_at: report.upload_at || '-',
                    filedata: report.file.split('_').slice(1).join('_') || '-',
                    attachedFile: report.file || '-',
                }));

                if (selectedMonth) {
                    performanceReport = performanceReport.filter((row: any) => {
                        const rowMonth = row.periode.slice(0, 7);
                        return rowMonth === selectedMonth;
                    });
                }

                setData(performanceReport);
                setFilteredData(performanceReport);
            } else {
                setData([]);
                setFilteredData([]);
                toast.info('No data found');
            }
        } catch (error) {
            console.error('Error fetching performance report:', error);
            if (error instanceof Error) {
                toast.error(`Failed to fetch performance report. ${error.message}`);
            } else {
                toast.error('Failed to fetch performance report.');
            }
            setData([]);
            setFilteredData([]);
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
                fetchPerformanceReport(savedSupplierCode);
            }
        }
    }, [suppliers]);

    useEffect(() => {
        let filtered = [...data];

        if (searchQuery) {
            filtered = filtered.filter((row) =>
                row.filedata.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                let aValue = a[sortConfig.key as keyof PerformanceReport];
                let bValue = b[sortConfig.key as keyof PerformanceReport];

                if (sortConfig.key === 'periode' || sortConfig.key === 'upload_at') {
                    const aTime = new Date(aValue as string).getTime();
                    const bTime = new Date(bValue as string).getTime();
                    return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredData(filtered);
    }, [searchQuery, sortConfig, data]);

    function formatDate(dateString: string | number | Date) {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' }); // Format to "Month YYYY"
    }

    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => setCurrentPage(page);

    const handleSort = (key: keyof PerformanceReport) => {
        let direction: '' | 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            setLoading(true);
            fetchPerformanceReport(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            setData([]);
            setFilteredData([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Check file type
            if (file.type !== "application/pdf") {
                Swal.fire({
                    title: "Error",
                    text: "Only PDF files are allowed",
                    icon: "error",
                    confirmButtonColor: "#1e3a8a"
                });
                setFile(null);
                // Clear the input
                e.target.value = '';
                return;
            }

            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (file.size > maxSize) {
                Swal.fire({
                    title: "Error",
                    text: "File size must not exceed 5MB",
                    icon: "error",
                    confirmButtonColor: "#1e3a8a"
                });
                setFile(null);
                // Clear the input
                e.target.value = '';
                return;
            }
    
            setFile(file);
        }
    };

    const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPeriod(e.target.value);
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !period || !selectedSupplier) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill all fields',
                icon: 'error',
                confirmButtonColor: '#1e3a8a'
            });
            return;
        }

        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('date', `${period}-05`);
        formData.append('bp_code', selectedSupplier.value);

        const toastId = toast.loading('Preparing upload...', { progress: 0 });

        const uploadPromise = async () => {
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        toast.update(toastId, {
                            render: `Uploading... ${progress}%`,
                            progress: progress / 100,
                        });
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 201) {
                        const result = JSON.parse(xhr.responseText);
                        if (result.status) {
                            toast.update(toastId, { 
                                render: 'Upload complete!',
                                type: 'success',
                                isLoading: false,
                                autoClose: 3000
                            });
                            Swal.fire({
                                title: 'Success',
                                text: 'File uploaded successfully',
                                icon: 'success',
                                confirmButtonColor: '#1e3a8a'
                            });
                            fetchPerformanceReport(selectedSupplier.value);
                            resolve(result);
                        } else {
                            reject(new Error(result.message));
                        }
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error('Network error occurred'));
                };

                xhr.open('POST', API_Create_Performance_Report_Admin(), true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            });
        };

        try {
            await uploadPromise();
        } catch (error) {
            toast.update(toastId, {
                render: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
            Swal.fire({
                title: 'Error',
                text: 'Failed to upload file',
                icon: 'error',
                confirmButtonColor: '#1e3a8a'
            });
        }
    };

    async function downloadFile(attachedFile: string) {
        const token = localStorage.getItem('access_token');
        const toastId = toast.loading('Preparing download...', { progress: 0 });

        const downloadPromise = async () => {
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        toast.update(toastId, {
                            render: `Downloading... ${progress}%`,
                            progress: progress / 100,
                        });
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const blob = xhr.response;
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = attachedFile;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        resolve('Download complete');
                    } else {
                        reject(new Error('Download failed'));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error('Network error occurred'));
                };

                xhr.open('GET', `${API_Download_Performance_Report()}${attachedFile}`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.responseType = 'blob';
                xhr.send();
            });
        };

        try {
            await downloadPromise();
            toast.update(toastId, {
                render: 'Download complete!',
                type: 'success',
                isLoading: false,
                autoClose: 3000
            });
        } catch (error) {
            toast.update(toastId, {
                render: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error',
                isLoading: false,
                autoClose: 3000
            });
            Swal.fire({
                title: 'Error',
                text: 'Failed to download file',
                icon: 'error',
                confirmButtonColor: '#1e3a8a'
            });
        }
    }

    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="Create Performance Report" />
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
                        <div className='md:w-1/2 lg:w-1/3'>
                            <SearchBar placeholder="Search file name here..." onSearchChange={setSearchQuery} />
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="w-full">
                        {/* Container for form elements */}
                        <div className="flex flex-col space-y-4 md:space-y-6 lg:space-y-4">
                            {/* Period input section */}
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                                    <label htmlFor="month-picker" className="text-base mb-2 sm:mb-0 sm:w-24">
                                        Periode
                                    </label>
                                    <input
                                        type="month"
                                        id="month-picker"
                                        value={period}
                                        onChange={handlePeriodChange}
                                        className="w-full sm:w-auto pl-4 pr-4 py-2 border rounded-md"
                                        required
                                    />
                                </div>
                            </div>

                            {/* File upload section */}
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <label className="text-base sm:w-24">
                                        Attach file
                                    </label>
                                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                                        <input
                                            type="file"
                                            className=" text-sm cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-4 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                                            onChange={handleFileChange}
                                        />
                                        <button
                                            type="submit"
                                            className="w-full sm:w-auto px-5 py-2 bg-blue-900 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Upload
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300 mt-5">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[5%]"
                                            onClick={() => handleSort('no')}
                                        >
                                            No
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                                            onClick={() => handleSort('periode')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'periode' ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                ) : (
                                                    <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                Periode
                                            </span>
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[35%]"
                                            onClick={() => handleSort('filedata')}
                                        >
                                            File Name
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]"
                                            onClick={() => handleSort('attachedFile')}
                                        >
                                            Attached File
                                        </th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 cursor-pointer w-[20%]"
                                            onClick={() => handleSort('upload_at')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'upload_at' ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                ) : (
                                                    <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                Created At
                                            </span>
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
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{index + 1}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.periode}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.filedata}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => downloadFile(row.attachedFile)}
                                                        className="px-2 py-1 hover:scale-125"
                                                    >
                                                        <FaFilePdf className="text-blue-900 text-2xl" />
                                                    </button>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.upload_at}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                                                No data available
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

export default CreatePerformanceReport;