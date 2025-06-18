import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import Breadcrumb from '../../../../components/Breadcrumbs/Breadcrumb';
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_Transaction_Subcont, API_Item_Subcont } from '../../../../api/api';
import Swal from 'sweetalert2';
import DatePicker from '../../../../components/Forms/DatePicker';
import { FaExclamationCircle, FaPlus } from 'react-icons/fa';
import Button from '../../../../components/Forms/Button';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaUpload, FaDownload } from 'react-icons/fa';

const Transactions = () => {
  const [value, setValue] = useState(0);
  const [selectedPart, setSelectedPart] = useState<{ value: string; label: string } | null>(null);
  const [status, setStatus] = useState('');  
  const [deliveryNote, setDeliveryNote] = useState('');
  const [apiData, setApiData] = useState<{
    partNumber: string;
    partName: string;
    oldPartName: string;
    incomingFreshStock: number;
    readyFreshStock: number;
    ngFreshStock: number;
    incomingReplatingStock: number;
    readyReplatingStock: number;
    ngReplatingStock: number;
  }[]>([]);  // Handle delivery note input - only allow alphanumeric characters (letters and numbers only)
  const handleDeliveryNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const originalLength = value.length;
    // Allow only letters and numbers (no spaces or symbols)
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
    
    // Show warning if invalid characters were removed
    if (filteredValue.length < originalLength) {
      toast.warning('Only letters and numbers are allowed in delivery note', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setDeliveryNote(filteredValue);
  };
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [partList, setPartList] = useState<any[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isFetchingEnabled, setIsFetchingEnabled] = useState(true);
  const [isTemplateDownloadable, setIsTemplateDownloadable] = useState(false);


  interface ApiItem {
    part_number: string;
    part_name: string;
    old_part_name: string;
    incoming_fresh_stock: number;
    ready_fresh_stock: number;
    ng_fresh_stock: number;
    incoming_replating_stock: number;
    ready_replating_stock: number;
    ng_replating_stock: number;
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_Item_Subcont(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        handleFetchError('Failed to fetch data');
        return;
      }

      const result = await response.json();
      if (result.status) {
        const transformedData = result.data.map((item: ApiItem) => ({
          partNumber: item.part_number,
          partName: item.part_name,
          oldPartName : item.old_part_name || '-',
          incomingFreshStock: item.incoming_fresh_stock,
          readyFreshStock: item.ready_fresh_stock,
          ngFreshStock: item.ng_fresh_stock,
          incomingReplatingStock: item.incoming_replating_stock,
          readyReplatingStock: item.ready_replating_stock,
          ngReplatingStock: item.ng_replating_stock,
        }));
        setApiData(transformedData);
        setFailedAttempts(0);
      }
    } catch (error) {
      handleFetchError('Network error while fetching data');
    }
  };

  useEffect(() => {
    if (isFetchingEnabled && failedAttempts < 3) {
      fetchData();
      
      const interval = setInterval(() => {
        if (isFetchingEnabled && failedAttempts < 3) {
          fetchData();
        }
      }, 3000); // 3 seconds
  
      return () => clearInterval(interval);
    }
  }, [isFetchingEnabled, failedAttempts])


  const handleFetchError = (message: string) => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    
    if (newFailedAttempts >= 3) {
      setIsFetchingEnabled(false);
      toast.error('Stopped fetching after 3 failed attempts');
    }
    toast.error(message);
  };

  const partOptions = apiData.map((item) => ({
    value: item.partNumber,
    label: `${item.partNumber} | ${item.partName} | ${item.oldPartName}`,
  }));

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    // Reset form when tab changes
    setPartList([]);
    setSelectedPart(null);
    setStatus('');
    setDeliveryNote('');
    setTransactionDate(new Date());
  };

  const handlePartChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedPart(selectedOption);
  };

  const handleAddPart = () => {
    if (!selectedPart) {
      toast.error('Please select a part');
      return;
    }
    // Cek apakah part sudah ada di partList
    const partExists = partList.some(
      (part) => part.partNumber === selectedPart.value
    );

    if (partExists) {
      toast.error('Part already exists in the list');
      setSelectedPart(null);
      return;
    }

    const selectedPartData = apiData.find(item => item.partNumber === selectedPart.value);

    // Jika berada di tabs "Record Outgoing" (value === 2), tentukan stok saat ini berdasarkan status
    let currentStock = 0;
    let currentNgStock = 0;
    if (value === 2) {
      if (status === 'Fresh') {
        currentStock = selectedPartData?.readyFreshStock ?? 0;
        currentNgStock = selectedPartData?.ngFreshStock ?? 0;
      } else if (status === 'Replating') {
        currentStock = selectedPartData?.readyReplatingStock ?? 0;
        currentNgStock = selectedPartData?.ngReplatingStock ?? 0;
      }
    }
    
    if (value === 1) {
      if (status === 'Fresh') {
        currentStock = selectedPartData?.incomingFreshStock ?? 0;
        currentNgStock = selectedPartData?.ngFreshStock ?? 0;
      } else if (status === 'Replating') {
        currentStock = selectedPartData?.incomingReplatingStock ?? 0;
        currentNgStock = selectedPartData?.ngReplatingStock ?? 0;
      }
    }

    // Lanjutkan menambahkan part jika tidak duplikat
    setPartList([
      ...partList,
      {
        partName: selectedPart.label.split(' | ')[1],
        partNumber: selectedPart.value,
        oldPartName: selectedPartData?.oldPartName || '-',
        qtyOk: '',
        qtyNg: '0',
        currentStock: currentStock,
        currentNgStock: currentNgStock,
      },
    ]);
    setSelectedPart(null);
  };

  useEffect(() => {
    if (status && partList.length > 0) {
      setPartList(prevPartList => {
        let hasChanged = false;
        const newPartList = prevPartList.map(pt => {
          const matchedApiData = apiData.find(item => item.partNumber === pt.partNumber);
          if (!matchedApiData) {
            return pt; // No data to update from, return original part
          }

          let newCurrentStock = pt.currentStock;
          let newCurrentNgStock = pt.currentNgStock;

          if (value === 1) { // Process Tab
            newCurrentStock = status === 'Fresh' ? matchedApiData.incomingFreshStock ?? 0 : matchedApiData.incomingReplatingStock ?? 0;
            newCurrentNgStock = status === 'Fresh' ? matchedApiData.ngFreshStock ?? 0 : matchedApiData.ngReplatingStock ?? 0;
          } else if (value === 2) { // Outgoing Tab
            newCurrentStock = status === 'Fresh' ? matchedApiData.readyFreshStock ?? 0 : matchedApiData.readyReplatingStock ?? 0;
            newCurrentNgStock = status === 'Fresh' ? matchedApiData.ngFreshStock ?? 0 : matchedApiData.ngReplatingStock ?? 0;
          }
          // For value === 0, stocks are not updated from apiData by this effect.

          if (pt.currentStock !== newCurrentStock || pt.currentNgStock !== newCurrentNgStock) {
            hasChanged = true;
            return {
              ...pt,
              currentStock: newCurrentStock,
              currentNgStock: newCurrentNgStock,
            };
          }
          return pt; // Return original part object if no change in stock values
        });

        if (hasChanged) {
          return newPartList;
        }
        return prevPartList; // Return the original list if no changes, breaking potential loops
      });
    }
  }, [apiData, status, value, partList]); // partList is a dependency, careful handling is needed

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    // if (value === 2) {
    //   setPartList((prev) =>
    //     prev.map((pt) => {
    //       const matched = apiData.find((item) => item.partNumber === pt.partNumber);
    //       if (!matched) return pt;
    //       if (newStatus === 'Fresh') {
    //         return {
    //           ...pt,
    //           currentStock: matched.readyFreshStock ?? 0,
    //           currentNgStock: matched.ngFreshStock ?? 0,
    //         };
    //       } else {
    //         return {
    //           ...pt,
    //           currentStock: matched.readyReplatingStock ?? 0,
    //           currentNgStock: matched.ngReplatingStock ?? 0,
    //         };
    //       }
    //     })
    //   );
    // }
    // if (value === 1) {
    //   setPartList((prev) =>
    //     prev.map((pt) => {
    //       const matched = apiData.find((item) => item.partNumber === pt.partNumber);
    //       if (!matched) return pt;
    //       if (newStatus === 'Fresh') {
    //         return {
    //           ...pt,
    //           currentStock: matched.incomingFreshStock ?? 0,
    //           currentNgStock: matched.ngFreshStock ?? 0,
    //         };
    //       } else {
    //         return {
    //           ...pt,
    //           currentStock: matched.incomingReplatingStock ?? 0,
    //           currentNgStock: matched.ngReplatingStock ?? 0,
    //         };
    //       }
    //     })
    //   );
    // }
  };

  const handlePartListChange = (index: number, field: 'qtyOk' | 'qtyNg', value: string) => {
    const updatedPartList = [...partList];
    updatedPartList[index][field] = value;
    setPartList(updatedPartList);
  };

  const handleDeletePart = (index: number) => {
    const updatedPartList = partList.filter((_, i) => i !== index);
    setPartList(updatedPartList);
  };

  const handleSubmit = async () => {
    // Initial checks for status and deliveryNote
    if (!status && (value === 0 || value === 1 || value === 2)) {
      toast.error('Please select a status');
      return;
    }
    // Delivery note is required for Incoming (0) and Outgoing (2)
    if (!deliveryNote && (value === 0 || value === 2)) {
      toast.error('Please enter a delivery note for Incoming/Outgoing transactions');
      return;
    }

    if (partList.length === 0) {
      toast.error('Please add at least one part');
      return;
    }

    for (const part of partList) {
      const qtyOk = parseInt(part.qtyOk || '0', 10);
      const qtyNg = parseInt(part.qtyNg || '0', 10);

      if (isNaN(qtyOk)) {
        toast.error(`Invalid Qty OK for part ${part.partNumber}. It must be a number.`);
        return;
      }
      if (isNaN(qtyNg)) {
        toast.error(`Invalid Qty NG for part ${part.partNumber}. It must be a number.`);
        return;
      }

      const currentPartSystemData = apiData.find(p => p.partNumber === part.partNumber);
      if (!currentPartSystemData) {
        toast.error(`Part data not found for ${part.partNumber}. Please refresh.`);
        return;
      }

      // Incoming Transaction (value === 0)
      if (value === 0) {
        if (qtyOk < 0) { // Reduction of incoming stock
          const stockToCheck = status === 'Fresh' ? currentPartSystemData.incomingFreshStock : currentPartSystemData.incomingReplatingStock;
          if (Math.abs(qtyOk) > stockToCheck) {
            toast.error(`Qty OK for ${part.partNumber} (${status}) cannot reduce stock by more than available incoming stock (${stockToCheck}).`);
            return;
          }
        }
        // qtyOk > 0 is adding new stock, no upper bound against current stock.
        if (qtyNg < 0) {
          toast.error(`Qty NG for ${part.partNumber} (${status}) cannot be negative for Incoming transactions.`);
          return;
        }
        // qtyNg > 0 is adding new NG stock, no upper bound against current stock.
      }
      // Process Transaction (value === 1)
      else if (value === 1) {
        if (qtyOk > 0) { // Consuming input for process
          const stockToConsume = status === 'Fresh' ? currentPartSystemData.incomingFreshStock : currentPartSystemData.incomingReplatingStock;
          if (qtyOk > stockToConsume) {
            toast.error(`Qty OK for ${part.partNumber} (${status}) to process cannot exceed available incoming stock (${stockToConsume}).`);
            return;
          }
        } else if (qtyOk < 0) { // Correction of process output (reducing ready stock)
          const stockToCorrect = status === 'Fresh' ? currentPartSystemData.readyFreshStock : currentPartSystemData.readyReplatingStock;
          if (Math.abs(qtyOk) > stockToCorrect) {
            toast.error(`Qty OK for ${part.partNumber} (${status}) correction cannot reduce ready stock by more than available (${stockToCorrect}).`);
            return;
          }
        }
        // No validation for qtyOk === 0 for Process.

        if (qtyNg < 0) { // Correction of NG stock (reducing NG stock)
          const ngStockToCorrect = status === 'Fresh' ? currentPartSystemData.ngFreshStock : currentPartSystemData.ngReplatingStock;
          if (Math.abs(qtyNg) > ngStockToCorrect) {
            toast.error(`Qty NG for ${part.partNumber} (${status}) correction cannot reduce NG stock by more than available (${ngStockToCorrect}).`);
            return;
          }
        }
        // If qtyNg > 0, it's generating new NG items from process, no upper bound check against current NG stock.
      }
      // Outgoing Transaction (value === 2)
      else if (value === 2) {
        if (qtyOk < 0) {
          toast.error(`Qty OK for ${part.partNumber} (${status}) must be positive for Outgoing transactions.`);
          return;
        }
        const readyStockToDispatch = status === 'Fresh' ? currentPartSystemData.readyFreshStock : currentPartSystemData.readyReplatingStock;
        if (qtyOk > readyStockToDispatch) {
          toast.error(`Qty OK for ${part.partNumber} (${status}) cannot exceed available ready stock (${readyStockToDispatch}).`);
          return;
        }

        if (qtyNg < 0) {
          toast.error(`Qty NG for ${part.partNumber} (${status}) cannot be negative for Outgoing transactions.`);
          return;
        }
        if (qtyNg > 0) { // Dispatching NG items
          const ngStockToDispatch = status === 'Fresh' ? currentPartSystemData.ngFreshStock : currentPartSystemData.ngReplatingStock;
          if (qtyNg > ngStockToDispatch) {
            toast.error(`Qty NG for ${part.partNumber} (${status}) to dispatch cannot exceed available NG stock (${ngStockToDispatch}).`);
            return;
          }
        }
      }
    }

    const confirm = await Swal.fire({
      title: 'Confirm Submission',
      html: `
        <p>Are you sure the data entered is correct?</p>
        <br>
        <p><strong>Date:</strong> ${transactionDate.toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${status}</p>
        <p><strong>Type:</strong> ${
          value === 0 ? 'Incoming' : value === 1 ? 'Process' : 'Outgoing'
        }</p>
        <p><strong>Delivery Note:</strong> ${deliveryNote}</p>
        <p><strong>Parts:</strong></p>
        ${partList
          .map(
            (part) => `
            <p>${part.partNumber} | Qty OK: ${part.qtyOk} | Qty NG: ${
              part.qtyNg || 0
            }</p>
          `
          )
          .join('')}
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#dc2626',
      confirmButtonText: 'Yes, Submit!',
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      const transactions = partList.map((part) => {
        const transactionDateTime = new Date(transactionDate);
        const now = new Date();
        transactionDateTime.setHours(
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
        );

        const actualTransactionDate = `${transactionDateTime.getFullYear()}-${String(transactionDateTime.getMonth() + 1).padStart(2, '0')}-${String(transactionDateTime.getDate()).padStart(2, '0')}`;
        const actualTransactionTime = `${String(transactionDateTime.getHours()).padStart(2, '0')}:${String(transactionDateTime.getMinutes()).padStart(2, '0')}:${String(transactionDateTime.getSeconds()).padStart(2, '0')}`;

        return {
          actual_transaction_date: actualTransactionDate,
          actual_transaction_time: actualTransactionTime,
          transaction_type: value === 0 ? 'Incoming' : value === 1 ? 'Process' : 'Outgoing',
          status: status,
          delivery_note: deliveryNote || null,
          item_code: part.partNumber,
          qty_ok: parseInt(part.qtyOk || '0', 10),
          qty_ng: parseInt(part.qtyNg || '0', 10),
        };
      });

      const response = await fetch(API_Create_Transaction_Subcont(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: transactions }),
      });

      const result = await response.json();

      if (!result.status) {
        if (Array.isArray(result.error)) {
          // Show each error message as a separate toast
          result.error.forEach((errorMsg: string) => {
            toast.error(errorMsg);
          });
        } else {
          console.error(result);
          toast.error(result.message || 'Error submitting data');
        }
        return;
      }

      toast.success(result.message || 'Data submitted successfully!');

      // Reset form
      setPartList([]);
      setStatus('');
      setDeliveryNote('');
      setTransactionDate(new Date());
    } catch (error) {
      toast.error('Error submitting data');
      console.error(error);
    }
  };

  
  useEffect(() => {
    // For incoming and outgoing, need status and delivery note
    if ((value === 0 || value === 2) && status && deliveryNote) {
      setIsTemplateDownloadable(true);
    } 
    // For process, only need status
    else if (value === 1 && status) {
      setIsTemplateDownloadable(true);
    } else {
      setIsTemplateDownloadable(false);
    }
  }, [value, status, deliveryNote]);

  const generateExcelTemplate = () => {
    // Create data for Excel template
    const worksheetData = [
      [
        'actual_transaction_date',
        'actual_transaction_time',
        'status',
        'delivery_note',
        'item_code',
        'item_name',
        'old_part_name',
        'qty_ok',
        'qty_ng',
        'transaction_type'
      ]
    ];

      // Get current date and time strings
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Add item data rows
    apiData.forEach(item => {
      worksheetData.push([
        dateStr, // actual_transaction_date
        timeStr, // actual_transaction_time
        status, // status
        deliveryNote || '', // delivery_note
        item.partNumber, // item_code
        item.partName, // item_name
        item.oldPartName, // old_part_name
        '', // qty_ok - user will fill this
        '0', // qty_ng - default to 0
        value === 0 ? 'Incoming' : value === 1 ? 'Process' : 'Outgoing' // transaction_type
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Set column widths
    const colWidths = [
      { wch: 20 }, // actual_transaction_date
      { wch: 15 }, // actual_transaction_time
      { wch: 10 }, // status
      { wch: 15 }, // delivery_note
      { wch: 30 }, // item_code
      { wch: 30 }, // item_name
      { wch: 30 }, // old_part_name
      { wch: 8 }, // qty_ok
      { wch: 8 }, // qty_ng
      { wch: 12 } // transaction_type
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Transaction Template');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    
    // Download file
    const fileName = `${value === 0 ? 'Incoming' : value === 1 ? 'Process' : 'Outgoing'}_${status}_Template.xlsx`;
    saveAs(fileData, fileName);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const binaryStr = evt.target?.result;
        const wb = XLSX.read(binaryStr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert sheet to JSON
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        // Skip header row
        const rows = data.slice(1) as any[];
        
        // Map rows to part objects
        const newPartList: any[] = [];
        
        rows.forEach((row: any) => {
          if (row.length < 8) return; // Skip incomplete rows
          
          const partNumber = row[4]; // item_code
          const partName = row[5]; // item_name
          const oldPartName = row[6]; // old_part_name
          const qtyOk = row[7] ? row[7].toString() : ''; // qty_ok
          const qtyNg = row[8] ? row[8].toString() : '0'; // qty_ng
          
          // Skip rows without part numbers or quantities
          if (!partNumber || qtyOk === '') return;
          
          // Find part data in apiData
          const partData = apiData.find(item => item.partNumber === partNumber);
          if (!partData) return;
          
          // Determine current stock based on current tab and status
          let currentStock = 0;
          let currentNgStock = 0;
          
          if (value === 2) {
            currentStock = status === 'Fresh' ? partData.readyFreshStock : partData.readyReplatingStock;
            currentNgStock = status === 'Fresh' ? partData.ngFreshStock : partData.ngReplatingStock;
          } else if (value === 1) {
            currentStock = status === 'Fresh' ? partData.incomingFreshStock : partData.incomingReplatingStock;
            currentNgStock = status === 'Fresh' ? partData.ngFreshStock : partData.ngReplatingStock;
          }
          
          // Add to new part list
          newPartList.push({
            partNumber,
            partName,
            oldPartName: oldPartName || '-',
            qtyOk,
            qtyNg,
            currentStock,
            currentNgStock
          });
        });
        
        // Update part list
        setPartList(newPartList);
        toast.success(`Imported ${newPartList.length} parts from Excel`);
        
      } catch (error) {
        console.error('Error parsing Excel:', error);
        toast.error('Error parsing Excel file. Please check the format.');
      }
      
      // Reset the file input
      e.target.value = '';
    };
    
    reader.readAsBinaryString(file);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Transactions" />
      <div className="mx-auto space-y-6">
        <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
          <Tabs value={value} onChange={handleChange} centered>
            <Tab label="Record Incoming" />
            <Tab label="Record Finish Process" />
            <Tab label="Record Outgoing" />
          </Tabs>
          <div className="rounded-sm border-t-2 border-stroke bg-white">
            <div className="max-w-[1224px] mx-auto">
              {(value === 0 || value === 1 || value === 2) && (
                <div className="p-4 md:p-6.5 gap-4">
                  {/* Date Picker */}
                  <div className="mb-4">
                    <DatePicker
                      id="transactionDate"
                      value={transactionDate}
                      onChange={(date: Date) => date && setTransactionDate(date)}
                      className="w-full rounded border border-stroke py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary"
                      placeholder='Select Date'
                      label='Date'
                    />
                  </div>
                  {/* Status Selection */}
                  {(value === 0 || value === 1 || value === 2) && (
                    <div className="mb-4">
                      <label className="mb-2 block text-black">
                        Status <span className="text-meta-1">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full rounded border border-stroke py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Fresh">Fresh</option>
                        <option value="Replating">Replating</option>
                      </select>
                    </div>
                  )}
                  {/* Delivery Note Input */}
                  {(value === 0 || value === 2) && (
                    <div className="mb-4">
                      <label className="mb-2 block text-black">
                        Delivery Note <span className="text-meta-1">*</span>
                      </label>                      
                      <input
                        type="text"
                        value={deliveryNote}
                        onChange={handleDeliveryNoteChange}
                        placeholder="Enter Delivery Note (letters and numbers only)"
                        className="w-full rounded border border-stroke py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary"
                        required
                      />
                    </div>
                  )}
                  {/* Part List Selection */}
                  <div className="mb-4">
                    <label className="mb-2 block text-black">
                      Part List <span className="text-meta-1">*</span>
                    </label>
                    <Select
                      options={partOptions}
                      value={selectedPart}
                      onChange={handlePartChange}
                      placeholder="Select Part Number"
                      className="w-full"
                      isClearable
                    />
                  </div>
                  <div className='justify-between flex items-center mb-4'>
                    <Button
                      title="Add Part"
                      onClick={handleAddPart}
                      icon={FaPlus}
                    />

                    <div className="flex flex-col md:flex-row gap-2">
                      <div className="relative flex items-center gap-2">
                        <div className="group relative">
                          <div className="text-yellow-500 cursor-help">
                            <FaExclamationCircle size={20} />
                          </div>
                          <div className="absolute z-10 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 right-0 w-64 md:w-72">
                            <p className="font-bold mb-1">Requirements :</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Complete the required {(value === 0 || value === 2) ? "Status and Delivery Note" : "Status"} fields before downloading the template</li>
                              <li>In the template, only modify the Qty OK and Qty NG columns</li>
                              <li>If you need to change transaction details, update the form fields and download a new template</li>
                              <li>For items not included in your transaction, leave the Qty OK field blank</li>
                              <li>The system will ignore rows with empty Qty OK values</li>
                              <li>Always review the preview after upload to confirm data accuracy before submission</li>
                            </ul>
                          </div>
                        </div>
                        <Button
                          title="Download Template"
                          onClick={generateExcelTemplate}
                          icon={FaDownload}
                          disabled={!isTemplateDownloadable}
                          className={`${!isTemplateDownloadable ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                      </div>
                      
                      <div className="relative">
                      <Button
                        title="Upload Excel"
                        icon={FaUpload}
                        onClick={() => document.getElementById('excel-upload')?.click()}
                      />
                      <input
                        type="file"
                        id="excel-upload"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                      />
                      </div>
                    </div>
                  </div>

                  {/* Preview List */}
                  {partList.length > 0 && (
                    <div className="mt-6 overflow-auto">
                      <table className="w-full text-sm text-center">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[17%]">
                              PART NUMBER
                            </th>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[17%]">
                              PART NAME
                            </th>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[16%]">
                              OLD PART NAME
                            </th>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[10%]">
                              QTY OK
                            </th>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[10%]">
                              QTY NG
                            </th>
                            <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[10%]">
                              ACTION
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {partList.map((part, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-center border">{part.partNumber}</td>
                              <td className="px-3 py-3 text-center border">{part.partName}</td>
                              <td className="px-3 py-3 text-center border">{part.oldPartName}</td>
                              <td className="px-3 py-3 text-center border">
                                <input
                                  type="number"
                                  value={part.qtyOk}
                                  onChange={(e) => handlePartListChange(index, 'qtyOk', e.target.value)}
                                  className="border border-gray-300 rounded p-1 w-full"
                                />
                                {(value === 1 ||value === 2) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Stock: {part.currentStock}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center border">
                                <input
                                  type="number"
                                  value={part.qtyNg}
                                  onFocus={(e) => { if (e.target.value === '0') e.target.value = '' }}
                                  onBlur={(e) => { if (e.target.value === '') e.target.value = '0' }}
                                  onChange={(e) => handlePartListChange(index, 'qtyNg', e.target.value)}
                                  className="border border-gray-300 rounded p-1 w-full"
                                />
                                {(value === 1 || value === 2) && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Stock: {part.currentNgStock}
                                  </p>
                                )}
                              </td>
                              <td className="px-3 py-3 text-center border">
                                <button
                                  onClick={() => handleDeletePart(index)}
                                  className="bg-red-600 text-white px-2 py-1 rounded"
                                >
                                Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <Button
                        title="Submit"
                        onClick={handleSubmit}
                        className="mt-4 w-full font-medium"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Box>
      </div>
    </>
  );
};

export default Transactions;