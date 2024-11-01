import { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Pagination from '../../Table2/Pagination';
import { API_Download_Performance_Report, API_Performance_Report_Supplier } from '../../../api/api';
import SearchMonth from '../../Table2/SearchMonth';

import iconPdf from '../../../images/icon_pdf.svg';
import iconDoc from '../../../images/icon_doc.svg';
import iconDocx from '../../../images/icon_docx.svg';
import iconJpg from '../../../images/icon_jpg.svg';
import iconPng from '../../../images/icon_png.svg';
import iconExcel from '../../../images/icon_excel.svg';
import iconFile from '../../../images/icon_file.svg';
import SearchBar from '../../Table2/SearchBar';
import { FaSortDown, FaSortUp } from 'react-icons/fa';
import Swal from 'sweetalert2';

const PerformanceReport = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'periode', direction: 'desc' });

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const bp_code = localStorage.getItem('bp_code');

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_Performance_Report_Supplier()}${bp_code}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Network response was not ok');

        const result = await response.json();
        setData(result.data.map((item: { po_listing_no: any; date: any; upload_at: any; file: any; }) => ({
          no: item.po_listing_no,
          periode: formatDate(item.date),
          upload_at: item.upload_at,
          filedata: item.file.split('_').slice(1).join('_'),
          attachedFile: item.file
        })));
        setFilteredData(result.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  function formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format to YYYY-MM-DD
  }
  

  // Handle search by file name
  useEffect(() => {
    let filtered = [...data];

    // Filter by month if selected
    if (selectedMonth) {
      filtered = filtered.filter((row) =>
        row.periode.startsWith(selectedMonth)
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        row.filedata.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
  
      // Konversi string ke Date jika kolom yang diurutkan adalah tanggal
      if (sortConfig.key === 'upload_at' || sortConfig.key === 'periode') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
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

  // Handle page change
  const handlePageChange = (page) => setCurrentPage(page);
  

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  function getFileIcon(filename) {
    if (!filename) {
      return <img src={iconFile} alt="File Icon" className="w-6 h-6" />;
    }
  
    const extension = filename.split('.').pop().toLowerCase();
  
    switch (extension) {
      case 'pdf':
        return <img src={iconPdf} alt="PDF Icon" className="w-6 h-6" />;
      case 'doc':
        return <img src={iconDoc} alt="DOC Icon" className="w-6 h-6" />;
      case 'docx':
        return <img src={iconDocx} alt="DOCX Icon" className="w-6 h-6" />;
      case 'jpg':
      case 'jpeg':
        return <img src={iconJpg} alt="JPG Icon" className="w-6 h-6" />;
      case 'png':
        return <img src={iconPng} alt="PNG Icon" className="w-6 h-6" />;
      case 'xls':
      case 'xlsx':
        return <img src={iconExcel} alt="Excel Icon" className="w-6 h-6" />;
      default:
        return <img src={iconFile} alt="File Icon" className="w-6 h-6" />;
    }
  }

  async function downloadFile(attachedFile) {
    const token = localStorage.getItem('access_token');

    try {
      const response = await fetch(`${API_Download_Performance_Report()}${attachedFile}`, {
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
   

  return (
    <>
      <Breadcrumb pageName="Performance Report" />
      <div className="font-poppins bg-white ">
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
                  <th className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-12"> No
                  </th>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-50"
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
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-100">File Name
                  </th>
                  <th className="py-3 text-center border-b border-b-gray-400 w-40">Attached File
                  </th>
                  <th
                    className="py-3 text-center border-b border-b-gray-400 cursor-pointer w-55"
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
                      <td className="px-2 py-3 text-center">{row.periode ? (
                          new Date(row.periode).toLocaleString('en-US', { month: 'long', year: 'numeric' })
                        ) : (
                          'No period'
                        )}
                      </td>
                      <td className="px-1 py-3 text-center">{row.filedata}</td>
                      <td className="px-1 py-2 text-center flex items-center justify-center">
                        <button
                          onClick={() => downloadFile(row.attachedFile)}
                          className="px-2 py-1 hover:scale-110"
                        >
                          {getFileIcon(row.attachedFile)}
                        </button>
                      </td>
                      <td className="px-2 py-3 text-center">{row.upload_at}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
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

export default PerformanceReport;
