import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from 'react-select';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_Transaction_Subcont, API_List_Item_Subcont } from '../../../api/api';
import Swal from 'sweetalert2';

const StockManagement = () => {
  const [value, setValue] = useState(0);
  const [selectedPart, setSelectedPart] = useState<{ value: string; label: string } | null>(null);
  const [qtyOk, setQtyOk] = useState('');
  const [qtyNg, setQtyNg] = useState('');
  const [status, setStatus] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [apiData, setApiData] = useState<{ partNumber: string; partName: string }[]>([]);

  interface ApiItem {
    part_number: string;
    part_name: string;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(API_List_Item_Subcont(), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (result.status) {
          // Transform the data structure to match our needs
          const transformedData = result.data.map((item: ApiItem) => ({
            partNumber: item.part_number,
            partName: item.part_name
          }));
          setApiData(transformedData);
        }
      } catch (error) {
        console.error('Error fetching parts:', error);
      }
    };

    fetchData();
  }, []);

  // Transform API data to match react-select format
  const partOptions = apiData.map(item => ({
    value: item.partNumber,
    label: `${item.partName} | ${item.partNumber}`
  }));

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handlePartChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedPart(selectedOption);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const confirm = await Swal.fire({
      title: 'Confirm Submission',
      html: `
      <p>Are you sure the data entered is correct?</p>
      <br>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Transaction Type:</strong> ${value === 0 ? 'In' : value === 1 ? 'Process' : 'Out'}</p>
      <p><strong>Part List:</strong> ${selectedPart?.label}</p>
      <p><strong>Quantity OK:</strong> ${qtyOk}</p>
      <p><strong>Quantity NG:</strong> ${qtyNg ? qtyNg : 0}</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a', 
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Submit It!'
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const transactionData = {
        transaction_type: value === 0 ? 'In' : value === 1 ? 'Process' : 'Out',
        status: status,
        delivery_note: deliveryNote,
        item_code: selectedPart?.value,
        qty_ok: qtyOk,
        qty_ng: qtyNg ? qtyNg : 0,
      };

      const response = await fetch(API_Create_Transaction_Subcont(), {
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
      
    } catch (error) {
      toast.error('Failed to record transaction');
      console.error(error);
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Transactions" />
      <div className='mx-auto p-2 md:p-4 lg:p-6 space-y-6'>
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Record Incoming" />
            <Tab label="Record Process" />
            <Tab label="Record Outgoing" />
          </Tabs>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ">
            <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
              <div className="p-4 md:p-6.5">
                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
                  {/* Left Column */}
                  <div>
                    {/* Status Selection */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">Status <span className="text-meta-1">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        required
                          >
                        <option value="" disabled>Select Status</option>
                        <option value="Fresh">Fresh</option>
                        <option value="Replating">Replating</option>
                      </select>
                    </div>

                    {/* Delivery Note Input */}
                    {value !== 1 && (
                      <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Delivery Note <span className="text-meta-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          placeholder="Enter Delivery Note"
                          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          required
                        />
                      </div>
                    )}

                    {/* Part Name Selection */}
                    <div className="mb-4.5">
                      <label className="mb-2.5 block text-black dark:text-white">Part Name <span className="text-meta-1">*</span>
                      </label>
                      <Select
                        options={partOptions}
                        value={selectedPart}
                        onChange={handlePartChange}
                        placeholder="Select Part Name"
                        className="w-full"
                        isClearable
                        required
                      />
                    </div>

                    {/* Part Number Display */}
                    <div className="mb-4.5 w-full">
                      <label className="mb-2.5 block text-black dark:text-white">Part Number
                      </label>
                      <input
                        type="text"
                        value={selectedPart ? selectedPart.value : ''}
                        readOnly
                        className="w-full rounded border-[1.5px] border-stroke bg-gray-100 py-3 px-5 text-black outline-none transition disabled:cursor-default dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          />
                    </div>
                  </div>
                  {/* Right Column */}
                  <div>
                    {/* Quantity OK */}
                    <div className="mb-4.5 w-full">
                      <label className="mb-2.5 block text-black dark:text-white">Quantity OK <span className="text-meta-1">*</span>
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
                      <label className="mb-2.5 block text-black dark:text-white">Quantity NG <span className="text-gray-400">( Leave blank if no NG parts )</span>
                      </label>
                      <input
                        type="number"
                        value={qtyNg}
                        onChange={(e) => setQtyNg(e.target.value)}
                        placeholder="Enter Quantity NG"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90">
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Box>
      </div>
    </>
  );
};

export default StockManagement;