
const SearchMonth = ({ selectedMonth, setSelectedMonth }) => {
  return (
    <div className="items-center">
      <div className="flex items-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-1 border rounded-md shadow-md"
        />
      </div>
    </div>
  );
};

export default SearchMonth;
