import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from 'react-select';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { toast, ToastContainer } from 'react-toastify';

// Dummy data representing API fetch result
const apiData = [
  { partNumber: 'P001', partName: 'Brake Pipe' },
  { partNumber: 'P002', partName: 'Fuel Line' },
  { partNumber: 'P003', partName: 'Hydraulic Hose' },
  { partNumber: 'P004', partName: 'Coupling' },
  { partNumber: 'P005', partName: 'Steel Tube' },
];

// Transform API data to match react-select format
const partOptions = apiData.map(item => ({
  value: item.partNumber,
  label: item.partName
}));

const StockManagement = () => {
  const [value, setValue] = useState(0);
  const [selectedPart, setSelectedPart] = useState(null);
  const [qtyOk, setQtyOk] = useState('');
  const [qtyNg, setQtyNg] = useState('');
  const [status, setStatus] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePartChange = (selectedOption) => {
    setSelectedPart(selectedOption);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const transactionData = {
        type: value === 0 ? 'ingoing' : value === 1 ? 'ready' : 'outgoing',
        timestamp: new Date().toISOString(),
        status: status,
        partNumber: selectedPart?.value,
        qtyOk: qtyOk,
        qtyNg: qtyNg ? qtyNg : "0"
      };

      const response = await fetch('/api/stock-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) throw new Error('Failed to submit');

      toast.success('Transaction recorded successfully');
      
      // Clear form
      setSelectedPart(null);
      setQtyOk('');
      setQtyNg('');
      setStatus('');
      
    } catch (error) {
      toast.error('Failed to record transaction');
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Stock Management" />
      <div className='max-w-[1200px] mx-auto px-4 md:px-6'>

        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Stock Ingoing" />
            <Tab label="Stock Ready" />
            <Tab label="Stock Outgoing" />
          </Tabs>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
              <div className="p-4 md:p-6.5 ">
                {/* Status Selection */}
                <div className="mb-4.5 w-full">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Status <span className="text-meta-1">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  >
                    <option value="" disabled>Select Status</option>
                    <option value="fresh">Fresh</option>
                    <option value="replating">Replating</option>
                  </select>
                </div>

                {/* Part Name Selection */}
                <div className="mb-4.5 w-full">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Part Name <span className="text-meta-1">*</span>
                  </label>
                  <Select
                    options={partOptions}
                    value={selectedPart}
                    onChange={handlePartChange}
                    placeholder="Select Part Name"
                    className="w-full"
                    isClearable
                  />
                </div>

                {/* Part Number Display */}
                <div className="mb-4.5 w-full">
                  <label className="mb-2.5 block text-black dark:text-white">
                  Part Number
                  </label>
                  <input
                    type="text"
                    value={selectedPart ? selectedPart.value : ''}
                    readOnly
                    className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-black outline-none transition disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Quantity OK */}
                <div className="mb-4.5 w-full">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Quantity OK <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={qtyOk}
                    onChange={(e) => setQtyOk(e.target.value)}
                    placeholder="Enter Quantity OK"
                    required
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Quantity NG */}
                <div className="mb-4.5 w-full">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Quantity Not Good  <span className="text-gray-400">( Leave blank if no NG parts )</span>
                    </label>
                  <input
                    type="number"
                    value={qtyNg}
                    onChange={(e) => setQtyNg(e.target.value)}
                    placeholder="Enter Quantity Not Good"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </Box>
      </div>
    </>
  );
};

export default StockManagement;