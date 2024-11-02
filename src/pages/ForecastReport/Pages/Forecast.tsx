import { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import { API_Download_Forecast_Report_Supplier, API_Forecast_Report_Supplier } from '../../../api/api';
import SearchMonth from '../../Table2/SearchMonth';
import SearchBar from '../../Table2/SearchBar';
import { FaFile, FaFileExcel, FaFilePdf, FaFileWord, FaSortDown, FaSortUp } from 'react-icons/fa';


const Forecast = () => {
  interface ForecastData {
    no: number;
    description: string;
    upload_at: string;
    filedata: string;
    attachedFile: string;
  }
  
  const [data, setData] = useState<ForecastData[]>([]);
  const [filteredData, setFilteredData] = useState<ForecastData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ForecastData; direction: 'asc' | 'desc' }>({ key: 'upload_at', direction: 'desc' });

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_Forecast_Report_Supplier()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        setData(result.data.map((item) => ({
          no: item.forecast_id,
          description: item.description,
          upload_at: item.upload_at,
          filedata: item.file.split('_').slice(1).join('_'),
          attachedFile: item.file,
        })));
        setFilteredData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  // Handle search and sorting logic
  useEffect(() => {
    let filtered = [...data];

    if (selectedMonth) {
      filtered = filtered.filter((row) => {
        const rowMonth = new Date(row.upload_at).toISOString().slice(0, 7); // Extract YYYY-MM format
        return rowMonth === selectedMonth;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.filedata.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Convert to Date if sorting by 'upload_at'
      if (sortConfig.key === 'upload_at') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
  }, [searchQuery, selectedMonth, sortConfig, data]);

  // Paginated data
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSort = (key: keyof ForecastData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };


  
  // Function to handle file download
  async function downloadFile(attachedFile: string) {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_Download_Forecast_Report_Supplier()}${attachedFile}`, {
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
      alert('Failed to download file.');
    }
  }

  return (
    <>
      <Breadcrumb pageName="Forecast Report" />
      <div className="font-poppins bg-white">
        <div className="flex flex-col p-6">
          <div className="flex justify-between items-center">
            <SearchMonth selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
            <SearchBar
              placeholder="Search file name..."
              onSearchChange={setSearchQuery}
            />
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-5">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-12">
                    No
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-100">Description
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-100">
                    File Name
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-30">
                    Attached File
                  </th>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-50"
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
                      Upload At
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                      <td className="px-2 py-3 text-center">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td className="px-2 py-3 text-center">{row.description}</td>
                      <td className="px-2 py-3 text-center">{row.filedata}</td>
                      <td className="px-2 py-3 text-center flex items-center justify-center">
                        <button
                          onClick={() => downloadFile(row.attachedFile)}
                          className="px-2 py-1 hover:scale-110"
                        >
                          {(() => {
                          const extension = row.attachedFile?.split('.').pop()?.toLowerCase() || '';
                          switch (extension) {
                            case 'pdf':
                            return <FaFilePdf className="w-6 h-6 text-red-600" />;
                            case 'doc':
                            case 'docx':
                            return <FaFileWord className="w-6 h-6 text-blue-600" />;
                            case 'xls':
                            case 'xlsx':
                            return <FaFileExcel className="w-6 h-6 text-green-600" />;
                            default:
                            return <FaFile className="w-6 h-6 text-gray-600" />;
                          }
                          })()}
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center">{row.upload_at}</td>
                      </tr>
                      ))
                    ) : (
                      <tr>
                      <td colSpan={5} className="text-center py-4">
                        No data available for now
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

export default Forecast;
