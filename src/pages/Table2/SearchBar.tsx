import { FaSearch } from 'react-icons/fa'; // Pastikan sudah menginstall react-icons dengan 'npm install react-icons'

const SearchBar = ({ placeholder, onSearchChange }) => {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 w-full md:w-1/2 lg:w-1/3">
      <FaSearch className="text-gray-600 mr-2" />
      <input
        type="text"
        className="w-full px-2 py-1 outline-none"
        placeholder={placeholder}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
