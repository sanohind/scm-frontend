
const SearchMonth = ({ selectedMonth, setSelectedMonth }) => {
  return (
    <div className="items-center shadow mt-4">
      <div className="flex items-center">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-1 border rounded-md"
        />
      </div>
    </div>
  );
};

export default SearchMonth;
