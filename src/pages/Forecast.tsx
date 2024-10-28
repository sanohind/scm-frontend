import { API_GetForecastFileSupplier, API_IndexForecastSupplier } from '../api/api';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useState, useMemo, useEffect } from "react";

const Forecast = () => {
  const [searchValue, setSearchValue] = useState("");
  const [productList, setProductList] = useState([]);
  const [rowsLimit, setRowsLimit] = useState(6);
  const [rowsToShow, setRowsToShow] = useState([]);
  const [customPagination, setCustomPagination] = useState([]);
  const [activeColumn, setActiveColumn] = useState(["upload_at"]);
  const [sortingColumn, setSortingColumn] = useState(["upload_at"]);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const searchProducts = (keyword) => {
    keyword = keyword.toLowerCase();
    setSearchValue(keyword);
    if (keyword !== "") {
      const results = productList.filter((product) => {
        return (
          product.description.toLowerCase().includes(keyword) ||
          product.filedata.toLowerCase().includes(keyword) ||
          product.upload_at.toLowerCase().includes(keyword)
        );
      });
      setRowsToShow(results.slice(0, rowsLimit));
      setTotalPage(Math.ceil(results.length / rowsLimit));
      setCustomPagination(Array(Math.ceil(results.length / rowsLimit)).fill(null));
      setCurrentPage(0);
    } else {
      clearData();
    }
  };

  const clearData = () => {
    setSearchValue("");
    setRowsToShow(productList.slice(0, rowsLimit));
    setTotalPage(Math.ceil(productList.length / rowsLimit));
    setCustomPagination(Array(Math.ceil(productList.length / rowsLimit)).fill(null));
    setCurrentPage(0);
  };

  const sortByColumn = (column) => {
    let sortedData = [];
    if (sortingColumn.includes(column)) {
      sortedData = productList.slice().sort((a, b) => {
        if (column === 'upload_at') {
          return new Date(b[column]) - new Date(a[column]);
        } else {
          return b[column].toString().localeCompare(a[column].toString());
        }
      });
      setSortingColumn([]);
    } else {
      sortedData = productList.slice().sort((a, b) => {
        if (column === 'upload_at') {
          return new Date(a[column]) - new Date(b[column]);
        } else {
          return a[column].toString().localeCompare(b[column].toString());
        }
      });
      setSortingColumn([column]);
    }
    setProductList(sortedData);
    setRowsToShow(sortedData.slice(currentPage * rowsLimit, (currentPage + 1) * rowsLimit));
    setActiveColumn([column]);
  };
  

  const nextPage = () => {
    if (currentPage < totalPage - 1) {
      const startIndex = rowsLimit * (currentPage + 1);
      const endIndex = startIndex + rowsLimit;
      const newArray = productList.slice(startIndex, endIndex);
      setRowsToShow(newArray);
      setCurrentPage(currentPage + 1);
    }
  };
  
  const previousPage = () => {
    if (currentPage > 0) {
      const startIndex = rowsLimit * (currentPage - 1);
      const endIndex = startIndex + rowsLimit;
      const newArray = productList.slice(startIndex, endIndex);
      setRowsToShow(newArray);
      setCurrentPage(currentPage - 1);
    }
  };
  
  const changePage = (value) => {
    const startIndex = value * rowsLimit;
    const endIndex = startIndex + rowsLimit;
    const newArray = productList.slice(startIndex, endIndex);
    setRowsToShow(newArray);
    setCurrentPage(value);
  };
  

  useMemo(() => {
    setCustomPagination(
      Array(Math.ceil(productList?.length / rowsLimit)).fill(null)
    );
  }, []);

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
  
    switch (extension) {
      case 'pdf':
        return <img src="../assets/icon_pdf.svg" alt="PDF Icon" className="w-6 h-6" />;
      case 'doc':
        return <img src="../assets/icon_doc.svg" alt="DOC Icon" className="w-6 h-6" />;
      case 'docx':
        return <img src="../assets/icon_docx.svg" alt="DOCX Icon" className="w-6 h-6" />;
      case 'jpg':
      case 'jpeg':
        return <img src="../assets/icon_jpg.svg" alt="JPG Icon" className="w-6 h-6" />;
      case 'png':
        return <img src="../assets/icon_png.svg" alt="PNG Icon" className="w-6 h-6" />;
      case 'xls':
      case 'xlsx':
        return <img src="../assets/icon_excel.svg" alt="Excel Icon" className="w-6 h-6" />;
      default:
        return <img src="../assets/icon_file.svg" alt="File Icon" className="w-6 h-6" />;
    }
  };
  

  const downloadFile = async (attachedFile) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_GetForecastFileSupplier}${attachedFile}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      console.error('Error downloading file:', error);
      // Handle error (e.g., display notification)
    }
  };
  

  const fetchForecast = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_IndexForecastSupplier, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      if (result) {
        const data = result.data.map((item, index) => ({
          no: index + 1,
          description: item.description,
          upload_at: item.upload_at,
          filedata: item.file,
          attachedFile: item.file
        }));
  
        // Initialize state variables
        setProductList(data);
        setRowsToShow(data.slice(0, rowsLimit));
        setTotalPage(Math.ceil(data.length / rowsLimit));
        setCustomPagination(Array(Math.ceil(data.length / rowsLimit)).fill(null));
      } else {
        console.error('Error get data:', result.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  useEffect(() => {
    fetchForecast();
  }, []);

  return (
    <>
      <Breadcrumb pageName="Forecast Report" />

      <div className="bg-white flex items-center p-5 w-full">
        <div className="w-full max-w-5xl px-2">
          {/* <div>
            <h1 className="text-2xl font-medium">Tailwind Custom Table</h1>
          </div> */}
          <div className="flex justify-end  py-2 pb-3">
            <div className="px-2 bg-white py-3 border border-black rounded-lg">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.2741 9.05133C11.1214 7.89518 11.5009 6.46176 11.3366 5.03784C11.1724 3.61391 10.4766 2.3045 9.38841 1.37157C8.30022 0.438638 6.8999 -0.0490148 5.4676 0.0061742C4.0353 0.0613632 2.67666 0.655324 1.66348 1.66923C0.650303 2.68313 0.0573143 4.0422 0.00315019 5.47454C-0.0510139 6.90687 0.437641 8.30685 1.37135 9.39437C2.30506 10.4819 3.61497 11.1768 5.03901 11.34C6.46305 11.5032 7.8962 11.1227 9.05174 10.2746H9.05087C9.07712 10.3096 9.10512 10.3428 9.13662 10.3752L12.5054 13.744C12.6694 13.9081 12.892 14.0004 13.1241 14.0005C13.3562 14.0006 13.5789 13.9085 13.7431 13.7444C13.9072 13.5803 13.9995 13.3578 13.9996 13.1256C13.9997 12.8935 13.9076 12.6709 13.7435 12.5067L10.3747 9.13796C10.3435 9.10629 10.3098 9.07704 10.2741 9.05046V9.05133ZM10.4999 5.68783C10.4999 6.31982 10.3754 6.94562 10.1335 7.5295C9.89169 8.11338 9.5372 8.6439 9.09032 9.09078C8.64344 9.53767 8.11291 9.89215 7.52903 10.134C6.94515 10.3759 6.31936 10.5003 5.68737 10.5003C5.05538 10.5003 4.42959 10.3759 3.84571 10.134C3.26183 9.89215 2.7313 9.53767 2.28442 9.09078C1.83754 8.6439 1.48305 8.11338 1.2412 7.5295C0.999349 6.94562 0.87487 6.31982 0.87487 5.68783C0.87487 4.41148 1.3819 3.1874 2.28442 2.28488C3.18694 1.38236 4.41102 0.875332 5.68737 0.875332C6.96372 0.875332 8.1878 1.38236 9.09032 2.28488C9.99284 3.1874 10.4999 4.41148 10.4999 5.68783Z"
                    fill="black"
                  />
                </svg>
                <input
                  type="text"
                  className="max-w-[150px] text-sm bg-transparent focus:ring-0 border-transparent outline-none w-[85%]"
                  placeholder="Keyword Search"
                  onChange={(e) => searchProducts(e.target.value)}
                  value={searchValue}
                />
                <svg
                  stroke="currentColor"
                  fill="black"
                  className={`text-black cursor-pointer ${
                    searchValue?.length > 0 ? "visible" : "invisible"
                  }`}
                  strokeWidth="0"
                  viewBox="0 0 1024 1024"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={clearData}
                >
                  <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                </svg>
              </div>
            </div>
          </div>
          <div className="w-full overflow-x-scroll md:overflow-auto max-w-7xl 2xl:max-w-none shadow-md">
            <table className="table-auto overflow-scroll md:overflow-auto w-full text-left font-inter border ">
              <thead
                className={`rounded-lg text-base text-white font-semibold w-full ${
                  rowsToShow?.length > 0
                    ? "border-b-0"
                    : "border-b-2 border-black"
                }`}
              >
                <tr className="bg-white border border-black">
                  <th className="py-3 px-3 text-black sm:text-base font-bold whitespace-nowrap">
                    No
                  </th>
                  <th className="py-3 px-3 text-black sm:text-base font-bold whitespace-nowrap ">
                    Description
                  </th>
                  <th className="py-3 px-3 flex items-center text-black sm:text-base font-bold whitespace-nowrap">
                    File Name
                  </th>
                  <th className="py-3 px-3 text-black sm:text-base font-bold whitespace-nowrap">
                    Attached File
                  </th>
                  <th className="flex items-center py-3 px-3 text-black sm:text-base font-bold whitespace-nowrap group">
                    <svg
                      className={`w-4 h-4 cursor-pointer  ${
                        sortingColumn?.includes("UploadAt")
                          ? "rotate-180"
                          : "rotate-0"
                      } ${
                        activeColumn?.includes("UploadAt")
                          ? "text-black"
                          : "text-[#BCBDBE] group-hover:text-black rotate-180"
                      }`}
                      onClick={() => sortByColumn("UploadAt")}
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span
                      className="cursor-pointer pl-1"
                      onClick={() => sortByColumn("UploadAt")}
                    >
                      Upload At
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="border border-black text-black">
                {rowsToShow?.map((data, index) => (
                  <tr className={`${index % 2 == 0 ? "bg-white" : "bg-[#222E3A]/[6%]"}`} key={index}>
                    <td
                      className={`py-2 px-3 font-normal text-base ${
                        index == 0
                          ? "border-t-2 border-black"
                          : index == rowsToShow?.length
                          ? "border-y"
                          : "border-t"
                      } whitespace-nowrap`}
                    >
                      {rowsLimit * currentPage + index + 1}
                    </td>
                    <td
                      className={`py-2 px-3 font-normal text-base ${
                        index == 0
                          ? "border-t-2 border-black"
                          : index == rowsToShow?.length
                          ? "border-y"
                          : "border-t"
                      } whitespace-nowrap`}
                    >
                      {data?.description}
                    </td>
                    <td
                      className={`py-2 px-3 font-normal text-base ${
                        index == 0
                          ? "border-t-2 border-black"
                          : index == rowsToShow?.length
                          ? "border-y"
                          : "border-t"
                      } whitespace-nowrap`}
                    >
                      {data?.filedata.split('_').slice(1).join('_')}
                    </td>
                    <td
                      className={`py-2 px-3 text-base  font-normal ${
                        index == 0
                          ? "border-t-2 border-black"
                          : index == rowsToShow?.length
                          ? "border-y"
                          : "border-t"
                      } whitespace-nowrap`}
                    >
                      <button onClick={() => downloadFile(data.attachedFile)} className="px-2 py-1 hover:scale-110">
                        {/* Use a function to get the appropriate icon */}
                        {getFileIcon(data.attachedFile)}
                      </button>
                    </td>                    
                    <td
                      className={`py-5 px-4 text-base  font-normal ${
                        index == 0
                          ? "border-t-2 border-black"
                          : index == rowsToShow?.length
                          ? "border-y"
                          : "border-t"
                      }`}
                    >
                      {"$" + data?.upload_at}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className={`w-full justify-center sm:justify-between flex-col sm:flex-row gap-5 mt-2.5 px-1 items-center ${
              productList?.length > 0 ? "flex" : "hidden"
            }`}
          >
            <div className="text-lg">
              Showing {currentPage == 0 ? 1 : currentPage * rowsLimit + 1} to{" "}
              {currentPage == totalPage - 1
                ? productList?.length
                : (currentPage + 1) * rowsLimit}{" "}
              of {productList?.length} entries
            </div>
            <div className="flex">
              <ul
                className="flex justify-center items-center gap-x-[10px] z-30"
                role="navigation"
                aria-label="Pagination"
              >
                <li
                  className={`prev-btn flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB] disabled] ${
                    currentPage == 0
                      ? "bg-[#cccccc] pointer-events-none"
                      : " cursor-pointer"
                  }`}
                  onClick={previousPage}
                >
                  <img src="https://www.tailwindtap.com/assets/travelagency-admin/leftarrow.svg" />
                </li>
                {customPagination?.map((data, index) => (
                  <li
                    className={`flex items-center justify-center w-[36px] rounded-[6px] h-[34px] border-solid border-[2px] bg-[#FFFFFF] cursor-pointer ${
                      currentPage == index
                        ? "text-blue-600  border-sky-500"
                        : "border-[#E4E4EB] "
                    }`}
                    onClick={() => changePage(index)}
                    key={index}
                  >
                    {index + 1}
                  </li>
                ))}
                <li
                  className={`flex items-center justify-center w-[36px] rounded-[6px] h-[36px] border-[1px] border-solid border-[#E4E4EB] ${
                    currentPage == totalPage - 1
                      ? "bg-[#cccccc] pointer-events-none"
                      : " cursor-pointer"
                  }`}
                  onClick={nextPage}
                >
                  <img src="https://www.tailwindtap.com/assets/travelagency-admin/rightarrow.svg" />
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Forecast;