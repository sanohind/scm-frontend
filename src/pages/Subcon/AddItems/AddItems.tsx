import { useEffect, useState, ChangeEvent, useRef } from 'react';
import Select from 'react-select';
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_Item_Subcont_Admin,  API_Initial_Stock_Subcont_Admin,  API_List_Item_ERP_Subcont_Admin,  API_List_Partner_Admin } from '../../../api/api';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaDownload, FaPlus, FaTimes, FaUpload } from 'react-icons/fa';
import Button from '../../../components/Forms/Button';

interface SupplierOption {
    value: string;
    label: string;
}

interface ItemOption {
    value: string;
    label: string;
}

export const AddItems = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [partName, setPartName] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [oldPartName, setOldPartName] = useState('');
    const [excelData, setExcelData] = useState<any[]>([]);
    const [isExcelMode, setIsExcelMode] = useState(false);
    const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
    const [isInitialStockMode, setIsInitialStockMode] = useState(false);
    const [initialStockExcelData, setInitialStockExcelData] = useState<any[]>([]);


    const fileInputRef = useRef<HTMLInputElement>(null); // Menambahkan useRef

    useEffect(() => {
        fetchSuppliers();
        fetchItems();
    }, []);

    useEffect(() => {
        const savedSupplierCode = localStorage.getItem('selected_supplier');
            if (savedSupplierCode && suppliers.length > 0) {
                const savedSupplier = suppliers.find(
                    (sup: SupplierOption) => sup.value === savedSupplierCode
            );
            if (savedSupplier) {
                setSelectedSupplier(savedSupplier);
            }
        }
    }, [suppliers]);

    const handleSupplierChange = (selectedOption: SupplierOption | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
        }
    };

    const fetchSuppliers = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(API_List_Partner_Admin(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch suppliers');

            const result = await response.json();
            const suppliersList = result.data.map((supplier: any) => ({
                value: supplier.bp_code,
                label: `${supplier.bp_code} | ${supplier.bp_name}`,
            }));

            setSuppliers(suppliersList);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            toast.error('Failed to fetch suppliers list');
        }
    };

    const fetchItems = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(API_List_Item_ERP_Subcont_Admin(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch items');

            const result = await response.json();
            const itemsList = result.data.map((item: any) => ({
                value: item.part_number,
                label: `${item.part_number || '-'} | ${item.part_name || '-'} | ${item.old_part_name || '-'}`,
            }));

            setItemOptions(itemsList);
        } catch (error) {
            console.error('Error fetching items:', error);
            toast.error('Failed to fetch items list');
        }
    };

    const downloadTemplate = () => {
        const ws = XLSX.utils.json_to_sheet([
            { bp_code: ' ', part_number: ' ', part_name: ' ', old_part_name: ' ' }
        ]);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 },  // bp_code width
            { wch: 20 },  // item_code width
            { wch: 30 },   // item_name width
            { wch: 30 }   // item_name width
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'item_template.xlsx');
    };
    const downloadTemplateInitialStock = () => {
        const ws = XLSX.utils.json_to_sheet([
            { bp_code: ' ', part_number: ' ', fresh_unprocess_incoming_items: ' ', fresh_ready_delivery_items: ' ', fresh_ng_items: ' ', replating_unprocess_incoming_items: ' ', replating_ready_delivery_items: ' ', replating_ng_items: ' ' }
        ]);

        // Set column widths
        ws['!cols'] = [
            { wch: 15 },  // bp_code width
            { wch: 20 },  // item_code width
            { wch: 20 },  // fresh_unprocess_incoming_items
            { wch: 20 },  // fresh_ready_delivery_items
            { wch: 20 },  // fresh_ng_items
            { wch: 20 },  // replating_unprocess_incoming_items
            { wch: 20 },  // replating_ready_delivery_items
            { wch: 20 }   // replating_ng_items
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'initial_stock_template.xlsx');
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (evt.target) {
                    const bstr = evt.target.result;
                    const wb = XLSX.read(bstr, { type: 'binary' });
                    const wsname = wb.SheetNames[0];
                    const ws = wb.Sheets[wsname];
                    const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
                    setExcelData(data);
                }
            };
            reader.readAsBinaryString(file);
    
            // Hapus atau komentar kode berikut:
            // if (fileInputRef.current) {
            //     fileInputRef.current.value = '';
            // }
        }
    };

    const handleInitialFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                if (evt.target) {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
                setInitialStockExcelData(data);
                }
            };
            reader.readAsBinaryString(file);
        }
      };

    const handleExcelSubmit = async () => {
        if (excelData.length === 0) {
            toast.error('No data to submit');
            return;
        }

        const confirm = await Swal.fire({
            title: 'Confirm Submission',
            html: `<p>Are you sure you want to submit ${excelData.length} items?</p>`,
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

            const submissionData = {
                data: excelData.map(item => ({
                    bp_code: item.bp_code,
                    part_number: String(item.part_number),
                    part_name: item.part_name,
                    old_part_name: item.old_part_name
                }))
            };

            const response = await fetch(API_Create_Item_Subcont_Admin(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });

            if (!response.ok) throw new Error('Failed to submit');

            toast.success('Items added successfully');

            // Clear excel data
            setExcelData([]);
            setIsExcelMode(false);

        } catch (error) {
            toast.error('Failed to add items');
            console.error(error);
        }
    };



    const handleExcelDataChange = (index: number, field: string, value: string) => {
        const updatedData = [...excelData];
        const fieldMap: {[key: string]: string} = {
            'bp_code': 'bp_code',
            'part_number': 'part_number', // Changed from item_code
            'part_name': 'part_name',     // Changed from item_name  
            'old_part_name': 'old_part_name' // Changed from old_item_name
        };
        updatedData[index][fieldMap[field] || field] = value;
        setExcelData(updatedData);
    };

    const handleInitialDataChange = (index: number, field: string, value: string) => {
        const updatedData = [...initialStockExcelData];
        updatedData[index][field] = value;
        setInitialStockExcelData(updatedData);
    };

    const handleExcelItemDelete = (index: number) => {
        const updatedData = excelData.filter((_, i) => i !== index);
        setExcelData(updatedData);
    
        // Reset input file if no data
        if (updatedData.length === 0 && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleInitialItemDelete = (index: number) => {
        const updatedData = initialStockExcelData.filter((_, i) => i !== index);
        setInitialStockExcelData(updatedData);
    };

    const handleAddExcelItem = () => {
        setExcelData([...excelData, { bp_code: '', part_number: '', part_name: '', old_part_name: '' }]);
    };

    const handleAddInitialStockItem = () => {
        setInitialStockExcelData([
            ...initialStockExcelData,
            {
                bp_code: '',
                part_number: '',
                fresh_unprocess_incoming_items: '',
                fresh_ready_delivery_items: '',
                fresh_ng_items: '',
                replating_unprocess_incoming_items: '',
                replating_ready_delivery_items: '',
                replating_ng_items: ''
            }
        ]);
    };

    const handlePartNumberChange = (selectedOption: ItemOption | null) => {
        if (selectedOption) {
            const [partNumber, partName, oldPartName] = selectedOption.label.split(' | ');
            setPartNumber(partNumber);
            setPartName(partName);
            setOldPartName(oldPartName);
        } else {
            setPartNumber('');
            setPartName('');
            setOldPartName('');
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    
        if (!selectedSupplier) {
            toast.error('Please select a supplier');
            return;
        }
    
        const confirm = await Swal.fire({
            title: 'Confirm Submission',
            html: `
            <p>Are you sure the data entered is correct?</p>
            <br>
            <p><strong>Supplier:</strong> ${selectedSupplier.label}</p>
            <p><strong>Part Number:</strong> ${partNumber}</p>
            <p><strong>Part Name:</strong> ${partName}</p>
            <p><strong>Old Part Name:</strong> ${oldPartName}</p>
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
    
            const submissionData = {
                data: [{
                    bp_code: selectedSupplier.value,
                    part_number: partNumber,
                    part_name: partName,
                    old_part_name: oldPartName
                }]
            };
    
            const response = await fetch(API_Create_Item_Subcont_Admin(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submissionData)
            });
    
            if (!response.ok) throw new Error('Failed to submit');
    
            toast.success('Item added successfully');
            
            // Clear form fields
            setSelectedSupplier(null);
            setPartName('');
            setPartNumber('');
            setOldPartName('');
            
        } catch (error) {
            toast.error('Failed to add item');
            console.error(error);
        }
    };

    const handleInitialStockSubmit = async () => {
        if (initialStockExcelData.length === 0) {
            toast.error('No data to submit');
            return;
        }
        const confirm = await Swal.fire({
            title: 'Confirm Submission',
            html: `<p>Are you sure you want to submit ${initialStockExcelData.length} items?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#1e3a8a',
            cancelButtonColor: '#dc2626',
            confirmButtonText: 'Yes, Submit It!'
        });
        if (!confirm.isConfirmed) return;
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                toast.error('Authentication token not found');
                return;
            }
            const submissionData = {
                data: initialStockExcelData.map(item => ({
                    bp_code: item.bp_code.trim(),
                    part_number: String(item.part_number).trim(),
                    fresh_unprocess_incoming_items: item.fresh_unprocess_incoming_items,
                    fresh_ready_delivery_items: item.fresh_ready_delivery_items,
                    fresh_ng_items: item.fresh_ng_items,
                    replating_unprocess_incoming_items: item.replating_unprocess_incoming_items,
                    replating_ready_delivery_items: item.replating_ready_delivery_items,
                    replating_ng_items: item.replating_ng_items
                }))
            };
            const response = await fetch(API_Initial_Stock_Subcont_Admin(), {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(submissionData),
            });
            if (!response.ok) throw new Error('Failed to submit');
            toast.success('Initial stocks added successfully');
            setInitialStockExcelData([]);
            setIsInitialStockMode(false);
        } catch (error) {
            toast.error('Failed to add initial stocks');
            console.error(error);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="Add Items" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-2 md:p-4 lg:p-6 space-y-6">
                {!isExcelMode && !isInitialStockMode ? (
                    <>
                        <div className="flex justify-end">
                            <Button
                                title="Upload via Excel"
                                onClick={() => setIsExcelMode(true)}
                                icon={FaUpload}
                            />
                            <Button
                                title="Initialize Stock"
                                onClick={() => setIsInitialStockMode(true)}
                                icon={FaUpload}
                                className="ml-2"
                            />
                        </div>
                        <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Supplier Selection */}
                                <div>
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Supplier <span className="text-meta-1">*</span>
                                    </label>
                                    <Select
                                        options={suppliers}
                                        value={selectedSupplier}
                                        onChange={handleSupplierChange}
                                        placeholder="Select Supplier"
                                        className="w-full"
                                        isClearable
                                        required
                                    />
                                </div>

                                {/* Part Number Input */}
                                <div>
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Part Number <span className="text-meta-1">*</span>
                                    </label>
                                    <Select
                                        options={itemOptions}
                                        value={itemOptions.find(option => option.value === partNumber)}
                                        onChange={handlePartNumberChange}
                                        placeholder="Select Part Number"
                                        className="w-full"
                                        isClearable
                                        required
                                    />
                                </div>

                                {/* Part Name Input */}
                                <div>
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Part Name <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={partName}
                                        onChange={(e) => setPartName(e.target.value)}
                                        placeholder="Enter Part Name"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary"
                                        required
                                    />
                                </div>

                                {/* Old Part Name Input */}
                                <div>
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Old Part Name
                                    </label>
                                    <input
                                        type="text"
                                        value={oldPartName}
                                        onChange={(e) => setOldPartName(e.target.value)}
                                        placeholder="Enter Old Part Name"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button 
                                    type="submit"
                                    className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90">
                                    Submit
                                </button>
                            </div>
                        </form>
                    </>
                ) : isExcelMode ? (
                    <>
                        <div className="flex justify-end">
                            <Button
                                title="Cancel"
                                onClick={() => setIsExcelMode(false)}
                                icon={FaTimes}
                                color='bg-red-600'
                            />
                        </div>
                        <div className="max-w-[1024px] mx-auto space-y-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    title="Excel Template"
                                    onClick={downloadTemplate}
                                    icon={FaDownload}
                                />
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="text-sm cursor-pointer rounded-lg border-2 border-gray-300 bg-transparent outline-none transition file:mr-5 file:border-0 file:bg-blue-900 file:text-white file:py-2 file:px-4 file:rounded-md file:cursor-pointer hover:file:bg-blue-800 focus:border-primary active:border-primary"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                            </div>

                            {excelData.length > 0 && (
                                <>
                                    <h2 className="text-lg font-bold">Preview Items</h2>
                                    <Button
                                        title="Add Rows"
                                        onClick={handleAddExcelItem}
                                        icon={FaPlus}
                                    />
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider border">
                                                    Supplier Code
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider border">
                                                    Part Number
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider border">
                                                    Part Name
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider border">
                                                    Old Part Name
                                                </th>
                                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider border">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {excelData.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-3 py-3 text-center border">
                                                        <input
                                                            type="text"
                                                            value={item.bp_code}
                                                            onChange={(e) => handleExcelDataChange(index, 'bp_code', e.target.value)}
                                                            className="border border-gray-300 rounded p-1 text-center w-full"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-center border">
                                                        <input
                                                            type="text"
                                                            value={item.part_number}
                                                            onChange={(e) => handleExcelDataChange(index, 'part_number', e.target.value)}
                                                            className="border border-gray-300 rounded p-1 text-center w-full"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-center border">
                                                        <input
                                                            type="text"
                                                            value={item.part_name}
                                                            onChange={(e) => handleExcelDataChange(index, 'part_name', e.target.value)}
                                                            className="border border-gray-300 rounded p-1 text-center w-full"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-center border">
                                                        <input
                                                            type="text"
                                                            value={item.old_part_name}
                                                            onChange={(e) => handleExcelDataChange(index, 'old_part_name', e.target.value)}
                                                            className="border border-gray-300 rounded p-1 text-center w-full"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-center border">
                                                        <div className="flex justify-center">
                                                            <Button
                                                                title="Delete"
                                                                onClick={() => handleExcelItemDelete(index)}
                                                                className='text-xs py-[6px] px-[10px]'
                                                                color='bg-red-600'
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={handleExcelSubmit}
                                        className="mt-4 w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
                                    >
                                        Submit All Items
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <Button
                                title="Cancel"
                                onClick={() => {
                                    setIsInitialStockMode(false);
                                    setInitialStockExcelData([]);
                                }}
                                icon={FaTimes}
                                color='bg-red-600'
                            />
                        </div>
                        <div className="max-w-[1024px] mx-auto space-y-4">
                            <div className="flex items-center gap-4">
                                <Button
                                    title="Excel Template"
                                    onClick={downloadTemplateInitialStock}
                                    icon={FaDownload}
                                />
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="text-sm cursor-pointer rounded-lg border-2 border-gray-300 bg-transparent outline-none transition file:mr-5 file:border-0 file:bg-blue-900 file:text-white file:py-2 file:px-4 file:rounded-md file:cursor-pointer hover:file:bg-blue-800 focus:border-primary active:border-primary"
                                    onChange={handleInitialFileUpload}
                                />
                            </div>
                            {initialStockExcelData.length > 0 && (
                                <>
                                    <h2 className="text-lg font-bold">Preview Initial Stock</h2>
                                    <Button
                                        title="Add Rows"
                                        onClick={handleAddInitialStockItem}
                                        icon={FaPlus}
                                    />
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3.5 border">Supplier Code</th>
                                                <th className="px-3 py-3.5 border">Part Number</th>
                                                <th className="px-3 py-3.5 border">Fresh Unprocess</th>
                                                <th className="px-3 py-3.5 border">Fresh Ready</th>
                                                <th className="px-3 py-3.5 border">Fresh NG</th>
                                                <th className="px-3 py-3.5 border">Replating Unprocess</th>
                                                <th className="px-3 py-3.5 border">Replating Ready</th>
                                                <th className="px-3 py-3.5 border">Replating NG</th>
                                                <th className="px-3 py-3.5 border">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {initialStockExcelData.map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.bp_code}
                                                        onChange={(e) => handleInitialDataChange(index, 'bp_code', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.part_number}
                                                        onChange={(e) => handleInitialDataChange(index, 'part_number', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.fresh_unprocess_incoming_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'fresh_unprocess_incoming_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.fresh_ready_delivery_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'fresh_ready_delivery_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.fresh_ng_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'fresh_ng_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.replating_unprocess_incoming_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'replating_unprocess_incoming_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.replating_ready_delivery_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'replating_ready_delivery_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <input
                                                        type="text"
                                                        value={item.replating_ng_items}
                                                        onChange={(e) => handleInitialDataChange(index, 'replating_ng_items', e.target.value)}
                                                        className="border border-gray-300 rounded p-1 w-full"
                                                    />
                                                </td>
                                                <td className="px-3 py-3 border">
                                                    <Button
                                                        title="Delete"
                                                        onClick={() => handleInitialItemDelete(index)}
                                                        color='bg-red-600'
                                                    />
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <button
                                        onClick={handleInitialStockSubmit}
                                        className="mt-4 w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
                                        >
                                        Submit All Items
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default AddItems;