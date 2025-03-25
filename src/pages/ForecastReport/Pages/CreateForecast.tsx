import { useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FaFilePdf, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';
import {
    API_Create_Forecast_Report_Admin,
    API_Delete_Forecast_Report_Admin,
    API_Download_Forecast_Report,
    API_Forecast_Report_Admin,
    API_List_Partner_Admin,
} from '../../../api/api';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../../components/Table/Pagination';
import SearchBar from '../../../components/Table/SearchBar';
import { toast, ToastContainer } from 'react-toastify';
import Button from '../../../components/Forms/Button';

const CreateForecast = () => {
    interface ForecastReport {
        no: string;
        description: string;
        upload_at: string;
        filedata: string;
        attachedFile: string;
    }

    const [data, setData] = useState<ForecastReport[]>([]);
    const [filteredData, setFilteredData] = useState<ForecastReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ForecastReport | '', direction: 'asc' | 'desc' | '' }>({ key: '', direction: '' });
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    interface Supplier {
        value: string;
        label: string;
        bp_code: string;
        bp_name: string;
    }

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
            const suppliersList = result.data.map((supplier: Supplier) => ({
                value: supplier.bp_code,
                label: `${supplier.bp_code} | ${supplier.bp_name}`,
            }));

            setSuppliers(suppliersList);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error(`Error fetching suppliers: ${error}`);
        }
    };

    const fetchForecastReport = async (supplierCode: string) => {
        const token = localStorage.getItem('access_token');
        setLoading(true);
        try {
            const response = await fetch(
                `${API_Forecast_Report_Admin()}${supplierCode}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
    
            if (!response.ok) throw new Error('Failed to fetch forecast report');
    
            const result = await response.json();
            if (result.status && Array.isArray(result.data) && result.data.length > 0) {
                const forecastReport = result.data.map((report: any) => ({
                    no: report.forecast_id || 'N/A',
                    description: report.description || '-',
                    upload_at: report.upload_at || '-',
                    filedata: report.file ? report.file.split('_').slice(1).join('_') : '-',
                    attachedFile: report.file || '-',
                }));
    
                setData(forecastReport);
                setFilteredData(forecastReport);
            } else {
                setData([]);
                setFilteredData([]);
                toast.info('No forecast report available');
            }
        } catch (error) {
            console.error('Error fetching forecast report:', error);
            toast.error(`Error fetching forecast report: ${error}`);
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
                fetchForecastReport(savedSupplierCode);
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
                let aValue = a[sortConfig.key as keyof ForecastReport];
                let bValue = b[sortConfig.key as keyof ForecastReport];

                if (sortConfig.key === 'upload_at') {
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

    const handleSort = (key: keyof ForecastReport) => {
        let direction: 'asc' | 'desc' | '' = 'asc';
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
            fetchForecastReport(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            setData([]);
            setFilteredData([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Check file type
            if (selectedFile.type !== "application/pdf") {
                Swal.fire({
                    title: "Error",
                    text: "Only PDF files are allowed",
                    icon: "error",
                    confirmButtonColor: "#1e3a8a"
                });
                setFile(null);
                e.target.value = ''; // Reset file input
                return;
            }
    
            // Check file size (5MB = 5 * 1024 * 1024 bytes)
            const maxSize = 5 * 1024 * 1024; // 5MB in bytes
            if (selectedFile.size > maxSize) {
                Swal.fire({
                    title: "Error",
                    text: "File size must not exceed 5MB",
                    icon: "error",
                    confirmButtonColor: "#1e3a8a"
                });
                setFile(null);
                e.target.value = ''; // Reset file input
                return;
            }
    
            setFile(selectedFile);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !description || !selectedSupplier) {
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
        formData.append('description', description);
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
                                autoClose: 1000
                            });
                            Swal.fire({
                                title: 'Success',
                                text: 'File uploaded successfully',
                                icon: 'success',
                                confirmButtonColor: '#1e3a8a'
                            });
                            fetchForecastReport(selectedSupplier.value);
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
    
                xhr.open('POST', API_Create_Forecast_Report_Admin(), true);
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

                xhr.open('GET', `${API_Download_Forecast_Report()}${attachedFile}`, true);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.responseType = 'blob';
                xhr.send();
            });
        };

        try {
            await downloadPromise();
            toast.success('Download complete!', {
                toastId,
                autoClose: 3000
            });
            Swal.fire({
                title: 'Success',
                text: 'File downloaded successfully',
                icon: 'success',
                confirmButtonColor: '#1e3a8a'
            });
        } catch (error) {
            toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {
                toastId,
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

    const handleDelete = async (forecastId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_Delete_Forecast_Report_Admin()}${forecastId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to delete file');

            const result = await response.json();
            if (result.status) {
                toast.success('File deleted successfully');
                if (selectedSupplier) {
                    fetchForecastReport(selectedSupplier.value);
                }
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            toast.error(`Error deleting file: ${error}`);
        }
    };

    return (
        <>
            <ToastContainer position='top-right' />
            <Breadcrumb pageName="Create Forecast Report" />
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
                            <SearchBar placeholder="Search..." onSearchChange={setSearchQuery} />
                        </div>
                    </div>

                    <form onSubmit={handleUpload} className="w-full">
                        <div className="flex flex-col space-y-4 md:space-y-6 lg:space-y-4">
                            {/* Description section */}
                            <div className="w-full">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                                    <label htmlFor="description" className="text-base mb-2 sm:mb-0 sm:w-24">
                                        Description
                                    </label>
                                    <div className="flex flex-col w-full">
                                        <textarea
                                            id="description"
                                            value={description}
                                            onChange={handleDescriptionChange}
                                            maxLength={255}
                                            className="sm:w-[50%] p-2 border rounded-md h-20 resize-none"
                                            required
                                        />
                                        <span className="text-sm text-gray-400 mt-1">
                                            {255 - description.length} characters remaining
                                        </span>
                                    </div>
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
                                            className="text-sm cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-4 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                                            onChange={handleFileChange}
                                        />
                                        {/* <button
                                            type="submit"
                                            className="w-full sm:w-auto px-5 py-2 bg-blue-900 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Upload
                                        </button> */}
                                        <Button
                                            title="Upload"
                                            type="submit"
                                        />
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
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[5%]">
                                            No
                                        </th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[30%]">
                                            Description
                                        </th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[25%]">
                                            File Name
                                        </th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200 w-[20%]">
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
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b border-gray-200">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        Array.from({ length: rowsPerPage }).map((_, index) => (
                                            <tr key={index} className="animate-pulse">
                                                <td className="px-3 py-5 text-center whitespace-nowrap">
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
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.description}</td>
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
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: 'Are you sure?',
                                                                text: "You won't be able to revert this!",
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#1e3a8a',
                                                                cancelButtonColor: '#d33',
                                                                confirmButtonText: 'Yes, delete it!'
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    handleDelete(row.no);
                                                                }
                                                            });
                                                        }}
                                                        className="px-3 py-1 hover:scale-110"
                                                    >
                                                        <FaTrash className="text-red-500 text-2xl" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
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

export default CreateForecast;