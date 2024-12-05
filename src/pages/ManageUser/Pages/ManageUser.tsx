import React, { useEffect, useState } from 'react';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../Table2/Pagination';
import SearchBar from '../../Table2/SearchBar';
import { FaSortDown, FaSortUp, FaToggleOff, FaToggleOn, FaUserEdit, FaUserPlus } from 'react-icons/fa';
import MultiSelect from '../../../components/Forms/MultiSelect';
import { toast, ToastContainer } from 'react-toastify';
import { API_List_User_Admin, API_Update_Status_Admin } from '../../../api/api';

interface User {
    UserID: string;
    SupplierCode: string;
    Username: string;
    Name: string;
    Role: string;
    Status: string;
    RoleCode: string;
    isLoading?: boolean;
}

interface Option {
    value: string;
    text: string;
}

const ManageUser: React.FC = () => {
    const [data, setData] = useState<User[]>([]);
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(7);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [roleOptions, setRoleOptions] = useState<Option[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchListUser();
        const savedPage = localStorage.getItem('list_user_current_page');
        if (savedPage) {
            setCurrentPage(parseInt(savedPage));
        }
    }, []);


    const fetchListUser = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            const response = await fetch(API_List_User_Admin(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const result = await response.json();
            const users = result.data.map((user: any) => ({
                UserID: user.user_id,
                SupplierCode: user.bp_code,
                Username: user.username,
                Name: user.name,
                Role: getRoleName(user.role),
                RoleCode: user.role,
                Status: user.status === 1 ? 'Active' : 'Deactive',
            }));

            setData(users);
            setFilteredData(users);
            setLoading(false);
            
            // Extract unique roles for MultiSelect options
            const uniqueRoles = Array.from(new Set(result.data.map((user: any) => user.role)))
            .map((role) => ({
                value: role as string,
                text: getRoleName(role as string),
            }));
            
            setRoleOptions(uniqueRoles);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error(`Fetch error: ${error}`);
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId: string, status: number, username: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const response = await toast.promise(
                fetch(`${API_Update_Status_Admin()}${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: status.toString() }),
                }),
                {
                    pending: {
                        render: `Updating status for "${username}"...`,
                        autoClose: 3000
                    },
                    success: {
                        render: `Status for "${username}" Successfully Updated to ${status === 1 ? 'Active' : 'Deactive'}`,
                        autoClose: 3000
                    },
                    error: {
                        render({data}) {
                            return `Failed to update status for "${username}": ${data}`;
                        },
                        autoClose: 3000
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            await response.json();
            await fetchListUser();
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        let filtered = [...data];
    
        if (selectedRoles.length > 0) {
            filtered = filtered.filter((row) => selectedRoles.includes(row.RoleCode));
        }
        
    
        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter((row) =>
            row.Username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.Name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
    
        // Apply sorting
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof User];
                const bValue = b[sortConfig.key as keyof User];
                
                if (!aValue || !bValue) return 0;
                
                if (sortConfig.key === 'Status') {
                    return sortConfig.direction === 'asc'
                        ? aValue.toString().localeCompare(bValue.toString())
                        : bValue.toString().localeCompare(aValue.toString());
                }
                
                return sortConfig.direction === 'asc'
                    ? aValue.toString().localeCompare(bValue.toString())
                    : bValue.toString().localeCompare(aValue.toString());
            });
        }
    
        setFilteredData(filtered);
    }, [searchQuery, selectedRoles, sortConfig, data]);

    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        localStorage.setItem('list_user_current_page', page.toString());
    };

    const handleSort = (key: keyof User) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getRoleName = (role: string) => {
        switch (role) {
            case '1':
                return 'Super Admin';
            case '2':
                return 'Admin Purchasing';
            case '3':
                return 'Admin Warehouse';
            case '4':
                return 'Admin Subcont';
            case '5':
                return 'Supplier Marketing';
            case '6':
                return 'Supplier Subcont Marketing';
            case '7':
                return 'Supplier Warehouse';
            case '8':
                return 'Supplier Subcont';
            default:
                return 'Unknown Role';
        }
    };

    const handleEditPage = (UserId: string) => {
        navigate(`/edit-user?userId=${UserId}`);
      };

    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="Manage User" />
            <div className="bg-white">
                <div className="p-2 md:p-4 lg:p-6 space-y-6">

                    {/* Header Section */}
                    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                        <div className='flex flex-col sm:flex-row gap-4 w-full lg:w-1/2'>
                            <button
                                onClick={() => navigate('/add-user')}
                                className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors whitespace-nowrap flex items-center justify-center"
                            >
                                <FaUserPlus className="mr-2" />
                                Add User
                            </button>

                            {/* Search Bar */}
                            <div className="w-full">
                                <SearchBar
                                    placeholder="Search user here..."
                                    onSearchChange={setSearchQuery}
                                />
                            </div>
                        </div>
                        
                        {/* Filters */}
                        <div className="w-full lg:w-1/3">
                            <MultiSelect
                                id="roleSelect"
                                label="Filter by Role"
                                options={roleOptions}
                                selectedOptions={selectedRoles}
                                onChange={setSelectedRoles}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w[20%]">Username</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w[10%]">Supplier Code</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w[25%]">Name</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[15%]">Role</th>
                                        <th
                                            className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[10%] cursor-pointer"
                                            onClick={() => handleSort('Status')}
                                        >
                                            <span className="flex items-center justify-center">
                                                {sortConfig.key === 'Status' ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <FaSortUp className="mr-1" />
                                                    ) : (
                                                        <FaSortDown className="mr-1" />
                                                    )
                                                ) : (
                                                    <FaSortDown className="opacity-50 mr-1" />
                                                )}
                                                Status
                                            </span>
                                        </th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[10%]">Action</th>
                                        <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[10%]">Edit User</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        Array.from({ length: rowsPerPage }).map((_, index) => (
                                            <tr key={index} className="animate-pulse">
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="h-4 bg-gray-200 rounded"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full"></div>
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <div className="w-8 h-8 mx-auto bg-gray-200 rounded-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.Username}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.SupplierCode}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.Name}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.Role}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">{row.Status}</td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    {row.isLoading ? (
                                                        <div className="flex justify-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-900"></div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={async () => {
                                                                const updatedData = data.map(item =>
                                                                    item.UserID === row.UserID ? { ...item, isLoading: true } : item
                                                                );
                                                                setData(updatedData);
                                                                await handleStatusChange(row.UserID, row.Status === 'Active' ? 0 : 1, row.Username);
                                                            }}
                                                            className="hover:opacity-80 transition-opacity"
                                                        >
                                                            {row.Status === 'Active' ?
                                                                <FaToggleOn className="text-3xl text-blue-900" /> :
                                                                <FaToggleOff className="text-3xl text-gray-400" />
                                                            }
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleEditPage(row.UserID)}
                                                        className="hover:opacity-80 transition-opacity"
                                                    >
                                                        <FaUserEdit className="text-2xl text-blue-900" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                                                No List User available for now
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        totalRows={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </>
    );
};

export default ManageUser;