import { useEffect, useState } from 'react';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { FaFilePdf, FaSortDown, FaSortUp, FaTrash } from 'react-icons/fa';
import {
    API_Create_Forecast_Report_Purchasing,
    API_Forecast_Report_Purchasing,
    API_Delete_Forecast_Report_Purchasing,
    API_List_Partner,
    API_Download_Forecast_Report,
} from '../../../api/api';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import SearchBar from '../../Table2/SearchBar';

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
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ForecastReport | '', direction: 'asc' | 'desc' | '' }>({ key: '', direction: '' });
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [suppliers, setSuppliers] = useState([]);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    interface Supplier {
        bp_code: string;
        bp_name: string;
    }

    const fetchSuppliers = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(API_List_Partner(), {
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
        }
    };

    const fetchForecastReport = async (supplierCode: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(
                `${API_Forecast_Report_Purchasing()}${supplierCode}`,
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
            }
        } catch (error) {
            console.error('Error fetching forecast report:', error);
            Swal.fire(
                'Error',
                'Failed to fetch forecast report. Please try again later.',
                'error'
            );
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
            fetchForecastReport(selectedOption.value);
            localStorage.setItem('selected_bp_code', selectedOption.value);
        } else {
            setData([]);
            setFilteredData([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
        if (e.target.files && e.target.files[0] && e.target.files[0].type !== "application/pdf") {
            Swal.fire("Error", "Only PDF files are allowed", "error");
            setFile(null); // Reset the file input
        } else if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file || !description || !selectedSupplier) {
            Swal.fire('Error', 'Please fill all fields', 'error');
            return;
        }

        const token = localStorage.getItem('access_token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('bp_code', selectedSupplier.value);

        try {
            const response = await fetch(API_Create_Forecast_Report_Purchasing(), {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to upload file');

            const result = await response.json();
            if (result.status) {
                Swal.fire('Success', 'File uploaded successfully', 'success');
                fetchForecastReport(selectedSupplier.value);
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            Swal.fire('Error', 'Failed to upload file. Please try again later.', 'error');
        }
    };

    async function downloadFile(attachedFile: string) {
        const token = localStorage.getItem('access_token');
    
        try {
          const response = await fetch(`${API_Download_Forecast_Report()}${attachedFile}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to download file.');
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = attachedFile;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error while downloading file:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to download file.',
          })
        }
    }

    const handleDelete = async (forecastId: string) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_Delete_Forecast_Report_Purchasing()}${forecastId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to delete file');

            const result = await response.json();
            if (result.status) {
                Swal.fire('Success', 'File deleted successfully', 'success');
                if (selectedSupplier) {
                    fetchForecastReport(selectedSupplier.value);
                }
            } else {
                Swal.fire('Error', result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
            Swal.fire('Error', 'Failed to delete file. Please try again later.', 'error');
        }
    };

    return (
        <>
            <Breadcrumb pageName="Create Forecast Report" />
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
                        <SearchBar placeholder="Search..." onSearchChange={setSearchQuery} />
                    </div>

                    <form onSubmit={handleUpload} className="flex flex-col items-center">
                        <div className="flex mb-4 justify-start w-full">
                            <div className='flex items-center'>
                                <label htmlFor="description" className="mr-4 text-base">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={handleDescriptionChange}
                                    maxLength={255}
                                    className="mr-2 p-1 border rounded-md w-80 h-20 resize-none"
                                    required
                                />
                                <span className="mt-auto text-sm text-gray-400">
                                    {255 - description.length} characters remaining
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 justify-start w-full">
                            <label className="block dark:text-white">
                                Attach file
                            </label>
                            <input
                                type="file"
                                className="text-sm cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:py-2 file:px-4 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                                onChange={handleFileChange}
                            />
                            <button
                                type="submit"
                                className=" px-5 py-2 bg-blue-500 text-white text-xs rounded-md align-bottom justify-center">
                                    Upload
                            </button>
                        </div>
                    </form>

                    <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="text-base text-gray-700">
                                <tr>
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-40"
                                    >
                                        No
                                    </th>
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                                    >
                                        Description
                                    </th>
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                                    >
                                        File Name
                                    </th>
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                                    >
                                        Attached File
                                    </th>
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
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
                                    <th
                                        className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-36"
                                    >
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((row, index) => (
                                        <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                                            <td className="px-2 py-4 text-center">{index + 1}</td>
                                            <td className="px-2 py-4 text-center">{row.description}</td>
                                            <td className="px-2 py-4 text-center">{row.filedata}</td>
                                            <td className="px-2 py-4 text-center">
                                                <button
                                                    onClick={() => downloadFile(row.attachedFile)}
                                                    className="px-2 py-1 hover:scale-110"
                                                >
                                                    <FaFilePdf className="text-red-500 text-2xl" />
                                                </button>
                                            </td>
                                            <td className="px-2 py-4 text-center">{row.upload_at}</td>
                                            <td className="px-2 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        Swal.fire({
                                                            title: 'Are you sure?',
                                                            text: "You won't be able to revert this!",
                                                            icon: 'warning',
                                                            showCancelButton: true,
                                                            confirmButtonColor: '#3085d6',
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
                                        <td colSpan={6} className="text-center py-4">
                                            No data available
                                        </td>
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

export default CreateForecast;