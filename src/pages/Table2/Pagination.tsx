
const Pagination = ({ totalRows, rowsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-end mt-6">
      <div className="flex gap-2 items-center pagination">
        <button
          className="px-3 py-3 text-gray-900 bg-gray-200 rounded-md hover:bg-blue-800 hover:text-white"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <svg className="w-3 h-3 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 10 16">
            <path d="M8.766.566A2 2 0 0 0 6.586 1L1 6.586a2 2 0 0 0 0 2.828L6.586 15A2 2 0 0 0 10 13.586V2.414A2 2 0 0 0 8.766.566Z" />
          </svg>
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`px-4 py-2 ${number === currentPage ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-900'} rounded-md hover:bg-blue-800 hover:text-white`}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}
        <button
          className="px-3 py-3 text-gray-900 bg-gray-200 rounded-md hover:bg-blue-800 hover:text-white"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <svg className="w-3 h-3 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 10 16">
            <path d="M1.234 15.434A2 2 0 0 0 3.414 15L9 9.414a2 2 0 0 0 0-2.828L3.414 1A2 2 0 0 0 1 2.414v11.172a2 2 0 0 0 1.234 1.848Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
