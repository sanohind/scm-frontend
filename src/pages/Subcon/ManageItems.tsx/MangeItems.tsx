import React, { useState, useEffect, ChangeEvent } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
// import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaToggleOn, FaToggleOff } from 'react-icons/fa';
// import {
//     API_List_Partner_Admin,
//     API_List_Item_Subcont_Admin,
//     API_Update_Item_Subcont_Admin,
//     API_Update_Item_Status_Subcont_Admin,
//     API_Delete_Item_Subcont_Admin,
// } from '../../../api/api';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';

interface SupplierOption {
    value: string;
    label: string;
}

interface Item {
    item_id: string;
    item_code: string;
    item_name: string;
    status: string;
    isEditing?: boolean;
    isLoading?: boolean;
    editedItemCode?: string;
    editedItemName?: string;
}

const ManageItems: React.FC = () => {
    const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierOption | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const dummySuppliers: SupplierOption[] = [
        { value: 'SUP001', label: 'SUP001 | Supplier One' },
        { value: 'SUP002', label: 'SUP002 | Supplier Two' },
        { value: 'SUP003', label: 'SUP003 | Supplier Three' },
      ];

    const dummyItems: Item[] = [
        {
            item_id: 'ITEM001',
            item_code: 'P001',
            item_name: 'Part One',
            status: 'Active',
        },
        {
            item_id: 'ITEM002',
            item_code: 'P002',
            item_name: 'Part Two',
            status: 'Deactive',
        },
        {
            item_id: 'ITEM003',
            item_code: 'P003',
            item_name: 'Part Three',
            status: 'Active',
        },
    ];

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const savedSupplierCode = localStorage.getItem('selected_supplier');
            if (savedSupplierCode && suppliers.length > 0) {
                const savedSupplier = suppliers.find(
                    (sup: SupplierOption) => sup.value === savedSupplierCode
            );
            if (savedSupplier) {
                setSelectedSupplier(savedSupplier);
                fetchItems(savedSupplier.value);
            }
        }
    }, [suppliers]);

    const fetchSuppliers = async () => {
        // const token = localStorage.getItem('access_token');
        // try {
        // const response = await fetch(API_List_Partner_Admin(), {
        //     method: 'GET',
        //     headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) throw new Error('Failed to fetch suppliers');

        // const result = await response.json();
        // const suppliersList = result.data.map((supplier: any) => ({
        //     value: supplier.bp_code,
        //     label: `${supplier.bp_code} | ${supplier.bp_name}`,
        // }));

        // setSuppliers(suppliersList);
        // } catch (error) {
        // console.error('Error fetching suppliers:', error);
        // toast.error('Failed to fetch suppliers list');
        // }
        setSuppliers(dummySuppliers);
    };

    const fetchItems = async (supplierCode: string) => {
        // const token = localStorage.getItem('access_token');
        // setLoading(true);
        // try {
        // const response = await fetch(`${API_List_Item_Subcont_Admin()}${supplierCode}`, {
        //     method: 'GET',
        //     headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) throw new Error('Failed to fetch items');

        // const result = await response.json();
        // const itemsList = result.data.map((item: any) => ({
        //     item_id: item.item_id,
        //     item_code: item.part_number,
        //     item_name: item.part_name,
        //     status: item.status === 1 ? 'Active' : 'Deactive',
        // }));

        // setItems(itemsList);
        // setLoading(false);
        // } catch (error) {
        // console.error('Error fetching items:', error);
        // toast.error('Failed to fetch items');
        // setLoading(false);
        // }
        setItems(dummyItems);
        setLoading(false);
    };

    const handleSupplierChange = (selectedOption: SupplierOption | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            fetchItems(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            setItems([]);
        }
    };

    const handleEdit = (itemId: string) => {
        setItems((prevItems) =>
        prevItems.map((item) =>
            item.item_id === itemId
            ? {
                ...item,
                isEditing: true,
                editedItemCode: item.item_code,
                editedItemName: item.item_name,
                }
            : item
        )
        );
    };

    const handleCancel = (itemId: string) => {
        setItems((prevItems) =>
        prevItems.map((item) => (item.item_id === itemId ? { ...item, isEditing: false } : item))
        );
    };

    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement>,
        itemId: string,
        field: 'item_code' | 'item_name'
    ) => {
        const value = e.target.value;
        setItems((prevItems) =>
        prevItems.map((item) => (item.item_id === itemId ? { ...item, [field]: value } : item))
        );
    };

    const handleSubmit = async (itemId: string) => {
        // const token = localStorage.getItem('access_token');
        // const item = items.find((item) => item.item_id === itemId);
        // if (!item) return;

        // try {
        // const response = await fetch(`${API_Update_Item_Admin()}${itemId}`, {
        //     method: 'PUT',
        //     headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //     item_code: item.item_code,
        //     item_name: item.item_name,
        //     }),
        // });

        // if (!response.ok) throw new Error('Failed to update item');

        // toast.success('Item updated successfully');
        // setItems((prevItems) =>
        //     prevItems.map((itm) =>
        //     itm.item_id === itemId ? { ...itm, isEditing: false } : itm
        //     )
        // );
        // } catch (error) {
        // console.error('Error updating item:', error);
        // toast.error('Failed to update item');
        // }

        setItems((prevItems) =>
            prevItems.map((item) =>
                item.item_id === itemId ? { ...item, isEditing: false } : item
            )
        );
        toast.success('Item updated successfully');
    };

    const handleStatusChange = async (itemId: string, status: string) => {
        // const token = localStorage.getItem('access_token');
        // const newStatus = status === 'Active' ? '0' : '1';
        // try {
        // const response = await fetch(`${API_Update_Item_Status_Admin()}${itemId}`, {
        //     method: 'PUT',
        //     headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //     status: newStatus,
        //     }),
        // });

        // if (!response.ok) throw new Error('Failed to update status');

        // toast.success('Status updated successfully');
        // setItems((prevItems) =>
        //     prevItems.map((item) =>
        //     item.item_id === itemId
        //         ? { ...item, status: newStatus === '1' ? 'Active' : 'Deactive' }
        //         : item
        //     )
        // );
        // } catch (error) {
        // console.error('Error updating status:', error);
        // toast.error('Failed to update status');
        // }
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.item_id === itemId
                    ? { ...item, status: status === 'Active' ? 'Deactive' : 'Active' }
                    : item
            )
        );

        setLoading(false);
    };

    const handleDelete = async (itemId: string) => {
        // const confirm = await Swal.fire({
        // title: 'Are you sure?',
        // text: 'This item will be deleted permanently!',
        // icon: 'warning',
        // showCancelButton: true,
        // confirmButtonColor: '#1e3a8a',
        // cancelButtonColor: '#d33',
        // confirmButtonText: 'Yes, delete it!',
        // });

        // if (!confirm.isConfirmed) return;

        // const token = localStorage.getItem('access_token');
        // try {
        // const response = await fetch(`${API_Delete_Item_Admin()}${itemId}`, {
        //     method: 'DELETE',
        //     headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'application/json',
        //     },
        // });

        // if (!response.ok) throw new Error('Failed to delete item');

        // toast.success('Item deleted successfully');
        // setItems((prevItems) => prevItems.filter((item) => item.item_id !== itemId));
        // } catch (error) {
        // console.error('Error deleting item:', error);
        // toast.error('Failed to delete item');
        // }

        setItems((prevItems) => prevItems.filter((item) => item.item_id !== itemId));
    };

    return (
        <>
        <Breadcrumb pageName='Manage Items' />
        <ToastContainer position="top-right" />
        {/* Breadcrumb component if you have one */}
        <div className="bg-white">
            <div className="p-2 md:p-4 lg:p-6 space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/add-items')}
                    className="bg-blue-900 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                <FaPlus />
                    Add Items
                </button>
            </div>

            {/* Supplier Selection */}
            <div className='w-full md:w-1/3'>
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

            {/* Items Table */}
            {loading ? (
                <p>Loading items...</p>
            ) : (
                items.length > 0 ? (
                <div className="relative overflow-auto shadow-md rounded-lg border border-gray-300">
                    <table className="w-full text-sm ">
                        <thead className="bg-gray-50 text-center font-bold">
                            <tr>
                                <th className="px-1 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">
                                    NO
                                </th>
                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[30%]">
                                    PART NUMBER
                                </th>
                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[30%]">
                                    PART NAME
                                </th>
                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[15%]">
                                    STATUS
                                </th>
                                <th className="px-3 py-3.5 text-sm font-bold text-gray-700 border w-[20%]">
                                    ACTION
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {items.map((item, index) => (
                                <tr key={item.item_id} className="hover:bg-gray-50">
                                    <td className="px-3 py-3 text-center border">
                                        {index + 1}
                                    </td>
                                    <td className="px-3 py-3 text-center border">
                                        {item.isEditing ? (
                                            <input
                                                type="text"
                                                value={item.item_code}
                                                onChange={(e) => handleInputChange(e, item.item_id, 'item_code')}
                                                className="border border-gray-300 rounded p-1 w-full"
                                            />
                                        ) : (
                                            item.item_code
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-center border">
                                        {item.isEditing ? (
                                            <input
                                                type="text"
                                                value={item.item_name}
                                                onChange={(e) => handleInputChange(e, item.item_id, 'item_name')}
                                                className="border border-gray-300 rounded p-1 w-full"
                                            />
                                        ) : (
                                            item.item_name
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-center whitespace-nowrap border">
                                        {item.isLoading ? (
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900">
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    const updatedItems = items.map(i =>
                                                        i.item_id === item.item_id ? { ...i, isLoading: true } : i
                                                    );
                                                    setItems(updatedItems);
                                                    await handleStatusChange(item.item_id, item.status);
                                                }}
                                                className="hover:opacity-80 transition-opacity"
                                            >
                                                {item.status === 'Active' ?
                                                    <FaToggleOn className="text-3xl text-blue-900" /> :
                                                    <FaToggleOff className="text-3xl text-gray-400" />
                                                }
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-center border">
                                    {item.isEditing ? (
                                        <>
                                            <button
                                                onClick={() => handleSubmit(item.item_id)}
                                                className="bg-blue-900 text-white px-2 py-1 rounded mr-2"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                onClick={() => handleCancel(item.item_id)}
                                                className="bg-red-500 text-white px-2 py-1 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex justify-center gap-4">
                                            <button
                                                onClick={() => handleEdit(item.item_id)}
                                                className="hover:opacity-80 transition-opacity"
                                                >
                                                <FaEdit className='text-2xl text-blue-900' />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.item_id)}
                                                className="hover:opacity-80 transition-opacity"
                                                >
                                                <FaTrash className='text-2xl text-red-900'/>
                                            </button>
                                        </div>
                                    )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                selectedSupplier && <p>No items found for this supplier.</p>
                )
            )}
            </div>
        </div>
        </>
    );
};

export default ManageItems;