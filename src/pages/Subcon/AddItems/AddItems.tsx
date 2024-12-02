import { useEffect, useState } from 'react';
import Select from 'react-select';
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_Item_Subcont_Admin, API_List_Partner_Admin } from '../../../api/api';
import Swal from 'sweetalert2';

export const AddItems = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [partName, setPartName] = useState('');
    const [partNumber, setPartNumber] = useState('');

    useEffect(() => {
        fetchSuppliers();
    }, []);

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
            <p><strong>Part Name:</strong> ${partName}</p>
            <p><strong>Part Number:</strong> ${partNumber}</p>
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

            const itemData = {
                bp_code: selectedSupplier.value,
                part_name: partName,
                part_number: partNumber,
            };

            const response = await fetch(API_Create_Item_Subcont_Admin(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(itemData)
            });

            if (!response.ok) throw new Error('Failed to submit');

            toast.success('Item added successfully');
            
            // Clear form
            setSelectedSupplier(null);
            setPartName('');
            setPartNumber('');
            
        } catch (error) {
            toast.error('Failed to add item');
            console.error(error);
        }
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="Add Items" />
            <div className='mx-auto p-2 md:p-4 lg:p-6 space-y-6'>
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
                        <div className="p-4 md:p-6.5">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Supplier Selection */}
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Supplier <span className="text-meta-1">*</span>
                                    </label>
                                    <Select
                                        options={suppliers}
                                        value={selectedSupplier}
                                        onChange={setSelectedSupplier}
                                        placeholder="Select Supplier"
                                        className="w-full"
                                        isClearable
                                        required
                                    />
                                </div>

                                {/* Part Name Input */}
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Part Name <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={partName}
                                        onChange={(e) => setPartName(e.target.value)}
                                        placeholder="Enter Part Name"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        required
                                    />
                                </div>

                                {/* Part Number Input */}
                                <div className="mb-4.5">
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Part Number <span className="text-meta-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={partNumber}
                                        onChange={(e) => setPartNumber(e.target.value)}
                                        placeholder="Enter Part Number"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        required
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
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddItems;